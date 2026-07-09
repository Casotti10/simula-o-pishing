import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN,
});

const SITE = 'https://seusite.com/'; // troque pelo seu domínio

export default async function handler(req, res) {
  try {
    const id = (req.query.id || (req.body && req.body.id) || 'sem-id').toString();
    const evento = (req.query.evento || (req.body && req.body.evento) || 'clique').toString();

    await redis.incr(`total:${evento}`);        // total de vezes
    await redis.sadd(`pessoas:${evento}`, id);   // quem fez, SEM repetir
    await redis.lpush('log', { id, evento, data: new Date().toISOString() });
    await redis.ltrim('log', 0, 999);

    if (req.method === 'GET') {                   // clique vindo do link do e-mail
      res.setHeader('Location', `${SITE}?id=${encodeURIComponent(id)}`);
      return res.status(302).end();
    }
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ ok: false, erro: String(e) });
  }
}