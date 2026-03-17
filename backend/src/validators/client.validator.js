const { z } = require('zod');

const createClientSchema = z.object({
  nome: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(200, 'Nome muito longo'),
  cpf_cnpj: z.string()
    .max(20, 'CPF/CNPJ muito longo')
    .optional()
    .nullable(),
  telefone: z.string()
    .max(20, 'Telefone muito longo')
    .optional()
    .nullable(),
  email: z.string()
    .email('E-mail inválido')
    .max(200)
    .optional()
    .nullable(),
  endereco: z.string()
    .max(500, 'Endereço muito longo')
    .optional()
    .nullable(),
  cidade: z.string()
    .max(100, 'Cidade muito longa')
    .optional()
    .nullable(),
  estado: z.string()
    .length(2, 'Estado deve ter 2 caracteres (UF)')
    .optional()
    .nullable(),
  cep: z.string()
    .max(10, 'CEP muito longo')
    .optional()
    .nullable(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  observacoes: z.string().max(1000).optional().nullable()
});

const updateClientSchema = createClientSchema.partial();

module.exports = { createClientSchema, updateClientSchema };
