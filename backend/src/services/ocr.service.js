const Anthropic = require('@anthropic-ai/sdk').default;
const { parseNfceFromImage } = require('../lib/nfce-parser');

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

const EXTRACTION_PROMPT = `Você é um sistema de OCR especializado em notas fiscais brasileiras de combustível (NFC-e / NF-e).

Analise esta imagem de cupom fiscal de abastecimento de combustível e extraia os dados em JSON.

Retorne APENAS o JSON, sem markdown, sem explicações:
{
  "litros": <number ou null>,
  "valor_litro": <number ou null>,
  "valor_total": <number ou null>,
  "tipo_combustivel": <string ou null - ex: "Diesel S10", "Gasolina Comum", "Etanol", "Gasolina Aditivada">,
  "posto_nome": <string ou null - nome do estabelecimento>,
  "posto_cnpj": <string ou null - CNPJ formatado XX.XXX.XXX/XXXX-XX>,
  "data_abastecimento": <string ou null - formato YYYY-MM-DD>,
  "placa_veiculo": <string ou null - se visível na nota>,
  "numero_nfce": <string ou null - número da NFC-e>,
  "chave_acesso": <string ou null - 44 dígitos>
}

Regras:
- Valores numéricos devem ser numbers (não strings). Ex: 45.23, não "45,23"
- Use ponto como separador decimal
- Se um campo não estiver visível ou legível, retorne null
- Para datas, converta para YYYY-MM-DD
- Considere que a nota pode estar torta, amassada ou com pouca luz
- CNPJ deve estar formatado com pontos, barra e traço
- Foque nos itens de combustível (ignore outros produtos se houver)`;

class OcrService {
  constructor() {
    this.client = ANTHROPIC_API_KEY
      ? new Anthropic({ apiKey: ANTHROPIC_API_KEY })
      : null;
  }

  /**
   * Extract fuel receipt data from an image using QR code + Claude Vision.
   * @param {Buffer} imageBuffer - Raw image bytes
   * @param {string} mimeType - e.g. 'image/jpeg'
   * @returns {{ extracted: object, confidence: number, method: string }}
   */
  async extractFuelReceipt(imageBuffer, mimeType) {
    // Step 1: Try QR code first (fast + reliable)
    let qrData = null;
    try {
      qrData = await parseNfceFromImage(imageBuffer);
    } catch (err) {
      console.warn('[ocr] QR parsing failed:', err.message);
    }

    // Step 2: Claude Vision OCR
    let ocrData = null;
    if (this.client) {
      ocrData = await this._callClaudeVision(imageBuffer, mimeType);
    } else {
      console.warn('[ocr] ANTHROPIC_API_KEY not set — skipping Claude Vision');
    }

    // Step 3: Merge results
    return this._mergeResults(qrData, ocrData);
  }

  async _callClaudeVision(imageBuffer, mimeType) {
    try {
      const base64 = imageBuffer.toString('base64');
      const mediaType = mimeType === 'image/jpg' ? 'image/jpeg' : mimeType;

      const response = await this.client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mediaType,
                  data: base64,
                },
              },
              {
                type: 'text',
                text: EXTRACTION_PROMPT,
              },
            ],
          },
        ],
      });

      const text = response.content[0]?.text?.trim();
      if (!text) return null;

      // Parse JSON from response (handle potential markdown wrapping)
      const jsonStr = text.replace(/^```json?\n?/, '').replace(/\n?```$/, '').trim();
      return JSON.parse(jsonStr);
    } catch (err) {
      console.error('[ocr] Claude Vision error:', err.message);
      return null;
    }
  }

  _mergeResults(qrData, ocrData) {
    if (!qrData && !ocrData) {
      return {
        extracted: null,
        confidence: 0,
        method: 'none',
        error: 'Não foi possível ler os dados do cupom fiscal',
      };
    }

    // Start with OCR data as base (has the detailed values)
    const extracted = {
      litros: ocrData?.litros ?? null,
      valor_litro: ocrData?.valor_litro ?? null,
      valor_total: ocrData?.valor_total ?? null,
      tipo_combustivel: ocrData?.tipo_combustivel ?? null,
      posto_nome: ocrData?.posto_nome ?? null,
      posto_cnpj: ocrData?.posto_cnpj ?? null,
      data_abastecimento: ocrData?.data_abastecimento ?? null,
      placa_veiculo: ocrData?.placa_veiculo ?? null,
      numero_nfce: ocrData?.numero_nfce ?? null,
      chave_acesso: ocrData?.chave_acesso ?? null,
    };

    // Override/enrich with QR data (more reliable for these fields)
    if (qrData) {
      extracted.chave_acesso = qrData.chave_acesso;
      extracted.numero_nfce = extracted.numero_nfce || qrData.numero_nfce;
      // Use QR CNPJ if OCR didn't get it
      if (!extracted.posto_cnpj && qrData.cnpj_emissor) {
        extracted.posto_cnpj = qrData.cnpj_emissor;
      }
    }

    // Calculate confidence
    let confidence = 0;
    const method = qrData && ocrData ? 'qr+vision' : qrData ? 'qr' : 'vision';

    if (ocrData) {
      // Count how many key fields were extracted
      const keyFields = ['litros', 'valor_total', 'tipo_combustivel', 'posto_nome'];
      const filled = keyFields.filter((f) => extracted[f] !== null).length;
      confidence = filled / keyFields.length; // 0 to 1

      // Boost if QR confirms data
      if (qrData) confidence = Math.min(confidence + 0.15, 1);

      // Validate: valor_total should roughly equal litros * valor_litro
      if (extracted.litros && extracted.valor_litro && extracted.valor_total) {
        const calc = extracted.litros * extracted.valor_litro;
        const diff = Math.abs(calc - extracted.valor_total);
        if (diff < 1) confidence = Math.min(confidence + 0.1, 1);
        else if (diff > 10) confidence = Math.max(confidence - 0.2, 0);
      }
    } else if (qrData) {
      // QR only — we have metadata but no values
      confidence = 0.3;
    }

    return {
      extracted,
      confidence: Math.round(confidence * 100) / 100,
      method,
    };
  }
}

module.exports = new OcrService();
