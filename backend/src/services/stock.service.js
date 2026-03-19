const { supabase } = require('../config/database');
const { AppError } = require('../middlewares/errorHandler');

const STOCK_SELECT = '*, fornecedores(id, nome)';

class StockService {
  async getAll(userId) {
    const { data, error } = await supabase
      .from('estoque')
      .select(STOCK_SELECT)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new AppError('Falha ao buscar estoque', 500, error);
    return data;
  }

  async getById(id, userId) {
    const { data, error } = await supabase
      .from('estoque')
      .select(STOCK_SELECT)
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) throw new AppError('Registro de estoque não encontrado', 404, error);
    return data;
  }

  async create(stockData, userId) {
    const peso_total_kg = stockData.quantidade_sacas * 60;
    const valor_total = stockData.quantidade_sacas * stockData.preco_pago_saca;
    const preco_sugerido_saca = Number((stockData.preco_pago_saca * 1.15).toFixed(2));
    const valor_pago = stockData.pago ? valor_total : 0;

    const { data, error } = await supabase
      .from('estoque')
      .insert([{
        ...stockData,
        peso_total_kg,
        valor_total,
        preco_sugerido_saca,
        valor_pago,
        quantidade_sacas_restante: stockData.quantidade_sacas,
        user_id: userId
      }])
      .select(STOCK_SELECT)
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

      // Adjust remaining if total quantity changed
      if (stockData.quantidade_sacas) {
        const used = existing.quantidade_sacas - existing.quantidade_sacas_restante;
        updateData.quantidade_sacas_restante = Math.max(0, stockData.quantidade_sacas - used);
      }
    }

    const { data, error } = await supabase
      .from('estoque')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select(STOCK_SELECT)
      .single();

    if (error) throw new AppError('Falha ao atualizar estoque', 500, error);
    return data;
  }

  async togglePaid(id, pago, userId) {
    const existing = await this.getById(id, userId);
    const updateData = {
      pago,
      updated_at: new Date().toISOString()
    };

    if (pago) {
      updateData.data_pagamento = new Date().toISOString();
      updateData.valor_pago = existing.valor_total;
    } else {
      updateData.data_pagamento = null;
    }

    const { data, error } = await supabase
      .from('estoque')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select(STOCK_SELECT)
      .single();

    if (error) throw new AppError('Falha ao alterar status de pagamento', 500, error);
    return data;
  }

  async makePartialPayment(id, paymentData, userId) {
    const existing = await this.getById(id, userId);
    const saldoRestante = Number(existing.valor_total) - Number(existing.valor_pago || 0);

    if (paymentData.valor > saldoRestante + 0.01) {
      throw new AppError(`Valor excede o saldo restante de R$ ${saldoRestante.toFixed(2)}`, 400);
    }

    // Insert payment record
    const { error: payError } = await supabase
      .from('estoque_pagamentos')
      .insert([{
        estoque_id: id,
        valor: paymentData.valor,
        forma_pagamento: paymentData.forma_pagamento,
        observacoes: paymentData.observacoes || null,
        user_id: userId
      }]);

    if (payError) throw new AppError('Falha ao registrar pagamento', 500, payError);

    // Insert cheques if payment method is Cheque
    if (paymentData.forma_pagamento === 'Cheque' && paymentData.cheques?.length > 0) {
      const chequesData = paymentData.cheques.map(c => ({
        estoque_id: id,
        valor: c.valor,
        nome_titular_conta: c.nome_titular_conta,
        nome_emissor: c.nome_emissor,
        data_cheque: c.data_cheque || null,
        numero_cheque: c.numero_cheque || null,
        user_id: userId
      }));

      const { error: chequeError } = await supabase
        .from('estoque_cheques')
        .insert(chequesData);

      if (chequeError) throw new AppError('Falha ao registrar cheques', 500, chequeError);
    }

    // Update stock payment totals
    const newValorPago = Number(existing.valor_pago || 0) + paymentData.valor;
    const fullyPaid = newValorPago >= Number(existing.valor_total) - 0.01;

    const { data, error } = await supabase
      .from('estoque')
      .update({
        valor_pago: newValorPago,
        pago: fullyPaid,
        forma_pagamento: paymentData.forma_pagamento,
        data_pagamento: fullyPaid ? new Date().toISOString() : existing.data_pagamento,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select(STOCK_SELECT)
      .single();

    if (error) throw new AppError('Falha ao atualizar estoque', 500, error);
    return data;
  }

  async getPaymentHistory(id, userId) {
    // Verify ownership
    await this.getById(id, userId);

    const { data, error } = await supabase
      .from('estoque_pagamentos')
      .select('*')
      .eq('estoque_id', id)
      .order('data_pagamento', { ascending: false });

    if (error) throw new AppError('Falha ao buscar histórico', 500, error);
    return data;
  }

  async getCheques(id, userId) {
    await this.getById(id, userId);

    const { data, error } = await supabase
      .from('estoque_cheques')
      .select('*')
      .eq('estoque_id', id)
      .order('created_at', { ascending: false });

    if (error) throw new AppError('Falha ao buscar cheques', 500, error);
    return data;
  }

  async markAsPaid(id, userId) {
    return this.togglePaid(id, true, userId);
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
