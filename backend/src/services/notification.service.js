const { supabase } = require('../config/database');
const { AppError } = require('../middlewares/errorHandler');

class NotificationService {
  /**
   * List notifications for a user.
   * @param {string} userId
   * @param {{ unread?: boolean, limit?: number }} options
   */
  async list(userId, { unread, limit = 50 } = {}) {
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (unread) {
      query = query.eq('lida', false);
    }

    const { data, error } = await query;
    if (error) throw new AppError('Falha ao buscar notificacoes', 500, error);
    return data;
  }

  /** Count unread notifications */
  async countUnread(userId) {
    const { count, error } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('lida', false);

    if (error) return 0;
    return count || 0;
  }

  /** Mark a single notification as read */
  async markRead(id, userId) {
    const { data, error } = await supabase
      .from('notifications')
      .update({ lida: true })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw new AppError('Notificacao nao encontrada', 404, error);
    return data;
  }

  /** Mark all notifications as read */
  async markAllRead(userId) {
    const { error } = await supabase
      .from('notifications')
      .update({ lida: true })
      .eq('user_id', userId)
      .eq('lida', false);

    if (error) throw new AppError('Falha ao marcar notificacoes', 500, error);
    return { message: 'Todas marcadas como lidas' };
  }

  /** Create a notification */
  async create({ userId, tipo, titulo, mensagem, entidadeTipo, entidadeId }) {
    // Avoid duplicates: check if same tipo+entidade exists in last 24h
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: existing } = await supabase
      .from('notifications')
      .select('id')
      .eq('user_id', userId)
      .eq('tipo', tipo)
      .eq('entidade_id', entidadeId || 0)
      .gte('created_at', since)
      .limit(1);

    if (existing && existing.length > 0) return null; // skip duplicate

    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        tipo,
        titulo,
        mensagem,
        entidade_tipo: entidadeTipo || null,
        entidade_id: entidadeId || null,
      })
      .select()
      .single();

    if (error) throw new AppError('Falha ao criar notificacao', 500, error);
    return data;
  }

  /**
   * Check and generate automatic notifications for a user.
   * Called on dashboard load or periodically.
   */
  async checkAndGenerate(userId) {
    const generated = [];

    try {
      // 1. CNH vencendo em 30 dias
      const in30days = new Date();
      in30days.setDate(in30days.getDate() + 30);
      const today = new Date().toISOString().split('T')[0];
      const future = in30days.toISOString().split('T')[0];

      const { data: drivers } = await supabase
        .from('motoristas')
        .select('id, nome, vencimento_cnh')
        .eq('user_id', userId)
        .not('vencimento_cnh', 'is', null)
        .lte('vencimento_cnh', future);

      for (const d of (drivers || [])) {
        const venc = new Date(d.vencimento_cnh);
        const dias = Math.ceil((venc - new Date()) / (1000 * 60 * 60 * 24));
        const vencida = dias < 0;

        const n = await this.create({
          userId,
          tipo: 'cnh_vencendo',
          titulo: vencida ? `CNH vencida: ${d.nome}` : `CNH vence em ${dias} dias`,
          mensagem: vencida
            ? `A CNH do motorista ${d.nome} venceu em ${d.vencimento_cnh}.`
            : `A CNH do motorista ${d.nome} vence em ${d.vencimento_cnh}. Renove com antecedencia.`,
          entidadeTipo: 'motorista',
          entidadeId: d.id,
        });
        if (n) generated.push(n);
      }

      // 2. Manutencoes pendentes ha mais de 7 dias
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: pendingMaint } = await supabase
        .from('manutencoes')
        .select('id, tipo_manutencao, caminhao_id, caminhoes:caminhao_id(placa)')
        .eq('user_id', userId)
        .eq('status', 'pendente')
        .lte('created_at', sevenDaysAgo.toISOString());

      for (const m of (pendingMaint || [])) {
        const placa = m.caminhoes?.placa || `#${m.caminhao_id}`;
        const n = await this.create({
          userId,
          tipo: 'manutencao_atrasada',
          titulo: `Manutencao pendente: ${placa}`,
          mensagem: `${m.tipo_manutencao} do veiculo ${placa} esta pendente ha mais de 7 dias.`,
          entidadeTipo: 'manutencao',
          entidadeId: m.id,
        });
        if (n) generated.push(n);
      }

      // 3. Consumo alto (ultimo abastecimento com preco/litro > media + 20%)
      const { data: recentFuel } = await supabase
        .from('abastecimentos')
        .select('id, caminhao_id, litros, valor_total, caminhoes:caminhao_id(placa)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (recentFuel && recentFuel.length >= 5) {
        const prices = recentFuel
          .filter(r => r.litros > 0)
          .map(r => r.valor_total / r.litros);
        const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
        const threshold = avg * 1.2;

        // Check last 3 records only
        for (const r of recentFuel.slice(0, 3)) {
          if (r.litros <= 0) continue;
          const price = r.valor_total / r.litros;
          if (price > threshold) {
            const placa = r.caminhoes?.placa || `#${r.caminhao_id}`;
            const n = await this.create({
              userId,
              tipo: 'consumo_alto',
              titulo: `Preco acima da media: ${placa}`,
              mensagem: `Ultimo abastecimento a R$${price.toFixed(2)}/L (media R$${avg.toFixed(2)}/L). Verifique o posto ou consumo.`,
              entidadeTipo: 'abastecimento',
              entidadeId: r.id,
            });
            if (n) generated.push(n);
          }
        }
      }
    } catch (err) {
      console.error('[NotificationService] checkAndGenerate error:', err.message);
    }

    return generated;
  }
}

module.exports = new NotificationService();
