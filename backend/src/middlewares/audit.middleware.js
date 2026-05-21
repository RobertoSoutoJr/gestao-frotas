const auditService = require('../services/audit.service');
const { supabase } = require('../config/database');

/**
 * Helper to get user name for audit trail.
 * Caches on req to avoid repeated queries.
 */
async function getUserNome(req) {
  if (req._auditUserNome) return req._auditUserNome;
  const uid = req.realUserId || req.userId;
  try {
    const { data } = await supabase
      .from('users')
      .select('nome')
      .eq('id', uid)
      .single();
    req._auditUserNome = data?.nome || 'Desconhecido';
  } catch {
    req._auditUserNome = 'Desconhecido';
  }
  return req._auditUserNome;
}

/**
 * Log an audit event from a controller.
 * Usage:
 *   const { logAudit } = require('../middlewares/audit.middleware');
 *   await logAudit(req, 'criar', 'abastecimento', record.id, null, record);
 */
async function logAudit(req, acao, entidadeTipo, entidadeId, dadosAntes, dadosDepois) {
  const userNome = await getUserNome(req);
  const ip = req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress || null;

  await auditService.log({
    tenantId: req.userId, // always the admin/owner
    userId: req.realUserId || req.userId,
    userNome,
    acao,
    entidadeTipo,
    entidadeId,
    dadosAntes,
    dadosDepois,
    ip,
  });
}

module.exports = { logAudit };
