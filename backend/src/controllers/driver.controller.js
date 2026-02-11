const driverService = require('../services/driver.service');
const { createDriverSchema, updateDriverSchema } = require('../validators/driver.validator');
const { asyncHandler } = require('../middlewares/errorHandler');

exports.getAll = asyncHandler(async (req, res) => {
  const drivers = await driverService.getAll(req.userId);
  res.json({ success: true, data: drivers });
});

exports.getById = asyncHandler(async (req, res) => {
  const driver = await driverService.getById(req.params.id, req.userId);
  res.json({ success: true, data: driver });
});

exports.create = asyncHandler(async (req, res) => {
  const validatedData = createDriverSchema.parse(req.body);
  const driver = await driverService.create(validatedData, req.userId);
  res.status(201).json({ success: true, data: driver });
});

exports.update = asyncHandler(async (req, res) => {
  const validatedData = updateDriverSchema.parse(req.body);
  const driver = await driverService.update(req.params.id, validatedData, req.userId);
  res.json({ success: true, data: driver });
});

exports.delete = asyncHandler(async (req, res) => {
  const result = await driverService.delete(req.params.id, req.userId);
  res.json({ success: true, ...result });
});
