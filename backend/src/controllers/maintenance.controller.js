const maintenanceService = require('../services/maintenance.service');
const { createMaintenanceSchema } = require('../validators/maintenance.validator');
const { asyncHandler } = require('../middlewares/errorHandler');

exports.getAll = asyncHandler(async (req, res) => {
  const records = await maintenanceService.getAll(req.userId);
  res.json({ success: true, data: records });
});

exports.getById = asyncHandler(async (req, res) => {
  const record = await maintenanceService.getById(req.params.id, req.userId);
  res.json({ success: true, data: record });
});

exports.getByTruck = asyncHandler(async (req, res) => {
  const records = await maintenanceService.getByTruck(req.params.truckId, req.userId);
  res.json({ success: true, data: records });
});

exports.create = asyncHandler(async (req, res) => {
  const validatedData = createMaintenanceSchema.parse(req.body);
  const record = await maintenanceService.create(validatedData, req.userId);
  res.status(201).json({ success: true, data: record });
});

exports.getStats = asyncHandler(async (req, res) => {
  const stats = await maintenanceService.getStatsByTruck(req.params.truckId, req.userId);
  res.json({ success: true, data: stats });
});
