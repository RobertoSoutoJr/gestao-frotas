const { supabase } = require('../config/database');
const { AppError } = require('../middlewares/errorHandler');
const truckService = require('./truck.service');
const { parsePagination, paginate } = require('../lib/pagination');

class FuelService {
  async getAll(userId, filters = {}, queryParams = {}) {
    const { page, limit } = parsePagination(queryParams);

    let query = supabase
      .from('abastecimentos')
      .select(`
        *,
        caminhoes:caminhao_id(placa, modelo),
        motoristas:motorista_id(nome),
        postos:posto_id(id, nome)
      `, { count: 'exact' })
      .eq('user_id', userId)
      .is('deleted_at', null);

    // Motorista scope: only their truck
    if (filters.caminhaoId) {
      query = query.eq('caminhao_id', filters.caminhaoId);
    }

    // Search filter
    if (queryParams.search) {
      query = query.or(`posto.ilike.%${queryParams.search}%`);
    }

    query = query.order('created_at', { ascending: false });

    try {
      const result = await paginate(query, page, limit);

      // Check which records have linked NFC-e documents
      if (result.data.length > 0) {
        const ids = result.data.map(r => r.id);
        const { data: docs } = await supabase
          .from('documentos')
          .select('entidade_id')
          .eq('user_id', userId)
          .eq('entidade_tipo', 'abastecimento')
          .in('entidade_id', ids);

        const docSet = new Set((docs || []).map(d => d.entidade_id));
        result.data.forEach(r => { r.has_nfce = docSet.has(r.id); });
      }

      return result;
    } catch (error) {
      throw new AppError('Falha ao buscar registros de abastecimento', 500, error);
    }
  }

  async getById(id, userId) {
    const { data, error } = await supabase
      .from('abastecimentos')
      .select(`
        *,
        caminhoes:caminhao_id(placa, modelo),
        motoristas:motorista_id(nome),
        postos:posto_id(id, nome)
      `)
      .eq('id', id)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .single();

    if (error) throw new AppError('Registro de abastecimento não encontrado', 404, error);
    return data;
  }

  async getByTruck(truckId, userId) {
    const { data, error } = await supabase
      .from('abastecimentos')
      .select('*')
      .eq('caminhao_id', truckId)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw new AppError('Falha ao buscar registros de abastecimento do caminhão', 500, error);
    return data;
  }

  async create(fuelData, userId) {
    // Verify truck exists and validate KM before inserting
    const truck = await truckService.getById(fuelData.caminhao_id, userId);

    if (truck.km_atual && fuelData.km_registro < truck.km_atual) {
      throw new AppError(
        `Quilometragem inválida: registro atual do veículo é ${truck.km_atual} km`,
        400
      );
    }

    const { data, error } = await supabase
      .from('abastecimentos')
      .insert([{ ...fuelData, user_id: userId }])
      .select()
      .single();

    if (error) throw new AppError('Falha ao criar registro de abastecimento', 500, error);

    // Update truck mileage (validation already passed above)
    await truckService.update(fuelData.caminhao_id, { km_atual: fuelData.km_registro, updated_at: new Date().toISOString() }, userId);

    return data;
  }

  async update(id, fuelData, userId) {
    const { data, error } = await supabase
      .from('abastecimentos')
      .update({ ...fuelData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw new AppError('Registro de abastecimento não encontrado', 404, error);
    return data;
  }

  async delete(id, userId) {
    const { error } = await supabase
      .from('abastecimentos')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId)
      .is('deleted_at', null);

    if (error) throw new AppError('Falha ao excluir registro de abastecimento', 500, error);
  }

  async calculateConsumption(truckId, userId) {
    const records = await this.getByTruck(truckId, userId);

    if (records.length < 2) {
      return { message: 'Dados insuficientes para calcular consumo' };
    }

    const sortedRecords = records.sort((a, b) => a.km_registro - b.km_registro);
    const consumptionData = [];

    for (let i = 1; i < sortedRecords.length; i++) {
      const prev = sortedRecords[i - 1];
      const curr = sortedRecords[i];

      const kmDiff = curr.km_registro - prev.km_registro;
      const liters = curr.litros;
      const kmPerLiter = kmDiff / liters;

      consumptionData.push({
        periodo: `${prev.km_registro}km - ${curr.km_registro}km`,
        km_rodados: kmDiff,
        litros: liters,
        km_por_litro: parseFloat(kmPerLiter.toFixed(2)),
        custo_por_km: parseFloat((curr.valor_total / kmDiff).toFixed(2))
      });
    }

    const avgConsumption = consumptionData.reduce((sum, d) => sum + d.km_por_litro, 0) / consumptionData.length;

    return {
      records: consumptionData,
      average_km_per_liter: parseFloat(avgConsumption.toFixed(2))
    };
  }
}

module.exports = new FuelService();
