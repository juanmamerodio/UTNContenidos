---
name: utn-security-audit
description: Use when auditing security of UTNContenidos before a deploy, or after touching auth, endpoints, or any data-exposing function. Provides OWASP checklist adapted to SPA + Serverless + Google Sheets.
---

# UTNContenidos — Auditoría de Seguridad (checklist)

Correr antes de cada entrega y ante cualquier cambio de auth/endpoints.

## Checklist
- [ ] Login con rate-limit + lockout (máx 5 fallos → 15 min) + throttle global (20/60s)
- [ ] `debugSheetData` detrás de `ALLOW_DEBUG=true`
- [ ] `doPost` con cap de payload (500KB)
- [ ] Máx 30 slides en export
- [ ] `LockService` en todas las escrituras a Sheets
- [ ] `extraerJsonPuro()` + validación de estructura en TODA respuesta de la IA
- [ ] Anti prompt-injection delimitando el RAG
- [ ] RAG truncado a 15k en ambos caminos (GAS y Vercel)
- [ ] CSP en `index.html` (script/style/connect-src correctos)
- [ ] `vercel.json` sin `immutable` en assets no versionados
- [ ] `sanitizeHTML()` en todo render de datos externos
- [ ] `sanitizeURL()` en hrefs (solo http/https)
- [ ] Tokens solo en `sessionStorage` (nunca localStorage)
- [ ] CORS restringido en `api/gemini.js`
- [ ] Sin secretos en el cliente (GEMINI_API_KEY solo en env/propiedades)

## Prioridades (si conflicto)
Seguridad > Estabilidad > UX > Rendimiento > Estética

## Recordatorios críticos
- El token UUID v4 (122 bits) NO necesita HMAC.
- Los Slides se crean en el Drive del docente solo si el Web App corre como *Usuario que accede*.
- El historial es PII: la planilla debe tener acceso restringido + audit log (D-F3 pendiente).