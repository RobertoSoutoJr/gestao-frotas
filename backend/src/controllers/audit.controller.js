const auditService = require('../services/audit.service');
const { asyncHandler } = require('../middlewares/errorHandler');

exports.getAuditLogs = asyncHandler(async (req, res) => {
  const { page, limit, user_id, entidade_tipo, acao, start_date, end_date } = req.query;

  // tenantId = req.userId (the owner/admin)
  const result = await auditService.list(req.userId, {
    page: page ? Number(page) : 1,
    limit: limit ? Number(limit) : 30,
    userId: user_id || undefined,
    entidadeTipo: entidade_tipo || undefined,
    acao: acao || undefined,
    startDate: start_date || undefined,
    endDate: end_date || undefined,
  });

  res.json({ success: true, ...result });
});
