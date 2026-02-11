const { z } = require('zod');

const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/;

const createDriverSchema = z.object({
  nome: z.string()
    .min(3, 'Name must have at least 3 characters')
    .max(100, 'Name too long'),
  cpf: z.string()
    .regex(cpfRegex, 'Invalid CPF format'),
  telefone: z.string()
    .regex(/^(\+55\s?)?(\(?\d{2}\)?[\s-]?)?\d{4,5}[\s-]?\d{4}$/, 'Invalid phone format')
    .optional()
});

const updateDriverSchema = createDriverSchema.partial();

module.exports = { createDriverSchema, updateDriverSchema };
