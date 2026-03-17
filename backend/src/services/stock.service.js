const { supabase } = require('../config/database');
const { AppError } = require('../middlewares/errorHandler');

class StockService {
  async getAll(userId) {
    const { data, error } = await supabase
      .from('estoque')
      .select('*, produtos(id, nome, preco_saca), fornecedores(id, nome)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new AppError('Falha ao buscar estoque', 500, error);
    return data;
  }

  async getById(id, userId) {
    const { data, error } = await supabase
      .from('estoque')
      .select('*, produtos(id, nome, preco_saca), fornecedores(id, nome)')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) throw new AppError('Registro de estoque não encontrado', 404, error);
    return data;
  }

  async create(stockData, userId) {
    const peso_total_kg = stockData.quantidade_sacas * 60;
    const valor_total = stockData.quantidade_sacas * stockData.preco_pago_saca;

    // Calcula preço sugerido: margem de 15% sobre o preço pago
    const preco_sugerido_saca = Number((stockData.preco_pago_saca * 1.15).toFixed(2));

    const { data, error } = await supabase
      .from('estoque')
      .insert([{
        ...stockData,
        peso_total_kg,
        valor_total,
        preco_sugerido_saca,
        user_id: userId
      }])
      .select('*, produtos(id, nome, preco_saca), fornecedores(id, nome)')
      .single();

    if (error) throw new AppError('Falha ao criar registro de estoque', 500, error);
    return data;
  }

  async update(id, stockData, userId) {
    const updateData = { ...stockData, updated_at: new Date().toISOString() };

    if (stockData.quantidade_sacas || stockData.preco_pago_saca) {
      const existing = await this.getById(id, userId);
      const qtd = stockData.quantidade_sacas || existing.quantidade_sacas;
      const preco = stockData.preco_pago_saca || existing.preco_pago_saca;
      updateData.peso_total_kg = qtd * 60;
      updateData.valor_total = qtd * preco;
      updateData.preco_sugerido_saca = Number((preco * 1.15).toFixed(2));
    }

    const { data, error } = await supabase
      .from('estoque')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select('*, produtos(id, nome, preco_saca), fornecedores(id, nome)')
      .single();

    if (error) throw new AppError('Falha ao atualizar estoque', 500, error);
    return data;
  }

  async markAsPaid(id, userId) {
    const { data, error } = await supabase
      .from('estoque')
      .update({
        pago: true,
        data_pagamento: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select('*, produtos(id, nome, preco_saca), fornecedores(id, nome)')
      .single();

    if (error) throw new AppError('Falha ao marcar como pago', 500, error);
    return data;
  }

  async delete(id, userId) {
    const { error } = await supabase
      .from('estoque')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw new AppError('Falha ao deletar registro de estoque', 500, error);
    return { message: 'Registro de estoque deletado com sucesso' };
  }
}

module.exports = new StockService();
