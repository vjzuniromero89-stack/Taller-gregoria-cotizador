import { useState, useEffect, useMemo } from "react";
import { Search, X, Camera, Share2, Check, Box, Scale, Ship, ChevronRight } from "lucide-react";
import { LOGO_POR_DEFECTO } from "./logo.js";
import { leerDescripcion } from "./descripcion.js";
import { CATALOGO_XPROMISE } from "./catalogoXpromise.js";

const KG_POR_CBM = 350;
const dinero = (n) => "US$" + (n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const m3 = (n) => (n || 0).toLocaleString("en-US", { maximumFractionDigits: 3 }) + " m³";
const kilos = (n) => (n || 0).toLocaleString("en-US", { maximumFractionDigits: 2 }) + " kg";
const sinAcentos = (v) => String(v || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

const ESTILOS = `
.cat { font-family:'Barlow',system-ui,-apple-system,'Segoe UI',sans-serif; color:#14222B; background:#EEF2F4; min-height:100vh; }
.cat-cond { font-family:'Barlow Condensed','Arial Narrow',system-ui,sans-serif; }
.cat-num { font-variant-numeric:tabular-nums; }
.cat-wrap { max-width:1240px; margin:0 auto; padding:0 20px; }

.cat-top { background:#14222B; color:#fff; position:relative; overflow:hidden; }
.cat-top::after { content:""; position:absolute; left:0; right:0; bottom:0; height:8px;
  background:repeating-linear-gradient(135deg,#F2B705 0 14px,#14222B 14px 28px); }
.cat-top::before { content:""; position:absolute; right:-120px; top:-160px; width:520px; height:520px; border-radius:50%;
  background:radial-gradient(circle,rgba(27,94,107,.75) 0%,rgba(27,94,107,0) 68%); }
.cat-top-in { position:relative; padding:28px 0 36px; }
.cat-marca { display:flex; align-items:center; gap:12px; }
.cat-marca img { height:46px; max-width:92px; object-fit:contain; background:#fff; border-radius:8px; padding:4px 7px; }
.cat-marca b { font-family:'Barlow Condensed',sans-serif; font-size:21px; font-weight:700; line-height:1; }
.cat-marca span { display:block; font-size:12px; color:#9FB0B9; margin-top:3px; }
.cat-top h1 { font-family:'Barlow Condensed',sans-serif; font-weight:700; font-size:clamp(38px,7vw,64px); line-height:.98;
  margin:26px 0 8px; letter-spacing:.005em; text-wrap:balance; }
.cat-top h1 em { font-style:normal; color:#F2B705; }
.cat-top p { margin:0; color:#C4D1D7; font-size:16px; max-width:560px; line-height:1.45; }
.cat-buscar { position:relative; margin-top:22px; max-width:560px; }
.cat-buscar svg { position:absolute; left:16px; top:50%; transform:translateY(-50%); color:#5B6B75; }
.cat-buscar input { width:100%; border:0; border-radius:12px; padding:15px 16px 15px 46px; font-size:17px; color:#14222B;
  background:#fff; box-shadow:0 8px 28px rgba(0,0,0,.28); }
.cat-buscar input:focus { outline:3px solid #F2B705; outline-offset:2px; }

.cat-filtros { position:sticky; top:0; z-index:20; background:rgba(238,242,244,.94); backdrop-filter:blur(8px);
  border-bottom:1px solid #D5DEE3; }
.cat-pills { display:flex; gap:8px; overflow-x:auto; padding:12px 0; scrollbar-width:none; }
.cat-pills::-webkit-scrollbar { display:none; }
.cat-pill { flex-shrink:0; border:1px solid #CAD4DA; background:#fff; color:#314551; border-radius:999px; padding:8px 15px;
  font-size:14px; font-weight:600; display:inline-flex; align-items:center; gap:7px; transition:background .15s,color .15s,border-color .15s; }
.cat-pill:hover { border-color:#1B5E6B; }
.cat-pill i { font-style:normal; font-size:12px; font-weight:700; color:#5B6B75; background:#EEF2F4; border-radius:999px; padding:1px 7px; }
.cat-pill[aria-pressed="true"] { background:#1B5E6B; border-color:#1B5E6B; color:#fff; }
.cat-pill[aria-pressed="true"] i { background:#F2B705; color:#14222B; }
.cat-pill:focus-visible, .cat-card:focus-visible, .cat-btn:focus-visible, .cat-cerrar:focus-visible { outline:3px solid #F2B705; outline-offset:2px; }

.cat-cuenta { color:#5B6B75; font-size:14px; margin:20px 0 14px; }
.cat-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(min(270px,100%),1fr)); gap:18px; padding-bottom:56px; }
.cat-card { background:#fff; border:1px solid #D5DEE3; border-radius:16px; overflow:hidden; text-align:left; padding:0;
  display:flex; flex-direction:column; cursor:pointer; transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease; }
.cat-card:hover { transform:translateY(-4px); box-shadow:0 16px 36px rgba(20,34,43,.14); border-color:#9FB9C0; }
.cat-foto { position:relative; aspect-ratio:4/3; background:#fff; display:flex; align-items:center; justify-content:center;
  border-bottom:1px solid #E6ECEF; }
.cat-foto { overflow:hidden; }
.cat-foto img { position:absolute; inset:0; width:100%; height:100%; object-fit:contain; padding:14px; transition:transform .3s ease; }
.cat-card:hover .cat-foto img { transform:scale(1.04); }
.cat-etiqueta { position:absolute; left:12px; top:12px; background:#14222B; color:#fff; border-radius:6px; padding:3px 9px;
  font-size:11px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; }
.cat-cuerpo { padding:16px 16px 14px; display:flex; flex-direction:column; gap:6px; flex:1; }
.cat-categoria { font-size:11px; font-weight:700; letter-spacing:.09em; text-transform:uppercase; color:#1B5E6B; }
.cat-modelo { font-family:'Barlow Condensed',sans-serif; font-size:30px; font-weight:700; line-height:1; overflow-wrap:anywhere; }
.cat-nombre { font-size:15px; line-height:1.3; color:#314551; font-weight:500; overflow-wrap:anywhere; }
.cat-chips { display:flex; flex-wrap:wrap; gap:6px; margin-top:6px; }
.cat-chip { display:inline-flex; align-items:center; gap:5px; background:#F3F6F7; border-radius:6px; padding:4px 8px; font-size:12.5px;
  font-weight:600; color:#314551; }
.cat-pie { margin-top:auto; padding-top:12px; display:flex; align-items:flex-end; justify-content:space-between; gap:8px; }
.cat-precio small { display:block; font-size:11px; font-weight:600; color:#5B6B75; letter-spacing:.04em; text-transform:uppercase; }
.cat-precio b { font-family:'Barlow Condensed',sans-serif; font-size:28px; font-weight:700; line-height:1.05; color:#134650; }
.cat-ver { display:inline-flex; align-items:center; gap:2px; font-size:13px; font-weight:700; color:#1B5E6B; white-space:nowrap; }

.cat-vacio { background:#fff; border:1px dashed #B9C6CD; border-radius:16px; padding:44px 20px; text-align:center; color:#5B6B75; margin-bottom:56px; }
.cat-btn { border-radius:8px; padding:10px 16px; font-weight:600; font-size:15px; display:inline-flex; align-items:center; gap:7px;
  background:#1B5E6B; color:#fff; border:0; }
.cat-btn:hover { background:#134650; }
.cat-btn.claro { background:#fff; color:#1B5E6B; border:1px solid #CAD4DA; }
.cat-btn.claro:hover { background:#F0F4F5; }

.cat-fondo { position:fixed; inset:0; z-index:60; background:rgba(20,34,43,.72); display:flex; align-items:flex-start; justify-content:center;
  padding:28px 16px; overflow-y:auto; animation:cat-aparece .18s ease; }
.cat-ficha { background:#fff; border-radius:18px; width:100%; max-width:1040px; position:relative; overflow:hidden;
  box-shadow:0 30px 80px rgba(0,0,0,.4); animation:cat-sube .22s ease; }
@keyframes cat-aparece { from { opacity:0; } to { opacity:1; } }
@keyframes cat-sube { from { transform:translateY(14px); opacity:0; } to { transform:none; opacity:1; } }
@media (prefers-reduced-motion:reduce) { .cat-fondo, .cat-ficha { animation:none; } .cat-card, .cat-foto img { transition:none; } }
.cat-cerrar { position:absolute; right:12px; top:12px; z-index:2; width:40px; height:40px; border-radius:50%; background:#14222B; color:#fff;
  display:flex; align-items:center; justify-content:center; border:0; }
.cat-ficha-arriba { display:grid; grid-template-columns:minmax(0,1.05fr) minmax(0,1fr); }
.cat-ficha-foto { background:#fff; display:flex; align-items:center; justify-content:center; padding:24px; min-height:320px;
  border-right:1px solid #E6ECEF; }
.cat-ficha-foto img { max-width:100%; max-height:460px; object-fit:contain; }
.cat-ficha-info { padding:28px 28px 24px; display:flex; flex-direction:column; gap:10px; min-width:0; }
.cat-ficha-info h2 { font-family:'Barlow Condensed',sans-serif; font-size:clamp(38px,6vw,54px); font-weight:700; line-height:.95; margin:0;
  overflow-wrap:anywhere; padding-right:36px; }
.cat-ficha-info h3 { font-size:18px; font-weight:600; margin:0; line-height:1.3; color:#314551; overflow-wrap:anywhere; }
.cat-resumen { color:#4A5B66; line-height:1.5; font-size:15px; white-space:pre-wrap; overflow-wrap:anywhere; margin:0; }
.cat-precio-grande { background:#E4EFF1; border-radius:12px; padding:12px 16px; box-shadow:inset 4px 0 0 #1B5E6B; margin-top:4px; }
.cat-precio-grande small { display:block; font-size:12px; font-weight:600; color:#245763; text-transform:uppercase; letter-spacing:.05em; }
.cat-precio-grande b { font-family:'Barlow Condensed',sans-serif; font-size:40px; line-height:1.05; color:#134650; }
.cat-datos { display:grid; grid-template-columns:repeat(auto-fit,minmax(130px,1fr)); gap:8px; }
.cat-dato { background:#F3F6F7; border-radius:10px; padding:10px 12px; min-width:0; }
.cat-dato small { display:flex; align-items:center; gap:5px; font-size:12px; color:#5B6B75; font-weight:600; }
.cat-dato b { display:block; font-size:16px; margin-top:2px; overflow-wrap:anywhere; }
.cat-dato.cobro { background:#FFF4CC; box-shadow:inset 0 0 0 2px #F2B705; }
.cat-dato.cobro small, .cat-dato.cobro b { color:#7A5900; }
.cat-secciones { padding:6px 28px 28px; display:grid; grid-template-columns:repeat(auto-fit,minmax(min(320px,100%),1fr)); gap:22px 32px;
  border-top:1px solid #E6ECEF; }
.cat-seccion h4 { font-family:'Barlow Condensed',sans-serif; font-size:22px; font-weight:700; margin:20px 0 10px; display:flex; align-items:center; gap:10px; }
.cat-seccion h4::before { content:""; width:6px; height:20px; background:#F2B705; border-radius:2px; }
.cat-lista { list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:8px; }
.cat-lista li { display:flex; gap:9px; line-height:1.4; font-size:15px; overflow-wrap:anywhere; }
.cat-lista svg { flex-shrink:0; color:#1B5E6B; margin-top:3px; }
.cat-tabla { width:100%; border-collapse:collapse; font-size:14.5px; }
.cat-tabla th, .cat-tabla td { text-align:left; padding:8px 10px; vertical-align:top; overflow-wrap:anywhere; }
.cat-tabla th { font-weight:500; color:#5B6B75; width:46%; }
.cat-tabla td { font-weight:600; }
.cat-tabla tr:nth-child(odd) { background:#F3F6F7; }
.cat-incluye { columns:2; column-gap:22px; margin:0; padding:0; list-style:none; font-size:14.5px; }
.cat-incluye li { break-inside:avoid; padding:5px 0; border-bottom:1px solid #EEF2F4; overflow-wrap:anywhere; }
.cat-pie-pagina { background:#14222B; color:#9FB0B9; font-size:13px; text-align:center; padding:22px 16px; }
.cat-dentro { min-height:0; border-radius:14px; overflow:clip; border:1px solid #CAD4DA; }
.cat-dentro .cat-top h1 { font-size:clamp(32px,5vw,48px); margin-top:18px; }

@media (max-width:860px) { .cat-dentro .cat-filtros { top:60px; } }
@media (max-width:760px) {
  .cat-wrap { padding:0 14px; }
  .cat-top-in { padding:20px 0 30px; }
  .cat-grid { gap:12px; grid-template-columns:repeat(2,minmax(0,1fr)); }
  .cat-cuerpo { padding:12px; }
  .cat-modelo { font-size:24px; }
  .cat-nombre { font-size:13.5px; }
  .cat-precio b { font-size:23px; }
  .cat-ver { display:none; }
  .cat-fondo { padding:0; }
  .cat-ficha { border-radius:0; min-height:100vh; }
  .cat-ficha-arriba { grid-template-columns:1fr; }
  .cat-ficha-foto { border-right:0; border-bottom:1px solid #E6ECEF; min-height:0; padding:18px; }
  .cat-ficha-foto img { max-height:300px; }
  .cat-ficha-info { padding:18px 16px; }
  .cat-secciones { padding:0 16px 24px; }
  .cat-incluye { columns:1; }
}
@media (max-width:380px) { .cat-grid { grid-template-columns:1fr; } }
.cat-aviso { display:inline-block; margin-top:20px; background:#F2B705; color:#14222B; border-radius:6px; padding:4px 10px; font-size:12px;
  font-weight:700; letter-spacing:.07em; text-transform:uppercase; }
.cat-aviso + h1 { margin-top:10px; }
.cat-enlace { display:flex; flex-wrap:wrap; gap:8px; margin-top:18px; max-width:640px; }
.cat-enlace input { flex:1 1 220px; min-width:0; border:1px solid #3B5361; background:#1E2F3A; color:#fff; border-radius:8px; padding:10px 12px; font-size:15px; }
.cat-enlace a { text-decoration:none; }
.cat-btn:disabled { background:#9DB3B9; cursor:not-allowed; }

.cat-general { background:#fff; border:1px solid #D5DEE3; border-radius:14px; padding:16px 18px; margin-top:20px; display:flex; flex-wrap:wrap;
  align-items:center; justify-content:space-between; gap:12px 20px; }
.cat-general b { display:block; font-family:'Barlow Condensed',sans-serif; font-size:22px; line-height:1.1; }
.cat-general small { display:block; color:#5B6B75; font-size:13.5px; margin-top:3px; max-width:440px; line-height:1.35; }
.cat-confirmar { flex:1 1 100%; display:flex; flex-wrap:wrap; align-items:center; gap:8px; background:#FFF4CC; border:1px solid #E2C45C;
  border-radius:10px; padding:10px 12px; font-size:14.5px; color:#5F4600; }
.cat-confirmar span { flex:1 1 260px; }

.cat-card-editable { cursor:default; }
.cat-card-editable:hover { transform:none; }
.cat-card-abrir { display:flex; flex-direction:column; text-align:left; padding:0; border:0; background:none; width:100%; cursor:pointer; }
.cat-card-abrir:focus-visible, .cat-porc:focus-visible { outline:3px solid #F2B705; outline-offset:-3px; }
.cat-card-editable .cat-cuerpo { flex:0 0 auto; padding-bottom:10px; }
.cat-editor { margin-top:auto; padding:12px 14px 14px; background:#F6F8F9; border-top:1px solid #E6ECEF; display:flex; flex-direction:column; gap:9px; }
.cat-costo { display:flex; flex-direction:column; font-size:14px; color:#314551; }
.cat-costo b { font-size:16px; color:#14222B; }
.cat-costo small { font-size:12px; color:#5B6B75; line-height:1.3; }
.cat-porcentajes { display:flex; flex-wrap:wrap; align-items:center; gap:6px; }
.cat-porc { border:1px solid #CAD4DA; background:#fff; color:#314551; border-radius:8px; padding:7px 10px; font-size:14px; font-weight:700; min-width:48px; }
.cat-porc:hover:not(:disabled) { border-color:#1B5E6B; }
.cat-porc[aria-pressed="true"] { background:#1B5E6B; border-color:#1B5E6B; color:#fff; }
.cat-porc:disabled { opacity:.5; cursor:not-allowed; }
.cat-otro { display:inline-flex; align-items:center; gap:3px; font-size:14px; font-weight:700; color:#314551; }
.cat-otro input { width:58px; border:1px solid #CAD4DA; border-radius:8px; padding:7px 8px; font-size:14px; background:#fff; color:#14222B; }
.cat-cbm input { width:86px; font-size:17px; font-weight:700; }
.cat-dato small + b + small { display:block; margin-top:2px; font-weight:500; }
.cat-venta { display:flex; flex-direction:column; gap:3px; }
.cat-venta span { font-size:12px; font-weight:600; color:#5B6B75; }
.cat-venta input { border:1px solid #E2C45C; background:#FFF9E6; border-radius:8px; padding:9px 10px; font-size:19px; font-weight:700; color:#14222B; width:100%; }
.cat-otro input:focus, .cat-venta input:focus, .cat-enlace input:focus { outline:3px solid #F2B705; outline-offset:1px; }
.cat-editor-pie { display:flex; align-items:center; justify-content:space-between; gap:8px; min-height:38px; }
.cat-ganancia { font-size:13.5px; font-weight:600; color:#1D7A46; line-height:1.3; }
.cat-ganancia.mal { color:#A3321F; }
.cat-editor .cat-btn { padding:8px 14px; }
`;

const redondo = (n) => Math.round(n);
export const precioConGanancia = (costo, porcentaje) => redondo(costo * (1 + porcentaje / 100));

const normalizar = (p) => {
  const cbm = Number(p.cbm) || 0, peso = Number(p.peso) || 0;
  const porPeso = peso / KG_POR_CBM;
  const cobrable = Math.max(cbm, porPeso);
  const producto = Number(p.precio_producto ?? p.precioProducto) || 0;
  const precioCbm = Number(p.precio_cbm ?? p.precioCbm) || 0;
  const flete = cobrable * precioCbm;
  return {
    id: p.id, codigo: p.codigo || "", nombre: p.nombre || "", categoria: p.categoria || "Sin categoría",
    cbm, peso, porPeso, cobrable, por: porPeso > cbm ? "peso" : "volumen",
    producto, precioCbm, flete, costo: producto + flete, venta: Number(p.precio_venta ?? p.precioVenta) || 0,
    foto: p.foto || "", ficha: leerDescripcion(p.descripcion),
  };
};

function Foto({ src, alt }) {
  const [rota, setRota] = useState(false);
  if (!src || rota) return <Camera size={44} color="#B9C6CD" aria-hidden="true" />;
  return <img src={src} alt={alt} loading="lazy" onError={() => setRota(true)} />;
}

const PORCENTAJES = [20, 30, 40];

/** Fija el precio de venta de un equipo: por porcentaje de ganancia sobre el costo o escrito a mano. */
function EditorPrecio({ p, guardar }) {
  const [precio, setPrecio] = useState(p.venta > 0 ? String(p.venta) : "");
  const [guardando, setGuardando] = useState(false);
  useEffect(() => { setPrecio(p.venta > 0 ? String(p.venta) : ""); }, [p.venta]);

  const valor = Math.max(0, parseFloat(String(precio).replace(",", ".")) || 0);
  const ganancia = valor - p.costo;
  const porcentaje = p.costo > 0 && valor > 0 ? (ganancia / p.costo) * 100 : null;
  const cambiado = valor !== p.venta;
  const escribirPorcentaje = (texto) => {
    const n = parseFloat(String(texto).replace(",", "."));
    setPrecio(texto === "" || isNaN(n) ? "" : String(precioConGanancia(p.costo, n)));
  };
  const enviar = async () => { setGuardando(true); await guardar(p.id, valor); setGuardando(false); };

  return (
    <div className="cat-editor">
      <div className="cat-costo cat-num">
        <span>Costo <b>{dinero(p.costo)}</b></span>
        <small>{p.flete > 0 ? `producto ${dinero(p.producto)} + flete ${dinero(p.flete)}` : "sin flete: falta el CBM o el precio CBM"}</small>
      </div>
      <div className="cat-porcentajes" role="group" aria-label={`Ganancia de ${p.codigo}`}>
        {PORCENTAJES.map((n) => (
          <button type="button" key={n} className="cat-porc" disabled={p.costo <= 0}
            aria-pressed={valor > 0 && valor === precioConGanancia(p.costo, n)}
            onClick={() => setPrecio(String(precioConGanancia(p.costo, n)))}>{n}%</button>
        ))}
        <label className="cat-otro">
          <input className="cat-num" inputMode="decimal" placeholder="Otro" aria-label="Otro porcentaje de ganancia" disabled={p.costo <= 0}
            value={porcentaje === null || PORCENTAJES.some((n) => valor === precioConGanancia(p.costo, n)) ? "" : String(Math.round(porcentaje * 10) / 10)}
            onChange={(e) => escribirPorcentaje(e.target.value)} />%
        </label>
      </div>
      <label className="cat-venta">
        <span>Precio de venta (US$)</span>
        <input className="cat-num" inputMode="decimal" placeholder="0" value={precio} onChange={(e) => setPrecio(e.target.value)} />
      </label>
      <div className="cat-editor-pie">
        <span className={`cat-ganancia cat-num ${valor > 0 && ganancia < 0 ? "mal" : ""}`}>
          {valor <= 0 ? "Sin precio: el cliente verá “Consultar”" :
            `${ganancia < 0 ? "Pierdes" : "Ganas"} ${dinero(Math.abs(ganancia))}${porcentaje === null ? "" : ` (${porcentaje.toLocaleString("en-US", { maximumFractionDigits: 1 })}%)`}`}
        </span>
        {cambiado && <button type="button" className="cat-btn" onClick={enviar} disabled={guardando}>{guardando ? "Guardando…" : "Guardar"}</button>}
      </div>
    </div>
  );
}

function Tarjeta({ p, modo, abrir, guardar }) {
  const precio = modo === "cliente" ? p.venta : p.producto;
  const contenido = <>
    <div className="cat-foto">
      {p.ficha.marca && <span className="cat-etiqueta">{p.ficha.marca}</span>}
      <Foto src={p.foto} alt="" />
    </div>
    <div className="cat-cuerpo">
      <span className="cat-categoria">{p.categoria}</span>
      <span className="cat-modelo cat-num">{p.codigo}</span>
      <span className="cat-nombre">{p.nombre}</span>
      {modo === "interno" && (
        <div className="cat-chips">
          <span className="cat-chip cat-num"><Box size={13} />Volumen: {p.cbm > 0 ? m3(p.cbm) : "falta"}</span>
          <span className="cat-chip cat-num"><Scale size={13} />Peso: {p.peso > 0 ? m3(p.porPeso) : "falta"}</span>
        </div>
      )}
      {!guardar && (
        <div className="cat-pie">
          <div className="cat-precio">
            <small>{modo === "cliente" ? "Precio" : "Precio de costo"}</small>
            <b className="cat-num">{precio > 0 ? dinero(precio) : "Consultar"}</b>
          </div>
          <span className="cat-ver">Ver ficha<ChevronRight size={15} /></span>
        </div>
      )}
    </div>
  </>;
  if (!guardar) return <button type="button" className="cat-card" onClick={abrir} aria-label={`Ver ${p.codigo}, ${p.nombre}`}>{contenido}</button>;
  return (
    <div className="cat-card cat-card-editable">
      <button type="button" className="cat-card-abrir" onClick={abrir} aria-label={`Ver ${p.codigo}, ${p.nombre}`}>{contenido}</button>
      <EditorPrecio p={p} guardar={guardar} />
    </div>
  );
}

function Ficha({ p, modo, cerrar }) {
  const [copiado, setCopiado] = useState(false);
  useEffect(() => {
    const tecla = (e) => { if (e.key === "Escape") cerrar(); };
    const previo = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", tecla);
    return () => { document.body.style.overflow = previo; window.removeEventListener("keydown", tecla); };
  }, [cerrar]);

  const compartir = async () => {
    const enlace = `${window.location.origin}${RUTAS[modo]}#${encodeURIComponent(p.codigo)}`;
    try {
      if (navigator.share) await navigator.share({ title: `${p.codigo} · ${p.nombre}`, url: enlace });
      else { await navigator.clipboard.writeText(enlace); setCopiado(true); setTimeout(() => setCopiado(false), 2200); }
    } catch { /* la persona canceló */ }
  };
  const f = p.ficha;
  const interno = modo === "interno";
  const precio = interno ? p.producto : p.venta;

  return (
    <div className="cat-fondo" onMouseDown={(e) => { if (e.target === e.currentTarget) cerrar(); }}>
      <article className="cat-ficha" role="dialog" aria-modal="true" aria-label={`${p.codigo}, ${p.nombre}`}>
        <button type="button" className="cat-cerrar" onClick={cerrar} aria-label="Cerrar ficha" autoFocus><X size={20} /></button>
        <div className="cat-ficha-arriba">
          <div className="cat-ficha-foto"><Foto src={p.foto} alt={`${p.codigo}, ${p.nombre}`} /></div>
          <div className="cat-ficha-info">
            <span className="cat-categoria">{[f.marca, p.categoria].filter(Boolean).join(" · ")}</span>
            <h2 className="cat-num">{p.codigo}</h2>
            <h3>{p.nombre}</h3>
            {f.resumen && <p className="cat-resumen">{f.resumen}</p>}
            <div className="cat-precio-grande">
              <small>{interno ? "Precio de costo del producto" : "Precio"}</small>
              <b className="cat-num">{precio > 0 ? dinero(precio) : "Consultar"}</b>
            </div>
            {interno ? (
              <>
                <div className="cat-datos">
                  <div className="cat-dato"><small><Ship size={13} />Flete</small><b className="cat-num">{p.flete > 0 ? dinero(p.flete) : "Por confirmar"}</b>
                    <small className="cat-num">{p.cobrable > 0 ? m3(p.cobrable) : "falta el CBM"} × {p.precioCbm > 0 ? dinero(p.precioCbm) : "falta el precio CBM"}</small></div>
                  <div className="cat-dato"><small>Costo total</small><b className="cat-num">{dinero(p.costo)}</b></div>
                  <div className="cat-dato"><small>Precio de venta</small><b className="cat-num">{p.venta > 0 ? dinero(p.venta) : "Sin definir"}</b></div>
                </div>
                <div className="cat-datos">
                  <div className="cat-dato"><small><Box size={13} />CBM por volumen</small><b className="cat-num">{p.cbm > 0 ? m3(p.cbm) : "Por confirmar"}</b></div>
                  <div className="cat-dato"><small><Scale size={13} />CBM por peso</small>
                    <b className="cat-num">{p.peso > 0 ? m3(p.porPeso) : "Por confirmar"}</b>
                    {p.peso > 0 && <small className="cat-num">{kilos(p.peso)} ÷ {KG_POR_CBM} kg</small>}</div>
                  <div className="cat-dato cobro"><small><Ship size={13} />CBM a cobrar</small>
                    <b className="cat-num">{p.cobrable > 0 ? `${m3(p.cobrable)}, por ${p.por}` : "Por confirmar"}</b></div>
                </div>
              </>
            ) : p.peso > 0 && (
              <div className="cat-datos">
                <div className="cat-dato"><small><Scale size={13} />Peso</small><b className="cat-num">{kilos(p.peso)}</b></div>
              </div>
            )}
            {f.empaque && <div className="cat-dato"><small>Medidas de empaque</small><b className="cat-num">{f.empaque}</b></div>}
            <div style={{ marginTop: 6 }}>
              <button type="button" className="cat-btn claro" onClick={compartir}>
                {copiado ? <><Check size={17} />Enlace copiado</> : <><Share2 size={17} />Compartir este equipo</>}
              </button>
            </div>
          </div>
        </div>
        {(f.caracteristicas.length > 0 || f.ficha.length > 0 || f.incluye.length > 0 || f.opcionales.length > 0) && (
          <div className="cat-secciones">
            {f.caracteristicas.length > 0 && (
              <section className="cat-seccion">
                <h4>Características</h4>
                <ul className="cat-lista">{f.caracteristicas.map((c, i) => <li key={i}><Check size={16} /><span>{c}</span></li>)}</ul>
              </section>
            )}
            {f.ficha.length > 0 && (
              <section className="cat-seccion">
                <h4>Ficha técnica</h4>
                <table className="cat-tabla"><tbody>
                  {f.ficha.map(([k, v], i) => <tr key={i}><th scope="row">{k}</th><td className="cat-num">{v}</td></tr>)}
                </tbody></table>
              </section>
            )}
            {f.incluye.length > 0 && (
              <section className="cat-seccion" style={{ gridColumn: f.incluye.length > 8 ? "1 / -1" : undefined }}>
                <h4>Incluye</h4>
                <ul className="cat-incluye">{f.incluye.map((c, i) => <li key={i}>{c}</li>)}</ul>
              </section>
            )}
            {f.opcionales.length > 0 && (
              <section className="cat-seccion">
                <h4>Accesorios opcionales</h4>
                <ul className="cat-lista">{f.opcionales.map((c, i) => <li key={i}><Check size={16} /><span>{c}</span></li>)}</ul>
              </section>
            )}
          </div>
        )}
      </article>
    </div>
  );
}

/** Enlace para compartir el catálogo, con botones de copiar y abrir. */
export function EnlaceCatalogo({ modo, avisar }) {
  const enlace = `${window.location.origin}${RUTAS[modo]}`;
  const copiar = async () => {
    try { await navigator.clipboard.writeText(enlace); avisar?.("Enlace copiado"); }
    catch { avisar?.("Selecciona el enlace y cópialo manualmente.", "error"); }
  };
  return (
    <div className="cat-enlace">
      <input readOnly value={enlace} aria-label={`Enlace del ${TITULOS[modo].toLowerCase()}`} onFocus={(e) => e.target.select()} />
      <button type="button" className="cat-btn" onClick={copiar}><Share2 size={16} />Copiar enlace</button>
      <a className="cat-btn claro" href={enlace} target="_blank" rel="noopener noreferrer">Abrir</a>
    </div>
  );
}

/** Cambia el precio que se paga por cada CBM en todos los equipos a la vez. */
function PrecioCbmGeneral({ productos, cambiar }) {
  const actual = useMemo(() => {
    const cuenta = new Map();
    for (const p of productos) cuenta.set(p.precioCbm, (cuenta.get(p.precioCbm) || 0) + 1);
    return [...cuenta.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || 0;
  }, [productos]);
  const distintos = productos.filter((p) => p.precioCbm !== actual).length;
  const [texto, setTexto] = useState(String(actual || ""));
  const [trabajando, setTrabajando] = useState(false);
  useEffect(() => { setTexto(String(actual || "")); }, [actual]);
  const n = parseFloat(String(texto).replace(",", "."));
  const valido = !isNaN(n) && n > 0;
  const enviar = async () => { setTrabajando(true); await cambiar(n); setTrabajando(false); };
  return (
    <section className="cat-general">
      <div>
        <b>Precio del CBM</b>
        <small>
          Lo que te cobran hoy por cada m³. El flete de cada equipo es su CBM a cobrar por este precio.
          {distintos > 0 && ` ${distintos} ${distintos === 1 ? "equipo tiene" : "equipos tienen"} otro precio.`}
        </small>
      </div>
      <div className="cat-porcentajes">
        <label className="cat-otro cat-cbm">US$
          <input className="cat-num" inputMode="decimal" aria-label="Precio del CBM en dólares" value={texto} onChange={(e) => setTexto(e.target.value)} />
          por m³
        </label>
        <button type="button" className="cat-btn" disabled={!valido || trabajando || (n === actual && distintos === 0)} onClick={enviar}>
          {trabajando ? "Guardando…" : "Aplicar a todos los equipos"}
        </button>
      </div>
    </section>
  );
}

/** Aplica un mismo porcentaje de ganancia a todos los equipos. */
function GananciaGeneral({ cuantos, aplicar }) {
  const [porcentaje, setPorcentaje] = useState("");
  const [confirmar, setConfirmar] = useState(false);
  const [trabajando, setTrabajando] = useState(false);
  const n = parseFloat(String(porcentaje).replace(",", "."));
  const valido = !isNaN(n) && n >= 0;
  const enviar = async () => { setTrabajando(true); await aplicar(n); setTrabajando(false); setConfirmar(false); };
  return (
    <section className="cat-general">
      <div>
        <b>Ganancia para todos los equipos</b>
        <small>Calcula el precio de venta sobre el costo (producto + flete). Después puedes ajustar cada equipo.</small>
      </div>
      <div className="cat-porcentajes" role="group" aria-label="Ganancia para todos">
        {PORCENTAJES.map((x) => (
          <button type="button" key={x} className="cat-porc" aria-pressed={n === x} onClick={() => { setPorcentaje(String(x)); setConfirmar(false); }}>{x}%</button>
        ))}
        <label className="cat-otro">
          <input className="cat-num" inputMode="decimal" placeholder="Otro" aria-label="Otro porcentaje para todos"
            value={PORCENTAJES.includes(n) ? "" : porcentaje} onChange={(e) => { setPorcentaje(e.target.value); setConfirmar(false); }} />%
        </label>
        {!confirmar && <button type="button" className="cat-btn" disabled={!valido} onClick={() => setConfirmar(true)}>Aplicar a todos</button>}
      </div>
      {confirmar && (
        <div className="cat-confirmar" role="alert">
          <span>Se cambiará el precio de venta de {cuantos} equipos a costo + {n}%, incluidos los que escribiste a mano.</span>
          <button type="button" className="cat-btn claro" onClick={() => setConfirmar(false)}>Cancelar</button>
          <button type="button" className="cat-btn" onClick={enviar} disabled={trabajando}>{trabajando ? "Aplicando…" : "Sí, aplicar"}</button>
        </div>
      )}
    </section>
  );
}

const RUTAS = { cliente: "/catalogo", interno: "/catalogo-interno" };
const API = { cliente: "/api/catalogo", interno: "/api/catalogo-interno" };
const TITULOS = { cliente: "Catálogo para clientes", interno: "Catálogo interno" };

/**
 * modo "cliente": precio de venta, sin costos. modo "interno": precio de costo, flete y CBM.
 * Con `productos` se muestra dentro de la app; con `guardarPrecio` cada equipo trae su editor de precio de venta.
 */
export default function Catalogo({ modo = "cliente", productos: propios, guardarPrecio, aplicarGanancia, cambiarPrecioCbm, avisar }) {
  const dentro = Array.isArray(propios);
  const [descargados, setProductos] = useState([]);
  const [descarga, setEstado] = useState("cargando");
  const productos = useMemo(() => (dentro ? propios.map(normalizar) : descargados), [dentro, propios, descargados]);
  const estado = dentro ? "listo" : descarga;
  const [q, setQ] = useState("");
  const [categoria, setCategoria] = useState("");
  const [abierto, setAbierto] = useState(() => decodeURIComponent(window.location.hash.slice(1)));

  useEffect(() => {
    if (dentro) return;
    const controller = new AbortController();
    (async () => {
      let lista = null;
      try {
        const res = await fetch(API[modo], { cache: "no-store", signal: controller.signal });
        const data = await res.json();
        if (res.ok && Array.isArray(data)) lista = data;
      } catch (error) { if (error.name === "AbortError") return; }
      // Sin conexión con la base de datos se muestra el catálogo XPROMISE que viene con la página.
      setProductos((lista ?? CATALOGO_XPROMISE).map(normalizar));
      setEstado("listo");
    })();
    return () => controller.abort();
  }, [dentro, modo]);

  useEffect(() => {
    const alCambiar = () => setAbierto(decodeURIComponent(window.location.hash.slice(1)));
    window.addEventListener("hashchange", alCambiar);
    return () => window.removeEventListener("hashchange", alCambiar);
  }, []);

  const abrir = (codigo) => { window.history.pushState(null, "", `#${encodeURIComponent(codigo)}`); setAbierto(codigo); };
  const cerrar = useMemo(() => () => {
    window.history.pushState(null, "", window.location.pathname + window.location.search);
    setAbierto("");
  }, []);

  const categorias = useMemo(() => {
    const cuenta = new Map();
    for (const p of productos) cuenta.set(p.categoria, (cuenta.get(p.categoria) || 0) + 1);
    return [...cuenta.entries()].sort((a, b) => a[0].localeCompare(b[0], "es"));
  }, [productos]);

  const filtrados = useMemo(() => {
    const s = sinAcentos(q.trim());
    return productos.filter((p) => (!categoria || p.categoria === categoria) &&
      (!s || sinAcentos(`${p.codigo} ${p.nombre} ${p.categoria} ${p.ficha.marca}`).includes(s)));
  }, [productos, q, categoria]);

  const seleccionado = abierto ? productos.find((p) => p.codigo.toLowerCase() === abierto.toLowerCase()) : null;
  const sinPrecio = productos.filter((p) => p.venta <= 0).length;

  return (
    <div className={`cat cat-${modo}${dentro ? " cat-dentro" : ""}`}>
      <style>{ESTILOS}</style>
      <header className="cat-top">
        <div className="cat-wrap cat-top-in">
          <div className="cat-marca">
            <img src={LOGO_POR_DEFECTO} alt="" />
            <div><b>Taller Gregoriana</b><span>Taller Mecánico y Lubricentro</span></div>
          </div>
          {modo === "interno" ? <>
            <span className="cat-aviso">Uso interno · precios de costo</span>
            <h1>Catálogo <em>interno</em></h1>
            <p>Precio de costo, flete y CBM de cada equipo. No lo compartas con clientes.</p>
          </> : dentro ? <>
            <h1>Catálogo para <em>clientes</em></h1>
            <p>Define aquí el precio de venta de cada equipo. Tus clientes solo ven el precio de venta, nunca el costo.</p>
          </> : <>
            <h1>Catálogo de <em>equipos</em> para taller</h1>
            <p>Elevadores, alineadoras, desmontadoras, balanceadoras y más. Toca un equipo para ver su ficha técnica completa.</p>
          </>}
          {dentro && <EnlaceCatalogo modo={modo} avisar={avisar} />}
          <div className="cat-buscar">
            <Search size={20} aria-hidden="true" />
            <input type="search" placeholder="Buscar por modelo, nombre o categoría" aria-label="Buscar equipo"
              value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </div>
      </header>

      {estado === "listo" && categorias.length > 1 && (
        <nav className="cat-filtros" aria-label="Categorías">
          <div className="cat-wrap cat-pills">
            <button type="button" className="cat-pill" aria-pressed={!categoria} onClick={() => setCategoria("")}>
              Todos<i>{productos.length}</i>
            </button>
            {categorias.map(([c, n]) => (
              <button type="button" key={c} className="cat-pill" aria-pressed={categoria === c} onClick={() => setCategoria(c)}>
                {c}<i>{n}</i>
              </button>
            ))}
          </div>
        </nav>
      )}

      <main className="cat-wrap">
        {estado === "cargando" ? <p className="cat-cuenta" role="status">Cargando equipos…</p> : <>
          {aplicarGanancia && productos.length > 0 && <GananciaGeneral cuantos={productos.length} aplicar={aplicarGanancia} />}
          {cambiarPrecioCbm && productos.length > 0 && <PrecioCbmGeneral productos={productos} cambiar={cambiarPrecioCbm} />}
          <p className="cat-cuenta" role="status">
            {filtrados.length === productos.length ? `${productos.length} equipos` : `${filtrados.length} de ${productos.length} equipos`}
            {guardarPrecio && sinPrecio > 0 && ` · ${sinPrecio} sin precio de venta`}
          </p>
          {!productos.length ? <div className="cat-vacio">Próximamente encontrarás nuestros equipos aquí.</div> :
            !filtrados.length ? (
              <div className="cat-vacio">
                <p style={{ margin: "0 0 14px" }}>Ningún equipo coincide con tu búsqueda.</p>
                <button type="button" className="cat-btn" onClick={() => { setQ(""); setCategoria(""); }}>Ver todos los equipos</button>
              </div>
            ) : <div className="cat-grid">{filtrados.map((p) => <Tarjeta key={p.id} p={p} modo={modo} abrir={() => abrir(p.codigo)} guardar={guardarPrecio} />)}</div>}
        </>}
      </main>

      <footer className="cat-pie-pagina">Taller Gregoriana · Precios en dólares.</footer>

      {seleccionado && <Ficha p={seleccionado} modo={modo} cerrar={cerrar} />}
    </div>
  );
}
