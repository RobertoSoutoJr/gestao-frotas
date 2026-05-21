const { supabase } = require('../config/database');
const { asyncHandler } = require('../middlewares/errorHandler');

/**
 * GET /dashboard — consolidated endpoint that returns all dashboard data
 * in a single request with parallel Supabase queries.
 *
 * For motorista role: filters all data to their assigned truck/trips only,
 * and includes extra fields (truck details, active trip).
 */
exports.getDashboard = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const isMotorista = req.userRole === 'motorista';
  const caminhaoId = req.motoristaCaminhaoId;
  const motoristaId = req.motoristaId;

  if (isMotorista && caminhaoId) {
    // ─── MOTORISTA DASHBOARD ───
    const [
      caminhaoResult,
      abastecimentosResult,
      viagensResult,
      manutencoesResult,
    ] = await Promise.all([
      supabase
        .from('caminhoes')
        .select('id, placa, modelo, marca, km_atual, tipo_combustivel, capacidade_carga')
        .eq('id', caminhaoId)
        .eq('user_id', userId)
        .single(),
      supabase
        .from('abastecimentos')
        .select('id, caminhao_id, litros, valor_total, km_registro, created_at')
        .eq('user_id', userId)
        .eq('caminhao_id', caminhaoId)
        .order('created_at', { ascending: false })
        .limit(20),
      supabase
        .from('viagens')
        .select('id, motorista_id, status, distancia_km, valor_total_frete, custo_combustivel, custo_pedagio, custo_manutencao, custo_outros, data_viagem, produto, created_at, fornecedores(nome), clientes(nome), caminhoes(placa)')
        .eq('user_id', userId)
        .eq('motorista_id', motoristaId)
        .order('created_at', { ascending: false })
        .limit(20),
      supabase
        .from('manutencoes')
        .select('id, caminhao_id, status, tipo_manutencao, valor_total, data_manutencao, created_at')
        .eq('user_id', userId)
        .eq('caminhao_id', caminhaoId)
        .order('created_at', { ascending: false })
        .limit(20),
    ]);

    const viagens = viagensResult.data || [];
    const viagemAtiva = viagens.find(v => v.status === 'cadastrada') || null;

    res.json({
      success: true,
      data: {
        role: 'motorista',
        caminhao: caminhaoResult.data || null,
        viagemAtiva,
        caminhoes: caminhaoResult.data ? [caminhaoResult.data] : [],
        abastecimentos: abastecimentosResult.data || [],
        viagens,
        manutencoes: manutencoesResult.data || [],
        motoristas: [],
      },
    });
  } else {
    // ─── ADMIN DASHBOARD ───
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
        .select('id, caminhao_id, status, tipo_manutencao, valor_total, created_at')
        .eq('user_id', userId),
      supabase
        .from('motoristas')
        .select('id, nome')
        .eq('user_id', userId),
    ]);

    res.json({
      success: true,
      data: {
        role: 'admin',
        caminhoes: caminhoesResult.data || [],
        abastecimentos: abastecimentosResult.data || [],
        viagens: viagensResult.data || [],
        manutencoes: manutencoesResult.data || [],
        motoristas: motoristasResult.data || [],
      },
    });
  }
});
