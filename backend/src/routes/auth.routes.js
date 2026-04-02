const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { protect, requireAdmin } = require('../middlewares/auth.middleware');
const { checkMotoristaAccountLimit } = require('../middlewares/planLimits.middleware');

// Rotas públicas
router.post('/register', authController.register);
router.post('/verify-email', authController.verifyEmail);
router.post('/resend-code', authController.resendCode);
router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout);

// Rotas protegidas
router.get('/profile', protect, authController.getProfile);
router.put('/profile', protect, authController.updateProfile);
router.post('/change-password', protect, authController.changePassword);

// Plan info
router.get('/plan', protect, authController.getPlanInfo);
router.get('/plans', authController.getPlans);

// RBAC: Motorista account management (admin only)
router.post('/motoristas', protect, requireAdmin, checkMotoristaAccountLimit(), authController.createMotoristaAccount);
router.get('/motoristas', protect, requireAdmin, authController.getMotoristaAccounts);
router.patch('/motoristas/:id', protect, requireAdmin, authController.toggleMotoristaAccount);

module.exports = router;
