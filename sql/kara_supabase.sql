-- ==================================================
-- KARATE PARA LOS ENANOS · BASE DE DATOS EN SUPABASE (prefijo kara_)
--
-- Cómo usarlo:
--   1. Supabase → tu proyecto → SQL Editor → New query.
--   2. Pegar TODO este archivo y ejecutar (Run).
--      Se puede volver a ejecutar sin perder datos (no borra estrellas ni sobrinos).
--      Si ya se había ejecutado la versión anterior (con "clave del dojo"), este archivo la actualiza.
--   3. Poner la URL y la clave "anon public" del proyecto en js/supabase.js
--      (doble clic en "Configurar Supabase.bat" lo hace solo).
--
-- Sin clave del dojo: la página entra directo. Las tablas igual NO se pueden tocar desde la
-- página: todo pasa por las funciones kara_* (bloque 4), que validan los datos (límite de
-- estrellas por día, fechas, sobrinos existentes...).
-- OJO: la clave "anon" queda visible en la página (y en GitHub si el repositorio es público);
-- quien la tenga puede usar estas funciones. Por eso conviene usar APODOS para los sobrinos.
-- ==================================================


-- ==================================================
-- 0. LIMPIEZA DE LA VERSIÓN ANTERIOR (con clave del dojo). No borra datos.
-- ==================================================
drop function if exists public.kara_dojo(text);
drop function if exists public.kara_estado(text);
drop function if exists public.kara_agregar_sobrino(text, uuid, text, text);
drop function if exists public.kara_borrar_sobrino(text, uuid);
drop function if exists public.kara_sumar_estrellas(text, uuid, date, date, int, text, uuid);
drop function if exists public.kara_marcar(text, uuid, text, date);
drop function if exists public.kara_entregar(text, uuid, date, boolean);
drop function if exists public.kara_dia_clase(text, smallint);
alter table if exists public.kara_dojos drop column if exists clave_hash;


-- ==================================================
-- 1. TABLAS
-- ==================================================

-- El dojo (uno solo): día de clase y límite de estrellas por día
create table if not exists public.kara_dojos (
    id             uuid primary key default gen_random_uuid(),
    nombre         text not null default 'Dojo de los Enanos',
    dia_clase      smallint not null default 6 check (dia_clase between 0 and 6),  -- 0 = domingo … 6 = sábado
    limite_diario  int not null default 40 check (limite_diario between 1 and 500),
    creado_en      timestamptz not null default now()
);

-- Los sobrinos (karatekas)
create table if not exists public.kara_sobrinos (
    id         uuid primary key default gen_random_uuid(),       -- lo genera la página (permite guardar sin conexión)
    dojo_id    uuid not null references public.kara_dojos (id) on delete cascade,
    nombre     text not null check (char_length(nombre) between 1 and 20),
    avatar     text not null default '🐯',
    creado_en  timestamptz not null default now()
);
create index if not exists kara_sobrinos_dojo_idx on public.kara_sobrinos (dojo_id);

-- Cada vez que un sobrino gana estrellas (quiz, calentamiento…)
create table if not exists public.kara_estrellas (
    id          bigint generated always as identity primary key,
    evento      uuid not null unique,                             -- id del envío: evita contarlo dos veces si se reintenta
    sobrino_id  uuid not null references public.kara_sobrinos (id) on delete cascade,
    semana      date not null,                                    -- día en que empezó esa semana (día de clase)
    fecha       date not null,                                    -- día en que se ganaron
    cantidad    int not null check (cantidad > 0),
    motivo      text not null default 'quiz',
    creado_en   timestamptz not null default now()
);
create index if not exists kara_estrellas_semana_idx on public.kara_estrellas (sobrino_id, semana);
create index if not exists kara_estrellas_fecha_idx on public.kara_estrellas (sobrino_id, fecha);

-- Premio de una semana ya entregado (casilla "entregado" del Panel del tío)
create table if not exists public.kara_entregas (
    sobrino_id      uuid not null references public.kara_sobrinos (id) on delete cascade,
    semana          date not null,
    entregado       boolean not null default false,
    actualizado_en  timestamptz not null default now(),
    primary key (sobrino_id, semana)
);

-- Cosas que dan premio una vez al día (ej. 'calentamiento' → fecha en que se hizo)
create table if not exists public.kara_marcas (
    sobrino_id  uuid not null references public.kara_sobrinos (id) on delete cascade,
    clave       text not null,
    fecha       date not null,
    primary key (sobrino_id, clave)
);

-- El dojo se crea solo (si todavía no existe)
insert into public.kara_dojos (nombre)
select 'Dojo de los Enanos'
where not exists (select 1 from public.kara_dojos);


-- ==================================================
-- 2. SEGURIDAD: NADIE ENTRA DIRECTO A LAS TABLAS
--    (RLS activado y sin políticas = la clave "anon" no puede leer ni escribir las tablas)
-- ==================================================
alter table public.kara_dojos     enable row level security;
alter table public.kara_sobrinos  enable row level security;
alter table public.kara_estrellas enable row level security;
alter table public.kara_entregas  enable row level security;
alter table public.kara_marcas    enable row level security;

revoke all on public.kara_dojos, public.kara_sobrinos, public.kara_estrellas, public.kara_entregas, public.kara_marcas
    from anon, authenticated;


-- ==================================================
-- 3. AYUDANTES INTERNOS (no se pueden llamar desde la página)
-- ==================================================

-- Id del dojo (hay uno solo)
create or replace function public.kara_dojo_id()
returns uuid
language sql stable security definer set search_path = public
as $$
    select id from public.kara_dojos order by creado_en limit 1;
$$;

-- Comprueba que el sobrino exista
create or replace function public.kara_comprobar_sobrino(p_sobrino uuid)
returns void
language plpgsql security definer set search_path = public
as $$
begin
    if not exists (select 1 from public.kara_sobrinos where id = p_sobrino) then
        raise exception 'Ese sobrino no existe' using errcode = 'P0002';
    end if;
end;
$$;


-- ==================================================
-- 4. FUNCIONES QUE USA LA PÁGINA (js/perfiles.js → js/supabase.js)
-- ==================================================

-- Todo lo que la página necesita: ajustes del dojo y cada sobrino con sus últimas semanas
create or replace function public.kara_estado()
returns jsonb
language plpgsql security definer set search_path = public
as $$
declare
    v_dojo uuid := public.kara_dojo_id();
begin
    return jsonb_build_object(
        'dojo', (select jsonb_build_object('nombre', nombre, 'dia_clase', dia_clase, 'limite_diario', limite_diario)
                 from public.kara_dojos where id = v_dojo),
        'sobrinos', coalesce((
            select jsonb_agg(jsonb_build_object(
                'id', s.id,
                'nombre', s.nombre,
                'avatar', s.avatar,
                'semanas', coalesce((
                    select jsonb_object_agg(sem.semana::text, jsonb_build_object(
                        'estrellas', sem.total,
                        'dias', sem.dias,
                        'entregado', coalesce((select en.entregado from public.kara_entregas en
                                               where en.sobrino_id = s.id and en.semana = sem.semana), false)))
                    from (
                        select d.semana, sum(d.total)::int as total, jsonb_object_agg(d.fecha::text, d.total) as dias
                        from (
                            select e.semana, e.fecha, sum(e.cantidad)::int as total
                            from public.kara_estrellas e
                            where e.sobrino_id = s.id and e.semana >= current_date - 63   -- últimas ~8 semanas
                            group by e.semana, e.fecha
                        ) d
                        group by d.semana
                    ) sem
                ), '{}'::jsonb),
                'marcas', coalesce((select jsonb_object_agg(m.clave, m.fecha::text)
                                    from public.kara_marcas m where m.sobrino_id = s.id), '{}'::jsonb)
            ) order by s.creado_en)
            from public.kara_sobrinos s
            where s.dojo_id = v_dojo
        ), '[]'::jsonb)
    );
end;
$$;

-- Agregar un sobrino (si ya existe ese id, no hace nada: sirve para reintentos)
create or replace function public.kara_agregar_sobrino(p_id uuid, p_nombre text, p_avatar text)
returns uuid
language plpgsql security definer set search_path = public
as $$
begin
    if coalesce(trim(p_nombre), '') = '' then
        raise exception 'Falta el nombre';
    end if;
    if (select count(*) from public.kara_sobrinos) >= 30 then
        raise exception 'Demasiados sobrinos';
    end if;
    insert into public.kara_sobrinos (id, dojo_id, nombre, avatar)
    values (p_id, public.kara_dojo_id(), left(trim(p_nombre), 20), left(coalesce(nullif(p_avatar, ''), '🐯'), 8))
    on conflict (id) do nothing;
    return p_id;
end;
$$;

-- Modificar nombre y avatar de un sobrino (Panel del tío)
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

-- Borrar un sobrino con todas sus estrellas
create or replace function public.kara_borrar_sobrino(p_id uuid)
returns void
language plpgsql security definer set search_path = public
as $$
begin
    delete from public.kara_sobrinos where id = p_id;
end;
$$;

-- Sumar estrellas respetando el límite diario. Devuelve cuántas se sumaron de verdad.
create or replace function public.kara_sumar_estrellas(
    p_sobrino uuid, p_semana date, p_fecha date, p_cantidad int, p_motivo text, p_evento uuid)
returns int
language plpgsql security definer set search_path = public
as $$
declare
    v_limite int;
    v_hoy    int;
    v_dar    int;
begin
    perform public.kara_comprobar_sobrino(p_sobrino);
    if exists (select 1 from public.kara_estrellas where evento = p_evento) then
        return 0;  -- ya se había guardado (reintento)
    end if;
    if p_cantidad is null or p_cantidad < 1 or p_cantidad > 50 then
        raise exception 'Cantidad de estrellas no válida';
    end if;
    -- fechas razonables: hasta ~10 semanas atrás (para subir datos guardados en el navegador)
    if p_fecha not between current_date - 70 and current_date + 2 or p_semana not between p_fecha - 6 and p_fecha then
        raise exception 'Fecha no válida';
    end if;

    select limite_diario into v_limite from public.kara_dojos where id = public.kara_dojo_id();
    select coalesce(sum(cantidad), 0) into v_hoy from public.kara_estrellas where sobrino_id = p_sobrino and fecha = p_fecha;
    v_dar := greatest(0, least(p_cantidad, v_limite - v_hoy));
    if v_dar > 0 then
        insert into public.kara_estrellas (evento, sobrino_id, semana, fecha, cantidad, motivo)
        values (p_evento, p_sobrino, p_semana, p_fecha, v_dar, left(coalesce(p_motivo, 'quiz'), 30));
    end if;
    return v_dar;
end;
$$;

-- Marca de "una vez al día" (ej. calentamiento hecho hoy)
create or replace function public.kara_marcar(p_sobrino uuid, p_marca text, p_fecha date)
returns void
language plpgsql security definer set search_path = public
as $$
begin
    perform public.kara_comprobar_sobrino(p_sobrino);
    insert into public.kara_marcas (sobrino_id, clave, fecha)
    values (p_sobrino, left(p_marca, 30), p_fecha)
    on conflict (sobrino_id, clave) do update set fecha = excluded.fecha;
end;
$$;

-- Casilla "entregado" del premio de una semana
create or replace function public.kara_entregar(p_sobrino uuid, p_semana date, p_entregado boolean)
returns void
language plpgsql security definer set search_path = public
as $$
begin
    perform public.kara_comprobar_sobrino(p_sobrino);
    insert into public.kara_entregas (sobrino_id, semana, entregado, actualizado_en)
    values (p_sobrino, p_semana, p_entregado, now())
    on conflict (sobrino_id, semana) do update set entregado = excluded.entregado, actualizado_en = now();
end;
$$;

-- Día de clase (0 = domingo … 6 = sábado)
create or replace function public.kara_dia_clase(p_dia smallint)
returns void
language plpgsql security definer set search_path = public
as $$
begin
    if p_dia not between 0 and 6 then
        raise exception 'Día no válido';
    end if;
    update public.kara_dojos set dia_clase = p_dia where id = public.kara_dojo_id();
end;
$$;

-- Permisos: la página (anon) solo puede usar las funciones del bloque 4
revoke execute on function
    public.kara_dojo_id(),
    public.kara_comprobar_sobrino(uuid),
    public.kara_estado(),
    public.kara_agregar_sobrino(uuid, text, text),
    public.kara_editar_sobrino(uuid, text, text),
    public.kara_borrar_sobrino(uuid),
    public.kara_sumar_estrellas(uuid, date, date, int, text, uuid),
    public.kara_marcar(uuid, text, date),
    public.kara_entregar(uuid, date, boolean),
    public.kara_dia_clase(smallint)
from public, anon, authenticated;

grant execute on function
    public.kara_estado(),
    public.kara_agregar_sobrino(uuid, text, text),
    public.kara_editar_sobrino(uuid, text, text),
    public.kara_borrar_sobrino(uuid),
    public.kara_sumar_estrellas(uuid, date, date, int, text, uuid),
    public.kara_marcar(uuid, text, date),
    public.kara_entregar(uuid, date, boolean),
    public.kara_dia_clase(smallint)
to anon, authenticated;

-- Que la API de Supabase vea las funciones nuevas enseguida
notify pgrst, 'reload schema';
