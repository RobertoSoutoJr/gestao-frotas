const { supabase } = require('../config/database');
const { AppError } = require('../middlewares/errorHandler');

class TruckService {
  async getAll() {
    const { data, error } = await supabase
      .from('caminhoes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new AppError('Failed to fetch trucks', 500, error);
    return data;
  }

  async getById(id) {
    const { data, error } = await supabase
      .from('caminhoes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new AppError('Truck not found', 404, error);
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
      throw new AppError('License plate already registered', 409);
    }

    const { data, error } = await supabase
      .from('caminhoes')
      .insert([truckData])
      .select()
      .single();

    if (error) throw new AppError('Failed to create truck', 500, error);
    return data;
  }

  async update(id, truckData) {
    const { data, error } = await supabase
      .from('caminhoes')
      .update(truckData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new AppError('Failed to update truck', 500, error);
    return data;
  }

  async delete(id) {
    const { error } = await supabase
      .from('caminhoes')
      .delete()
      .eq('id', id);

    if (error) throw new AppError('Failed to delete truck', 500, error);
    return { message: 'Truck deleted successfully' };
  }

  async updateMileage(id, newMileage) {
    const truck = await this.getById(id);

    if (newMileage < truck.km_atual) {
      throw new AppError('New mileage cannot be less than current mileage', 400);
    }

    return this.update(id, { km_atual: newMileage });
  }
}

module.exports = new TruckService();
