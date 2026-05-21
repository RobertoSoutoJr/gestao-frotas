const maintenanceService = require('../services/maintenance.service');
const { createMaintenanceSchema } = require('../validators/maintenance.validator');
const { asyncHandler } = require('../middlewares/errorHandler');
const { logAudit } = require('../middlewares/audit.middleware');

exports.getAll = asyncHandler(async (req, res) => {
  const filters = {};
  if (req.userRole === 'motorista' && req.motoristaCaminhaoId) {
    filters.caminhaoId = req.motoristaCaminhaoId;
  }
  const records = await maintenanceService.getAll(req.userId, filters);
  res.json({ success: true, data: records });
});

exports.getById = asyncHandler(async (req, res) => {
  const record = await maintenanceService.getById(req.params.id, req.userId);
  res.json({ success: true, data: record });
});

exports.getByTruck = asyncHandler(async (req, res) => {
  const records = await maintenanceService.getByTruck(req.params.truckId, req.userId);
  res.json({ success: true, data: records });
});

exports.create = asyncHandler(async (req, res) => {
  const validatedData = createMaintenanceSchema.parse(req.body);

  // Motorista can only create maintenance for their assigned truck
  if (req.userRole === 'motorista' && req.motoristaCaminhaoId) {
    if (validatedData.caminhao_id !== req.motoristaCaminhaoId) {
      return res.status(403).json({ success: false, message: 'Você só pode registrar manutenções para o seu caminhão.' });
    }
  }

  const record = await maintenanceService.create(validatedData, req.userId);
  await logAudit(req, 'criar', 'manutencao', record.id, null, validatedData);
  res.status(201).json({ success: true, data: record });
});

exports.update = asyncHandler(async (req, res) => {
  const validatedData = createMaintenanceSchema.partial().parse(req.body);
  const before = await maintenanceService.getById(req.params.id, req.userId);
  const record = await maintenanceService.update(req.params.id, validatedData, req.userId);
  await logAudit(req, 'editar', 'manutencao', record.id, before, validatedData);
  res.json({ success: true, data: record });
});

exports.delete = asyncHandler(async (req, res) => {
  const before = await maintenanceService.getById(req.params.id, req.userId);
  await maintenanceService.delete(req.params.id, req.userId);
  await logAudit(req, 'excluir', 'manutencao', Number(req.params.id), before, null);
  res.json({ success: true, message: 'Registro excluído com sucesso' });
});

exports.getStats = asyncHandler(async (req, res) => {
  const stats = await maintenanceService.getStatsByTruck(req.params.truckId, req.userId);
  res.json({ success: true, data: stats });
});
