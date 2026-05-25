/**
 * Preços médios de combustíveis por estado — fonte ANP (atualizado manualmente)
 * A ANP não oferece API pública, então mantemos dados de referência atualizados periodicamente.
 * Última atualização: Maio 2026 (semana 19/05 a 25/05)
 */
const PRECOS_REFERENCIA = {
  atualizado_em: '2026-05-25',
  fonte: 'ANP - Agência Nacional do Petróleo, Gás Natural e Biocombustíveis',
  combustiveis: {
    diesel_s10: {
      nome: 'Diesel S10',
      media_nacional: 6.15,
      por_estado: {
        AC: 6.89, AL: 6.28, AM: 6.45, AP: 6.52, BA: 6.18,
        CE: 6.12, DF: 6.05, ES: 5.98, GO: 5.95, MA: 6.35,
        MG: 6.08, MS: 6.02, MT: 5.92, PA: 6.42, PB: 6.22,
        PE: 6.15, PI: 6.30, PR: 5.88, RJ: 6.10, RN: 6.25,
        RO: 6.55, RR: 6.72, RS: 5.95, SC: 5.90, SE: 6.20,
        SP: 5.85, TO: 6.38,
      },
    },
    diesel_comum: {
      nome: 'Diesel Comum',
      media_nacional: 5.95,
      por_estado: {
        AC: 6.68, AL: 6.08, AM: 6.25, AP: 6.32, BA: 5.98,
        CE: 5.92, DF: 5.85, ES: 5.78, GO: 5.75, MA: 6.15,
        MG: 5.88, MS: 5.82, MT: 5.72, PA: 6.22, PB: 6.02,
        PE: 5.95, PI: 6.10, PR: 5.68, RJ: 5.90, RN: 6.05,
        RO: 6.35, RR: 6.52, RS: 5.75, SC: 5.70, SE: 6.00,
        SP: 5.65, TO: 6.18,
      },
    },
    gasolina: {
      nome: 'Gasolina Comum',
      media_nacional: 6.45,
      por_estado: {
        AC: 7.15, AL: 6.58, AM: 6.72, AP: 6.82, BA: 6.48,
        CE: 6.40, DF: 6.32, ES: 6.25, GO: 6.18, MA: 6.65,
        MG: 6.35, MS: 6.28, MT: 6.15, PA: 6.75, PB: 6.52,
        PE: 6.45, PI: 6.60, PR: 6.12, RJ: 6.38, RN: 6.55,
        RO: 6.85, RR: 7.02, RS: 6.20, SC: 6.15, SE: 6.50,
        SP: 6.08, TO: 6.68,
      },
    },
    etanol: {
      nome: 'Etanol',
      media_nacional: 4.25,
      por_estado: {
        AC: 5.10, AL: 4.48, AM: 4.65, AP: 4.80, BA: 4.35,
        CE: 4.30, DF: 4.18, ES: 4.10, GO: 3.85, MA: 4.55,
        MG: 4.15, MS: 3.92, MT: 3.88, PA: 4.70, PB: 4.42,
        PE: 4.38, PI: 4.50, PR: 4.05, RJ: 4.28, RN: 4.45,
        RO: 4.75, RR: 4.95, RS: 4.12, SC: 4.08, SE: 4.40,
        SP: 3.78, TO: 4.58,
      },
    },
  },
};

class AnpController {
  /** GET /anp/precos — retorna todos os preços de referência */
  getPrecos(req, res) {
    const { estado, combustivel } = req.query;

    // Filtrar por combustível específico
    if (combustivel) {
      const fuel = PRECOS_REFERENCIA.combustiveis[combustivel];
      if (!fuel) {
        return res.status(400).json({ error: `Combustível inválido. Use: ${Object.keys(PRECOS_REFERENCIA.combustiveis).join(', ')}` });
      }

      const result = {
        atualizado_em: PRECOS_REFERENCIA.atualizado_em,
        fonte: PRECOS_REFERENCIA.fonte,
        combustivel: fuel.nome,
        media_nacional: fuel.media_nacional,
      };

      if (estado) {
        const uf = estado.toUpperCase();
        result.estado = uf;
        result.preco_estado = fuel.por_estado[uf] || null;
      } else {
        result.por_estado = fuel.por_estado;
      }

      return res.json(result);
    }

    // Filtrar por estado
    if (estado) {
      const uf = estado.toUpperCase();
      const result = {
        atualizado_em: PRECOS_REFERENCIA.atualizado_em,
        fonte: PRECOS_REFERENCIA.fonte,
        estado: uf,
        precos: {},
      };

      for (const [key, fuel] of Object.entries(PRECOS_REFERENCIA.combustiveis)) {
        result.precos[key] = {
          nome: fuel.nome,
          media_nacional: fuel.media_nacional,
          preco_estado: fuel.por_estado[uf] || null,
        };
      }

      return res.json(result);
    }

    // Retornar tudo (só médias nacionais pra não ficar pesado)
    const resumo = {
      atualizado_em: PRECOS_REFERENCIA.atualizado_em,
      fonte: PRECOS_REFERENCIA.fonte,
      precos: {},
    };

    for (const [key, fuel] of Object.entries(PRECOS_REFERENCIA.combustiveis)) {
      resumo.precos[key] = {
        nome: fuel.nome,
        media_nacional: fuel.media_nacional,
      };
    }

    return res.json(resumo);
  }
}

module.exports = new AnpController();
