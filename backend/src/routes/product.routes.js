const express = require('express');
const productController = require('../controllers/product.controller');
const { requireAdmin } = require('../middlewares/auth.middleware');

const router = express.Router();

// All product management is admin-only
router.get('/', requireAdmin, productController.getAll);
router.get('/:id', requireAdmin, productController.getById);
router.post('/', requireAdmin, productController.create);
router.put('/:id', requireAdmin, productController.update);
router.delete('/:id', requireAdmin, productController.delete);

module.exports = router;
