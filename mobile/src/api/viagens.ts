import { apiGet, apiPut, apiPatch, apiDelete } from './client';
import type { Viagem } from './types';

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

export interface UpdateViagemPayload {
  produto?: string;
  quantidade_sacas?: number;
  preco_frete_saca?: number;
  valor_total_frete?: number;
  distancia_km?: number;
  observacoes?: string;
}

export const viagensApi = {
  list: () => apiGet<Viagem[]>('/viagens'),
  getById: (id: number) => apiGet<Viagem>(`/viagens/${id}`),
  update: (id: number, data: UpdateViagemPayload) =>
    apiPut<Viagem>(`/viagens/${id}`, data),
  updateLocation: (id: number, data: UpdateLocationPayload) =>
    apiPatch<Viagem>(`/viagens/${id}/location`, data),
  finalize: (id: number, data: FinalizeViagemPayload) =>
    apiPatch<Viagem>(`/viagens/${id}/finalizar`, data),
  delete: (id: number) => apiDelete<void>(`/viagens/${id}`),
};
