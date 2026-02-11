const { z } = require('zod');

const maintenanceTypes = ['Preventiva', 'Corretiva', 'Pneus', 'Motor', 'Freios', 'Suspensão', 'Elétrica', 'Outros'];

const createMaintenanceSchema = z.object({
  caminhao_id: z.number().int().positive('Invalid truck ID'),
  descricao: z.string().min(3, 'Description too short').max(500, 'Description too long'),
  tipo_manutencao: z.enum(maintenanceTypes, {
    errorMap: () => ({ message: 'Invalid maintenance type' })
  }),
  valor_total: z.number().positive('Total amount must be positive'),
  km_manutencao: z.number().nonnegative('Mileage cannot be negative'),
  data_manutencao: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (use YYYY-MM-DD)')
});

module.exports = { createMaintenanceSchema, maintenanceTypes };
