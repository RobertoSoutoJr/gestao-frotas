const { supabase } = require('../config/database');
const { AppError } = require('../middlewares/errorHandler');
const truckService = require('./truck.service');

class MaintenanceService {
  async getAll() {
    const { data, error } = await supabase
      .from('manutencoes')
      .select(`
        *,
        caminhoes:caminhao_id(placa, modelo)
      `)
      .order('data_manutencao', { ascending: false });

    if (error) throw new AppError('Falha ao buscar registros de manutenção', 500, error);
    return data;
  }

  async getById(id) {
    const { data, error } = await supabase
      .from('manutencoes')
      .select(`
        *,
        caminhoes:caminhao_id(placa, modelo)
      `)
      .eq('id', id)
      .single();

    if (error) throw new AppError('Registro de manutenção não encontrado', 404, error);
    return data;
  }

  async getByTruck(truckId) {
    const { data, error } = await supabase
      .from('manutencoes')
      .select('*')
      .eq('caminhao_id', truckId)
      .order('data_manutencao', { ascending: false });

    if (error) throw new AppError('Falha ao buscar registros de manutenção do caminhão', 500, error);
    return data;
  }

  async create(maintenanceData) {
    // Verify truck exists
    await truckService.getById(maintenanceData.caminhao_id);

    const { data, error } = await supabase
      .from('manutencoes')
      .insert([maintenanceData])
      .select()
      .single();

    if (error) throw new AppError('Falha ao criar registro de manutenção', 500, error);

    // Update truck mileage
    await truckService.updateMileage(maintenanceData.caminhao_id, maintenanceData.km_manutencao);

    return data;
  }

  async getStatsByTruck(truckId) {
    const records = await this.getByTruck(truckId);

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
