const supplierService = require('../services/supplier.service');
const { createSupplierSchema, updateSupplierSchema } = require('../validators/supplier.validator');
const { asyncHandler } = require('../middlewares/errorHandler');

exports.getAll = asyncHandler(async (req, res) => {
  const suppliers = await supplierService.getAll(req.userId);
  res.json({ success: true, data: suppliers });
});

exports.getById = asyncHandler(async (req, res) => {
  const supplier = await supplierService.getById(req.params.id, req.userId);
  res.json({ success: true, data: supplier });
});

exports.create = asyncHandler(async (req, res) => {
  const validatedData = createSupplierSchema.parse(req.body);
  const supplier = await supplierService.create(validatedData, req.userId);
  res.status(201).json({ success: true, data: supplier });
});

exports.update = asyncHandler(async (req, res) => {
  const validatedData = updateSupplierSchema.parse(req.body);
  const supplier = await supplierService.update(req.params.id, validatedData, req.userId);
  res.json({ success: true, data: supplier });
});

exports.delete = asyncHandler(async (req, res) => {
  const result = await supplierService.delete(req.params.id, req.userId);
  res.json({ success: true, ...result });
});
