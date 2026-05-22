/**
 * Server-side pagination helper for Supabase queries.
 *
 * Usage in a service:
 *   const { paginate, parsePagination } = require('../lib/pagination');
 *   async getAll(userId, query) {
 *     const { page, limit } = parsePagination(query);
 *     let q = supabase.from('table').select('*', { count: 'exact' }).eq('user_id', userId);
 *     return paginate(q, page, limit);
 *   }
 *
 * Returns: { data: [...], pagination: { page, limit, total, totalPages } }
 */

function parsePagination(query = {}) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 50));
  return { page, limit };
}

async function paginate(query, page, limit) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await query.range(from, to);

  if (error) throw error;

  const total = count ?? 0;
  const totalPages = Math.ceil(total / limit);

  return {
    data: data || [],
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}

module.exports = { parsePagination, paginate };
