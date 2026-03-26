const tripService = require('../services/trip.service');
const { createTripSchema, updateTripSchema, finalizeTripSchema } = require('../validators/trip.validator');
const { asyncHandler } = require('../middlewares/errorHandler');

exports.getAll = asyncHandler(async (req, res) => {
  const trips = await tripService.getAll(req.userId);
  res.json({ success: true, data: trips });
});

exports.getById = asyncHandler(async (req, res) => {
  const trip = await tripService.getById(req.params.id, req.userId);
  res.json({ success: true, data: trip });
});

exports.create = asyncHandler(async (req, res) => {
  const validatedData = createTripSchema.parse(req.body);
  const trip = await tripService.create(validatedData, req.userId);
  res.status(201).json({ success: true, data: trip });
});

exports.update = asyncHandler(async (req, res) => {
  const validatedData = updateTripSchema.parse(req.body);
  const trip = await tripService.update(req.params.id, validatedData, req.userId);
  res.json({ success: true, data: trip });
});

exports.finalize = asyncHandler(async (req, res) => {
  const validatedData = finalizeTripSchema.parse(req.body);
  const trip = await tripService.finalize(req.params.id, validatedData, req.userId);
  res.json({ success: true, data: trip });
});

exports.delete = asyncHandler(async (req, res) => {
  const result = await tripService.delete(req.params.id, req.userId);
  res.json({ success: true, ...result });
});
