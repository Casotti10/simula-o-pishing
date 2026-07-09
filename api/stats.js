import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  if (!process.env.STATS_SENHA || req.query.senha !== process.env.STATS_SENHA) {
    return res.status(401).json({ erro: 'nao autorizado' });
  }

  const totalCliques = await redis.get('total:clique');
  const totalLeu = await redis.get('total:leu');
  const pessoasClicaram = await redis.scard('pessoas:clique'); // únicas
  const pessoasLeram = await redis.scard('pessoas:leu');       // únicas
  const log = await redis.lrange('log', 0, 49);                // últimos 50 eventos

  return res.status(200).json({
    cliques_total: totalCliques || 0,
    cliques_pessoas_unicas: pessoasClicaram || 0,
    leram_total: totalLeu || 0,
    leram_pessoas_unicas: pessoasLeram || 0,
    ultimos_eventos: log.map((l) => (typeof l === 'string' ? JSON.parse(l) : l)),
  });
}