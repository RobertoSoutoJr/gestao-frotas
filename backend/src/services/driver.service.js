const { supabase } = require('../config/database');
const { AppError } = require('../middlewares/errorHandler');

class DriverService {
  async getAll(userId) {
    const { data, error } = await supabase
      .from('motoristas')
      .select('*, caminhoes:caminhao_id(id, placa, modelo)')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('nome', { ascending: true });

    if (error) throw new AppError('Falha ao buscar motoristas', 500, error);
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
    return data;
  }

  async create(driverData, userId) {
    // Check if CPF already exists for this user
    const { data: existing } = await supabase
      .from('motoristas')
      .select('cpf')
      .eq('cpf', driverData.cpf)
      .eq('user_id', userId)
      .single();

    if (existing) {
      throw new AppError('CPF já cadastrado', 409);
    }

    const { data, error } = await supabase
      .from('motoristas')
      .insert([{ ...driverData, user_id: userId }])
      .select()
      .single();

    if (error) throw new AppError('Falha ao criar motorista', 500, error);
    return data;
  }

  async update(id, driverData, userId) {
    const { data, error } = await supabase
      .from('motoristas')
      .update(driverData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw new AppError('Falha ao atualizar motorista', 500, error);
    return data;
  }

  async delete(id, userId) {
    const { error } = await supabase
      .from('motoristas')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId)
      .is('deleted_at', null);

    if (error) throw new AppError('Falha ao deletar motorista', 500, error);
    return { message: 'Motorista deletado com sucesso' };
  }
}

module.exports = new DriverService();
