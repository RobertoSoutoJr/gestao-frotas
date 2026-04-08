import { apiGet } from './client';
import type { Caminhao } from './types';

export const caminhoesApi = {
  list: () => apiGet<Caminhao[]>('/caminhoes'),
  getById: (id: number) => apiGet<Caminhao>(`/caminhoes/${id}`),
};
