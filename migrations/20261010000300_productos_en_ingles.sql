-- Versión en inglés de cada producto: { nombre, categoria, descripcion }. Vacío = se muestra en español.
alter table public.productos add column if not exists en jsonb not null default '{}'::jsonb;
notify pgrst, 'reload schema';
