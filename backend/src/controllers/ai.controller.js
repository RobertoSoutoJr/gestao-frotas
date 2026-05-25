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
      model: 'claude-sonnet-4-20250514',
      max_tokens: 200,
      messages: [{
        role: 'user',
        content: `Estime a distância rodoviária em km entre "${origem}" e "${destino}" no Brasil.
Responda APENAS com um JSON no formato: {"km": número, "rota": "descrição curta da rota principal", "tempo_estimado": "Xh XXmin"}
Se não souber, responda: {"km": 0, "rota": "desconhecido", "tempo_estimado": "N/A"}
Sem texto adicional, apenas o JSON.`
      }]
    });

    const text = message.content[0]?.text?.trim() || '';
    let parsed;
    try {
      // Extract JSON from response (handle potential markdown wrapping)
      const jsonMatch = text.match(/\{[^}]+\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);
    } catch {
      parsed = { km: 0, rota: 'Não foi possível estimar', tempo_estimado: 'N/A' };
    }

    const result = {
      origem,
      destino,
      km: Number(parsed.km) || 0,
      rota: parsed.rota || '',
      tempo_estimado: parsed.tempo_estimado || '',
    };

    // Cache result
    cache.set(cacheKey, { data: result, timestamp: Date.now() });

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
    res.status(500).json({ error: 'Falha ao estimar distância' });
  }
};
