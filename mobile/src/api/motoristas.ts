import { apiGet, apiPost, apiPut, apiDelete } from './client';
import type { Motorista } from './types';

export interface CreateMotoristaPayload {
  nome: string;
  cpf?: string;
  email?: string;
  telefone?: string;
  cnh?: string;
  categoria_cnh?: string;
  vencimento_cnh?: string;
}

export const motoristasApi = {
  list: () => apiGet<Motorista[]>('/motoristas'),
  getById: (id: number) => apiGet<Motorista>(`/motoristas/${id}`),
  create: (data: CreateMotoristaPayload) => apiPost<Motorista>('/motoristas', data),
  update: (id: number, data: Partial<CreateMotoristaPayload>) =>
    apiPut<Motorista>(`/motoristas/${id}`, data),
  delete: (id: number) => apiDelete<void>(`/motoristas/${id}`),
};
