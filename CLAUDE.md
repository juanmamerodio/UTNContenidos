# CLAUDE.md — Ruteador Global (UTNContenidos)

> Índice comprimido. El detalle vive en `docs/`. Para el orquestador de skills legado ver `AGENTS.md`.

## Stack Técnico Innegociable
- **Lenguaje:** TypeScript estricto (`strict: true`), Node 20+.
- **Framework:** Next.js 15 (App Router) + React 19.
- **Persistencia:** Supabase (Postgres + RLS + Auth + pgvector). **ORM:** ninguno — `@supabase/supabase-js` con SQL versionado en `supabase/`.
- **IA:** Gemini (primario) / OpenRouter (fallback).
- **Test runner:** Vitest.
- **Deploy:** Vercel (`vercel.json` con `framework: nextjs`). Costo operativo: **$0**.

## Comandos de Verificación
| Propósito | Comando |
|-----------|---------|
| Test runner | `npm test` (`vitest run`) |
| Linter/Typecheck | `npm run check` (`tsc --noEmit`) |
| Dev server | `npm run dev` (http://localhost:3000) |
| Build prod | `npm run build` |

## Reglas de Desarrollo
1. **TDD Red-Green obligatorio.** Jamás escribir código fuente sin antes escribir un test unitario que falle y verificar su log de error (RED). Recién entonces implementar hasta GREEN.
2. **Vertical Slices (Tracer Bullets).** Cada ticket/spec conecta persistencia/API → UI. Prohibido construir capas horizontales aisladas.
3. **Módulos profundos.** Interfaces públicas pequeñas; lógica densa y encapsulada adentro. Evitar módulos anchos y superficiales.
4. **Verificación en runtime.** Antes de dar una tarea por verde: levantar `npm run dev` y ejercitar endpoints/rutas con `curl` (ej. `curl -i http://localhost:3000/api/...`), pegando evidencia.
5. **Cambios quirúrgicos.** Editar, no reescribir archivos grandes. Commits convencionales (`feat:`, `fix:`, `chore:`…).
6. **Seguridad/PII.** `docentes.dni/email` jamás en APIs ni logs (Ley 25.326). Nunca commitear secretos.

## Idiomas
- Código, identificadores, commits: **inglés**.
- Interfaz y mensajes al usuario: **español rioplatense ("vos")**, público docente 50+.

## Ruteo de Documentación
| Si la consulta es sobre… | Leer |
|--------------------------|------|
| Principios, alcance MVP, invariantes | `docs/constitution.md` |
| Producto / arquitectura / requisitos | `docs/spec.md` (si no existe, `docs/constitution.md`) |
| Specs de features individuales | `docs/specs/` |
| Estado técnico e historial | `memory.md`, `DocumentoCronologico.md` |
| Roadmap y stack | `PLAN_BETA_FINAL.md` |
| Skills especializadas | `.claude/skills/` y `AGENTS.md` |

## Layout
- `app/`, `components/`, `lib/` — código Next.js existente (se migrará a `src/` por slices, sin big-bang).
- `src/` — código nuevo; `tests/` — suite Vitest; `supabase/` — esquema y migraciones.
- `prototype-alpha/` — archivado, solo referencia.
