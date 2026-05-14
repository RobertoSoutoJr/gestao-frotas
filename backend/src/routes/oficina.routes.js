const express = require('express');
const oficinaController = require('../controllers/oficina.controller');

const router = express.Router();

router.get('/', oficinaController.getAll);
router.get('/:id', oficinaController.getById);
router.post('/', oficinaController.create);
router.put('/:id', oficinaController.update);
router.delete('/:id', oficinaController.delete);

module.exports = router;
