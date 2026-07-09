const botao = document.querySelector('#btn-confirmar');
const mensagem = document.querySelector('#mensagem-confirmacao'); 

botao.addEventListener('click', () => {
    mensagem.hidden =  !mensagem.hidden;
    botao.disabled = true;
    botao.textContent = 'Obrigado!';
})  

const id = new URLSearchParams(location.search).get('id') || 'sem-id';

document.getElementById('btn-confirmar').addEventListener('click', () => {
  document.getElementById('mensagem-confirmacao').hidden = false;
  fetch('/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ evento: 'leu', id }),
    keepalive: true,
  }).catch(() => {});
});