-- PATCH B2: constraints UNIQUE para upserts idempotentes
-- Ejecutar en Supabase SQL Editor (idempotente)

alter table public.temas
  drop constraint if exists temas_materia_orden_unique;
alter table public.temas
  add constraint temas_materia_orden_unique unique (materia_id, orden);

alter table public.asignaciones
  drop constraint if exists asign_docente_materia_unique;
alter table public.asignaciones
  add constraint asign_docente_materia_unique unique (docente_id, materia_id);