const { supabase } = require('../config/database');
const { AppError } = require('../middlewares/errorHandler');
const truckService = require('./truck.service');

class FuelService {
  async getAll(userId) {
    const { data, error } = await supabase
      .from('abastecimentos')
      .select(`
        *,
        caminhoes:caminhao_id(placa, modelo),
        motoristas:motorista_id(nome)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new AppError('Falha ao buscar registros de abastecimento', 500, error);
    return data;
  }

  async getById(id, userId) {
    const { data, error } = await supabase
      .from('abastecimentos')
      .select(`
        *,
        caminhoes:caminhao_id(placa, modelo),
        motoristas:motorista_id(nome)
      `)
      .eq('id', id)
      .eq('user_id', userId)
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
      .order('created_at', { ascending: false });

    if (error) throw new AppError('Falha ao buscar registros de abastecimento do caminhão', 500, error);
    return data;
  }

  async create(fuelData, userId) {
    // Verify truck and driver exist
    await truckService.getById(fuelData.caminhao_id, userId);

    const { data, error } = await supabase
      .from('abastecimentos')
      .insert([{ ...fuelData, user_id: userId }])
      .select()
      .single();

    if (error) throw new AppError('Falha ao criar registro de abastecimento', 500, error);

    // Update truck mileage
    await truckService.updateMileage(fuelData.caminhao_id, fuelData.km_registro, userId);

    return data;
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
