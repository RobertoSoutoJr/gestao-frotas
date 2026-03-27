const { supabase } = require('../config/database');
const { AppError } = require('../middlewares/errorHandler');

class TripService {
  async getAll(userId) {
    const { data, error } = await supabase
      .from('viagens')
      .select('*, fornecedores(id, nome, endereco, cidade, estado), clientes(id, nome, endereco, cidade, estado), caminhoes(id, placa, modelo), motoristas(id, nome)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new AppError('Falha ao buscar viagens', 500, error);
    return data;
  }

  async getById(id, userId) {
    const { data, error } = await supabase
      .from('viagens')
      .select('*, fornecedores(id, nome, endereco, cidade, estado), clientes(id, nome, endereco, cidade, estado), caminhoes(id, placa, modelo), motoristas(id, nome)')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) throw new AppError('Viagem não encontrada', 404, error);
    return data;
  }

  async create(tripData, userId) {
    const peso_total_kg = tripData.quantidade_sacas * 60;
    const valor_total_produto = tripData.quantidade_sacas * tripData.preco_produto_saca;
    const valor_total_frete = tripData.quantidade_sacas * tripData.preco_frete_saca;

    const { data, error } = await supabase
      .from('viagens')
      .insert([{
        ...tripData,
        peso_total_kg,
        valor_total_produto,
        valor_total_frete,
        status: 'cadastrada',
        user_id: userId
      }])
      .select('*, fornecedores(id, nome, endereco, cidade, estado), clientes(id, nome, endereco, cidade, estado), caminhoes(id, placa, modelo), motoristas(id, nome)')
      .single();

    if (error) throw new AppError('Falha ao criar viagem', 500, error);
    return data;
  }

  async update(id, tripData, userId) {
    const updateData = { ...tripData, updated_at: new Date().toISOString() };

    if (tripData.quantidade_sacas || tripData.preco_produto_saca || tripData.preco_frete_saca) {
      const existing = await this.getById(id, userId);
      const qtd = tripData.quantidade_sacas || existing.quantidade_sacas;
      const precoP = tripData.preco_produto_saca || existing.preco_produto_saca;
      const precoF = tripData.preco_frete_saca || existing.preco_frete_saca;
      updateData.peso_total_kg = qtd * 60;
      updateData.valor_total_produto = qtd * precoP;
      updateData.valor_total_frete = qtd * precoF;
    }

    const { data, error } = await supabase
      .from('viagens')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .eq('status', 'cadastrada')
      .select('*, fornecedores(id, nome, endereco, cidade, estado), clientes(id, nome, endereco, cidade, estado), caminhoes(id, placa, modelo), motoristas(id, nome)')
      .single();

    if (error) throw new AppError('Falha ao atualizar viagem. Viagens finalizadas não podem ser editadas.', 500, error);
    return data;
  }

  async finalize(id, finalizeData, userId) {
    // Get trip to check for linked stock
    const trip = await this.getById(id, userId);
    if (trip.status !== 'cadastrada') {
      throw new AppError('Apenas viagens cadastradas podem ser finalizadas.', 400);
    }

    const updatePayload = {
      status: 'finalizada',
      forma_pagamento: finalizeData.forma_pagamento,
      data_finalizacao: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Save costs if provided
    if (finalizeData.custo_combustivel !== undefined) updatePayload.custo_combustivel = finalizeData.custo_combustivel;
    if (finalizeData.custo_pedagio !== undefined) updatePayload.custo_pedagio = finalizeData.custo_pedagio;
    if (finalizeData.custo_manutencao !== undefined) updatePayload.custo_manutencao = finalizeData.custo_manutencao;
    if (finalizeData.custo_outros !== undefined) updatePayload.custo_outros = finalizeData.custo_outros;

    const { data, error } = await supabase
      .from('viagens')
      .update(updatePayload)
      .eq('id', id)
      .eq('user_id', userId)
      .eq('status', 'cadastrada')
      .select('*, fornecedores(id, nome), clientes(id, nome), caminhoes(id, placa, modelo), motoristas(id, nome)')
      .single();

    if (error) throw new AppError('Falha ao finalizar viagem. Verifique se a viagem está cadastrada.', 500, error);

    // Subtract from stock if linked
    if (trip.estoque_id) {
      const { data: stock, error: stockErr } = await supabase
        .from('estoque')
        .select('quantidade_sacas_restante')
        .eq('id', trip.estoque_id)
        .eq('user_id', userId)
        .single();

      if (!stockErr && stock) {
        const novoRestante = Math.max(0, Number(stock.quantidade_sacas_restante) - Number(trip.quantidade_sacas));
        await supabase
          .from('estoque')
          .update({ quantidade_sacas_restante: novoRestante, updated_at: new Date().toISOString() })
          .eq('id', trip.estoque_id)
          .eq('user_id', userId);
      }
    }

    return data;
  }

  async updateLocation(id, field, lat, lng, userId) {
    const updateData = {
      [`${field}_lat`]: lat,
      [`${field}_lng`]: lng,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('viagens')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select('id, origem_lat, origem_lng, destino_lat, destino_lng')
      .single();

    if (error) throw new AppError('Falha ao atualizar localização da viagem', 500, error);
    return data;
  }

  async delete(id, userId) {
    const { error } = await supabase
      .from('viagens')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
      .eq('status', 'cadastrada');

    if (error) throw new AppError('Falha ao deletar viagem. Apenas viagens cadastradas podem ser deletadas.', 500, error);
    return { message: 'Viagem deletada com sucesso' };
  }
}

module.exports = new TripService();
