# Memory — UTNContenidos Engineering

> **Última actualización:** 2026-09-08  
> Este archivo es la fuente de verdad técnica del proyecto. Solo se agregan entradas, nunca se sobreescriben las anteriores.

---

## 🔴 Correcciones Confirmadas por el Usuario

| Fecha | Corrección |
|-------|------------|
| 2026-08-07 | **`gemini-3.1-flash-lite` ES un modelo válido** de la Gemini API para API Key. El análisis inicial lo marcó como incorrecto — estaba equivocado. El modelo está bien configurado en `api/gemini.js`. |
| 2026-08-07 | **El login tarda 12 segundos reales** en producción. Confirmado por el usuario. Causa raíz auditada en `app.js`. |

---

## 🏛️ Decisiones de Arquitectura Permanentes

### GAS es irremplazable a costo $0 para Google Workspace
**Decisión:** Google Apps Script se mantiene como backend para:
- `exportarAGoogleSlides()` — `SlidesApp.create()` no tiene equivalente gratuito
- `obtenerContextoTema()` — `DocumentApp.openById()` para leer apuntes en Docs
- `obtenerHistorialDocente()` — historial en Sheets

**Razón:** Ningún servicio a costo $0 tiene acceso nativo a Google Slides/Docs/Drive como GAS. Firebase y Supabase no pueden replicar esto.

**Lo que SÍ se puede migrar de GAS:** Autenticación (`validarDocente`) y base de datos de usuarios/materias (Google Sheets → Supabase PostgreSQL).

### Costo total del proyecto: $0 absoluto
**Restricción innegociable.** Toda propuesta debe respetar:
- ✅ Google Apps Script (gratuito)
- ✅ Google Workspace (Drive, Sheets, Docs, Slides — cuenta institucional UTN)
- ✅ Vercel Free Tier (frontend + serverless functions)
- ✅ Gemini API — Free Tier / gemini-3.1-flash-lite (API Key de Google AI Studio)
- ✅ Supabase Free Tier (500MB DB, 50k req/mes) — para migración futura
- ❌ AWS, GCP de pago, Firebase de pago, cualquier servicio con suscripción

### Público objetivo: docentes de 50+ años, UTN FRD
**Restricción de UX innegociable:**
- Letra grande, alto contraste, botones evidentes
- Máximo 2 clics para llegar a "Preparar Clase"
- Feedback visual inmediato en cada acción (loaders, toasts, animaciones)
- Lenguaje simple, en español argentino (vos)
- La plataforma debe ser autosuficiente — sin necesidad de manual

---

## 🐛 Diagnóstico Técnico Confirmado

### Login de 12 segundos — Causa raíz en `app.js`

**Tres culpables en `validarDocente()` (app.js líneas 39–80):**

1. **Cold Start de GAS (~3–6s):**  
   GAS duerme si no recibe requests. El primer login del día activa el cold start.  
   _Solución:_ Trigger de warmup cada 4 minutos (15 min de trabajo, costo $0).

2. **3× `getDataRange().getValues()` en secuencia (~3–6s total):**  
   ```
   sheetDocentes.getDataRange()  → ~1-2s (API call bloqueante a Sheets)
   sheetMaterias.getDataRange()  → ~1-2s
   sheetTemario.getDataRange()   → ~1-2s
   ```
   _Solución:_ `CacheService.getScriptCache()` para cachear el dashboard completo por legajo (TTL: 1 hora).

3. **Join O(n²) en `obtenerMateriasYTemas()` (app.js líneas 101–142):**  
   Loop de Materias × loop de Temario en memoria. Escala mal con 100+ docentes.  
   _Solución futura:_ Migrar a Supabase PostgreSQL con query JOIN indexado.

### Token de sesión — Estado actual CORRECTO
El token usa `Utilities.getUuid()` (UUID v4) guardado en `CacheService` con TTL de 2 horas. Esto **es correcto y seguro** para el contexto actual. No requiere HMAC — el UUID v4 tiene 122 bits de entropía, inforgeable en la práctica.

### RAG sin caché — Confirmado como problema
`obtenerContextoTema()` re-lee el Google Doc completo en cada generación. Con `CacheService` (TTL 6h), el segundo request al mismo Doc baja de 3–5s a ~100ms.

---

## 📁 Mapa de Archivos del Proyecto

| Archivo | Rol | Notas |
|---------|-----|-------|
| `index.html` | SPA — Estructura HTML completa | 4 vistas: login, dashboard, generator, historial |
| `script.js` | SPA Router + lógica frontend | 743 líneas. Fetch a GAS y a Vercel. |
| `style.css` | Estética premium | Glassmorphism, ambient orbs, Inter/Outfit fonts |
| `api/gemini.js` | Vercel Serverless — Proxy Gemini | 132 líneas. Protege la API key. Modelo: gemini-3.1-flash-lite ✅ |
| `app.js` | GAS Backend — 441 líneas | Auth, RAG, Slides, Historial. Desplegado como Web App. |
| `vercel.json` | Config deploy Vercel | ✅ Corregido: `max-age=3600, must-revalidate` (no más immutable) |
| `UTNContenidos.md` | System Instructions del Escuadrón | Define roles, principios, flujo funcional |
| `PLAN_ALPHA_5.md` | Plan de auditoría y roadmap Alpha 0.5 | 4 sprints: Blindaje → Configurador → Fiabilidad → Distribución |
| `DocumentoCronologico.md` | Bitácora institucional (pasantía) | Cronología del sistema, tono formal/explicativo. Se actualiza con cada cambio |
| `diagramas.html` | Diagramas de arquitectura (Mermaid 11) | Actualizado al Sprint A: blindaje + ER + flujo docente + roadmap |
| `AGENTS.md` | Índice rápido del proyecto | Reglas + mapa de archivos + workflow |
| `.opencode/skills/` | 6 skills del proyecto | gas-backend · security-audit · frontend-ux50 · class-builder · token-economy · memory |
| `PLAN_ALPHA_5_SPRINT_B.md` | Plan Sprint B (modelo espiral) | Configurador de Clase: contrato + 4 giros |
| `WALKTHROUGH_FASE2.md` | Migración Microsoft Entra ID | Auth M365 → Graph → PPTXGenJS, manteniendo Google |
| `memory.md` | Este archivo | Fuente de verdad técnica. Solo append. |

### Esquema Relacional Normalizado (DLR / 3NF - Fase 2)

```mermaid
erDiagram
    DOCENTES ||--o{ ASIGNACIONES_DOCENTE : "tiene asignada"
    MATERIAS ||--o{ ASIGNACIONES_DOCENTE : "es asignada a"
    MATERIAS ||--o{ TEMAS : "contiene"
    DOCENTES ||--o{ HISTORIAL_PRESENTACIONES : "genera"
    TEMAS ||--o{ HISTORIAL_PRESENTACIONES : "referencia"

    DOCENTES {
        string legajo PK
        string dni UK
        string nombre
        string email
        string estado
        datetime fecha_alta
    }

    MATERIAS {
        string id_materia PK
        string codigo_plan
        string nombre
        string nivel
        string departamento
        string descripcion
        boolean activa
    }

    ASIGNACIONES_DOCENTE {
        string id_asignacion PK
        string legajo_docente FK
        string id_materia FK
        string rol_cargo
        string comision
        string ciclo_lectivo
        datetime fecha_asignacion
    }

    TEMAS {
        string id_tema PK
        string id_materia FK
        int orden_unidad
        string nombre_tema
        string descripcion
        string url_apunte_rag
        boolean activo
    }

    HISTORIAL_PRESENTACIONES {
        string id_historial PK
        string legajo_docente FK
        string id_tema FK
        string url_slides
        string estado_generacion
        datetime fecha_creacion
    }
```

| Hoja / Tabla | Columnas |
|---|---|
| `Docentes` | A: Legajo · B: DNI · C: Nombre · D: Email · E: Estado · F: Fecha_Alta |
| `Materias` | A: ID_Materia · B: Codigo_Plan · C: Nombre · D: Nivel · E: Departamento · F: Descripcion · G: Activa |
| `Asignaciones_Docente` | A: ID_Asignacion · B: Legajo_Docente · C: ID_Materia · D: Rol_Cargo · E: Comision · F: Ciclo_Lectivo · G: Fecha_Asignacion |
| `Temas` | A: ID_Tema · B: ID_Materia · C: Orden_Unidad · D: Nombre_Tema · E: Descripcion · F: Link_Teoria · G: Activo |
| `Historial_Presentaciones` | A: ID_Historial · B: Legajo_Docente · C: ID_Tema · D: URL_Slides · E: Estado_Generacion · F: Fecha_Creacion |

---

## 📊 Estado Consolidado (panorama rápido)

**Versión en producción:** α0.5.6 · `https://utncontenidos.vercel.app` · repo `github.com/juanmamerodio/UTNContenidos` (main)

| Área | Estado |
|------|--------|
| Sprint A (Blindaje) | ✅ COMPLETO — rate-limit, CSP, LockService, payload caps, anti-injection, debugSheetData gated, Cache-Control |
| Sprint B (Configurador) | ✅ COMPLETO — 4 espirales: contrato → reformular → editar → plantillas |
| QA + Prueba del Hombre | ✅ APROBADO (16/16 tests + prof 65 años) |
| Deploy producción | ✅ En vivo y verificado |
| Sprint C (Fiabilidad UX) | 🔲 Pendiente |
| Sprint D (Distribución) | 🔲 Pendiente (clasp, audit log, checklist deploy) |
| Fase 2 (Auth Microsoft Entra) | 📋 Documentada en `WALKTHROUGH_FASE2.md` |

## 📋 Backlog Técnico Priorizado| Estado | ID | Tarea | Esfuerzo | Sprint |
|--------|----|-------|----------|--------|
| ✅ Completado | T1 | **Warmup Trigger GAS** (función `mantenerCaliente` agregada en `app.js`) | 15 min | S1 |
| ✅ Completado | T2 | **CORS restrictivo** en `api/gemini.js` (dominios autorizados Vercel/Local) | 10 min | S1 |
| ✅ Completado | T3 | **Fix Cache-Control** en `vercel.json` (`max-age=3600, must-revalidate`) | 5 min | S1 |
| ✅ Completado | T4 | **CacheService dashboard** en `validarDocente()` (evita re-lectura bloqueante de Sheets) | 2h | S2 |
| ✅ Completado | T5 | **CacheService RAG** en `obtenerContextoTema()` (lectura instantánea a ~100ms de Google Docs) | 1h | S2 |
| ✅ Completado | T10 | **Reclamar/Gestionar Materias** (Backend `obtenerOfertaAcademica` + `reclamarMaterias`, Modal UI y sincronización de Dashboard) | 2h | S2 |
| ✅ Completado | T6 | **Rediseño de Presentaciones & Prompt de Élite IA v3.0** (7 slides didácticos, notas de orador nativas en Google Slides/PDF y branding UTN) | 2h | S2 |
| ✅ Completado | T11 | **Rediseño Premium Verde UTN (#455656) & UI Multi-Dispositivo** (Mobile-first, stepper didáctico, tablets y accesibilidad 50+) | 3h | S3 |
| ✅ Completado | A-F1→A-F7 | **Sprint A — Blindaje** (rate-limit login, lockout 15min, throttle global, `debugSheetData` gated, payload caps, LockService, anti prompt-injection, parse JSON seguro, CSP, Cache-Control) | ~8h | A |
| ✅ Completado | D1/D2/D3 | **Fix integridad datos** (fecha historial, revalidación DLR, IDs relacionales en export) | ~3h | A |
| 🔲 Pendiente | T7 | **Versionar GAS con clasp** — `gas/app.gs` en el repo | 1h | S3 |
| 🔲 Pendiente | T8 | **Migrar Auth a Supabase** — login ~200ms permanente | 1 semana | S4 |
| 🔲 Pendiente | T9 | **Migrar DB (Sheets) a Supabase PostgreSQL** | 2 semanas | S4 |
| 🔲 Pendiente | B-F1→B-F5 | **Sprint B — Configurador de Clase** (duración, N° slides, estilo, nivel, ejemplos, imágenes, momentos, plantillas) | ~8h | B |
| ✅ Completado | B-E1 | **Sprint B Espiral 1 — Contrato + Configurador UI** (contrato `configuracion` end-to-end, modal configurador con slider/selects/momentos, plantillas localStorage, N slides dinámicas en GAS+Vercel) | ~4h | B |
| ✅ Completado | B-E2 | **Sprint B Espiral 2 — Regeneración quirúrgica de 1 slide** (modal `modal-reformular`, `renderizarSlidesGrid()` reutilizable con botón "Reformular" por card, `regenerarSlideConGeminiGAS` + case `regenerarSlideIA` en GAS, modo `regenerarSlide` con `slideSchema` en Vercel) | ~4h | B |
| ✅ Completado | B-E3 | **Sprint B Espiral 3 — Editor previo a exportar** (modal `modal-editar` con título/subtítulo/contenido/notas, botón "Editar contenido" en toda card, mutación directa de `claseGeneradaActual` → Slides/PDF exportan lo editado) | ~3h | B |
| ✅ Completado | B-E4 | **Sprint B Espiral 4 — Plantillas con nombre + Cierre** (`localStorage.utn_plantillas` objeto nombre→config, selector + guardar/cargar/borrar con try/catch, `refrescarSelectorPlantillas`) | ~3h | B |
| 🔲 Pendiente | C-F4→C-F8 | **Sprint C — Fiabilidad UX** (portada Slides robusta, imágenes con fallback, datos completos dashboard, loaders por etapa) | ~5h | C |
| 🔲 Pendiente | D-F1→D-F4 | **Sprint D — Distribución** (clasp, checklist deploy, audit log Sheets, OAuth Microsoft Entra) | ~4h+ | D |

---

## 🧠 Log de Conversaciones

| Fecha | Evento |
|-------|--------|
| 2026-08-07 | Primera auditoría completa. Leídos: `index.html`, `script.js`, `style.css`, `api/gemini.js`, `app.js`, `vercel.json`, `UTNContenidos.md`, `plan23-06.md`. |
| 2026-08-07 | Usuario corrigió: `gemini-3.1-flash-lite` es válido. Incorporado. |
| 2026-08-07 | Usuario confirmó: login real tarda 12 segundos. Causa raíz identificada en 3 puntos de `app.js`. |
| 2026-08-07 | Decisión de arquitectura: GAS se mantiene para Google Workspace. Se optimiza con CacheService + warmup. |
| 2026-08-07 | Aplicadas mejoras directas en codebase (T1 a T5): CORS en `api/gemini.js`, Cache-Control en `vercel.json`, y `mantenerCaliente` + `CacheService` (dashboard/RAG) en `app.js`. |
| 2026-08-07 | Aprobado e implementado el Plan Maestro de Reclamación de Materias (T10): Endpoints en `app.js`, UI Modal en `index.html` y script controlador en `script.js`. |
| 2026-08-14 | **Inicio de Fase 2:** Rediseño DLR normalizado en 3NF con tabla de unión `Asignaciones_Docente` y desacople total de temas de cátedra. Guardado en memoria y activado en backend. |
| 2026-08-14 | **Transformación Pedagógica IA (T6):** Prompt de élite universitaria UTN (7 momentos didácticos), notas de orador automáticas en Google Slides (`getNotesPage()`), vista previa enriquecida y PDF descargable con guía docente. |
| 2026-08-14 | **Fix UI & Backend:** Se garantizó que siempre aparezca el botón "Preparar Clase" aunque una materia no tenga temas aún cargados en `Temario` (tema comodín automático). |
| 2026-08-14 | **Arquitectura Híbrida Gemini (Fix HTTP 405):** Se incorporó `generarClaseConGeminiGAS` en `app.js` y fallback transparente en `script.js` para permitir la generación tanto en Vercel como en entornos locales/GAS directo. |
| 2026-08-18 | **Optimización Extrema de Tokens & Motor Visual Slides v3.5:** Implementación de `systemInstruction` + `responseSchema` (Structured Outputs) en `api/gemini.js` y `app.js` (>60% ahorro de tokens y garantía estricta de 7 slides). Rediseño total de `exportarAGoogleSlides` en `app.js` con maquetación de tarjetas (Cards), tipografía `Montserrat`/`Open Sans`, paleta institucional UTN FRD e inserción automática de imágenes HD. |
| 2026-09-01 | **Rediseño Premium Institucional Verde Opaco UTN (`#455656`) & Engine Multi-Dispositivo (T11):** Transición cromática de alta jerarquía a la paleta oficial Verde UTN (`#455656`), `style.css` 100% responsive con breakpoints para smartphones (<640px), notebooks/tablets (641px-1024px) y pantallas grandes (>1024px). Incorporación de stepper didáctico de 3 pasos para docentes 50+, tablas adaptativas de timeline pedagógica, botones táctiles accesibles (≥48px) y PDF institucional estilizado. |
| 2026-09-08 | **Auditoría Profesional Alpha 0.5 (PLAN_ALPHA_5.md):** Auditoría completa de los 11 archivos. Se detectaron 4 riesgos críticos de seguridad (rate-limit ausente en login, `debugSheetData` expuesto, `doPost` sin auth de origen, auth débil legajo+DNI) y 6 fallas de integridad (historial muestra "EXITOSO" como fecha, `revalidarSesionConDashboard` ignora el modelo DLR, nombre de materia guardado como `id_materia`, truncado RAG inconsistente 15k vs 50k, Cache-Control `immutable` en `vercel.json` sin coincidir con memory.md, portada de Slides no robusta). Se definió el roadmap de 4 sprints (Blindaje → Configurador → Fiabilidad → Distribución) y el **Configurador de Clase** (duración, N° de slides, estilo visual, nivel, ejemplos, imágenes, momentos, temas extra, URL override, plantillas). |
| 2026-09-08 | **Bug confirmado D1:** En `obtenerHistorialDocente`, el índice de fecha es `5` pero la columna real `estado_generacion` está en `5` y `Fecha_Creacion` en `6`. El historial muestra "EXITOSO" como fecha y el sort queda NaN. Fix planificado en C-F1. |
| 2026-09-08 | **Decisión de arquitectura:** Auth institucional final = Google OAuth con cuentas Workspace de la UTN (costo $0, elimina legajo+DNI). Legajo+DNI se mantiene como fallback transicional solo con rate-limit + lockout. |
| 2026-09-08 | **Decisión de despliegue (pendiente de verificación humano):** Web App de GAS debe ejecutarse como *Usuario que accede* para que los Slides se creen en el Drive del docente. Si quedó como "Ejecutar como: Yo", los Slides caen en el Drive del dueño del script. Requiere compartir la planilla con los docentes. |
| 2026-09-08 | **Sprint A — Blindaje IMPLEMENTADO (α0.5.1):** Rate-limit + lockout 15min + throttle global en `validarDocente`; `debugSheetData` gated por `ALLOW_DEBUG`; payload cap 500KB + max 30 slides; `LockService` en `reclamarMaterias`; anti prompt-injection del RAG (GAS + Vercel); `extraerJsonPuro()` para parse tolerante; truncado RAG unificado a 15k; CSP en `index.html`; Cache-Control `must-revalidate` en `vercel.json`. |
| 2026-09-08 | **Fix integridad datos (D1/D2/D3):** Fecha del historial ahora lee columna G (índice 6) y agrega `estadoGeneracion`; `revalidarSesionConDashboard` usa `obtenerMateriasYTemasRelacional` (consistente con login); export guarda `materiaId` real vía `data-materia-id` + `contextoClaseActual`; sanitización `sanitizeURL()` en historial (A5). |
| 2026-09-08 | **Decisión de arquitectura:** Auth institucional final = **Microsoft Entra ID** (UTN tiene convenio Microsoft, no Google). Legajo+DNI con rate-limit queda como fallback transicional. Gemini se mantiene SIEMPRE (key independiente de Google Workspace). Generación a Microsoft (Graph + PPTXGenJS) = fase futura opcional. |
| 2026-09-08 | **Mantenimiento:** `plan23-06.md` eliminado (completado). Se creó `DocumentoCronologico.md` (bitácora institucional de pasantía, tono formal). `diagramas.html` regenerado con Mermaid 11 (arquitectura Sprint A, ER, secuencia docente, roadmap). |
| 2026-09-08 | **Skills del proyecto (recomendadas, pendientes de creación):** `AGENTS.md` (índice 40 líneas), `utn-gas-backend`, `utn-security-audit`, `utn-frontend-ux50`, `utn-class-builder` (Sprint B), `utn-token-economy`, `utn-memory`. Instalación en `.opencode/skills/`. |
| 2026-09-08 | **Skills CREADAS (`.opencode/skills/`):** `utn-gas-backend`, `utn-security-audit`, `utn-frontend-ux50`, `utn-class-builder`, `utn-token-economy`, `utn-memory` + `AGENTS.md` raíz como índice de 40 líneas. |
| 2026-09-08 | **Sprint B — Espiral 1 IMPLEMENTADO (α0.5.2):** Contrato `configuracion` end-to-end (duracion, numSlides, estilo, nivel, ejemplos, imagenes, urlTeoria, temasAdicionales, momentos, instrucciones). Modal `modal-contexto` reescrito como **Configurador de Clase** (slider 5-20 slides, selects, checkboxes de momentos, plantillas en `localStorage.utn_template_clase`). `generarClaseConGeminiGAS(..., configuracion)` y `api/gemini.js` generan **N slides dinámicas** con los momentos solicitados. Ver `PLAN_ALPHA_5_SPRINT_B.md` (modelo espiral, 4 giros). |
| 2026-09-08 | **Ecosistema Microsoft (WALKTHROUGH_FASE2.md):** UTN tiene M365 → migración por capas manteniendo Google: 1) Auth = Microsoft Entra ID (Fase 2 Beta), 2) Datos = Excel/SharePoint vía Graph (opcional), 3) Generación = PPTXGenJS + OneDrive (opcional). Gemini se mantiene SIEMPRE (key independiente de Workspace). Costo $0 intacto. |
| 2026-09-08 | **Sprint B — Espiral 2 IMPLEMENTADO (α0.5.3):** Regeneración quirúrgica de una diapositiva. Botón "🔄 Reformular esta diapositiva" en cada card (salvo portada) → modal `modal-reformular` → llamada híbrida Vercel (`modo=regenerarSlide` + `slideSchema`) con fallback GAS (`regenerarSlideIA`) → reemplazo por índice sin tocar el resto. Se extrajo `renderizarSlidesGrid()` para re-render parcial. Sintaxis verificada en los 3 archivos. |
| 2026-09-08 | **Sprint B — Espiral 3 IMPLEMENTADO (α0.5.4):** Editor previo a exportar. Botón "✏️ Editar contenido" en cada tarjeta (incluida portada) → modal `modal-editar` (título, subtítulo, contenido por línea, notas orador) con `maxlength` → muta `claseGeneradaActual.slides[i]` directamente → Slides y PDF exportan lo editado sin pasar por la IA. Sanitización al renderizar (`sanitizeHTML`) y caps de longitud client-side. |
| 2026-09-08 | **Sprint B — Espiral 4 IMPLEMENTADO (α0.5.5) — SPRINT B COMPLETO:** Plantillas con nombre en `localStorage.utn_plantillas` (objeto nombre→config), selector + campo de nombre + guardar/cargar/borrar con try/catch y `refrescarSelectorPlantillas`. Cierre del flujo completo: configurar → generar → reformular → editar → exportar en ≤6 clics. |
| 2026-09-08 | **QA Sprint B + Prueba del Hombre (α0.5.6):** QA técnico automatizado 16/16 PASS (contrato configuracion, caps slides 5-20, plantillas con nombre, parseo tolerante, sanitización URLs). Prueba simulada con docente de matemáticas de 65 años: APROBADO. Quick wins aplicados: slider de slides con número grande prominente + micro-ayudas (`title`) en selects del configurador. |
| 2026-09-08 | **DEPLOY a producción BLOQUEADO por credenciales:** Vercel CLI 50.39.0 instalado pero el token no es válido. Requiere `vercel login` manual del usuario (interactivo) antes de `vercel --prod`. Repo no es git (no hay `.git`). |
| 2026-09-15 | **DEPLOY A PRODUCCIÓN REALIZADO (α0.5.6):** Repo conectado a `https://github.com/juanmamerodio/UTNContenidos` (rama `main`). Push de todo el Sprint A+B + QA. **Incidente resuelto:** el `git merge -X theirs` pisó el working tree con la versión vieja del remoto (fast-forward) → se restauró desde `5d1de48` y se re-deployó. **Lección:** con `--allow-unrelated-histories` no usar `-X theirs`; restaurar con `git checkout <commit> -- .` y commit limpio. Producción `https://utncontenidos.vercel.app` verificado: CSP, configurador, modal-editar y reformular OK. Verificación por archivo descargado (no por pipe de curl en PowerShell, que corta el body a 577 chars). |
| 2026-09-15 | **CAUSA RAIZ del error de deploy (aclaración):** NO fue sincronización Vercel↔GitHub. Fue `git merge --allow-unrelated-histories -X theirs` que, al ser historias distintas, marcó cada archivo como conflicto y tomó la versión del remoto (vieja), pisando el working tree local. Vercel solo LEE de GitHub y auto-deploya; no "copia" nada al revés. La restauración correcta fue `git checkout <mi_commit> -- .` + commit limpio + `vercel --prod`. |

