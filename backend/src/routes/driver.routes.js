const express = require('express');
const driverController = require('../controllers/driver.controller');
const { requireAdmin } = require('../middlewares/auth.middleware');
const { checkPlanLimit } = require('../middlewares/planLimits.middleware');

const router = express.Router();

// All driver management is admin-only
router.get('/', requireAdmin, driverController.getAll);
router.get('/:id', requireAdmin, driverController.getById);
router.post('/', requireAdmin, checkPlanLimit('motoristas'), driverController.create);
router.put('/:id', requireAdmin, driverController.update);
router.delete('/:id', requireAdmin, driverController.delete);

module.exports = router;
