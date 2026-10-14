module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { produto, canal } = req.body || {};

  if (!produto || !canal) {
    return res.status(400).json({ error: 'Dados incompletos.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY não configurada nas variáveis de ambiente da Vercel.' });
  }

  try {
    const prompt = `Crie uma copy de marketing persuasiva e focada em conversão para o canal "${canal}" baseada no produto "${produto.nome}": ${produto.descricao || ''}. Utilize emojis e uma estrutura profissional.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'Erro ao comunicar com a API do Gemini' });
    }

    const texto = data.candidates[0].content.parts[0].text;
    return res.status(200).json({ texto });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
