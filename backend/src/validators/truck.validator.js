const { z } = require('zod');

const createTruckSchema = z.object({
  placa: z.string()
    .min(7, 'Placa deve ter pelo menos 7 caracteres')
    .max(10, 'Placa muito longa')
    .transform(v => {
      let p = v.toUpperCase().replace(/[^A-Z0-9]/g, '');
      // Antiga: ABC1234 -> ABC-1234 | Mercosul: ABC1D23 -> ABC-1D23
      if (p.length === 7) p = p.slice(0, 3) + '-' + p.slice(3);
      return p;
    })
    .pipe(z.string().regex(/^[A-Z]{3}-\d{4}$|^[A-Z]{3}-\d[A-Z]\d{2}$/, 'Formato de placa inválido (ex: ABC-1234 ou ABC-1D23)')),
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
    .optional(),
  data_licenciamento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de data inválido').optional().nullable(),
  km_proxima_revisao: z.number().int().nonnegative().optional().nullable()
});

const updateTruckSchema = createTruckSchema.partial();

module.exports = { createTruckSchema, updateTruckSchema };
