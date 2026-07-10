// Elementos da tela de senha
const areaLogin = document.querySelector('#area-login');
const formLogin = document.querySelector('#form-login');
const inputSenha = document.querySelector('#senha');
const erroLogin = document.querySelector('#erro-login');

// Elementos do painel
const painel = document.querySelector('#painel');
const btnAtualizar = document.querySelector('#btn-atualizar');

// Guardamos a senha só durante esta aba do navegador (some ao fechar).
// Serve para o botão "Atualizar" funcionar sem redigitar a senha.
let senhaAtual = sessionStorage.getItem('stats_senha') || '';

// Busca os dados no back-end. Lança erro se a senha estiver errada.
async function buscarDados(senha) {
  const resp = await fetch(`/api/stats?senha=${encodeURIComponent(senha)}`);
  if (resp.status === 401) throw new Error('Senha incorreta.');
  if (!resp.ok) throw new Error(`Erro ${resp.status} ao buscar os dados.`);
  return resp.json();
}

// Joga os números recebidos na tela.
function preencher(dados) {
  document.querySelector('#cliques-unicas').textContent = dados.cliques_pessoas_unicas;
  document.querySelector('#leram-unicas').textContent = dados.leram_pessoas_unicas;
  document.querySelector('#cliques-total').textContent = dados.cliques_total;
  document.querySelector('#leram-total').textContent = dados.leram_total;

  // Taxa de leitura = das pessoas que clicaram, quantas leram as orientações.
  const clicaram = dados.cliques_pessoas_unicas || 0;
  const leram = dados.leram_pessoas_unicas || 0;
  const taxa = clicaram === 0 ? 0 : Math.round((leram / clicaram) * 100);
  document.querySelector('#taxa-num').textContent = `${taxa}%`;
  document.querySelector('#barra-cliques').style.width = '100%';
  document.querySelector('#barra-leram').style.width = `${taxa}%`;

  // Últimos eventos. Usamos textContent (não innerHTML) porque o 'id' vem
  // de fora e não deve ser interpretado como HTML — isso evita XSS.
  const corpo = document.querySelector('#eventos');
  corpo.innerHTML = '';
  for (const ev of dados.ultimos_eventos) {
    const linha = document.createElement('tr');
    const dataFormatada = new Date(ev.data).toLocaleString('pt-BR');
    for (const valor of [dataFormatada, ev.evento, ev.id]) {
      const celula = document.createElement('td');
      celula.textContent = valor;
      linha.appendChild(celula);
    }
    corpo.appendChild(linha);
  }
}

// Fluxo completo: busca, preenche e troca a tela de senha pelo painel.
async function entrar(senha) {
  const dados = await buscarDados(senha);
  preencher(dados);
  areaLogin.hidden = true;
  painel.hidden = false;
  senhaAtual = senha;
  sessionStorage.setItem('stats_senha', senha);
}

// Enviar o formulário de senha.
formLogin.addEventListener('submit', async (evento) => {
  evento.preventDefault(); // impede o recarregamento padrão da página
  erroLogin.hidden = true;
  try {
    await entrar(inputSenha.value);
  } catch (err) {
    erroLogin.textContent = err.message;
    erroLogin.hidden = false;
  }
});

// Botão atualizar: rebusca com a senha já guardada.
btnAtualizar.addEventListener('click', async () => {
  try {
    preencher(await buscarDados(senhaAtual));
  } catch {
    // Se a senha não vale mais, volta para a tela de login.
    sessionStorage.removeItem('stats_senha');
    painel.hidden = true;
    areaLogin.hidden = false;
  }
});

// Se já entramos antes nesta aba, tenta abrir o painel direto.
if (senhaAtual) {
  entrar(senhaAtual).catch(() => sessionStorage.removeItem('stats_senha'));
}
