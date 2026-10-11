-- Cupones de descuento que el cliente escribe al crear su cotización.
create table if not exists public.cupones (
  codigo text primary key check (codigo = upper(codigo) and codigo ~ '^[A-Z0-9_-]{3,30}$'),
  tipo text not null default 'porcentaje' check (tipo in ('porcentaje', 'monto')),
  valor numeric not null check (valor > 0),
  minimo numeric not null default 0,
  usos_max integer,
  vence date,
  activo boolean not null default true,
  nota text not null default '',
  creado timestamptz not null default now(),
  check (tipo <> 'porcentaje' or valor <= 100)
);
alter table public.cupones enable row level security;
drop policy if exists cupones_acceso on public.cupones;
create policy cupones_acceso on public.cupones for all to anon, authenticated
  using ((select public.es_usuario()) or (select public.es_servicio()))
  with check ((select public.es_usuario()) or (select public.es_servicio()));
grant select, insert, update, delete on public.cupones to anon, authenticated;
notify pgrst, 'reload schema';
