const express = require('express');
const postoController = require('../controllers/posto.controller');

const router = express.Router();

router.get('/', postoController.getAll);
router.get('/:id', postoController.getById);
router.post('/', postoController.create);
router.put('/:id', postoController.update);
router.delete('/:id', postoController.delete);

module.exports = router;
