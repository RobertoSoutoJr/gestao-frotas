import { apiGet } from './client';
import type { Motorista } from './types';

export const motoristasApi = {
  list: () => apiGet<Motorista[]>('/motoristas'),
  getById: (id: number) => apiGet<Motorista>(`/motoristas/${id}`),
};
