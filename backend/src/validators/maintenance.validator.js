const { z } = require('zod');

const maintenanceTypes = ['Preventiva', 'Corretiva', 'Pneus', 'Motor', 'Freios', 'Suspensão', 'Elétrica', 'Outros'];

const createMaintenanceSchema = z.object({
  caminhao_id: z.number().int().positive('ID do caminhão inválido'),
  descricao: z.string().min(3, 'Descrição muito curta').max(500, 'Descrição muito longa'),
  tipo_manutencao: z.enum(maintenanceTypes, {
    errorMap: () => ({ message: 'Tipo de manutenção inválido' })
  }),
  valor_total: z.number().nonnegative('Valor total não pode ser negativo'),
  km_manutencao: z.number().nonnegative('Quilometragem não pode ser negativa').optional().default(0),
  data_manutencao: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de data inválido').optional().nullable(),
  oficina: z.string().max(200).optional().nullable(),
  status: z.enum(['pendente', 'em_andamento', 'concluida']).optional().default('concluida')
});

module.exports = { createMaintenanceSchema, maintenanceTypes };
