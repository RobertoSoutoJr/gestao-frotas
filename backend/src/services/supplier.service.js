const { supabase } = require('../config/database');
const { AppError } = require('../middlewares/errorHandler');

class SupplierService {
  async getAll(userId) {
    const { data, error } = await supabase
      .from('fornecedores')
      .select('*')
      .eq('user_id', userId)
      .order('nome', { ascending: true });

    if (error) throw new AppError('Falha ao buscar fornecedores', 500, error);
    return data;
  }

  async getById(id, userId) {
    const { data, error } = await supabase
      .from('fornecedores')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) throw new AppError('Fornecedor não encontrado', 404, error);
    return data;
  }

  async create(supplierData, userId) {
    const { data, error } = await supabase
      .from('fornecedores')
      .insert([{ ...supplierData, user_id: userId }])
      .select()
      .single();

    if (error) throw new AppError('Falha ao criar fornecedor', 500, error);
    return data;
  }

  async update(id, supplierData, userId) {
    const { data, error } = await supabase
      .from('fornecedores')
      .update({ ...supplierData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw new AppError('Falha ao atualizar fornecedor', 500, error);
    return data;
  }

  async delete(id, userId) {
    const { error } = await supabase
      .from('fornecedores')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw new AppError('Falha ao deletar fornecedor. Verifique se não há produtos, viagens ou estoque vinculados.', 500, error);
    return { message: 'Fornecedor deletado com sucesso' };
  }
}

module.exports = new SupplierService();
