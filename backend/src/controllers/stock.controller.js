const stockService = require('../services/stock.service');
const { createStockSchema, updateStockSchema, partialPaymentSchema } = require('../validators/stock.validator');
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

exports.togglePaid = asyncHandler(async (req, res) => {
  const { pago } = req.body;
  const item = await stockService.togglePaid(req.params.id, pago, req.userId);
  res.json({ success: true, data: item });
});

exports.markAsPaid = asyncHandler(async (req, res) => {
  const item = await stockService.markAsPaid(req.params.id, req.userId);
  res.json({ success: true, data: item });
});

exports.makePartialPayment = asyncHandler(async (req, res) => {
  const validatedData = partialPaymentSchema.parse(req.body);
  const item = await stockService.makePartialPayment(req.params.id, validatedData, req.userId);
  res.json({ success: true, data: item });
});

exports.getPaymentHistory = asyncHandler(async (req, res) => {
  const payments = await stockService.getPaymentHistory(req.params.id, req.userId);
  res.json({ success: true, data: payments });
});

exports.getCheques = asyncHandler(async (req, res) => {
  const cheques = await stockService.getCheques(req.params.id, req.userId);
  res.json({ success: true, data: cheques });
});

exports.delete = asyncHandler(async (req, res) => {
  const result = await stockService.delete(req.params.id, req.userId);
  res.json({ success: true, ...result });
});
