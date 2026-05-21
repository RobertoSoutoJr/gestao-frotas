const fuelService = require('../services/fuel.service');
const documentService = require('../services/document.service');
const { createFuelRecordSchema } = require('../validators/fuel.validator');
const { asyncHandler } = require('../middlewares/errorHandler');
const { logAudit } = require('../middlewares/audit.middleware');

exports.getAll = asyncHandler(async (req, res) => {
  const filters = {};
  if (req.userRole === 'motorista' && req.motoristaCaminhaoId) {
    filters.caminhaoId = req.motoristaCaminhaoId;
  }
  const records = await fuelService.getAll(req.userId, filters);
  res.json({ success: true, data: records });
});

exports.getById = asyncHandler(async (req, res) => {
  const record = await fuelService.getById(req.params.id, req.userId);
  res.json({ success: true, data: record });
});

exports.getByTruck = asyncHandler(async (req, res) => {
  const records = await fuelService.getByTruck(req.params.truckId, req.userId);
  res.json({ success: true, data: records });
});

exports.create = asyncHandler(async (req, res) => {
  const { documento_id, ...body } = req.body;
  const validatedData = createFuelRecordSchema.parse(body);

  // Motorista can only create fuel records for their assigned truck
  if (req.userRole === 'motorista' && req.motoristaCaminhaoId) {
    if (validatedData.caminhao_id !== req.motoristaCaminhaoId) {
      return res.status(403).json({ success: false, message: 'Você só pode registrar abastecimentos para o seu caminhão.' });
    }
  }

  const record = await fuelService.create(validatedData, req.userId);

  // Link NFC-e document if provided
  if (documento_id) {
    try { await documentService.linkToEntity(documento_id, record.id, req.userId); }
    catch (err) { console.error('[FuelController] Failed to link document:', err.message); }
  }

  await logAudit(req, 'criar', 'abastecimento', record.id, null, validatedData);
  res.status(201).json({ success: true, data: record });
});

exports.update = asyncHandler(async (req, res) => {
  const before = await fuelService.getById(req.params.id, req.userId);
  const validatedData = createFuelRecordSchema.partial().parse(req.body);
  const record = await fuelService.update(req.params.id, validatedData, req.userId);
  await logAudit(req, 'editar', 'abastecimento', record.id, before, validatedData);
  res.json({ success: true, data: record });
});

exports.delete = asyncHandler(async (req, res) => {
  const before = await fuelService.getById(req.params.id, req.userId);
  await fuelService.delete(req.params.id, req.userId);
  await logAudit(req, 'excluir', 'abastecimento', Number(req.params.id), before, null);
  res.json({ success: true, data: null });
});

exports.getConsumption = asyncHandler(async (req, res) => {
  const consumption = await fuelService.calculateConsumption(req.params.truckId, req.userId);
  res.json({ success: true, data: consumption });
});
