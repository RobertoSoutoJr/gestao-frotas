const { z } = require('zod');

const createOficinaSchema = z.object({
  nome: z.string().min(2, 'Nome muito curto').max(200, 'Nome muito longo'),
  endereco: z.string().max(500).optional().nullable(),
  telefone: z.string().max(20).optional().nullable(),
  cnpj: z.string().max(20).optional().nullable(),
});

module.exports = { createOficinaSchema };
