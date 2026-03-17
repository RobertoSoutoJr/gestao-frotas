const stockService = require('../services/stock.service');
const { createStockSchema, updateStockSchema } = require('../validators/stock.validator');
const { asyncHandler } = require('../middlewares/errorHandler');

exports.getAll = asyncHandler(async (req, res) => {
  const stock = await stockService.getAll(req.userId);
  res.json({ success: true, data: stock });
});

exports.getById = asyncHandler(async (req, res) => {
  const item = await stockService.getById(req.params.id, req.userId);
  res.json({ success: true, data: item });
});

exports.create = asyncHandler(async (req, res) => {
  const validatedData = createStockSchema.parse(req.body);
  const item = await stockService.create(validatedData, req.userId);
  res.status(201).json({ success: true, data: item });
});

exports.update = asyncHandler(async (req, res) => {
  const validatedData = updateStockSchema.parse(req.body);
  const item = await stockService.update(req.params.id, validatedData, req.userId);
  res.json({ success: true, data: item });
});

exports.markAsPaid = asyncHandler(async (req, res) => {
  const item = await stockService.markAsPaid(req.params.id, req.userId);
  res.json({ success: true, data: item });
});

exports.delete = asyncHandler(async (req, res) => {
  const result = await stockService.delete(req.params.id, req.userId);
  res.json({ success: true, ...result });
});
