const postoService = require('../services/posto.service');
const { createPostoSchema } = require('../validators/posto.validator');
const { asyncHandler } = require('../middlewares/errorHandler');

exports.getAll = asyncHandler(async (req, res) => {
  const records = await postoService.getAll(req.userId);
  res.json({ success: true, data: records });
});

exports.getById = asyncHandler(async (req, res) => {
  const record = await postoService.getById(req.params.id, req.userId);
  res.json({ success: true, data: record });
});

exports.create = asyncHandler(async (req, res) => {
  const validatedData = createPostoSchema.parse(req.body);
  const record = await postoService.create(validatedData, req.userId);
  res.status(201).json({ success: true, data: record });
});

exports.update = asyncHandler(async (req, res) => {
  const validatedData = createPostoSchema.partial().parse(req.body);
  const record = await postoService.update(req.params.id, validatedData, req.userId);
  res.json({ success: true, data: record });
});

exports.delete = asyncHandler(async (req, res) => {
  await postoService.delete(req.params.id, req.userId);
  res.json({ success: true, message: 'Posto excluido com sucesso' });
});
