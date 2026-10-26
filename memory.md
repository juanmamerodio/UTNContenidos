# Current Technical Memory (Beta Active State)

> Última actualización: 2026-10-25 · Caché de alta densidad (<300 palabras). Histórico: `DocumentoCronologico.md`.

## System Status
- **Stack:** Next.js 15.5 (App Router) + TS estricto + React 19 · Supabase (Auth + RLS + pgvector) · Gemini/OpenRouter · Reveal.js 5 · Framer Motion (UI 3D).
- **Deploy:** Vercel, $0. Prod: `utncontenidos.vercel.app`.
- **Fase Actual:** Fix Proyección Reveal.js e Impresión PDF completado con TDD.

## Completed Tickets / Issues
- **Producción Final (Tickets 1 a 4):** Botones en `MateriaCardPro`, carpetas en `HistorialClient`, navegación lineal Reveal.js, placeholders y empty states.
- **Issue #1 (Deck Legibilidad & No Notas Orador):** Tokens semánticos en las 4 paletas, eliminación de `notasOrador`.
- **Fix Proyectar, Flechas e Impresión PDF (TDD):**
  - Botón **Proyectar** siempre visible y funcional en `VisorResultado` (usa `/api/presentacion/${id}` o popup fallback).
  - Reveal inicializado con `navigationMode: 'linear'` y `keyboard: true`.
  - Navegación con flechas izquierda/derecha comunicada vía `postMessage` (`SIGUIENTE_SLIDE` / `ANTERIOR_SLIDE`) desde `VisorResultado` al `iframe`, y nativa en pestaña proyectada.
  - Botón **Imprimir / PDF** con Reveal `view: 'print'`, `@media print` (`print-color-adjust: exact`) y disparo automático `window.print()`.
  - Suite `tests/proyectar-imprimir.test.ts` con 10 tests TDD. Total: 72/72 tests verde.

## Recent Decisions (Last 3)
1. Reveal linear navigation (`navigationMode: 'linear'`) garantiza que flechas derecha/izquierda avancen y retrocedan sin saltos en 2D.
2. Inyección de `view: 'print'` en Reveal 5 asegura paginación estándar de diapositivas en formato apaisado.
3. Desacople de `presentacionId`: Proyectar e Imprimir funcionan en memoria sin depender de persistencia previa.

## Blockers / Open Edge Cases
- Ninguno. 100% verificado: 72/72 tests verde, `npm run check` OK, `npm run build` OK, dev server en `http://localhost:3001`.
