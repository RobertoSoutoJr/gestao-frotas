const express = require('express');
const clientController = require('../controllers/client.controller');
const { requireAdmin } = require('../middlewares/auth.middleware');

const router = express.Router();

// All client management is admin-only
router.get('/', requireAdmin, clientController.getAll);
router.get('/:id', requireAdmin, clientController.getById);
router.post('/', requireAdmin, clientController.create);
router.put('/:id', requireAdmin, clientController.update);
router.delete('/:id', requireAdmin, clientController.delete);

module.exports = router;
