import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN,
});

const SITE = 'https://atualize-seus-dadosdil.vercel.app/'; // <-- troque pelo seu domínio

export default async function handler(req, res) {
  try {
    const xff = req.headers['x-forwarded-for'] || '';
    const ip = xff.split(',')[0].trim() || 'desconhecido';
    const origem = req.query.go || (req.body && req.body.utm) || '';

    const registro = {
      ip,
      cidade: req.headers['x-vercel-ip-city'] || '',
      regiao: req.headers['x-vercel-ip-country-region'] || '',
      pais: req.headers['x-vercel-ip-country'] || '',
      origem,
      referrer: req.headers['referer'] || '',
      userAgent: req.headers['user-agent'] || '',
      data: new Date().toISOString(),
    };

    await redis.incr('visitas:total');                       // contador geral
    if (origem) await redis.incr(`visitas:origem:${origem}`); // contador por origem
    await redis.lpush('visitas:log', registro);              // salva o registro
    await redis.ltrim('visitas:log', 0, 999);                // mantém os últimos 1000

    // Se o link do e-mail apontar direto pra cá (?go=email), redireciona pro site
    if (req.query.go) {
      res.setHeader('Location', SITE);
      return res.status(302).end();
    }
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ ok: false, erro: String(e) });
  }
}