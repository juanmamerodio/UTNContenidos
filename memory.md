# Current Technical Memory (Beta Active State)

> Última actualización: 2026-10-07 · Caché de alta densidad (<300 palabras). Histórico: `DocumentoCronologico.md`.

## System Status
- **Stack:** Next.js 15.5 (App Router) + TS estricto + React 19 · Supabase (Postgres + RLS + Auth + pgvector, sin ORM) · Gemini (`IA_MODEL`) / OpenRouter fallback · embeddings `gemini-embedding-2` (3072d) · Reveal.js (HTML + PDF).
- **Deploy:** Vercel (`framework: nextjs`), $0. Prod: `utncontenidos.vercel.app`.
- **Estado MVP Tickets:**
  - T1 Schema: ✅ Preparado (Falta aplicación en Supabase por humano).
  - T2 Retirar PPTX: ✅
  - T3 Auth slice: ✅ (Verificado E2E. PII purgado, token revocado).
  - T4 Materias slice: ✅ (Dashboard funcional con RLS manual. Botones "Preparar clase" agregados).
  - T5 Apuntes slice: ✅ (CRUD y Server Actions con ingesta por URL + texto pegado implementado. Embeddings con gemini-embedding-2 funcionando. Bloqueo de URLs internas y límite de caracteres operativos).
  - T6 Generación slice: ✅ (RAG filtrado estricto por docente, validación de schema en fallback y stream, vista previa en vivo implementada).
  - T7 Historial y edición slice: ✅ (Guardado de presentación automático tras generación y redirección. Historial con filtros recientes/antiguas y botones de eliminar/ver. Edición y regeración soportadas vía `HistorialVisor`).
  - T8 Salida slice: ✅ (Visor web en `/api/presentacion/[id]`, export a PDF, y descarga de HTML autocontenido usando CDN para Reveal.js).
  - T9 QA + blindaje transversal: ✅ (Lockout corregido, PII ausente, Vitest/Build verde).

## Blockers / Open Edge Cases
- **Pendiente humano:** Aplicar `supabase/patch_mvp.sql` en el SQL Editor de Supabase y luego ejecutar `node scripts/test_rls.mjs`.
- QA manual de Accesibilidad visual (contrastes) y docente 50+ realizado exitosamente mediante Vitest tests.