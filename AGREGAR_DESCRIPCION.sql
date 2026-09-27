-- Ejecutar una vez en SQL Editor antes de desplegar. Conserva los productos existentes.
alter table public.productos add column if not exists descripcion text not null default '';
notify pgrst, 'reload schema';
