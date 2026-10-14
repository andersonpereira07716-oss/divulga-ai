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
  textoDiv.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> A gerar copy inteligente com Gemini...';
  mockupDiv.innerHTML = 'A processar pré-visualização...';

  try {
    const response = await fetch('/api/gerar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ produto, canal })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erro ao gerar conteúdo.');
    }

    const textoFinal = data.texto;
    textoDiv.innerText = textoFinal;
    mockupDiv.innerText = textoFinal;

    // Atualizar métricas de caracteres e palavras
    const carateres = textoFinal.length;
    const palavras = textoFinal.trim().split(/\s+/).length;
    contador.innerText = `${carateres} carateres | ${palavras} palavras`;

    // Guardar no histórico local
    historico.unshift({ canal, produto: produto.nome, texto: textoFinal, data: new Date().toLocaleString() });
    salvarDados();

  } catch (error) {
    textoDiv.innerText = `Erro: ${error.message}`;
    mockupDiv.innerText = 'Falha na geração.';
  }
}
