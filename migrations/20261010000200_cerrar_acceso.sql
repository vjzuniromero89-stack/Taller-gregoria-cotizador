-- Cierra las tablas: solo entran los usuarios activos (parte interna) y la propia página (clave x-evk-clave).
-- Aplicar DESPUÉS de publicar la versión con entrada por usuario y de poner EVK_CLAVE_SERVICIO en Vercel.
do $$
declare t text;
begin
  foreach t in array array['productos', 'cotizaciones_clientes', 'cotizaciones_internas', 'configuracion'] loop
    execute format('drop policy if exists %I on public.%I', t || '_anon_all', t);
    execute format('drop policy if exists %I on public.%I', t || '_acceso', t);
    execute format(
      'create policy %I on public.%I for all to anon, authenticated using ((select public.es_usuario()) or (select public.es_servicio())) with check ((select public.es_usuario()) or (select public.es_servicio()))',
      t || '_acceso', t);
  end loop;
end $$;
notify pgrst, 'reload schema';
