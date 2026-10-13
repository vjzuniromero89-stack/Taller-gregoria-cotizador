/** API (se ejecuta en Vercel desde api/index.js): proxies product persistence to Supabase. */
const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
});

// Con "token" la consulta se hace como el usuario que entró (parte interna).
// Sin él, la hace la página pública, que se identifica ante la base con su propia clave.
function sbHeaders(env, extra = {}, token = "") {
  const acceso = token
    ? { authorization: `Bearer ${token}` }
    : {
      ...(env.SUPABASE_ANON_KEY.startsWith("sb_publishable_") ? {} : { authorization: `Bearer ${env.SUPABASE_ANON_KEY}` }),
      ...(env.EVK_CLAVE_SERVICIO ? { "x-evk-clave": env.EVK_CLAVE_SERVICIO } : {}),
    };
  return { apikey: env.SUPABASE_ANON_KEY, ...acceso, "content-type": "application/json", ...extra };
}

async function sbRequest(env, path, init = {}, token = "") {
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    const missing = ["SUPABASE_URL", "SUPABASE_ANON_KEY"].filter(name => !env[name]);
    return { ok: false, status: 503, error: `Falta configurar ${missing.join(" y ")} en Vercel → Settings → Environment Variables. Guarda y vuelve a desplegar.` };
  }
  const base = env.SUPABASE_URL.replace(/\/$/, "");
  let res;
  try {
    res = await fetch(`${base}/rest/v1/${path}`, {
    ...init,
    headers: sbHeaders(env, init.headers || {}, token),
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

/** Clientes creados a mano en la app (nombre, teléfono y su enlace). */
async function fichasDeClientes(env) {
  const r = await sbRequest(env, "configuracion?clave=eq.clientes&select=valor&limit=1");
  const valor = r.ok && Array.isArray(r.data) ? r.data[0]?.valor : null;
  return Array.isArray(valor) ? valor : [];
}

/**
 * Revisa un cupón contra el total de la cotización. Devuelve { ok, codigo, tipo, valor, descuento }
 * o { ok: false, motivo } con motivo "no-existe", "vencido", "agotado" o "minimo".
 */
async function revisarCupon(env, escrito, total) {
  const codigo = String(escrito || "").trim().toUpperCase();
  if (!/^[A-Z0-9_-]{3,30}$/.test(codigo)) return { ok: false, motivo: "no-existe" };
  const c = await sbRequest(env, `cupones?codigo=eq.${codigo}&select=*&limit=1`);
  if (!c.ok) return { ok: false, motivo: "error" };
  const cupon = Array.isArray(c.data) ? c.data[0] : null;
  if (!cupon || !cupon.activo) return { ok: false, motivo: "no-existe" };
  if (cupon.vence && cupon.vence < new Date().toISOString().slice(0, 10)) return { ok: false, motivo: "vencido" };
  if (cupon.usos_max) {
    const usos = await sbRequest(env, `cotizaciones_clientes?select=id&totales-%3E%3Ecupon=eq.${codigo}&or=(totales-%3E%3Eestado.is.null,totales-%3E%3Eestado.neq.cancelada)&limit=1000`);
    if (!usos.ok) return { ok: false, motivo: "error" };
    if ((usos.data || []).length >= cupon.usos_max) return { ok: false, motivo: "agotado" };
  }
  const minimo = Number(cupon.minimo) || 0, valor = Number(cupon.valor) || 0;
  if (!(total > 0) || total < minimo) return { ok: false, motivo: "minimo", minimo };
  const bruto = cupon.tipo === "monto" ? Math.min(valor, total) : total * valor / 100;
  return { ok: true, codigo, tipo: cupon.tipo, valor, minimo, descuento: Math.round(bruto * 100) / 100 };
}

/** Lo que el cliente puede ver de su cotización: nunca costos ni flete. */
function cotizacionPublica(fila) {
  const contacto = fila.totales?.contacto || {};
  return {
    id: fila.id, numero: fila.numero, fecha: fila.fecha, cliente: fila.cliente || "",
    telefono: contacto.telefono || "", direccion: contacto.direccion || "", nota: contacto.nota || "", total: Number(fila.total_final) || 0,
    subtotal: Number(fila.totales?.totalVenta) || 0, descuento: Number(fila.descuento_monto) || 0, cupon: fila.totales?.cupon || "",
    token: contacto.token || "", estado: fila.totales?.estado || "pendiente",
    confirmadaEl: fila.totales?.confirmadaEl || null, entregadaEl: fila.totales?.entregadaEl || null,
    pagado: (Array.isArray(fila.totales?.pagos) ? fila.totales.pagos : []).reduce((s, p) => s + (Number(p.monto) || 0), 0),
    pagos: (Array.isArray(fila.totales?.pagos) ? fila.totales.pagos : []).map((p) => ({ fecha: p.fecha || null, monto: Number(p.monto) || 0, nota: String(p.nota || "") })),
    lineas: (Array.isArray(fila.lineas) ? fila.lineas : []).map((l) => ({
      codigo: l.codigo, nombre: l.nombre, nombreEn: l.nombreEn || "", cantidad: Number(l.cantidad) || 0, precio: Number(l.precioVenta) || 0, foto: l.foto || "",
    })),
  };
}

const CATALOGOS = {
  "/api/catalogo": ["id", "codigo", "nombre", "descripcion", "categoria", "peso", "precio_venta", "foto", "en"],
  "/api/catalogo-interno": ["id", "codigo", "nombre", "descripcion", "categoria", "cbm", "peso", "precio_cbm", "precio_producto", "precio_venta", "foto"],
};

const PAGINA_EN_PAUSA = `<!doctype html><html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex">
<title>Taller Gregoriana</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#14222B;color:#fff;font-family:system-ui,-apple-system,"Segoe UI",sans-serif;text-align:center;padding:24px}
h1{font-size:clamp(28px,6vw,44px);margin:0 0 10px}p{margin:0;color:#C4D1D7;font-size:17px;line-height:1.5;max-width:420px}</style></head>
<body><main><h1>Taller Gregoriana</h1><p>La página no está disponible en este momento. Vuelve a intentarlo más tarde.</p></main></body></html>`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Interruptor para apagar toda la página por un rato: en Cloudflare, el secreto PAUSADO = "1".
    // Se enciende con `npx wrangler secret put PAUSADO` y se apaga con `npx wrangler secret delete PAUSADO`.
    if (env.PAUSADO === "1") {
      if (url.pathname.startsWith("/api/")) return json({ ok: false, error: "Página en pausa." }, 503);
      return new Response(PAGINA_EN_PAUSA, {
        status: 503,
        headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "retry-after": "3600" },
      });
    }

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

    // El cliente prueba un cupón antes de enviar su cotización: se calcula con los precios de la base, no con los que él mande.
    if (url.pathname === "/api/cupon" && request.method === "POST") {
      let cuerpo;
      try { cuerpo = await request.json(); } catch { return json({ ok: false, motivo: "no-existe" }, 400); }
      const pedidas = new Map();
      for (const l of Array.isArray(cuerpo?.lineas) ? cuerpo.lineas.slice(0, 40) : []) {
        const codigo = texto(l?.codigo, 60).replace(/["\\]/g, ""), cantidad = Math.floor(Number(l?.cantidad));
        if (codigo && cantidad >= 1) pedidas.set(codigo, Math.min(99, cantidad));
      }
      if (!pedidas.size) return json({ ok: false, motivo: "minimo", minimo: 0 });
      const codigos = [...pedidas.keys()].map((c) => `"${c}"`).join(",");
      const prod = await sbRequest(env, `productos?select=codigo,precio_venta&codigo=in.(${encodeURIComponent(codigos)})`);
      if (!prod.ok || !Array.isArray(prod.data)) return json({ ok: false, motivo: "error" }, 503);
      const total = prod.data.reduce((s, p) => s + (Number(p.precio_venta) || 0) * (pedidas.get(p.codigo) || 0), 0);
      const resultado = await revisarCupon(env, cuerpo?.cupon, total);
      return json(resultado, resultado.motivo === "error" ? 503 : 200);
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
        return json({ ok: false, error: "Faltan el nombre, el teléfono o los productos." }, 400);
      }
      const codigos = [...pedidas.keys()].map((c) => `"${c}"`).join(",");
      const prod = await sbRequest(env, `productos?select=id,codigo,nombre,en,cbm,peso,precio_cbm,precio_producto,precio_venta,foto&codigo=in.(${encodeURIComponent(codigos)})`);
      if (!prod.ok || !Array.isArray(prod.data)) return json({ ok: false, error: "No se pudo registrar la cotización." }, 503);
      const lineas = [];
      for (const [codigo, cantidad] of pedidas) {
        const p = prod.data.find((x) => x.codigo === codigo);
        if (p) lineas.push({
          id: crypto.randomUUID(), productId: p.id, codigo: p.codigo, nombre: p.nombre, nombreEn: String(p.en?.nombre || ""), foto: p.foto || "",
          cbm: Number(p.cbm) || 0, peso: Number(p.peso) || 0, minimoCbm: MINIMO_CBM, precioCbm: Number(p.precio_cbm) || 0,
          precioProducto: Number(p.precio_producto) || 0, precioVenta: Number(p.precio_venta) || 0, cantidad,
        });
      }
      if (!lineas.length) return json({ ok: false, error: "Esos productos ya no están en el catálogo." }, 400);

      // El mismo teléfono conserva el mismo enlace de cliente (/cliente/<token>).
      const tel = telefono.replace(/\D/g, "");
      const previa = await sbRequest(env, `cotizaciones_clientes?select=totales&totales-%3Econtacto-%3E%3Etel=eq.${tel}&order=fecha.desc&limit=1`);
      const tokenPrevio = previa.ok && Array.isArray(previa.data) ? previa.data[0]?.totales?.contacto?.token : "";
      // Enlace del cliente: el de la cuenta desde la que cotiza, el que ya tenía ese teléfono, o uno nuevo.
      const esToken = (v) => /^[0-9a-f]{32}$/.test(v || "");
      let token = "";
      const fichas = await fichasDeClientes(env);
      const pedido = String(cuerpo?.token || "");
      if (esToken(pedido)) {
        const conEse = fichas.some((f) => f.token === pedido) ? { ok: true, data: [1] }
          : await sbRequest(env, `cotizaciones_clientes?select=id&totales-%3Econtacto-%3E%3Etoken=eq.${pedido}&limit=1`);
        if (conEse.ok && Array.isArray(conEse.data) && conEse.data.length) token = pedido;
      }
      if (!token && esToken(tokenPrevio)) token = tokenPrevio;
      if (!token) token = fichas.find((f) => f.tel && f.tel === tel)?.token || "";
      if (!esToken(token)) token = crypto.randomUUID().replace(/-/g, "");

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
      // Cupón de descuento: si el cliente escribió uno que no sirve, se le avisa en vez de registrar sin descuento.
      let cupon = null;
      if (texto(cuerpo?.cupon, 30)) {
        cupon = await revisarCupon(env, cuerpo.cupon, t.totalVenta);
        if (!cupon.ok) return json({ ok: false, error: "El cupón no es válido.", motivo: cupon.motivo, minimo: cupon.minimo }, cupon.motivo === "error" ? 503 : 400);
      }
      const descuentoMonto = cupon ? cupon.descuento : 0;
      const porcentaje = t.totalVenta > 0 ? Math.round(descuentoMonto / t.totalVenta * 10000) / 100 : 0;
      const totalFinal = Math.round((t.totalVenta - descuentoMonto) * 100) / 100;
      const fila = {
        id: crypto.randomUUID(), numero: `WEB-${String(siguiente).padStart(4, "0")}`, fecha: new Date().toISOString(), cliente: nombre,
        descuento: porcentaje, descuento_monto: descuentoMonto, total_final: totalFinal, lineas,
        totales: {
          ...t, ...(cupon ? { cupon: cupon.codigo, descuento: porcentaje, descuentoMonto, totalFinal } : {}),
          contacto: { telefono, tel, token, direccion, nota, origen: "catalogo" },
        },
      };
      const guardada = await sbRequest(env, "cotizaciones_clientes", { method: "POST", headers: { Prefer: "return=minimal" }, body: JSON.stringify(fila) });
      if (!guardada.ok) return json({ ok: false, error: "No se pudo registrar la cotización." }, 503);
      return json({ ok: true, cotizacion: cotizacionPublica(fila) }, 201);
    }

    // Una cotización enviada desde el catálogo, sin costos, para verla con su enlace.
    const idSolicitud = request.method === "GET" && url.pathname.match(/^\/api\/solicitudes\/([A-Za-z0-9-]{8,40})$/)?.[1];
    if (idSolicitud) {
      const r = await sbRequest(env, `cotizaciones_clientes?id=eq.${idSolicitud}&select=id,numero,fecha,cliente,total_final,lineas,totales&limit=1`);
      if (!r.ok) return json({ ok: false, error: "No se pudo cargar la cotización." }, 503);
      const fila = Array.isArray(r.data) ? r.data[0] : null;
      if (!fila) return json({ ok: false, error: "No existe." }, 404);
      return json({ ok: true, cotizacion: cotizacionPublica(fila) });
    }

    // Todas las cotizaciones de un cliente, con su estado, para su enlace propio.
    const tokenCliente = request.method === "GET" && url.pathname.match(/^\/api\/cliente\/([0-9a-f]{32})$/)?.[1];
    if (tokenCliente) {
      const r = await sbRequest(env, `cotizaciones_clientes?select=id,numero,fecha,cliente,total_final,lineas,totales&totales-%3Econtacto-%3E%3Etoken=eq.${tokenCliente}&order=fecha.desc&limit=100`);
      if (!r.ok || !Array.isArray(r.data)) return json({ ok: false, error: "No se pudo cargar." }, 503);
      const ficha = (await fichasDeClientes(env)).find((f) => f.token === tokenCliente);
      if (!r.data.length && !ficha) return json({ ok: false, error: "No existe." }, 404);
      return json({ ok: true, nombre: ficha?.nombre || r.data[0]?.cliente || "", cotizaciones: r.data.map(cotizacionPublica) });
    }

    // Lo que sigue con costos (catálogo interno y productos) es solo para quien entró con su usuario.
    const token = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "").trim();
    const interno = url.pathname === "/api/catalogo-interno" || url.pathname === "/api/productos";
    if (interno && !token) return json({ ok: false, error: "Entra con tu usuario para continuar." }, 401);

    // Catálogo para clientes: solo precio de venta, nunca costos. Catálogo interno: costos, flete y CBM.
    const campos = request.method === "GET" && CATALOGOS[url.pathname];
    if (campos) {
      const productos = [];
      // Stable ordering and pagination avoid truncating large catalogs.
      for (let offset = 0; ; ) {
        const r = await sbRequest(env, `productos?select=${campos.join(",")}&order=creado.desc,id.asc&limit=500&offset=${offset}`, {}, interno ? token : "");
        if (!r.ok) return json({ ok: false, error: "El catálogo no está disponible temporalmente." }, 503);
        if (!Array.isArray(r.data)) return json({ ok: false, error: "Respuesta de catálogo inválida." }, 502);
        if (!r.data.length) break;
        productos.push(...r.data.map((fila) => Object.fromEntries(campos.map((campo) => [campo, fila[campo]]))));
        offset += r.data.length;
      }
      return json(productos);
    }

    if (url.pathname === "/api/productos" && request.method === "GET") {
      const r = await sbRequest(env, "productos?select=*&order=creado.desc", {}, token);
      return r.ok ? json(r.data || []) : json({ ok: false, error: r.error }, r.status);
    }

    if (url.pathname === "/api/productos" && request.method === "DELETE") {
      const id = url.searchParams.get("id");
      if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) return json({ ok: false, error: "ID de producto inválido" }, 400);
      const result = await sbRequest(env, `productos?id=eq.${encodeURIComponent(id)}&select=id`, {
        method: "DELETE",
        headers: { Prefer: "return=representation" },
      }, token);
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
        }, token);
        if (!ins.ok) return json({ ok: false, stage: "upsert", status: ins.status, error: ins.error }, ins.status);
        return json({ ok: true, count: lista.length, saved: Array.isArray(ins.data) ? ins.data.length : lista.length });
      }
      return json({ ok: true, count: 0, saved: 0 });
    }

    return env.ASSETS.fetch(request);
  },
};
