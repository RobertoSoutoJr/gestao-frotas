import { apiGet, apiPost, apiPut, apiDelete } from './client';
import type { Abastecimento } from './types';

export interface CreateAbastecimentoPayload {
  caminhao_id: number;
  motorista_id: number;
  litros: number;
  valor_total: number;
  km_registro: number;
  posto?: string;
  posto_id?: number;
}

export const abastecimentosApi = {
  list: () => apiGet<Abastecimento[]>('/abastecimentos'),
  getById: (id: number) => apiGet<Abastecimento>(`/abastecimentos/${id}`),
  create: (data: CreateAbastecimentoPayload) =>
    apiPost<Abastecimento>('/abastecimentos', data),
  update: (id: number, data: Partial<CreateAbastecimentoPayload>) =>
    apiPut<Abastecimento>(`/abastecimentos/${id}`, data),
  delete: (id: number) => apiDelete<void>(`/abastecimentos/${id}`),
};
