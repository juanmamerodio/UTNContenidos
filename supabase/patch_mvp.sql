-- ============================================================================
-- PATCH MVP - UTNContenidos
-- T1: Schema: apuntes privados por docente
-- ============================================================================

-- 1. Agregar docente_id a apuntes
alter table public.apuntes add column if not exists docente_id uuid references public.docentes(id) on delete cascade;

-- 2. Migrar filas existentes
do $$
declare
  r_apunte record;
  v_docente_id uuid;
begin
  for r_apunte in select * from public.apuntes where docente_id is null loop
    select docente_id into v_docente_id from public.asignaciones where materia_id = r_apunte.materia_id limit 1;
    if v_docente_id is null then
      select id into v_docente_id from public.docentes limit 1;
    end if;
    update public.apuntes set docente_id = v_docente_id where id = r_apunte.id;
  end loop;
end $$;

-- 3. Índice y Not Null
alter table public.apuntes alter column docente_id set not null;
create index if not exists idx_apuntes_docente_materia on public.apuntes(docente_id, materia_id);

-- 4. Reemplazar RLS apuntes_sel por owner-only
drop policy if exists "apuntes_sel" on public.apuntes;
create policy "apuntes_sel" on public.apuntes for select using (
  docente_id = (select id from public.docentes where auth_uid = auth.uid())
);

drop policy if exists "apuntes_ins" on public.apuntes;
create policy "apuntes_ins" on public.apuntes for insert with check (
  docente_id = (select id from public.docentes where auth_uid = auth.uid())
);

drop policy if exists "apuntes_upd" on public.apuntes;
create policy "apuntes_upd" on public.apuntes for update using (
  docente_id = (select id from public.docentes where auth_uid = auth.uid())
);

drop policy if exists "apuntes_del" on public.apuntes;
create policy "apuntes_del" on public.apuntes for delete using (
  docente_id = (select id from public.docentes where auth_uid = auth.uid())
);

-- 5. Actualizar verificar_tope_generacion() para leer limite por parametro
create or replace function public.verificar_tope_generacion(p_limite int default 20)
returns boolean language plpgsql security definer as $$
declare v_dia int;
begin
  select generaciones_dia into v_dia from public.docentes where auth_uid = auth.uid();
  return coalesce(v_dia, 0) < p_limite;
end;
$$;
