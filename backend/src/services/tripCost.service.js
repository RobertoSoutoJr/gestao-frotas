const { supabase } = require('../config/database');
const { AppError } = require('../middlewares/errorHandler');

class TripCostService {
  async getByTrip(viagemId, userId) {
    const { data, error } = await supabase
      .from('viagem_custos')
      .select('*')
      .eq('viagem_id', viagemId)
      .eq('user_id', userId)
      .order('data', { ascending: false });

    if (error) throw new AppError('Falha ao buscar custos da viagem', 500, error);
    return data;
  }

  async create(costData, userId) {
    const { data, error } = await supabase
      .from('viagem_custos')
      .insert([{ ...costData, user_id: userId }])
      .select('*')
      .single();

    if (error) throw new AppError('Falha ao criar custo', 500, error);

    // Update denormalized totals on viagens
    await this._syncTotals(costData.viagem_id, userId);

    return data;
  }

  async update(id, costData, userId) {
    const existing = await this._getOne(id, userId);

    const { data, error } = await supabase
      .from('viagem_custos')
      .update(costData)
      .eq('id', id)
      .eq('user_id', userId)
      .select('*')
      .single();

    if (error) throw new AppError('Falha ao atualizar custo', 500, error);

    await this._syncTotals(existing.viagem_id, userId);
    return data;
  }

  async delete(id, userId) {
    const existing = await this._getOne(id, userId);

    const { error } = await supabase
      .from('viagem_custos')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw new AppError('Falha ao deletar custo', 500, error);

    await this._syncTotals(existing.viagem_id, userId);
    return { message: 'Custo removido' };
  }

  async getSummaryByTrip(viagemId, userId) {
    const { data, error } = await supabase
      .from('viagem_custos')
      .select('tipo, valor')
      .eq('viagem_id', viagemId)
      .eq('user_id', userId);

    if (error) throw new AppError('Falha ao buscar resumo', 500, error);

    const summary = {};
    let total = 0;
    for (const row of data) {
      summary[row.tipo] = (summary[row.tipo] || 0) + Number(row.valor);
      total += Number(row.valor);
    }
    return { by_type: summary, total, count: data.length };
  }

  // ---- private ----

  async _getOne(id, userId) {
    const { data, error } = await supabase
      .from('viagem_custos')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) throw new AppError('Custo não encontrado', 404, error);
    return data;
  }

  async _syncTotals(viagemId, userId) {
    const { data, error } = await supabase
      .from('viagem_custos')
      .select('tipo, valor')
      .eq('viagem_id', viagemId)
      .eq('user_id', userId);

    if (error) return;

    const totals = { combustivel: 0, pedagio: 0, manutencao: 0 };
    let outros = 0;

    for (const row of data) {
      const v = Number(row.valor);
      if (row.tipo in totals) {
        totals[row.tipo] += v;
      } else {
        outros += v;
      }
    }

    await supabase
      .from('viagens')
      .update({
        custo_combustivel: totals.combustivel,
        custo_pedagio: totals.pedagio,
        custo_manutencao: totals.manutencao,
        custo_outros: outros,
        updated_at: new Date().toISOString()
      })
      .eq('id', viagemId)
      .eq('user_id', userId);
  }
}

module.exports = new TripCostService();
