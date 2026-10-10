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

const KG_POR_CBM = 350;
const MINIMO_CBM = 1; // el transporte cobra como mínimo 1 CBM por cada máquina
const texto = (valor, maximo) => String(valor ?? "").replace(/\s+/g, " ").trim().slice(0, maximo);

/** Lo que el cliente puede ver de su cotización: nunca costos ni flete. */
function cotizacionPublica(fila) {
  const contacto = fila.totales?.contacto || {};
  return {
    id: fila.id, numero: fila.numero, fecha: fila.fecha, cliente: fila.cliente || "",
    telefono: contacto.telefono || "", direccion: contacto.direccion || "", nota: contacto.nota || "", total: Number(fila.total_final) || 0,
    lineas: (Array.isArray(fila.lineas) ? fila.lineas : []).map((l) => ({
      codigo: l.codigo, nombre: l.nombre, cantidad: Number(l.cantidad) || 0, precio: Number(l.precioVenta) || 0, foto: l.foto || "",
    })),
  };
}

const CATALOGOS = {
  "/api/catalogo": ["id", "codigo", "nombre", "descripcion", "categoria", "peso", "precio_venta", "foto"],
  "/api/catalogo-interno": ["id", "codigo", "nombre", "descripcion", "categoria", "cbm", "peso", "precio_cbm", "precio_producto", "precio_venta", "foto"],
};

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

    // WhatsApp del taller, para que el catálogo de clientes pueda enviarle cotizaciones.
    if (url.pathname === "/api/contacto" && request.method === "GET") {
      const r = await sbRequest(env, "configuracion?clave=eq.empresa&select=valor&limit=1");
      const valor = r.ok && Array.isArray(r.data) && r.data[0]?.valor && typeof r.data[0].valor === "object" ? r.data[0].valor : {};
      return json({
        nombre: String(valor.nombre || ""), contacto: String(valor.contacto || ""), logo: String(valor.logo || ""),
        whatsapp: String(valor.whatsapp || "").replace(/\D/g, ""),
      });
    }

    // El cliente envía su cotización desde el catálogo: se registra con precios tomados de la base de datos.
    if (url.pathname === "/api/solicitudes" && request.method === "POST") {
      let cuerpo;
      try { cuerpo = await request.json(); } catch { return json({ ok: false, error: "JSON inválido" }, 400); }
      const nombre = texto(cuerpo?.nombre, 80), telefono = texto(cuerpo?.telefono, 30), nota = texto(cuerpo?.nota, 300);
      const direccion = texto(cuerpo?.direccion, 160);
      const pedidas = new Map();
      for (const l of Array.isArray(cuerpo?.lineas) ? cuerpo.lineas.slice(0, 40) : []) {
        const codigo = texto(l?.codigo, 60).replace(/["\\]/g, ""), cantidad = Math.floor(Number(l?.cantidad));
        if (codigo && cantidad >= 1) pedidas.set(codigo, Math.min(99, cantidad));
      }
      if (!nombre || telefono.replace(/\D/g, "").length < 8 || !pedidas.size) {
        return json({ ok: false, error: "Faltan el nombre, el teléfono o los equipos." }, 400);
      }
      const codigos = [...pedidas.keys()].map((c) => `"${c}"`).join(",");
      const prod = await sbRequest(env, `productos?select=id,codigo,nombre,cbm,peso,precio_cbm,precio_producto,precio_venta,foto&codigo=in.(${encodeURIComponent(codigos)})`);
      if (!prod.ok || !Array.isArray(prod.data)) return json({ ok: false, error: "No se pudo registrar la cotización." }, 503);
      const lineas = [];
      for (const [codigo, cantidad] of pedidas) {
        const p = prod.data.find((x) => x.codigo === codigo);
        if (p) lineas.push({
          id: crypto.randomUUID(), productId: p.id, codigo: p.codigo, nombre: p.nombre, foto: p.foto || "",
          cbm: Number(p.cbm) || 0, peso: Number(p.peso) || 0, minimoCbm: MINIMO_CBM, precioCbm: Number(p.precio_cbm) || 0,
          precioProducto: Number(p.precio_producto) || 0, precioVenta: Number(p.precio_venta) || 0, cantidad,
        });
      }
      if (!lineas.length) return json({ ok: false, error: "Esos equipos ya no están en el catálogo." }, 400);

      const ultima = await sbRequest(env, "cotizaciones_clientes?select=numero&numero=like.WEB-*&order=numero.desc&limit=1");
      if (!ultima.ok) return json({ ok: false, error: "No se pudo registrar la cotización." }, 503);
      const siguiente = (parseInt(String(ultima.data?.[0]?.numero || "").split("-")[1], 10) || 0) + 1;
      const t = { totalCantidad: 0, totalCbm: 0, totalPeso: 0, totalProducto: 0, totalCosto: 0, totalFlete: 0, totalVenta: 0 };
      for (const l of lineas) {
        const cobrable = Math.max(l.cbm, l.peso / KG_POR_CBM, MINIMO_CBM);
        t.totalCantidad += l.cantidad; t.totalCbm += cobrable * l.cantidad; t.totalPeso += l.peso * l.cantidad;
        t.totalProducto += l.precioProducto * l.cantidad; t.totalFlete += cobrable * l.precioCbm * l.cantidad;
        t.totalVenta += l.precioVenta * l.cantidad;
      }
      t.totalCosto = t.totalProducto + t.totalFlete;
      t.ganancia = t.totalVenta - t.totalCosto;
      t.margen = t.totalVenta > 0 ? t.ganancia / t.totalVenta : 0;
      const fila = {
        id: crypto.randomUUID(), numero: `WEB-${String(siguiente).padStart(4, "0")}`, fecha: new Date().toISOString(), cliente: nombre,
        descuento: 0, descuento_monto: 0, total_final: t.totalVenta, lineas,
        totales: { ...t, contacto: { telefono, direccion, nota, origen: "catalogo" } },
      };
      const guardada = await sbRequest(env, "cotizaciones_clientes", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify(fila) });
      if (!guardada.ok) return json({ ok: false, error: "No se pudo registrar la cotización." }, 503);
      return json({ ok: true, cotizacion: cotizacionPublica(fila) }, 201);
    }

    // Una cotización enviada desde el catálogo, sin costos, para verla con su enlace.
    const idSolicitud = request.method === "GET" && url.pathname.match(/^\/api\/solicitudes\/([0-9a-f-]{36})$/)?.[1];
    if (idSolicitud) {
      const r = await sbRequest(env, `cotizaciones_clientes?id=eq.${idSolicitud}&select=id,numero,fecha,cliente,total_final,lineas,totales&limit=1`);
      if (!r.ok) return json({ ok: false, error: "No se pudo cargar la cotización." }, 503);
      const fila = Array.isArray(r.data) ? r.data[0] : null;
      if (!fila || fila.totales?.contacto?.origen !== "catalogo") return json({ ok: false, error: "No existe." }, 404);
      return json({ ok: true, cotizacion: cotizacionPublica(fila) });
    }

    // Catálogo para clientes: solo precio de venta, nunca costos. Catálogo interno: costos, flete y CBM.
    const campos = request.method === "GET" && CATALOGOS[url.pathname];
    if (campos) {
      const productos = [];
      // Stable ordering and pagination avoid truncating large catalogs.
      for (let offset = 0; ; ) {
        const r = await sbRequest(env, `productos?select=${campos.join(",")}&order=creado.desc,id.asc&limit=500&offset=${offset}`);
        if (!r.ok) return json({ ok: false, error: "El catálogo no está disponible temporalmente." }, 503);
        if (!Array.isArray(r.data)) return json({ ok: false, error: "Respuesta de catálogo inválida." }, 502);
        if (!r.data.length) break;
        productos.push(...r.data.map((fila) => Object.fromEntries(campos.map((campo) => [campo, fila[campo]]))));
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
