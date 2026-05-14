import { apiGet } from './client';

export interface Fornecedor {
  id: number;
  nome: string;
  cidade?: string;
  estado?: string;
}

export const fornecedoresApi = {
  list: () => apiGet<Fornecedor[]>('/fornecedores'),
};
