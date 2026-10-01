-- ============================================================================
-- UTNContenidos Beta 0.1.0 — Esquema Supabase (PostgreSQL)
-- Ejecutar en: Supabase Dashboard > SQL Editor (o supabase db push)
-- Orden: 1) auth.users (ya existe)  2) este script 3) triggers
-- ============================================================================

-- ============ DOCENTES (perfil ligado a Supabase Auth) ============
create table if not exists public.docentes (
  id          uuid primary key default gen_random_uuid(),
  auth_uid    uuid unique references auth.users(id) on delete cascade,
  legajo      text unique not null,
  dni         text not null,
  email       text unique not null,
  nombre      text not null,
  activo      boolean not null default true,
  generaciones_dia int not null default 0,
  ultima_gen  timestamptz,
  creado_en   timestamptz not null default now()
);

-- ============ MATERIAS (catálogo) ============
create table if not exists public.materias (
  id          text primary key,
  nombre      text not null,
  nivel       text not null default 'General',
  departamento text,
  descripcion text,
  activa      boolean not null default true
);

-- ============ ASIGNACIONES (N:M docente↔materia) ============
create table if not exists public.asignaciones (
  id          uuid primary key default gen_random_uuid(),
  docente_id  uuid not null references public.docentes(id) on delete cascade,
  materia_id  text not null references public.materias(id) on delete cascade,
  rol         text not null default 'Docente',
  ciclo_lectivo text,
  creado_en   timestamptz not null default now()
);

-- ============ TEMAS ============
create table if not exists public.temas (
  id          uuid primary key default gen_random_uuid(),
  materia_id  text not null references public.materias(id) on delete cascade,
  orden       int not null default 1,
  nombre      text not null,
  descripcion text,
  url_apunte  text,
  activo      boolean not null default true,
  creado_en   timestamptz not null default now()
);

-- ============ APUNTES (RAG + pgvector) ============
create table if not exists public.apuntes (
  id          uuid primary key default gen_random_uuid(),
  materia_id  text not null references public.materias(id) on delete cascade,
  titulo      text not null,
  contenido   text not null,
  creado_en   timestamptz not null default now()
);
-- Extension vector (RAG semántico)
create extension if not exists vector;

-- ============ PLANTILLAS ============
create table if not exists public.plantillas (
  id          uuid primary key default gen_random_uuid(),
  docente_id  uuid not null references public.docentes(id) on delete cascade,
  nombre      text not null,
  configuracion jsonb not null default '{}'::jsonb,
  creado_en   timestamptz not null default now(),
  unique (docente_id, nombre)
);

-- ============ PRESENTACIONES ============
create table if not exists public.presentaciones (
  id          uuid primary key default gen_random_uuid(),
  docente_id  uuid not null references public.docentes(id) on delete cascade,
  tema_id     uuid references public.temas(id) on delete set null,
  carpeta     text not null default '',
  configuracion jsonb not null default '{}'::jsonb,
  contenido   jsonb not null default '{}'::jsonb,
  estado      text not null default 'BORRADOR',
  creada_en   timestamptz not null default now(),
  actualizada_en timestamptz not null default now()
);

-- ============ SLIDES ============
create table if not exists public.slides (
  id          uuid primary key default gen_random_uuid(),
  presentacion_id uuid not null references public.presentaciones(id) on delete cascade,
  orden       int not null default 0,
  tipo        text not null default 'contenido',
  datos       jsonb not null default '{}'::jsonb
);

-- ============ EVENTOS (telemetría / audit log) ============
create table if not exists public.eventos (
  id          uuid primary key default gen_random_uuid(),
  docente_id  uuid references public.docentes(id) on delete set null,
  accion      text not null,
  exito       boolean not null default true,
  detalle     text,
  creado_en   timestamptz not null default now()
);

-- ============ ÍNDICES ============
create index if not exists idx_asignaciones_docente on public.asignaciones(docente_id);
create index if not exists idx_asignaciones_materia on public.asignaciones(materia_id);
create index if not exists idx_temas_materia on public.temas(materia_id);
create index if not exists idx_presentaciones_docente on public.presentaciones(docente_id);
create index if not exists idx_eventos_docente on public.eventos(docente_id);
create index if not exists idx_slides_presentacion on public.slides(presentacion_id);

-- ============ UNIQUE (para UPSERT idempotente) ============
alter table public.temas add constraint temas_materia_orden_unique unique (materia_id, orden);
alter table public.asignaciones add constraint asign_docente_materia_unique unique (docente_id, materia_id);

-- ============ ROW LEVEL SECURITY (seguridad por fila) ============
alter table public.docentes enable row level security;
alter table public.asignaciones enable row level security;
alter table public.temas enable row level security;
alter table public.apuntes enable row level security;
alter table public.plantillas enable row level security;
alter table public.presentaciones enable row level security;
alter table public.slides enable row level security;
alter table public.eventos enable row level security;
alter table public.materias enable row level security;

-- Docente ve/edita SOLO su propio perfil
create policy "docentes_sel" on public.docentes for select using (auth.uid() = auth_uid);
create policy "docentes_ins" on public.docentes for insert with check (auth.uid() = auth_uid);

-- Asignaciones: el docente ve las suyas
create policy "asign_sel" on public.asignaciones for select using (auth.uid() in (
  select auth_uid from public.docentes where id = docente_id
));

-- Materias: lectura pública autenticada (catálogo)
create policy "materias_sel" on public.materias for select using (auth.role() = 'authenticated');

-- Temas: lectura autenticada
create policy "temas_sel" on public.temas for select using (auth.role() = 'authenticated');

-- Apuntes: lectura autenticada (RAG)
create policy "apuntes_sel" on public.apuntes for select using (auth.role() = 'authenticated');

-- Plantillas: solo propias
create policy "tpl_sel" on public.plantillas for select using (auth.uid() in (select auth_uid from public.docentes where id = docente_id));
create policy "tpl_ins" on public.plantillas for insert with check (auth.uid() in (select auth_uid from public.docentes where id = docente_id));
create policy "tpl_upd" on public.plantillas for update using (auth.uid() in (select auth_uid from public.docentes where id = docente_id));
create policy "tpl_del" on public.plantillas for delete using (auth.uid() in (select auth_uid from public.docentes where id = docente_id));

-- Presentaciones: solo propias
create policy "pres_sel" on public.presentaciones for select using (auth.uid() in (select auth_uid from public.docentes where id = docente_id));
create policy "pres_ins" on public.presentaciones for insert with check (auth.uid() in (select auth_uid from public.docentes where id = docente_id));
create policy "pres_upd" on public.presentaciones for update using (auth.uid() in (select auth_uid from public.docentes where id = docente_id));
create policy "pres_del" on public.presentaciones for delete using (auth.uid() in (select auth_uid from public.docentes where id = docente_id));

-- Slides: vía presentación propia
create policy "sl_sel" on public.slides for select using (auth.uid() in (select d.auth_uid from public.docentes d join public.presentaciones p on p.docente_id = d.id where p.id = presentacion_id));
create policy "sl_ins" on public.slides for insert with check (auth.uid() in (select d.auth_uid from public.docentes d join public.presentaciones p on p.docente_id = d.id where p.id = presentacion_id));
create policy "sl_upd" on public.slides for update using (auth.uid() in (select d.auth_uid from public.docentes d join public.presentaciones p on p.docente_id = d.id where p.id = presentacion_id));
create policy "sl_del" on public.slides for delete using (auth.uid() in (select d.auth_uid from public.docentes d join public.presentaciones p on p.docente_id = d.id where p.id = presentacion_id));

-- Eventos: solo los propios
create policy "ev_sel" on public.eventos for select using (auth.uid() in (select auth_uid from public.docentes where id = docente_id));
create policy "ev_ins" on public.eventos for insert with check (auth.uid() in (select auth_uid from public.docentes where id = docente_id));

-- ============ TRIGGER: actualizar "actualizada_en" ============
create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin
  new.actualizada_en = now();
  return new;
end;
$$;

-- PostgreSQL NO soporta "CREATE TRIGGER IF NOT EXISTS" (solo TABLE/INDEX).
-- Forma idempotente y compatible (PG 11-17): DO + chequeo del catálogo pg_trigger.
do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'trg_pres_updated') then
    execute 'create trigger trg_pres_updated before update on public.presentaciones
             execute function public.set_updated_at()';
  end if;
end $$;

-- ============ TRIGGER: evento genérico por sesión (log manual vía API) ============
create or replace function public.registrar_evento(p_accion text, p_exito boolean, p_detalle text)
returns void language plpgsql security definer as $$
begin
  insert into public.eventos (docente_id, accion, exito, detalle)
  select id, p_accion, p_exito, p_detalle from public.docentes where auth_uid = auth.uid();
end;
$$;

-- ============ FUNCIÓN: tope diario de generaciones (B5 rate-limit) ============
create or replace function public.verificar_tope_generacion()
returns boolean language plpgsql security definer as $$
declare v_dia int;
begin
  select generaciones_dia into v_dia from public.docentes where auth_uid = auth.uid();
  return coalesce(v_dia, 0) < 20;
end;
$$;