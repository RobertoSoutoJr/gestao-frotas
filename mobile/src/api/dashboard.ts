import { apiGet } from './client';

export interface DashboardCaminhao {
  id: number;
  placa: string;
  modelo: string;
  marca?: string;
  km_atual: number;
  tipo_combustivel?: string;
  capacidade_carga?: number;
}

export interface DashboardViagem {
  id: number;
  motorista_id: number;
  status: string;
  distancia_km: number;
  valor_total_frete: number;
  custo_combustivel: number;
  custo_pedagio: number;
  custo_manutencao: number;
  custo_outros: number;
  data_viagem: string;
  produto?: string;
  created_at: string;
  fornecedores?: { nome: string } | null;
  clientes?: { nome: string } | null;
  caminhoes?: { placa: string } | null;
}

export interface DashboardAbastecimento {
  id: number;
  caminhao_id: number;
  motorista_id?: number;
  litros: number;
  valor_total: number;
  km_registro: number;
  created_at: string;
}

export interface DashboardManutencao {
  id: number;
  caminhao_id: number;
  status: string;
  tipo_manutencao: string;
  valor_total: number;
  data_manutencao?: string;
  created_at: string;
}

export interface DashboardData {
  role: 'admin' | 'motorista';
  // Motorista-only fields
  caminhao?: DashboardCaminhao | null;
  viagemAtiva?: DashboardViagem | null;
  // Shared fields
  caminhoes: DashboardCaminhao[];
  abastecimentos: DashboardAbastecimento[];
  viagens: DashboardViagem[];
  manutencoes: DashboardManutencao[];
  motoristas: Array<{ id: number; nome: string }>;
}

export const dashboardApi = {
  getData: () => apiGet<DashboardData>('/dashboard'),
};
