const express = require('express');
const stockController = require('../controllers/stock.controller');

const router = express.Router();

router.get('/', stockController.getAll);
router.get('/:id', stockController.getById);
router.post('/', stockController.create);
router.put('/:id', stockController.update);
router.patch('/:id/pagar', stockController.markAsPaid);
router.delete('/:id', stockController.delete);

module.exports = router;
