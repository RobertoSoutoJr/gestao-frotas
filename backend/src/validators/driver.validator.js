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
    .optional()
});

const updateDriverSchema = createDriverSchema.partial();

module.exports = { createDriverSchema, updateDriverSchema };
