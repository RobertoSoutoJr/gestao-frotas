const productService = require('../services/product.service');
const { createProductSchema, updateProductSchema } = require('../validators/product.validator');
const { asyncHandler } = require('../middlewares/errorHandler');

exports.getAll = asyncHandler(async (req, res) => {
  const products = await productService.getAll(req.userId);
  res.json({ success: true, data: products });
});

exports.getById = asyncHandler(async (req, res) => {
  const product = await productService.getById(req.params.id, req.userId);
  res.json({ success: true, data: product });
});

exports.create = asyncHandler(async (req, res) => {
  const validatedData = createProductSchema.parse(req.body);
  const product = await productService.create(validatedData, req.userId);
  res.status(201).json({ success: true, data: product });
});

exports.update = asyncHandler(async (req, res) => {
  const validatedData = updateProductSchema.parse(req.body);
  const product = await productService.update(req.params.id, validatedData, req.userId);
  res.json({ success: true, data: product });
});

exports.delete = asyncHandler(async (req, res) => {
  const result = await productService.delete(req.params.id, req.userId);
  res.json({ success: true, ...result });
});
