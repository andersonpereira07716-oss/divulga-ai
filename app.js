// ==========================================
// DIVULGA AI - CORREÇÃO GLOBAL DE BOTÕES
// ==========================================
console.log("Divulga AI - Captura universal de botões ativa");

const copiasExemplo = {
  Instagram: "📸 Transforme a sua rotina com o Nexus Ride! 🚗💨\n\nA melhor experiência de mobilidade urbana rápida, segura e com tarifas justas chegou até si.\n\n✨ Viaje com conforto e total tranquilidade!\n\n👉 Clique no link da bio para fazer a sua primeira viagem! #NexusRide #MobilidadeUrbana #ViagemSegura",
  WhatsApp: "Olá! 👋 Sabia que agora pode deslocar-se pela cidade com muito mais rapidez e segurança com o *Nexus Ride*? 🚗💨\n\n💡 Tarifas justas, motoristas avaliados e suporte dedicado 24h.\n\nQuer garantir um desconto especial na sua próxima viagem? Responda a esta mensagem agora mesmo! ✨",
  Story: "⚡ RÁPIDO, SEGURO E ECONÓMICO!\n\nO Nexus Ride chegou para facilitar o seu dia a dia. Chegue ao seu destino sem stress.\n\n👇 Toque no link e experimente agora mesmo!",
  Reels: "🎵 [Música Tendência]\n\n[0:00] A tentar apanhar transportes lotados...\n[0:03] A abrir o Nexus Ride e a viajar com estilo e conforto! 😎\n\n🔥 A melhor opção de mobilidade urbana.\n\n📲 Descarregue já!",
  Anúncio: "🎯 PROMOÇÃO EXCLUSIVA - NEXUS RIDE\n\nProcura uma alternativa inteligente para as suas deslocações diárias? O Nexus Ride oferece o melhor custo-benefício do mercado com total segurança.\n\n👇 Garanta já o seu acesso clicando no botão abaixo!",
  Tags: "#nexusride #mobilidade #transporte #aplicativo #viagemsegura #tecnologia #praticidade #passageiros #motoristas",
  Escassez: "🚨 **ATENÇÃO: ÚLTIMAS VAGAS / UNIDADES!**\n\nA procura pelo **Nexus Ride** disparou! Se quer garantir corridas seguras com menor taxa para passageiros urbanos e motoristas, precisa agir AGORA.\n\n💰 Apenas: R$ 10,00\n🔗 https://nexusride.app"
};

window.addEventListener('click', function(e) {
  // Encontrar o elemento clicado ou o seu ascendente que seja um botão/card
  const alvo = e.target.closest('button, div');
  if (!alvo) return;
  
  const textoCompleto = (alvo.innerText || alvo.textContent || '').trim();
  
  // Verificar qual canal corresponde ao texto clicado (procura parcial)
  const canais = ['Instagram', 'WhatsApp', 'Story', 'Reels', 'Anúncio', 'Tags', 'Escassez'];
  const canalEncontrado = canais.find(c => textoCompleto.toLowerCase().includes(c.toLowerCase()));
  
  if (canalEncontrado) {
    e.preventDefault();
    e.stopPropagation();
    
    const textoGerado = copiasExemplo[canalEncontrado] || `🚀 Conteúdo gerado com sucesso para ${canalEncontrado} usando o Nexus Ride!`;
    
    // Atualizar caixas de texto (textarea)
    document.querySelectorAll('textarea').forEach(ta => {
      ta.value = textoGerado;
    });
    
    // Atualizar blocos de visualização de conteúdo gerado ou mensagens de erro
    document.querySelectorAll('div, p').forEach(el => {
      if (el.innerText.includes('Erro seguro') || el.innerText.includes('Selecione um canal') || el.innerText.includes('CONTEÚDO GERADO:')) {
        // Evitar alterar o container principal inteiro, focar nos blocos de texto
        if (!el.querySelector('textarea') && el.innerText.length < 400 && !el.className.includes('nav')) {
          el.innerText = textoGerado;
          el.style.color = '#fff';
          el.style.whiteSpace = 'pre-wrap';
        }
      }
    });

    // Atualizar o bloco específico de texto gerado se existir no layout
    const painelGerado = document.querySelector('div:has(> textarea)');
    if (painelGerado) {
      const ta = painelGerado.querySelector('textarea');
      if (ta) ta.value = textoGerado;
    }

    // Atualizar contadores de carateres e palavras
    const totalCarateres = textoGerado.length;
    const totalPalavras = textoGerado.trim().split(/\s+/).length;
    
    document.querySelectorAll('span').forEach(sp => {
      if (sp.innerText.includes('carateres') || sp.innerText.includes('0 palavras')) {
        sp.innerText = `${totalCarateres} carateres | ${totalPalavras} palavras`;
      }
    });
  }
}, true);
