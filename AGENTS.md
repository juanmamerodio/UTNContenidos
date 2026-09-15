# AGENTS.md — UTNContenidos (índice rápido)

SPA costo $0 que genera clases con IA (Google Slides + PDF) para docentes de UTN FRD.
Stack: Vanilla JS + `style.css` (frontend) · Vercel Serverless (`api/gemini.js`) + Google Apps Script (`app.md`) · Google Sheets (DB 3NF/DLR) · Gemini API.

## Archivos (usa memory.md como índice; evita leer archivos grandes completos)
| Archivo | Rol | Líneas |
|---------|-----|--------|
| `index.html` | SPA: 4 vistas + 4 modales (login, dashboard, generator, historial) | ~470 |
| `script.js` | Router + lógica frontend + `callBackend()` | ~890 |
| `style.css` | Sistema de diseño (`--utn-*` vars, responsive 50+) | ~1830 |
| `app.md` | Backend GAS: auth, RAG, Slides, historial, `doPost` | ~1090 |
| `api/gemini.js` | Proxy Vercel → Gemini (Structured Outputs) | ~240 |
| `vercel.json` | Deploy + Cache-Control (`must-revalidate`) | ~35 |
| `memory.md` | **Fuente de verdad técnica. Solo append.** | ~210 |
| `DocumentoCronologico.md` | Bitácora institucional de pasantía (tono formal) | ~200 |
| `diagramas.html` | Diagramas Mermaid 11 (arquitectura, ER, flujo) | ~180 |
| `UTNContenidos.md` | System Instructions del Escuadrón | 223 |
| `PLAN_ALPHA_5.md` / `PLAN_ALPHA_5_SPRINT_B.md` | Auditoría + roadmap (modelo espiral) | — |
| `WALKTHROUGH_FASE2.md` | Migración futura a Microsoft Entra ID | — |

## Reglas no negociables
- **Costo total = $0** (GAS, Vercel Free, Gemini Free, MailApp). No introducir servicios de pago.
- **Público: docentes 50+** → letra grande, 2 clics, feedback visual, "vos", español argentino.
- **Seguridad primero**: rate-limit login, LockService, sanitización, `extraerJsonPuro`, anti prompt-injection, CSP, caps de payload. Ver skill `utn-security-audit`.
- **RAG**: truncar a 15.000 chars en ambos caminos (GAS y Vercel).
- **Auth futura**: Microsoft Entra ID (UTN tiene M365). Legajo+DNI = fallback transicional.
- **Modelo de datos**: Sheets 3NF. Hoja `Historial_Presentaciones` col F=estado, G=fecha (índice 6).

## Workflow por tarea
1. Leer `memory.md` (estado + backlog).
2. Consultar skill relevante (`.opencode/skills/`).
3. Hacer cambios con `Edit` quirúrgico (nunca reescribir archivos grandes).
4. Verificar sintaxis: `node --check` sobre JS extraído.
5. Actualizar `memory.md` (+ `DocumentoCronologico.md` si es hito).
6. No commitear salvo que lo pida el usuario.

## Skills disponibles (`.opencode/skills/`)
`utn-gas-backend` · `utn-security-audit` · `utn-frontend-ux50` · `utn-class-builder` · `utn-token-economy` · `utn-memory`