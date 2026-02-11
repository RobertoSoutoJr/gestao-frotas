const { z } = require('zod');

const createTruckSchema = z.object({
  placa: z.string()
    .min(7, 'Placa deve ter pelo menos 7 caracteres')
    .max(10, 'Placa muito longa')
    .regex(/^[A-Z]{3}-?\d{4}$|^[A-Z]{3}\d[A-Z]\d{2}$/, 'Formato de placa inválido'),
  modelo: z.string()
    .min(2, 'Nome do modelo muito curto')
    .max(100, 'Nome do modelo muito longo'),
  ano: z.number()
    .int()
    .min(1990, 'Ano deve ser 1990 ou posterior')
    .max(new Date().getFullYear() + 1, 'Ano inválido')
    .optional(),
  km_atual: z.number()
    .nonnegative('Quilometragem não pode ser negativa')
    .optional(),
  capacidade_silo_ton: z.number()
    .positive('Capacidade deve ser positiva')
    .optional()
});

const updateTruckSchema = createTruckSchema.partial();

module.exports = { createTruckSchema, updateTruckSchema };
