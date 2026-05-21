const express = require('express');
const supplierController = require('../controllers/supplier.controller');
const { requireAdmin } = require('../middlewares/auth.middleware');

const router = express.Router();

// All supplier management is admin-only
router.get('/', requireAdmin, supplierController.getAll);
router.get('/:id', requireAdmin, supplierController.getById);
router.post('/', requireAdmin, supplierController.create);
router.put('/:id', requireAdmin, supplierController.update);
router.delete('/:id', requireAdmin, supplierController.delete);

module.exports = router;
