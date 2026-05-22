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
const oficinaRoutes = require('./oficina.routes');
const postoRoutes = require('./posto.routes');
const auditRoutes = require('./audit.routes');
const notificationRoutes = require('./notification.routes');
const dashboardController = require('../controllers/dashboard.controller');
const { protect, requireAdmin } = require('../middlewares/auth.middleware');

const router = express.Router();

// Health check — detailed with DB ping and system metrics
const startTime = Date.now();
router.get('/health', async (req, res) => {
  const uptime = Math.floor((Date.now() - startTime) / 1000);
  const mem = process.memoryUsage();

  // Test Supabase connection
  let dbStatus = 'ok';
  let dbLatency = 0;
  try {
    const t0 = Date.now();
    const { error } = await require('../config/database').supabase
      .from('users')
      .select('id')
      .limit(1);
    dbLatency = Date.now() - t0;
    if (error) dbStatus = 'error';
  } catch {
    dbStatus = 'unreachable';
  }

  const status = dbStatus === 'ok' ? 'ok' : 'degraded';
  res.status(status === 'ok' ? 200 : 503).json({
    status,
    timestamp: new Date().toISOString(),
    uptime_seconds: uptime,
    version: process.env.npm_package_version || '1.0.0',
    database: { status: dbStatus, latency_ms: dbLatency },
    memory: {
      rss_mb: Math.round(mem.rss / 1024 / 1024),
      heap_used_mb: Math.round(mem.heapUsed / 1024 / 1024),
      heap_total_mb: Math.round(mem.heapTotal / 1024 / 1024),
    },
    node: process.version,
  });
});

// Auth routes (públicas)
router.use('/auth', authRoutes);

// Dashboard (consolidated — single request)
router.get('/dashboard', protect, dashboardController.getDashboard);

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
router.use('/oficinas', protect, oficinaRoutes);
router.use('/postos', protect, postoRoutes);
router.use('/audit-logs', protect, requireAdmin, auditRoutes);
router.use('/notifications', protect, notificationRoutes);

module.exports = router;
