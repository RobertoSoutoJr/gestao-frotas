const express = require('express');
const fuelController = require('../controllers/fuel.controller');

const router = express.Router();

router.get('/', fuelController.getAll);
router.get('/:id', fuelController.getById);
router.get('/truck/:truckId', fuelController.getByTruck);
router.get('/truck/:truckId/consumption', fuelController.getConsumption);
router.post('/', fuelController.create);

module.exports = router;
