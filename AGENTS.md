# AGENTS.md — UTNContenidos (Ruteador Global)

> Plataforma de generación de clases con IA para docentes UTN FRD.
> Stack: Next.js 15 + TypeScript · Supabase (Postgres + RLS + Auth + pgvector) · Gemini/OpenRouter · Reveal.js · Vercel.
> Metodología: modelo espiral (B1→B6).

## Flujo estándar (por tarea)

1. Leer `memory.md` (estado Beta + próximo ticket) y `docs/specs/001-mvp/tickets.md`.
2. Identificar skill(s) según la tabla de ruteo y leer su `SKILL.md` antes de editar.
3. Un solo agente ejecuta el ticket vertical completo (DB → API → UI), consultando las skills que necesite.
4. Implementar con `Edit` quirúrgico (nunca reescribir archivos grandes).
5. Verificar (escalonado, ver abajo).
6. Actualizar `memory.md` (<300 palabras, sobreescribir) y `DocumentoCronologico.md` si es hito.
7. Pushear SOLO si esta auditado o es parte del sprint autónomo.
8. Mostrarle al humano el proceso con un localhost automatico por cada task implementado.

## Ruteo por tema / archivo (skills en `.agents/skills/<nombre>/SKILL.md`)

| Si tocás… | Skill |
|-----------|-------|
| `supabase/*.sql`, `lib/supabase.ts`, `lib/auth.ts`, `scripts/seed_*` | `utn-db-supabase` |
| `app/api/ia/**`, prompts, RAG, streaming | `utn-ia-engine` |
| Contenido pedagógico, 7 momentos, contrato de slide | `utn-class-builder` |
| `app/`, `components/`, `lib/deck.ts`, `globals.css` | `utn-frontend-ux50` |
| Auth, endpoints, cookies, CSP, PII | `utn-security-audit` (+ `supabase-auth`) |
| Pruebas pre-deploy, E2E, regresiones | `utn-qa` |
| Mapa del codebase / flujo de datos | `utn-arquitectura` |
| Auditoría de docs, archivado, SDD | `repository-brain` |
| Cierre de sesión, `memory.md` | `utn-memory` |
| Ahorro de tokens, búsqueda dirigida | `utn-token-economy` |
| Animaciones 3D, estilo 'iOS 27', 'Android 17', 'Windows 12', Motion Graphics, Framer Motion | `smooth-ae` |

Las skills genéricas (`tdd`, `code-review`, `diagnosing-bugs`, etc.) también viven en `.agents/skills/`.
`utn-gas-backend` está jubilada: ver `docs/archives/prototype-alpha/`.

## Reglas de desarrollo (innegociables)

1. **TDD Red-Green:** no escribir código fuente sin un test que falle antes (verificar el log RED).
2. **Vertical Slices:** cada ticket conecta persistencia/API → UI. Prohibidas las capas horizontales aisladas.
3. **Módulos profundos:** interfaces públicas pequeñas, lógica densa encapsulada.
4. **Cambios quirúrgicos:** editar, no reescribir. Commits convencionales (`feat:`, `fix:`, `chore:`…).
5. **Verificación escalonada:**
   - Siempre: `npm run check` + `npm test`.
   - Si cambia una ruta, la DB o el deploy: además `npm run build` + `npm run dev` y `curl -i http://localhost:3000/api/...` pegando evidencia.
6. **Contexto:** al acercarse a ~100k tokens, hacer handoff (volcar estado a `memory.md`) y `/clear`.
7. **SKILLS** Crear skills automaticamente entendiendo la informacion de `repository-brain` y `architecture.md` y guardandola en `.agents/skills/`

## Reglas no negociables

- **Costo $0** (Supabase free, Vercel free, Gemini del usuario, OpenRouter free).
- **Seguridad/PII:** `docentes.dni/email` (Ley 25.326) jamás en APIs ni logs. Nunca commitear secretos.
- **Público 50+:** letra grande, 2 clics, feedback visual, "vos".
- **RAG:** pgvector, búsqueda SOLO dentro de la materia del docente.
- **Deploy:** `vercel.json` con `framework: nextjs`; no volver a "Otro".
- **Escalabilidad:** borrar documentos desactualizados que no afecten la funcionalidad y achicar el contexto.
- **Mobile First** tu objetivo de diseño es atado a dispositivos moviles (UX/UI y media-queries)

## Documentos canónicos

| Doc | Rol |
|-----|-----|
| `docs/constitution.md` | Principios, invariantes, alcance MVP |
| `docs/specs/001-mvp/spec.md` | Spec de producto activa |
| `docs/specs/001-mvp/tickets.md` | Tickets verticales en curso |
| `memory.md` | Caché de estado Beta |
| `DocumentoCronologico.md` | Bitácora institucional (pasantía) |
| `supabase/schema.sql` + `patch_*.sql` | Esquema de datos + RLS |
| `docs/archives/` | Planes completados + Alpha archivada |
| `repository-brain` | Cerebro para la creacion de skills y de escalabilidad IA |
## Idiomas

- Código, identificadores, commits: **inglés**.
- Interfaz y mensajes al usuario: **español rioplatense ("vos")**.

## Layout y comandos

- `app/` (rutas + server actions), `components/` (UI), `lib/` (auth, supabase, deck), `scripts/` (seeds `.mjs`), `tests/` (Vitest), `supabase/` (SQL versionado).

```bash
npm run dev | build | check | test
npm run seed:root | seed:materias | seed:apuntes
vercel --prod
```