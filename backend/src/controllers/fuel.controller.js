const fuelService = require('../services/fuel.service');
const documentService = require('../services/document.service');
const { createFuelRecordSchema } = require('../validators/fuel.validator');
const { asyncHandler } = require('../middlewares/errorHandler');
const { logAudit } = require('../middlewares/audit.middleware');

exports.getAll = asyncHandler(async (req, res) => {
  const records = await fuelService.getAll(req.userId);
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
  const record = await fuelService.create(validatedData, req.userId);

  // Link NFC-e document to this fuel record if provided
  if (documento_id) {
    try {
      await documentService.linkToEntity(documento_id, record.id, req.userId);
    } catch (err) {
      // Non-critical — don't fail the whole request
      console.error('[FuelController] Failed to link document:', err.message);
    }
  }

  await logAudit(req, 'criar', 'abastecimento', record.id, null, validatedData);
  res.status(201).json({ success: true, data: record });
});

exports.getConsumption = asyncHandler(async (req, res) => {
  const consumption = await fuelService.calculateConsumption(req.params.truckId, req.userId);
  res.json({ success: true, data: consumption });
});
