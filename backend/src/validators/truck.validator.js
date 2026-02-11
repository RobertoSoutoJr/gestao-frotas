const { z } = require('zod');

const createTruckSchema = z.object({
  placa: z.string()
    .min(7, 'License plate must have at least 7 characters')
    .max(10, 'License plate too long')
    .regex(/^[A-Z]{3}-?\d{4}$|^[A-Z]{3}\d[A-Z]\d{2}$/, 'Invalid license plate format'),
  modelo: z.string()
    .min(2, 'Model name too short')
    .max(100, 'Model name too long'),
  ano: z.number()
    .int()
    .min(1990, 'Year must be 1990 or later')
    .max(new Date().getFullYear() + 1, 'Invalid year')
    .optional(),
  km_atual: z.number()
    .nonnegative('Mileage cannot be negative')
    .optional(),
  capacidade_silo_ton: z.number()
    .positive('Capacity must be positive')
    .optional()
});

const updateTruckSchema = createTruckSchema.partial();

module.exports = { createTruckSchema, updateTruckSchema };
