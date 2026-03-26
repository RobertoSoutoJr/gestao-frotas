const { z } = require('zod');

const createTripSchema = z.object({
  fornecedor_id: z.number().int().positive('Fornecedor é obrigatório'),
  cliente_id: z.number().int().positive('Cliente é obrigatório'),
  caminhao_id: z.number().int().positive('Caminhão é obrigatório'),
  motorista_id: z.number().int().positive('Motorista é obrigatório'),
  produto: z.string().min(1, 'Produto é obrigatório').max(100),
  quantidade_sacas: z.number().positive('Quantidade de sacas deve ser positiva'),
  preco_produto_saca: z.number().positive('Preço do produto por saca deve ser positivo'),
  preco_frete_saca: z.number()
    .min(0.50, 'Frete mínimo é R$0,50 por saca')
    .max(10.00, 'Frete máximo é R$10,00 por saca'),
  distancia_km: z.number().nonnegative().optional().nullable(),
  data_viagem: z.string().optional().nullable(),
  observacoes: z.string().max(1000).optional().nullable(),
  estoque_id: z.number().int().positive().optional().nullable(),
  custo_combustivel: z.number().nonnegative().optional().default(0),
  custo_pedagio: z.number().nonnegative().optional().default(0),
  custo_manutencao: z.number().nonnegative().optional().default(0),
  custo_outros: z.number().nonnegative().optional().default(0),
  origem_cidade: z.string().max(100).optional().nullable(),
  origem_estado: z.string().max(2).optional().nullable(),
  destino_cidade: z.string().max(100).optional().nullable(),
  destino_estado: z.string().max(2).optional().nullable(),
  origem_lat: z.number().optional().nullable(),
  origem_lng: z.number().optional().nullable(),
  destino_lat: z.number().optional().nullable(),
  destino_lng: z.number().optional().nullable(),
});

const updateTripSchema = createTripSchema.partial();

const finalizeTripSchema = z.object({
  forma_pagamento: z.enum(
    ['dinheiro', 'pix', 'transferencia', 'boleto', 'cheque', 'cartao', 'a_prazo'],
    { errorMap: () => ({ message: 'Forma de pagamento inválida' }) }
  ),
  custo_combustivel: z.number().nonnegative().optional(),
  custo_pedagio: z.number().nonnegative().optional(),
  custo_manutencao: z.number().nonnegative().optional(),
  custo_outros: z.number().nonnegative().optional()
});

module.exports = { createTripSchema, updateTripSchema, finalizeTripSchema };
