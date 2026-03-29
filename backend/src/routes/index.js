const express = require('express');
const authRoutes = require('./auth.routes');
const truckRoutes = require('./truck.routes');
const driverRoutes = require('./driver.routes');
const fuelRoutes = require('./fuel.routes');
const maintenanceRoutes = require('./maintenance.routes');
const clientRoutes = require('./client.routes');
const supplierRoutes = require('./supplier.routes');
const productRoutes = require('./product.routes');
const tripRoutes = require('./trip.routes');
const tripCostRoutes = require('./tripCost.routes');
const stockRoutes = require('./stock.routes');
const documentRoutes = require('./document.routes');
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
router.use('/clientes', protect, clientRoutes);
router.use('/fornecedores', protect, supplierRoutes);
router.use('/produtos', protect, productRoutes);
router.use('/viagens', protect, tripRoutes);
router.use('/viagens', protect, tripCostRoutes);
router.use('/estoque', protect, stockRoutes);
router.use('/documentos', protect, documentRoutes);

module.exports = router;
