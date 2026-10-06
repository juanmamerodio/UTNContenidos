# Spec del MVP — UTNContenidos

> **Versión:** 1.0 · **Estado:** acordado vía grilling 2026-10-05
> Fuente de verdad de producto. Invariantes y principios: `docs/constitution.md`.
> Supersede a `docs/spec.md` (borrador) — archivar/eliminar.

---

## 1. Decisión de dominio central: apuntes privados por docente

**El apunte pertenece al docente y es privado** (RLS por `docente_id`). Se registra
*contra* una materia (para acotar el RAG a "apuntes del docente sobre esa materia"),
pero jamás se comparte entre docentes en el MVP.

- Un docente solo ve/usa sus propios apuntes.
- El RAG busca **solo** dentro de los apuntes del docente autenticado, y de la materia
  seleccionada → cumple la invariante constitucional #1 (aislamiento por materia) *y*
  agrega privacidad por profesor.
- Modelo resultante en `apuntes`: `id, docente_id, materia_id, titulo, contenido, embedding, creado_en`.
- RLS: `docente_id = (select id from docentes where auth_uid = auth.uid())`.

> **Por qué no "por materia" (compartido):** el historial mostró que cada profesor
> prepara su propia bibliografía y contexto; compartir apuntes abre un vector de
> fuga de material y rompe la expectativa de privacidad. La cátedra compartida se
> resuelve copiando/aportando apuntes, no leyendo los ajenos.

---

## 2. Alcance del MVP

**Dentro:** login docente (alta administrada), materias asignadas, gestión de apuntes
propios (URL o texto), generación de clase de 7 momentos con RAG propio, historial con
edición y regeneración de slide, salida HTML autocontenido + PDF.

**Fuera (hasta enmendar la constitución):** registro abierto, magic link, Entra ID,
compartir apuntes entre docentes, multi-institución, PPTX, enlaces públicos a clases,
cuentas de alumnos, subida de PDF/Word, analítica avanzada, edición colaborativa en tiempo real.

---

## 3. Stack (innegociable)

| Capa | Decisión |
|------|----------|
| Lenguaje | TypeScript estricto (`strict: true`), Node 20+ |
| Framework | Next.js 15 (App Router) + React 19 |
| Persistencia | Supabase Postgres + RLS + Auth + pgvector. Sin ORM; SQL versionado en `supabase/` |
| IA | Gemini (primario) / OpenRouter (fallback). Embeddings: `gemini-embedding-2` (3072d) |
| Presentación | Reveal.js 5 self-hosted, HTML autocontenido |
| Test | Vitest |
| Deploy | Vercel (`vercel.json` con `framework: nextjs`). Costo $0 |

---

## 4. Alta y autenticación

- **Alta administrada**: el docente existe en la tabla `docentes` (cargado por la facultad).
  No hay registro autónomo en el MVP.
- **Login:** legajo + DNI contra la tabla `docentes` (la autoridad es la tabla, no un password).
  Sesión = JWT Supabase en cookie HttpOnly `utn_sesion`.
- **Lockout:** 5 fallos / 15 min (tabla `eventos`, acción `LOGIN_FALLO`).
- **QA:** bootstrap `root/root` (auto-repara el `auth_uid` al vuelo; password desde `ROOT_AUTH_PASS`).
- **Evolución post-MVP (no se especifica ahora):** email `@frd.utn.edu.ar` verificado, luego Entra ID.

---

## 5. Flujo principal (vertical slices)

1. **Auth** — login/logout, sesión HttpOnly, lockout.
2. **Materias** — dashboard con materias asignadas al docente (RLS vía `asignaciones`).
3. **Apuntes** — CRUD de apuntes propios por materia. Ingesta por **URL** (principal)
   o **texto pegado** (fallback). Indexación RAG (chunks + embedding).
4. **Generación** — elegir materia + tema + indicaciones libres → clase de 7 momentos
   con RAG propio de la materia. Streaming SSE del progreso.
5. **Historial y edición** — la clase se guarda; editar texto por slide, regenerar una
   slide con indicación, reabrir, archivar (>15 días).
6. **Salida** — presentación en navegador (Reveal.js, notas de orador) + PDF vía
   impresión del navegador. **PPTX retirado.**

---

## 6. Contrato pedagógico (7 momentos)

Fuente: skill `utn-class-builder`. La salida de IA SIEMPRE valida contra este contrato:

1. `portada` (slide 1 obligatoria)
2. `hook`
3. `concepto_nucleo`
4. `caso_aplicado`
5. `esquema_proceso`
6. `desafio_aula`
7. `takeaway` (última obligatoria)

Reglas: máx 3-4 puntos por slide, ultra sintéticos; `notasOrador` obligatorias en primera
persona; si sobran slides se profundiza un momento existente (nunca inventar nuevos);
`contenido` con viñetas `• x\n• y`; `plan` trae `duracion`, `objetivos` (3), `estructura` (4 fases).

---

## 7. Ingesta por URL (seguridad)

- Solo `http`/`https`; bloquear localhost, IPs privadas/link-local y redirecciones hacia ellas (anti-SSRF).
- Timeout **10 s**; tope de respuesta **2 MB**; extracción de texto en servidor.
- Páginas que requieren login/JS → error claro en español, ofrecer texto pegado.
- Se guarda el texto indexado + URL de origen. Nunca la página cruda.

**Caps de contenido:**
| Ingesta | Límite |
|---------|--------|
| Respuesta URL | 2 MB |
| Timeout fetch | 10 s |
| Texto pegado | 100.000 caracteres |
| Chunk RAG | ~1.500 caracteres |
| Fragmentos indexados por apunte | máx 50 |

El límite de tokens se gestiona en el prompt, no truncando a ciegas.

---

## 8. RAG (aislamiento y privacidad)

- Busca top-K (inicial K=3) por similitud coseno (`match_apuntes`, vector 3072d).
- **Scope:** `docente_id = docente autenticado` **y** `materia_id = materia seleccionada`.
- El contexto RAG se inyecta al prompt; anti prompt-injection mantenido.

---

## 9. Cuota y costo ($0)

- **Límite diario: 20 generaciones/docente**, leído de env `LIMITE_GENERACIONES_DIA`
  (fallback 20). Reset por cambio de día (`generaciones_dia` + `ultima_gen`).
- Modelos: Gemini primario (`IA_MODEL`), OpenRouter fallback.
- Mensaje en español al agotar cupo. Telemetría en `eventos` (sin PII).

---

## 10. Seguridad (resumen)

- RLS en TODAS las tablas; service key solo server-side.
- `docentes.dni`/`email` nunca en APIs/logs (Ley 25.326).
- Secretos solo en env vars de Vercel; `.env.example` vacío.
- CSP reforzada (`script-src 'self'`, `object-src 'none'`, nosniff).
- Antecedentes de rate-limit login + tope diario.

---

## 11. Cambios sobre el estado actual

| Ítem | Acción |
|------|--------|
| `apuntes` | Agregar `docente_id` (FK `docentes.id`) + cambiar RLS a owner-only + migrar filas existentes |
| `verificar_tope_generacion()` | Leer límite de env/config (fallback 20) |
| `/api/pptx`, `lib/pptx.ts`, `BotonPptx.tsx` | **Retirar** (eliminar) |
| `docs/spec.md` | Archivar (su contenido vive en este spec) |

---

## 12. Invariantes verificables (DoD transversal)

1. Un docente no ve apuntes ajenos (RLS).
2. El RAG nunca recupera contenido de otra materia/docente (test con 2 docentes).
3. Toda salida de IA valida contra el contrato de slide antes de renderizar.
4. `npm run build` OK; slice verificada con `curl` en runtime.
5. Costo $0 sostenido.