import { apiGet, apiPatch, apiPost } from './client';
import type { Viagem } from './types';

export interface CreateViagemPayload {
  fornecedor_id: number;
  cliente_id: number;
  caminhao_id: number;
  motorista_id: number;
  produto: string;
  quantidade_sacas: number;
  preco_produto_saca: number;
  preco_frete_saca: number;
  distancia_km?: number | null;
  data_viagem?: string | null;
  observacoes?: string | null;
  origem_lat?: number | null;
  origem_lng?: number | null;
}

export interface UpdateLocationPayload {
  field: 'origem' | 'destino';
  lat: number;
  lng: number;
}

export interface FinalizeViagemPayload {
  forma_pagamento: string;
  custo_combustivel?: number;
  custo_pedagio?: number;
  custo_manutencao?: number;
  custo_outros?: number;
}

export const viagensApi = {
  list: () => apiGet<Viagem[]>('/viagens'),
  getById: (id: number) => apiGet<Viagem>(`/viagens/${id}`),
  create: (data: CreateViagemPayload) => apiPost<Viagem>('/viagens', data),
  updateLocation: (id: number, data: UpdateLocationPayload) =>
    apiPatch<Viagem>(`/viagens/${id}/location`, data),
  finalize: (id: number, data: FinalizeViagemPayload) =>
    apiPatch<Viagem>(`/viagens/${id}/finalizar`, data),
};
