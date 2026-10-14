const MODELOS = [
  process.env.GEMINI_MODEL,
  'gemini-3.8-flash',
  'gemini-flash-latest',
  'gemini-2.5-flash'
].filter(Boolean);

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

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

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY não configurada na Vercel.' });
  }

  const prompt = `Crie uma copy de marketing persuasiva para ${canal} sobre o produto ${produto.nome}, cujo benefício é ${produto.beneficio || produto.descricao}. Inclua emojis e CTA para ${produto.whatsapp || 'WhatsApp'}.`;
  let ultimoErro = 'Erro desconhecido';

  for (const modelo of MODELOS) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      const data = await response.json();

      if (!response.ok) {
        ultimoErro = `[${modelo}] ` + (data.error?.message || 'Erro na API Gemini');
        if (response.status === 404 || response.status === 429 || response.status >= 500) continue;
        return res.status(response.status).json({ error: ultimoErro });
      }

      const texto = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!texto) {
        ultimoErro = `[${modelo}] A IA não devolveu texto.`;
        continue;
      }
      return res.status(200).json({ texto, modelo });
    } catch (err) {
      ultimoErro = `[${modelo}] ${err.message}`;
    }
  }
  return res.status(502).json({ error: ultimoErro });
};
