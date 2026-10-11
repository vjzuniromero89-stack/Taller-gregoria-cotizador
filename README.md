# Taller Gregoriana · Cotizador CBM

Cotizador de equipos importados: productos con opciones, catálogo interno y de clientes (español e inglés),
cotizaciones con estado y pagos, clientes con enlace propio, cupones, ganancias y usuarios con contraseña.
Usa el mismo sistema que EVK Logistic (`vjzuniromero89-stack/EVKcotizador`), con su propia marca y sus propios datos.

- **Sitio:** https://taller-gregoria-cotizador.vjzuniromero89.workers.dev (Cloudflare Workers; cada `git push` a `main` publica).
- **Base de datos:** Supabase, proyecto `taller-gregoriana` (`oelmvkbayvqiaydaxiza`). El esquema está en `migrations/`.
- **Variables en Cloudflare:** `SUPABASE_URL` (en `wrangler.jsonc`), y los secretos `SUPABASE_ANON_KEY`
  (clave publishable, nunca la secreta) y `EVK_CLAVE_SERVICIO` (la clave con la que la página se identifica ante la base).

## Comprobaciones

```bash
npm run build
npm test
```
