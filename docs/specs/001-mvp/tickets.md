# Tickets — MVP UTNContenidos (slices verticales)

> Fuente: `docs/specs/001-mvp/spec.md`. Orden de ejecución = orden de la lista (cada
> slice deja una vertical funcionando de punta a punta). DoD transversal de cada ticket:
> `npm run build` OK + slice ejercitada con `curl` (evidencia en `memory.md`).

---

## T1 — Schema: apuntes privados por docente

**Spec refs:** §1, §8, §11
**Skill owner:** `utn-db-supabase`

- [ ] `supabase/patch_mvp.sql`: agregar `docente_id uuid references docentes(id) on delete cascade` a `apuntes` + índice `(docente_id, materia_id)`.
- [ ] Migrar filas existentes (asignación por materia → docente actual; si hay N docentes por materia, duplicar a cada uno o mapear por `asignaciones`).
- [ ] Reemplazar RLS `apuntes_sel` (hoy `auth.role()='authenticated'`, abierta) por owner-only: `docente_id = (select id from docentes where auth_uid = auth.uid())`.
- [ ] Actualizar `verificar_tope_generacion()` para leer `LIMITE_GENERACIONES_DIA` (fallback 20) — vía parámetro/GET de config, no hardcode.
- [ ] Actualizar `scripts/seed_apuntes.mjs` para setear `docente_id`.
- [ ] Test: con 2 docentes, SELECT de apuntes devuelve solo los propios (RLS).
- **DoD:** schema aplicado en Supabase, RLS verificado, seed idempotente.

---

## T2 — Retirar PPTX

**Spec refs:** §5, §11
**Skill owner:** `utn-frontend-ux50` + arquitecto

- [ ] Eliminar `app/api/pptx/route.ts`, `lib/pptx.ts`, `app/generar/BotonPptx.tsx`.
- [ ] Quitar la dependencia `pptxgenjs` de `package.json`.
- [ ] Quitar el botón/import de PPTX de la UI del generador.
- [ ] Verificar build sin referencias rotas (`rg -i pptx`).
- **DoD:** `rg pptx` sin resultados en `app/`, `lib/`, `components/`.

---

## T3 — Auth slice (vertical)

**Spec refs:** §4, §5.1
**Skill owner:** `utn-security-audit` + `utn-db-supabase`

- [ ] Revisar/endurecer `app/actions.ts` `loginRoot`: mantener lockout 5/15min, mensajes en español, redirects correctos.
- [ ] Asegurar que `lib/auth.ts` `getDocenteSesion()` no exponga `dni`/`email` a clientes (solo lo necesario).
- [ ] Logout: limpiar cookie `utn_sesion` + `getUser` revocado.
- [ ] Prueba E2E `curl -i` de login/logout contra runtime.
- **DoD:** login OK, fallo ×5 bloquea, logout limpia cookie, sin PII en respuestas.

---

## T4 — Materias slice (dashboard)

**Spec refs:** §5.2
**Skill owner:** `utn-frontend-ux50` + `utn-db-supabase`

- [ ] `app/datos.ts` `getDashboard`: materias asignadas vía `asignaciones` con RLS (ya existe; verificar).
- [ ] UI dashboard (Material 4 + iOS 27, accesible 50+): tarjetas de materia, botón "Preparar Clase" siempre visible.
- [ ] Vista de apuntes por materia (entrar desde la materia).
- **DoD:** dashboard muestra SOLO las materias del docente logueado; 2 clics hasta "Preparar Clase".

---

## T5 — Apuntes slice (CRUD + ingesta por URL)

**Spec refs:** §5.3, §7
**Skill owner:** `utn-ia-engine` (extracción) + `utn-db-supabase`

- [ ] Server action/route `agregarApunte(materia_id, { url | texto })`:
  - URL: fetch server-side con timeout 10s, tope 2MB, anti-SSRF (bloquear localhost/privadas/link-local + redirects hacia ellas).
  - Texto pegado: cap 100.000 chars.
  - Extraer texto (si falla/requiere JS → error en español ofreciendo texto pegado).
- [ ] Chunking ~1.500 chars, máx 50 fragmentos/apunte; embeddings `gemini-embedding-2` (3072d); guardar chunks en `apuntes`.
- [ ] UI: listar/borrar apuntes propios de la materia (RLS owner-only).
- **DoD:** apunte por URL indexado y buscable; URL maliciosa bloqueada; texto pegado guardado.

---

## T6 — Generación slice (RAG + 7 momentos + streaming)

**Spec refs:** §5.4, §6, §8, §9
**Skill owner:** `utn-ia-engine` + `utn-class-builder`

- [ ] `app/api/ia/route.ts`: exigir sesión (`getDocenteSesion`), verificar tope diario 20 (env), RAG top-3 **solo** apuntes propios de la materia seleccionada.
- [ ] Prompt élite con contrato de 7 momentos + reglas de calidad (`utn-class-builder`); validar salida contra schema de slide antes de responder.
- [ ] Enforcement de N slides (retry correctivo 1x); fallback Gemini → OpenRouter; `modeloUsado` en respuesta/log.
- [ ] Streaming SSE (`?stream=1`): eventos `progreso`/`chunk`/`done`/`error`.
- [ ] UI generador: configurador (duración, N slides 5-20, estilo, nivel, momentos) + vista previa en vivo del stream.
- **DoD:** clase de 7 momentos generada con RAG propio < 15 s; 401 sin sesión; cupo agotado da mensaje en español.

---

## T7 — Historial y edición slice

**Spec refs:** §5.5
**Skill owner:** `utn-frontend-ux50` + `utn-class-builder`

- [ ] Guardar clase generada en `presentaciones` (contenido + config) al finalizar generación.
- [ ] Historial: lista con distintivo (reciente/usado/archivado >15 días), reabrir, "Agregar a carpeta", eliminar (derecho de supresión — Ley 25.326).
- [ ] Editar texto de una slide (`ModalEditarSlide`) + regenerar una slide con indicación (`ModalReformular`).
- **DoD:** editar/regenerar muta la clase; historial persiste; eliminar borra.

---

## T8 — Salida slice (deck + PDF)

**Spec refs:** §5.6, §6
**Skill owner:** `utn-frontend-ux50` + `utn-class-builder`

- [ ] `lib/deck.ts` (existe): render Reveal.js de las slides en orden pedagógico, notas de orador, tema UTN por estilo.
- [ ] Página de presentación en navegador + botón "Descargar HTML" (autocontenido) + PDF vía impresión.
- [ ] Verificar que la salida valida contra el contrato de slide (invariante #3).
- **DoD:** profesor descarga HTML autocontenido y lo abre en cualquier navegador; PDF imprimible.

---

## T9 — QA + blindaje transversal

**Spec refs:** §10, §12
**Skill owner:** `utn-security-audit` + `utn-qa`

- [ ] RLS en todas las tablas verificadas (2 docentes aislados).
- [ ] Sin PII en APIs/logs (revisar `getDocenteSesion`, logs de `api/ia`).
- [ ] CSP reforzada OK; secretos solo env vars.
- [ ] QA del flujo completo como docente 50+ (≤6 clics, letra grande, feedback visual).
- [ ] `npm run build` + suite Vitest verde.
- **DoD:** checklist `utn-security-audit` 100% verde + QA humano aprobado.