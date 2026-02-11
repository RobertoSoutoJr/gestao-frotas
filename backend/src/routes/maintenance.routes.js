const express = require('express');
const maintenanceController = require('../controllers/maintenance.controller');

const router = express.Router();

router.get('/', maintenanceController.getAll);
router.get('/:id', maintenanceController.getById);
router.get('/truck/:truckId', maintenanceController.getByTruck);
router.get('/truck/:truckId/stats', maintenanceController.getStats);
router.post('/', maintenanceController.create);

module.exports = router;
