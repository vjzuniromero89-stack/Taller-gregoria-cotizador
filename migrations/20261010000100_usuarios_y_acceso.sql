-- Usuarios de la parte interna y funciones de acceso. No cambia todavía los permisos de las tablas
-- (eso lo hace 20261010000200_cerrar_acceso.sql).
create schema if not exists privado;
revoke all on schema privado from public, anon, authenticated;
create table if not exists privado.claves (nombre text primary key, valor text not null);

create table if not exists public.usuarios (
  id uuid primary key references auth.users(id) on delete cascade,
  usuario text not null unique,
  nombre text not null default '',
  rol text not null default 'usuario' check (rol in ('admin', 'usuario')),
  activo boolean not null default true,
  creado timestamptz not null default now()
);
alter table public.usuarios enable row level security;
revoke all on public.usuarios from anon, authenticated;
grant select on public.usuarios to authenticated;

create or replace function public.es_usuario() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.usuarios u where u.id = (select auth.uid()) and u.activo);
$$;

create or replace function public.es_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.usuarios u where u.id = (select auth.uid()) and u.activo and u.rol = 'admin');
$$;

-- El servidor de la página (api/) se identifica con una clave propia en la cabecera x-evk-clave.
create or replace function public.es_servicio() returns boolean
language plpgsql stable security definer set search_path = '' as $$
declare h text;
begin
  h := nullif(current_setting('request.headers', true), '')::json ->> 'x-evk-clave';
  return h is not null and exists (select 1 from privado.claves c where c.nombre = 'servicio' and c.valor = h);
exception when others then
  return false;
end $$;

drop policy if exists usuarios_ver on public.usuarios;
create policy usuarios_ver on public.usuarios for select to authenticated
  using (id = (select auth.uid()) or (select public.es_usuario()));

create or replace function public.hay_usuarios() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.usuarios);
$$;

create or replace function privado.crear_usuario(p_usuario text, p_nombre text, p_clave text, p_rol text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  v_id uuid := gen_random_uuid();
  v_usuario text := lower(btrim(coalesce(p_usuario, '')));
  v_correo text;
begin
  if v_usuario !~ '^[a-z0-9._-]{3,30}$' then
    raise exception 'El usuario debe tener de 3 a 30 letras o números, sin espacios.';
  end if;
  if length(coalesce(p_clave, '')) < 8 then
    raise exception 'La contraseña debe tener al menos 8 caracteres.';
  end if;
  if p_rol not in ('admin', 'usuario', 'vendedor') then
    raise exception 'Tipo de usuario no válido.';
  end if;
  if exists (select 1 from public.usuarios u where u.usuario = v_usuario) then
    raise exception 'Ya existe un usuario con ese nombre.';
  end if;
  v_correo := v_usuario || '@evk.local';
  insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change, email_change_token_current,
    phone_change, phone_change_token, reauthentication_token)
  values ('00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated', v_correo,
    extensions.crypt(p_clave, extensions.gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now(),
    '', '', '', '', '', '', '', '');
  insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  values (gen_random_uuid(), v_id, v_id::text,
    jsonb_build_object('sub', v_id::text, 'email', v_correo, 'email_verified', true, 'phone_verified', false),
    'email', now(), now(), now());
  insert into public.usuarios (id, usuario, nombre, rol) values (v_id, v_usuario, btrim(coalesce(p_nombre, '')), p_rol);
  return v_id;
end $$;
revoke all on function privado.crear_usuario(text, text, text, text) from public, anon, authenticated;

-- Solo funciona mientras no exista ningún usuario: crea al dueño.
create or replace function public.crear_primer_admin(p_usuario text, p_nombre text, p_clave text) returns uuid
language plpgsql security definer set search_path = '' as $$
begin
  lock table public.usuarios in exclusive mode;
  if exists (select 1 from public.usuarios) then
    raise exception 'Ya hay un administrador. Entra con tu usuario.';
  end if;
  return privado.crear_usuario(p_usuario, p_nombre, p_clave, 'admin');
end $$;

create or replace function public.crear_usuario(p_usuario text, p_nombre text, p_clave text, p_rol text default 'usuario') returns uuid
language plpgsql security definer set search_path = '' as $$
begin
  if not public.es_admin() then raise exception 'Solo un administrador puede crear usuarios.'; end if;
  return privado.crear_usuario(p_usuario, p_nombre, p_clave, p_rol);
end $$;

create or replace function public.actualizar_usuario(p_id uuid, p_nombre text, p_rol text, p_activo boolean) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.es_admin() then raise exception 'Solo un administrador puede cambiar usuarios.'; end if;
  if p_rol not in ('admin', 'usuario', 'vendedor') then raise exception 'Tipo de usuario no válido.'; end if;
  if (p_rol <> 'admin' or not p_activo)
     and not exists (select 1 from public.usuarios u where u.id <> p_id and u.rol = 'admin' and u.activo) then
    raise exception 'Tiene que quedar al menos un administrador activo.';
  end if;
  update public.usuarios set nombre = btrim(coalesce(p_nombre, '')), rol = p_rol, activo = p_activo where id = p_id;
end $$;

create or replace function public.cambiar_clave_usuario(p_id uuid, p_clave text) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.es_admin() then raise exception 'Solo un administrador puede cambiar contraseñas.'; end if;
  if length(coalesce(p_clave, '')) < 8 then raise exception 'La contraseña debe tener al menos 8 caracteres.'; end if;
  if not exists (select 1 from public.usuarios u where u.id = p_id) then raise exception 'Ese usuario no existe.'; end if;
  update auth.users set encrypted_password = extensions.crypt(p_clave, extensions.gen_salt('bf')), updated_at = now() where id = p_id;
end $$;

create or replace function public.borrar_usuario(p_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.es_admin() then raise exception 'Solo un administrador puede borrar usuarios.'; end if;
  if p_id = (select auth.uid()) then raise exception 'No puedes borrar tu propio usuario.'; end if;
  if not exists (select 1 from public.usuarios u where u.id <> p_id and u.rol = 'admin' and u.activo) then
    raise exception 'Tiene que quedar al menos un administrador activo.';
  end if;
  if not exists (select 1 from public.usuarios u where u.id = p_id) then raise exception 'Ese usuario no existe.'; end if;
  delete from auth.users where id = p_id;
end $$;

revoke execute on function public.crear_usuario(text, text, text, text), public.actualizar_usuario(uuid, text, text, boolean),
  public.cambiar_clave_usuario(uuid, text), public.borrar_usuario(uuid) from public, anon;
grant execute on function public.crear_usuario(text, text, text, text), public.actualizar_usuario(uuid, text, text, boolean),
  public.cambiar_clave_usuario(uuid, text), public.borrar_usuario(uuid) to authenticated;
grant execute on function public.hay_usuarios(), public.crear_primer_admin(text, text, text),
  public.es_usuario(), public.es_admin(), public.es_servicio() to anon, authenticated;

-- Clave con la que la página se identifica; el mismo valor va en Vercel como EVK_CLAVE_SERVICIO.
insert into privado.claves (nombre, valor) values ('servicio', encode(extensions.gen_random_bytes(32), 'hex'))
on conflict (nombre) do nothing;
notify pgrst, 'reload schema';
