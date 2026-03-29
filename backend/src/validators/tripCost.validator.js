const { z } = require('zod');

const COST_TYPES = ['combustivel', 'pedagio', 'manutencao', 'alimentacao', 'hospedagem', 'multa', 'outros'];

const createTripCostSchema = z.object({
  viagem_id: z.number().int().positive('Viagem é obrigatória'),
  tipo: z.enum(COST_TYPES, { errorMap: () => ({ message: 'Tipo de custo inválido' }) }),
  descricao: z.string().max(255).optional().nullable(),
  valor: z.number().positive('Valor deve ser positivo'),
  data: z.string().optional().nullable(),
});

const updateTripCostSchema = z.object({
  tipo: z.enum(COST_TYPES, { errorMap: () => ({ message: 'Tipo de custo inválido' }) }).optional(),
  descricao: z.string().max(255).optional().nullable(),
  valor: z.number().positive('Valor deve ser positivo').optional(),
  data: z.string().optional().nullable(),
});

module.exports = { createTripCostSchema, updateTripCostSchema, COST_TYPES };
