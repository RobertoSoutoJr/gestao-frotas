const driverService = require('../services/driver.service');
const { createDriverSchema, updateDriverSchema } = require('../validators/driver.validator');
const { asyncHandler } = require('../middlewares/errorHandler');
const { logAudit } = require('../middlewares/audit.middleware');

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
  await logAudit(req, 'criar', 'motorista', driver.id, null, validatedData);
  res.status(201).json({ success: true, data: driver });
});

exports.update = asyncHandler(async (req, res) => {
  const validatedData = updateDriverSchema.parse(req.body);
  const before = await driverService.getById(req.params.id, req.userId);
  const driver = await driverService.update(req.params.id, validatedData, req.userId);
  await logAudit(req, 'editar', 'motorista', driver.id, before, validatedData);
  res.json({ success: true, data: driver });
});

exports.delete = asyncHandler(async (req, res) => {
  const before = await driverService.getById(req.params.id, req.userId);
  const result = await driverService.delete(req.params.id, req.userId);
  await logAudit(req, 'excluir', 'motorista', Number(req.params.id), before, null);
  res.json({ success: true, ...result });
});
