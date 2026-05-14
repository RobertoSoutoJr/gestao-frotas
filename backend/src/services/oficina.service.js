const { supabase } = require('../config/database');
const { AppError } = require('../middlewares/errorHandler');

class OficinaService {
  async getAll(userId) {
    const { data, error } = await supabase
      .from('oficinas')
      .select('*')
      .eq('user_id', userId)
      .order('nome', { ascending: true });

    if (error) throw new AppError('Falha ao buscar oficinas', 500, error);
    return data;
  }

  async getById(id, userId) {
    const { data, error } = await supabase
      .from('oficinas')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) throw new AppError('Oficina não encontrada', 404, error);
    return data;
  }

  async create(oficinaData, userId) {
    const { data, error } = await supabase
      .from('oficinas')
      .insert([{ ...oficinaData, user_id: userId }])
      .select()
      .single();

    if (error) throw new AppError('Falha ao criar oficina', 500, error);
    return data;
  }

  async update(id, updateData, userId) {
    await this.getById(id, userId);
    const { data, error } = await supabase
      .from('oficinas')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw new AppError('Falha ao atualizar oficina', 500, error);
    return data;
  }

  async delete(id, userId) {
    await this.getById(id, userId);
    const { error } = await supabase
      .from('oficinas')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw new AppError('Falha ao excluir oficina', 500, error);
    return true;
  }
}

module.exports = new OficinaService();
