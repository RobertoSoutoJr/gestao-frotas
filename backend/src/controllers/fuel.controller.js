const fuelService = require('../services/fuel.service');
const { createFuelRecordSchema } = require('../validators/fuel.validator');
const { asyncHandler } = require('../middlewares/errorHandler');

exports.getAll = asyncHandler(async (req, res) => {
  const records = await fuelService.getAll(req.userId);
  res.json({ success: true, data: records });
});

exports.getById = asyncHandler(async (req, res) => {
  const record = await fuelService.getById(req.params.id, req.userId);
  res.json({ success: true, data: record });
});

exports.getByTruck = asyncHandler(async (req, res) => {
  const records = await fuelService.getByTruck(req.params.truckId, req.userId);
  res.json({ success: true, data: records });
});

exports.create = asyncHandler(async (req, res) => {
  const validatedData = createFuelRecordSchema.parse(req.body);
  const record = await fuelService.create(validatedData, req.userId);
  res.status(201).json({ success: true, data: record });
});

exports.getConsumption = asyncHandler(async (req, res) => {
  const consumption = await fuelService.calculateConsumption(req.params.truckId, req.userId);
  res.json({ success: true, data: consumption });
});
