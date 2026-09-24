# Taller Gregoriana – Cotizador CBM

Recuperación basada en los archivos supervivientes del proyecto original:
- `App.jsx` del 13 de septiembre de 2026.
- Build compilado `index.html` del 12 de septiembre de 2026.

## Ejecutar
1. `npm install`
2. Copiar `.env.example` a `.env` y completar `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` (Supabase → Project Settings → API).
3. `npm run dev`

## Base de datos (Supabase)
La app necesita 4 tablas que todavía no existen en un proyecto nuevo de Supabase:
`productos`, `cotizaciones_clientes`, `cotizaciones_internas` y `configuracion`.
Sin ellas, el guardado falla silenciosamente (se cae al respaldo local en el navegador).

Para crearlas:
1. Entra a tu proyecto en supabase.com → **SQL Editor** → **New query**.
2. Pega el contenido completo de `MIGRACION.sql` (o `supabase/migrations/20260924000000_init_schema.sql`, es el mismo archivo).
3. Dale **Run**.

Esto crea las tablas con Row Level Security activado y una política que permite
leer/escribir con la anon key, porque la app no tiene login propio. Si más
adelante agregas autenticación, conviene ajustar esas políticas para exigir
un usuario logueado.

Si usas Supabase CLI en vez del editor web: `supabase db push` (usa el archivo
en `supabase/migrations/`).

## Desplegar
Build command: `npm run build`
Output directory: `dist`

Recuerda configurar `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` como variables
de entorno de build en Cloudflare Workers (Settings → Variables), no solo en tu
`.env` local — si faltan ahí, el build de producción sale sin conexión a Supabase.
