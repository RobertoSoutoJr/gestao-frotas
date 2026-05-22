const { supabase } = require('../config/database');
const { AppError } = require('../middlewares/errorHandler');

class ClientService {
  async getAll(userId) {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('nome', { ascending: true });

    if (error) throw new AppError('Falha ao buscar clientes', 500, error);
    return data;
  }

  async getById(id, userId) {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .single();

    if (error) throw new AppError('Cliente não encontrado', 404, error);
    return data;
  }

  async create(clientData, userId) {
    const { data, error } = await supabase
      .from('clientes')
      .insert([{ ...clientData, user_id: userId }])
      .select()
      .single();

    if (error) throw new AppError('Falha ao criar cliente', 500, error);
    return data;
  }

  async update(id, clientData, userId) {
    const { data, error } = await supabase
      .from('clientes')
      .update({ ...clientData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw new AppError('Falha ao atualizar cliente', 500, error);
    return data;
  }

  async delete(id, userId) {
    const { error } = await supabase
      .from('clientes')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId)
      .is('deleted_at', null);

    if (error) throw new AppError('Falha ao deletar cliente. Verifique se não há viagens vinculadas.', 500, error);
    return { message: 'Cliente deletado com sucesso' };
  }
}

module.exports = new ClientService();
