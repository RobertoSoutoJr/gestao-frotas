const { supabase } = require('../config/database');
const { AppError } = require('../middlewares/errorHandler');

class DriverService {
  async getAll(userId) {
    const { data, error } = await supabase
      .from('motoristas')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('nome', { ascending: true });

    if (error) throw new AppError('Falha ao buscar motoristas', 500, error);

    // Load truck links for all drivers in one query
    if (data && data.length > 0) {
      const driverIds = data.map(d => d.id);
      const { data: links } = await supabase
        .from('motorista_caminhao')
        .select('motorista_id, caminhao_id, caminhoes:caminhao_id(id, placa, modelo)')
        .in('motorista_id', driverIds);

      const linkMap = {};
      (links || []).forEach(l => {
        if (!linkMap[l.motorista_id]) linkMap[l.motorista_id] = [];
        linkMap[l.motorista_id].push(l.caminhoes);
      });

      data.forEach(d => {
        d.caminhoes_vinculados = linkMap[d.id] || [];
      });
    }

    return data;
  }

  async getById(id, userId) {
    const { data, error } = await supabase
      .from('motoristas')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .single();

    if (error) throw new AppError('Motorista não encontrado', 404, error);

    // Load linked trucks
    const { data: links } = await supabase
      .from('motorista_caminhao')
      .select('caminhao_id, caminhoes:caminhao_id(id, placa, modelo)')
      .eq('motorista_id', id);

    data.caminhoes_vinculados = (links || []).map(l => l.caminhoes);

    return data;
  }

  async create(driverData, userId) {
    const { caminhao_ids, ...rest } = driverData;

    // Check if CPF already exists for this user
    if (rest.cpf) {
      const { data: existing } = await supabase
        .from('motoristas')
        .select('cpf')
        .eq('cpf', rest.cpf)
        .eq('user_id', userId)
        .is('deleted_at', null)
        .single();

      if (existing) {
        throw new AppError('CPF já cadastrado', 409);
      }
    }

    const { data, error } = await supabase
      .from('motoristas')
      .insert([{ ...rest, user_id: userId }])
      .select()
      .single();

    if (error) throw new AppError('Falha ao criar motorista', 500, error);

    // Create truck links
    if (caminhao_ids && caminhao_ids.length > 0) {
      await this._syncTruckLinks(data.id, caminhao_ids, userId);
    }

    data.caminhoes_vinculados = [];
    return data;
  }

  async update(id, driverData, userId) {
    const { caminhao_ids, ...rest } = driverData;

    // Remove fields that shouldn't go to the motoristas table
    delete rest.caminhoes_vinculados;
    delete rest.caminhoes;

    const { data, error } = await supabase
      .from('motoristas')
      .update(rest)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw new AppError('Falha ao atualizar motorista', 500, error);

    // Sync truck links if provided
    if (caminhao_ids !== undefined) {
      await this._syncTruckLinks(id, caminhao_ids || [], userId);
    }

    return data;
  }

  async delete(id, userId) {
    // Remove truck links first
    await supabase
      .from('motorista_caminhao')
      .delete()
      .eq('motorista_id', id);

    const { error } = await supabase
      .from('motoristas')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId)
      .is('deleted_at', null);

    if (error) throw new AppError('Falha ao deletar motorista', 500, error);
    return { message: 'Motorista deletado com sucesso' };
  }

  // --- Truck link management ---

  async getTruckLinks(motoristaId) {
    const { data } = await supabase
      .from('motorista_caminhao')
      .select('caminhao_id')
      .eq('motorista_id', motoristaId);
    return (data || []).map(l => l.caminhao_id);
  }

  async _syncTruckLinks(motoristaId, caminhaoIds, userId) {
    // Delete all existing links
    await supabase
      .from('motorista_caminhao')
      .delete()
      .eq('motorista_id', motoristaId);

    // Insert new links
    if (caminhaoIds.length > 0) {
      const rows = caminhaoIds.map(cid => ({
        motorista_id: motoristaId,
        caminhao_id: cid,
        user_id: userId,
      }));
      await supabase.from('motorista_caminhao').insert(rows);
    }
  }
}

module.exports = new DriverService();
