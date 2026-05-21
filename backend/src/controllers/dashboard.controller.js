const { supabase } = require('../config/database');
const { asyncHandler } = require('../middlewares/errorHandler');

/**
 * GET /dashboard — consolidated endpoint that returns all dashboard data
 * in a single request with parallel Supabase queries.
 */
exports.getDashboard = asyncHandler(async (req, res) => {
  const userId = req.userId;

  // Run ALL queries in parallel
  const [
    caminhoesResult,
    abastecimentosResult,
    viagensResult,
    manutencoesResult,
    motoristasResult,
  ] = await Promise.all([
    supabase
      .from('caminhoes')
      .select('id, placa, modelo, km_atual')
      .eq('user_id', userId),
    supabase
      .from('abastecimentos')
      .select('id, caminhao_id, motorista_id, litros, valor_total, km_registro, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
    supabase
      .from('viagens')
      .select('id, motorista_id, status, distancia_km, valor_total_frete, custo_combustivel, custo_pedagio, custo_manutencao, custo_outros, data_viagem, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
    supabase
      .from('manutencoes')
      .select('id, caminhao_id, status, tipo, custo, created_at')
      .eq('user_id', userId),
    supabase
      .from('motoristas')
      .select('id, nome')
      .eq('user_id', userId),
  ]);

  res.json({
    success: true,
    data: {
      caminhoes: caminhoesResult.data || [],
      abastecimentos: abastecimentosResult.data || [],
      viagens: viagensResult.data || [],
      manutencoes: manutencoesResult.data || [],
      motoristas: motoristasResult.data || [],
    },
  });
});
