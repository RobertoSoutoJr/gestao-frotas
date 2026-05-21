const { supabase } = require('../config/database');

class AuditService {
  /**
   * Log an action for audit trail
   */
  async log({ tenantId, userId, userNome, acao, entidadeTipo, entidadeId, dadosAntes, dadosDepois, ip }) {
    try {
      await supabase.from('audit_logs').insert({
        tenant_id: tenantId,
        user_id: userId,
        user_nome: userNome || null,
        acao,
        entidade_tipo: entidadeTipo,
        entidade_id: entidadeId || null,
        dados_antes: dadosAntes || null,
        dados_depois: dadosDepois || null,
        ip: ip || null,
      });
    } catch (err) {
      // Audit logging should never break the main flow
      console.error('[AuditService] Failed to log:', err.message);
    }
  }

  /**
   * List audit logs with filters and pagination
   */
  async list(tenantId, { page = 1, limit = 30, userId, entidadeTipo, acao, startDate, endDate } = {}) {
    let query = supabase
      .from('audit_logs')
      .select('*', { count: 'exact' })
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });

    if (userId) query = query.eq('user_id', userId);
    if (entidadeTipo) query = query.eq('entidade_tipo', entidadeTipo);
    if (acao) query = query.eq('acao', acao);
    if (startDate) query = query.gte('created_at', startDate);
    if (endDate) query = query.lte('created_at', endDate);

    const from = (page - 1) * limit;
    query = query.range(from, from + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    return {
      data: data || [],
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    };
  }
}

module.exports = new AuditService();
