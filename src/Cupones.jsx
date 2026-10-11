import { useState, useEffect, useCallback, useMemo } from "react";
import { Ticket, Plus, Trash2, Copy } from "lucide-react";

/* Pestaña "Cupones": códigos de descuento que el cliente escribe al crear su cotización en el catálogo.
   Se guardan en la tabla "cupones"; el servidor (worker.js) los valida y aplica. */

const dinero = (n) => "US$" + (Number(n) || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const NUEVO = { codigo: "", tipo: "porcentaje", valor: "", minimo: "", usosMax: "", vence: "", nota: "" };
const hoy = () => new Date().toISOString().slice(0, 10);

export default function CuponesView({ supabase, cotizaciones, avisar, Encabezado }) {
  const [lista, setLista] = useState([]);
  const [form, setForm] = useState(NUEVO);
  const [error, setError] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [borrar, setBorrar] = useState(null);

  const cargar = useCallback(async () => {
    if (!supabase) return;
    const { data, error: fallo } = await supabase.from("cupones").select("*").order("creado", { ascending: false });
    if (fallo) { avisar("No se pudieron cargar los cupones.", "error"); return; }
    setLista(data || []);
  }, [supabase, avisar]);
  useEffect(() => { cargar(); }, [cargar]);

  // Cuántas cotizaciones (no canceladas) usaron cada cupón y cuánto se descontó.
  const usos = useMemo(() => {
    const m = new Map();
    for (const c of cotizaciones || []) {
      const codigo = c.totales?.cupon;
      if (!codigo || c.totales?.estado === "cancelada") continue;
      const u = m.get(codigo) || { veces: 0, descontado: 0 };
      u.veces += 1; u.descontado += Number(c.descuentoMonto) || 0;
      m.set(codigo, u);
    }
    return m;
  }, [cotizaciones]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const crear = async (e) => {
    e.preventDefault();
    const codigo = form.codigo.trim().toUpperCase().replace(/\s+/g, "");
    const valor = parseFloat(String(form.valor).replace(",", "."));
    if (!/^[A-Z0-9_-]{3,30}$/.test(codigo)) { setError("El código debe tener de 3 a 30 letras o números, sin espacios. Ejemplo: TALLER10"); return; }
    if (!(valor > 0)) { setError("Escribe de cuánto es el descuento."); return; }
    if (form.tipo === "porcentaje" && valor > 100) { setError("El porcentaje no puede pasar de 100."); return; }
    if (lista.some((c) => c.codigo === codigo)) { setError("Ya existe un cupón con ese código."); return; }
    setError(""); setOcupado(true);
    const { error: fallo } = await supabase.from("cupones").insert({
      codigo, tipo: form.tipo, valor, minimo: parseFloat(String(form.minimo).replace(",", ".")) || 0,
      usos_max: parseInt(form.usosMax, 10) > 0 ? parseInt(form.usosMax, 10) : null, vence: form.vence || null, nota: form.nota.trim(),
    });
    setOcupado(false);
    if (fallo) { setError("No se pudo guardar el cupón."); return; }
    avisar(`Cupón ${codigo} creado`);
    setForm(NUEVO);
    cargar();
  };
  const cambiarActivo = async (c) => {
    const { error: fallo } = await supabase.from("cupones").update({ activo: !c.activo }).eq("codigo", c.codigo);
    if (fallo) { avisar("No se pudo cambiar el cupón.", "error"); return; }
    avisar(c.activo ? `Cupón ${c.codigo} desactivado` : `Cupón ${c.codigo} activado`);
    cargar();
  };
  const quitar = async (c) => {
    const { error: fallo } = await supabase.from("cupones").delete().eq("codigo", c.codigo);
    if (fallo) { avisar("No se pudo borrar el cupón.", "error"); return; }
    avisar(`Cupón ${c.codigo} borrado`);
    setBorrar(null);
    cargar();
  };
  const copiar = async (codigo) => {
    try { await navigator.clipboard.writeText(codigo); avisar(`Código ${codigo} copiado`); } catch { avisar("No se pudo copiar.", "error"); }
  };
  const estadoDe = (c) => {
    const u = usos.get(c.codigo)?.veces || 0;
    if (!c.activo) return ["Desactivado", "#5B6B75", "#EEF1F3"];
    if (c.vence && c.vence < hoy()) return ["Vencido", "#8A2A1A", "#FBE9E5"];
    if (c.usos_max && u >= c.usos_max) return ["Agotado", "#8A2A1A", "#FBE9E5"];
    return ["Activo", "#14653A", "#D7EFE2"];
  };

  return (
    <div className="space-y-6">
      <Encabezado icon={Ticket} tono="ambar" titulo="Cupones"
        descripcion="Códigos de descuento. El cliente escribe el código al crear su cotización en el catálogo y el descuento se aplica solo." />

      <form className="paper p-4" onSubmit={crear}>
        <h2 className="cond text-2xl font-semibold mb-3">Crear cupón</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(190px,100%),1fr))", gap: 12 }}>
          <div><label className="lbl" htmlFor="c-codigo">Código</label>
            <input id="c-codigo" className="inp num" autoCapitalize="characters" autoComplete="off" placeholder="TALLER10" maxLength={30}
              value={form.codigo} onChange={(e) => setForm((f) => ({ ...f, codigo: e.target.value.toUpperCase() }))} /></div>
          <div><label className="lbl" htmlFor="c-tipo">Tipo de descuento</label>
            <select id="c-tipo" className="inp" value={form.tipo} onChange={set("tipo")}>
              <option value="porcentaje">Porcentaje (%)</option>
              <option value="monto">Monto fijo (US$)</option>
            </select></div>
          <div><label className="lbl" htmlFor="c-valor">{form.tipo === "porcentaje" ? "Descuento (%)" : "Descuento (US$)"}</label>
            <input id="c-valor" className="inp num" inputMode="decimal" placeholder={form.tipo === "porcentaje" ? "10" : "100"} value={form.valor} onChange={set("valor")} /></div>
          <div><label className="lbl" htmlFor="c-minimo">Compra mínima en US$ (opcional)</label>
            <input id="c-minimo" className="inp num" inputMode="decimal" placeholder="0" value={form.minimo} onChange={set("minimo")} /></div>
          <div><label className="lbl" htmlFor="c-usos">Cuántas veces se puede usar (opcional)</label>
            <input id="c-usos" className="inp num" inputMode="numeric" placeholder="Sin límite" value={form.usosMax} onChange={set("usosMax")} /></div>
          <div><label className="lbl" htmlFor="c-vence">Vence el (opcional)</label>
            <input id="c-vence" className="inp num" type="date" min={hoy()} value={form.vence} onChange={set("vence")} /></div>
          <div style={{ gridColumn: "1 / -1" }}><label className="lbl" htmlFor="c-nota">Nota para ti (opcional)</label>
            <input id="c-nota" className="inp" maxLength={120} placeholder="Para quién o para qué campaña es" value={form.nota} onChange={set("nota")} /></div>
        </div>
        {error && <p className="mt-3" role="alert" style={{ color: "#A3321F", fontWeight: 600 }}>{error}</p>}
        <button className="btn btn-primary mt-3" disabled={ocupado}><Plus size={17} />Crear cupón</button>
      </form>

      <div className="paper p-4">
        <h2 className="cond text-2xl font-semibold mb-3">Tus cupones <span className="muted font-medium text-base">· {lista.length}</span></h2>
        {lista.length === 0 ? <p className="muted">Todavía no has creado cupones.</p> : (
          <div className="space-y-3">
            {lista.map((c) => {
              const u = usos.get(c.codigo) || { veces: 0, descontado: 0 };
              const [texto, color, fondo] = estadoDe(c);
              return (
                <div key={c.codigo} className="paper p-3" style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
                  <div style={{ flex: "1 1 240px", minWidth: 0 }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                      <b className="cond num" style={{ fontSize: 26, lineHeight: 1 }}>{c.codigo}</b>
                      <span style={{ background: fondo, color, borderRadius: 999, padding: "2px 10px", fontSize: 13, fontWeight: 700 }}>{texto}</span>
                    </div>
                    <div className="font-semibold num" style={{ color: "#1D7A46" }}>
                      {c.tipo === "porcentaje" ? `${Number(c.valor)}% de descuento` : `${dinero(c.valor)} de descuento`}
                    </div>
                    <div className="muted text-sm num" style={{ overflowWrap: "anywhere" }}>
                      {[
                        Number(c.minimo) > 0 && `compra mínima ${dinero(c.minimo)}`,
                        c.usos_max ? `usado ${u.veces} de ${c.usos_max}` : `usado ${u.veces} ${u.veces === 1 ? "vez" : "veces"}`,
                        u.descontado > 0 && `descontado ${dinero(u.descontado)}`,
                        c.vence && `vence ${c.vence.split("-").reverse().join("/")}`,
                        c.nota,
                      ].filter(Boolean).join(" · ")}
                    </div>
                  </div>
                  {borrar === c.codigo ? (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                      <span>¿Borrar {c.codigo}?</span>
                      <button type="button" className="btn btn-danger-solid" onClick={() => quitar(c)}>Sí, borrar</button>
                      <button type="button" className="btn btn-ghost" onClick={() => setBorrar(null)}>No</button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      <button type="button" className="btn btn-ghost" onClick={() => copiar(c.codigo)}><Copy size={16} />Copiar código</button>
                      <button type="button" className="btn btn-ghost" onClick={() => cambiarActivo(c)}>{c.activo ? "Desactivar" : "Activar"}</button>
                      <button type="button" className="btn btn-danger" onClick={() => setBorrar(c.codigo)}><Trash2 size={16} />Borrar</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
