const express = require('express');
const oficinaController = require('../controllers/oficina.controller');
const { requireAdmin } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', oficinaController.getAll);                  // motorista: read-only for selection
router.get('/:id', oficinaController.getById);
router.post('/', requireAdmin, oficinaController.create);
router.put('/:id', requireAdmin, oficinaController.update);
router.delete('/:id', requireAdmin, oficinaController.delete);

module.exports = router;
