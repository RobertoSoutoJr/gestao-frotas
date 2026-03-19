const { z } = require('zod');

const createStockSchema = z.object({
  produto: z.string().min(1, 'Produto é obrigatório').max(100),
  fornecedor_id: z.number().int().positive('Fornecedor é obrigatório'),
  quantidade_sacas: z.number().positive('Quantidade de sacas deve ser positiva'),
  preco_pago_saca: z.number().positive('Preço pago por saca deve ser positivo'),
  pago: z.boolean().default(false),
  data_pagamento: z.string().optional().nullable(),
  data_entrada: z.string().optional().nullable(),
  nota_fiscal: z.string().max(50).optional().nullable(),
  observacoes: z.string().max(1000).optional().nullable()
});

const updateStockSchema = createStockSchema.partial();

module.exports = { createStockSchema, updateStockSchema };
