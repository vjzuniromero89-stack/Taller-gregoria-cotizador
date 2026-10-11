import { useState, useEffect, useCallback } from "react";
import { LogIn, ShieldCheck, UserPlus, KeyRound, Trash2, LogOut } from "lucide-react";
import { LOGO_POR_DEFECTO } from "./logo.js";

/* Entrada a la parte interna: usuario y contraseña. Los usuarios viven en Supabase Auth
   con un correo interno (usuario@evk.local) y su ficha en la tabla "usuarios". */

const correoDe = (usuario) => `${String(usuario || "").trim().toLowerCase()}@evk.local`;
const mensajeDe = (error) => String(error?.message || "No se pudo completar.");

const ESTILOS = `
.acc { min-height:100vh; display:grid; place-items:center; padding:20px; font-family:'Barlow',system-ui,sans-serif; color:#14222B;
  background:#0A1F44 url(/marca/portada.jpg) center 40% / cover; position:relative; }
.acc::before { content:""; position:absolute; inset:0; background:linear-gradient(180deg,rgba(7,24,51,.55) 0%,rgba(7,24,51,.9) 100%); }
.acc-caja { position:relative; width:100%; max-width:400px; background:#fff; border-radius:16px; padding:28px 26px; box-shadow:0 24px 60px rgba(3,10,26,.55); }
.acc-caja img { height:64px; border-radius:8px; display:block; margin-bottom:16px; background:#fff; padding:4px 8px; }
.acc-caja h1 { font-family:'Barlow Condensed',sans-serif; font-weight:800; font-size:32px; line-height:1; margin:0 0 6px; }
.acc-caja p { margin:0 0 18px; color:#5B6B75; font-size:15px; line-height:1.4; }
.acc-caja label { display:block; font-size:13px; font-weight:600; color:#5B6B75; margin:12px 0 4px; }
.acc-caja input { width:100%; background:#F6F8F9; border:1px solid #CAD4DA; border-radius:8px; padding:11px 12px; font-size:16px; color:#14222B; }
.acc-caja input:focus { outline:none; border-color:#1556B8; box-shadow:0 0 0 3px rgba(21,86,184,.22); background:#fff; }
.acc-boton { width:100%; margin-top:18px; border:0; border-radius:8px; padding:12px 16px; background:#FF8A1F; color:#1B1000; font:inherit; font-weight:700;
  font-size:16px; display:inline-flex; align-items:center; justify-content:center; gap:8px; cursor:pointer; }
.acc-boton:hover { background:#FFA14A; }
.acc-boton:disabled { background:#E6C9A8; cursor:not-allowed; }
.acc-boton:focus-visible { outline:3px solid #1556B8; outline-offset:2px; }
.acc-error { margin-top:12px; background:#FBE9E5; border:1px solid #E3C3BC; color:#8A2A1A; border-radius:8px; padding:9px 12px; font-size:14.5px; }
.acc-enlace { display:block; margin-top:14px; text-align:center; font-size:14px; color:#1556B8; background:none; border:0; width:100%; cursor:pointer; font:inherit; }
`;

function Caja({ titulo, texto, children }) {
  return (
    <div className="acc">
      <style>{ESTILOS}</style>
      <div className="acc-caja">
        <img src={LOGO_POR_DEFECTO} alt="Taller Gregoriana" />
        <h1>{titulo}</h1>
        {texto && <p>{texto}</p>}
        {children}
      </div>
    </div>
  );
}

function Entrar({ supabase }) {
  const [usuario, setUsuario] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const enviar = async (e) => {
    e.preventDefault();
    setError(""); setOcupado(true);
    const { error: fallo } = await supabase.auth.signInWithPassword({ email: correoDe(usuario), password: clave });
    setOcupado(false);
    if (fallo) setError("Usuario o contraseña incorrectos.");
  };
  return (
    <Caja titulo="Entrar" texto="Parte interna de Taller Gregoriana. Escribe tu usuario y tu contraseña.">
      <form onSubmit={enviar}>
        <label htmlFor="acc-usuario">Usuario</label>
        <input id="acc-usuario" autoComplete="username" autoCapitalize="none" value={usuario} onChange={(e) => setUsuario(e.target.value)} required />
        <label htmlFor="acc-clave">Contraseña</label>
        <input id="acc-clave" type="password" autoComplete="current-password" value={clave} onChange={(e) => setClave(e.target.value)} required />
        {error && <div className="acc-error" role="alert">{error}</div>}
        <button className="acc-boton" disabled={ocupado}><LogIn size={18} />{ocupado ? "Entrando…" : "Entrar"}</button>
      </form>
      <a className="acc-enlace" href="/catalogo-cliente">Ver el catálogo de productos</a>
    </Caja>
  );
}

function CrearDueno({ supabase }) {
  const [f, setF] = useState({ usuario: "", nombre: "", clave: "", repetir: "" });
  const [error, setError] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));
  const enviar = async (e) => {
    e.preventDefault();
    if (f.clave !== f.repetir) { setError("Las dos contraseñas no son iguales."); return; }
    setError(""); setOcupado(true);
    const { error: fallo } = await supabase.rpc("crear_primer_admin", { p_usuario: f.usuario, p_nombre: f.nombre, p_clave: f.clave });
    if (fallo) { setOcupado(false); setError(mensajeDe(fallo)); return; }
    const { error: entrada } = await supabase.auth.signInWithPassword({ email: correoDe(f.usuario), password: f.clave });
    setOcupado(false);
    if (entrada) setError("El administrador se creó. Recarga la página y entra con tu usuario.");
  };
  return (
    <Caja titulo="Crea tu administrador" texto="Todavía no hay ningún usuario. El primero que se crea aquí es el dueño y puede agregar a los demás.">
      <form onSubmit={enviar}>
        <label htmlFor="acc-n-usuario">Usuario (sin espacios)</label>
        <input id="acc-n-usuario" autoComplete="username" autoCapitalize="none" value={f.usuario} onChange={set("usuario")} required minLength={3} maxLength={30} />
        <label htmlFor="acc-n-nombre">Tu nombre</label>
        <input id="acc-n-nombre" autoComplete="name" value={f.nombre} onChange={set("nombre")} />
        <label htmlFor="acc-n-clave">Contraseña (8 caracteres o más)</label>
        <input id="acc-n-clave" type="password" autoComplete="new-password" value={f.clave} onChange={set("clave")} required minLength={8} />
        <label htmlFor="acc-n-repetir">Repite la contraseña</label>
        <input id="acc-n-repetir" type="password" autoComplete="new-password" value={f.repetir} onChange={set("repetir")} required minLength={8} />
        {error && <div className="acc-error" role="alert">{error}</div>}
        <button className="acc-boton" disabled={ocupado}><ShieldCheck size={18} />{ocupado ? "Creando…" : "Crear administrador"}</button>
      </form>
    </Caja>
  );
}

/** Deja pasar solo a quien entró con un usuario activo. `children` recibe { perfil, salir }. */
export default function Acceso({ supabase, children }) {
  const [estado, setEstado] = useState("cargando"); // cargando | entrar | crear | sin-acceso | dentro | error
  const [perfil, setPerfil] = useState(null);

  const revisar = useCallback(async (sesion) => {
    if (sesion?.user) {
      const { data, error } = await supabase.from("usuarios").select("*").eq("id", sesion.user.id).maybeSingle();
      if (error) { setEstado("error"); return; }
      if (data?.activo) { setPerfil(data); setEstado("dentro"); } else { setPerfil(null); setEstado("sin-acceso"); }
      return;
    }
    setPerfil(null);
    const { data: hay, error } = await supabase.rpc("hay_usuarios");
    setEstado(error ? "error" : hay ? "entrar" : "crear");
  }, [supabase]);

  useEffect(() => {
    if (!supabase) return undefined;
    supabase.auth.getSession().then(({ data }) => revisar(data.session));
    const { data: escucha } = supabase.auth.onAuthStateChange((evento, sesion) => {
      if (evento === "SIGNED_IN" || evento === "SIGNED_OUT") setTimeout(() => revisar(sesion), 0);
    });
    return () => escucha.subscription.unsubscribe();
  }, [supabase, revisar]);

  const salir = useCallback(async () => { await supabase.auth.signOut(); }, [supabase]);

  if (!supabase) return <Caja titulo="Falta la conexión" texto="Esta página no tiene configurada su base de datos, así que no se puede entrar." />;
  if (estado === "dentro") return children({ perfil, salir });
  if (estado === "entrar") return <Entrar supabase={supabase} />;
  if (estado === "crear") return <CrearDueno supabase={supabase} />;
  if (estado === "sin-acceso") {
    return (
      <Caja titulo="Sin acceso" texto="Tu usuario está desactivado. Pídele al administrador que lo active.">
        <button className="acc-boton" onClick={salir}><LogOut size={18} />Salir</button>
      </Caja>
    );
  }
  if (estado === "error") {
    return (
      <Caja titulo="No se pudo comprobar el acceso" texto="Revisa tu conexión a internet e inténtalo otra vez.">
        <button className="acc-boton" onClick={() => window.location.reload()}>Reintentar</button>
      </Caja>
    );
  }
  return <Caja titulo="Cargando…" />;
}

const ROLES = { vendedor: "Vendedor", usuario: "Usuario", admin: "Administrador" };

/** Pestaña "Usuarios": el administrador agrega, cambia y quita a quienes pueden entrar. */
export function UsuariosView({ supabase, perfil, avisar, Encabezado }) {
  const NUEVO = { usuario: "", nombre: "", clave: "", rol: "usuario" };
  const [lista, setLista] = useState([]);
  const [form, setForm] = useState(NUEVO);
  const [error, setError] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [claveDe, setClaveDe] = useState(null); // id del usuario al que se le cambia la contraseña
  const [nuevaClave, setNuevaClave] = useState("");
  const [borrar, setBorrar] = useState(null);

  const cargar = useCallback(async () => {
    const { data } = await supabase.from("usuarios").select("*").order("creado");
    setLista(data || []);
  }, [supabase]);
  useEffect(() => { cargar(); }, [cargar]);

  const llamar = async (funcion, datos, hecho) => {
    setOcupado(true);
    const { error: fallo } = await supabase.rpc(funcion, datos);
    setOcupado(false);
    if (fallo) { avisar(mensajeDe(fallo), "error"); return false; }
    avisar(hecho);
    await cargar();
    return true;
  };
  const crear = async (e) => {
    e.preventDefault();
    setError(""); setOcupado(true);
    const { error: fallo } = await supabase.rpc("crear_usuario", { p_usuario: form.usuario, p_nombre: form.nombre, p_clave: form.clave, p_rol: form.rol });
    setOcupado(false);
    if (fallo) { setError(mensajeDe(fallo)); return; }
    avisar(`Usuario ${form.usuario.trim().toLowerCase()} creado`);
    setForm(NUEVO);
    cargar();
  };
  const cambiar = (u, cambios) => llamar("actualizar_usuario",
    { p_id: u.id, p_nombre: u.nombre, p_rol: u.rol, p_activo: u.activo, ...cambios }, `Usuario ${u.usuario} actualizado`);
  const guardarClave = async (u) => {
    if (await llamar("cambiar_clave_usuario", { p_id: u.id, p_clave: nuevaClave }, `Contraseña de ${u.usuario} cambiada`)) { setClaveDe(null); setNuevaClave(""); }
  };
  const set = (k) => (e) => setForm((x) => ({ ...x, [k]: e.target.value }));

  return (
    <div className="space-y-6">
      <Encabezado icon={ShieldCheck} tono="azul" titulo="Usuarios"
        descripcion="Quién puede entrar a la parte interna. Tus clientes no necesitan usuario: ellos usan el enlace del catálogo." />

      <form className="paper p-4" onSubmit={crear}>
        <h2 className="cond text-2xl font-semibold mb-3">Agregar usuario</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(200px,100%),1fr))", gap: 12 }}>
          <div><label className="lbl" htmlFor="u-usuario">Usuario (sin espacios)</label>
            <input id="u-usuario" className="inp" autoCapitalize="none" autoComplete="off" required minLength={3} maxLength={30} value={form.usuario} onChange={set("usuario")} /></div>
          <div><label className="lbl" htmlFor="u-nombre">Nombre</label>
            <input id="u-nombre" className="inp" autoComplete="off" value={form.nombre} onChange={set("nombre")} /></div>
          <div><label className="lbl" htmlFor="u-clave">Contraseña (8 o más)</label>
            <input id="u-clave" className="inp" type="password" autoComplete="new-password" required minLength={8} value={form.clave} onChange={set("clave")} /></div>
          <div><label className="lbl" htmlFor="u-rol">Tipo</label>
            <select id="u-rol" className="inp" value={form.rol} onChange={set("rol")}>
              <option value="vendedor">Vendedor (cotiza; no ve costos ni ganancias)</option>
              <option value="usuario">Usuario (todo menos Usuarios)</option>
              <option value="admin">Administrador</option>
            </select></div>
        </div>
        {error && <p className="mt-3" role="alert" style={{ color: "#A3321F", fontWeight: 600 }}>{error}</p>}
        <button className="btn btn-primary mt-3" disabled={ocupado}><UserPlus size={17} />Agregar usuario</button>
      </form>

      <div className="paper p-4">
        <h2 className="cond text-2xl font-semibold mb-3">Usuarios con acceso <span className="muted font-medium text-base">· {lista.length}</span></h2>
        <div className="space-y-3">
          {lista.map((u) => {
            const yo = u.id === perfil.id;
            return (
              <div key={u.id} className="paper p-3" style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", opacity: u.activo ? 1 : 0.6 }}>
                <div style={{ flex: "1 1 200px", minWidth: 0 }}>
                  <div className="font-semibold" style={{ overflowWrap: "anywhere" }}>{u.nombre || u.usuario}{yo && " (tú)"}</div>
                  <div className="muted text-sm num">{u.usuario} · {ROLES[u.rol] || u.rol}{!u.activo && " · desactivado"}</div>
                </div>
                {claveDe === u.id ? (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                    <input className="inp" style={{ width: 200 }} type="password" autoComplete="new-password" placeholder="Nueva contraseña" aria-label={`Nueva contraseña de ${u.usuario}`}
                      value={nuevaClave} onChange={(e) => setNuevaClave(e.target.value)} />
                    <button type="button" className="btn btn-primary" disabled={ocupado || nuevaClave.length < 8} onClick={() => guardarClave(u)}>Guardar</button>
                    <button type="button" className="btn btn-ghost" onClick={() => { setClaveDe(null); setNuevaClave(""); }}>Cancelar</button>
                  </div>
                ) : borrar === u.id ? (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                    <span>¿Borrar a {u.usuario}?</span>
                    <button type="button" className="btn btn-danger-solid" disabled={ocupado}
                      onClick={async () => { if (await llamar("borrar_usuario", { p_id: u.id }, `Usuario ${u.usuario} borrado`)) setBorrar(null); }}>Sí, borrar</button>
                    <button type="button" className="btn btn-ghost" onClick={() => setBorrar(null)}>No</button>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    <button type="button" className="btn btn-ghost" onClick={() => { setClaveDe(u.id); setNuevaClave(""); setBorrar(null); }}><KeyRound size={16} />Contraseña</button>
                    {!yo && (
                      <select className="inp" style={{ width: "auto" }} aria-label={`Tipo de usuario de ${u.usuario}`} disabled={ocupado}
                        value={u.rol} onChange={(e) => cambiar(u, { p_rol: e.target.value })}>
                        {Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    )}
                    {!yo && <button type="button" className="btn btn-ghost" disabled={ocupado}
                      onClick={() => cambiar(u, { p_activo: !u.activo })}>{u.activo ? "Desactivar" : "Activar"}</button>}
                    {!yo && <button type="button" className="btn btn-danger" onClick={() => { setBorrar(u.id); setClaveDe(null); }}><Trash2 size={16} />Borrar</button>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
