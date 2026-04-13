import { apiGet, apiPatch } from './client';
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

export const viagensApi = {
  list: () => apiGet<Viagem[]>('/viagens'),
  getById: (id: number) => apiGet<Viagem>(`/viagens/${id}`),
  updateLocation: (id: number, data: UpdateLocationPayload) =>
    apiPatch<Viagem>(`/viagens/${id}/location`, data),
  finalize: (id: number, data: FinalizeViagemPayload) =>
    apiPatch<Viagem>(`/viagens/${id}/finalizar`, data),
};
