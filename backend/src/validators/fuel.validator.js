const { z } = require('zod');

const createFuelRecordSchema = z.object({
  caminhao_id: z.number().int().positive('ID do caminhão inválido'),
  motorista_id: z.number().int().positive('ID do motorista inválido'),
  km_registro: z.number().nonnegative('Quilometragem não pode ser negativa'),
  litros: z.number().positive('Litros deve ser positivo'),
  valor_total: z.number().positive('Valor total deve ser positivo'),
  posto: z.string().max(200, 'Nome do posto muito longo').optional()
});

module.exports = { createFuelRecordSchema };
