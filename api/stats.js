import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  if (req.query.senha !== process.env.STATS_SENHA) {
    return res.status(401).json({ erro: 'nao autorizado' });
  }
  const total = await redis.get('visitas:total');
  const email = await redis.get('visitas:origem:email');
  const log = await redis.lrange('visitas:log', 0, 49); // últimos 50
  return res.status(200).json({
    total: total || 0,
    cliques_email: email || 0,
    ultimos: log.map((l) => (typeof l === 'string' ? JSON.parse(l) : l)),
  });
}