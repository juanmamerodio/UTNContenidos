---
name: utn-frontend-ux50
description: Use when editing index.html, script.js or style.css of UTNContenidos. Enforces vanilla JS SPA patterns, XSS sanitization, and the 50+ professor UX rules (big text, 2 clicks, contrast).
---

# UTNContenidos — Frontend & UX Docente (50+)

## Stack (no inventar)
- Vanilla JS SPA. Sin frameworks. Tailwind NO (usa `style.css` propio con variables CSS).
- Archivos: `index.html` (vistas), `script.js` (router + lógica), `style.css` (variables `--utn-*`).

## Reglas de UX innegociables (docente 50+)
- Letra grande (`clamp()`), contraste alto, botones ≥ 44px.
- Máximo 2 clics hasta "Preparar Clase".
- Feedback visual inmediato: `showNotification(type, msg)` + loaders por etapa.
- Idioma: español argentino, trato de "vos".
- Sin manual: la app debe autoexplicarse (stepper didáctico).

## Seguridad frontend (siempre)
- Render de datos externos: `sanitizeHTML(text)`.
- Hrefs de datos: `sanitizeURL(url)` (solo http/https).
- `sessionStorage` para token (nunca localStorage).
- `data-*` attributes para pasar IDs relacionales (ej: `data-materia-id`, `data-tema-id`).

## Patrones existentes
- Router: `navigateTo('view-x')` con vistas `<section class="spa-view" hidden>`.
- `callBackend(action, data)` → POST JSON a GAS con header `text/plain;charset=utf-8`.
- IA: intentar `fetch('/api/gemini')` → si falla, `callBackend('generarClaseIA', ...)`.
- Dialogs: `<dialog>` con `.showModal()`/`.close()`.
- Templates de usuario: `localStorage` con clave `utn_template_clase`.

## Vistas y sus IDs
- `view-login` · `view-dashboard` · `view-generator` · `view-historial`
- Modales: `modal-loader`, `modal-success`, `modal-contexto` (Configurador), `modal-reclamar`