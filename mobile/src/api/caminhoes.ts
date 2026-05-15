import { apiGet, apiPost, apiPut } from './client';
import type { Caminhao } from './types';

export interface CreateCaminhaoPayload {
  placa: string;
  modelo: string;
  marca?: string;
  ano_fabricacao?: number | null;
  tipo_combustivel?: string;
  km_atual?: number | null;
  capacidade_carga?: number | null;
  numero_chassi?: string;
  observacoes?: string;
}

export const caminhoesApi = {
  list: () => apiGet<Caminhao[]>('/caminhoes'),
  getById: (id: number) => apiGet<Caminhao>(`/caminhoes/${id}`),
  create: (data: CreateCaminhaoPayload) => apiPost<Caminhao>('/caminhoes', data),
  update: (id: number, data: Partial<CreateCaminhaoPayload>) => apiPut<Caminhao>(`/caminhoes/${id}`, data),
};
