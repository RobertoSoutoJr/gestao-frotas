import { apiGet } from './client';
import type { Viagem } from './types';

export const viagensApi = {
  list: () => apiGet<Viagem[]>('/viagens'),
  getById: (id: number) => apiGet<Viagem>(`/viagens/${id}`),
};
