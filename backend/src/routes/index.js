const express = require('express');
const authRoutes = require('./auth.routes');
const truckRoutes = require('./truck.routes');
const driverRoutes = require('./driver.routes');
const fuelRoutes = require('./fuel.routes');
const maintenanceRoutes = require('./maintenance.routes');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth routes (públicas)
router.use('/auth', authRoutes);

// API routes (protegidas)
router.use('/caminhoes', protect, truckRoutes);
router.use('/motoristas', protect, driverRoutes);
router.use('/abastecimentos', protect, fuelRoutes);
router.use('/manutencoes', protect, maintenanceRoutes);

module.exports = router;
