// Generic API envelope: backend always returns {success, data, message?}
export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
}

export type UserRole = 'admin' | 'motorista';

export interface User {
  id: number;
  nome: string;
  email: string;
  role: UserRole;
  motorista_id?: number | null;
  owner_id?: number | null;
  empresa?: string | null;
  telefone?: string | null;
  avatar_url?: string | null;
  is_active: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface Caminhao {
  id: number;
  user_id: number;
  placa: string;
  modelo: string;
  marca: string;
  ano_fabricacao?: number;
  km_atual?: number;
  numero_chassi?: string;
  numero_motor?: string;
  tipo_combustivel?: string;
  capacidade_carga?: number;
  observacoes?: string;
  foto_url?: string;
}

export interface Motorista {
  id: number;
  user_id: number;
  nome: string;
  cpf?: string;
  email?: string;
  telefone?: string;
  cnh?: string;
  categoria_cnh?: string;
  vencimento_cnh?: string;
}

export interface Abastecimento {
  id: number;
  user_id: number;
  caminhao_id: number;
  motorista_id?: number | null;
  litros: number;
  valor_total: number;
  km_registro?: number;
  posto?: string;
  created_at: string;
}

export interface Viagem {
  id: number;
  user_id: number;
  caminhao_id: number;
  motorista_id?: number | null;
  fornecedor_id?: number | null;
  cliente_id?: number | null;
  estoque_id?: number | null;
  status: 'cadastrada' | 'finalizada';
  produto?: string;
  quantidade_sacas?: number;
  preco_produto_saca?: number;
  preco_frete_saca?: number;
  valor_total_frete?: number;
  distancia_km?: number;
  data_viagem?: string;
  forma_pagamento?: string;
  observacoes?: string;
  lat_origem?: number | null;
  lng_origem?: number | null;
  lat_destino?: number | null;
  lng_destino?: number | null;
  custo_combustivel?: number;
  custo_pedagio?: number;
  custo_manutencao?: number;
  custo_outros?: number;
  created_at?: string;
}

export interface Manutencao {
  id: number;
  user_id: number;
  caminhao_id: number;
  tipo_manutencao: string;
  descricao?: string;
  valor_total: number;
  data_manutencao: string;
  km_manutencao?: number;
}
