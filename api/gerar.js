const FIXOS = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-2.5-flash'];
const BASE = 'https://generativelanguage.googleapis.com/v1beta';

async function descobrirModelos(apiKey) {
  const r = await fetch(`${BASE}/models?pageSize=200&key=${apiKey}`);
  const d = await r.json();
  if (!r.ok) throw new Error(d.error?.message || 'Falha ao listar modelos');
  return (d.models || [])
    .filter(m => (m.supportedGenerationMethods || []).includes('generateContent'))
    .map(m => m.name.replace('models/', ''))
    .filter(n => /flash/.test(n) && !/image|tts|live|audio|embed|robotics|computer/.test(n))
    .sort((a, b) => {
      const pa = /preview|exp/.test(a) ? 1 : 0;
      const pb = /preview|exp/.test(b) ? 1 : 0;
      if (pa !== pb) return pa - pb;
      return b.localeCompare(a, undefined, { numeric: true });
    });
}

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY não configurada na Vercel.' });
  }

  if (req.method === 'GET') {
    try {
      return res.status(200).json({ modelos: await descobrirModelos(apiKey) });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }
  const { produto, canal } = body || {};
  if (!produto || !canal) {
    return res.status(400).json({ error: 'Dados incompletos.' });
  }

  let descobertos = [];
  try { descobertos = await descobrirModelos(apiKey); } catch (e) {}
  const candidatos = [...new Set([process.env.GEMINI_MODEL, ...descobertos, ...FIXOS].filter(Boolean))].slice(0, 6);

  const prompt = `Escreva em português do Brasil uma copy de marketing persuasiva para ${canal} sobre o produto "${produto.nome}" (${produto.tipo || 'produto'}). Benefício: ${produto.beneficio || produto.descricao || 'não informado'}. Público: ${produto.publico || 'geral'}. Preço: R$ ${produto.preco || 'consulte'}. Inclua emojis e uma chamada para ação para o WhatsApp ${produto.whatsapp || ''}. Entregue apenas o texto final pronto para postar, sem introdução, sem comentários e sem placeholders entre colchetes.`;
  const erros = [];

  for (const modelo of candidatos) {
    try {
      const response = await fetch(`${BASE}/models/${modelo}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      const data = await response.json();
      if (!response.ok) {
        erros.push(`[${modelo}] ${response.status}: ${(data.error?.message || '').slice(0, 120)}`);
        continue;
      }
      const texto = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!texto) { erros.push(`[${modelo}] sem texto`); continue; }
      return res.status(200).json({ texto, modelo });
    } catch (err) {
      erros.push(`[${modelo}] ${err.message}`);
    }
  }
  return res.status(502).json({ error: erros.join(' | ') });
};
