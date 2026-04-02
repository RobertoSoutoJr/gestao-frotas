// SaaS plan definitions and limits
const PLANS = {
  free: {
    nome: 'Gratuito',
    preco: 0,
    limites: {
      caminhoes: 3,
      motoristas: 3,
      viagens_mes: 30,
      motorista_accounts: 1,
    },
    recursos: [
      'Ate 3 caminhoes',
      'Ate 3 motoristas',
      'Ate 30 viagens/mes',
      '1 conta de motorista',
      'Dashboard basico',
      'Relatorios simples',
    ],
  },
  pro: {
    nome: 'Profissional',
    preco: 49.90,
    limites: {
      caminhoes: 20,
      motoristas: 20,
      viagens_mes: 500,
      motorista_accounts: 10,
    },
    recursos: [
      'Ate 20 caminhoes',
      'Ate 20 motoristas',
      'Ate 500 viagens/mes',
      '10 contas de motorista',
      'Dashboard completo',
      'Relatorios avancados',
      'Exportacao PDF/Excel',
      'Suporte prioritario',
    ],
  },
  enterprise: {
    nome: 'Empresarial',
    preco: 149.90,
    limites: {
      caminhoes: -1, // ilimitado
      motoristas: -1,
      viagens_mes: -1,
      motorista_accounts: -1,
    },
    recursos: [
      'Caminhoes ilimitados',
      'Motoristas ilimitados',
      'Viagens ilimitadas',
      'Contas de motorista ilimitadas',
      'Dashboard completo',
      'Relatorios avancados',
      'Exportacao PDF/Excel',
      'API access',
      'Suporte dedicado',
    ],
  },
};

// Map table names to their plan limit keys
const TABLE_LIMIT_MAP = {
  caminhoes: 'caminhoes',
  motoristas: 'motoristas',
};

module.exports = { PLANS, TABLE_LIMIT_MAP };
