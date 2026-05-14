const oficinaService = require('../services/oficina.service');
const { createOficinaSchema } = require('../validators/oficina.validator');
const { asyncHandler } = require('../middlewares/errorHandler');

exports.getAll = asyncHandler(async (req, res) => {
  const records = await oficinaService.getAll(req.userId);
  res.json({ success: true, data: records });
});

exports.getById = asyncHandler(async (req, res) => {
  const record = await oficinaService.getById(req.params.id, req.userId);
  res.json({ success: true, data: record });
});

exports.create = asyncHandler(async (req, res) => {
  const validatedData = createOficinaSchema.parse(req.body);
  const record = await oficinaService.create(validatedData, req.userId);
  res.status(201).json({ success: true, data: record });
});

exports.update = asyncHandler(async (req, res) => {
  const validatedData = createOficinaSchema.partial().parse(req.body);
  const record = await oficinaService.update(req.params.id, validatedData, req.userId);
  res.json({ success: true, data: record });
});

exports.delete = asyncHandler(async (req, res) => {
  await oficinaService.delete(req.params.id, req.userId);
  res.json({ success: true, message: 'Oficina excluida com sucesso' });
});
