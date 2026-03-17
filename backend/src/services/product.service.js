const { supabase } = require('../config/database');
const { AppError } = require('../middlewares/errorHandler');

class ProductService {
  async getAll(userId) {
    const { data, error } = await supabase
      .from('produtos')
      .select('*, fornecedores(id, nome)')
      .eq('user_id', userId)
      .order('nome', { ascending: true });

    if (error) throw new AppError('Falha ao buscar produtos', 500, error);
    return data;
  }

  async getById(id, userId) {
    const { data, error } = await supabase
      .from('produtos')
      .select('*, fornecedores(id, nome)')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) throw new AppError('Produto não encontrado', 404, error);
    return data;
  }

  async create(productData, userId) {
    const { data, error } = await supabase
      .from('produtos')
      .insert([{ ...productData, user_id: userId }])
      .select('*, fornecedores(id, nome)')
      .single();

    if (error) throw new AppError('Falha ao criar produto', 500, error);
    return data;
  }

  async update(id, productData, userId) {
    const { data, error } = await supabase
      .from('produtos')
      .update({ ...productData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId)
      .select('*, fornecedores(id, nome)')
      .single();

    if (error) throw new AppError('Falha ao atualizar produto', 500, error);
    return data;
  }

  async delete(id, userId) {
    const { error } = await supabase
      .from('produtos')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw new AppError('Falha ao deletar produto. Verifique se não há viagens ou estoque vinculados.', 500, error);
    return { message: 'Produto deletado com sucesso' };
  }
}

module.exports = new ProductService();
