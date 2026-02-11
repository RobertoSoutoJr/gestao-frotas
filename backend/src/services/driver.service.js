const { supabase } = require('../config/database');
const { AppError } = require('../middlewares/errorHandler');

class DriverService {
  async getAll() {
    const { data, error } = await supabase
      .from('motoristas')
      .select('*')
      .order('nome', { ascending: true });

    if (error) throw new AppError('Falha ao buscar motoristas', 500, error);
    return data;
  }

  async getById(id) {
    const { data, error } = await supabase
      .from('motoristas')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new AppError('Motorista não encontrado', 404, error);
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
      throw new AppError('CPF já cadastrado', 409);
    }

    const { data, error } = await supabase
      .from('motoristas')
      .insert([driverData])
      .select()
      .single();

    if (error) throw new AppError('Falha ao criar motorista', 500, error);
    return data;
  }

  async update(id, driverData) {
    const { data, error } = await supabase
      .from('motoristas')
      .update(driverData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new AppError('Falha ao atualizar motorista', 500, error);
    return data;
  }

  async delete(id) {
    const { error } = await supabase
      .from('motoristas')
      .delete()
      .eq('id', id);

    if (error) throw new AppError('Falha ao deletar motorista', 500, error);
    return { message: 'Motorista deletado com sucesso' };
  }
}

module.exports = new DriverService();
