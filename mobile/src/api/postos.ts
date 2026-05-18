import { apiGet, apiPost, apiPut, apiDelete } from './client';

export interface Posto {
  id: number;
  user_id: number;
  nome: string;
  endereco?: string | null;
  telefone?: string | null;
  cnpj?: string | null;
  created_at?: string;
}

export interface CreatePostoPayload {
  nome: string;
  endereco?: string;
  telefone?: string;
  cnpj?: string;
}

export const postosApi = {
  list: () => apiGet<Posto[]>('/postos'),
  getById: (id: number) => apiGet<Posto>(`/postos/${id}`),
  create: (data: CreatePostoPayload) => apiPost<Posto>('/postos', data),
  update: (id: number, data: Partial<CreatePostoPayload>) =>
    apiPut<Posto>(`/postos/${id}`, data),
  delete: (id: number) => apiDelete<void>(`/postos/${id}`),
};
