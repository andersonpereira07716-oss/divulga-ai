export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    const { apiKey, produto, canal } = req.body;

    if (!produto) {
        return res.status(400).json({ error: 'Produto não informado' });
    }

    // Se houver chave de API válida, tenta usar o Gemini primeiro
    if (apiKey) {
        const modelosParaTentar = ['gemini-3.8-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];
        for (const modelo of modelosParaTentar) {
            try {
                let instrucaoCanal = '';
                if (canal === 'instagram') instrucaoCanal = 'Crie um post chamativo para o Instagram com título, texto persuasivo, benefícios, CTA e hashtags.';
                else if (canal === 'whatsapp') instrucaoCanal = 'Crie uma mensagem curta, direta e altamente persuasiva para envio via WhatsApp.';
                else if (canal === 'story') instrucaoCanal = 'Crie uma sequência simples de 3 Stories dividida em Story 1 (Gancho), Story 2 (Problema/Solução) e Story 3 (CTA).';
                else if (canal === 'reels') instrucaoCanal = 'Crie um roteiro de vídeo Reels de 30 segundos contendo gancho inicial, problema, solução, benefícios e chamada para ação.';
                else if (canal === 'anuncio') instrucaoCanal = 'Crie um anúncio profissional contendo título, texto principal, benefício e chamada para ação (CTA).';

                const prompt = `Você é um especialista sênior em marketing digital e copywriter. Com base nas informações abaixo do produto, gere o conteúdo solicitado.
                
                Informações do Produto:
                - Nome: ${produto.nome}
                - Tipo: ${produto.tipo}
                - Descrição: ${produto.descricao}
                - Problema que resolve: ${produto.problema}
                - Público-alvo: ${produto.publico}
                - Principal benefício: ${produto.beneficio}
                - Link: ${produto.link || 'Não informado'}
                - WhatsApp: ${produto.whatsapp || 'Não informado'}
                - Instagram: ${produto.instagram || 'Não informado'}
                - Preço: ${produto.preco || 'Não informado'}
                
                Tarefa: ${instrucaoCanal}
                Responda apenas com o texto final pronto para ser copiado, em português do Brasil, sem enrolação.`;

                const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${apiKey}`;
                const apiResponse = await fetch(geminiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
                });

                if (apiResponse.ok) {
                    const data = await apiResponse.json();
                    const textoGerado = data.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (textoGerado) {
                        return res.status(200).json({ texto: textoGerado });
                    }
                }
            } catch (e) {
                continue;
            }
        }
    }

    // GERADOR INTELIGENTE DE ALTA PERFORMANCE (Caso a cota esteja esgotada)
    const linkText = produto.link ? `🔗 **Aceda agora:** ${produto.link}` : '';
    const wppText = produto.whatsapp ? `📲 **WhatsApp:** ${produto.whatsapp}` : '';
    const precoText = produto.preco ? `💰 **Apenas:** ${produto.preco}` : '';

    let textoLocal = '';
    if (canal === 'instagram' || canal === 'anuncio') {
        textoLocal = `🚀 **${produto.nome}**\n\nCansado de ${produto.problema.toLowerCase()}? Chegou a solução definitiva que você precisava para transformar o seu dia a dia!\n\n✨ **Principais Benefícios:**\n- ${produto.beneficio}\n- Perfeito para ${produto.publico}.\n\n${precoText}\n\n${linkText}\n${wppText}\n\n#Inovação #Tecnologia #${produto.nome.replace(/\s+/g, '')}`;
    } else if (canal === 'whatsapp') {
        textoLocal = `Olá! Tudo bem? 😃\n\nSabia que o **${produto.nome}** resolve ${produto.problema.toLowerCase()} de forma rápida e prática?\n\nO principal destaque é ${produto.beneficio.toLowerCase()}. Ideal para ${produto.publico}!\n\n${precoText}\n${linkText}\n\nGaranta já o seu! 🔥`;
    } else if (canal === 'story') {
        textoLocal = `📱 **Story 1 (Gancho):**\n"Procurando uma forma eficiente para ${produto.problema.toLowerCase()}?"\n\n📱 **Story 2 (Solução):**\n"Conheça o ${produto.nome}! ${produto.beneficio}."\n\n📱 **Story 3 (CTA):**\n"Clica no link abaixo e aproveite agora mesmo!"\n${linkText}`;
    } else {
        textoLocal = `🎬 **Roteiro Reels (30s) - ${produto.nome}**\n\n[00:00] **Gancho:** "Se você é ${produto.publico}, você precisa saber disso!"\n[00:05] **Problema:** "Muitas pessoas sofrem com ${produto.problema.toLowerCase()}..."\n[00:15] **Solução:** "Mas com o ${produto.nome}, você garante ${produto.beneficio}."\n[00:25] **CTA:** "Acesse o link ou chame no WhatsApp e garanta o seu hoje!"\n\n${linkText}\n${wppText}`;
    }

    return res.status(200).json({ texto: textoLocal });
}
