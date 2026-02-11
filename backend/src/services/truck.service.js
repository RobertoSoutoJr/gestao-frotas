const { supabase } = require('../config/database');
const { AppError } = require('../middlewares/errorHandler');

class TruckService {
  async getAll() {
    const { data, error } = await supabase
      .from('caminhoes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new AppError('Falha ao buscar caminhões', 500, error);
    return data;
  }

  async getById(id) {
    const { data, error } = await supabase
      .from('caminhoes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new AppError('Caminhão não encontrado', 404, error);
    return data;
  }

  async create(truckData) {
    // Check if license plate already exists
    const { data: existing } = await supabase
      .from('caminhoes')
      .select('placa')
      .eq('placa', truckData.placa)
      .single();

    if (existing) {
      throw new AppError('Placa já cadastrada', 409);
    }

    const { data, error } = await supabase
      .from('caminhoes')
      .insert([truckData])
      .select()
      .single();

    if (error) throw new AppError('Falha ao criar caminhão', 500, error);
    return data;
  }

  async update(id, truckData) {
    const { data, error } = await supabase
      .from('caminhoes')
      .update(truckData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new AppError('Falha ao atualizar caminhão', 500, error);
    return data;
  }

  async delete(id) {
    const { error } = await supabase
      .from('caminhoes')
      .delete()
      .eq('id', id);

    if (error) throw new AppError('Falha ao deletar caminhão', 500, error);
    return { message: 'Caminhão deletado com sucesso' };
  }

  async updateMileage(id, newMileage) {
    const truck = await this.getById(id);

    if (newMileage < truck.km_atual) {
      throw new AppError('Nova quilometragem não pode ser menor que a atual', 400);
    }

    return this.update(id, { km_atual: newMileage });
  }
}

module.exports = new TruckService();
