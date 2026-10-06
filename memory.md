# Current Technical Memory (Beta Active State)

> Última actualización: 2026-10-05 · Caché de alta densidad (<300 palabras). Histórico: `DocumentoCronologico.md`.

## System Status
- **Architecture:** Next.js 15 (App Router) + TypeScript estricto + React 19.
- **Persistence:** Supabase (Postgres + RLS + Auth + pgvector). Sin ORM — `@supabase/supabase-js` con SQL versionado en `supabase/`.
- **IA:** Gemini primario (`IA_MODEL`) / OpenRouter fallback. Embeddings `gemini-embedding-2` (3072d).
- **Presentación:** Reveal.js 5 self-hosted (HTML autocontenido + PDF). **PPTX retirado.**
- **Deploy:** Vercel (`framework: nextjs`), costo $0. Prod: `utncontenidos.vercel.app`.
- **Fase activa:** Beta. Alpha/GAS/Sheets deprecados, purgados y archivados en `docs/archives/`.

## Current Active Feature
- **Feature:** `docs/specs/001-mvp/spec.md` (apuntes privados por docente, 7 momentos, RAG aislado).
- **Active Ticket:** T1 (apuntes owner-only + RLS) en `docs/specs/001-mvp/tickets.md`.

## Recent Decisions (Last 3)
1. **Apuntes privados por docente** — RLS por `docente_id` + `materia_id`; el RAG solo busca en apuntes propios de la materia seleccionada.
2. **Login root/root** — autoridad = tabla `docentes`; sesión JWT Supabase en cookie HttpOnly `utn_sesion`; lockout 5 fallos/15 min.
3. **Salida = HTML + PDF** — `docs/specs/001-mvp/spec.md` supersede a `docs/spec.md` y a los `PLAN_BETA_*` (archivados).

## Blockers / Open Edge Cases
- QA real con docente 50+ (pendiente humano).
- Confirmar cron keep-alive activo (`/api/health`, `vercel.json` `0 12 * * *`).
- Lighthouse gama baja (validación manual opcional).