const express = require('express');
const stockController = require('../controllers/stock.controller');
const { requireAdmin } = require('../middlewares/auth.middleware');

const router = express.Router();

// All stock management is admin-only
router.get('/', requireAdmin, stockController.getAll);
router.get('/:id', requireAdmin, stockController.getById);
router.post('/', requireAdmin, stockController.create);
router.put('/:id', requireAdmin, stockController.update);
router.patch('/:id/pagar', requireAdmin, stockController.markAsPaid);
router.patch('/:id/toggle-pago', requireAdmin, stockController.togglePaid);
router.post('/:id/pagamento', requireAdmin, stockController.makePartialPayment);
router.get('/:id/pagamentos', requireAdmin, stockController.getPaymentHistory);
router.get('/:id/cheques', requireAdmin, stockController.getCheques);
router.delete('/:id', requireAdmin, stockController.delete);

module.exports = router;
