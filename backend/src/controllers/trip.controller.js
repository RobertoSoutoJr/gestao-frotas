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

exports.updateLocation = asyncHandler(async (req, res) => {
  const { field, lat, lng } = req.body;
  if (!['origem', 'destino'].includes(field) || lat == null || lng == null) {
    return res.status(400).json({ success: false, message: 'field (origem|destino), lat e lng sao obrigatorios' });
  }
  const trip = await tripService.updateLocation(req.params.id, field, lat, lng, req.userId);
  res.json({ success: true, data: trip });
});

exports.batchSyncLocations = asyncHandler(async (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items)) {
    return res.status(400).json({ success: false, message: 'items deve ser um array' });
  }
  const results = [];
  for (const item of items) {
    try {
      const field = item.type === 'trip_origin' ? 'origem' : 'destino';
      await tripService.updateLocation(item.tripId, field, item.lat, item.lng, req.userId);
      results.push({ tripId: item.tripId, success: true });
    } catch {
      results.push({ tripId: item.tripId, success: false });
    }
  }
  res.json({ success: true, data: results });
});

exports.delete = asyncHandler(async (req, res) => {
  const result = await tripService.delete(req.params.id, req.userId);
  res.json({ success: true, ...result });
});
