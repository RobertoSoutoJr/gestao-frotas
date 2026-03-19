const { z } = require('zod');

const createStockSchema = z.object({
  produto: z.string().min(1, 'Produto é obrigatório').max(100),
  fornecedor_id: z.number().int().positive('Fornecedor é obrigatório'),
  quantidade_sacas: z.number().positive('Quantidade de sacas deve ser positiva'),
  preco_pago_saca: z.number().positive('Preço pago por saca deve ser positivo'),
  pago: z.boolean().default(false),
  data_pagamento: z.string().optional().nullable(),
  data_entrada: z.string().optional().nullable(),
  data_vencimento: z.string().optional().nullable(),
  localizacao: z.string().max(200).optional().nullable(),
  forma_pagamento: z.enum(['Pix', 'Dinheiro', 'Transferencia', 'Cheque']).optional().nullable(),
  nota_fiscal: z.string().max(50).optional().nullable(),
  observacoes: z.string().max(1000).optional().nullable()
});

const updateStockSchema = createStockSchema.partial();

const chequeSchema = z.object({
  valor: z.number().positive('Valor do cheque deve ser positivo'),
  nome_titular_conta: z.string().min(1).max(200),
  nome_emissor: z.string().min(1).max(200),
  data_cheque: z.string().optional().nullable(),
  numero_cheque: z.string().max(50).optional().nullable()
});

const partialPaymentSchema = z.object({
  valor: z.number().positive('Valor do pagamento deve ser positivo'),
  forma_pagamento: z.enum(['Pix', 'Dinheiro', 'Transferencia', 'Cheque']),
  cheques: z.array(chequeSchema).optional(),
  observacoes: z.string().max(1000).optional().nullable()
});

module.exports = { createStockSchema, updateStockSchema, partialPaymentSchema, chequeSchema };
