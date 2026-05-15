import { apiGet, apiPost } from './client';
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
};
