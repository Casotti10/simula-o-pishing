const botao = document.querySelector('#btn-confirmar');
const mensagem = document.querySelector('#mensagem-confirmacao'); 

botao.addEventListener('click', () => {
    mensagem.hidden =  !mensagem.hidden;
    botao.disabled = true;
    botao.textContent = 'Obrigado!';
}) 