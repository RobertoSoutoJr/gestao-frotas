import { apiGet } from './client';

export interface Cliente {
  id: number;
  nome: string;
  cidade?: string;
  estado?: string;
}

export const clientesApi = {
  list: () => apiGet<Cliente[]>('/clientes'),
};
