-- Tipo de usuario "vendedor": cotiza y ve el catálogo del cliente, sin costos ni ganancias.
-- (Las funciones privado.crear_usuario y public.actualizar_usuario se volvieron a crear aceptando 'vendedor';
--  ver 20261010000100_usuarios_y_acceso.sql para su texto completo.)
alter table public.usuarios drop constraint if exists usuarios_rol_check;
alter table public.usuarios add constraint usuarios_rol_check check (rol in ('admin', 'usuario', 'vendedor'));

create or replace function public.es_vendedor() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.usuarios u where u.id = (select auth.uid()) and u.activo and u.rol = 'vendedor');
$$;
grant execute on function public.es_vendedor() to anon, authenticated;

-- Los cupones no son para el vendedor.
drop policy if exists cupones_acceso on public.cupones;
create policy cupones_acceso on public.cupones for all to anon, authenticated
  using (((select public.es_usuario()) and not (select public.es_vendedor())) or (select public.es_servicio()))
  with check (((select public.es_usuario()) and not (select public.es_vendedor())) or (select public.es_servicio()));
notify pgrst, 'reload schema';
