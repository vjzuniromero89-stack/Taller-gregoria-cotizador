-- Cotizador CBM (Taller Gregoriana) — esquema inicial de Supabase
--
-- Cómo aplicarla:
--   Opción A (recomendada, sin instalar nada): entra a tu proyecto en supabase.com
--   → SQL Editor → New query → pega todo este archivo → Run.
--   Opción B (con Supabase CLI): supabase db push
--
-- Crea las 4 tablas que usa la app (productos, cotizaciones_clientes,
-- cotizaciones_internas, configuracion) y les da acceso de lectura/escritura
-- con la anon key, porque la app no tiene login propio: usa la anon key
-- directamente desde el navegador. Si más adelante agregas autenticación,
-- puedes cambiar estas políticas para exigir un usuario logueado.

-- ============ productos ============
create table if not exists public.productos (
  id text primary key,
  codigo text not null default '',
  nombre text not null default '',
  cbm numeric not null default 0,
  peso numeric not null default 0,
  precio_cbm numeric not null default 0,
  precio_producto numeric not null default 0,
  precio_venta numeric not null default 0,
  foto text not null default '',
  creado timestamptz not null default now()
);

alter table public.productos enable row level security;

drop policy if exists "productos_anon_all" on public.productos;
create policy "productos_anon_all" on public.productos
  for all
  to anon, authenticated
  using (true)
  with check (true);

create index if not exists idx_productos_creado on public.productos (creado desc);

-- ============ cotizaciones_clientes ============
create table if not exists public.cotizaciones_clientes (
  id text primary key,
  numero text not null,
  fecha timestamptz not null default now(),
  cliente text not null default '',
  descuento numeric not null default 0,
  descuento_monto numeric not null default 0,
  total_final numeric not null default 0,
  lineas jsonb not null default '[]'::jsonb,
  totales jsonb not null default '{}'::jsonb
);

alter table public.cotizaciones_clientes enable row level security;

drop policy if exists "cotizaciones_clientes_anon_all" on public.cotizaciones_clientes;
create policy "cotizaciones_clientes_anon_all" on public.cotizaciones_clientes
  for all
  to anon, authenticated
  using (true)
  with check (true);

create index if not exists idx_cotizaciones_clientes_fecha on public.cotizaciones_clientes (fecha desc);

-- ============ cotizaciones_internas ============
create table if not exists public.cotizaciones_internas (
  id text primary key,
  numero text not null,
  fecha timestamptz not null default now(),
  cliente text not null default '',
  de_cliente boolean not null default false,
  descuento numeric not null default 0,
  descuento_monto numeric not null default 0,
  total_final numeric not null default 0,
  lineas jsonb not null default '[]'::jsonb,
  totales jsonb not null default '{}'::jsonb
);

alter table public.cotizaciones_internas enable row level security;

drop policy if exists "cotizaciones_internas_anon_all" on public.cotizaciones_internas;
create policy "cotizaciones_internas_anon_all" on public.cotizaciones_internas
  for all
  to anon, authenticated
  using (true)
  with check (true);

create index if not exists idx_cotizaciones_internas_fecha on public.cotizaciones_internas (fecha desc);

-- ============ configuracion ============
-- Guarda ajustes clave/valor, hoy solo se usa la clave "empresa"
-- (nombre, contacto y logo del taller).
create table if not exists public.configuracion (
  clave text primary key,
  valor jsonb not null default '{}'::jsonb
);

alter table public.configuracion enable row level security;

drop policy if exists "configuracion_anon_all" on public.configuracion;
create policy "configuracion_anon_all" on public.configuracion
  for all
  to anon, authenticated
  using (true)
  with check (true);
