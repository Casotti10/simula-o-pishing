const botao = document.querySelector('#btn-confirmar'); // busca o botão do DOM uma única vez
const mensagem = document.querySelector('#mensagem-confirmacao');

// O GoPhish envia o identificador do destinatário na URL como ?rid=...
// Aceitamos 'rid' (GoPhish) ou 'id' (teste manual); se não vier nenhum, usamos 'sem-id'.
const params = new URLSearchParams(location.search);
const id = params.get('rid') || params.get('id') || 'sem-id';

// Envia um evento para o nosso rastreador. É "best effort": se falhar, não trava a página.
function rastrear(evento) {
  fetch('/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ evento, id }),
    keepalive: true,
  }).catch(() => {});
}

// CLIQUE: a pessoa caiu na isca no instante em que a página abriu.
rastrear('clique');

// LEITURA: a pessoa confirmou que leu as orientações de conscientização.
botao.addEventListener('click', () => {
  mensagem.hidden = false;
  botao.disabled = true;
  botao.textContent = 'Obrigado!';
  rastrear('leu');
});
