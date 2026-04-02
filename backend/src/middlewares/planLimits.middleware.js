const { supabase } = require('../config/database');
const { PLANS, TABLE_LIMIT_MAP } = require('../config/plans');
const { AppError } = require('./errorHandler');

/**
 * Middleware factory: checks if user's plan allows creating more records in a table.
 * @param {string} table - Supabase table name (e.g. 'caminhoes', 'motoristas')
 */
function checkPlanLimit(table) {
  const limitKey = TABLE_LIMIT_MAP[table];
  if (!limitKey) {
    // No limit defined for this table — allow
    return (_req, _res, next) => next();
  }

  return async (req, res, next) => {
    try {
      // Get user's plan
      const { data: user } = await supabase
        .from('users')
        .select('plano')
        .eq('id', req.userId)
        .single();

      const plano = user?.plano || 'free';
      const plan = PLANS[plano];
      const limit = plan?.limites?.[limitKey];

      // -1 means unlimited
      if (!limit || limit === -1) return next();

      // Count current records
      const { count, error } = await supabase
        .from(table)
        .select('id', { count: 'exact', head: true })
        .eq('user_id', req.userId);

      if (error) return next();

      if (count >= limit) {
        throw new AppError(
          `Limite do plano ${plan.nome} atingido: maximo de ${limit} ${limitKey}. Faca upgrade para continuar.`,
          403
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Check monthly trip limit
 */
function checkTripLimit() {
  return async (req, res, next) => {
    try {
      const { data: user } = await supabase
        .from('users')
        .select('plano')
        .eq('id', req.userId)
        .single();

      const plano = user?.plano || 'free';
      const plan = PLANS[plano];
      const limit = plan?.limites?.viagens_mes;

      if (!limit || limit === -1) return next();

      // Count trips this month
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const { count, error } = await supabase
        .from('viagens')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', req.userId)
        .gte('created_at', firstDay);

      if (error) return next();

      if (count >= limit) {
        throw new AppError(
          `Limite mensal do plano ${plan.nome} atingido: maximo de ${limit} viagens/mes. Faca upgrade para continuar.`,
          403
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Check motorista accounts limit
 */
function checkMotoristaAccountLimit() {
  return async (req, res, next) => {
    try {
      const { data: user } = await supabase
        .from('users')
        .select('plano')
        .eq('id', req.userId)
        .single();

      const plano = user?.plano || 'free';
      const plan = PLANS[plano];
      const limit = plan?.limites?.motorista_accounts;

      if (!limit || limit === -1) return next();

      const { count, error } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .eq('owner_id', req.userId)
        .eq('role', 'motorista');

      if (error) return next();

      if (count >= limit) {
        throw new AppError(
          `Limite do plano ${plan.nome} atingido: maximo de ${limit} contas de motorista. Faca upgrade para continuar.`,
          403
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

module.exports = { checkPlanLimit, checkTripLimit, checkMotoristaAccountLimit };
