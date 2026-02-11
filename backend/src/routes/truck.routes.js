const express = require('express');
const truckController = require('../controllers/truck.controller');

const router = express.Router();

router.get('/', truckController.getAll);
router.get('/:id', truckController.getById);
router.post('/', truckController.create);
router.put('/:id', truckController.update);
router.delete('/:id', truckController.delete);

module.exports = router;
