import { apiGet, apiPost } from './client';
import type { Abastecimento } from './types';

export interface CreateAbastecimentoPayload {
  caminhao_id: number;
  motorista_id: number;
  litros: number;
  valor_total: number;
  km_registro: number;
  posto?: string;
}

export const abastecimentosApi = {
  list: () => apiGet<Abastecimento[]>('/abastecimentos'),
  create: (data: CreateAbastecimentoPayload) =>
    apiPost<Abastecimento>('/abastecimentos', data),
};
