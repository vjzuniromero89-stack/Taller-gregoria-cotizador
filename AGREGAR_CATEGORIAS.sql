-- Ejecutar antes de desplegar. Conserva los productos existentes.
alter table public.productos add column if not exists descripcion text not null default '';
alter table public.productos add column if not exists categoria text not null default 'Sin categoría';
notify pgrst, 'reload schema';
