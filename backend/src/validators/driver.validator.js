const { z } = require('zod');

const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/;

const createDriverSchema = z.object({
  nome: z.string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(100, 'Nome muito longo'),
  cpf: z.string()
    .regex(cpfRegex, 'Formato de CPF inválido'),
  telefone: z.string()
    .regex(/^(\+55\s?)?(\(?\d{2}\)?[\s-]?)?\d{4,5}[\s-]?\d{4}$/, 'Formato de telefone inválido')
    .optional(),
  numero_cnh: z.string().max(20).optional().nullable(),
  validade_cnh: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de data inválido').optional().nullable()
});

const updateDriverSchema = createDriverSchema.partial();

module.exports = { createDriverSchema, updateDriverSchema };
