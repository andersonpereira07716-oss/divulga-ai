async function gerarCopy(canal) {
  const select = document.getElementById('select-produto');
  const produtoId = select ? select.value : null;
  const produto = produtos.find(p => p.id == produtoId);

  if (!produto) {
    alert('Selecione um produto válido primeiro!');
    return;
  }

  const container = document.getElementById('resultado-container');
  const textoDiv = document.getElementById('texto-gerado');
  const mockupDiv = document.getElementById('mockup-visual');
  const contador = document.getElementById('contador-metricas');

  container.classList.remove('hidden');
  textoDiv.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> A gerar copy inteligente...';
  mockupDiv.innerHTML = 'A processar pré-visualização...';

  let textoFinal = "";

  try {
    const response = await fetch('/api/gerar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ produto, canal })
    });
    const responseText = await response.text();
    let data;
    try { data = JSON.parse(responseText); }
    catch (e) { throw new Error("Resposta inválida do servidor."); }
    if (!response.ok) throw new Error(data.error || 'Erro na geração.');
    textoFinal = data.texto;
  } catch (err) {
    console.error('gerarCopy:', err);
    textoFinal = `🔥 *${String(produto.nome).toUpperCase()}* 🔥\n\n` +
                 `💡 O que resolve: ${produto.problema || produto.descricao || ''}\n` +
                 `🎯 Para quem é: ${produto.publico || ''}\n` +
                 `✨ Benefício principal: ${produto.beneficio || ''}\n\n` +
                 `🚀 Garanta já o seu por apenas R$ ${produto.preco || ''}!\n` +
                 `📲 Fale connosco no WhatsApp: wa.me/${produto.whatsapp || ''}\n\n` +
                 `#${canal} #DivulgaAi #${String(produto.tipo || '').replace(/\s+/g, '')}`;
  }

  textoDiv.innerText = textoFinal;
  mockupDiv.innerText = textoFinal;
  const carateres = textoFinal.length;
  const palavras = textoFinal.trim().split(/\s+/).length;
  contador.innerText = `${carateres} carateres | ${palavras} palavras`;

  historico.unshift({ canal, produto: produto.nome, texto: textoFinal, data: new Date().toLocaleString() });
  salvarDados();
}
