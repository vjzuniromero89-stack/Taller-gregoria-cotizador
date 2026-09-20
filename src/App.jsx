import { useState, useEffect, useMemo, useRef } from "react";
import {
  Camera, Image as ImageIcon, Pencil, Trash2, X, Plus, Search, FileText,
  Printer, Share2, Eye, Home, Package, FileText as FileTextIcon, Users, Menu,
  TrendingUp, DollarSign, Ship, Cloud, CloudOff,
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { LOGO_POR_DEFECTO } from "./logo.js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = SUPABASE_URL && SUPABASE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_KEY)
  : null;

const STYLES = `
.app { font-family: 'Barlow', system-ui, -apple-system, 'Segoe UI', sans-serif; color:#14222B; background:#E9EEF1; min-height:100vh; }
.cond { font-family: 'Barlow Condensed', 'Arial Narrow', system-ui, sans-serif; }
.num { font-variant-numeric: tabular-nums; }
.paper { background:#fff; border:1px solid #CAD4DA; border-radius:10px; }
.muted { color:#5B6B75; }
.inp { width:100%; background:#F6F8F9; border:1px solid #CAD4DA; border-radius:6px; padding:9px 10px; font-size:16px; color:#14222B; }
.inp:focus { outline:none; border-color:#1B5E6B; box-shadow:0 0 0 3px rgba(27,94,107,.22); background:#fff; }
.inp-venta { background:#FFF9E6; border-color:#E2C45C; font-weight:600; }
.lbl { font-size:13px; font-weight:500; color:#5B6B75; display:block; margin-bottom:4px; line-height:1.2; }
.btn { border-radius:6px; padding:10px 16px; font-weight:600; font-size:15px; display:inline-flex; align-items:center; justify-content:center; gap:6px; }
.btn:focus-visible, .tab:focus-visible, .icon-btn:focus-visible { outline:3px solid #F2B705; outline-offset:2px; }
.btn-primary { background:#1B5E6B; color:#fff; }
.btn-primary:hover { background:#134650; }
.btn-primary:disabled { background:#9DB3B9; cursor:not-allowed; }
.btn-ghost { background:#fff; color:#1B5E6B; border:1px solid #CAD4DA; }
.btn-ghost:hover { background:#F0F4F5; }
.btn-ghost:disabled { color:#9DB3B9; cursor:not-allowed; }
.btn-danger { background:#fff; color:#A3321F; border:1px solid #E3C3BC; }
.btn-danger-solid { background:#A3321F; color:#fff; }
.icon-btn { border-radius:6px; padding:6px; color:#5B6B75; }
.icon-btn:hover { background:#EEF2F4; color:#14222B; }
.photo { border:2px dashed #9FB0B9; border-radius:8px; background:#F6F8F9; }
.label-block { background:#14222B; color:#fff; border-radius:10px; overflow:hidden; }
.label-stripe { height:10px; background: repeating-linear-gradient(135deg, #F2B705 0 14px, #14222B 14px 28px); }
.toast-ok { background:#1B5E6B; color:#fff; }
.toast-error { background:#A3321F; color:#fff; }
.row-line { border-top:1px solid #E1E7EA; }
.pos { color:#1D7A46; } .neg { color:#A3321F; }
.pos-dark { color:#86D9A8; } .neg-dark { color:#F4A08C; }

.chip { display:inline-flex; align-items:center; background:#FFF4CC; border:1px solid #E2C45C; color:#7A5A00;
        border-radius:999px; padding:1px 10px; font-size:12px; font-weight:600; white-space:nowrap; line-height:1.5; }

.logo-empresa { height:clamp(64px,18vw,96px); max-width:46%; object-fit:contain; flex-shrink:0; }
.nombre-empresa { font-size:clamp(26px,7vw,38px); line-height:1.05; font-weight:700; letter-spacing:.01em;
  background:linear-gradient(90deg,#14222B 0%,#1B5E6B 45%,#F2B705 100%);
  -webkit-background-clip:text; background-clip:text; color:#1B5E6B; -webkit-text-fill-color:transparent; }
@supports not ((-webkit-background-clip:text) or (background-clip:text)) {
  .nombre-empresa { color:#1B5E6B; -webkit-text-fill-color:currentColor; }
}

.dollar-rain { position:fixed; left:0; top:132px; width:min(22vw,150px); height:calc(100vh - 132px);
  overflow:hidden; pointer-events:none; z-index:20; opacity:.72; }
.dollar-rain span { position:absolute; top:-48px; color:#F2B705; font-family:"Barlow Condensed", sans-serif;
  font-size:clamp(18px,3vw,30px); font-weight:700; text-shadow:0 2px 5px rgba(20,39,49,.24);
  animation:dollar-fall linear infinite; will-change:transform, opacity; }
@keyframes dollar-fall {
  0% { transform:translate3d(0,-60px,0) rotate(-18deg); opacity:0; }
  12% { opacity:.9; }
  50% { transform:translate3d(12px,45vh,0) rotate(12deg); opacity:.72; }
  88% { opacity:.55; }
  100% { transform:translate3d(-5px,calc(100vh - 100px),0) rotate(32deg); opacity:0; }
}
@media (prefers-reduced-motion: reduce) { .dollar-rain { display:none; } }

.product-info-line { display:flex; align-items:stretch; gap:0; overflow-x:auto;
  border:1px solid #E1E7EA; border-radius:8px; scrollbar-width:thin; }
.product-info-line > div { flex:0 0 145px; min-width:145px; padding:10px 12px; border-right:1px solid #E1E7EA; background:#fff; }
.product-info-line > div:last-child { border-right:0; }
.product-info-line > div:nth-child(4) { background:#FFF4CC; border:2px solid #F2B705;
  box-shadow: inset 0 0 0 1px rgba(242,183,5,.18); margin:-1px 0; }
.product-info-line > div:nth-child(4) .lbl,
.product-info-line > div:nth-child(4) .num { color:#7A5900; font-weight:700; }

.layout { display:flex; min-height:100vh; }
.sidebar { background:#14222B; color:#AFC0C8; width:230px; flex-shrink:0;
  display:flex; flex-direction:column; position:sticky; top:0; height:100vh; overflow-y:auto;
  transition:transform .25s ease; z-index:50; }
.sidebar-logo { padding:20px 16px 12px; display:flex; align-items:center; gap:10px;
  border-bottom:1px solid #2E4150; }
.sidebar-logo img { height:36px; max-width:60px; object-fit:contain; background:#fff;
  border-radius:6px; padding:3px 5px; flex-shrink:0; }
.sidebar-logo .nombre { font-family:'Barlow Condensed', sans-serif; font-weight:700;
  font-size:19px; color:#fff; line-height:1.05; }
.sidebar-logo .sub { font-size:11px; color:#7A8A93; margin-top:2px; }
.sidebar-nav { flex:1; padding:12px 8px; display:flex; flex-direction:column; gap:4px; }
.nav-item { display:flex; align-items:center; gap:12px; padding:12px 14px;
  border-radius:8px; color:#AFC0C8; font-weight:600; font-size:15px;
  font-family:'Barlow Condensed', sans-serif; letter-spacing:.02em;
  transition:background .15s, color .15s; cursor:pointer; text-align:left; width:100%; }
.nav-item:hover { background:#1E2F3A; color:#fff; }
.nav-item[aria-selected="true"] { background:#1B5E6B; color:#fff; box-shadow:inset 4px 0 0 #F2B705; }
.nav-item[aria-selected="true"] .nav-icon { color:#F2B705; }
.nav-icon { flex-shrink:0; color:currentColor; }
.sidebar-footer { padding:12px 16px; border-top:1px solid #2E4150;
  font-size:11px; color:#5B6B75; text-align:center; }
.sidebar-footer .estado { display:flex; align-items:center; justify-content:center; gap:5px; margin-top:4px; }
.sidebar-footer .estado.ok { color:#86D9A8; }
.sidebar-footer .estado.off { color:#F4A08C; }

.hamburger { position:fixed; top:12px; left:12px; z-index:60; background:#14222B;
  color:#fff; border-radius:8px; padding:10px; display:none; box-shadow:0 2px 8px rgba(0,0,0,.25); }
.hamburger:hover { background:#1E2F3A; }

.backdrop { position:fixed; inset:0; background:rgba(20,34,43,.6); z-index:45;
  opacity:0; pointer-events:none; transition:opacity .25s; }
.backdrop.open { opacity:1; pointer-events:auto; }

.main-content { flex:1; min-width:0; padding:20px; }
.main-inner { max-width:1100px; margin:0 auto; }

.page-head { background:#fff; border:1px solid #CAD4DA; border-radius:14px; padding:18px 20px;
  display:flex; align-items:center; gap:14px; box-shadow:0 3px 14px rgba(20,34,43,.06); }
.page-head-icon { width:46px; height:46px; border-radius:12px; display:flex; align-items:center;
  justify-content:center; color:#1B5E6B; background:#E4EFF1; flex-shrink:0; }
.page-head h2 { margin:0; font-family:'Barlow Condensed',sans-serif; font-size:28px; line-height:1;
  font-weight:700; color:#14222B; }
.page-head p { margin:5px 0 0; color:#5B6B75; font-size:14px; line-height:1.35; }
.section-toolbar { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:12px; }
.section-toolbar h2 { margin:0; }
.mobile-topbar, .mobile-bottom-nav { display:none; }
.quote-list { box-shadow:0 3px 14px rgba(20,34,43,.05); }

.hero { position:relative; border-radius:14px; overflow:hidden; min-height:220px;
  display:flex; align-items:flex-end; padding:24px; color:#fff;
  background-size:cover; background-position:center;
  box-shadow:0 4px 20px rgba(20,34,43,.15); }
.hero::before { content:""; position:absolute; inset:0;
  background:linear-gradient(180deg, rgba(20,34,43,.15) 0%, rgba(20,34,43,.85) 100%); }
.hero-content { position:relative; z-index:1; }
.hero h2 { font-family:'Barlow Condensed', sans-serif; font-weight:700;
  font-size:clamp(28px,5vw,44px); line-height:1.05; margin:0 0 6px; }
.hero p { font-size:15px; opacity:.9; margin:0; }

.stats-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr));
  gap:14px; margin-top:20px; }
.stat-card { background:#fff; border:1px solid #CAD4DA; border-radius:12px;
  padding:18px; display:flex; flex-direction:column; gap:6px;
  transition:transform .15s, box-shadow .15s; }
.stat-card:hover { transform:translateY(-2px); box-shadow:0 6px 20px rgba(20,34,43,.1); }
.stat-icon { width:40px; height:40px; border-radius:10px; display:flex;
  align-items:center; justify-content:center; margin-bottom:4px; }
.stat-label { font-size:13px; color:#5B6B75; font-weight:500; }
.stat-value { font-family:'Barlow Condensed', sans-serif; font-weight:700;
  font-size:32px; line-height:1; color:#14222B; }
.stat-sub { font-size:12px; color:#5B6B75; margin-top:2px; }

.quick-actions { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr));
  gap:12px; margin-top:20px; }
.quick-btn { background:#fff; border:1px solid #CAD4DA; border-radius:10px;
  padding:16px; display:flex; align-items:center; gap:12px; font-weight:600;
  font-size:15px; color:#14222B; cursor:pointer; transition:all .15s; text-align:left; }
.quick-btn:hover { border-color:#1B5E6B; background:#F6F8F9; transform:translateY(-1px); }
.quick-btn .qa-icon { width:38px; height:38px; border-radius:8px;
  display:flex; align-items:center; justify-content:center; flex-shrink:0; }

.recientes { margin-top:20px; }
.recientes h3 { font-family:'Barlow Condensed', sans-serif; font-weight:700;
  font-size:22px; margin:0 0 12px; }

.reciente-item { display:flex; align-items:center; gap:12px; width:100%;
  text-align:left; padding:14px 16px; background:#fff; border:0; cursor:pointer;
  transition:background .15s; }
.reciente-item:hover { background:#F6F8F9; }
.reciente-item + .reciente-item { border-top:1px solid #E1E7EA; }
.reciente-num { font-weight:600; font-variant-numeric:tabular-nums; }
.reciente-total { font-family:'Barlow Condensed', sans-serif; font-weight:700;
  font-size:19px; font-variant-numeric:tabular-nums; }
.reciente-sub { display:flex; justify-content:space-between; gap:8px;
  font-size:14px; color:#5B6B75; margin-top:2px; }
.reciente-cliente { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

/* Formulario de producto más compacto */
.form-producto { display:flex; flex-direction:column; gap:14px; }
.form-grid-cod { display:grid; grid-template-columns:1fr 3fr; gap:12px; }
.form-grid-3 { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; }
.form-grid-2 { display:grid; grid-template-columns:repeat(2,1fr); gap:12px; }
.form-acciones { display:flex; gap:10px; padding-top:6px; padding-bottom:6px; }

/* Card del formulario con espaciado correcto */
.form-card { background:#fff; border:1px solid #CAD4DA; border-radius:10px;
  padding:24px 24px 28px; }

@media (max-width: 860px) {
  .mobile-topbar { position:fixed; display:flex; align-items:center; gap:12px; top:0; left:0; right:0;
    height:60px; padding:8px 14px; z-index:44; background:#14222B; color:#fff;
    box-shadow:0 2px 10px rgba(20,34,43,.24); }
  .mobile-topbar .hamburger { position:static; display:flex; box-shadow:none; padding:8px; }
  .mobile-topbar-title { min-width:0; flex:1; font-family:'Barlow Condensed',sans-serif;
    font-size:19px; font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .mobile-status { width:9px; height:9px; border-radius:50%; background:#A3321F; flex-shrink:0; }
  .mobile-status.ok { background:#52B788; box-shadow:0 0 0 3px rgba(82,183,136,.18); }
  .sidebar { position:fixed; top:0; left:0; height:100vh; transform:translateX(-100%); }
  .sidebar.open { transform:translateX(0); }
  .main-content { padding:14px; padding-top:76px; padding-bottom:96px; }
  .mobile-bottom-nav { position:fixed; left:0; right:0; bottom:0; z-index:43; display:grid;
    grid-template-columns:repeat(4,1fr); background:#fff; border-top:1px solid #CAD4DA;
    box-shadow:0 -4px 16px rgba(20,34,43,.10); padding:6px 4px max(6px,env(safe-area-inset-bottom)); }
  .mobile-nav-item { min-width:0; padding:7px 2px 5px; display:flex; flex-direction:column;
    align-items:center; justify-content:center; gap:3px; color:#5B6B75; font-size:10px;
    line-height:1.05; font-weight:600; border-radius:8px; }
  .mobile-nav-item[aria-selected="true"] { color:#1B5E6B; background:#E4EFF1; }
  .mobile-nav-item[aria-selected="true"] svg { color:#F2B705; }
  .page-head { padding:15px; align-items:flex-start; }
  .page-head-icon { width:40px; height:40px; border-radius:10px; }
  .page-head h2 { font-size:24px; }
  .section-toolbar { align-items:stretch; flex-direction:column; }
  .section-toolbar .relative { width:100%; }
  .paper, .form-card, .label-block { max-width:100%; }
  .product-info-line { max-width:calc(100vw - 132px); }
  .form-grid-cod, .form-grid-3, .form-grid-2 { grid-template-columns:1fr; }
  .form-card { padding:20px 16px 24px; }
}
`;

/* ---------- utilidades ---------- */
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

const num = (v) => {
  let t = String(v ?? "").trim().replace(/\s/g, "").replace("$", "");
  if (t.includes(",") && t.includes(".")) t = t.replace(/,/g, "");
  else if (/^\d{1,3}(,\d{3})+$/.test(t)) t = t.replace(/,/g, "");
  else t = t.replace(",", ".");
  const n = parseFloat(t);
  return isNaN(n) ? 0 : n;
};
const money = (n) => (n < 0 ? "-" : "") + "$" + Math.abs(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const m3 = (n) => (n || 0).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 3 });
const pct = (n) => (n * 100).toLocaleString("en-US", { maximumFractionDigits: 1 }) + "%";
const kg = (n) => (n || 0).toLocaleString("en-US", { maximumFractionDigits: 2 }) + " kg";

const KG_POR_CBM = 350;
const COMISION = 0.03;

const cbmCobro = (cbm, peso) => {
  const vol = num(cbm);
  const porPeso = num(peso) / KG_POR_CBM;
  return { vol, porPeso, cobrable: Math.max(vol, porPeso), por: porPeso > vol ? "peso" : "volumen" };
};

const fecha = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString("es", { day: "2-digit", month: "short", year: "numeric" }) + ", " +
    d.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" });
};

/* ---------- Supabase helpers ---------- */
async function sbLoadProductos() {
  if (!supabase) return null;
  const { data, error } = await supabase.from("productos").select("*").order("creado", { ascending: false });
  if (error) { console.error("Error cargando productos:", error); return null; }
  return (data || []).map((p) => ({
    id: p.id, codigo: p.codigo || "", nombre: p.nombre || "",
    cbm: p.cbm || 0, peso: p.peso || 0,
    precioCbm: p.precio_cbm || 0, precioProducto: p.precio_producto || 0,
    precioVenta: p.precio_venta || 0, foto: p.foto || "",
  }));
}
async function sbSaveProductos(lista) {
  if (!supabase) return false;
  try {
    const filas = lista.map((p) => ({
      id: p.id, codigo: p.codigo, nombre: p.nombre,
      cbm: p.cbm, peso: p.peso, precio_cbm: p.precioCbm,
      precio_producto: p.precioProducto, precio_venta: p.precioVenta, foto: p.foto || "",
    }));
    const { error: errDel } = await supabase.from("productos").delete().neq("id", "___nada___");
    if (errDel) { console.error(errDel); return false; }
    if (filas.length > 0) {
      const { error: errIns } = await supabase.from("productos").insert(filas);
      if (errIns) { console.error(errIns); return false; }
    }
    return true;
  } catch (e) { console.error(e); return false; }
}

async function sbLoadCotizacionesClientes() {
  if (!supabase) return null;
  const { data, error } = await supabase.from("cotizaciones_clientes").select("*").order("fecha", { ascending: false });
  if (error) { console.error(error); return null; }
  return {
    contador: (data || []).reduce((max, c) => Math.max(max, parseInt((c.numero || "").split("-")[1] || "0", 10) || 0), 0),
    lista: (data || []).map((c) => ({
      id: c.id, numero: c.numero, fecha: c.fecha, cliente: c.cliente || "",
      descuento: c.descuento || 0, descuentoMonto: c.descuento_monto || 0,
      totalFinal: c.total_final || 0, lineas: c.lineas || [], totales: c.totales || {},
    })),
  };
}
async function sbSaveCotizacionesClientes(estado) {
  if (!supabase) return false;
  try {
    const filas = estado.lista.map((c) => ({
      id: c.id, numero: c.numero, fecha: c.fecha, cliente: c.cliente || "",
      descuento: c.descuento || 0, descuento_monto: c.descuentoMonto || 0,
      total_final: c.totalFinal || 0, lineas: c.lineas || [], totales: c.totales || {},
    }));
    const { error: errDel } = await supabase.from("cotizaciones_clientes").delete().neq("id", "___nada___");
    if (errDel) { console.error(errDel); return false; }
    if (filas.length > 0) {
      const { error: errIns } = await supabase.from("cotizaciones_clientes").insert(filas);
      if (errIns) { console.error(errIns); return false; }
    }
    return true;
  } catch (e) { console.error(e); return false; }
}

async function sbLoadCotizacionesInternas() {
  if (!supabase) return null;
  const { data, error } = await supabase.from("cotizaciones_internas").select("*").order("fecha", { ascending: false });
  if (error) { console.error(error); return null; }
  return {
    contador: 0,
    lista: (data || []).map((c) => ({
      id: c.id, numero: c.numero, fecha: c.fecha, cliente: c.cliente || "",
      deCliente: c.de_cliente || false, descuento: c.descuento || 0,
      descuentoMonto: c.descuento_monto || 0, totalFinal: c.total_final || 0,
      lineas: c.lineas || [], totales: c.totales || {},
    })),
  };
}
async function sbSaveCotizacionesInternas(estado) {
  if (!supabase) return false;
  try {
    const filas = estado.lista.map((c) => ({
      id: c.id, numero: c.numero, fecha: c.fecha, cliente: c.cliente || "",
      de_cliente: c.deCliente || false, descuento: c.descuento || 0,
      descuento_monto: c.descuentoMonto || 0, total_final: c.totalFinal || 0,
      lineas: c.lineas || [], totales: c.totales || {},
    }));
    const { error: errDel } = await supabase.from("cotizaciones_internas").delete().neq("id", "___nada___");
    if (errDel) { console.error(errDel); return false; }
    if (filas.length > 0) {
      const { error: errIns } = await supabase.from("cotizaciones_internas").insert(filas);
      if (errIns) { console.error(errIns); return false; }
    }
    return true;
  } catch (e) { console.error(e); return false; }
}

async function sbLoadEmpresa() {
  if (!supabase) return null;
  const { data, error } = await supabase.from("configuracion").select("*").eq("clave", "empresa").maybeSingle();
  if (error) { console.error(error); return null; }
  return data ? data.valor : null;
}
async function sbSaveEmpresa(empresa) {
  if (!supabase) return false;
  const { error } = await supabase.from("configuracion").upsert({ clave: "empresa", valor: empresa });
  if (error) { console.error(error); return false; }
  return true;
}

/* ---------- respaldo local (IndexedDB) ---------- */
let dbPromise = null;
function abrirDB() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const r = indexedDB.open("cotizador-cbm", 1);
      r.onupgradeneeded = () => r.result.createObjectStore("kv");
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(r.error);
    });
  }
  return dbPromise;
}
async function localLoad(key, fallback) {
  try {
    const db = await abrirDB();
    const v = await new Promise((resolve, reject) => {
      const q = db.transaction("kv", "readonly").objectStore("kv").get(key);
      q.onsuccess = () => resolve(q.result);
      q.onerror = () => reject(q.error);
    });
    return v ? JSON.parse(v) : fallback;
  } catch (e) { return fallback; }
}
async function localSave(key, value) {
  try {
    const db = await abrirDB();
    await new Promise((resolve, reject) => {
      const tx = db.transaction("kv", "readwrite");
      tx.objectStore("kv").put(JSON.stringify(value), key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
    return true;
  } catch (e) { return false; }
}

function resizeSrc(src, max, quality) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const s = Math.min(1, max / Math.max(img.width, img.height));
      const w = Math.round(img.width * s), h = Math.round(img.height * s);
      const c = document.createElement("canvas");
      c.width = w; c.height = h;
      const ctx = c.getContext("2d");
      ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
      resolve(c.toDataURL("image/jpeg", quality));
    };
    img.onerror = reject;
    img.src = src;
  });
}
function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}
async function miniatura(p) {
  try { return p.foto ? await resizeSrc(p.foto, 120, 0.7) : ""; } catch (e) { return ""; }
}
const siguienteNumero = (prefijo, contador) => `${prefijo}-${String(contador).padStart(4, "0")}`;

const calcLinea = (l) => {
  const cant = num(l.cantidad);
  const k = cbmCobro(l.cbm, l.peso);
  const totalCbm = k.cobrable * cant;
  const totalPeso = num(l.peso) * cant;
  const totalProducto = num(l.precioProducto) * cant;
  const totalPrecioCbm = totalCbm * num(l.precioCbm);
  const totalVenta = num(l.precioVenta) * cant;
  return { k, totalCbm, totalPeso, totalProducto, totalPrecioCbm, totalVenta };
};
const calcTotales = (lineas) => {
  const t = lineas.reduce((acc, l) => {
    const c = calcLinea(l);
    acc.totalCantidad += num(l.cantidad);
    acc.totalCbm += c.totalCbm; acc.totalPeso += c.totalPeso; acc.totalProducto += c.totalProducto;
    acc.totalPrecioCbm += c.totalPrecioCbm; acc.totalVenta += c.totalVenta;
    return acc;
  }, { totalCantidad: 0, totalCbm: 0, totalPeso: 0, totalProducto: 0, totalPrecioCbm: 0, totalVenta: 0 });
  t.subtotal = t.totalProducto + t.totalPrecioCbm;
  t.comision = t.subtotal * COMISION;
  t.general = t.subtotal + t.comision;
  t.ganancia = t.totalVenta - t.subtotal;
  t.margen = t.totalVenta > 0 ? t.ganancia / t.totalVenta : 0;
  return t;
};

const calcCliente = (l) => {
  const cant = num(l.cantidad);
  const k = cbmCobro(l.cbm, l.peso);
  const totalCbm = k.cobrable * cant;
  const totalPeso = num(l.peso) * cant;
  const totalFlete = totalCbm * num(l.precioCbm);
  const costoUnit = num(l.precioProducto) + k.cobrable * num(l.precioCbm);
  const totalCosto = costoUnit * cant;
  const totalProducto = num(l.precioProducto) * cant;
  const totalVenta = num(l.precioVenta) * cant;
  return { k, totalCbm, totalPeso, costoUnit, totalProducto, totalCosto, totalFlete, totalVenta, ganancia: totalVenta - totalCosto };
};
const calcTotalesCliente = (lineas) => {
  const t = lineas.reduce((acc, l) => {
    const c = calcCliente(l);
    acc.totalCantidad += num(l.cantidad);
    acc.totalCbm += c.totalCbm; acc.totalPeso += c.totalPeso; acc.totalProducto += c.totalProducto;
    acc.totalCosto += c.totalCosto; acc.totalFlete += c.totalFlete; acc.totalVenta += c.totalVenta;
    return acc;
  }, { totalCantidad: 0, totalCbm: 0, totalPeso: 0, totalProducto: 0, totalCosto: 0, totalFlete: 0, totalVenta: 0 });
  t.ganancia = t.totalVenta - t.totalCosto;
  t.margen = t.totalVenta > 0 ? t.ganancia / t.totalVenta : 0;
  return t;
};

const totalConDescuento = (cot, totalVenta) => {
  const p = Math.min(100, Math.max(0, num(cot && cot.descuento)));
  const bruto = num(totalVenta);
  const monto = num(cot && cot.descuentoMonto);
  return Math.max(0, bruto - (monto > 0 ? monto : bruto * p / 100));
};

const esc = (v) => String(v ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

const HOJA_CSS = `
  @page { size: A4; margin: 14mm; }
  * { box-sizing: border-box; }
  body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #14222B; margin: 0; font-size: 12px; }
  .top { display: flex; justify-content: space-between; align-items: flex-start; gap: 24px;
         border-bottom: 3px solid #14222B; padding-bottom: 12px; }
  .logo { max-height: 70px; max-width: 230px; display: block; margin-bottom: 6px; }
  .empresa { font-size: 20px; font-weight: 700; letter-spacing: .02em; }
  .contacto { color: #5B6B75; font-size: 11px; margin-top: 3px; white-space: pre-line; }
  .doc { text-align: right; }
  .doc h1 { margin: 0; font-size: 22px; letter-spacing: .08em; font-weight: 700; }
  .doc .n { font-size: 15px; font-weight: 700; margin-top: 2px; }
  .doc .f { color: #5B6B75; font-size: 11px; }
  .interno { display: inline-block; margin-top: 4px; background: #A3321F; color: #fff;
             padding: 2px 8px; border-radius: 3px; font-size: 10px; letter-spacing: .08em; }
  .para { margin: 14px 0 10px; }
  .para .lb { color: #5B6B75; font-size: 10px; text-transform: uppercase; letter-spacing: .08em; }
  .para .v { font-size: 14px; font-weight: 600; }
  table { width: 100%; border-collapse: collapse; }
  thead th { background: #14222B; color: #fff; font-size: 10px; letter-spacing: .05em;
             text-transform: uppercase; padding: 7px 6px; text-align: left; }
  tbody td { padding: 7px 6px; border-bottom: 1px solid #E1E7EA; vertical-align: middle; }
  tbody tr:nth-child(even) td { background: #F6F8F9; }
  .r { text-align: right; white-space: nowrap; }
  .img { width: 52px; height: 52px; object-fit: cover; border: 1px solid #E1E7EA; border-radius: 3px; display: block; }
  .nom { font-weight: 600; }
  .cod { color: #5B6B75; font-size: 10px; }
  .totales { margin-top: 14px; display: flex; justify-content: flex-end; }
  .caja { width: 290px; }
  .caja .fila { display: flex; justify-content: space-between; padding: 5px 10px; font-size: 12px; }
  .caja .fila + .fila { border-top: 1px solid #E1E7EA; }
  .caja .total { background: #14222B; color: #fff; padding: 10px; display: flex;
                 justify-content: space-between; align-items: center; margin-top: 6px; }
  .caja .total span { font-size: 11px; letter-spacing: .06em; text-transform: uppercase; }
  .caja .total b { font-size: 20px; }
  .pie { margin-top: 26px; border-top: 1px solid #E1E7EA; padding-top: 10px;
         color: #5B6B75; font-size: 10px; line-height: 1.5; }
`;

const PIE_TEXTO = (interno) =>
  `Precios en dólares estadounidenses. Esta cotización es válida por 15 días a partir de la fecha de emisión. ` +
  `Los volúmenes de envío se cobran por el CBM mayor entre volumen y peso (${KG_POR_CBM} kg por m³). ` +
  (interno ? "Documento de uso interno: no compartir con el cliente." : "Gracias por su preferencia.");

function hojaHTML(d) {
  const { empresa, cot, columnas, filas, totales, total, totalLabel, interno } = d;
  const cabecera = columnas.map((c) => `<th class="${c.r ? "r" : ""}">${esc(c.t)}</th>`).join("");
  const cuerpo = filas.map((f) => {
    const celdas = f.valores.map((v, i) => {
      const col = columnas[i + 2];
      return `<td class="${col.r ? "r" : ""}">${col.fuerte ? `<b>${esc(v)}</b>` : esc(v)}</td>`;
    }).join("");
    return `<tr>
      <td>${f.foto ? `<img class="img" src="${f.foto}" alt="">` : ""}</td>
      <td><div class="nom">${esc(f.nombre)}</div><div class="cod">${esc(f.sub)}</div></td>
      ${celdas}</tr>`;
  }).join("");
  const resumen = totales.map(([k, v]) => `<div class="fila"><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join("");
  return `<!doctype html><html lang="es"><head><meta charset="utf-8">
<title>${esc(cot.numero)}</title><style>${HOJA_CSS}</style></head><body>
  <div class="top">
    <div>
      ${empresa.logo ? `<img class="logo" src="${empresa.logo}" alt="">` : ""}
      <div class="empresa">${esc(empresa.nombre || "Cotización")}</div>
      ${empresa.contacto ? `<div class="contacto">${esc(empresa.contacto)}</div>` : ""}
    </div>
    <div class="doc">
      <h1>COTIZACIÓN</h1>
      <div class="n">${esc(cot.numero)}</div>
      <div class="f">${esc(fecha(cot.fecha))}</div>
      ${interno ? `<div class="interno">USO INTERNO</div>` : ""}
    </div>
  </div>
  <div class="para"><div class="lb">Cliente</div><div class="v">${esc(cot.cliente || "Sin cliente")}</div></div>
  <table><thead><tr>${cabecera}</tr></thead><tbody>${cuerpo}</tbody></table>
  <div class="totales"><div class="caja">${resumen}
    <div class="total"><span>${esc(totalLabel)}</span><b>${esc(total)}</b></div>
  </div></div>
  <div class="pie">${esc(PIE_TEXTO(interno))}</div>
  <script>window.onload = function () { setTimeout(function () { window.print(); }, 350); };<\/script>
</body></html>`;
}

function imprimirHoja(html) {
  const f = document.createElement("iframe");
  f.setAttribute("aria-hidden", "true");
  f.style.cssText = "position:fixed;right:0;bottom:0;width:1px;height:1px;opacity:0;border:0;";
  document.body.appendChild(f);
  f.contentWindow.document.open();
  f.contentWindow.document.write(html);
  f.contentWindow.document.close();
  setTimeout(() => { try { document.body.removeChild(f); } catch (e) {} }, 120000);
}

function cargarImg(src) {
  return new Promise((resolve) => {
    if (!src) return resolve(null);
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function envolver(ctx, texto, ancho) {
  const palabras = String(texto).split(/\s+/);
  const lineas = [];
  let linea = "";
  palabras.forEach((w) => {
    const prueba = linea ? `${linea} ${w}` : w;
    if (ctx.measureText(prueba).width > ancho && linea) { lineas.push(linea); linea = w; }
    else linea = prueba;
  });
  if (linea) lineas.push(linea);
  return lineas;
}

async function hojaImagen(d) {
  const { empresa, cot, columnas, filas, totales, total, totalLabel, interno } = d;
  const W = 1240, M = 64, F = "Helvetica, Arial, sans-serif";
  const ALTO_FILA = 78, ANCHO_NUM = 120, ANCHO_FOTO = 96;
  const numericas = columnas.length - 2;
  const xFoto = M, xProd = M + ANCHO_FOTO + 16;
  const anchoProd = W - M * 2 - ANCHO_FOTO - 16 - ANCHO_NUM * numericas;
  const xNum = (i) => W - M - ANCHO_NUM * (numericas - i);

  const logo = await cargarImg(empresa.logo);
  const fotos = await Promise.all(filas.map((f) => cargarImg(f.foto)));

  const c = document.createElement("canvas");
  const ctx0 = c.getContext("2d");
  ctx0.font = `13px ${F}`;
  const lineasPie = envolver(ctx0, PIE_TEXTO(interno), W - M * 2);

  const altoLogo = logo ? Math.min(90, (logo.height / logo.width) * 260) : 0;
  const yTabla = M + altoLogo + (logo ? 14 : 0) + 130;
  const altoTotales = 34 * totales.length + 78;
  const H = yTabla + 46 + ALTO_FILA * filas.length + 28 + altoTotales + 50 + lineasPie.length * 20 + M;

  c.width = W; c.height = H;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#FFFFFF"; ctx.fillRect(0, 0, W, H);
  ctx.textBaseline = "alphabetic";

  const yTop = M;
  let y = M;
  if (logo) {
    const anchoLogo = (logo.width / logo.height) * altoLogo;
    ctx.drawImage(logo, M, y, Math.min(anchoLogo, 260), altoLogo);
    y += altoLogo + 14;
  }
  ctx.fillStyle = "#14222B"; ctx.font = `bold 30px ${F}`; ctx.textAlign = "left";
  ctx.fillText(empresa.nombre || "Cotización", M, y + 24);
  let yIzq = y + 24;
  if (empresa.contacto) {
    ctx.fillStyle = "#5B6B75"; ctx.font = `15px ${F}`;
    String(empresa.contacto).split("\n").forEach((l, i) => ctx.fillText(l, M, yIzq + 26 + i * 20));
    yIzq += 26 + String(empresa.contacto).split("\n").length * 20;
  }

  ctx.textAlign = "right";
  ctx.fillStyle = "#14222B"; ctx.font = `bold 32px ${F}`;
  ctx.fillText("COTIZACIÓN", W - M, yTop + 30);
  ctx.font = `bold 22px ${F}`;
  ctx.fillText(cot.numero, W - M, yTop + 60);
  ctx.fillStyle = "#5B6B75"; ctx.font = `15px ${F}`;
  ctx.fillText(fecha(cot.fecha), W - M, yTop + 84);
  if (interno) {
    ctx.fillStyle = "#A3321F"; ctx.fillRect(W - M - 140, yTop + 96, 140, 26);
    ctx.fillStyle = "#fff"; ctx.font = `bold 13px ${F}`; ctx.textAlign = "center";
    ctx.fillText("USO INTERNO", W - M - 70, yTop + 114);
    ctx.textAlign = "right";
  }

  const yLinea = Math.max(yIzq + 16, yTop + (interno ? 136 : 104));
  ctx.fillStyle = "#14222B"; ctx.fillRect(M, yLinea, W - M * 2, 4);

  ctx.textAlign = "left";
  ctx.fillStyle = "#5B6B75"; ctx.font = `13px ${F}`;
  ctx.fillText("CLIENTE", M, yLinea + 30);
  ctx.fillStyle = "#14222B"; ctx.font = `bold 20px ${F}`;
  ctx.fillText(cot.cliente || "Sin cliente", M, yLinea + 56);

  let yT = yLinea + 84;
  ctx.fillStyle = "#14222B"; ctx.fillRect(M, yT, W - M * 2, 38);
  ctx.fillStyle = "#FFFFFF"; ctx.font = `bold 13px ${F}`;
  ctx.fillText(columnas[0].t.toUpperCase(), xFoto + 10, yT + 25);
  ctx.fillText(columnas[1].t.toUpperCase(), xProd, yT + 25);
  ctx.textAlign = "right";
  for (let i = 0; i < numericas; i++) ctx.fillText(columnas[i + 2].t.toUpperCase(), xNum(i) + ANCHO_NUM - 10, yT + 25);

  let yF = yT + 38;
  filas.forEach((f, idx) => {
    if (idx % 2 === 1) { ctx.fillStyle = "#F6F8F9"; ctx.fillRect(M, yF, W - M * 2, ALTO_FILA); }
    const img = fotos[idx];
    if (img) {
      const lado = 58, ix = xFoto + 10, iy = yF + (ALTO_FILA - lado) / 2;
      const escala = Math.max(lado / img.width, lado / img.height);
      const sw = lado / escala, sh = lado / escala;
      ctx.drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, ix, iy, lado, lado);
      ctx.strokeStyle = "#E1E7EA"; ctx.lineWidth = 1; ctx.strokeRect(ix + .5, iy + .5, lado, lado);
    }
    ctx.textAlign = "left";
    ctx.fillStyle = "#14222B"; ctx.font = `bold 17px ${F}`;
    const nombre = envolver(ctx, f.nombre, anchoProd - 12)[0] || "";
    ctx.fillText(nombre, xProd, yF + 34);
    ctx.fillStyle = "#5B6B75"; ctx.font = `13px ${F}`;
    ctx.fillText(f.sub, xProd, yF + 55);
    ctx.textAlign = "right";
    f.valores.forEach((v, i) => {
      const col = columnas[i + 2];
      ctx.fillStyle = "#14222B";
      ctx.font = `${col.fuerte ? "bold " : ""}16px ${F}`;
      ctx.fillText(v, xNum(i) + ANCHO_NUM - 10, yF + 45);
    });
    ctx.strokeStyle = "#E1E7EA"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(M, yF + ALTO_FILA + .5); ctx.lineTo(W - M, yF + ALTO_FILA + .5); ctx.stroke();
    yF += ALTO_FILA;
  });

  const anchoCaja = 430, xCaja = W - M - anchoCaja;
  let yC = yF + 28;
  totales.forEach(([k, v], i) => {
    if (i > 0) {
      ctx.strokeStyle = "#E1E7EA";
      ctx.beginPath(); ctx.moveTo(xCaja, yC + .5); ctx.lineTo(W - M, yC + .5); ctx.stroke();
    }
    ctx.textAlign = "left"; ctx.fillStyle = "#5B6B75"; ctx.font = `15px ${F}`;
    ctx.fillText(k, xCaja + 12, yC + 23);
    ctx.textAlign = "right"; ctx.fillStyle = "#14222B"; ctx.font = `bold 15px ${F}`;
    ctx.fillText(v, W - M - 12, yC + 23);
    yC += 34;
  });
  yC += 10;
  ctx.fillStyle = "#14222B"; ctx.fillRect(xCaja, yC, anchoCaja, 62);
  ctx.textAlign = "left"; ctx.fillStyle = "#AFC0C8"; ctx.font = `bold 14px ${F}`;
  ctx.fillText(totalLabel.toUpperCase(), xCaja + 16, yC + 38);
  ctx.textAlign = "right"; ctx.fillStyle = "#F2B705"; ctx.font = `bold 30px ${F}`;
  ctx.fillText(total, W - M - 16, yC + 42);

  let yP = yC + 62 + 40;
  ctx.strokeStyle = "#E1E7EA";
  ctx.beginPath(); ctx.moveTo(M, yP - 20.5); ctx.lineTo(W - M, yP - 20.5); ctx.stroke();
  ctx.textAlign = "left"; ctx.fillStyle = "#5B6B75"; ctx.font = `13px ${F}`;
  lineasPie.forEach((l, i) => ctx.fillText(l, M, yP + i * 20));

  return c;
}

async function compartirHoja(d, avisar) {
  try {
    const canvas = await hojaImagen(d);
    const blob = await new Promise((r) => canvas.toBlob(r, "image/png", 0.95));
    if (!blob) throw new Error("sin imagen");
    const archivo = new File([blob], `${d.cot.numero}.png`, { type: "image/png" });
    if (navigator.canShare && navigator.canShare({ files: [archivo] })) {
      await navigator.share({ files: [archivo] });
      return;
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${d.cot.numero}.png`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 30000);
    avisar("Se descargó la cotización. Adjúntala en WhatsApp.");
  } catch (e) {
    if (e && e.name === "AbortError") return;
    console.error(e);
    avisar("No se pudo preparar la imagen. Usa Imprimir o PDF.", "error");
  }
}

function AccionesHoja({ onImprimir, onCompartir, datos }) {
  const [enviando, setEnviando] = useState(false);
  const [vista, setVista] = useState(false);
  const [imagen, setImagen] = useState(null);

  async function compartir() {
    setEnviando(true);
    await onCompartir();
    setEnviando(false);
  }
  async function abrirVista() {
    if (!datos) return;
    setVista(true);
    try { setImagen((await hojaImagen(datos())).toDataURL("image/png")); }
    catch (e) { console.error(e); setVista(false); }
  }
  function cerrarVista() { setVista(false); setImagen(null); }

  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        <button className="btn btn-ghost text-sm" style={{ padding: "10px 8px" }} onClick={onImprimir}>
          <Printer size={17} /> Imprimir
        </button>
        <button className="btn btn-ghost text-sm" style={{ padding: "10px 8px" }} onClick={abrirVista}>
          <Eye size={17} /> Ver
        </button>
        <button className="btn btn-ghost text-sm" style={{ padding: "10px 8px" }} onClick={compartir} disabled={enviando}>
          <Share2 size={17} /> {enviando ? "Preparando…" : "WhatsApp"}
        </button>
      </div>

      {vista && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3"
          style={{ background: "rgba(20,34,43,.8)" }} onClick={cerrarVista}>
          <div className="w-full" style={{ maxWidth: 900, maxHeight: "92vh", overflowY: "auto", background: "#fff", borderRadius: 10 }}
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-3"
              style={{ borderBottom: "1px solid #E1E7EA", position: "sticky", top: 0, background: "#fff" }}>
              <div className="cond font-semibold" style={{ fontSize: 20 }}>Vista de la cotización</div>
              <button className="icon-btn" onClick={cerrarVista} aria-label="Cerrar"><X size={22} /></button>
            </div>
            {imagen
              ? <img src={imagen} alt="Cotización" style={{ width: "100%", display: "block" }} />
              : <p className="p-6 text-center muted">Preparando la vista…</p>}
          </div>
        </div>
      )}
    </>
  );
}

const OCULTO = { position: "absolute", left: 0, top: 0, width: 1, height: 1, opacity: 0, overflow: "hidden" };

function PhotoBox({ value, onChange }) {
  const [ids] = useState(() => ({ galeria: "galeria-" + uid(), camara: "camara-" + uid() }));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handle(e) {
    const input = e.target;
    const f = input.files && input.files[0];
    if (!f) return;
    setBusy(true); setError("");
    try {
      const src = await fileToDataUrl(f);
      try { onChange(await resizeSrc(src, 400, 0.72)); }
      catch (err) { setError("No se pudo leer esa foto. Prueba con otra en JPG o PNG."); }
    } catch (err) {
      setError("No se pudo abrir el archivo. Prueba con otra foto.");
    } finally {
      setBusy(false);
      input.value = "";
    }
  }

  return (
    <div>
      <input id={ids.galeria} type="file" accept="image/*" onChange={handle} style={OCULTO} tabIndex={-1} />
      <input id={ids.camara} type="file" accept="image/*" capture="environment" onChange={handle} style={OCULTO} tabIndex={-1} />

      <label
        htmlFor={ids.galeria}
        style={{
          display: "block",
          width: "100%",
          aspectRatio: "1 / 1",
          border: "2px dashed #9FB0B9",
          borderRadius: 12,
          background: value ? "#fff" : "#F6F8F9",
          cursor: "pointer",
          position: "relative",
          overflow: "hidden",
          transition: "all .15s",
        }}
      >
        {value ? (
          <img
            src={value}
            alt="Foto del producto"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        ) : (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              color: "#5B6B75",
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "#fff",
                border: "2px solid #CAD4DA",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 6px rgba(20,34,43,.08)",
              }}
            >
              <Camera size={30} strokeWidth={1.8} color="#1B5E6B" />
            </div>
            <span style={{ fontSize: 13, fontWeight: 500, textAlign: "center", padding: "0 8px" }}>
              Toca para agregar foto
            </span>
          </div>
        )}

        {busy && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(255,255,255,.9)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              fontWeight: 500,
              color: "#14222B",
            }}
          >
            Procesando…
          </div>
        )}
      </label>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>
        <label htmlFor={ids.galeria} className="btn btn-ghost text-sm" style={{ cursor: "pointer", padding: "9px 8px" }}>
          <ImageIcon size={16} /> Galería
        </label>
        <label htmlFor={ids.camara} className="btn btn-ghost text-sm" style={{ cursor: "pointer", padding: "9px 8px" }}>
          <Camera size={16} /> Cámara
        </label>
      </div>

      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="btn btn-danger text-sm"
          style={{ width: "100%", marginTop: 8, padding: "7px 8px" }}
        >
          Quitar foto
        </button>
      )}

      {error && (
        <p style={{ fontSize: 13, color: "#A3321F", marginTop: 8 }} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function Thumb({ src, size = 64 }) {
  return (
    <div className="flex-shrink-0 overflow-hidden flex items-center justify-center"
      style={{ width: size, height: size, borderRadius: 6, background: "#EEF2F4", border: "1px solid #E1E7EA" }}>
      {src ? <img src={src} alt="" className="w-full h-full object-cover" /> : <Camera size={size / 3} color="#9FB0B9" />}
    </div>
  );
}

function Dato({ label, value, strong, cls = "" }) {
  return (
    <div>
      <div className="lbl" style={{ marginBottom: 2 }}>{label}</div>
      <div className={`num ${strong ? "font-semibold" : ""} ${cls}`} style={{ fontSize: 15 }}>{value}</div>
    </div>
  );
}

function Etiqueta({ titulo, filas, totalLabel, total, resaltarLabel = false }) {
  return (
    <div className="label-block">
      <div className="label-stripe" />
      <div className="p-4">
        {titulo && <div className="cond text-xl font-semibold mb-1">{titulo}</div>}
        <dl className="text-sm">
          {filas.map(([label, value, cls]) => (
            <div key={label} className="flex justify-between gap-3 py-1">
              <dt style={{ color: "#AFC0C8" }}>{label}</dt>
              <dd className={`num font-medium ${cls || ""}`}>{value}</dd>
            </div>
          ))}
        </dl>
        <div className="flex justify-between items-end gap-3 mt-3 pt-3" style={{ borderTop: "1px solid #2E4150" }}>
          <span className={resaltarLabel ? "cond num" : "text-sm"}
            style={resaltarLabel
              ? { fontSize: "clamp(24px,6vw,38px)", lineHeight: 1, color: "#F2B705", fontWeight: 700 }
              : { color: "#AFC0C8" }}>
            {totalLabel}
          </span>
          <span className="cond num"
            style={{ fontSize: resaltarLabel ? "clamp(24px,6vw,38px)" : 38, lineHeight: 1, color: "#F2B705", fontWeight: 700 }}>
            {total}
          </span>
        </div>
      </div>
    </div>
  );
}

const filasInternas = (t) => [
  ["Cantidad total", m3(t.totalCantidad)],
  ["Total CBM a cobrar", `${m3(t.totalCbm)} m³`],
  ["Peso total", kg(t.totalPeso)],
  ["Total precio productos", money(t.totalProducto)],
  ["Total precio CBM", money(t.totalPrecioCbm)],
  ["Subtotal", money(t.subtotal)],
  [`Cargo de la página (${pct(COMISION)})`, money(t.comision)],
];
const filasCliente = (t) => [
  ["Peso total", kg(t.totalPeso)],
  ["Total CBM", `${m3(t.totalCbm)} m³`],
];

function LineaHeader({ l, onRemove }) {
  return (
    <div className="flex gap-3">
      <Thumb src={l.foto} size={64} />
      <div className="flex-1 min-w-0 flex justify-between gap-2">
        <div className="min-w-0">
          <div className="font-semibold truncate">{l.nombre}</div>
          <div className="text-sm muted num">{l.codigo}, CBM {m3(l.cbm)} m³{num(l.peso) > 0 ? `, ${kg(num(l.peso))}` : ""}</div>
        </div>
        <button className="icon-btn flex-shrink-0 self-start" onClick={onRemove} aria-label={`Quitar ${l.nombre}`}><X size={18} /></button>
      </div>
    </div>
  );
}

function ComparaCbm({ k, cant = 1 }) {
  const celda = (label, value, activo) => (
    <div className="p-2" style={{ borderRadius: 6, background: activo ? "#FFF4CC" : "transparent", border: `1px solid ${activo ? "#E2C45C" : "transparent"}` }}>
      <div className="lbl" style={{ marginBottom: 2 }}>{label}</div>
      <div className={`num ${activo ? "font-semibold" : ""}`} style={{ fontSize: 15 }}>{m3(value * cant)} m³</div>
    </div>
  );
  return (
    <div className="grid grid-cols-3 gap-1" style={{ border: "1px solid #E1E7EA", borderRadius: 8, padding: 4 }}>
      {celda("Por volumen", k.vol, k.por === "volumen")}
      {celda(`Por peso (÷${KG_POR_CBM})`, k.porPeso, k.por === "peso")}
      <div className="p-2">
        <div className="lbl" style={{ marginBottom: 2 }}>Te cobran</div>
        <div className="num font-semibold" style={{ fontSize: 15 }}>{m3(k.cobrable * cant)} m³</div>
        <div className="text-xs muted">por {k.por}</div>
      </div>
    </div>
  );
}

function SelectorProducto({ productos, onAgregar }) {
  const [selId, setSelId] = useState("");
  const [cantidad, setCantidad] = useState("1");
  const [ids] = useState(() => ({ prod: "prod-" + uid(), cant: "cant-" + uid() }));
  async function agregar() {
    const p = productos.find((x) => x.id === selId);
    if (!p) return;
    await onAgregar(p, num(cantidad) || 1);
    setSelId(""); setCantidad("1");
  }
  return (
    <div className="flex gap-2 items-end">
      <div className="flex-1 min-w-0">
        <label className="lbl" htmlFor={ids.prod}>Producto</label>
        <select id={ids.prod} className="inp" value={selId} onChange={(e) => setSelId(e.target.value)}>
          <option value="">Elige un producto</option>
          {productos.map((p) => <option key={p.id} value={p.id}>{p.codigo} - {p.nombre}</option>)}
        </select>
      </div>
      <div style={{ width: 76 }}>
        <label className="lbl" htmlFor={ids.cant}>Cantidad</label>
        <input id={ids.cant} className="inp num" inputMode="decimal" value={cantidad} onChange={(e) => setCantidad(e.target.value)} />
      </div>
      <button className="btn btn-primary" style={{ padding: "10px 12px" }} onClick={agregar} disabled={!selId} aria-label="Agregar a la cotización">
        <Plus size={20} />
      </button>
    </div>
  );
}

function ModalShell({ titulo, subtitulo, onClose, children }) {
  useEffect(() => {
    const k = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ background: "rgba(20,34,43,.55)" }} onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={titulo}
        className="w-full sm:max-w-3xl overflow-y-auto" style={{ background: "#fff", borderRadius: "12px 12px 0 0", maxHeight: "92vh" }}
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between p-4 sticky top-0 z-10" style={{ background: "#fff", borderBottom: "1px solid #E1E7EA" }}>
          <div>
            <div className="cond text-2xl font-semibold num">{titulo}</div>
            <div className="text-sm muted">{subtitulo}</div>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Cerrar"><X size={22} /></button>
        </div>
        <div className="p-4 space-y-4">{children}</div>
      </div>
    </div>
  );
}

function EliminarRegistro({ numero, onDelete }) {
  const [confirm, setConfirm] = useState(false);
  return confirm ? (
    <div className="flex items-center gap-2">
      <span className="text-sm flex-1">¿Eliminar {numero}? También se borra del registro interno.</span>
      <button className="btn btn-ghost" onClick={() => setConfirm(false)}>No</button>
      <button className="btn btn-danger-solid" onClick={onDelete}>Eliminar</button>
    </div>
  ) : (
    <button className="btn btn-danger w-full" onClick={() => setConfirm(true)}><Trash2 size={16} /> Eliminar cotización</button>
  );
}

function ListaRegistradas({
  lista, onOpen, totalDe, gananciaDe, titulo = "Registradas", conDescuento = false,
  vacio = "Las cotizaciones que registres quedan guardadas aquí.",
}) {
  const [q, setQ] = useState("");
  const filtradas = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return lista;
    return lista.filter((c) => c.numero.toLowerCase().includes(s) || (c.cliente || "").toLowerCase().includes(s));
  }, [lista, q]);

  return (
    <section>
      <div className="section-toolbar">
        <h2 className="cond text-2xl font-semibold">{titulo} <span className="muted font-medium">({lista.length})</span></h2>
        {lista.length > 0 && (
          <div className="relative w-48">
            <Search size={16} className="absolute left-3 top-1/2 muted" style={{ transform: "translateY(-50%)" }} />
            <input className="inp" style={{ paddingLeft: 32, fontSize: 15 }} placeholder="Número o cliente"
              value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar cotización" />
          </div>
        )}
      </div>
      {lista.length === 0 ? (
        <div className="paper p-6 text-center muted">{vacio}</div>
      ) : filtradas.length === 0 ? (
        <div className="paper p-6 text-center muted">Ninguna cotización coincide con “{q}”.</div>
      ) : (
        <div className="paper overflow-hidden quote-list">
          {filtradas.map((c, i) => (
            <button key={c.id} onClick={() => onOpen(c)}
              className="w-full text-left p-4 flex items-center gap-3 hover:bg-gray-50"
              style={i > 0 ? { borderTop: "1px solid #E1E7EA" } : undefined}>
              <FileText size={22} color="#1B5E6B" className="flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between gap-2">
                  <span className="flex items-center gap-2 min-w-0">
                    <span className="font-semibold num">{c.numero}</span>
                    {conDescuento && num(c.descuento) > 0 && (
                      <span className="chip num">{m3(num(c.descuento))}% desc.</span>
                    )}
                  </span>
                  <div className="text-right flex-shrink-0"
                    style={{ width: "clamp(140px,27vw,180px)", fontVariantNumeric: "tabular-nums" }}>
                    <div className="cond num font-semibold" style={{ fontSize: 20, lineHeight: 1.1 }}>{money(totalDe(c))}</div>
                    {gananciaDe && gananciaDe(c) != null && (
                      <div className="num font-semibold"
                        style={{ fontSize: 13, color: gananciaDe(c) >= 0 ? "#16845B" : "#B33A2E", marginTop: 4 }}>
                        Ganancia: {money(gananciaDe(c))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-between gap-2 text-sm muted">
                  <span className="truncate">
                    {c.cliente || "Sin cliente"}, {c.lineas.length} {c.lineas.length === 1 ? "producto" : "productos"}
                    {c.deCliente || c.origen ? ", de cliente" : ""}
                  </span>
                  <span className="flex-shrink-0">{fecha(c.fecha)}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

function SinProductos({ irAProductos }) {
  return (
    <div className="text-center py-6">
      <p className="muted mb-3">Para cotizar necesitas productos en el catálogo.</p>
      <button className="btn btn-primary" onClick={irAProductos}>Agregar productos</button>
    </div>
  );
}

function EncabezadoPagina({ icon: Icon, titulo, descripcion }) {
  return (
    <div className="page-head">
      <div className="page-head-icon"><Icon size={24} /></div>
      <div className="min-w-0">
        <h2>{titulo}</h2>
        <p>{descripcion}</p>
      </div>
    </div>
  );
}

const VACIO = { codigo: "", nombre: "", cbm: "", peso: "", precioCbm: "", precioProducto: "", precioVenta: "", foto: "" };
const EMPRESA_POR_DEFECTO = {
  nombre: "Taller Gregoriana",
  contacto: "Taller Mecánico y Lubricentro",
  logo: LOGO_POR_DEFECTO,
};

function EmpresaCard({ empresa, guardarEmpresa, avisar }) {
  const [form, setForm] = useState(empresa);
  const [abierto, setAbierto] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  useEffect(() => setForm(empresa), [empresa]);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function elegirLogo(e) {
    const input = e.target;
    const f = input.files && input.files[0];
    if (!f) return;
    setSubiendo(true);
    try {
      const src = await fileToDataUrl(f);
      const chico = await resizeSrc(src, 520, 0.9);
      setForm((v) => ({ ...v, logo: chico }));
    } catch (err) { avisar("No se pudo leer esa imagen.", "error"); }
    finally { setSubiendo(false); input.value = ""; }
  }

  async function guardar() {
    const ok = await guardarEmpresa({ nombre: form.nombre.trim(), contacto: form.contacto.trim(), logo: form.logo || "" });
    if (ok) { avisar("Datos de tu empresa guardados"); setAbierto(false); }
  }

  return (
    <section className="paper p-4">
      <button className="flex items-center justify-between w-full text-left gap-3" onClick={() => setAbierto((v) => !v)}>
        <div className="flex items-center gap-3 min-w-0">
          {empresa.logo && <img src={empresa.logo} alt="" className="logo-empresa" />}
          <div className="min-w-0">
            <h2 className="cond nombre-empresa truncate">{empresa.nombre || "Sin nombre"}</h2>
          </div>
        </div>
        <span className="btn btn-ghost text-sm" style={{ padding: "6px 12px" }}>{abierto ? "Cerrar" : "Editar"}</span>
      </button>

      {abierto && (
        <div className="mt-3 space-y-3">
          <div>
            <label className="lbl">Logo</label>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center"
                style={{ width: 110, height: 64, border: "1px solid #CAD4DA", borderRadius: 6, background: "#F6F8F9" }}>
                {form.logo
                  ? <img src={form.logo} alt="" style={{ maxHeight: 56, maxWidth: 100, objectFit: "contain" }} />
                  : <ImageIcon size={22} color="#9FB0B9" />}
              </div>
              <div className="flex-1 space-y-2">
                <input id="e-logo" type="file" accept="image/*" onChange={elegirLogo} style={OCULTO} tabIndex={-1} />
                <label htmlFor="e-logo" className="btn btn-ghost text-sm w-full" style={{ padding: "7px 10px", cursor: "pointer" }}>
                  {subiendo ? "Procesando…" : form.logo ? "Cambiar logo" : "Elegir logo"}
                </label>
                {form.logo && (
                  <button className="btn btn-danger text-sm w-full" style={{ padding: "6px 10px" }}
                    onClick={() => setForm((v) => ({ ...v, logo: "" }))}>Quitar logo</button>
                )}
              </div>
            </div>
          </div>
          <div>
            <label className="lbl" htmlFor="e-nombre">Nombre de la empresa</label>
            <input id="e-nombre" className="inp" value={form.nombre} onChange={set("nombre")} />
          </div>
          <div>
            <label className="lbl" htmlFor="e-contacto">Contacto</label>
            <textarea id="e-contacto" className="inp" rows={2} placeholder="Teléfono, correo, dirección"
              value={form.contacto} onChange={set("contacto")} />
          </div>
          <button className="btn btn-primary" onClick={guardar}>Guardar datos</button>
        </div>
      )}
    </section>
  );
}

function ProductosView({ productos, guardarProductos, avisar, empresa, guardarEmpresa }) {
  const [form, setForm] = useState(VACIO);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [confirmId, setConfirmId] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit() {
    const codigo = form.codigo.trim(), nombre = form.nombre.trim();
    if (!codigo || !nombre) { setError("Escribe el código y el nombre del producto."); return; }
    if (productos.some((p) => p.codigo.toLowerCase() === codigo.toLowerCase() && p.id !== editId)) {
      setError(`Ya existe un producto con el código ${codigo}.`); return;
    }
    const item = {
      id: editId || uid(), codigo, nombre,
      cbm: num(form.cbm), peso: num(form.peso), precioCbm: num(form.precioCbm),
      precioProducto: num(form.precioProducto), precioVenta: num(form.precioVenta), foto: form.foto,
    };
    const lista = editId ? productos.map((p) => (p.id === editId ? item : p)) : [item, ...productos];
    setGuardando(true);
    const ok = await guardarProductos(lista);
    setGuardando(false);
    if (ok) {
      avisar(editId ? "Cambios guardados" : "Producto guardado");
      setForm(VACIO); setEditId(null); setError("");
    }
  }

  function editar(p) {
    setForm({
      codigo: p.codigo, nombre: p.nombre, cbm: String(p.cbm), peso: p.peso ? String(p.peso) : "",
      precioCbm: String(p.precioCbm), precioProducto: String(p.precioProducto),
      precioVenta: p.precioVenta ? String(p.precioVenta) : "", foto: p.foto || "",
    });
    setEditId(p.id); setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function eliminar(id) {
    const ok = await guardarProductos(productos.filter((p) => p.id !== id));
    if (ok) avisar("Producto eliminado");
    setConfirmId(null);
    if (editId === id) { setEditId(null); setForm(VACIO); }
  }

  const filtrados = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return productos;
    return productos.filter((p) => p.codigo.toLowerCase().includes(s) || p.nombre.toLowerCase().includes(s));
  }, [productos, q]);

  return (
    <div className="space-y-6">
      <EncabezadoPagina icon={Package} titulo="Productos"
        descripcion="Administra el catálogo, los costos, el peso y el CBM facturable de cada producto." />
      <EmpresaCard empresa={empresa} guardarEmpresa={guardarEmpresa} avisar={avisar} />

      <section className="form-card">
        <h2 className="cond text-2xl font-semibold mb-3">{editId ? "Editar producto" : "Nuevo producto"}</h2>
        <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div style={{ width: 160, flexShrink: 0 }}>
            <PhotoBox value={form.foto} onChange={(foto) => setForm((f) => ({ ...f, foto }))} />
          </div>
          <div className="form-producto" style={{ flex: 1, minWidth: 280 }}>
            <div className="form-grid-cod">
              <div>
                <label className="lbl" htmlFor="p-codigo">Código</label>
                <input id="p-codigo" className="inp" value={form.codigo} onChange={set("codigo")} />
              </div>
              <div>
                <label className="lbl" htmlFor="p-nombre">Nombre</label>
                <input id="p-nombre" className="inp" value={form.nombre} onChange={set("nombre")} />
              </div>
            </div>

            <div className="form-grid-3">
              <div>
                <label className="lbl" htmlFor="p-cbm">CBM (m³)</label>
                <input id="p-cbm" className="inp num" inputMode="decimal" placeholder="0.000" value={form.cbm} onChange={set("cbm")} />
              </div>
              <div>
                <label className="lbl" htmlFor="p-peso">Peso (kg)</label>
                <input id="p-peso" className="inp num" inputMode="decimal" placeholder="0" value={form.peso} onChange={set("peso")} />
              </div>
              <div>
                <label className="lbl" htmlFor="p-pcbm">Precio CBM</label>
                <input id="p-pcbm" className="inp num" inputMode="decimal" placeholder="0.00" value={form.precioCbm} onChange={set("precioCbm")} />
              </div>
            </div>

            {(num(form.cbm) > 0 || num(form.peso) > 0) && (
              <div>
                <ComparaCbm k={cbmCobro(form.cbm, form.peso)} />
                <p className="text-sm muted mt-1 num">
                  Precio CBM por unidad: {money(cbmCobro(form.cbm, form.peso).cobrable * num(form.precioCbm))}
                </p>
              </div>
            )}

            <div className="form-grid-2">
              <div>
                <label className="lbl" htmlFor="p-precio">Precio producto</label>
                <input id="p-precio" className="inp num" inputMode="decimal" placeholder="0.00" value={form.precioProducto} onChange={set("precioProducto")} />
              </div>
              <div>
                <label className="lbl" htmlFor="p-venta">Precio de venta</label>
                <input id="p-venta" className="inp inp-venta num" inputMode="decimal" placeholder="0.00" value={form.precioVenta} onChange={set("precioVenta")} />
              </div>
            </div>

            <p className="text-sm muted" style={{ lineHeight: 1.3 }}>
              El precio de venta es opcional. Se carga solo en las cotizaciones clientes.
            </p>

            {error && <p className="text-sm font-medium" style={{ color: "#A3321F" }} role="alert">{error}</p>}

            <div className="form-acciones">
              <button className="btn btn-primary" onClick={submit} disabled={guardando}>
                {guardando ? "Guardando…" : editId ? "Guardar cambios" : "Guardar producto"}
              </button>
              {editId && (
                <button className="btn btn-ghost" onClick={() => { setEditId(null); setForm(VACIO); setError(""); }}>Cancelar</button>
              )}
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="section-toolbar">
          <h2 className="cond text-2xl font-semibold">Catálogo <span className="muted font-medium">({productos.length})</span></h2>
          {productos.length > 0 && (
            <div className="relative w-48">
              <Search size={16} className="absolute left-3 top-1/2 muted" style={{ transform: "translateY(-50%)" }} />
              <input className="inp" style={{ paddingLeft: 32, fontSize: 15 }} placeholder="Buscar"
                value={q} onChange={(e) => setQ(e.target.value)} aria-label="Buscar producto" />
            </div>
          )}
        </div>

        {productos.length === 0 ? (
          <div className="paper p-6 text-center muted">Guarda tu primer producto con el formulario de arriba.</div>
        ) : filtrados.length === 0 ? (
          <div className="paper p-6 text-center muted">Ningún producto coincide con “{q}”.</div>
        ) : (
          <div className="space-y-3">
            {filtrados.map((p) => {
              const k = cbmCobro(p.cbm, p.peso);
              return (
                <article key={p.id} className="paper p-3 flex gap-3">
                  <Thumb src={p.foto} size={76} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-sm muted num">{p.codigo}</div>
                        <div className="font-semibold truncate">{p.nombre}</div>
                      </div>
                      <div className="flex flex-shrink-0">
                        <button className="icon-btn" onClick={() => editar(p)} aria-label={`Editar ${p.nombre}`}><Pencil size={17} /></button>
                        <button className="icon-btn" onClick={() => setConfirmId(p.id)} aria-label={`Eliminar ${p.nombre}`}><Trash2 size={17} /></button>
                      </div>
                    </div>
                    <div className="product-info-line mt-2">
                      <Dato label="CBM por volumen" value={`${m3(k.vol)} m³`} />
                      <Dato label="CBM por peso" value={`${m3(k.porPeso)} m³`} />
                      <Dato label="Peso" value={p.peso ? kg(p.peso) : "Sin peso"} cls={p.peso ? "" : "muted"} />
                      <Dato label="CBM a cobrar" value={`${m3(k.cobrable)} m³, por ${k.por}`} strong />
                      <Dato label="Precio CBM" value={money(p.precioCbm)} />
                      <Dato label="Precio producto" value={money(p.precioProducto)} strong />
                      <Dato label="Precio de venta" value={p.precioVenta ? money(p.precioVenta) : "Sin precio"}
                        strong={!!p.precioVenta} cls={p.precioVenta ? "" : "muted"} />
                    </div>
                    {confirmId === p.id && (
                      <div className="flex items-center gap-2 mt-3">
                        <span className="text-sm flex-1">¿Eliminar este producto?</span>
                        <button className="btn btn-ghost text-sm" style={{ padding: "6px 12px" }} onClick={() => setConfirmId(null)}>No</button>
                        <button className="btn btn-danger-solid text-sm" style={{ padding: "6px 12px" }} onClick={() => eliminar(p.id)}>Eliminar</button>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function DetalleInterna({ cot, onClose, empresa, avisar }) {
  const t = useMemo(() => calcTotales(cot.lineas), [cot]);
  const hayVenta = !!(cot.deCliente || cot.origen) && t.totalVenta > 0;
  // En la vista interna el descuento es únicamente informativo.
  const ventaCliente = t.totalVenta;
  const ganancia = ventaCliente - t.general;
  const margen = ventaCliente > 0 ? ganancia / ventaCliente : 0;

  const datos = () => {
    const columnas = [
      { t: "Foto" }, { t: "Producto" }, { t: "Cant.", r: true }, { t: "CBM unit.", r: true },
      { t: "CBM total", r: true }, { t: "Peso unit.", r: true }, { t: "Peso total", r: true },
      { t: "Precio producto", r: true }, { t: "Precio CBM", r: true },
      ...(hayVenta ? [{ t: "Venta", r: true, fuerte: true }] : []),
    ];
    const filas = cot.lineas.map((l) => {
      const c = calcLinea(l);
      return {
        foto: l.foto, nombre: l.nombre, sub: l.codigo,
        valores: [
          String(l.cantidad), `${m3(num(l.cbm))} m³`, `${m3(c.totalCbm)} m³`,
          num(l.peso) > 0 ? kg(num(l.peso)) : "Sin peso", kg(c.totalPeso),
          money(c.totalProducto), money(c.totalPrecioCbm),
          ...(hayVenta ? [money(c.totalVenta)] : []),
        ],
      };
    });
    filas.push({
      foto: "", nombre: "TOTALES", sub: "",
      valores: [
        String(t.totalCantidad), "—", `${m3(t.totalCbm)} m³`, "—", kg(t.totalPeso),
        money(t.totalProducto), money(t.totalPrecioCbm),
        ...(hayVenta ? [money(t.totalVenta)] : []),
      ],
    });

    const totales = filasInternas(t).slice();
    if (hayVenta) totales.push([`Ganancia (${pct(margen)})`, money(ganancia)]);
    if (num(cot.descuento) > 0) totales.push(["Descuento al cliente", `${m3(num(cot.descuento))}%`]);

    return { empresa, cot, columnas, filas, totales, total: money(t.general), totalLabel: "Total costo", interno: true };
  };

  const imprimir = () => imprimirHoja(hojaHTML(datos()));
  const compartir = () => compartirHoja(datos(), avisar);

  const origen = (cot.deCliente || cot.origen ? ", cotización de cliente" : "") +
    (num(cot.descuento) > 0 ? `, descuento ${m3(num(cot.descuento))}%` : "");
  const th = "text-left font-medium muted px-2 py-2 whitespace-nowrap";
  const td = "px-2 py-2 num whitespace-nowrap";

  return (
    <ModalShell titulo={cot.numero} subtitulo={`${cot.cliente || "Sin cliente"}, ${fecha(cot.fecha)}${origen}`} onClose={onClose}>
      <div className="overflow-x-auto" style={{ border: "1px solid #E1E7EA", borderRadius: 8 }}>
        <table className="w-full text-sm" style={{ minWidth: 1100 }}>
          <thead style={{ background: "#F3F6F7" }}>
            <tr>
              <th className={th}>Foto</th><th className={th}>Nombre</th><th className={th}>Cant.</th>
              <th className={th}>CBM x unidad</th><th className={th}>Total CBM</th>
              <th className={th}>Peso</th><th className={th}>Total peso</th>
              <th className={th}>Precio CBM</th><th className={th}>Precio prod.</th>
              <th className={th}>Total precio producto</th><th className={th}>Total precio CBM</th>
              {hayVenta && <th className={th}>Total venta</th>}
            </tr>
          </thead>
          <tbody>
            {cot.lineas.map((l) => {
              const c = calcLinea(l);
              return (
                <tr key={l.id} className="row-line">
                  <td className="px-2 py-2"><Thumb src={l.foto} size={44} /></td>
                  <td className="px-2 py-2"><div className="font-medium">{l.nombre}</div><div className="muted num">{l.codigo}</div></td>
                  <td className={td}>{l.cantidad}</td>
                  <td className={td}>{m3(num(l.cbm))} m³</td>
                  <td className={td}>{m3(c.totalCbm)} m³</td>
                  <td className={td}>{num(l.peso) > 0 ? kg(num(l.peso)) : "Sin peso"}</td>
                  <td className={td}>{kg(c.totalPeso)}</td>
                  <td className={td}>{money(l.precioCbm)}</td>
                  <td className={td}>{money(l.precioProducto)}</td>
                  <td className={`${td} font-semibold`}>{money(c.totalProducto)}</td>
                  <td className={`${td} font-semibold`}>{money(c.totalPrecioCbm)}</td>
                  {hayVenta && <td className={`${td} font-semibold`}>{money(c.totalVenta)}</td>}
                </tr>
              );
            })}
          </tbody>
          <tfoot style={{ background: "#E9EFF1", borderTop: "2px solid #142731" }}>
            <tr>
              <td colSpan={2} className="px-2 py-3 font-semibold">TOTALES</td>
              <td className={`${td} font-semibold`}>{t.totalCantidad}</td>
              <td className={td}>—</td>
              <td className={`${td} font-semibold`}>{m3(t.totalCbm)} m³</td>
              <td className={td}>—</td>
              <td className={`${td} font-semibold`}>{kg(t.totalPeso)}</td>
              <td className={td}>—</td>
              <td className={td}>—</td>
              <td className={`${td} font-semibold`}>{money(t.totalProducto)}</td>
              <td className={`${td} font-semibold`}>{money(t.totalPrecioCbm)}</td>
              {hayVenta && <td className={`${td} font-semibold`}>{money(t.totalVenta)}</td>}
            </tr>
          </tfoot>
        </table>
      </div>

      <Etiqueta filas={filasInternas(t)} totalLabel="Total general" total={money(t.general)} />

      {hayVenta && (
        <Etiqueta
          filas={[
            ["Cotización cliente — Total venta", money(ventaCliente)],
            ["Cotización interna — Total general", money(t.general)],
          ]}
          totalLabel={`Ganancia (${pct(margen)})`}
          total={money(ganancia)}
          resaltarLabel
        />
      )}

      <AccionesHoja onImprimir={imprimir} onCompartir={compartir} datos={datos} />
      <p className="text-sm muted text-center">
        Este registro se borra al eliminar la cotización {cot.numero} en Cotizaciones clientes.
      </p>
    </ModalShell>
  );
}

function CotizacionInternaView({ cotiz, guardarCotizaciones, clientes, avisar, empresa }) {
  const [detalle, setDetalle] = useState(null);
  const [confirm, setConfirm] = useState(false);

  const sueltas = useMemo(
    () => cotiz.lista.filter((c) => !clientes.lista.some((x) => x.numero === c.numero)),
    [cotiz.lista, clientes.lista]
  );

  async function limpiar() {
    const quedan = cotiz.lista.filter((c) => clientes.lista.some((x) => x.numero === c.numero));
    const ok = await guardarCotizaciones({ ...cotiz, lista: quedan });
    if (ok) avisar(sueltas.length === 1 ? "Registro antiguo eliminado" : `${sueltas.length} registros antiguos eliminados`);
    setConfirm(false);
  }

  return (
    <div className="space-y-6">
      <div className="dollar-rain" aria-hidden>
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i} style={{
            left: `${4 + i * 9}%`,
            animationDelay: `-${i * 0.63}s`,
            animationDuration: `${4.6 + (i % 4) * 0.55}s`,
          }}>$</span>
        ))}
      </div>

      <EncabezadoPagina icon={FileTextIcon} titulo="Cotizaciones internas"
        descripcion="Consulta costos, cargos y ganancias. Los descuentos se muestran solo como referencia visual." />

      <ListaRegistradas
        lista={cotiz.lista}
        onOpen={setDetalle}
        totalDe={(c) => calcTotales(c.lineas).general}
        gananciaDe={(c) => {
          if (!(c.deCliente || c.origen)) return null;
          const t = calcTotales(c.lineas);
          return t.totalVenta - t.general;
        }}
        titulo="Registro de cotizaciones"
        conDescuento
        vacio="Aquí se guardan las cotizaciones que registras para tus clientes, con sus costos y tu ganancia."
      />

      {sueltas.length > 0 && (
        <section className="paper p-4">
          <h3 className="cond text-xl font-semibold">Registros antiguos</h3>
          <p className="text-sm muted mt-1">
            {sueltas.length === 1 ? "Hay 1 registro" : `Hay ${sueltas.length} registros`} sin cotización de cliente:
            {" "}{sueltas.map((c) => c.numero).join(", ")}. Puedes borrarlos para dejar el registro limpio.
          </p>
          {confirm ? (
            <div className="flex items-center gap-2 mt-3">
              <span className="text-sm flex-1">¿Borrarlos? Las cotizaciones de clientes no se tocan.</span>
              <button className="btn btn-ghost" onClick={() => setConfirm(false)}>No</button>
              <button className="btn btn-danger-solid" onClick={limpiar}>Borrar</button>
            </div>
          ) : (
            <button className="btn btn-danger w-full mt-3" onClick={() => setConfirm(true)}>
              <Trash2 size={16} /> Limpiar registros antiguos
            </button>
          )}
        </section>
      )}

      {detalle && <DetalleInterna cot={detalle} onClose={() => setDetalle(null)} empresa={empresa} avisar={avisar} />}
    </div>
  );
}

function LineaClienteCard({ l, onChange, onRemove }) {
  const c = calcCliente(l);
  const set = (k) => (e) => onChange({ ...l, [k]: e.target.value });
  const tienePrecio = num(l.precioVenta) > 0;
  return (
    <div className="py-4 row-line">
      <LineaHeader l={l} onRemove={onRemove} />
      <div className="grid grid-cols-3 gap-2 mt-3">
        <div>
          <label className="lbl">Cantidad</label>
          <input className="inp num" inputMode="decimal" value={l.cantidad} onChange={set("cantidad")} />
        </div>
        <div>
          <label className="lbl">Precio CBM</label>
          <input className="inp num" inputMode="decimal" placeholder="0.00" value={l.precioCbm} onChange={set("precioCbm")} />
        </div>
        <div>
          <label className="lbl">Precio de venta</label>
          <input className="inp inp-venta num" inputMode="decimal" placeholder="0.00" value={l.precioVenta} onChange={set("precioVenta")} />
        </div>
      </div>
      {num(l.peso) > 0 && <div className="mt-3"><ComparaCbm k={c.k} cant={num(l.cantidad)} /></div>}
      <div className="grid grid-cols-2 gap-2 mt-3 p-3" style={{ background: "#F3F6F7", borderRadius: 6 }}>
        <Dato label="Total CBM a cobrar" value={m3(c.totalCbm)} />
        <Dato label="Total venta" value={tienePrecio ? money(c.totalVenta) : "Sin precio"} strong={tienePrecio}
          cls={tienePrecio ? "" : "muted"} />
      </div>
    </div>
  );
}

function DetalleCliente({ cot, onClose, onDelete, empresa, avisar }) {
  const t = useMemo(() => calcTotalesCliente(cot.lineas), [cot]);
  const porcentaje = Math.min(100, Math.max(0, num(cot.descuento)));
  const totalFinal = totalConDescuento(cot, t.totalVenta);
  const montoDescuento = t.totalVenta - totalFinal;

  const datos = () => {
    const columnas = [
      { t: "Foto" }, { t: "Producto" }, { t: "Cant.", r: true }, { t: "CBM unit.", r: true },
      { t: "CBM total", r: true }, { t: "Peso unit.", r: true }, { t: "Peso total", r: true },
      { t: "Precio unitario", r: true }, { t: "Total", r: true, fuerte: true },
    ];
    const filas = cot.lineas.map((l) => {
      const c = calcCliente(l);
      return {
        foto: l.foto, nombre: l.nombre, sub: l.codigo,
        valores: [
          String(l.cantidad), `${m3(num(l.cbm))} m³`, `${m3(c.totalCbm)} m³`,
          num(l.peso) > 0 ? kg(num(l.peso)) : "Sin peso", kg(c.totalPeso),
          money(l.precioVenta), money(c.totalVenta),
        ],
      };
    });
    filas.push({
      foto: "", nombre: "TOTALES", sub: "",
      valores: [String(t.totalCantidad), "—", `${m3(t.totalCbm)} m³`, "—", kg(t.totalPeso), "—", money(t.totalVenta)],
    });

    const totales = [
      ["Peso total", kg(t.totalPeso)],
      ["Total CBM", `${m3(t.totalCbm)} m³`],
      ["Subtotal", money(t.totalVenta)],
    ];
    if (porcentaje > 0) totales.push([`Descuento (${m3(porcentaje)}%)`, `− ${money(montoDescuento)}`]);

    return { empresa, cot, columnas, filas, totales, total: money(totalFinal), totalLabel: "Total con descuento" };
  };

  const imprimir = () => imprimirHoja(hojaHTML(datos()));
  const compartir = () => compartirHoja(datos(), avisar);

  const th = "text-left font-medium muted px-2 py-2 whitespace-nowrap";
  const td = "px-2 py-2 num whitespace-nowrap";

  return (
    <ModalShell titulo={cot.numero} subtitulo={`${cot.cliente || "Sin cliente"}, ${fecha(cot.fecha)}`} onClose={onClose}>
      <div className="overflow-x-auto" style={{ border: "1px solid #E1E7EA", borderRadius: 8 }}>
        <table className="w-full text-sm" style={{ minWidth: 940 }}>
          <thead style={{ background: "#F3F6F7" }}>
            <tr>
              <th className={th}>Foto</th><th className={th}>Nombre</th><th className={th}>Cant.</th>
              <th className={th}>CBM x unidad</th><th className={th}>Total CBM</th>
              <th className={th}>Peso</th><th className={th}>Total peso</th>
              <th className={th}>Precio de venta</th><th className={th}>Total</th>
            </tr>
          </thead>
          <tbody>
            {cot.lineas.map((l) => {
              const c = calcCliente(l);
              return (
                <tr key={l.id} className="row-line">
                  <td className="px-2 py-2"><Thumb src={l.foto} size={44} /></td>
                  <td className="px-2 py-2"><div className="font-medium">{l.nombre}</div><div className="muted num">{l.codigo}</div></td>
                  <td className={td}>{l.cantidad}</td>
                  <td className={td}>{m3(num(l.cbm))} m³</td>
                  <td className={td}>{m3(c.totalCbm)} m³</td>
                  <td className={td}>{num(l.peso) > 0 ? kg(num(l.peso)) : "Sin peso"}</td>
                  <td className={td}>{kg(c.totalPeso)}</td>
                  <td className={td}>{money(l.precioVenta)}</td>
                  <td className={`${td} font-semibold`}>{money(c.totalVenta)}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot style={{ background: "#E9EFF1", borderTop: "2px solid #142731" }}>
            <tr>
              <td colSpan={2} className="px-2 py-3 font-semibold">TOTALES</td>
              <td className={`${td} font-semibold`}>{t.totalCantidad}</td>
              <td className={td}>—</td>
              <td className={`${td} font-semibold`}>{m3(t.totalCbm)} m³</td>
              <td className={td}>—</td>
              <td className={`${td} font-semibold`}>{kg(t.totalPeso)}</td>
              <td className={td}>—</td>
              <td className={`${td} font-semibold`}>{money(t.totalVenta)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <Etiqueta
        filas={[
          ...filasCliente(t),
          ["Subtotal", money(t.totalVenta)],
          ...(porcentaje > 0 ? [[`Descuento (${m3(porcentaje)}%)`, `− ${money(montoDescuento)}`]] : []),
        ]}
        totalLabel={porcentaje > 0 ? "Total con descuento" : "Total venta"}
        total={money(totalFinal)}
      />

      <AccionesHoja onImprimir={imprimir} onCompartir={compartir} datos={datos} />
      <EliminarRegistro numero={cot.numero} onDelete={() => onDelete(cot.id)} />
    </ModalShell>
  );
}

function CotizacionClienteView({ productos, cotiz, guardarCotizaciones, internas, guardarInternas, avisar, irAProductos, empresa }) {
  const [cliente, setCliente] = useState("");
  const [lineas, setLineas] = useState([]);
  const [detalle, setDetalle] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [descuento, setDescuento] = useState("0");

  const t = useMemo(() => calcTotalesCliente(lineas), [lineas]);
  const porcentaje = Math.min(100, Math.max(0, num(descuento)));
  const montoDescuento = t.totalVenta * porcentaje / 100;
  const totalFinal = t.totalVenta - montoDescuento;

  async function agregar(p, cant) {
    setError("");
    const foto = await miniatura(p);
    setLineas((ls) => [...ls, {
      id: uid(), productId: p.id, codigo: p.codigo, nombre: p.nombre, foto, cbm: p.cbm, peso: p.peso || 0,
      precioCbm: p.precioCbm, precioProducto: p.precioProducto,
      cantidad: String(cant), precioVenta: p.precioVenta ? String(p.precioVenta) : "",
    }]);
  }

  async function registrar() {
    if (lineas.length === 0) return;
    const faltan = lineas.filter((l) => num(l.precioVenta) <= 0);
    if (faltan.length) { setError(`Escribe el precio de venta de: ${faltan.map((l) => l.nombre).join(", ")}.`); return; }

    const n = (cotiz.contador || 0) + 1;
    const numero = siguienteNumero("CLI", n);
    const lineasFinal = lineas.map((l) => ({
      ...l, cantidad: num(l.cantidad), precioCbm: num(l.precioCbm), precioVenta: num(l.precioVenta),
    }));
    const ahora = new Date().toISOString();

    const registro = {
      id: uid(), numero, fecha: ahora, cliente: cliente.trim(),
      descuento: porcentaje, descuentoMonto: montoDescuento, totalFinal,
      lineas: lineasFinal,
      totales: { ...calcTotalesCliente(lineasFinal), descuento: porcentaje, descuentoMonto: montoDescuento, totalFinal },
    };

    setGuardando(true);
    const ok = await guardarCotizaciones({ contador: n, lista: [registro, ...cotiz.lista] });
    let copiada = false;
    if (ok) {
      const copia = {
        id: uid(), numero, fecha: ahora, cliente: cliente.trim(), deCliente: true,
        descuento: porcentaje, descuentoMonto: montoDescuento, totalFinal,
        lineas: lineasFinal.map((l) => ({ ...l, id: uid() })),
        totales: calcTotales(lineasFinal),
      };
      copiada = await guardarInternas({ ...internas, lista: [copia, ...internas.lista] });
    }
    setGuardando(false);
    if (ok) {
      avisar(copiada ? `${numero} registrada, también en las internas` : `Cotización ${numero} registrada`);
      setLineas([]); setCliente(""); setDescuento("0"); setError("");
    }
  }

  async function eliminar(id) {
    const cot = cotiz.lista.find((c) => c.id === id);
    const ok = await guardarCotizaciones({ ...cotiz, lista: cotiz.lista.filter((c) => c.id !== id) });
    if (ok && cot) {
      const quedan = internas.lista.filter((c) => c.numero !== cot.numero);
      if (quedan.length !== internas.lista.length) await guardarInternas({ ...internas, lista: quedan });
      avisar(`${cot.numero} eliminada de clientes y del registro interno`);
    }
    setDetalle(null);
  }

  return (
    <div className="space-y-6">
      <EncabezadoPagina icon={Users} titulo="Cotizaciones clientes"
        descripcion="Prepara cotizaciones, aplica descuentos y comparte documentos profesionales con tus clientes." />
      <section className="paper p-4">
        <h2 className="cond text-2xl font-semibold mb-3">Nueva cotización para cliente</h2>
        {productos.length === 0 ? <SinProductos irAProductos={irAProductos} /> : (
          <>
            <div className="mb-3">
              <label className="lbl" htmlFor="cc-cliente">Cliente</label>
              <input id="cc-cliente" className="inp" placeholder="Nombre del cliente"
                value={cliente} onChange={(e) => setCliente(e.target.value)} />
            </div>

            {lineas.length === 0 && <SelectorProducto productos={productos} onAgregar={agregar} />}

            <div className="mt-2">
              {lineas.length === 0 ? (
                <p className="muted text-sm py-4">
                  Elige un producto y su cantidad, luego toca + para sumarlo. Después escribe su precio de venta.
                </p>
              ) : lineas.map((l) => (
                <LineaClienteCard key={l.id} l={l}
                  onChange={(nl) => { setError(""); setLineas((ls) => ls.map((x) => (x.id === l.id ? nl : x))); }}
                  onRemove={() => setLineas((ls) => ls.filter((x) => x.id !== l.id))} />
              ))}
            </div>

            {lineas.length > 0 && (
              <div className="space-y-3 mt-4">
                <div className="paper p-3" style={{ border: "1px solid #E2C45C", background: "#FFF9E8" }}>
                  <label className="lbl" htmlFor="cc-descuento">Descuento (%)</label>
                  <input id="cc-descuento" className="inp num" inputMode="decimal" min="0" max="100" placeholder="0"
                    value={descuento} onChange={(e) => setDescuento(e.target.value)} />
                </div>

                <div className="p-3" style={{ border: "1px dashed #9FB0B9", borderRadius: 8, background: "#F6F8F9" }}>
                  <div className="cond font-semibold mb-2" style={{ fontSize: 18 }}>Agregar otro producto</div>
                  <SelectorProducto productos={productos} onAgregar={agregar} />
                </div>

                <Etiqueta
                  titulo={`${lineas.length} ${lineas.length === 1 ? "producto" : "productos"}`}
                  filas={[
                    ...filasCliente(t),
                    ["Subtotal", money(t.totalVenta)],
                    ...(porcentaje > 0 ? [[`Descuento (${m3(porcentaje)}%)`, `− ${money(montoDescuento)}`]] : []),
                  ]}
                  totalLabel={porcentaje > 0 ? "Total con descuento" : "Total venta"}
                  total={money(totalFinal)}
                />

                {error && <p className="text-sm font-medium" style={{ color: "#A3321F" }} role="alert">{error}</p>}

                <button className="btn btn-primary w-full" style={{ padding: "13px 16px", fontSize: 16 }}
                  onClick={registrar} disabled={guardando}>
                  {guardando ? "Registrando…" : "Registrar cotización"}
                </button>
              </div>
            )}
          </>
        )}
      </section>

      <ListaRegistradas
        lista={cotiz.lista}
        onOpen={setDetalle}
        totalDe={(c) => c.totalFinal ?? c.totales.totalFinal ?? c.totales.totalVenta}
      />

      {detalle && (
        <DetalleCliente cot={detalle} onClose={() => setDetalle(null)} onDelete={eliminar}
          empresa={empresa} avisar={avisar} />
      )}
    </div>
  );
}

const PUERTO_IMG = "https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=1600&q=80&auto=format&fit=crop";

function InicioView({ productos, internas, clientes, empresa, irA }) {
  const totalProductos = productos.length;
  const totalInternas = internas.lista.length;
  const totalClientes = clientes.lista.length;

  const gananciaTotal = useMemo(() => {
    return clientes.lista.reduce((sum, c) => {
      const t = calcTotalesCliente(c.lineas);
      const venta = c.totalFinal ?? totalConDescuento(c, t.totalVenta);
      return sum + (venta - t.totalCosto);
    }, 0);
  }, [clientes.lista]);

  const recientes = useMemo(() => {
    return [...clientes.lista].sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).slice(0, 5);
  }, [clientes.lista]);

  const stats = [
    { label: "Productos", value: totalProductos, sub: "en catálogo", color: "#1B5E6B", bg: "#E4EFF1", icon: Package },
    { label: "Cotizaciones internas", value: totalInternas, sub: "registradas", color: "#7A5A00", bg: "#FFF4CC", icon: FileTextIcon },
    { label: "Cotizaciones clientes", value: totalClientes, sub: "registradas", color: "#7A2D1B", bg: "#F6DDD6", icon: Users },
    { label: "Ganancia total", value: money(gananciaTotal), sub: "acumulada", color: "#155F3D", bg: "#D7EFE2", icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      <div className="hero" style={{ backgroundImage: `url(${PUERTO_IMG})` }}>
        <div className="hero-content">
          <div className="flex items-center gap-2 mb-2" style={{ opacity: .85 }}>
            <Ship size={18} />
            <span className="text-sm font-medium" style={{ letterSpacing: ".06em", textTransform: "uppercase" }}>Importaciones</span>
          </div>
          <h2>Bienvenido a tu cotizador</h2>
          <p>{(empresa && empresa.nombre) || "Taller Gregoriana"} · Resumen general de tu actividad</p>
        </div>
      </div>

      <div className="stats-grid">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="stat-card">
              <div className="stat-icon" style={{ background: s.bg, color: s.color }}>
                <Icon size={22} />
              </div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-sub">{s.sub}</div>
            </div>
          );
        })}
      </div>

      <div className="quick-actions">
        <button className="quick-btn" onClick={() => irA("clientes")}>
          <div className="qa-icon" style={{ background: "#E4EFF1", color: "#1B5E6B" }}><FileTextIcon size={20} /></div>
          <div>
            <div>Nueva cotización</div>
            <div className="text-sm muted" style={{ fontWeight: 400 }}>Para un cliente</div>
          </div>
        </button>
        <button className="quick-btn" onClick={() => irA("productos")}>
          <div className="qa-icon" style={{ background: "#FFF4CC", color: "#7A5A00" }}><Package size={20} /></div>
          <div>
            <div>Agregar producto</div>
            <div className="text-sm muted" style={{ fontWeight: 400 }}>Al catálogo</div>
          </div>
        </button>
        <button className="quick-btn" onClick={() => irA("internas")}>
          <div className="qa-icon" style={{ background: "#F6DDD6", color: "#7A2D1B" }}><DollarSign size={20} /></div>
          <div>
            <div>Ver ganancias</div>
            <div className="text-sm muted" style={{ fontWeight: 400 }}>Registro interno</div>
          </div>
        </button>
      </div>

      <div className="recientes">
        <h3>Últimas cotizaciones</h3>
        {recientes.length === 0 ? (
          <div className="paper p-6 text-center muted">Aún no has registrado cotizaciones de cliente.</div>
        ) : (
          <div className="paper" style={{ overflow: "hidden" }}>
            {recientes.map((c) => {
              const t = calcTotalesCliente(c.lineas);
              const venta = c.totalFinal ?? totalConDescuento(c, t.totalVenta);
              return (
                <button key={c.id} className="reciente-item" onClick={() => irA("clientes")}>
                  <FileText size={20} color="#1B5E6B" style={{ flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                      <span className="reciente-num">{c.numero}</span>
                      <span className="reciente-total">{money(venta)}</span>
                    </div>
                    <div className="reciente-sub">
                      <span className="reciente-cliente">{c.cliente || "Sin cliente"}</span>
                      <span style={{ flexShrink: 0 }}>{fecha(c.fecha)}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const VACIA = { contador: 0, lista: [] };
const TABS = [
  { id: "inicio", label: "Inicio", icon: Home },
  { id: "productos", label: "Producto", icon: Package },
  { id: "internas", label: "Cotizaciones internas", icon: FileTextIcon },
  { id: "clientes", label: "Cotizaciones clientes", icon: Users },
];

export default function App() {
  const [tab, setTab] = useState("inicio");
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [productos, setProductos] = useState([]);
  const [internas, setInternas] = useState(VACIA);
  const [clientes, setClientes] = useState(VACIA);
  const [empresa, setEmpresa] = useState(EMPRESA_POR_DEFECTO);
  const [cargando, setCargando] = useState(true);
  const [online, setOnline] = useState(!!supabase);
  const [toast, setToast] = useState(null);
  const timer = useRef(null);

  useEffect(() => {
    (async () => {
      let p, ci, cc, em;
      if (supabase) {
        [p, ci, cc, em] = await Promise.all([
          sbLoadProductos(), sbLoadCotizacionesClientes(),
          sbLoadCotizacionesInternas(), sbLoadEmpresa(),
        ]);
      }
      if (p === null) {
        console.warn("Supabase no disponible, usando IndexedDB local");
        setOnline(false);
        [p, ci, cc, em] = await Promise.all([
          localLoad("productos", []),
          localLoad("cotizaciones", VACIA),
          localLoad("cotizacionesClientes", VACIA),
          localLoad("empresa", EMPRESA_POR_DEFECTO),
        ]);
      }
      setProductos(Array.isArray(p) ? p : []);
      setEmpresa(em && typeof em === "object"
        ? {
            nombre: em.nombre || EMPRESA_POR_DEFECTO.nombre,
            contacto: em.contacto || EMPRESA_POR_DEFECTO.contacto,
            logo: em.logo || EMPRESA_POR_DEFECTO.logo,
          }
        : EMPRESA_POR_DEFECTO);
      setInternas(ci && Array.isArray(ci.lista) ? ci : VACIA);
      setClientes(cc && Array.isArray(cc.lista) ? cc : VACIA);
      setCargando(false);
    })();
  }, []);

  const avisar = (msg, tipo = "ok") => {
    setToast({ msg, tipo });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), tipo === "error" ? 5000 : 2600);
  };

  const guardarProductos = async (data) => {
    setProductos(data);
    await localSave("productos", data);
    if (supabase) {
      const ok = await sbSaveProductos(data);
      if (!ok) { avisar("No se pudo guardar en la nube. Revisa tu conexión.", "error"); return false; }
    }
    return true;
  };
  const guardarInternas = async (data) => {
    setInternas(data);
    await localSave("cotizaciones", data);
    if (supabase) {
      const ok = await sbSaveCotizacionesInternas(data);
      if (!ok) { avisar("No se pudo actualizar el registro interno en la nube.", "error"); return false; }
    }
    return true;
  };
  const guardarClientes = async (data) => {
    setClientes(data);
    await localSave("cotizacionesClientes", data);
    if (supabase) {
      const ok = await sbSaveCotizacionesClientes(data);
      if (!ok) { avisar("No se pudo registrar la cotización en la nube.", "error"); return false; }
    }
    return true;
  };
  const guardarEmpresa = async (data) => {
    setEmpresa(data);
    await localSave("empresa", data);
    if (supabase) {
      const ok = await sbSaveEmpresa(data);
      if (!ok) { avisar("No se pudieron guardar los datos de tu empresa en la nube.", "error"); return false; }
    }
    return true;
  };

  const cambiarTab = (t) => {
    setTab(t);
    setMenuAbierto(false);
    window.scrollTo({ top: 0 });
  };
  const irAProductos = () => cambiarTab("productos");

  return (
    <div className="app">
      <style>{STYLES}</style>

      <div className="mobile-topbar">
        <button className="hamburger" aria-label="Abrir menú" onClick={() => setMenuAbierto(true)}>
          <Menu size={22} />
        </button>
        <div className="mobile-topbar-title">{TABS.find((item) => item.id === tab)?.label}</div>
        <span className={`mobile-status ${online ? "ok" : ""}`} title={online ? "Sincronizado" : "Sin nube"} />
      </div>

      <div className={`backdrop ${menuAbierto ? "open" : ""}`} onClick={() => setMenuAbierto(false)} />

      <div className="layout">
        <aside className={`sidebar ${menuAbierto ? "open" : ""}`}>
          <div className="sidebar-logo">
            {empresa.logo && <img src={empresa.logo} alt="" />}
            <div className="min-w-0">
              <div className="nombre truncate">{empresa.nombre || "Cotizador"}</div>
              <div className="sub">Cotizador CBM</div>
            </div>
          </div>
          <nav className="sidebar-nav" role="tablist">
            {TABS.map((t) => {
              const Icon = t.icon;
              return (
                <button key={t.id} role="tab" className="nav-item" aria-selected={tab === t.id}
                  onClick={() => cambiarTab(t.id)}>
                  <Icon size={20} className="nav-icon" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </nav>
          <div className="sidebar-footer">
            v1.0 · {new Date().getFullYear()}
            <div className={`estado ${online ? "ok" : "off"}`}>
              {online ? <Cloud size={12} /> : <CloudOff size={12} />}
              <span>{online ? "Sincronizado" : "Sin nube"}</span>
            </div>
          </div>
        </aside>

        <main className="main-content">
          <div className="main-inner">
            {cargando ? (
              <div className="paper p-8 text-center muted">Cargando datos…</div>
            ) : (
              <>
                {tab === "inicio" && (
                  <InicioView productos={productos} internas={internas} clientes={clientes}
                    empresa={empresa} irA={cambiarTab} />
                )}
                {tab === "productos" && (
                  <ProductosView productos={productos} guardarProductos={guardarProductos} avisar={avisar}
                    empresa={empresa} guardarEmpresa={guardarEmpresa} />
                )}
                {tab === "internas" && (
                  <CotizacionInternaView cotiz={internas} guardarCotizaciones={guardarInternas}
                    clientes={clientes} avisar={avisar} empresa={empresa} />
                )}
                {tab === "clientes" && (
                  <CotizacionClienteView productos={productos} cotiz={clientes} guardarCotizaciones={guardarClientes}
                    internas={internas} guardarInternas={guardarInternas} avisar={avisar}
                    irAProductos={irAProductos} empresa={empresa} />
                )}
              </>
            )}
          </div>
        </main>
      </div>

      <nav className="mobile-bottom-nav" aria-label="Navegación principal">
        {TABS.map((item) => {
          const Icon = item.icon;
          return (
            <button key={item.id} className="mobile-nav-item" aria-selected={tab === item.id}
              onClick={() => cambiarTab(item.id)}>
              <Icon size={20} />
              <span>{item.id === "internas" ? "Internas" : item.id === "clientes" ? "Clientes" : item.label}</span>
            </button>
          );
        })}
      </nav>

      {toast && (
        <div className="fixed left-0 right-0 bottom-4 z-50 flex justify-center px-4" role="status">
          <div className={`${toast.tipo === "error" ? "toast-error" : "toast-ok"} px-4 py-3 text-sm font-medium`}
            style={{ borderRadius: 8, maxWidth: 420 }}>
            {toast.msg}
          </div>
        </div>
      )}
    </div>
  );
}
