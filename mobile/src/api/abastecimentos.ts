import { apiGet } from './client';
import type { Abastecimento } from './types';

export const abastecimentosApi = {
  list: () => apiGet<Abastecimento[]>('/abastecimentos'),
};
