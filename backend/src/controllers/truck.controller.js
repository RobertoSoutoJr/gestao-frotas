const truckService = require('../services/truck.service');
const { createTruckSchema, updateTruckSchema } = require('../validators/truck.validator');
const { asyncHandler } = require('../middlewares/errorHandler');

exports.getAll = asyncHandler(async (req, res) => {
  const trucks = await truckService.getAll(req.userId);
  res.json({ success: true, data: trucks });
});

exports.getById = asyncHandler(async (req, res) => {
  const truck = await truckService.getById(req.params.id, req.userId);
  res.json({ success: true, data: truck });
});

exports.create = asyncHandler(async (req, res) => {
  const validatedData = createTruckSchema.parse(req.body);
  const truck = await truckService.create(validatedData, req.userId);
  res.status(201).json({ success: true, data: truck });
});

exports.update = asyncHandler(async (req, res) => {
  const validatedData = updateTruckSchema.parse(req.body);
  const truck = await truckService.update(req.params.id, validatedData, req.userId);
  res.json({ success: true, data: truck });
});

exports.delete = asyncHandler(async (req, res) => {
  const result = await truckService.delete(req.params.id, req.userId);
  res.json({ success: true, ...result });
});
