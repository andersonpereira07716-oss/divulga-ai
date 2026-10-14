import re

with open('app.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Substituir fetch antigo pela rota absoluta correta da API
old_fetch = re.search(r'fetch\s*\(\s*[\'"`]([^\'"`]+)[\'"`]', content)
if old_fetch:
    print(f"Rota atual encontrada: {old_fetch.group(1)}")

# Atualizar a função gerarCopy para lidar com erros de texto/HTML de forma limpa
new_fetch_code = '''async function gerarCopy(canal) {
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
  textoDiv.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> A gerar copy com Gemini...';
  mockupDiv.innerHTML = 'A processar...';

  try {
    const response = await fetch('/api/gerar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ produto, canal })
    });

    const responseText = await response.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      throw new Error("O servidor retornou HTML/Texto em vez de JSON: " + responseText.substring(0, 100));
    }

    if (!response.ok) {
      throw new Error(data.error || 'Erro na API.');
    }

    const textoFinal = data.texto;
    textoDiv.innerText = textoFinal;
    mockupDiv.innerText = textoFinal;

    const carateres = textoFinal.length;
    const palavras = textoFinal.trim().split(/\\s+/).length;
    contador.innerText = `${carateres} carateres | ${palavras} palavras`;

    historico.unshift({ canal, produto: produto.nome, texto: textoFinal, data: new Date().toLocaleString() });
    salvarDados();

  } catch (error) {
    textoDiv.innerText = `Erro detalhado: ${error.message}`;
    mockupDiv.innerText = 'Falha na requisição.';
  }
}'''

# Se a função gerarCopy existir no app.js, vamos substituí-la ou adicioná-la
print("Atualizando app.js...")
