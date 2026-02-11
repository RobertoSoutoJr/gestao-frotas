const { supabase } = require('../config/database');
const { AppError } = require('../middlewares/errorHandler');

class DriverService {
  async getAll() {
    const { data, error } = await supabase
      .from('motoristas')
      .select('*')
      .order('nome', { ascending: true });

    if (error) throw new AppError('Failed to fetch drivers', 500, error);
    return data;
  }

  async getById(id) {
    const { data, error } = await supabase
      .from('motoristas')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new AppError('Driver not found', 404, error);
    return data;
  }

  async create(driverData) {
    // Check if CPF already exists
    const { data: existing } = await supabase
      .from('motoristas')
      .select('cpf')
      .eq('cpf', driverData.cpf)
      .single();

    if (existing) {
      throw new AppError('CPF already registered', 409);
    }

    const { data, error } = await supabase
      .from('motoristas')
      .insert([driverData])
      .select()
      .single();

    if (error) throw new AppError('Failed to create driver', 500, error);
    return data;
  }

  async update(id, driverData) {
    const { data, error } = await supabase
      .from('motoristas')
      .update(driverData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new AppError('Failed to update driver', 500, error);
    return data;
  }

  async delete(id) {
    const { error } = await supabase
      .from('motoristas')
      .delete()
      .eq('id', id);

    if (error) throw new AppError('Failed to delete driver', 500, error);
    return { message: 'Driver deleted successfully' };
  }
}

module.exports = new DriverService();
