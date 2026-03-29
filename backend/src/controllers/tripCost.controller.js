const tripCostService = require('../services/tripCost.service');
const { createTripCostSchema, updateTripCostSchema } = require('../validators/tripCost.validator');
const { asyncHandler } = require('../middlewares/errorHandler');

exports.getByTrip = asyncHandler(async (req, res) => {
  const costs = await tripCostService.getByTrip(req.params.tripId, req.userId);
  res.json({ success: true, data: costs });
});

exports.getSummary = asyncHandler(async (req, res) => {
  const summary = await tripCostService.getSummaryByTrip(req.params.tripId, req.userId);
  res.json({ success: true, data: summary });
});

exports.create = asyncHandler(async (req, res) => {
  const validated = createTripCostSchema.parse({ ...req.body, viagem_id: Number(req.params.tripId) });
  const cost = await tripCostService.create(validated, req.userId);
  res.status(201).json({ success: true, data: cost });
});

exports.update = asyncHandler(async (req, res) => {
  const validated = updateTripCostSchema.parse(req.body);
  const cost = await tripCostService.update(req.params.id, validated, req.userId);
  res.json({ success: true, data: cost });
});

exports.delete = asyncHandler(async (req, res) => {
  const result = await tripCostService.delete(req.params.id, req.userId);
  res.json({ success: true, ...result });
});
