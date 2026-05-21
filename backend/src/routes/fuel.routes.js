const express = require('express');
const fuelController = require('../controllers/fuel.controller');
const { requireAdmin } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', fuelController.getAll);
router.get('/truck/:truckId/consumption', fuelController.getConsumption);
router.get('/truck/:truckId', fuelController.getByTruck);
router.get('/:id', fuelController.getById);
router.post('/', fuelController.create);
router.put('/:id', requireAdmin, fuelController.update);
router.delete('/:id', requireAdmin, fuelController.delete);

module.exports = router;
