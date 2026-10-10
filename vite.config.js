import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Solo en "npm run dev": responde /api/contacto con un número de prueba para poder
// probar la cotización por WhatsApp del catálogo sin el Worker ni la base de datos.
const contactoDePrueba = {
  name: "contacto-de-prueba",
  configureServer(server) {
    server.middlewares.use("/api/contacto", (_req, res) => {
      res.setHeader("content-type", "application/json; charset=utf-8");
      res.end(JSON.stringify({ nombre: "Taller de prueba", whatsapp: "50500000000" }));
    });
  },
};

export default defineConfig({ plugins: [react(), contactoDePrueba] });
