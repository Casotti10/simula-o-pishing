//Procurando os elementos da pagina
const botao = document.querySelector('#btn-confirmar'); // busca o botão do DOM uma única vez
const mensagem = document.querySelector('#mensagem-confirmacao');  


// O GoPhish envia o identificador do destinatário na URL como ?rid=...
// Aceitamos 'rid' (GoPhish) ou 'id' (teste manual); se não vier nenhum, usamos 'sem-id'.
const params = new URLSearchParams(location.search);  //Pega as informações da URL
const id = params.get('rid') || params.get('id') || 'sem-id';

// Envia um evento para o nosso rastreador. É "best effort": se falhar, não trava a página.
//Para registrar alguma ação, basta chamar essa função
function rastrear(evento) {
  fetch('/api/track', {     //envia uma requisição http do metodo post e informando o formato em json
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ evento, id }),   //corpo da requisição
    keepalive: true,
  }).catch(() => {});  //tratamento de erros
}

// CLIQUE: a pessoa caiu na isca no instante em que a página abriu.
rastrear('clique');

// LEITURA: a pessoa confirmou que leu as orientações de conscientização.
botao.addEventListener('click', () => { //aguarda clique do usuario
  mensagem.hidden = false;    //
  botao.disabled = true;
  botao.textContent = 'Obrigado!';
  rastrear('leu');  //registrando a leitura
});
