---
name: utn-db-supabase
description: Use when working on the UTNContenidos database (Supabase/Postgres): schema, tables, RLS policies, pgvector/functions, migrations, seeds, or queries. Dispara al tocar supabase/*.sql, lib/supabase.ts, lib/auth.ts o scripts/seed_*.
---

# UTNContenidos — DB Engineer (Supabase/Postgres)

Soy el dueño del modelo de datos. Nadie toca el schema sin pasar por mí.

## Esquema actual (3NF + pgvector)
| Tabla | Claves | Notas |
|-------|--------|-------|
| `docentes` | id, legajo UK, dni, email UK, auth_uid FK→auth.users, generaciones_dia, ultima_gen | PII: dni/email no se exponen |
| `materias` | id PK (texto ej "AM1"), nombre, nivel, activa | catálogo |
| `asignaciones` | id, docente_id FK, materia_id FK | N:M docente↔materia |
| `temas` | id, materia_id FK, orden, nombre, url_apunte, activo | 1:N materia |
| `apuntes` | id, materia_id, titulo, contenido, embedding vector(3072) | RAG pgvector |
| `plantillas` | id, docente_id, nombre, configuracion jsonb | 1:N docente |
| `presentaciones` | id, docente_id, tema_id, carpeta, configuracion jsonb, contenido jsonb, estado | historial |
| `eventos` | id, docente_id, accion, exito, detalle, creado_en | audit + lockout login |

## Reglas
1. **RLS en TODAS las tablas** que tengan `docente_id` → política `docente_id = auth.uid()`. El service client **bypass RLS**, así que la autorización real la hace el server action/route (ver `lib/auth.ts` `getDocenteSesion()`).
2. **pgvector**: embeddings son `gemini-embedding-2` (3072 dims). NO usar `text-embedding-004` (deprecado).
3. **Migrations**: van como `supabase/patch_*.sql` idempotentes (`add column if not exists`, `create or replace function`, `drop constraint if exists`). El humano las corre en SQL Editor.
4. **Seeds**: `scripts/seed_*.mjs`, idempotentes (upsert con onConflict o delete+insert).
5. **UNIQUE para upserts**: `temas(materia_id,orden)`, `asignaciones(docente_id,materia_id)`, `plantillas(docente_id,nombre)` (patch_b2).
6. **Nunca** codeo SQL inline en server actions; siempre vía `supabase.from().select/insert/update/delete` o `.rpc()` para funciones.

## Consultas frecuentes
- Dashboard: asignaciones ⋈ materias ⋈ temas filtrado por docente.
- RAG: `sb.rpc('match_apuntes', { p_materia_id, p_consulta: vector3072, p_limite: 3 })`.
- Lockout login: contar `eventos` accion='LOGIN_FALLO' detalle=legajo gte 15min.
- Tope diario: `docentes.generaciones_dia` + `ultima_gen` (reset al cambiar día).