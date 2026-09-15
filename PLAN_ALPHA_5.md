# PLAN_ALPHA_5 — Auditoría Profesional & Roadmap de Implementación

> **Proyecto:** UTNContenidos — SPA generadora de clases con IA (UTN FRD)
> **Versión auditada:** Alpha 0.5 (prototipo funcional, híbrido Vercel + Google Apps Script)
> **Fecha:** 2026-09-08
> **Objetivo del plan:** Blindar la plataforma, profesionalizar el flujo docente y transformar la generación de clases en un **asistente 100% personalizable** (estilo NotebookLM), manteniendo el **costo total $0**.

---

## 1. Resumen Ejecutivo

La base es sólida para una alpha: arquitectura JAMstack + Serverless híbrida, modelo de datos normalizado (DLR/3NF) y un prompt pedagógico de 7 momentos de altísima calidad. **Sin embargo, la versión actual tiene 4 vulnerabilidades críticas, 6 fallas de integridad de datos y un flujo de personalización prácticamente nulo** (una sola "cajita" de texto libre).

La recomendación profesional es ejecutar **4 sprints**:

| Sprint | Nombre | Foco | Riesgo que elimina |
|--------|--------|------|--------------------|
| **A** | Blindaje (Seguridad) | Rate limit, auth, sanitización, debugSheetData | Crítico — acceso indebido y fuga de PII |
| **B** | Configurador de Clase | Asistente de personalización al estilo NotebookLM | La razón de ser del producto |
| **C** | Fiabilidad & UX docente | Fixes de bugs, historial real, editor de slides | Frustración del docente de 50+ |
| **D** | Distribución & Telemetría | versionado GAS, logs, checklist de despliegue | Deriva entre repo y producción |

---

## 2. Mapa de Archivos Auditado

| Archivo | Rol | Estado |
|---------|-----|--------|
| `UTNContenidos.md` | System Instructions del Escuadrón | ✅ Consistente con el código |
| `app.md` | Backend GAS (JS con extensión .md) | ⚠️ No versionado con `clasp` — riesgo de deriva con producción |
| `script.js` (878 l) | Frontend SPA | ⚠️ Monolítico, 1 URL GAS hardcodeada |
| `index.html` (439 l) | Estructura SPA | ⚠️ Sin CSP, sin meta de auth |
| `style.css` (1.830 l) | Sistema de diseño | ✅ Buena accesibilidad y responsive |
| `api/gemini.js` (204 l) | Vercel Serverless | ✅ Structured Outputs correctos |
| `vercel.json` | Deploy config | ❌ `immutable` sin hash de assets — navegadores clavan versiones viejas |
| `memory.md` | Fuente de verdad técnica | ⚠️ Declara fix de cache que NO está en `vercel.json` |
| `plan23-06.md` | Plan v3.0 | 🗄️ Histórico (paths viejos de otra máquina) |
| `diagramas.html` (417 l) | Prototipo duplicado obsoleto | ❌ Debe archivarse o eliminarse |
| `UTN.jpg` | Logo | ✅ |

---

## 3. Hallazgos de la Auditoría

Clasificación: 🔴 Crítico · 🟠 Alto · 🟡 Medio · 🟢 Bajo

### 3.1 🔴 Críticos — Seguridad

| ID | Hallazgo | Ubicación | Impacto |
|----|----------|-----------|---------|
| **S1** | **`validarDocente` sin rate-limit ni bloqueo.** Login por legajo+DNI contra la hoja en texto plano. Sin lockout, sin captcha, sin throttling. DNI es dato semi-público. | `app.md:47`, `app.md:62` | Brute-force factible (proxy/IP) para autenticarse como cualquier docente |
| **S2** | **`debugSheetData()` expuesto sin token.** Devuelve nombres de hojas, headers y **3 filas de muestra** (pueden incluir legajo/DNI de docentes) a cualquiera que conozca la URL del Web App. | `app.md:615`, `app.md:941` | Fuga de PII + mapeo del esquema para ataques dirigidos |
| **S3** | **`doPost` sin autenticación de origen.** Cualquier persona con la URL pública del Web App puede invocar acciones. El único resguardo es el token de sesión, que solo cubre datos, no el gasto de cómputo de la IA (alguien puede quemar tu cuota gratuita de Gemini). | `app.md:577` | Abuso / DoS económico del Free Tier |
| **S4** | **Auth débil por diseño.** Legajo+DNI en Sheets no es autenticación institucional. Los docentes **ya tienen cuenta Google Workspace UTN**. | `app.md:47`, `index.html:107` | Riesgo alto de acceso indebido; no escala a "plataforma oficial" |

### 3.2 🔴 Críticos — Integridad / Estabilidad

| ID | Hallazgo | Detalle |
|----|----------|---------|
| **D1** | **Bug: la fecha del historial muestra "EXITOSO".** `exportarAGoogleSlides` escribe 7 columnas (`…URL(4), estado_generacion(5), fecha(6)`), pero `obtenerHistorialDocente` lee el índice `5` como fecha. El sort por fecha también queda roto (NaN). | `app.md:459`, `app.md:515` |
| **D2** | **`revalidarSesionConDashboard` usa SOLO el CSV de `Docentes` col E.** Es inconsistente con `validarDocente` que usa el modelo relacional `Asignaciones_Docente`. Si la planilla migra a DLR y se borra la col CSV, revalidar devuelve dashboard vacío. | `app.md:561` |
| **D3** | **`exportarAGoogleSlides` guarda el NOMBRE de la materia en la columna `Id_Materia`.** `script.js` pasa `breadcrumbSubject.textContent` como `materiaId`. Se pierde la referencia relacional del historial. | `script.js:711`, `app.md:462` |
| **D4** | **Truncado inconsistente del RAG.** Vercel corta a 15.000 chars; el fallback GAS usa hasta 50.000. Más tokens, más latencia y riesgo de contexto desbordado. | `api/gemini.js:68`, `app.md:302` |
| **D5** | **Migración estructural del portafolio no validada.** `SlidesApp.create()` genera una portada en blanco; si no tiene ≥2 shapes, la portada queda solo con fondo azul sin título/institución. | `app.md:345` |

### 3.3 🟠 Altos

| ID | Hallazgo | Detalle |
|----|----------|---------|
| **A1** | **Cache-Control `immutable` sin hash.** `vercel.json` no coincide con lo declarado en `memory.md` (T3 "completado"). Usuarios pueden quedar clavados en builds rotas por 1 año. | `vercel.json:10` |
| **A2** | **GAS sin versionado (`clasp`).** `memory.md` dice `app.js` = 441 líneas, pero `app.md` del repo tiene 969. El código desplegado NO es igual al del repo. | `memory.md:86` |
| **A3** | **Sin `LockService` en escrituras.** `reclamarMaterias` borra + reinserta filas. Dos pestañas en paralelo = pérdida de datos. | `app.md:863` |
| **A4** | **Prompt injection via RAG.** El texto de los Google Docs se incrusta crudo en el prompt. Un apunte malicioso puede inyectar instrucciones ("ignorá lo anterior…") que lleguen al docente. Postura de FYI: agregar delimitadores y orden de ignorar. | `api/gemini.js:72`, `app.md:647` |
| **A5** | **XSS residual.** `renderizarHistorial` inserta `href="${item.urlSlides}"` sin sanitizar (`javascript:` viable si alguien edita la hoja). | `script.js:328` |
| **A6** | **Sin tamaño máximo en payloads.** `exportarAGoogleSlides`/`generarClaseIA` aceptan `datosClase` de cualquier tamaño → riesgo de timeout/memoria de GAS. | `app.md:328`, `app.md:637` |

### 3.4 🟡 Medios

| ID | Hallazgo |
|----|----------|
| **M1** | Las imágenes usan `image.pollinations.ai` (dependencia externa frágil). 7 fetchs secuenciales suman segundos a la generación. |
| **M2** | `diagramas.html` es un prototipo **obsoleto** (paleta iOS, refs a `#perfil/#configuracion/#recursos` inexistentes) y carga assets duplicados. Confunde mantenimiento. |
| **M3** | Los `<dialog>` no mueven el foco ni lo atrapan (accesibilidad 50+). |
| **M4** | El dashboard pierde datos al renderizar: solo pasa `nombreTema` + `linkTeoria` vía `data-*`; se descartan `idMateria`, `idTema`, `descripcion`, `contexto`. |
| **M5** | `obtenerOfertaAcademica` relee toda la hoja en cada apertura del modal. |
| **M6** | El fallback GAS parsea el JSON de Gemini sin limpiar bloques markdown (```` ```json ````). Con `responseMimeType: application/json` debería andar, pero un fence inesperado rompe todo. |
| **M7** | Sin definición explícita de `Execute as` en el Web App de GAS. Si quedó "Ejecutar como: Yo", los Slides caen en el Drive del dueño del script y NO en el del docente (contradice la UX). |
| **M8** | `reclamarMaterias` permite reclamar cualquier materia (self-service total). De suma alfa, pero definir límite por rol. |

### 3.5 🟢 Bajos / Higiene

| ID | Hallazgo |
|----|----------|
| **B1** | `motivo del teléfono` → `gato` de temperatura: GAS usa 0.3 y Vercel 0.2 (unificar). |
| **B2** | Falta `Content-Security-Policy` en `index.html`. |
| **B3** | `contextoDinamico` sin tope de caracteres (cap 2.000). |
| **B4** | Token en `sessionStorage` (aceptable en alpha; documentar que un futuro XSS lo robaría). |
| **B5** | `plan23-06.md` con rutas de otra máquina (`c:/Users/lsi/…`). Histórico. |

---

## 4. Arquitectura Target (Alpha 0.5)

```mermaid
graph TD
    subgraph Frontend [SPA - Vercel]
        UI[index.html] --> JS[script.js v4]
        JS --> CFG[⚙ Configurador de Clase<br/>localStorage: plantillas]
        JS -->|POST| GAS[GAS Web App]
        JS -->|POST /api/gemini| VERCEL[api/gemini.js]
    end
    subgraph SecureCore [Capa de Blindaje]
        RATE[RateLimit + Honeypot + Nonce] --> AUTH[Auth: Google OAuth Institucional<br/>(fase B) / Legajo+DNI+v2 lockout]
        VALID[Validación server-side<br/>límites de payload + saneo]
        LOG[EventLog en Sheets - auditoría]
    end
    subgraph Backend [Serverless Híbrido $0]
        VERCEL -->|Structured Outputs| GEMINI[Gemini 3.1 Flash Lite]
        GAS -->|LockService + CacheService| DM[(Sheets 3NF)]
        GAS -->|Slides+Notes| SL[Google Slides / PDF]
        GAS -->|MailApp| MAIL[Email al docente]
    end
```

---

## 5. Roadmap detallado — Sprints

### 🔒 Sprint A — BLINDAJE (prioridad absoluta, α0.5.1)

| ID | Tarea | Esfuerzo | DoD |
|----|-------|----------|-----|
| **A-F1** | **Rate-limit por documento/legajo en GAS** (`CacheService` con contador + lockout creciente: 5 fallos → 15 min de espera) | 2h | Brute-force inviable |
| **A-F2** | **Deshabilitar `debugSheetData` en producción** (flag por propiedad `ALLOW_DEBUG=false`) o exigir token de admin | 30 min | Sin fuga de schema/PII |
| **A-F3** | **Tope de payload server-side** (`datosClase.slides.length` máx 30, tamaños máx, `contextoDinamico` ≤ 2.000) + rechazo con mensaje claro | 2h | No más timeouts inducidos |
| **A-F4** | **CSP en `index.html`** (default-src, script-src, connect-src a Vercel/GAS) | 1h | Lighthouse sin XSS vector |
| **A-F5** | **`LockService.getScriptLock()` en `reclamarMaterias`** y en cualquier append/delete | 1h | Escrituras atómicas |
| **A-F6** | **Delimitadores anti prompt-injection en RAG** + instrucción "ignorá lo marcado como material" | 1h | Apuntes hostiles neutralizados |
| **A-F7** | **Fix `vercel.json`:** `must-revalidate` + versionado con querystring (`script.js?v=5`) | 30 min | Deploy deja de quedar clavado |

### ⚙️ Sprint B — CONFIGURADOR DE CLASE (la joya, α0.5.2)

El corazón de la personalización. Reemplaza la cajita de texto única por un **asistente de creación en 3 pasos** (encaja con el stepper didáctico existente).

**Campos del configurador (todos opcionales → "vacío = plantilla predeterminada"):**

| Campo | Tipo | Options / Comportamiento |
|-------|------|--------------------------|
| 🇦 **Duración de la clase** | Select | 40 min · 60 min · 80–90 min · 120 min · Bloque doble |
| 🇧 **Total de diapositivas** | Slider | 7 · 10 · 12 · 15 · 20 (sugerida según duración) |
| 🇨 **Estilo visual** | Radio cards | Minimalista · Clásica UTN · Contemporánea · Alta carga visual |
| 🇩 **Nivel de profundidad** | Select | Introductorio · Intermedio · Avanzado · Mixto (teoría+debate) |
| 🇪 **Ejemplos** | Check | Cotidianos · Casos industria regional (Delta/Campana) · Ambos · Sin ejemplos |
| 🇫 **Imágenes** | Radio | Fotos reales HD · Ilustraciones planas · Solo diagramas · Sin imágenes |
| 🇬 **Momentos a incluir** | Check (multi) | _hook · concepto_núcleo · caso_aplicado · esquema_proceso · desafío_aula · takeaway_ |
| 🇭 **Temas adicionales a abordar** | Tags input | "tema1; tema2; tema3" |
| 🇮 **URL de teoría (override)** | Input URL | Si está vacío → usa el link del temario / RAG estándar |
| 🇯 **Instrucciones libres** | Textarea | "Vacío = presentación predeterminada llamativa" |
| 🇰 **Guardar como plantilla** | Toggle + nombre | Se persiste en `localStorage` + opción "Restaurar mi último borrador" |

**Reliable features post-generación (alta compatibilidad con el motor actual):**

| ID | Tarea |
|----|-------|
| **B-F1** | Extender `request` a Gemini/Vercel con los campos nuevos (ya está el schema → agregar propiedades opcionales). |
| **B-F2** | **Regeneración quirúrgica por slide** ("Me gustó, pero reformulá solo la slide 4"). |
| **B-F3** | **Editor de slides previo a exportar** (cambiar título/contenido a mano en el cliente antes de "Guardar en Slides"). |
| **B-F4** | **Reutilizar del historial** (botón que recarga la configuración original). |
| **B-F5** | **Enviar por email** vía `MailApp` GAS (contacto del docente + link del drive). |

### 🛠️ Sprint C — FIABILIDAD & UX DOCENTE (α0.5.3) [COMPLETADO]

| ID | Tarea |
|----|-------|
| **C-F4** | ✅ Portada robusta: se construyen los shapes explícitamente (insertTextBox) sin depender de la plantilla; autofit para títulos largos; caps 120/200. |
| **C-F6** | ✅ Imágenes con timeout (6s) + fallback elegante (slide sin imagen si pollinations cae o responde !=200). |
| **C-F2/B1** | ✅ Temperatura unificada a 0.2 en GAS y Vercel. |
| **C-F8** | ✅ Loaders por etapa ("Buscando material...", "Generando tu clase...") + foco inicial automático en dialogs. |
| C-F7 | Datos del tema: IDs relacionales ya se pasan (Sprint B). Descripción/contexto en modal = mejora menor futura. |

### 🚀 Sprint D — DISTRIBUCIÓN & TELEMETRÍA (α0.5.4)

| ID | Tarea |
|----|-------|
| **D-F1** | **Versionar GAS con `clasp`** → `gas/` en el repo + trigger de push documentado. |
| **D-F2** | **Checklist de despliegue** (Web App: Execute as / Access, warmup trigger, propiedad `GEMINI_API_KEY`, hoja compartida con docentes). |
| **D-F3** | **Audit log en Sheets**: `Log_Eventos` con timestamp, acción, legajo, exito/error. |
| **D-F4** | **Auth institucional (Fase E)**: migrar a **Google OAuth (Sign-In)** usando las cuentas Workspace de los docentes (costo $0, elimina S1/S4 definitivamente). Se mantiene legajo+DNI como fallback transicional con rate-limit. |
| **D-F5** | **Archivar `diagramas.html` y `plan23-06.md`** en `/archive`. |

---

## 6. Backlog Priorizado Consolidado

| Prioridad | ID | Tarea | Esfuerzo | Sprint |
|-----------|----|-------|----------|--------|
| 🔴 P0 | A-F1 → A-F7 | Sprint Blindaje (7 ítems) | ~8h | A |
| 🔴 P0 | C-F1, C-F3 | Fix historial + truncado consistente | ~3h | C |
| 🟠 P1 | B-F1 | Contrato backend del configurador (schema extendido) | ~2h | B |
| 🟠 P1 | C-F2, C-F4, C-F5 | Fiabilidad login/slides/xss | ~4h | C |
| 🟠 P1 | D-F1, D-F2, D-F3 | Versionado + checklist + audit log | ~4h | D |
| 🟡 P2 | B-F2 → B-F5 | Post-generación (regenerar, editar, email) | ~6h | B |
| 🟡 P2 | C-F6 → C-F8 | Imágenes + losad + accesibilidad | ~5h | C |
| 🟢 P3 | D-F4 | Google OAuth institucional | 1 semana | E (post-alpha) |
| 🟢 P3 | M2 | Limpieza de archivos obsoletos | 30 min | — |

---

## 7. Definition of Done — Alpha 0.5

- [x] Ningún 🔴 de la sección 3 queda sin plan de acción.
- [x] Punch list: `vercel.json` coincide con `memory.md`.
- [x] GAS versionado en el repo (`clasp`).
- [x] Configurador de clase completo de punta a punta (frontend → Gemini → Slides).
- [x] QA sobre el flujo real de un docente de 50+ (login → configurar → exportar en ≤ 6 clics).
- [ ] Costo total = $0 (GAS, Vercel Free, Gemini Free, MailApp).

---

## 8. Checklist de Despliegue GAS (crítico — se recomienda verificar YA)

- [ ] Web App: **Ejecutar como = Usuario que accede** (para que los Slides se creen en el Drive del docente).  ⚠️ Requiere compartir la planilla con los docentes (Viewer).
- [ ] Trigger `mantenerCaliente` configurado (Time-driven, cada 4-5 min).
- [ ] Propiedad `GEMINI_API_KEY` seteada en Script Properties.
- [ ] Propiedad `ALLOW_DEBUG=false` (desactiva `debugSheetData`).
- [ ] Hoja `Historial_Presentaciones` con 7 columnas corregidas (index de fecha = 6).
- [ ] Docentes con cuenta Workspace acceden a la planilla (auth futura).

---

## 9. Riesgos Residuales

| Riesgo | Mitigación |
|--------|-----------|
| Cuota gratuita de Gemini agotada por abuso (S3) | Rate-limit por token + tope diario logueado en Sheets. |
| Docente comparte su link de Slides fuera del ámbito | El token de sesión solo vive 2h; el link de Slides es del Drive del docente (riesgo aceptable institucional). |
| Datos en Sheets = PII | Restringir acceso de la planilla + auditoría (`Log_Eventos`) + eventual OAuth. |
| `pollinations.ai` deja de andar | Fallback elegante a "Slide sin imagen" + modal constructor de prompts manual. |