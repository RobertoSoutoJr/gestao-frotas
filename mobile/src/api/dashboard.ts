import { apiGet } from './client';

export interface DashboardData {
  caminhoes: Array<{ id: number; placa: string; modelo: string; km_atual: number }>;
  abastecimentos: Array<{
    id: number;
    caminhao_id: number;
    motorista_id: number;
    litros: number;
    valor_total: number;
    km_registro: number;
    created_at: string;
  }>;
  viagens: Array<{
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
    created_at: string;
  }>;
  manutencoes: Array<{
    id: number;
    caminhao_id: number;
    status: string;
    tipo: string;
    custo: number;
    created_at: string;
  }>;
  motoristas: Array<{ id: number; nome: string }>;
}

export const dashboardApi = {
  getData: () => apiGet<DashboardData>('/dashboard'),
};
