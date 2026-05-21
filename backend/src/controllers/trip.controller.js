const tripService = require('../services/trip.service');
const { createTripSchema, updateTripSchema, finalizeTripSchema } = require('../validators/trip.validator');
const { asyncHandler } = require('../middlewares/errorHandler');
const { logAudit } = require('../middlewares/audit.middleware');

exports.getAll = asyncHandler(async (req, res) => {
  const filters = {};
  if (req.userRole === 'motorista' && req.motoristaId) {
    filters.motoristaId = req.motoristaId;
  }
  const trips = await tripService.getAll(req.userId, filters);
  res.json({ success: true, data: trips });
});

exports.getById = asyncHandler(async (req, res) => {
  const trip = await tripService.getById(req.params.id, req.userId);
  res.json({ success: true, data: trip });
});

exports.create = asyncHandler(async (req, res) => {
  const validatedData = createTripSchema.parse(req.body);
  const trip = await tripService.create(validatedData, req.userId);
  await logAudit(req, 'criar', 'viagem', trip.id, null, validatedData);
  res.status(201).json({ success: true, data: trip });
});

exports.update = asyncHandler(async (req, res) => {
  const validatedData = updateTripSchema.parse(req.body);
  const before = await tripService.getById(req.params.id, req.userId);
  const trip = await tripService.update(req.params.id, validatedData, req.userId);
  await logAudit(req, 'editar', 'viagem', trip.id, before, validatedData);
  res.json({ success: true, data: trip });
});

exports.finalize = asyncHandler(async (req, res) => {
  const validatedData = finalizeTripSchema.parse(req.body);
  const before = await tripService.getById(req.params.id, req.userId);

  // Motorista can only finalize their own trips
  if (req.userRole === 'motorista' && req.motoristaId && before.motorista_id !== req.motoristaId) {
    return res.status(403).json({ success: false, message: 'Você só pode finalizar suas próprias viagens.' });
  }

  const trip = await tripService.finalize(req.params.id, validatedData, req.userId);
  await logAudit(req, 'finalizar', 'viagem', trip.id, before, validatedData);
  res.json({ success: true, data: trip });
});

exports.updateLocation = asyncHandler(async (req, res) => {
  const { field, lat, lng } = req.body;
  if (!['origem', 'destino'].includes(field) || lat == null || lng == null) {
    return res.status(400).json({ success: false, message: 'field (origem|destino), lat e lng sao obrigatorios' });
  }

  // Motorista can only update location on their own trips
  if (req.userRole === 'motorista' && req.motoristaId) {
    const tripCheck = await tripService.getById(req.params.id, req.userId);
    if (tripCheck.motorista_id !== req.motoristaId) {
      return res.status(403).json({ success: false, message: 'Você só pode atualizar localização das suas viagens.' });
    }
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
  const before = await tripService.getById(req.params.id, req.userId);
  const result = await tripService.delete(req.params.id, req.userId);
  await logAudit(req, 'excluir', 'viagem', Number(req.params.id), before, null);
  res.json({ success: true, ...result });
});
