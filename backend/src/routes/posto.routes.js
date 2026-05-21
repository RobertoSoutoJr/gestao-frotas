const express = require('express');
const postoController = require('../controllers/posto.controller');
const { requireAdmin } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', postoController.getAll);                  // motorista: read-only for selection
router.get('/:id', postoController.getById);
router.post('/', requireAdmin, postoController.create);
router.put('/:id', requireAdmin, postoController.update);
router.delete('/:id', requireAdmin, postoController.delete);

module.exports = router;
