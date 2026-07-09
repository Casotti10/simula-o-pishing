// Relatorio "quem clicou": cruza os rids que clicaram (Redis/Vercel)
// com os e-mails (GoPhish local). O cruzamento acontece SO na sua maquina —
// nenhum e-mail e enviado a servico externo.
//
// Como rodar (na raiz do projeto):
//   node --env-file=.env.local scripts/relatorio-cliques.mjs
//
// Precisa, no .env.local:
//   REDIS_URL=...            (ja existe)
//   GOPHISH_URL=https://localhost:3333
//   GOPHISH_API_KEY=<sua api key do gophish>
//   GOPHISH_CAMPAIGN_ID=<id da campanha>   (rode sem ela p/ listar as campanhas)

import Redis from 'ioredis';

// GoPhish usa HTTPS com certificado auto-assinado em localhost.
// Isso desliga a verificacao do certificado — seguro SO porque e localhost.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const {
  REDIS_URL,
  GOPHISH_URL = 'https://localhost:3333',
  GOPHISH_API_KEY,
  GOPHISH_CAMPAIGN_ID,
} = process.env;

if (!REDIS_URL) { console.error('Falta REDIS_URL no .env.local'); process.exit(1); }
if (!GOPHISH_API_KEY) { console.error('Falta GOPHISH_API_KEY no .env.local'); process.exit(1); }

// Chama a API do GoPhish, anexando a api_key na querystring.
async function gophish(caminho) {
  const sep = caminho.includes('?') ? '&' : '?';
  const res = await fetch(`${GOPHISH_URL}${caminho}${sep}api_key=${GOPHISH_API_KEY}`);
  if (!res.ok) throw new Error(`GoPhish ${caminho} respondeu HTTP ${res.status}`);
  return res.json();
}

async function main() {
  // Sem campanha definida: lista as disponiveis e encerra.
  if (!GOPHISH_CAMPAIGN_ID) {
    const campanhas = await gophish('/api/campaigns/');
    console.log('Defina GOPHISH_CAMPAIGN_ID no .env.local com um destes ids:');
    for (const c of campanhas) console.log(`  id=${c.id}   ${c.name}`);
    return;
  }

  // 1) Quem clicou / leu — direto do Redis (a fonte publica confiavel).
  const redis = new Redis(REDIS_URL);
  const clicaram = new Set(await redis.smembers('pessoas:clique'));
  const leram = new Set(await redis.smembers('pessoas:leu'));
  await redis.quit();

  // 2) Mapa rid -> pessoa, vindo do GoPhish (interno).
  const campanha = await gophish(`/api/campaigns/${GOPHISH_CAMPAIGN_ID}`);
  let resultados = campanha.results;
  // Algumas versoes so trazem os resultados no endpoint /results — tentamos ele como reserva.
  if (!resultados || resultados.length === 0) {
    const alt = await gophish(`/api/campaigns/${GOPHISH_CAMPAIGN_ID}/results`);
    resultados = alt.results || [];
  }
  const porRid = new Map();
  for (const r of resultados) {
    porRid.set(r.id, { email: r.email, nome: `${r.first_name || ''} ${r.last_name || ''}`.trim() });
  }

  // 3) Junta as duas pontas e imprime.
  console.log(`\nCampanha: ${campanha.name}`);
  console.log(`Clicaram: ${clicaram.size} pessoa(s)  |  Leram as orientacoes: ${leram.size}\n`);
  console.log('E-MAIL'.padEnd(34) + 'NOME'.padEnd(22) + 'CLICOU  LEU');
  console.log('-'.repeat(70));

  if (clicaram.size === 0) {
    console.log('(ninguem clicou ainda)');
    return;
  }
  for (const rid of clicaram) {
    const p = porRid.get(rid);
    const email = p ? p.email : `(rid ${rid} fora desta campanha)`;
    const nome = p ? p.nome : '';
    console.log(email.padEnd(34) + nome.padEnd(22) + '  X  ' + (leram.has(rid) ? '     X' : ''));
  }
}

main().catch((e) => {
  console.error('Erro:', e.message);
  // "fetch failed" esconde a causa real; aqui revelamos (ECONNREFUSED, cert, etc.)
  if (e.cause) console.error('Motivo:', e.cause.code || e.cause.message || e.cause);
  process.exit(1);
});
