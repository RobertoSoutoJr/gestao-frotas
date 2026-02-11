const { z } = require('zod');

const maintenanceTypes = ['Preventiva', 'Corretiva', 'Pneus', 'Motor', 'Freios', 'Suspensão', 'Elétrica', 'Outros'];

const createMaintenanceSchema = z.object({
  caminhao_id: z.number().int().positive('ID do caminhão inválido'),
  descricao: z.string().min(3, 'Descrição muito curta').max(500, 'Descrição muito longa'),
  tipo_manutencao: z.enum(maintenanceTypes, {
    errorMap: () => ({ message: 'Tipo de manutenção inválido' })
  }),
  valor_total: z.number().positive('Valor total deve ser positivo'),
  km_manutencao: z.number().nonnegative('Quilometragem não pode ser negativa'),
  data_manutencao: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de data inválido (use AAAA-MM-DD)')
});

module.exports = { createMaintenanceSchema, maintenanceTypes };
