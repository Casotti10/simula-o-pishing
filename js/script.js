const botao = document.querySelector('#btn-confirmar'); //busca botao do dom uma unica vez e guarda referencia
const mensagem = document.querySelector('#mensagem-confirmacao'); //
const id = new URLSearchParams(location.search).get('id') || 'sem-id';

botao.addEventListener('click', () => {
  mensagem.hidden = false;
  botao.disabled = true;
  botao.textContent = 'Obrigado!';

  fetch('/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ evento: 'leu', id }),
    keepalive: true,
  }).catch(() => {});
});
