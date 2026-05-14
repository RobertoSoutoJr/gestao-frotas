const { supabase } = require('../config/database');
const { AppError } = require('../middlewares/errorHandler');

class PostoService {
  async getAll(userId) {
    const { data, error } = await supabase
      .from('postos')
      .select('*')
      .eq('user_id', userId)
      .order('nome', { ascending: true });

    if (error) throw new AppError('Falha ao buscar postos', 500, error);
    return data;
  }

  async getById(id, userId) {
    const { data, error } = await supabase
      .from('postos')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) throw new AppError('Posto não encontrado', 404, error);
    return data;
  }

  async create(postoData, userId) {
    const { data, error } = await supabase
      .from('postos')
      .insert([{ ...postoData, user_id: userId }])
      .select()
      .single();

    if (error) throw new AppError('Falha ao criar posto', 500, error);
    return data;
  }

  async update(id, updateData, userId) {
    await this.getById(id, userId);
    const { data, error } = await supabase
      .from('postos')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw new AppError('Falha ao atualizar posto', 500, error);
    return data;
  }

  async delete(id, userId) {
    await this.getById(id, userId);
    const { error } = await supabase
      .from('postos')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw new AppError('Falha ao excluir posto', 500, error);
    return true;
  }
}

module.exports = new PostoService();
