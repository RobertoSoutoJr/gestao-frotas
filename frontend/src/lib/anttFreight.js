/**
 * ANTT Freight Minimum Table
 * Based on ANTT Resolution 5.867/2020 (Piso Minimo do Frete)
 * Values in R$/km for loaded trips, by number of axles
 *
 * Carga Geral (seca/granel) — applicable to agricultural transport
 * Updated reference: Jan/2024 values (adjusted periodically by ANTT)
 *
 * Source: https://www.gov.br/antt/pt-br/assuntos/cargas/tabela-de-frete
 */

// R$/km by number of axles — carga lotação (granel/seca)
const COST_PER_KM = {
  2: 3.86,  // 2 eixos (toco)
  3: 4.38,  // 3 eixos (truck)
  4: 5.04,  // 4 eixos
  5: 5.55,  // 5 eixos (carreta)
  6: 5.99,  // 6 eixos (carreta LS)
  7: 7.10,  // 7 eixos (bitrem)
  9: 8.18,  // 9 eixos (rodotrem)
};

// Additional costs (per trip, fixed)
const ADDITIONAL = {
  carga_descarga: 380.00,   // carga/descarga granel por viagem
  pedagio_estimado_per_km: 0.12, // estimativa media de pedagio por km
};

/**
 * Calculate ANTT minimum freight for a trip
 * @param {number} distanciaKm - Distance in km
 * @param {number} eixos - Number of axles (2-9)
 * @param {number} [pesoTon] - Weight in tons (for validation)
 * @returns {{ minFreteTotal: number, minFretePorSaca: number, custoKm: number, details: object }}
 */
export function calcularPisoANTT(distanciaKm, eixos = 5, quantidadeSacas = 0) {
  const custoKm = COST_PER_KM[eixos] || COST_PER_KM[5];
  const freteDeslocamento = custoKm * distanciaKm;
  const cargaDescarga = ADDITIONAL.carga_descarga;
  const minFreteTotal = freteDeslocamento + cargaDescarga;
  const minFretePorSaca = quantidadeSacas > 0 ? minFreteTotal / quantidadeSacas : 0;

  return {
    minFreteTotal,
    minFretePorSaca,
    custoKm,
    eixos,
    distanciaKm,
    details: {
      deslocamento: freteDeslocamento,
      cargaDescarga,
    }
  };
}

/**
 * Validate if a freight value meets ANTT minimum
 * @param {number} valorFrete - Total freight value (R$)
 * @param {number} distanciaKm - Distance in km
 * @param {number} eixos - Number of axles
 * @returns {{ valid: boolean, minimo: number, diferenca: number, percentual: number }}
 */
export function validarFreteANTT(valorFrete, distanciaKm, eixos = 5, quantidadeSacas = 0) {
  if (!distanciaKm || distanciaKm <= 0) return { valid: true, minimo: 0, diferenca: 0, percentual: 0 };

  const { minFreteTotal } = calcularPisoANTT(distanciaKm, eixos, quantidadeSacas);
  const diferenca = valorFrete - minFreteTotal;
  const percentual = minFreteTotal > 0 ? ((valorFrete / minFreteTotal) - 1) * 100 : 0;

  return {
    valid: valorFrete >= minFreteTotal,
    minimo: minFreteTotal,
    diferenca,
    percentual,
  };
}

/**
 * Get available axle options for select inputs
 */
export function getEixosOptions() {
  return Object.entries(COST_PER_KM).map(([eixos, custo]) => ({
    value: Number(eixos),
    label: `${eixos} eixos — R$ ${custo.toFixed(2)}/km`,
    custo,
  }));
}

export { COST_PER_KM, ADDITIONAL };
