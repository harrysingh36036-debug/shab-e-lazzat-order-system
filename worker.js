/**
 * Shab-E-Lazzat — Cloudflare Worker proxy
 *
 * The browser only ever sees THIS url. The real Apps Script /exec URL and
 * its token live in Worker secrets (env), never in the public repo.
 *
 * Deploy: https://dash.cloudflare.com → Workers & Pages → Create → paste this file.
 * Secrets ("Settings → Variables and Secrets" on the Worker):
 *   SHEETS_URL    = https://script.google.com/macros/s/.../exec   (your Apps Script)
 *   SHEETS_TOKEN  = the random token the script accepts (set via Script Properties)
 *   APP_PASSWORD  = long random password kept in the app Settings → Sync Password
 * Optional:
 *   ALLOWED_ORIGIN = e.g. https://youruser.github.io — blocks other sites calling it.
 */
export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(env, request) });
    }

    const pass = String(request.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
    if (!env.APP_PASSWORD || !safeEqual(pass, env.APP_PASSWORD)) {
      return json({ ok: false, error: 'Unauthorized' }, 403, request);
    }
    if (env.ALLOWED_ORIGIN && request.headers.get('Origin') !== env.ALLOWED_ORIGIN) {
      return json({ ok: false, error: 'Forbidden origin' }, 403, request);
    }

    let method, body = null;
    if (request.method === 'GET') {
      method = 'GET';
    } else {
      method = 'POST';
      const payload = await request.json().catch(() => ({}));
      body = JSON.stringify({ token: env.SHEETS_TOKEN, ...payload });
    }

    const upstreamUrl = env.SHEETS_URL + (method === 'GET' ? '?token=' + encodeURIComponent(env.SHEETS_TOKEN) : '');
    try {
      const res = await fetch(upstreamUrl, {
        method,
        headers: method === 'POST' ? { 'Content-Type': 'text/plain' } : {},
        body
      });
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch (_) { data = { ok: false, error: text.slice(0, 300) }; }
      return json(data, res.status, request);
    } catch (err) {
      return json({ ok: false, error: 'proxy: ' + err.message }, 502, request);
    }
  }
};

function safeEqual(a, b) {
  const ab = new TextEncoder().encode(String(a));
  const bb = new TextEncoder().encode(String(b));
  if (ab.length !== bb.length) return false;
  let diff = 0;
  for (let i = 0; i < ab.length; i++) diff |= ab[i] ^ bb[i];
  return diff === 0;
}

function corsHeaders(env, request) {
  const origin = env.ALLOWED_ORIGIN || (request.headers.get('Origin') || '*');
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Max-Age': '86400'
  };
}

function json(obj, status = 200, request = null) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...corsHeaders(undefined, request) }
  });
}