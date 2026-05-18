import { apiGet, apiPost, apiPut, apiDelete } from './client';

export interface Oficina {
  id: number;
  user_id: number;
  nome: string;
  endereco?: string | null;
  telefone?: string | null;
  cnpj?: string | null;
  created_at?: string;
}

export interface CreateOficinaPayload {
  nome: string;
  endereco?: string;
  telefone?: string;
  cnpj?: string;
}

export const oficinasApi = {
  list: () => apiGet<Oficina[]>('/oficinas'),
  getById: (id: number) => apiGet<Oficina>(`/oficinas/${id}`),
  create: (data: CreateOficinaPayload) => apiPost<Oficina>('/oficinas', data),
  update: (id: number, data: Partial<CreateOficinaPayload>) =>
    apiPut<Oficina>(`/oficinas/${id}`, data),
  delete: (id: number) => apiDelete<void>(`/oficinas/${id}`),
};
