import { useState, useEffect, useMemo } from "react";
import { Search, X, Camera, Share2, Check, Box, Scale, Ship, ChevronRight, Plus, Minus, Trash2, Send, ClipboardList, MapPin, Factory } from "lucide-react";
import { LOGO_POR_DEFECTO } from "./logo.js";
import { hojaImagen, TIEMPOS_ENTREGA, DIAS_PRODUCCION, DIAS_ENVIO } from "./hoja.js";
import { leerDescripcion } from "./descripcion.js";
import { T, EN, IDIOMA, cambiarIdioma, fijarIdioma } from "./idioma.js";
import { CATALOGO_XPROMISE } from "./catalogoXpromise.js";

const KG_POR_CBM = 350;
const MINIMO_CBM = 1; // el transporte cobra como mínimo 1 CBM por cada máquina
const dinero = (n) => "US$" + (n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
// Tipo de cambio oficial del Banco Central de Nicaragua para 2026 (fijo todo el año). El taller lo puede cambiar
// en Producto, en los datos de la empresa; la página lo toma de /api/contacto.
export const TASA_OFICIAL = 36.6243;
let tasaCordoba = TASA_OFICIAL;
const cordobas = (usd) => "C$ " + Math.round((usd || 0) * tasaCordoba).toLocaleString("en-US");
const m3 = (n) => (n || 0).toLocaleString("en-US", { maximumFractionDigits: 3 }) + " m³";
const kilos = (n) => (n || 0).toLocaleString("en-US", { maximumFractionDigits: 2 }) + " kg";
const sinAcentos = (v) => String(v || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/* ---------- portada "Puerto con categorías": la foto del puerto de fondo y una ficha por categoría ---------- */
export const ESTILOS_VITRINA = `
.cat-idioma { position:absolute; right:20px; top:26px; z-index:3; display:inline-flex; gap:2px; padding:3px; border-radius:999px; background:rgba(255,255,255,.16); backdrop-filter:blur(6px); }
.cat-idioma button { border:0; border-radius:999px; padding:6px 13px; background:none; color:#fff; font:inherit; font-size:14px; font-weight:700; cursor:pointer; }
.cat-idioma button[aria-pressed="true"] { background:#fff; color:#0A1F44; }
.cat-idioma button:focus-visible { outline:3px solid #FF8A1F; outline-offset:2px; }
@media (max-width:520px) { .cat-idioma { right:12px; top:18px; } .cat-idioma button { padding:5px 10px; font-size:13px; } }
.cats-portada { display:grid; grid-template-columns:repeat(auto-fill,minmax(210px,1fr)); gap:12px; }
.cats-boton { display:flex; align-items:center; gap:4px; min-height:84px; padding:0; border:0; border-radius:12px; overflow:hidden; text-align:left;
  font:inherit; color:#0A1F44; background:rgba(255,255,255,.96); cursor:pointer; transition:transform .15s, box-shadow .15s; }
.cats-boton:hover { transform:translateY(-2px); box-shadow:0 10px 22px rgba(3,10,26,.45); }
.cats-boton:focus-visible { outline:3px solid #FF8A1F; outline-offset:2px; }
.cats-boton[aria-pressed="true"] { box-shadow:0 0 0 3px #FF8A1F; }
.cats-boton img, .cats-boton i { width:84px; height:84px; flex:none; background:#fff; }
.cats-boton img { object-fit:contain; padding:6px; }
.cats-boton i { display:grid; place-items:center; background:#E6EDF6; color:#1556B8; font-style:normal;
  font-family:'Barlow Condensed',sans-serif; font-weight:800; font-size:32px; }
.cats-boton span { padding:8px 12px 8px 6px; min-width:0; }
.cats-boton b { display:block; font-family:'Barlow Condensed',sans-serif; font-weight:700; font-size:19px; line-height:1.05; overflow-wrap:anywhere; }
.cats-boton small { font-size:13px; font-weight:500; color:#5B6B75; }
@media (max-width:520px) {
  .cats-portada { grid-template-columns:repeat(2,minmax(0,1fr)); gap:8px; }
  .cats-boton { min-height:64px; } .cats-boton img, .cats-boton i { width:60px; height:60px; } .cats-boton b { font-size:17px; }
}
`;

/** Botón ES / EN de las páginas del cliente. */
function SelectorIdioma({ cambiar = cambiarIdioma }) {
  return (
    <div className="cat-idioma" role="group" aria-label="Idioma / Language">
      <button type="button" aria-pressed={!EN} onClick={() => EN && cambiar("es")}>Español</button>
      <button type="button" aria-pressed={EN} onClick={() => !EN && cambiar("en")}>English</button>
    </div>
  );
}

/** Una ficha por categoría, con la foto de uno de sus productos y cuántos tiene. */
export function Categorias({ productos, activa = "", elegir }) {
  const lista = useMemo(() => {
    const grupos = new Map();
    for (const p of productos || []) {
      const nombre = p.categoria || "Sin categoría";
      const g = grupos.get(nombre) || { nombre, vista: p.categoriaVista || T(nombre), cantidad: 0, foto: "" };
      g.cantidad += 1;
      if (!g.foto && p.foto) g.foto = p.foto;
      grupos.set(nombre, g);
    }
    return [...grupos.values()].sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
  }, [productos]);
  if (!lista.length) return null;
  return (
    <div className="cats-portada">
      {lista.map((g) => (
        <button type="button" key={g.nombre} className="cats-boton" aria-pressed={activa === g.nombre} onClick={() => elegir(g.nombre)}>
          {g.foto ? <img src={g.foto} alt="" loading="lazy" /> : <i aria-hidden="true">{g.nombre.slice(0, 1).toUpperCase()}</i>}
          <span><b>{g.vista}</b><small>{g.cantidad} {T(g.cantidad === 1 ? "producto" : "productos")}</small></span>
        </button>
      ))}
    </div>
  );
}

const ESTILOS = `${ESTILOS_VITRINA}
.cat { font-family:'Barlow',system-ui,-apple-system,'Segoe UI',sans-serif; color:#14222B; background:#EEF2F4; min-height:100vh; }
.cat-cond { font-family:'Barlow Condensed','Arial Narrow',system-ui,sans-serif; }
.cat-num { font-variant-numeric:tabular-nums; }
.cat ::selection { background:#FF8A1F; color:#14222B; }
.cat { accent-color:#1556B8; }
.cat-wrap { max-width:1240px; margin:0 auto; padding:0 20px; }

.cat-top { background:#14222B; color:#fff; position:relative; overflow:hidden; }
.cat-top::after { content:""; position:absolute; left:0; right:0; bottom:0; height:8px;
  background:repeating-linear-gradient(135deg,#FF8A1F 0 14px,#14222B 14px 28px); }
.cat-top::before { content:""; position:absolute; right:-120px; top:-160px; width:520px; height:520px; border-radius:50%;
  background:radial-gradient(circle,rgba(27,94,107,.75) 0%,rgba(27,94,107,0) 68%); }
.cat-top-in { position:relative; padding:28px 0 36px; }
.cat-marca { display:flex; align-items:center; gap:12px; }
.cat-marca img { height:46px; max-width:92px; object-fit:contain; background:#fff; border-radius:8px; padding:4px 7px; }
.cat-marca b { font-family:'Barlow Condensed',sans-serif; font-size:21px; font-weight:700; line-height:1; }
.cat-marca span { display:block; font-size:12px; color:#9FB0B9; margin-top:3px; }
.cat-top h1 { font-family:'Barlow Condensed',sans-serif; font-weight:700; font-size:clamp(38px,7vw,64px); line-height:.98;
  margin:26px 0 8px; letter-spacing:.005em; text-wrap:balance; }
.cat-top h1 em { font-style:normal; color:#FF8A1F; }
.cat-top p { margin:0; color:#C4D1D7; font-size:16px; max-width:560px; line-height:1.45; }
.cat-buscar { position:relative; margin-top:22px; max-width:560px; }
.cat-buscar svg { position:absolute; left:16px; top:50%; transform:translateY(-50%); color:#5B6B75; }
.cat-buscar input { width:100%; border:0; border-radius:12px; padding:15px 16px 15px 46px; font-size:17px; color:#14222B;
  background:#fff; box-shadow:0 8px 28px rgba(0,0,0,.28); }
.cat-buscar input:focus { outline:3px solid #FF8A1F; outline-offset:2px; }

.cat-amarilla .cat-top { background:#0A1F44 url(/marca/portada.jpg) center 40% / cover; color:#fff; }
.cat-amarilla .cat-top::before { inset:0; width:auto; height:auto; border-radius:0;
  background:linear-gradient(180deg,rgba(7,24,51,.3) 0%,rgba(7,24,51,.74) 45%,#071833 100%),linear-gradient(90deg,rgba(7,24,51,.85) 0%,rgba(7,24,51,0) 70%); }
.cat-amarilla .cat-top::after { display:none; }
.cat-amarilla .cat-top-in { padding:28px 20px 30px; }
.cat-amarilla .cat-marca span { color:#C9D6EC; }
.cat-amarilla .cat-top h1 { font-weight:800; font-size:clamp(40px,5.4vw,64px); }
.cat-amarilla .cat-top h1 em { color:#FFB45C; }
.cat-amarilla .cat-top p { color:#DCE5F3; font-weight:500; }
.cat-amarilla .cat-buscar input:focus, .cat-amarilla .cat-tabs button:focus-visible { outline-color:#FF8A1F; }
.cat-amarilla .cat-tabs i { background:#FF8A1F; color:#1B1000; }
.cat-amarilla .cat-mis-boton { background:#FF8A1F; color:#1B1000; }
.cat-amarilla .cat-mis-boton:hover { background:#FFA14A; }
.cat-amarilla .cats-portada { margin-top:26px; }
#cat-lista { scroll-margin-top:70px; }
.cat-filtros { position:sticky; top:0; z-index:20; background:rgba(238,242,244,.94); backdrop-filter:blur(8px);
  border-bottom:1px solid #D5DEE3; }
.cat-pills { display:flex; gap:8px; overflow-x:auto; padding:12px 0; scrollbar-width:none; }
.cat-pills::-webkit-scrollbar { display:none; }
.cat-pill { flex-shrink:0; border:1px solid #CAD4DA; background:#fff; color:#314551; border-radius:999px; padding:8px 15px;
  font-size:14px; font-weight:600; display:inline-flex; align-items:center; gap:7px; transition:background .15s,color .15s,border-color .15s; }
.cat-pill:hover { border-color:#1556B8; }
.cat-pill i { font-style:normal; font-size:12px; font-weight:700; color:#5B6B75; background:#EEF2F4; border-radius:999px; padding:1px 7px; }
.cat-pill[aria-pressed="true"] { background:#1556B8; border-color:#1556B8; color:#fff; }
.cat-pill[aria-pressed="true"] i { background:#FF8A1F; color:#14222B; }
.cat-pill:focus-visible, .cat-card:focus-visible, .cat-btn:focus-visible, .cat-cerrar:focus-visible { outline:3px solid #FF8A1F; outline-offset:2px; }

.cat-cuenta { color:#5B6B75; font-size:14px; margin:20px 0 14px; }
.cat-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(min(270px,100%),1fr)); gap:18px; padding-bottom:96px; }
.cat-card { background:#fff; border:1px solid #D5DEE3; border-radius:16px; overflow:hidden; text-align:left; padding:0;
  display:flex; flex-direction:column; cursor:pointer; transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease; }
.cat-card:hover { transform:translateY(-4px); box-shadow:0 16px 36px rgba(20,34,43,.14); border-color:#9DB9E8; }
.cat-foto { position:relative; aspect-ratio:4/3; background:#fff; display:flex; align-items:center; justify-content:center;
  border-bottom:1px solid #E6ECEF; }
.cat-foto { overflow:hidden; }
.cat-foto img { position:absolute; inset:0; width:100%; height:100%; object-fit:contain; padding:14px; transition:transform .3s ease; }
.cat-card:hover .cat-foto img { transform:scale(1.04); }
.cat-insignia { position:absolute; right:12px; top:12px; z-index:1; background:#FF8A1F; color:#1B1000; border-radius:999px; padding:4px 11px; font-size:12px; font-weight:800;
  letter-spacing:.05em; text-transform:uppercase; box-shadow:0 4px 10px rgba(0,0,0,.18); }
.cat-insignia.oferta { background:#E0242B; color:#fff; }
.cat-antes { display:inline-block; margin-left:8px; color:#8A97A0; font-size:15px; font-weight:600; }
.cat-barra { display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:8px 16px; }
.cat-ordenar { display:inline-flex; align-items:center; gap:8px; font-size:14px; font-weight:600; color:#5B6B75; }
.cat-ordenar select { border:1px solid #CAD4DA; border-radius:8px; padding:8px 10px; background:#fff; color:#14222B; font:inherit; font-size:14.5px; font-weight:600; }
.cat-ordenar select:focus { outline:3px solid #FF8A1F; outline-offset:1px; }
.cat-card { border-top:4px solid #1556B8; }
.cat-card:nth-child(3n+2) { border-top-color:#FF8A1F; }
.cat-card:nth-child(3n) { border-top-color:#E0242B; }
.cat-etiqueta { position:absolute; left:12px; top:12px; background:#0A1F44; color:#fff; border-radius:6px; padding:3px 9px;
  font-size:11px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; }
.cat-cuerpo { padding:16px 16px 14px; display:flex; flex-direction:column; gap:6px; flex:1; }
.cat-categoria { font-size:11px; font-weight:700; letter-spacing:.09em; text-transform:uppercase; color:#1556B8; }
.cat-modelo { font-family:'Barlow Condensed',sans-serif; font-size:30px; font-weight:700; line-height:1; overflow-wrap:anywhere; }
.cat-nombre { font-size:15px; line-height:1.3; color:#314551; font-weight:500; overflow-wrap:anywhere;
  min-height:2.6em; display:-webkit-box; -webkit-box-orient:vertical; -webkit-line-clamp:2; line-clamp:2; overflow:hidden; }
.cat-cordobas { display:block; font-size:14px; font-weight:700; color:#5B6B75; margin-top:2px; }
.cat-cordobas.grande { font-size:18px; color:#0E3A8A; margin-top:4px; }
.cat-puesto { display:inline-flex; align-items:center; gap:4px; margin-top:7px; padding:3px 8px 3px 6px; border-radius:999px;
  background:#E8F6EE; color:#14603A; font-size:11.5px; font-weight:700; line-height:1.2; letter-spacing:.01em; }
.cat-puesto svg { flex-shrink:0; }
.cat-puesto.grande { font-size:13.5px; padding:4px 10px 4px 8px; margin-top:8px; }
.cat-tiempos-p { display:flex; flex-direction:column; gap:3px; margin-top:7px; font-size:12px; color:#314551; line-height:1.25; }
.cat-tiempos-p > span { display:inline-flex; align-items:center; gap:5px; }
.cat-tiempos-p svg { flex-shrink:0; color:#1556B8; }
.cat-precio .cat-tiempos-p b, .cat-tiempos-p b { font-family:inherit; font-size:inherit; line-height:inherit; font-weight:700; color:#0E3A8A; }
.cat-tiempos-p.grande { flex-direction:row; flex-wrap:wrap; gap:6px 18px; font-size:14px; margin-top:10px; }
.cat-puesto-total { display:flex; align-items:center; justify-content:flex-end; gap:5px; margin:0 0 8px; font-size:13px; font-weight:700; color:#14603A; }
.cat-total-cordobas { margin:-2px 0 6px; text-align:right; font-size:17px; font-weight:700; color:#0E3A8A; }
.cat-total-cordobas span { font-size:12.5px; font-weight:500; color:#5B6B75; }
.cat-chips { display:flex; flex-wrap:wrap; gap:6px; margin-top:6px; }
.cat-chip { display:inline-flex; align-items:center; gap:5px; background:#F3F6F7; border-radius:6px; padding:4px 8px; font-size:12.5px;
  font-weight:600; color:#314551; }
.cat-pie { margin-top:auto; padding-top:12px; display:flex; align-items:flex-end; justify-content:space-between; gap:8px; }
.cat-precio small { display:block; font-size:11px; font-weight:600; color:#5B6B75; letter-spacing:.04em; text-transform:uppercase; }
.cat-precio b { font-family:'Barlow Condensed',sans-serif; font-size:28px; font-weight:700; line-height:1.05; color:#0E3A8A; }
.cat-ver { display:inline-flex; align-items:center; gap:2px; font-size:13px; font-weight:700; color:#1556B8; white-space:nowrap; }

.cat-vacio { background:#fff; border:1px dashed #B9C6CD; border-radius:16px; padding:44px 20px; text-align:center; color:#5B6B75; margin-bottom:56px; }
.cat-btn { border-radius:8px; padding:10px 16px; font-weight:600; font-size:15px; display:inline-flex; align-items:center; gap:7px;
  background:#1556B8; color:#fff; border:0; }
.cat-btn:hover { background:#0E3A8A; }
.cat-btn.claro { background:#fff; color:#1556B8; border:1px solid #CAD4DA; }
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
.cat-precio-grande { background:#EAF1FC; border-radius:12px; padding:12px 16px; box-shadow:inset 4px 0 0 #1556B8; margin-top:4px; }
.cat-precio-grande small { display:block; font-size:12px; font-weight:600; color:#0E3A8A; text-transform:uppercase; letter-spacing:.05em; }
.cat-precio-grande b { font-family:'Barlow Condensed',sans-serif; font-size:40px; line-height:1.05; color:#0E3A8A; }
.cat-datos { display:grid; grid-template-columns:repeat(auto-fit,minmax(130px,1fr)); gap:8px; }
.cat-dato { background:#F3F6F7; border-radius:10px; padding:10px 12px; min-width:0; }
.cat-dato small { display:flex; align-items:center; gap:5px; font-size:12px; color:#5B6B75; font-weight:600; }
.cat-dato b { display:block; font-size:16px; margin-top:2px; overflow-wrap:anywhere; }
.cat-dato.cobro { background:#FFF4CC; box-shadow:inset 0 0 0 2px #FF8A1F; }
.cat-dato.cobro small, .cat-dato.cobro b { color:#7A5900; }
.cat-secciones { padding:6px 28px 28px; display:grid; grid-template-columns:repeat(auto-fit,minmax(min(320px,100%),1fr)); gap:22px 32px;
  border-top:1px solid #E6ECEF; }
.cat-seccion h4 { font-family:'Barlow Condensed',sans-serif; font-size:22px; font-weight:700; margin:20px 0 10px; display:flex; align-items:center; gap:10px; }
.cat-seccion h4::before { content:""; width:6px; height:20px; background:#FF8A1F; border-radius:2px; }
.cat-lista { list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:8px; }
.cat-lista li { display:flex; gap:9px; line-height:1.4; font-size:15px; overflow-wrap:anywhere; }
.cat-lista svg { flex-shrink:0; color:#1556B8; margin-top:3px; }
.cat-tabla { width:100%; border-collapse:collapse; font-size:14.5px; }
.cat-tabla th, .cat-tabla td { text-align:left; padding:8px 10px; vertical-align:top; overflow-wrap:anywhere; }
.cat-tabla th { font-weight:500; color:#5B6B75; width:46%; }
.cat-tabla td { font-weight:600; }
.cat-tabla tr:nth-child(odd) { background:#F3F6F7; }
.cat-incluye { columns:2; column-gap:22px; margin:0; padding:0; list-style:none; font-size:14.5px; }
.cat-incluye li { break-inside:avoid; padding:5px 0; border-bottom:1px solid #EEF2F4; overflow-wrap:anywhere; }
.cat-pie-pagina { background:#14222B; color:#9FB0B9; font-size:13px; text-align:center; padding:22px 16px; }
.cat-dentro { min-height:0; border-radius:14px; overflow:clip; border:1px solid #CAD4DA; }
.cat-interno.cat-dentro .cat-top h1 { font-size:clamp(32px,5vw,48px); margin-top:18px; }
.cat-propio { background:#14222B; color:#fff; padding:16px 20px 18px; }
.cat-propio b { font-family:'Barlow Condensed',sans-serif; font-size:22px; font-weight:700; }
.cat-propio p { margin:4px 0 0; color:#C4D1D7; font-size:15px; line-height:1.4; max-width:760px; }
.cat-propio .cat-enlace { margin-top:12px; }

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
.cat-aviso { display:inline-block; margin-top:20px; background:#FF8A1F; color:#14222B; border-radius:6px; padding:4px 10px; font-size:12px;
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

.cat-opciones { padding:0 14px 12px; }
.cat-ficha-info .cat-opciones { padding:0; margin:2px 0 4px; }
.cat-opciones small { display:block; font-size:12px; font-weight:700; letter-spacing:.05em; text-transform:uppercase; color:#1556B8; margin-bottom:7px; }
.cat-opciones > div { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:8px; }
.cat-ficha-info .cat-opciones > div { grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); }
.cat-opcion { display:flex; flex-direction:column; justify-content:center; gap:4px; width:100%; min-height:48px; border:1.5px solid #C9D8F0; border-radius:11px;
  padding:9px 11px; background:#F3F7FE; color:#0A1F44; font:inherit; line-height:1.15; text-align:left; cursor:pointer;
  transition:transform .12s, box-shadow .12s, border-color .12s; }
.cat-opcion:hover { border-color:#1556B8; transform:translateY(-1px); }
.cat-opcion b { font-size:14px; font-weight:700; overflow-wrap:anywhere; }
.cat-opcion span { font-family:'Barlow Condensed',sans-serif; font-size:17px; font-weight:700; color:#1556B8; }
.cat-opcion[aria-pressed="true"] { border-color:#1556B8; background:linear-gradient(135deg,#1B5FCC 0%,#0E3A8A 100%); color:#fff; box-shadow:0 8px 18px rgba(21,86,184,.32); }
.cat-opcion[aria-pressed="true"] span { color:#FFC27A; }
.cat-opcion:focus-visible { outline:3px solid #FF8A1F; outline-offset:2px; }
.cat-card-editable { cursor:default; }
.cat-card-editable:hover { transform:none; }
.cat-card-abrir { display:flex; flex-direction:column; text-align:left; padding:0; border:0; background:none; width:100%; cursor:pointer; }
.cat-card-abrir:focus-visible, .cat-porc:focus-visible { outline:3px solid #FF8A1F; outline-offset:-3px; }
.cat-card-editable .cat-cuerpo { flex:1 1 auto; padding-bottom:10px; }
.cat-card-editable .cat-card-abrir { flex:1 1 auto; }
.cat-editor { margin-top:auto; padding:12px 14px 14px; background:#F6F8F9; border-top:1px solid #E6ECEF; display:flex; flex-direction:column; gap:9px; }
.cat-costo { display:flex; flex-direction:column; font-size:14px; color:#314551; }
.cat-costo b { font-size:16px; color:#14222B; }
.cat-costo small { font-size:12px; color:#5B6B75; line-height:1.3; }
.cat-porcentajes { display:flex; flex-wrap:wrap; align-items:center; gap:6px; }
.cat-porc { border:1px solid #CAD4DA; background:#fff; color:#314551; border-radius:8px; padding:7px 10px; font-size:14px; font-weight:700; min-width:48px; }
.cat-porc:hover:not(:disabled) { border-color:#1556B8; }
.cat-porc[aria-pressed="true"] { background:#1556B8; border-color:#1556B8; color:#fff; }
.cat-porc:disabled { opacity:.5; cursor:not-allowed; }
.cat-otro { display:inline-flex; align-items:center; gap:3px; font-size:14px; font-weight:700; color:#314551; }
.cat-otro input { width:58px; border:1px solid #CAD4DA; border-radius:8px; padding:7px 8px; font-size:14px; background:#fff; color:#14222B; }
.cat-cbm input { width:86px; font-size:17px; font-weight:700; }
.cat-dato small + b + small { display:block; margin-top:2px; font-weight:500; }
.cat-estado-wa { margin-top:8px !important; color:#FF8A1F !important; font-size:14.5px !important; }
.cat-pedir { margin-top:auto; padding:0 14px 14px; }
.cat-consultar { width:100%; justify-content:center; margin-bottom:8px; background:#128C4A; color:#fff; text-decoration:none; font-weight:700; }
.cat-consultar:hover { background:#0E6F3B; }
.cat-agregar { width:100%; justify-content:center; background:#FF8A1F; color:#1B1000; border:0; font-weight:700; box-shadow:0 6px 14px rgba(255,138,31,.3); }
.cat-agregar:hover { background:#FFA14A; }
.cat-cantidad { display:flex; align-items:center; justify-content:space-between; gap:6px; background:#EAF1FC; border-radius:8px; padding:4px;
  font-size:14px; font-weight:600; color:#0E3A8A; min-width:0; }
.cat-cantidad button { width:36px; height:36px; flex-shrink:0; border:0; border-radius:6px; background:#1556B8; color:#fff; display:flex; align-items:center; justify-content:center; }
.cat-cantidad button:hover { background:#0E3A8A; }
.cat-cantidad button:focus-visible, .cat-flotante:focus-visible { outline:3px solid #FF8A1F; outline-offset:2px; }
.cat-flotante { position:fixed; left:50%; bottom:max(16px,env(safe-area-inset-bottom)); transform:translateX(-50%); z-index:40; border:0; border-radius:999px;
  background:#14222B; color:#fff; padding:12px 14px 12px 18px; display:flex; align-items:center; gap:10px; font-size:15px; font-weight:600;
  box-shadow:0 10px 30px rgba(20,34,43,.4); max-width:calc(100vw - 24px); white-space:nowrap; }
.cat-flotante b { background:#FF8A1F; color:#14222B; border-radius:999px; padding:6px 12px; font-size:14px; }
.cat-panel { max-width:640px; }
.cat-panel-in { padding:24px 24px 22px; }
.cat-panel-in h2 { font-size:34px; font-weight:700; margin:0 0 14px; line-height:1; }
.cat-lineas { list-style:none; margin:0; padding:0; display:flex; flex-direction:column; }
.cat-lineas li { display:flex; gap:12px; align-items:center; padding:12px 0; border-bottom:1px solid #E6ECEF; flex-wrap:wrap; }
.cat-linea-foto { width:60px; height:60px; flex-shrink:0; border:1px solid #E6ECEF; border-radius:8px; display:flex; align-items:center; justify-content:center; overflow:hidden; background:#fff; }
.cat-linea-foto img { width:100%; height:100%; object-fit:contain; padding:3px; }
.cat-linea-info { flex:1 1 160px; min-width:0; display:flex; flex-direction:column; gap:1px; overflow-wrap:anywhere; }
.cat-linea-info b { font-family:'Barlow Condensed',sans-serif; font-size:21px; line-height:1.05; }
.cat-linea-info span { font-size:14px; color:#314551; line-height:1.3; }
.cat-linea-info small { font-size:13px; color:#5B6B75; }
.cat-linea-cant { display:flex; flex-direction:column; align-items:flex-end; gap:5px; flex:0 0 190px; }
.cat-linea-cant .cat-cantidad { width:100%; }
.cat-cupon { margin-top:14px; padding:12px 14px; border:1.5px dashed #FF8A1F; border-radius:12px; background:#FFF6EC; }
.cat-cupon label { display:block; font-size:14px; font-weight:700; color:#7A3E00; }
.cat-cupon label > span { display:flex; gap:8px; margin-top:6px; }
.cat-cupon input { flex:1 1 auto; min-width:0; border:1px solid #E6C9A8; border-radius:8px; padding:10px 12px; font-size:16px; font-weight:700; letter-spacing:.04em; text-transform:uppercase; background:#fff; color:#14222B; }
.cat-cupon input:focus { outline:3px solid #FF8A1F; outline-offset:1px; }
.cat-cupon-ok { display:flex; align-items:center; gap:8px; margin:0; font-weight:700; color:#14653A; }
.cat-cupon-ok span { flex:1 1 auto; }
.cat-cupon-ok button { border:0; background:none; color:#1556B8; font:inherit; font-size:14px; font-weight:700; text-decoration:underline; cursor:pointer; }
.cat-subtotales { padding-top:12px; display:flex; flex-direction:column; gap:4px; font-size:15px; }
.cat-subtotales div { display:flex; justify-content:space-between; gap:10px; }
.cat-subtotales .menos { color:#14653A; font-weight:700; }
.cat-total { display:flex; justify-content:space-between; align-items:baseline; gap:10px; padding:14px 0 6px; font-weight:600; }
.cat-total b { font-family:'Barlow Condensed',sans-serif; font-size:32px; color:#0E3A8A; }
.cat-campos { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:10px; }
.cat-campos label { display:flex; flex-direction:column; gap:4px; font-size:13px; font-weight:600; color:#5B6B75; }
.cat-campos .ancho { grid-column:1 / -1; }
.cat-campos input, .cat-campos textarea { border:1px solid #CAD4DA; background:#F6F8F9; border-radius:8px; padding:11px 12px; font-size:16px; color:#14222B; font-family:inherit; width:100%; }
.cat-campos input:focus, .cat-campos textarea:focus { outline:3px solid #FF8A1F; outline-offset:1px; background:#fff; }
.cat-error { color:#A3321F; font-weight:600; font-size:14.5px; margin:10px 0 0; }
.cat-panel-botones { display:flex; flex-wrap:wrap; gap:8px; justify-content:flex-end; margin-top:16px; }
.cat-enviar { background:#128C4A; padding:12px 18px; }
.cat-enviar:hover { background:#0E6F3B; }
.cat-nota-envio { font-size:13px; color:#5B6B75; text-align:right; margin:8px 0 0; }
.cat-panel-ancho { max-width:860px; }
.cat-seguir { margin-top:14px; background:#EAF1FC; border-radius:10px; padding:12px 14px; display:flex; flex-direction:column; gap:3px; font-size:14.5px; color:#0E3A8A; }
.cat-seguir a { color:#0E3A8A; font-weight:600; overflow-wrap:anywhere; }
.cat-seguimiento { background:#fff; border:1px solid #D5DEE3; border-radius:16px; padding:18px; }
.cat-seg-arriba { display:flex; flex-wrap:wrap; justify-content:space-between; gap:14px 24px; }
.cat-seg-arriba small { display:block; font-size:12px; font-weight:700; letter-spacing:.07em; text-transform:uppercase; color:#5B6B75; }
.cat-seg-arriba b { display:block; font-family:'Barlow Condensed',sans-serif; font-size:34px; line-height:1.05; color:#14222B; }
.cat-seg-arriba p { margin:4px 0 0; color:#4A5B66; font-size:15.5px; }
.cat-seg-entrega { background:#FFF4CC; box-shadow:inset 0 0 0 2px #FF8A1F; border-radius:12px; padding:10px 14px; }
.cat-seg-entrega b { font-size:26px; color:#5F4600; }
.cat-seg-entrega span { font-size:13px; color:#7A5900; }
.cat-pasos { list-style:none; margin:18px 0 0; padding:0; display:grid; grid-template-columns:repeat(5,minmax(0,1fr)); }
.cat-pasos li { position:relative; display:flex; flex-direction:column; align-items:center; gap:6px; text-align:center; font-size:13px; font-weight:600; color:#8A99A3; }
.cat-pasos li::before { content:""; position:absolute; top:15px; right:50%; width:100%; height:4px; background:#DCE4E8; }
.cat-pasos li:first-child::before { display:none; }
.cat-pasos li.hecho::before, .cat-pasos li.actual::before { background:#1556B8; }
.cat-paso-punto { position:relative; z-index:1; width:34px; height:34px; border-radius:50%; background:#DCE4E8; color:#5B6B75; display:flex; align-items:center; justify-content:center; font-weight:700; }
.cat-pasos li.hecho .cat-paso-punto { background:#1556B8; color:#fff; }
.cat-pasos li.actual .cat-paso-punto { background:#FF8A1F; color:#14222B; box-shadow:0 0 0 5px rgba(242,183,5,.28); }
.cat-pasos li.hecho, .cat-pasos li.actual { color:#14222B; }
.cat-paso-nombre { overflow-wrap:anywhere; line-height:1.2; }
.cat-pagos { margin-top:14px; border:1px solid #E6ECEF; border-radius:12px; padding:12px 14px; }
.cat-pagos > b { font-family:'Barlow Condensed',sans-serif; font-size:20px; }
.cat-pagos ul { list-style:none; margin:6px 0 0; padding:0; }
.cat-pagos li { display:flex; gap:10px; align-items:baseline; padding:7px 0; border-top:1px solid #EEF2F4; font-size:15px; }
.cat-pagos li:first-child { border-top:0; }
.cat-pagos li span:first-child { color:#5B6B75; flex-shrink:0; }
.cat-pago-nota { flex:1; min-width:0; overflow-wrap:anywhere; }
.cat-seg-nota { margin:14px 0 0; font-size:13px; color:#5B6B75; }
.cat-estado { display:inline-flex; border-radius:999px; padding:2px 11px; font-size:13px; font-weight:700; background:#FFF4CC; color:#7A5A00; }
.cat-estado-confirmada, .cat-estado-entregada { background:#DDF3E6; color:#14603A; }
.cat-estado-produccion, .cat-estado-camino { background:#EAF1FC; color:#0E3A8A; }
.cat-estado-cancelada { background:#EEF1F3; color:#5B6B75; }
.cat-tabs { display:inline-flex; gap:4px; margin-top:20px; background:rgba(255,255,255,.1); border-radius:12px; padding:4px; }
.cat-tabs button { border:0; background:none; color:#C4D1D7; border-radius:9px; padding:10px 18px; font-size:16px; font-weight:700; display:inline-flex; align-items:center; gap:8px; }
.cat-tabs button[aria-selected="true"] { background:#fff; color:#14222B; }
.cat-tabs button:focus-visible { outline:3px solid #FF8A1F; outline-offset:2px; }
.cat-tabs i { font-style:normal; font-size:13px; background:#FF8A1F; color:#14222B; border-radius:999px; padding:1px 8px; }
.cat-tabs + .cat-buscar { margin-top:16px; }
.cat-cuenta-mis { margin-top:22px; }
.cat-cuenta-mis h2 { font-size:32px; font-weight:700; margin:0 0 10px; line-height:1; }
.cat-mis-boton { background:#FF8A1F; color:#14222B; }
.cat-mis-boton:hover { background:#DDA604; }
.cat-mis { display:grid; gap:12px; }
.cat-mi { display:flex; flex-direction:column; gap:4px; background:#fff; border:1px solid #D5DEE3; border-radius:14px; padding:14px 16px; text-decoration:none; color:inherit; }
.cat-mi:hover { border-color:#9DB9E8; box-shadow:0 8px 22px rgba(20,34,43,.1); }
.cat-mi:focus-visible { outline:3px solid #FF8A1F; outline-offset:2px; }
.cat-mi-arriba { display:flex; align-items:center; justify-content:space-between; gap:10px; }
.cat-mi-arriba b { font-size:28px; line-height:1; }
.cat-mi-fecha { font-size:13.5px; color:#5B6B75; }
.cat-mi-equipos { font-size:14.5px; color:#314551; overflow-wrap:anywhere; }
.cat-mi-abajo { display:flex; flex-wrap:wrap; align-items:flex-end; gap:8px 22px; margin-top:6px; }
.cat-mi-abajo small { display:block; font-size:11.5px; font-weight:600; color:#5B6B75; text-transform:uppercase; letter-spacing:.04em; }
.cat-mi-abajo b { font-size:17px; }
@media (max-width:560px) { .cat-pasos li { font-size:11px; } .cat-paso-punto { width:28px; height:28px; } .cat-pasos li::before { top:12px; } .cat-seg-arriba b { font-size:28px; } }
.cat-tiempos { background:#EAF1FC; border-radius:8px; padding:10px 12px; font-size:14.5px; color:#0E3A8A; margin:12px 0 0; line-height:1.4; }
.cat-guardada { display:flex; align-items:center; gap:8px; color:#1D7A46; font-weight:600; font-size:16px; margin:0 0 12px; }
.cat-hoja-img { display:block; width:100%; height:auto; border:1px solid #D5DEE3; border-radius:10px; box-shadow:0 6px 22px rgba(20,34,43,.12); background:#fff; }
.cat-vista { background:#fff; border:1px solid #D5DEE3; border-radius:16px; padding:18px; }
a.cat-btn { text-decoration:none; }
@media (max-width:560px) {
  .cat-panel-in { padding:20px 16px; }
  .cat-campos { grid-template-columns:1fr; }
  .cat-linea-cant { flex:1 1 100%; flex-direction:row; align-items:center; justify-content:space-between; }
  .cat-linea-cant .cat-cantidad { width:auto; flex:1; }
  .cat-panel-botones .cat-btn { flex:1 1 100%; justify-content:center; }
  .cat-flotante span { overflow:hidden; text-overflow:ellipsis; }
}
.cat-venta { display:flex; flex-direction:column; gap:3px; }
.cat-venta span { font-size:12px; font-weight:600; color:#5B6B75; }
.cat-venta input { border:1px solid #E2C45C; background:#FFF9E6; border-radius:8px; padding:9px 10px; font-size:19px; font-weight:700; color:#14222B; width:100%; }
.cat-otro input:focus, .cat-venta input:focus, .cat-enlace input:focus { outline:3px solid #FF8A1F; outline-offset:1px; }
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
  const real = Math.max(cbm, porPeso);
  const cobrable = Math.max(real, MINIMO_CBM);
  const producto = Number(p.precio_producto ?? p.precioProducto) || 0;
  const precioCbm = Number(p.precio_cbm ?? p.precioCbm) || 0;
  const flete = cobrable * precioCbm;
  const fichaEs = leerDescripcion(p.descripcion);
  // En inglés se usa la versión guardada en "en" (nombre, categoría y ficha); lo que falte sale en español.
  const en = EN && p.en && typeof p.en === "object" ? p.en : {};
  const ficha = en.descripcion ? { ...leerDescripcion(en.descripcion), grupo: fichaEs.grupo } : fichaEs;
  const categoria = p.categoria || "Sin categoría";
  return {
    id: p.id, codigo: p.codigo || "", nombre: en.nombre || p.nombre || "", categoria, categoriaVista: en.categoria || T(categoria),
    cbm, peso, porPeso, cobrable, por: MINIMO_CBM > real ? `mínimo de ${MINIMO_CBM} CBM` : porPeso > cbm ? "peso" : "volumen",
    producto, precioCbm, flete, costo: producto + flete, venta: Number(p.precio_venta ?? p.precioVenta) || 0,
    foto: p.foto || "", ficha, grupo: fichaEs.grupo, opcion: ficha.opcion || fichaEs.opcion,
    destacado: fichaEs.destacado, antes: fichaEs.precioAntes > (Number(p.precio_venta ?? p.precioVenta) || 0) && (Number(p.precio_venta ?? p.precioVenta) || 0) > 0 ? fichaEs.precioAntes : 0,
  };
};

function Foto({ src, alt }) {
  const [rota, setRota] = useState(false);
  if (!src || rota) return <Camera size={44} color="#B9C6CD" aria-hidden="true" />;
  return <img src={src} alt={alt} loading="lazy" onError={() => setRota(true)} />;
}

/** Días de producción y de envío que el cliente ve en cada producto. */
function Tiempos({ grande }) {
  return (
    <span className={`cat-tiempos-p${grande ? " grande" : ""}`}>
      <span><Factory size={grande ? 14 : 12} aria-hidden="true" />{T("Producción")}: <b className="cat-num">{DIAS_PRODUCCION} {T("días")}</b></span>
      <span><Ship size={grande ? 14 : 12} aria-hidden="true" />{T("Envío")}: <b className="cat-num">{DIAS_ENVIO} {T("días")}</b></span>
    </span>
  );
}

const PORCENTAJES = [20, 30, 40];

/** Fija el precio de venta de un producto: por porcentaje de ganancia sobre el costo o escrito a mano. */
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
        <small>{p.flete > 0 ? `producto ${dinero(p.producto)} + flete ${dinero(p.flete)}` : "sin flete: falta el precio CBM"}</small>
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

/** Sin precio de venta: el cliente pregunta por WhatsApp, con el producto ya escrito en el mensaje. */
function ConsultarPrecio({ p, whatsapp }) {
  const mensaje = [T("Hola, quiero consultar el precio de:"), `*${p.codigo}* · ${p.nombre}`, `${window.location.origin}/catalogo-cliente#${encodeURIComponent(p.codigo)}`].join("\n");
  return (
    <a className="cat-btn cat-consultar" href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(mensaje)}`} target="_blank" rel="noopener noreferrer">
      <Send size={17} />{T("Consultar precio por WhatsApp")}
    </a>
  );
}

/** Las opciones de un mismo producto (por ejemplo, el tipo de cabezal), cada una con su precio. */
function Opciones({ p, opciones, elegir, modo }) {
  if (!opciones) return null;
  return (
    <div className="cat-opciones" role="group" aria-label={T("Opciones del producto")}>
      <small>{T("Elige una opción")}</small>
      <div>
        {opciones.map((o) => {
          const precio = modo === "cliente" ? o.venta : o.producto;
          return (
            <button type="button" key={o.codigo} className="cat-opcion" aria-pressed={o.codigo === p.codigo} onClick={() => elegir(o.codigo)}>
              <b>{o.opcion || o.codigo}</b>
              {precio > 0 && <span className="cat-num">{dinero(precio)}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Tarjeta({ p, modo, abrir, guardar, pedir, opciones, elegir }) {
  const precio = modo === "cliente" ? p.venta : p.producto;
  const contenido = <>
    <div className="cat-foto">
      {modo === "cliente" && (p.antes > 0 ? <span className="cat-insignia oferta">{T("Oferta")}</span> : p.destacado ? <span className="cat-insignia">{T("Destacado")}</span> : null)}
      <Foto src={p.foto} alt="" />
    </div>
    <div className="cat-cuerpo">
      <span className="cat-categoria">{p.categoriaVista}</span>
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
            <small>{modo === "cliente" ? T("Precio") : "Precio de costo"}</small>
            <b className="cat-num">{precio > 0 ? dinero(precio) : T("Consultar")}</b>
            {modo === "cliente" && p.antes > 0 && <s className="cat-antes cat-num">{dinero(p.antes)}</s>}
            {modo === "cliente" && precio > 0 && <span className="cat-cordobas cat-num">{cordobas(precio)}</span>}
            {modo === "cliente" && precio > 0 && <span className="cat-puesto"><MapPin size={12} aria-hidden="true" />{T("Precio puesto en Nicaragua")}</span>}
            {modo === "cliente" && <Tiempos />}
          </div>
          <span className="cat-ver">{T("Ver ficha")}<ChevronRight size={15} /></span>
        </div>
      )}
    </div>
  </>;
  if (pedir || (opciones && !guardar)) {
    return (
      <div className="cat-card cat-card-editable">
        <button type="button" className="cat-card-abrir" onClick={abrir} aria-label={`Ver ${p.codigo}, ${p.nombre}`}>{contenido}</button>
        <Opciones p={p} opciones={opciones} elegir={elegir} modo={modo} />
        {pedir && (
          <div className="cat-pedir">
            {!(precio > 0) && <ConsultarPrecio p={p} whatsapp={pedir.whatsapp} />}
            <Cantidad codigo={p.codigo} cantidad={pedir.pedido[p.codigo] || 0} cambiar={pedir.cambiar} />
          </div>
        )}
      </div>
    );
  }
  if (!guardar) return <button type="button" className="cat-card" onClick={abrir} aria-label={`Ver ${p.codigo}, ${p.nombre}`}>{contenido}</button>;
  return (
    <div className="cat-card cat-card-editable">
      <button type="button" className="cat-card-abrir" onClick={abrir} aria-label={`Ver ${p.codigo}, ${p.nombre}`}>{contenido}</button>
      <Opciones p={p} opciones={opciones} elegir={elegir} modo={modo} />
      <EditorPrecio p={p} guardar={guardar} />
    </div>
  );
}

function Ficha({ p, modo, cerrar, pedir, opciones, elegir }) {
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
        <button type="button" className="cat-cerrar" onClick={cerrar} aria-label={T("Cerrar ficha")} autoFocus><X size={20} /></button>
        <div className="cat-ficha-arriba">
          <div className="cat-ficha-foto"><Foto src={p.foto} alt={`${p.codigo}, ${p.nombre}`} /></div>
          <div className="cat-ficha-info">
            <span className="cat-categoria">{[f.marca, p.categoriaVista].filter(Boolean).join(" · ")}</span>
            <h2 className="cat-num">{p.codigo}</h2>
            <h3>{p.nombre}</h3>
            {f.resumen && <p className="cat-resumen">{f.resumen}</p>}
            <Opciones p={p} opciones={opciones} elegir={elegir} modo={modo} />
            <div className="cat-precio-grande">
              <small>{interno ? "Precio de costo del producto" : T("Precio")}</small>
              <b className="cat-num">{precio > 0 ? dinero(precio) : T("Consultar")}</b>
              {!interno && p.antes > 0 && <s className="cat-antes cat-num" style={{ marginLeft: 10, fontSize: 20 }}>{dinero(p.antes)}</s>}
              {!interno && precio > 0 && <span className="cat-cordobas grande cat-num">{cordobas(precio)}</span>}
              {!interno && precio > 0 && <span className="cat-puesto grande"><MapPin size={14} aria-hidden="true" />{T("Precio puesto en Nicaragua")}</span>}
              {!interno && <Tiempos grande />}
            </div>
            {pedir && !(precio > 0) && <ConsultarPrecio p={p} whatsapp={pedir.whatsapp} />}
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
                <div className="cat-dato"><small><Scale size={13} />{T("Peso")}</small><b className="cat-num">{kilos(p.peso)}</b></div>
              </div>
            )}
            {f.empaque && <div className="cat-dato"><small>{T("Medidas de empaque")}</small><b className="cat-num">{f.empaque}</b></div>}
            <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
              {pedir && <Cantidad completo codigo={p.codigo} cantidad={pedir.pedido[p.codigo] || 0} cambiar={pedir.cambiar} />}
              <button type="button" className="cat-btn claro" onClick={compartir}>
                {copiado ? <><Check size={17} />{T("Enlace copiado")}</> : <><Share2 size={17} />{T("Compartir este producto")}</>}
              </button>
            </div>
          </div>
        </div>
        {(f.caracteristicas.length > 0 || f.ficha.length > 0 || f.incluye.length > 0 || f.opcionales.length > 0) && (
          <div className="cat-secciones">
            {f.caracteristicas.length > 0 && (
              <section className="cat-seccion">
                <h4>{T("Características")}</h4>
                <ul className="cat-lista">{f.caracteristicas.map((c, i) => <li key={i}><Check size={16} /><span>{c}</span></li>)}</ul>
              </section>
            )}
            {f.ficha.length > 0 && (
              <section className="cat-seccion">
                <h4>{T("Ficha técnica")}</h4>
                <table className="cat-tabla"><tbody>
                  {f.ficha.map(([k, v], i) => <tr key={i}><th scope="row">{k}</th><td className="cat-num">{v}</td></tr>)}
                </tbody></table>
              </section>
            )}
            {f.incluye.length > 0 && (
              <section className="cat-seccion" style={{ gridColumn: f.incluye.length > 8 ? "1 / -1" : undefined }}>
                <h4>{T("Incluye")}</h4>
                <ul className="cat-incluye">{f.incluye.map((c, i) => <li key={i}>{c}</li>)}</ul>
              </section>
            )}
            {f.opcionales.length > 0 && (
              <section className="cat-seccion">
                <h4>{T("Accesorios opcionales")}</h4>
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

/** Cambia el precio que se paga por cada CBM en todos los productos a la vez. */
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
          Lo que te cobran hoy por cada m³. El flete de cada producto es su CBM a cobrar por este precio.
          {distintos > 0 && ` ${distintos} ${distintos === 1 ? "producto tiene" : "productos tienen"} otro precio.`}
        </small>
      </div>
      <div className="cat-porcentajes">
        <label className="cat-otro cat-cbm">US$
          <input className="cat-num" inputMode="decimal" aria-label="Precio del CBM en dólares" value={texto} onChange={(e) => setTexto(e.target.value)} />
          por m³
        </label>
        <button type="button" className="cat-btn" disabled={!valido || trabajando || (n === actual && distintos === 0)} onClick={enviar}>
          {trabajando ? "Guardando…" : "Aplicar a todos los productos"}
        </button>
      </div>
    </section>
  );
}

/** Aplica un mismo porcentaje de ganancia a todos los productos. */
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
        <b>Ganancia para todos los productos</b>
        <small>Calcula el precio de venta sobre el costo (producto + flete). Después puedes ajustar cada producto.</small>
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
          <span>Se cambiará el precio de venta de {cuantos} productos a costo + {n}%, incluidos los que escribiste a mano.</span>
          <button type="button" className="cat-btn claro" onClick={() => setConfirmar(false)}>Cancelar</button>
          <button type="button" className="cat-btn" onClick={enviar} disabled={trabajando}>{trabajando ? "Aplicando…" : "Sí, aplicar"}</button>
        </div>
      )}
    </section>
  );
}

/* ---------- cotización que arma el cliente y envía por WhatsApp ---------- */
const CLAVE_PEDIDO = "catalogo-mi-cotizacion";
const CLAVE_TOKEN = "catalogo-mi-enlace";
const leerGuardado = (clave, porDefecto) => {
  try { return JSON.parse(window.localStorage.getItem(clave)) ?? porDefecto; } catch { return porDefecto; }
};
const guardarLocal = (clave, valor) => { try { window.localStorage.setItem(clave, JSON.stringify(valor)); } catch { /* sin almacenamiento */ } };

/** Deja el número listo para wa.me: solo dígitos, con el código de Nicaragua (505) si viene de 8 dígitos. */
export const numeroWhatsapp = (texto) => {
  const d = String(texto || "").replace(/\D/g, "");
  return d.length === 8 ? `505${d}` : d.length >= 10 ? d : "";
};

function Cantidad({ codigo, cantidad, cambiar, completo }) {
  if (!cantidad) {
    return (
      <button type="button" className={`cat-btn ${completo ? "" : "cat-agregar"}`} onClick={() => cambiar(codigo, 1)}>
        <Plus size={17} />{T("Agregar a mi cotización")}
      </button>
    );
  }
  return (
    <div className="cat-cantidad" role="group" aria-label={`Cantidad de ${codigo}`}>
      <button type="button" onClick={() => cambiar(codigo, cantidad - 1)} aria-label={T(cantidad === 1 ? "Quitar de mi cotización" : "Uno menos")}>
        {cantidad === 1 ? <Trash2 size={16} /> : <Minus size={16} />}
      </button>
      <span className="cat-num" aria-live="polite">{T("{n} en tu cotización", { n: cantidad })}</span>
      <button type="button" onClick={() => cambiar(codigo, cantidad + 1)} aria-label={T("Uno más")}><Plus size={16} /></button>
    </div>
  );
}

const EMPRESA_PUBLICA = { nombre: "Taller Gregoriana", contacto: T("Taller Mecánico y Lubricentro"), logo: LOGO_POR_DEFECTO, whatsapp: "" };

/** Nombre, contacto, logo y WhatsApp del taller para el catálogo de clientes y sus cotizaciones. */
function useEmpresaPublica(activo) {
  const [empresa, setEmpresa] = useState(EMPRESA_PUBLICA);
  useEffect(() => {
    if (!activo) return;
    let vivo = true;
    fetch("/api/contacto", { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)).then((d) => {
      if (vivo && d) {
        if (Number(d.tasa) > 0) tasaCordoba = Number(d.tasa);
        setEmpresa({
        nombre: d.nombre || EMPRESA_PUBLICA.nombre, contacto: d.contacto || EMPRESA_PUBLICA.contacto,
        logo: d.logo || EMPRESA_PUBLICA.logo, whatsapp: numeroWhatsapp(d.whatsapp), tasa: tasaCordoba,
        });
      }
    }).catch(() => {});
    return () => { vivo = false; };
  }, [activo]);
  return empresa;
}

/** Hoja de cotización que ve el cliente: productos, cantidades y precios de venta. */
function datosHojaCliente(cot, empresa) {
  const columnas = [
    { t: T("Foto") }, { t: T("Producto") }, { t: T("Cant."), r: true }, { t: T("Precio unitario"), r: true }, { t: T("Total"), r: true, fuerte: true },
  ];
  const filas = cot.lineas.map((l) => ({
    foto: l.foto, nombre: (EN && l.nombreEn) || l.nombre, sub: l.codigo,
    valores: [String(l.cantidad), l.precio > 0 ? dinero(l.precio) : T("Por consultar"), l.precio > 0 ? dinero(l.precio * l.cantidad) : T("Por consultar")],
  }));
  const totales = [[T("Productos"), String(cot.lineas.reduce((s, l) => s + l.cantidad, 0))]];
  if (cot.lineas.some((l) => !(l.precio > 0))) totales.push([T("Productos por consultar"), T("No incluidos en el total")]);
  if (cot.descuento > 0) {
    totales.push([T("Subtotal"), dinero(cot.subtotal || cot.total + cot.descuento)]);
    totales.push([`${T("Descuento")}${cot.cupon ? ` (${cot.cupon})` : ""}`, `−${dinero(cot.descuento)}`]);
  }
  totales.push(...TIEMPOS_ENTREGA.map(([k, v]) => [T(k), v.replace("días", T("días"))]));
  return {
    empresa: { ...empresa, contacto: T(String(empresa.contacto || "").split("\n")[0]) }, columnas, filas, totales, total: dinero(cot.total), totalLabel: T("Total"),
    pie: T("Precios en dólares estadounidenses, puestos en Nicaragua."),
    cot: { numero: cot.numero, fecha: cot.fecha, cliente: [cot.cliente, cot.telefono && `Tel. ${cot.telefono}`].filter(Boolean).join(" · ") },
  };
}

/** Dibuja la hoja de la cotización como imagen PNG. */
function useImagenCotizacion(cot, empresa) {
  const [imagen, setImagen] = useState(null);
  useEffect(() => {
    if (!cot) { setImagen(null); return; }
    let vivo = true, url = "";
    (async () => {
      try {
        const lienzo = await hojaImagen(datosHojaCliente(cot, empresa));
        const blob = await new Promise((r) => lienzo.toBlob(r, "image/png"));
        if (!vivo || !blob) return;
        url = URL.createObjectURL(blob);
        setImagen({ url, blob });
      } catch (e) { console.error(e); if (vivo) setImagen({ error: true }); }
    })();
    return () => { vivo = false; if (url) URL.revokeObjectURL(url); };
  }, [cot, empresa]);
  return imagen;
}

async function compartirImagen(imagen, numero) {
  const archivo = new File([imagen.blob], `Cotizacion-${numero}.png`, { type: "image/png" });
  try {
    if (navigator.canShare && navigator.canShare({ files: [archivo] })) { await navigator.share({ files: [archivo], title: `${T("Cotización")} ${numero}` }); return; }
  } catch (e) { if (e && e.name === "AbortError") return; }
  const a = document.createElement("a");
  a.href = imagen.url; a.download = archivo.name;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
}

const enlaceCotizacion = (cot) => `${window.location.origin}/cotizacion/${cot.id}`;
const enlaceWhatsapp = (cot, whatsapp) => `https://wa.me/${whatsapp}?text=${encodeURIComponent([
  `*Cotización ${cot.numero}*`,
  `Cliente: ${cot.cliente}`,
  `Teléfono: ${cot.telefono}`,
  ...(cot.direccion ? [`Dirección: ${cot.direccion}`] : []),
  ...(cot.total > 0 ? [`Total: ${dinero(cot.total)}`] : []),
  `Entrega aproximada: ${DIAS_PRODUCCION + DIAS_ENVIO} días`,
  ...(cot.nota ? [`Nota: ${cot.nota}`] : []),
  "",
  "Ver la cotización y seguir el pedido:",
  enlaceCotizacion(cot),
].join("\n"))}`;

/** La cotización ya guardada: su imagen y los botones para enviarla. */
function CotizacionLista({ cot, empresa, alTerminar }) {
  const imagen = useImagenCotizacion(cot, empresa);
  return (
    <div className="cat-lista-ok">
      {alTerminar && <p className="cat-guardada" role="status"><Check size={18} />{T("Tu cotización")} <b>{cot.numero}</b> {T("quedó registrada.")}</p>}
      {!imagen ? <p className="cat-resumen">{T("Preparando la imagen…")}</p> :
        imagen.error ? <p className="cat-error">{T("No se pudo dibujar la imagen, pero tu cotización sí quedó registrada.")}</p> :
          <img className="cat-hoja-img" src={imagen.url} alt={`Cotización ${cot.numero} de ${cot.cliente}`} />}
      <div className="cat-panel-botones">
        {imagen?.blob && (
          <button type="button" className="cat-btn claro" onClick={() => compartirImagen(imagen, cot.numero)}>
            <Share2 size={17} />{T("Compartir o guardar la imagen")}
          </button>
        )}
        {empresa.whatsapp && (
          <a className="cat-btn cat-enviar" href={enlaceWhatsapp(cot, empresa.whatsapp)} target="_blank" rel="noopener noreferrer">
            <Send size={17} />{T("Enviar por WhatsApp")}
          </a>
        )}
      </div>
      {empresa.whatsapp && <p className="cat-nota-envio">{T("Se abrirá WhatsApp con nuestro chat. Solo tienes que tocar “Enviar”.")}</p>}
      {alTerminar && (
        <div className="cat-seguir">
          <b>{T("Sigue tu pedido aquí")}</b>
          <span>{T("En este enlace verás cuando tu cotización esté confirmada, en producción, en camino y entregada.")}</span>
          <a href={enlaceCotizacion(cot)}>{enlaceCotizacion(cot)}</a>
        </div>
      )}
      {alTerminar && <div className="cat-panel-botones"><button type="button" className="cat-btn claro" onClick={alTerminar}>{T("Listo")}</button></div>}
    </div>
  );
}

const mensajeCupon = (r) => (
  r.motivo === "vencido" ? T("Ese cupón ya venció.")
    : r.motivo === "agotado" ? T("Ese cupón ya se usó todas las veces permitidas.")
      : r.motivo === "minimo" ? (r.minimo > 0 ? T("Ese cupón pide una compra mínima de {m}.", { m: dinero(r.minimo) }) : T("Ese cupón necesita productos con precio en tu cotización."))
        : r.motivo === "error" ? T("No pudimos revisar el cupón. Inténtalo de nuevo.")
          : T("Ese cupón no existe.")
);

function PanelCotizacion({ lineas, cambiar, vaciar, empresa, cerrar, token, nombre: nombreCuenta }) {
  // Solo dentro de la cuenta de un cliente se recuerdan sus datos; el catálogo general siempre abre en blanco.
  const recordar = Boolean(token);
  const [datos, setDatos] = useState(() => ({
    nombre: "", telefono: "", direccion: "", ...(recordar ? leerGuardado(`${CLAVE_PEDIDO}-datos-${token}`, {}) : {}),
    ...(nombreCuenta ? { nombre: nombreCuenta } : {}),
  }));
  const [nota, setNota] = useState("");
  const [error, setError] = useState("");
  const [trabajando, setTrabajando] = useState(false);
  const [creada, setCreada] = useState(null);
  useEffect(() => {
    const tecla = (e) => { if (e.key === "Escape") cerrar(); };
    const previo = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", tecla);
    return () => { document.body.style.overflow = previo; window.removeEventListener("keydown", tecla); };
  }, [cerrar]);

  const total = lineas.reduce((s, l) => s + l.venta * l.cantidad, 0);
  const hayConsultar = lineas.some((l) => l.venta <= 0);
  // Cupón: el servidor lo revisa con los precios de la base; aquí solo se muestra el resultado.
  const [codigoCupon, setCodigoCupon] = useState("");
  const [cupon, setCupon] = useState(null);
  const [errorCupon, setErrorCupon] = useState("");
  const [revisando, setRevisando] = useState(false);
  const pedidoActual = JSON.stringify(lineas.map((l) => [l.codigo, l.cantidad]));
  const revisarCupon = async (codigo) => {
    if (!codigo.trim()) return;
    setErrorCupon(""); setRevisando(true);
    try {
      const res = await fetch("/api/cupon", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ cupon: codigo.trim(), lineas: lineas.map((l) => ({ codigo: l.codigo, cantidad: l.cantidad })) }),
      });
      const r = await res.json().catch(() => ({ motivo: "error" }));
      if (r.ok) { setCupon(r); setCodigoCupon(r.codigo); } else { setCupon(null); setErrorCupon(mensajeCupon(r)); }
    } catch { setCupon(null); setErrorCupon(mensajeCupon({ motivo: "error" })); } finally { setRevisando(false); }
  };
  // Si cambia lo que lleva la cotización, el descuento se vuelve a calcular.
  useEffect(() => { if (cupon) revisarCupon(cupon.codigo); }, [pedidoActual]); // eslint-disable-line react-hooks/exhaustive-deps
  const descuento = cupon ? Math.min(cupon.descuento, total) : 0;
  const set = (k) => (e) => setDatos((d) => ({ ...d, [k]: e.target.value }));

  const crear = async (e) => {
    e.preventDefault();
    if (trabajando) return;
    const nombre = datos.nombre.trim(), telefono = datos.telefono.trim(), direccion = datos.direccion.trim();
    if (!nombre) { setError(T("Escribe tu nombre.")); return; }
    if (telefono.replace(/\D/g, "").length < 8) { setError(T("Escribe tu número de teléfono completo.")); return; }
    setError(""); setTrabajando(true);
    if (recordar) guardarLocal(`${CLAVE_PEDIDO}-datos-${token}`, { nombre, telefono, direccion });
    try {
      const res = await fetch("/api/solicitudes", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ nombre, telefono, direccion, token: token || "", nota: nota.trim(), cupon: cupon ? cupon.codigo : "", lineas: lineas.map((l) => ({ codigo: l.codigo, cantidad: l.cantidad })) }),
      });
      const r = await res.json().catch(() => ({}));
      if (r.motivo) { setCupon(null); setErrorCupon(mensajeCupon(r)); return; }
      if (!res.ok || !r.cotizacion) throw new Error(r.error || "sin respuesta");
      setCreada(r.cotizacion);
      if (r.cotizacion.token) guardarLocal(CLAVE_TOKEN, r.cotizacion.token);
      vaciar();
    } catch (err) {
      console.error(err);
      setError(T("No pudimos registrar tu cotización. Revisa tu conexión e inténtalo de nuevo."));
    } finally { setTrabajando(false); }
  };

  return (
    <div className="cat-fondo" onMouseDown={(e) => { if (e.target === e.currentTarget) cerrar(); }}>
      <section className={`cat-ficha cat-panel${creada ? " cat-panel-ancho" : ""}`} role="dialog" aria-modal="true" aria-label={T("Mi cotización")}>
        <button type="button" className="cat-cerrar" onClick={cerrar} aria-label={T("Cerrar mi cotización")}><X size={20} /></button>
        <div className="cat-panel-in">
          <h2 className="cat-cond">{creada ? `${T("Cotización")} ${creada.numero}` : T("Mi cotización")}</h2>
          {creada ? <CotizacionLista cot={creada} empresa={empresa} alTerminar={cerrar} /> : !lineas.length ? (
            <p className="cat-resumen">{T("Todavía no has agregado productos. Toca “Agregar a mi cotización” en los productos que te interesan.")}</p>
          ) : (
            <form onSubmit={crear} noValidate>
              <ul className="cat-lineas">
                {lineas.map((l) => (
                  <li key={l.codigo}>
                    <div className="cat-linea-foto"><Foto src={l.foto} alt="" /></div>
                    <div className="cat-linea-info">
                      <b className="cat-num">{l.codigo}</b>
                      <span>{l.nombre}</span>
                      <small className="cat-num">{l.venta > 0 ? `${dinero(l.venta)} ${T("c/u")}` : T("Precio por consultar")}</small>
                    </div>
                    <div className="cat-linea-cant">
                      <Cantidad codigo={l.codigo} cantidad={l.cantidad} cambiar={cambiar} />
                      {l.venta > 0 && <b className="cat-num">{dinero(l.venta * l.cantidad)}</b>}
                    </div>
                  </li>
                ))}
              </ul>
              {total > 0 && (
                <div className="cat-cupon">
                  {cupon ? (
                    <p className="cat-cupon-ok" role="status">
                      <Check size={17} /><span>{T("Cupón {c} aplicado", { c: cupon.codigo })}</span>
                      <button type="button" onClick={() => { setCupon(null); setCodigoCupon(""); }}>{T("Quitar")}</button>
                    </p>
                  ) : (
                    <label>{T("¿Tienes un cupón de descuento?")}
                      <span>
                        <input value={codigoCupon} onChange={(e) => { setCodigoCupon(e.target.value.toUpperCase()); setErrorCupon(""); }} maxLength={30}
                          autoCapitalize="characters" autoComplete="off" placeholder={T("Código del cupón")}
                          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); revisarCupon(codigoCupon); } }} />
                        <button type="button" className="cat-btn claro" disabled={revisando || !codigoCupon.trim()} onClick={() => revisarCupon(codigoCupon)}>
                          {T(revisando ? "Revisando…" : "Aplicar")}
                        </button>
                      </span>
                    </label>
                  )}
                  {errorCupon && <p className="cat-error" role="alert" style={{ marginTop: 6 }}>{errorCupon}</p>}
                </div>
              )}
              {total > 0 && descuento > 0 && (
                <div className="cat-subtotales cat-num">
                  <div><span>{T("Subtotal")}</span><b>{dinero(total)}</b></div>
                  <div className="menos"><span>{T("Descuento")} ({cupon.codigo})</span><b>−{dinero(descuento)}</b></div>
                </div>
              )}
              {total > 0 && (
                <div className="cat-total">
                  <span>{T("Total")}{hayConsultar && T(" (sin los productos por consultar)")}</span>
                  <b className="cat-num">{dinero(total - descuento)}</b>
                </div>
              )}
              {total > 0 && (
                <p className="cat-total-cordobas cat-num">
                  {cordobas(total - descuento)} <span>· {T("tipo de cambio")} C$ {tasaCordoba.toLocaleString("en-US", { maximumFractionDigits: 4 })}</span>
                </p>
              )}
              {total > 0 && (
                <p className="cat-puesto-total"><MapPin size={13} aria-hidden="true" />{T("Precios puestos en Nicaragua")}</p>
              )}
              <div className="cat-campos">
                <label>{T("Tu nombre")}
                  <input value={datos.nombre} onChange={set("nombre")} autoComplete="name" maxLength={80} />
                </label>
                <label>{T("Tu teléfono o WhatsApp")}
                  <input value={datos.telefono} onChange={set("telefono")} inputMode="tel" autoComplete="tel" placeholder="8888 8888" maxLength={30} />
                </label>
                <label className="ancho">{T("Ciudad o dirección de entrega (opcional)")}
                  <input value={datos.direccion} onChange={set("direccion")} autoComplete="street-address" maxLength={160} placeholder={T("Managua, barrio o dirección")} />
                </label>
                <label className="ancho">{T("Nota (opcional)")}
                  <textarea rows={2} value={nota} onChange={(e) => setNota(e.target.value)} maxLength={300} placeholder={T("Fecha en que lo necesitas, preguntas")} />
                </label>
              </div>
              {error && <p className="cat-error" role="alert">{error}</p>}
              <div className="cat-panel-botones">
                <button type="button" className="cat-btn claro" onClick={vaciar} disabled={trabajando}>{T("Vaciar")}</button>
                <button type="submit" className="cat-btn cat-enviar" disabled={trabajando}>
                  <ClipboardList size={17} />{T(trabajando ? "Creando tu cotización…" : "Crear mi cotización")}
                </button>
              </div>
              <p className="cat-tiempos">
                {T("Entrega aproximada")}: <b>{DIAS_PRODUCCION + DIAS_ENVIO} {T("días")}</b> ({T("{a} de producción + {b} de envío", { a: DIAS_PRODUCCION, b: DIAS_ENVIO })}).
              </p>
              <p className="cat-nota-envio">{T("Verás tu cotización como imagen y podrás enviarla por WhatsApp.")}</p>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}

/* ---------- seguimiento del pedido: lo que ve el cliente en su enlace ---------- */
const PASOS = [["pendiente", T("Recibida")], ["confirmada", T("Confirmada")], ["produccion", T("En producción")], ["camino", T("En camino")], ["entregada", T("Entregada")]];
const TEXTO_ESTADO = {
  pendiente: [T("Pendiente de confirmar"), T("Recibimos tu cotización. Aquí verás cuando esté confirmada.")],
  confirmada: [T("Confirmada"), T("Tu pedido está confirmado.")],
  produccion: [T("En producción"), T("Tu pedido se está fabricando.")],
  camino: [T("En camino"), T("Tu pedido ya va en camino.")],
  entregada: [T("Entregada"), T("Tu pedido fue entregado. Gracias por tu compra.")],
  cancelada: [T("Cancelada"), T("Esta cotización fue cancelada.")],
};
const estadoPublico = (cot) => (TEXTO_ESTADO[cot.estado] ? cot.estado : "pendiente");
const fechaCorta = (d) => new Date(d).toLocaleDateString(IDIOMA, { day: "2-digit", month: "short", year: "numeric" });
const entregaDe = (cot) => (cot.confirmadaEl ? new Date(new Date(cot.confirmadaEl).getTime() + (DIAS_PRODUCCION + DIAS_ENVIO) * 86400000) : null);

/** Pide una dirección y la vuelve a pedir cada cierto tiempo, para que el cliente vea los cambios sin recargar. */
function useDatosVivos(url, cadaMs = 20000) {
  const [datos, setDatos] = useState(null);
  const [estado, setEstado] = useState("cargando");
  useEffect(() => {
    let vivo = true, previo = "";
    const cargar = async () => {
      try {
        const r = await fetch(url, { cache: "no-store" });
        const texto = await r.text();
        if (!vivo) return;
        if (!r.ok) { if (!previo) setEstado(r.status === 404 ? "no-existe" : "error"); return; }
        if (texto !== previo) { previo = texto; setDatos(JSON.parse(texto)); }
        setEstado("lista");
      } catch { if (vivo && !previo) setEstado("error"); }
    };
    cargar();
    const reloj = setInterval(() => { if (!document.hidden) cargar(); }, cadaMs);
    const alVolver = () => { if (!document.hidden) cargar(); };
    document.addEventListener("visibilitychange", alVolver);
    return () => { vivo = false; clearInterval(reloj); document.removeEventListener("visibilitychange", alVolver); };
  }, [url, cadaMs]);
  return [datos, estado];
}

function EtiquetaEstado({ cot }) {
  const e = estadoPublico(cot);
  return <span className={`cat-estado cat-estado-${e}`}>{TEXTO_ESTADO[e][0]}</span>;
}

function Seguimiento({ cot }) {
  const estado = estadoPublico(cot);
  const paso = PASOS.findIndex((p) => p[0] === estado);
  const entrega = entregaDe(cot);
  const saldo = Math.max(0, cot.total - cot.pagado);
  return (
    <section className="cat-seguimiento" aria-label={T("Estado de tu pedido")}>
      <div className="cat-seg-arriba">
        <div>
          <small>{T("Estado de tu pedido")}</small>
          <b>{TEXTO_ESTADO[estado][0]}</b>
          <p>{TEXTO_ESTADO[estado][1]}</p>
        </div>
        {estado !== "cancelada" && estado !== "entregada" && (
          <div className="cat-seg-entrega">
            <small>{T("Entrega estimada")}</small>
            <b className="cat-num">{entrega ? fechaCorta(entrega) : `${DIAS_PRODUCCION + DIAS_ENVIO} ${T("días")}`}</b>
            <span>{entrega ? T("{a} días de producción + {b} de envío", { a: DIAS_PRODUCCION, b: DIAS_ENVIO }) : T("a partir de la confirmación")}</span>
          </div>
        )}
      </div>
      {estado !== "cancelada" && (
        <ol className="cat-pasos">
          {PASOS.map(([clave, nombre], i) => (
            <li key={clave} className={i < paso ? "hecho" : i === paso ? "actual" : ""} aria-current={i === paso ? "step" : undefined}>
              <span className="cat-paso-punto">{i < paso || (i === paso && estado === "entregada") ? <Check size={15} /> : i + 1}</span>
              <span className="cat-paso-nombre">{nombre}</span>
            </li>
          ))}
        </ol>
      )}
      {cot.pagado > 0 && (
        <div className="cat-datos" style={{ marginTop: 14 }}>
          <div className="cat-dato"><small>{T("Total")}</small><b className="cat-num">{dinero(cot.total)}</b></div>
          <div className="cat-dato"><small>{T("Pagado")}</small><b className="cat-num">{dinero(cot.pagado)}</b></div>
          <div className="cat-dato cobro"><small>{T("Saldo")}</small><b className="cat-num">{dinero(saldo)}</b></div>
        </div>
      )}
      {cot.pagos?.length > 0 && (
        <div className="cat-pagos">
          <b>{T("Pagos recibidos")}</b>
          <ul>
            {cot.pagos.map((p, i) => (
              <li key={i}>
                <span className="cat-num">{p.fecha ? fechaCorta(p.fecha) : T("Sin fecha")}</span>
                <span className="cat-pago-nota">{p.nota || T("Pago")}</span>
                <b className="cat-num">{dinero(p.monto)}</b>
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className="cat-seg-nota">{T("Esta página se actualiza sola. Guarda el enlace para revisar tu pedido cuando quieras.")}</p>
    </section>
  );
}

function PaginaCliente({ empresa, titulo, children }) {
  return (
    <div className="cat cat-amarilla sin-vitrina">
      <style>{ESTILOS}</style>
      <header className="cat-top">
        <div className="cat-wrap cat-top-in">
          <SelectorIdioma />
          <div className="cat-top-texto">
            <div className="cat-marca">
              <img src={empresa.logo} alt="" />
              <div><b>{empresa.nombre}</b><span>{T(empresa.contacto.split("\n")[0])}</span></div>
            </div>
            <h1>{titulo}</h1>
          </div>
        </div>
      </header>
      <main className="cat-wrap" style={{ paddingTop: 22, paddingBottom: 48, maxWidth: 980 }}>{children}</main>
    </div>
  );
}

const AVISOS = {
  cargando: T("Cargando…"),
  "no-existe": T("Este enlace ya no existe."),
  error: T("No pudimos cargar la información. Inténtalo de nuevo en un momento."),
};

/** Página pública de una cotización: /cotizacion/<id>. Muestra el estado del pedido y la hoja. */
export function VistaCotizacion({ id }) {
  const empresa = useEmpresaPublica(true);
  const [datos, estado] = useDatosVivos(`/api/solicitudes/${encodeURIComponent(id)}`);
  const cot = datos?.cotizacion || null;
  const sinWhatsapp = useMemo(() => ({ ...empresa, whatsapp: "" }), [empresa]);
  // La hoja solo se vuelve a dibujar si cambian los productos o el total, no con cada cambio de estado.
  const huella = cot ? JSON.stringify([cot.lineas, cot.total, cot.cliente, cot.telefono]) : "";
  const paraHoja = useMemo(() => cot, [huella]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <PaginaCliente empresa={empresa} titulo={cot ? <>{T("Cotización")} <em>{cot.numero}</em></> : T("Cotización")}>
      {!cot ? <div className="cat-vacio" role="status">{AVISOS[estado] || AVISOS.cargando}</div> : <>
        <Seguimiento cot={cot} />
        <div className="cat-vista" style={{ marginTop: 16 }}><CotizacionLista cot={paraHoja} empresa={sinWhatsapp} /></div>
      </>}
      <p style={{ marginTop: 18, display: "flex", gap: 8, flexWrap: "wrap" }}>
        {cot?.token
          ? <a className="cat-btn" href={`/cliente/${cot.token}?ver=cotizaciones`}>{T("Mis cotizaciones")}</a>
          : <a className="cat-btn claro" href="/catalogo-cliente">{T("Ver el catálogo")}</a>}
      </p>
    </PaginaCliente>
  );
}

/** Página pública de un cliente: /cliente/<token>. Todas sus cotizaciones y el estado de cada una. */
export function VistaCliente({ token }) {
  const [datos, estado] = useDatosVivos(`/api/cliente/${encodeURIComponent(token)}`);
  const lista = datos?.cotizaciones || [];
  // El catálogo recuerda a este cliente para ofrecerle el botón T("Mis cotizaciones").
  useEffect(() => { if (datos) guardarLocal(CLAVE_TOKEN, token); }, [datos, token]);
  const arriba = (
    <section className="cat-cuenta-mis" aria-label={T("Mis cotizaciones")}>
      <h2 className="cat-cond">{T("Mis cotizaciones")}</h2>
      {!datos ? <div className="cat-vacio" style={{ marginBottom: 0 }} role="status">
        {estado === "no-existe" ? T("Todavía no hay cotizaciones en este enlace.") : AVISOS[estado] || AVISOS.cargando}
      </div> : <>
        <p className="cat-cuenta" style={{ marginTop: 0 }}>
          {lista.length === 0 ? T("Todavía no tienes cotizaciones. Abre la pestaña Catálogo, agrega los productos que te interesan y envía tu cotización.")
            : `${T(lista.length === 1 ? "Tienes 1 cotización." : "Tienes {n} cotizaciones.", { n: lista.length })} ${T("Esta página se actualiza sola.")}`}
        </p>
        <div className="cat-mis">
          {lista.map((cot) => {
            const entrega = entregaDe(cot), e = estadoPublico(cot);
            return (
              <a key={cot.id} className="cat-mi" href={`/cotizacion/${cot.id}`}>
                <div className="cat-mi-arriba">
                  <b className="cat-cond cat-num">{cot.numero}</b>
                  <EtiquetaEstado cot={cot} />
                </div>
                <span className="cat-mi-fecha">{fechaCorta(cot.fecha)} · {cot.lineas.reduce((s, l) => s + l.cantidad, 0)} {T("productos")}</span>
                <span className="cat-mi-equipos">{cot.lineas.map((l) => `${l.cantidad} × ${l.codigo}`).join(", ")}</span>
                <div className="cat-mi-abajo">
                  <span><small>{T("Total")}</small><b className="cat-num">{cot.total > 0 ? dinero(cot.total) : T("Por consultar")}</b></span>
                  {cot.pagado > 0 && <span><small>{T("Saldo")}</small><b className="cat-num">{dinero(Math.max(0, cot.total - cot.pagado))}</b></span>}
                  {entrega && e !== "entregada" && e !== "cancelada" && <span><small>{T("Entrega estimada")}</small><b className="cat-num">{fechaCorta(entrega)}</b></span>}
                  <span className="cat-ver" style={{ display: "inline-flex", marginLeft: "auto" }}>{T("Ver pedido")}<ChevronRight size={15} /></span>
                </div>
              </a>
            );
          })}
        </div>
      </>}
    </section>
  );
  return <Catalogo modo="cliente" cuenta={{ token, nombre: datos?.nombre || "", titulo: datos?.nombre ? <>{T("Hola,")} <em>{datos.nombre}</em></> : EN ? <>My <em>quotes</em></> : <>Mis <em>cotizaciones</em></>, contenido: arriba, cantidad: lista.length }} />;
}

const RUTAS = { cliente: "/catalogo-cliente", interno: "/catalogo-interno" };
const API = { cliente: "/api/catalogo", interno: "/api/catalogo-interno" };
const TITULOS = { cliente: "Catálogo cliente", interno: "Catálogo interno" };

/**
 * modo "cliente": precio de venta, sin costos. modo "interno": precio de costo, flete y CBM.
 * Con `productos` se muestra dentro de la app; con `guardarPrecio` cada producto trae su editor de precio de venta.
 */
export default function Catalogo({ modo = "cliente", productos: propios, guardarPrecio, aplicarGanancia, cambiarPrecioCbm, whatsapp: whatsappPropio, avisar, cuenta, cabeceras, vistaPrevia }) {
  const dentro = Array.isArray(propios);
  const [descargados, setProductos] = useState([]);
  const [descarga, setEstado] = useState("cargando");
  // En la vista previa de la app el botón de idioma cambia el catálogo ahí mismo, sin recargar.
  const [idiomaVista, setIdiomaVista] = useState("es");
  if (vistaPrevia) fijarIdioma(idiomaVista);
  useEffect(() => (vistaPrevia ? () => fijarIdioma("es") : undefined), [vistaPrevia]);
  const productos = useMemo(() => (dentro ? propios : descargados).map(normalizar), [dentro, propios, descargados, idiomaVista]); // eslint-disable-line react-hooks/exhaustive-deps
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
        const res = await fetch(API[modo], { cache: "no-store", signal: controller.signal, headers: cabeceras ? await cabeceras() : undefined });
        const data = await res.json();
        if (res.ok && Array.isArray(data)) lista = data;
      } catch (error) { if (error.name === "AbortError") return; }
      // Sin conexión con la base de datos se muestra el catálogo XPROMISE que viene con la página.
      setProductos(lista ?? CATALOGO_XPROMISE);
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

  // Productos con el mismo "Grupo" son opciones de uno solo: en el catálogo salen en una sola tarjeta.
  const [elegidas, setElegidas] = useState({});
  const grupos = useMemo(() => {
    const m = new Map();
    for (const p of productos) if (p.grupo) m.set(p.grupo, [...(m.get(p.grupo) || []), p]);
    for (const [g, lista] of m) if (lista.length < 2) m.delete(g);
    return m;
  }, [productos]);
  const opcionesDe = (p) => (p && p.grupo && grupos.get(p.grupo)) || null;
  const unaPorGrupo = (lista) => {
    const vistos = new Set(), salida = [];
    for (const p of lista) {
      const ops = opcionesDe(p);
      if (!ops) { salida.push(p); continue; }
      if (vistos.has(p.grupo)) continue;
      vistos.add(p.grupo);
      salida.push(ops.find((o) => o.codigo === elegidas[p.grupo]) || ops[0]);
    }
    return salida;
  };
  const unicos = useMemo(() => unaPorGrupo(productos), [productos, grupos]); // eslint-disable-line react-hooks/exhaustive-deps
  const elegirOpcion = (p, codigo, enFicha) => {
    setElegidas((actual) => ({ ...actual, [p.grupo]: codigo }));
    if (enFicha) { window.history.replaceState(null, "", `#${encodeURIComponent(codigo)}`); setAbierto(codigo); }
  };

  const etiquetas = useMemo(() => new Map(productos.map((p) => [p.categoria, p.categoriaVista])), [productos]);
  const categorias = useMemo(() => {
    const cuenta = new Map();
    for (const p of unicos) cuenta.set(p.categoria, (cuenta.get(p.categoria) || 0) + 1);
    return [...cuenta.entries()].sort((a, b) => a[0].localeCompare(b[0], "es"));
  }, [unicos]);

  const [orden, setOrden] = useState("destacados");
  const filtrados = useMemo(() => {
    const s = sinAcentos(q.trim());
    const lista = unaPorGrupo(productos.filter((p) => (!categoria || p.categoria === categoria) &&
      (!s || sinAcentos(`${p.codigo} ${p.nombre} ${p.categoria} ${p.categoriaVista} ${p.ficha.marca} ${p.opcion}`).includes(s))));
    // Ofertas y destacados van de primero; por precio, los que no tienen precio quedan al final. El orden original desempata.
    const valor = modo === "cliente" ? (p) => p.venta : (p) => p.producto;
    const peso = orden === "destacados" ? (p) => (p.antes > 0 ? 0 : p.destacado ? 1 : 2)
      : orden === "menor" ? (p) => (valor(p) > 0 ? valor(p) : Infinity) : (p) => (valor(p) > 0 ? -valor(p) : Infinity);
    return lista.map((p, n) => [p, n]).sort((a, b) => (peso(a[0]) - peso(b[0])) || (a[1] - b[1])).map(([p]) => p);
  }, [productos, q, categoria, grupos, elegidas, orden, modo]); // eslint-disable-line react-hooks/exhaustive-deps

  const seleccionado = abierto ? productos.find((p) => p.codigo.toLowerCase() === abierto.toLowerCase()) : null;
  const sinPrecio = productos.filter((p) => p.venta <= 0).length;
  // El catálogo general es igual para todos: no recuerda a ningún cliente. Cada cliente entra a su cuenta por su enlace.
  const miEnlace = "";
  // En la cuenta del cliente: pestaña Catálogo o pestaña Mis cotizaciones (?ver=cotizaciones la abre directo).
  const [vista, setVista] = useState(() => (cuenta && new URLSearchParams(window.location.search).get("ver") === "cotizaciones" ? "cotizaciones" : "catalogo"));
  const enCotizaciones = Boolean(cuenta) && vista === "cotizaciones";
  const amarilla = modo === "cliente"; // portada del puerto en todo lo que ve el cliente, también en la pestaña de la app
  const elegirCategoria = (c) => {
    setCategoria((actual) => (actual === c ? "" : c));
    document.getElementById("cat-lista")?.scrollIntoView({ behavior: "smooth" });
  };
  const verVista = (v) => {
    setVista(v);
    window.history.replaceState(null, "", window.location.pathname + (v === "cotizaciones" ? "?ver=cotizaciones" : ""));
    window.scrollTo({ top: 0 });
  };

  // Cotización del cliente: solo en el catálogo público de clientes y si el taller configuró su WhatsApp.
  const empresa = useEmpresaPublica(!dentro && modo === "cliente");
  const whatsapp = empresa.whatsapp;
  const [pedido, setPedido] = useState(() => leerGuardado(CLAVE_PEDIDO, {}));
  const [panel, setPanel] = useState(false);
  const cambiarPedido = useMemo(() => (codigo, cantidad) => setPedido((actual) => {
    const nuevo = { ...actual };
    if (cantidad > 0) nuevo[codigo] = Math.min(99, cantidad); else delete nuevo[codigo];
    guardarLocal(CLAVE_PEDIDO, nuevo);
    return nuevo;
  }), []);
  const vaciarPedido = () => { guardarLocal(CLAVE_PEDIDO, {}); setPedido({}); };
  const pedir = whatsapp ? { pedido, cambiar: cambiarPedido, whatsapp } : null;
  const lineas = productos.filter((p) => pedido[p.codigo] > 0).map((p) => ({ ...p, cantidad: pedido[p.codigo] }));
  const unidades = lineas.reduce((s, l) => s + l.cantidad, 0);
  const cerrarPanel = useMemo(() => () => setPanel(false), []);

  return (
    <div className={`cat cat-${modo}${dentro || vistaPrevia ? " cat-dentro" : ""}${amarilla ? " cat-amarilla" : ""}${amarilla && enCotizaciones ? " sin-vitrina" : ""}`}>
      <style>{ESTILOS}</style>
      {vistaPrevia && (
        <div className="cat-propio">
          <b>Así ven tus clientes el catálogo</b>
          <p>Es exactamente lo que abre el enlace de abajo, con los mismos botones. El precio se pone en Producto; si un producto no lo tiene, el cliente ve «Consultar». Ojo: si aquí creas una cotización, se registra de verdad.</p>
          <p className="cat-estado-wa">{numeroWhatsapp(whatsappPropio)
            ? `Tus clientes pueden armar su cotización y enviártela al WhatsApp +${numeroWhatsapp(whatsappPropio)}.`
            : "Para que tus clientes te envíen su cotización por WhatsApp, escribe tu número en Producto, en los datos de tu empresa."}</p>
          <EnlaceCatalogo modo={modo} avisar={avisar} />
        </div>
      )}
      <header className="cat-top">
        <div className="cat-wrap cat-top-in">
          {amarilla && !dentro && <SelectorIdioma cambiar={vistaPrevia ? setIdiomaVista : undefined} />}
          <div className="cat-top-texto">
          <div className="cat-marca">
            <img src={LOGO_POR_DEFECTO} alt="" />
            <div><b>Taller Gregoriana</b><span>{T("Taller Mecánico y Lubricentro")}</span></div>
          </div>
          {modo === "interno" ? <>
            <span className="cat-aviso">Uso interno · precios de costo</span>
            <h1>Catálogo <em>interno</em></h1>
            <p>Precio de costo, flete y CBM de cada producto. No lo compartas con clientes.</p>
          </> : cuenta ? <>
            <h1>{cuenta.titulo}</h1>
            <p>{T("Aquí ves el estado de tus pedidos y puedes cotizar más productos del catálogo.")}</p>
          </> : <>
            <h1>{EN ? <>We import what you <em>need</em></> : <>Importamos lo que <em>necesitas</em></>}</h1>
            <p>{T("Elige una categoría o busca directamente.")}</p>
            {miEnlace && <p style={{ marginTop: 12 }}><a className="cat-btn cat-mis-boton" href={`/cliente/${miEnlace}?ver=cotizaciones`}><ClipboardList size={17} />{T("Mis cotizaciones")}</a></p>}
          </>}
          {cuenta && (
            <div className="cat-tabs" role="tablist" aria-label={T("Secciones")}>
              <button type="button" role="tab" aria-selected={!enCotizaciones} onClick={() => verVista("catalogo")}>{T("Catálogo")}</button>
              <button type="button" role="tab" aria-selected={enCotizaciones} onClick={() => verVista("cotizaciones")}>
                {T("Mis cotizaciones")}<i>{cuenta.cantidad}</i>
              </button>
            </div>
          )}
          {!enCotizaciones && (
            <div className="cat-buscar">
              <Search size={20} aria-hidden="true" />
              <input type="search" placeholder={T("Buscar por modelo, nombre o categoría")} aria-label={T("Buscar producto")}
                value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
          )}
          </div>
          {amarilla && !enCotizaciones && estado === "listo" && <Categorias productos={unicos} activa={categoria} elegir={elegirCategoria} />}
        </div>
      </header>

      {estado === "listo" && categorias.length > 1 && !enCotizaciones && (
        <nav className="cat-filtros" aria-label={T("Categorías")}>
          <div className="cat-wrap cat-pills">
            <button type="button" className="cat-pill" aria-pressed={!categoria} onClick={() => setCategoria("")}>
              {T("Todos")}<i>{unicos.length}</i>
            </button>
            {categorias.map(([c, n]) => (
              <button type="button" key={c} className="cat-pill" aria-pressed={categoria === c} onClick={() => setCategoria(c)}>
                {etiquetas.get(c) || T(c)}<i>{n}</i>
              </button>
            ))}
          </div>
        </nav>
      )}

      <main className="cat-wrap" id="cat-lista">
        {enCotizaciones ? <div style={{ paddingBottom: 56 }}>{cuenta.contenido}</div> : estado === "cargando" ? <p className="cat-cuenta" role="status">{T("Cargando productos…")}</p> : <>
          {aplicarGanancia && productos.length > 0 && <GananciaGeneral cuantos={productos.length} aplicar={aplicarGanancia} />}
          {cambiarPrecioCbm && productos.length > 0 && <PrecioCbmGeneral productos={productos} cambiar={cambiarPrecioCbm} />}
          <div className="cat-barra">
            <p className="cat-cuenta" role="status">
              {filtrados.length === unicos.length ? T("{n} productos", { n: unicos.length }) : T("{a} de {b} productos", { a: filtrados.length, b: unicos.length })}
            </p>
            {productos.length > 1 && (
              <label className="cat-ordenar">{T("Ordenar")}
                <select value={orden} onChange={(e) => setOrden(e.target.value)}>
                  <option value="destacados">{T("Destacados primero")}</option>
                  <option value="menor">{T("Precio: menor a mayor")}</option>
                  <option value="mayor">{T("Precio: mayor a menor")}</option>
                </select>
              </label>
            )}
          </div>
          {!productos.length ? <div className="cat-vacio">{T("Próximamente encontrarás nuestros productos aquí.")}</div> :
            !filtrados.length ? (
              <div className="cat-vacio">
                <p style={{ margin: "0 0 14px" }}>{T("Ningún producto coincide con tu búsqueda.")}</p>
                <button type="button" className="cat-btn" onClick={() => { setQ(""); setCategoria(""); }}>{T("Ver todos los productos")}</button>
              </div>
            ) : <div className="cat-grid">{filtrados.map((p) => <Tarjeta key={p.id} p={p} modo={modo} abrir={() => abrir(p.codigo)} guardar={guardarPrecio} pedir={pedir}
              opciones={opcionesDe(p)} elegir={(codigo) => elegirOpcion(p, codigo)} />)}</div>}
        </>}
      </main>

      <footer className="cat-pie-pagina">Taller Gregoriana · {T("Precios en dólares.")}</footer>

      {seleccionado && <Ficha p={seleccionado} modo={modo} cerrar={cerrar} pedir={pedir}
        opciones={opcionesDe(seleccionado)} elegir={(codigo) => elegirOpcion(seleccionado, codigo, true)} />}

      {pedir && unidades > 0 && !panel && !seleccionado && (
        <button type="button" className="cat-flotante" onClick={() => setPanel(true)}>
          <ClipboardList size={20} />
          <span>{T("Mi cotización")} · {unidades} {T(unidades === 1 ? "producto" : "productos")}</span>
          <b>{T("Ver y enviar")}</b>
        </button>
      )}
      {pedir && panel && <PanelCotizacion lineas={lineas} cambiar={cambiarPedido} vaciar={vaciarPedido} empresa={empresa} cerrar={cerrarPanel} token={cuenta?.token} nombre={cuenta?.nombre} />}
    </div>
  );
}
