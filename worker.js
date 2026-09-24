/** Cloudflare Worker: serves the SPA and proxies product persistence to Supabase. */
const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
});

function sbHeaders(env, extra = {}) {
  return {
    apikey: env.SUPABASE_ANON_KEY,
    authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
    "content-type": "application/json",
    ...extra,
  };
}

async function sbRequest(env, path, init = {}) {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    return { ok: false, status: 500, error: "Supabase runtime variables are missing" };
  }
  const base = env.SUPABASE_URL.replace(/\/$/, "");
  const res = await fetch(`${base}/rest/v1/${path}`, {
    ...init,
    headers: sbHeaders(env, init.headers || {}),
  });
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  return res.ok ? { ok: true, status: res.status, data } : { ok: false, status: res.status, error: data || text };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/runtime-config.js") {
      const config = { SUPABASE_URL: env.SUPABASE_URL || "", SUPABASE_ANON_KEY: env.SUPABASE_ANON_KEY || "" };
      return new Response(`globalThis.__APP_CONFIG__ = ${JSON.stringify(config)};`, {
        headers: { "content-type": "application/javascript; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff" },
      });
    }

    if (url.pathname === "/api/health") {
      return json({
        ok: true,
        service: "taller-gregoria-cotizador",
        supabaseConfigured: Boolean(env.SUPABASE_URL && env.SUPABASE_ANON_KEY),
      });
    }

    if (url.pathname === "/api/productos" && request.method === "GET") {
      const r = await sbRequest(env, "productos?select=*&order=creado.desc");
      return r.ok ? json(r.data || []) : json({ ok: false, error: r.error }, r.status);
    }

    if (url.pathname === "/api/productos" && request.method === "PUT") {
      let lista;
      try { lista = await request.json(); } catch { return json({ ok: false, error: "JSON inválido" }, 400); }
      if (!Array.isArray(lista)) return json({ ok: false, error: "Se esperaba una lista de productos" }, 400);

      if (lista.length) {
        const ins = await sbRequest(env, "productos?on_conflict=id", {
          method: "POST",
          headers: { Prefer: "resolution=merge-duplicates,return=representation" },
          body: JSON.stringify(lista),
        });
        if (!ins.ok) return json({ ok: false, stage: "upsert", status: ins.status, error: ins.error }, ins.status);
        return json({ ok: true, count: lista.length, saved: Array.isArray(ins.data) ? ins.data.length : lista.length });
      }
      return json({ ok: true, count: 0, saved: 0 });
    }

    return env.ASSETS.fetch(request);
  },
};
