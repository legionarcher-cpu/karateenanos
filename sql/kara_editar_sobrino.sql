-- ==================================================
-- KARATE PARA LOS ENANOS · ACTUALIZACIÓN: MODIFICAR SOBRINO
-- Para un proyecto donde YA se ejecutó sql/kara_supabase.sql antes de esta función.
-- Supabase → SQL Editor → New query → pegar todo → Run. Se puede ejecutar varias veces.
-- (Si se instala desde cero, basta con sql/kara_supabase.sql: ya la incluye.)
-- ==================================================

create or replace function public.kara_editar_sobrino(p_id uuid, p_nombre text, p_avatar text)
returns void
language plpgsql security definer set search_path = public
as $$
begin
    perform public.kara_comprobar_sobrino(p_id);
    if coalesce(trim(p_nombre), '') = '' then
        raise exception 'Falta el nombre';
    end if;
    update public.kara_sobrinos
       set nombre = left(trim(p_nombre), 20),
           avatar = left(coalesce(nullif(p_avatar, ''), avatar), 8)
     where id = p_id;
end;
$$;

revoke execute on function public.kara_editar_sobrino(uuid, text, text) from public, anon, authenticated;
grant execute on function public.kara_editar_sobrino(uuid, text, text) to anon, authenticated;

-- Que la API de Supabase vea la función nueva enseguida
notify pgrst, 'reload schema';
