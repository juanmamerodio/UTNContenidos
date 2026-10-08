# Tickets — MVP UTNContenidos (slices verticales)

> Fuente: `docs/specs/001-mvp/spec.md`. Orden de ejecución = orden de la lista (cada
> slice deja una vertical funcionando de punta a punta). DoD transversal de cada ticket:
> `npm run build` OK + slice ejercitada con `curl` (evidencia en `memory.md`).

---

## T1 — Schema: apuntes privados por docente

**Spec refs:** §1, §8, §11
**Skill owner:** `utn-db-supabase`

- [x] `supabase/patch_mvp.sql`: agregar `docente_id uuid references docentes(id) on delete cascade` a `apuntes` + índice `(docente_id, materia_id)`.
- [x] Migrar filas existentes (asignación por materia → docente actual; si hay N docentes por materia, duplicar a cada uno o mapear por `asignaciones`).
- [x] Reemplazar RLS `apuntes_sel` (hoy `auth.role()='authenticated'`, abierta) por owner-only: `docente_id = (select id from docentes where auth_uid = auth.uid())`.
- [x] Actualizar `verificar_tope_generacion()` para leer `LIMITE_GENERACIONES_DIA` (fallback 20) — vía parámetro/GET de config, no hardcode.
- [x] Actualizar `scripts/seed_apuntes.mjs` para setear `docente_id`.
- [x] Test: con 2 docentes, SELECT de apuntes devuelve solo los propios (RLS).
- **DoD:** schema aplicado en Supabase, RLS verificado, seed idempotente.

---

## T3 — Auth slice (vertical) ✅ (verificado)

**Spec refs:** §4, §5.1
**Skill owner:** `utn-security-audit` + `utn-db-supabase`

- [x] Revisar/endurecer `app/actions.ts` `loginRoot`: mantener lockout 5/15min, mensajes en español, redirects correctos.
- [x] Asegurar que `lib/auth.ts` `getDocenteSesion()` no exponga `dni`/`email` a clientes (solo lo necesario).
- [x] Logout: limpiar cookie `utn_sesion` + `getUser` revocado.
- [x] Prueba E2E `curl -i` de login/logout contra runtime.
- **DoD:** login OK, fallo ×5 bloquea, logout limpia cookie, sin PII en respuestas.

---

## T4 — Materias slice (dashboard) ✅ (verificado)

**Spec refs:** §5.2
**Skill owner:** `utn-frontend-ux50` + `utn-db-supabase`

- [x] `app/datos.ts` `getDashboard`: materias asignadas vía `asignaciones` con RLS (ya existe; verificar).
- [x] UI dashboard (Material 4 + iOS 27, accesible 50+): tarjetas de materia, botón "Preparar Clase" siempre visible.
- [x] Vista de apuntes por materia (entrar desde la materia).
- **DoD:** dashboard muestra SOLO las materias del docente logueado; 2 clics hasta "Preparar Clase".

---

## T5 — Apuntes slice (CRUD + ingesta por URL) ✅ (verificado)

**Spec refs:** §5.3, §7
**Skill owner:** `utn-ia-engine` (extracción) + `utn-db-supabase`

- [x] Server action/route `agregarApunte(materia_id, { url | texto })`:
  - URL: fetch server-side con timeout 10s, tope 2MB, anti-SSRF (bloquear localhost/privadas/link-local + redirects hacia ellas).
  - Texto pegado: cap 100.000 chars.
  - Extraer texto (si falla/requiere JS → error en español ofreciendo texto pegado).
- [x] Chunking ~1.500 chars, máx 50 fragmentos/apunte; embeddings `gemini-embedding-2` (3072d); guardar chunks en `apuntes`.
- [x] UI: listar/borrar apuntes propios de la materia (RLS owner-only).
- **DoD:** apunte por URL indexado y buscable; URL maliciosa bloqueada; texto pegado guardado.

---

## T6 — Generación slice (RAG + 7 momentos + streaming)

**Spec refs:** §5.4, §6, §8, §9
**Skill owner:** `utn-ia-engine` + `utn-class-builder`

- [x] `app/api/ia/route.ts`: exigir sesión (`getDocenteSesion`), verificar tope diario 20 (env), RAG top-3 **solo** apuntes propios de la materia seleccionada.
- [x] Prompt élite con contrato de 7 momentos + reglas de calidad (`utn-class-builder`); validar salida contra schema de slide antes de responder.
- [x] Enforcement de N slides (retry correctivo 1x); fallback Gemini → OpenRouter; `modeloUsado` en respuesta/log.
- [x] Streaming SSE (`?stream=1`): eventos `progreso`/`chunk`/`done`/`error`.
- [x] UI generador: configurador (duración, N slides 5-20, estilo, nivel, momentos) + vista previa en vivo del stream.
- **DoD:** clase de 7 momentos generada con RAG propio < 15 s; 401 sin sesión; cupo agotado da mensaje en español.

---

## T7 — Historial y edición slice ✅

**Spec refs:** §5.5
**Skill owner:** `utn-frontend-ux50` + `utn-class-builder`

- [x] `app/datos.ts`: `guardarPresentacion` debe retornar ID; agregar `actualizarPresentacion` y `borrarPresentacion`.
- [x] Guardar clase en BD automáticamente al finalizar generación y **redirigir** a `/historial/[id]`.
- [x] Ruta `/historial`: lista de tarjetas dividida en Recientes (≤ 15 días) y Antiguas (> 15 días). Sin carpetas. Botón eliminar (derecho a supresión).
- [x] Ruta `/historial/[id]`: reutiliza `VisorResultado`. Permite edición de texto y regeneración de slide, con **botón "Guardar Cambios"** explícito.
- **DoD:** la generación redirige; editar/regenerar y guardar muta la clase; historial persiste y separa por fecha; eliminar borra.

---

## T8 — Salida slice (deck + PDF) ✅

**Spec refs:** §5.6, §6
**Skill owner:** `utn-frontend-ux50` + `utn-class-builder`

- [x] `lib/deck.ts` (existe): render Reveal.js de las slides en orden pedagógico, notas de orador, tema UTN por estilo.
- [x] Página de presentación en navegador + botón "Descargar HTML" (autocontenido) + PDF vía impresión.
- [x] Verificar que la salida valida contra el contrato de slide (invariante #3).
- **DoD:** profesor descarga HTML autocontenido y lo abre en cualquier navegador; PDF imprimible.

---

## T9 — QA + blindaje transversal

**Spec refs:** §10, §12
**Skill owner:** `utn-security-audit` + `utn-qa`

- [x] RLS en todas las tablas verificadas (2 docentes aislados).
- [x] Sin PII en APIs/logs (revisar `getDocenteSesion`, logs de `api/ia`).
- [x] CSP reforzada OK; secretos solo env vars.
- [x] QA del flujo completo como docente 50+ (≤6 clics, letra grande, feedback visual).
- [x] `npm run build` + suite Vitest verde.
- **DoD:** checklist `utn-security-audit` 100% verde + QA humano aprobado.
