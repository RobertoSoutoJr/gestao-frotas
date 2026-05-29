const { supabase } = require('../config/database');
const { AppError } = require('../middlewares/errorHandler');
const truckService = require('./truck.service');
const { parsePagination, paginate } = require('../lib/pagination');

class MaintenanceService {
  async getAll(userId, filters = {}, queryParams = {}) {
    const { page, limit } = parsePagination(queryParams);

    let query = supabase
      .from('manutencoes')
      .select(`
        *,
        caminhoes:caminhao_id(placa, modelo),
        oficinas:oficina_id(id, nome)
      `, { count: 'exact' })
      .eq('user_id', userId)
      .is('deleted_at', null);

    if (filters.caminhaoId) {
      query = query.eq('caminhao_id', filters.caminhaoId);
    }

    if (queryParams.status) {
      query = query.eq('status', queryParams.status);
    }

    query = query.order('data_manutencao', { ascending: false });

    try {
      return await paginate(query, page, limit);
    } catch (error) {
      throw new AppError('Falha ao buscar registros de manutencao', 500, error);
    }
  }

  async getById(id, userId) {
    const { data, error } = await supabase
      .from('manutencoes')
      .select(`
        *,
        caminhoes:caminhao_id(placa, modelo),
        oficinas:oficina_id(id, nome)
      `)
      .eq('id', id)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .single();

    if (error) throw new AppError('Registro de manutenção não encontrado', 404, error);
    return data;
  }

  async getByTruck(truckId, userId) {
    const { data, error } = await supabase
      .from('manutencoes')
      .select('*')
      .eq('caminhao_id', truckId)
      .eq('user_id', userId)
      .order('data_manutencao', { ascending: false });

    if (error) throw new AppError('Falha ao buscar registros de manutenção do caminhão', 500, error);
    return data;
  }

  async create(maintenanceData, userId) {
    // Verify truck exists and validate KM before inserting
    const truck = await truckService.getById(maintenanceData.caminhao_id, userId);

    if (maintenanceData.km_manutencao && maintenanceData.km_manutencao > 0) {
      if (truck.km_atual && maintenanceData.km_manutencao < truck.km_atual) {
        throw new AppError(
          `Quilometragem inválida: registro atual do veículo é ${truck.km_atual} km`,
          400
        );
      }
    }

    // Deduplication: reject if identical record was created in last 2 minutes
    const twoMinAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
    const { data: existing } = await supabase
      .from('manutencoes')
      .select('id')
      .eq('user_id', userId)
      .eq('caminhao_id', maintenanceData.caminhao_id)
      .eq('descricao', maintenanceData.descricao)
      .eq('valor_total', maintenanceData.valor_total)
      .gte('created_at', twoMinAgo)
      .limit(1);

    if (existing && existing.length > 0) {
      // Return existing record instead of creating duplicate
      const { data: fullRecord } = await supabase
        .from('manutencoes')
        .select('*')
        .eq('id', existing[0].id)
        .single();
      return fullRecord;
    }

    const { data, error } = await supabase
      .from('manutencoes')
      .insert([{ ...maintenanceData, user_id: userId }])
      .select()
      .single();

    if (error) throw new AppError('Falha ao criar registro de manutenção', 500, error);

    // Update truck mileage (validation already passed above)
    if (maintenanceData.km_manutencao && maintenanceData.km_manutencao > 0) {
      await truckService.update(maintenanceData.caminhao_id, { km_atual: maintenanceData.km_manutencao, updated_at: new Date().toISOString() }, userId);
    }

    return data;
  }

  async update(id, updateData, userId) {
    await this.getById(id, userId);
    const { data, error } = await supabase
      .from('manutencoes')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();
    if (error) throw new AppError('Falha ao atualizar manutenção', 500, error);
    if (updateData.km_manutencao && updateData.km_manutencao > 0) {
      await truckService.updateMileage(data.caminhao_id, updateData.km_manutencao, userId);
    }
    return data;
  }

  async delete(id, userId) {
    await this.getById(id, userId);
    const { error } = await supabase
      .from('manutencoes')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId)
      .is('deleted_at', null);
    if (error) throw new AppError('Falha ao excluir manutenção', 500, error);
    return true;
  }

  async getStatsByTruck(truckId, userId) {
    const records = await this.getByTruck(truckId, userId);

    if (records.length === 0) {
      return { total_spent: 0, maintenance_count: 0, by_type: {} };
    }

    const totalSpent = records.reduce((sum, r) => sum + Number(r.valor_total), 0);

    const byType = records.reduce((acc, r) => {
      const type = r.tipo_manutencao;
      if (!acc[type]) {
        acc[type] = { count: 0, total_spent: 0 };
      }
      acc[type].count++;
      acc[type].total_spent += Number(r.valor_total);
      return acc;
    }, {});

    return {
      total_spent: parseFloat(totalSpent.toFixed(2)),
      maintenance_count: records.length,
      by_type: byType
    };
  }
}

module.exports = new MaintenanceService();
