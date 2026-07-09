import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

const SITE = 'https://atualize-seus-dadosdil.vercel.app/';

async function registrarEvento(id, evento) {
  try {
    await redis.incr(`total:${evento}`);
    await redis.sadd(`pessoas:${evento}`, id);
    await redis.lpush('log', JSON.stringify({ id, evento, data: new Date().toISOString() }));
    await redis.ltrim('log', 0, 999);
  } catch (e) {
    console.error('Falha ao registrar evento no Redis:', e);
  }
}

export default async function handler(req, res) {
  const id = (req.query.id || (req.body && req.body.id) || 'sem-id').toString();
  const evento = (req.query.evento || (req.body && req.body.evento) || 'clique').toString();

  await registrarEvento(id, evento);

  if (req.method === 'GET') {
    res.setHeader('Location', `${SITE}?id=${encodeURIComponent(id)}`);
    return res.status(302).end();
  }
  return res.status(200).json({ ok: true });
}
