const { AppError } = require('../middlewares/errorHandler');

const FIPE_BASE = 'https://parallelum.com.br/fipe/api/v1';
const VEHICLE_TYPE = 'caminhoes';

// Simple in-memory cache (5 min TTL)
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

async function cachedFetch(url) {
  const now = Date.now();
  const cached = cache.get(url);
  if (cached && now - cached.ts < CACHE_TTL) return cached.data;

  const res = await fetch(url);
  if (!res.ok) {
    throw new AppError(`Erro ao consultar FIPE: ${res.status}`, 502);
  }
  const data = await res.json();
  cache.set(url, { data, ts: now });
  return data;
}

class FipeService {
  /** Lista todas as marcas de caminhões */
  async getMarcas() {
    return cachedFetch(`${FIPE_BASE}/${VEHICLE_TYPE}/marcas`);
  }

  /** Lista modelos de uma marca */
  async getModelos(marcaCodigo) {
    const result = await cachedFetch(`${FIPE_BASE}/${VEHICLE_TYPE}/marcas/${marcaCodigo}/modelos`);
    return result.modelos || result;
  }

  /** Lista anos disponíveis de um modelo */
  async getAnos(marcaCodigo, modeloCodigo) {
    return cachedFetch(`${FIPE_BASE}/${VEHICLE_TYPE}/marcas/${marcaCodigo}/modelos/${modeloCodigo}/anos`);
  }

  /** Consulta preço FIPE de um veículo específico */
  async getPreco(marcaCodigo, modeloCodigo, anoCodigo) {
    return cachedFetch(
      `${FIPE_BASE}/${VEHICLE_TYPE}/marcas/${marcaCodigo}/modelos/${modeloCodigo}/anos/${anoCodigo}`
    );
  }
}

module.exports = new FipeService();
