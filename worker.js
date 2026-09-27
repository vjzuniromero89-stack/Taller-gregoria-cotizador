/** Cloudflare Worker: serves the SPA and proxies product persistence to Supabase. */
const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
});

function sbHeaders(env, extra = {}) {
  return {
    apikey: env.SUPABASE_ANON_KEY,
    ...(env.SUPABASE_ANON_KEY.startsWith("sb_publishable_") ? {} : { authorization: `Bearer ${env.SUPABASE_ANON_KEY}` }),
    "content-type": "application/json",
    ...extra,
  };
}

async function sbRequest(env, path, init = {}) {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    const missing = ["SUPABASE_URL", "SUPABASE_ANON_KEY"].filter(name => !env[name]);
    return { ok: false, status: 503, error: `Falta configurar ${missing.join(" y ")} en Cloudflare → Settings → Runtime variables and secrets. Guarda y vuelve a desplegar.` };
  }
  const base = env.SUPABASE_URL.replace(/\/$/, "");
  let res;
  try {
    res = await fetch(`${base}/rest/v1/${path}`, {
    ...init,
    headers: sbHeaders(env, init.headers || {}),
  });
  } catch {
    return { ok: false, status: 502, error: "No se pudo conectar con Supabase. Comprueba SUPABASE_URL y que el proyecto esté activo." };
  }
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
      const result = await sbRequest(env, "productos?select=id&limit=1");
      return json({
        ok: result.ok,
        service: "taller-gregoria-cotizador",
        supabaseConfigured: Boolean(env.SUPABASE_URL && env.SUPABASE_ANON_KEY),
        productosReadable: result.ok,
        ...(result.ok ? {} : { error: result.error }),
      }, result.ok ? 200 : result.status);
    }

    if (url.pathname === "/api/catalogo" && request.method === "GET") {
      const productos = [];
      // Stable ordering and pagination avoid truncating large catalogs.
      for (let offset = 0; ; ) {
        const r = await sbRequest(env, `productos?select=id,codigo,nombre,descripcion,categoria,cbm,peso,precio_producto,foto&order=creado.desc,id.asc&limit=500&offset=${offset}`);
        if (!r.ok) return json({ ok: false, error: "El catálogo no está disponible temporalmente." }, 503);
        if (!Array.isArray(r.data)) return json({ ok: false, error: "Respuesta de catálogo inválida." }, 502);
        if (!r.data.length) break;
        productos.push(...r.data.map(({ id, codigo, nombre, descripcion, categoria, cbm, peso, precio_producto, foto }) => ({ id, codigo, nombre, descripcion, categoria, cbm, peso, precio_producto, foto })));
        offset += r.data.length;
      }
      return json(productos);
    }

    if (url.pathname === "/api/productos" && request.method === "GET") {
      const r = await sbRequest(env, "productos?select=*&order=creado.desc");
      return r.ok ? json(r.data || []) : json({ ok: false, error: r.error }, r.status);
    }

    if (url.pathname === "/api/productos" && request.method === "DELETE") {
      const id = url.searchParams.get("id");
      if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) return json({ ok: false, error: "ID de producto inválido" }, 400);
      const result = await sbRequest(env, `productos?id=eq.${encodeURIComponent(id)}&select=id`, {
        method: "DELETE",
        headers: { Prefer: "return=representation" },
      });
      if (!result.ok) return json({ ok: false, error: result.error }, result.status);
      if (!Array.isArray(result.data) || !result.data.some(row => row.id === id)) {
        return json({ ok: false, error: "No se eliminó el producto. Puede que ya no exista o que falten permisos SELECT/DELETE en Supabase." }, 409);
      }
      return json({ ok: true, deleted: id });
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
