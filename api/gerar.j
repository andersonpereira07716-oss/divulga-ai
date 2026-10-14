export default async function handler(req, res) {
  // Permitir apenas requisições POST
  if (req.method !== 'POST') {
    return res.status(405.0).json({ error: 'Método não permitido' });
  }

  const { produto, canal } = req.body;

  if (!produto || !canal) {
    return res.status(400).json({ error: 'Dados do produto ou canal em falta.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Chave da API Gemini não configurada no servidor.' });
  }

  const prompt = `Crie uma copy de marketing altamente persuasiva para o canal "${canal}", baseada no seguinte produto:
  - Nome: ${produto.nome}
  - Tipo: ${produto.tipo}
  - Descrição: ${produto.descricao}
  - Problema que resolve: ${produto.problema}
  - Público-alvo: ${produto.publico}
  - Benefício principal: ${produto.beneficio}
  - Link: ${produto.link}
  - WhatsApp: ${produto.whatsapp}
  - Preço: R$ ${produto.preco}

  A resposta deve ser focada em conversão, formatada adequadamente para ${canal} (com emojis e espaçamento ideal).`;

  try {
    // Usando o modelo Gemini oficial via REST API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Erro ao comunicar com a API do Gemini');
    }

    const textoGerado = data.candidates[0].content.parts[0].text;

    return res.status(200).json({ texto: textoGerado });
  } catch (error) {
    console.error('Erro no servidor:', error);
    return res.status(500).json({ error: error.message || 'Erro interno ao gerar conteúdo.' });
  }
}
