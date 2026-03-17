const clientService = require('../services/client.service');
const { createClientSchema, updateClientSchema } = require('../validators/client.validator');
const { asyncHandler } = require('../middlewares/errorHandler');

exports.getAll = asyncHandler(async (req, res) => {
  const clients = await clientService.getAll(req.userId);
  res.json({ success: true, data: clients });
});

exports.getById = asyncHandler(async (req, res) => {
  const client = await clientService.getById(req.params.id, req.userId);
  res.json({ success: true, data: client });
});

exports.create = asyncHandler(async (req, res) => {
  const validatedData = createClientSchema.parse(req.body);
  const client = await clientService.create(validatedData, req.userId);
  res.status(201).json({ success: true, data: client });
});

exports.update = asyncHandler(async (req, res) => {
  const validatedData = updateClientSchema.parse(req.body);
  const client = await clientService.update(req.params.id, validatedData, req.userId);
  res.json({ success: true, data: client });
});

exports.delete = asyncHandler(async (req, res) => {
  const result = await clientService.delete(req.params.id, req.userId);
  res.json({ success: true, ...result });
});
