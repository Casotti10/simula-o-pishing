// Limpa TODO o historico de rastreio (cliques, leituras e log) do Redis.
// Use antes de lancar uma campanha nova, para o placar comecar do zero.
// ATENCAO: apaga de vez — nao da pra desfazer.
//
// Rodar (na raiz do projeto):
//   node --env-file=.env.local scripts/limpar-dados.mjs

import Redis from 'ioredis';

const { REDIS_URL } = process.env;
if (!REDIS_URL) { console.error('Falta REDIS_URL no .env.local'); process.exit(1); }

const CHAVES = ['total:clique', 'total:leu', 'pessoas:clique', 'pessoas:leu', 'log'];

const redis = new Redis(REDIS_URL);

// Mostra o que existe ANTES de apagar.
const antesClique = await redis.scard('pessoas:clique');
const antesLeu = await redis.scard('pessoas:leu');
console.log(`Antes: ${antesClique} pessoa(s) clicaram, ${antesLeu} leram.`);

const removidas = await redis.del(...CHAVES);
console.log(`Chaves apagadas: ${removidas}`);

const restantes = await redis.keys('*');
console.log('Banco agora:', restantes.length ? restantes : '(vazio — placar zerado)');

await redis.quit();
