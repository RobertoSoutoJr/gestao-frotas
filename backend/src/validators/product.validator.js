const { z } = require('zod');

const createProductSchema = z.object({
  nome: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(200, 'Nome muito longo'),
  descricao: z.string().max(500).optional().nullable(),
  preco_saca: z.number()
    .positive('Preço por saca deve ser positivo'),
  peso_saca_kg: z.number()
    .positive('Peso da saca deve ser positivo')
    .default(60),
  unidade: z.string().max(20).default('saca'),
  fornecedor_id: z.number().int().positive().optional().nullable(),
  ativo: z.boolean().default(true)
});

const updateProductSchema = createProductSchema.partial();

module.exports = { createProductSchema, updateProductSchema };
