import { apiGet, apiPost } from './client';
import type { Manutencao } from './types';

export const MAINTENANCE_TYPES = [
  'Preventiva',
  'Corretiva',
  'Pneus',
  'Motor',
  'Freios',
  'Suspensão',
  'Elétrica',
  'Outros',
] as const;

export interface CreateManutencaoPayload {
  caminhao_id: number;
  descricao: string;
  tipo_manutencao: string;
  valor_total: number;
  km_manutencao?: number;
  data_manutencao?: string | null;
  oficina?: string | null;
  status?: 'pendente' | 'em_andamento' | 'concluida';
}

export const manutencoesApi = {
  list: () => apiGet<Manutencao[]>('/manutencoes'),
  getById: (id: number) => apiGet<Manutencao>(`/manutencoes/${id}`),
  create: (data: CreateManutencaoPayload) =>
    apiPost<Manutencao>('/manutencoes', data),
};
