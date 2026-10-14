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

  try {
    const prompt = `Crie uma copy de marketing persuasiva para ${canal} sobre o produto ${produto.nome}, cujo benefício é ${produto.beneficio || produto.descricao}. Inclua emojis e CTA para ${produto.whatsapp || 'WhatsApp'}.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'Erro na API Gemini' });
    }

    const texto = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!texto) {
      return res.status(502).json({ error: 'A IA não devolveu texto.' });
    }
    return res.status(200).json({ texto });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
