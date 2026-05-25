const Anthropic = require('@anthropic-ai/sdk');

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
let client = null;

function getClient() {
  if (!client && ANTHROPIC_API_KEY) {
    client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });
  }
  return client;
}

// Simple in-memory cache to avoid repeated API calls for same routes
const cache = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24h

exports.estimateDistance = async (req, res) => {
  try {
    const { origem, destino } = req.query;
    if (!origem || !destino) {
      return res.status(400).json({ error: 'Parâmetros origem e destino são obrigatórios' });
    }

    const cacheKey = `${origem.trim().toLowerCase()}->${destino.trim().toLowerCase()}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return res.json({ ...cached.data, cached: true });
    }

    const ai = getClient();
    if (!ai) {
      return res.status(503).json({ error: 'Serviço de IA não configurado (ANTHROPIC_API_KEY ausente)' });
    }

    const message = await ai.messages.create({
      model: 'claude-haiku-4-20250514',
      max_tokens: 100,
      messages: [{
        role: 'user',
        content: `Qual a distancia aproximada em KM da cidade ${origem} a cidade ${destino} por rodovia? Responda apenas o numero em KM, nada mais. Exemplo: 450`
      }]
    });

    const text = (message.content[0]?.text || '').trim();
    // Extract number from response
    const numMatch = text.match(/[\d.,]+/);
    let km = 0;
    if (numMatch) {
      km = Math.round(Number(numMatch[0].replace(/\./g, '').replace(',', '.')));
    }

    const result = {
      origem,
      destino,
      km,
    };

    // Cache result if valid
    if (km > 0) {
      cache.set(cacheKey, { data: result, timestamp: Date.now() });
    }

    // Cleanup old cache entries periodically
    if (cache.size > 500) {
      const now = Date.now();
      for (const [key, val] of cache) {
        if (now - val.timestamp > CACHE_TTL) cache.delete(key);
      }
    }

    res.json(result);
  } catch (err) {
    console.error('[ai] estimateDistance error:', err.message);
    res.status(500).json({ error: 'Falha ao estimar distância: ' + err.message });
  }
};
