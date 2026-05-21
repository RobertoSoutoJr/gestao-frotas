const express = require('express');
const maintenanceController = require('../controllers/maintenance.controller');
const { requireAdmin } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', maintenanceController.getAll);           // motorista: filtered to their truck
router.get('/:id', maintenanceController.getById);
router.get('/truck/:truckId', maintenanceController.getByTruck);
router.get('/truck/:truckId/stats', maintenanceController.getStats);
router.post('/', maintenanceController.create);           // motorista: validated to their truck
router.put('/:id', requireAdmin, maintenanceController.update);
router.delete('/:id', requireAdmin, maintenanceController.delete);

module.exports = router;
