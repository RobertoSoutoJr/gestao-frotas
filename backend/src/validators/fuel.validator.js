const { z } = require('zod');

const createFuelRecordSchema = z.object({
  caminhao_id: z.number().int().positive('Invalid truck ID'),
  motorista_id: z.number().int().positive('Invalid driver ID'),
  km_registro: z.number().nonnegative('Mileage cannot be negative'),
  litros: z.number().positive('Liters must be positive'),
  valor_total: z.number().positive('Total amount must be positive'),
  posto: z.string().max(200, 'Gas station name too long').optional()
});

module.exports = { createFuelRecordSchema };
