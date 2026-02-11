const express = require('express');
const truckRoutes = require('./truck.routes');
const driverRoutes = require('./driver.routes');
const fuelRoutes = require('./fuel.routes');
const maintenanceRoutes = require('./maintenance.routes');

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
router.use('/caminhoes', truckRoutes);
router.use('/motoristas', driverRoutes);
router.use('/abastecimentos', fuelRoutes);
router.use('/manutencoes', maintenanceRoutes);

module.exports = router;
