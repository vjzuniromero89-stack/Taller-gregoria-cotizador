import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { CATALOGO_XPROMISE } from "./src/catalogoXpromise.js";

// Solo en "npm run dev": imita las respuestas del Worker que usa el catálogo de clientes
// (contacto del taller y registro de cotizaciones) para probarlo sin la base de datos.
// Nada de esto se guarda ni llega al sitio publicado.
const apiDePrueba = {
  name: "api-de-prueba",
  configureServer(server) {
    const responder = (res, cuerpo, estado = 200) => {
      res.statusCode = estado;
      res.setHeader("content-type", "application/json; charset=utf-8");
      res.end(JSON.stringify(cuerpo));
    };
    let ultima = null;
    server.middlewares.use("/api/contacto", (_req, res) => {
      responder(res, { nombre: "Taller de prueba", contacto: "", logo: "", whatsapp: "50500000000" });
    });
    server.middlewares.use("/api/solicitudes", (req, res) => {
      if (req.method !== "POST") return ultima ? responder(res, { ok: true, cotizacion: ultima }) : responder(res, { ok: false }, 404);
      let texto = "";
      req.on("data", (trozo) => { texto += trozo; });
      req.on("end", () => {
        const pedido = JSON.parse(texto || "{}");
        const lineas = (pedido.lineas || []).map((l) => {
          const p = CATALOGO_XPROMISE.find((x) => x.codigo === l.codigo);
          return p && { codigo: p.codigo, nombre: p.nombre, cantidad: l.cantidad, precio: Math.round(p.precioProducto * 1.3), foto: p.foto };
        }).filter(Boolean);
        ultima = {
          id: "00000000-0000-4000-8000-000000000001", numero: "WEB-0001", fecha: new Date().toISOString(),
          cliente: pedido.nombre, telefono: pedido.telefono, direccion: pedido.direccion || "", nota: pedido.nota || "", lineas,
          total: lineas.reduce((s, l) => s + l.precio * l.cantidad, 0),
        };
        responder(res, { ok: true, cotizacion: ultima }, 201);
      });
    });
  },
};

export default defineConfig({ plugins: [react(), apiDePrueba] });
