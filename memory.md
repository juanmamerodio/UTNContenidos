# Current Technical Memory (Beta Active State)

> Última actualización: 2026-10-25 · Caché de alta densidad (<300 palabras). Histórico: `DocumentoCronologico.md`.

## System Status
- **Stack:** Next.js 15.5 (App Router) + TS estricto + React 19 · Supabase (Auth + RLS + pgvector) · Gemini/OpenRouter · Reveal.js 5 · Framer Motion (UI 3D).
- **Deploy:** Vercel, $0. Prod: `utncontenidos.vercel.app`.
- **Fase Actual:** Producción Final & Issue #1 COMPLETADOS con TDD.

## Completed Tickets / Issues
- **Producción Final (Tickets 1 a 4):** Botones en `MateriaCardPro`, carpetas en `HistorialClient`, navegación lineal Reveal.js, placeholders y empty states.
- **Issue #1 (Deck Legibilidad & No Notas Orador):**
  - Tokens semánticos (`PaletteTokens`) en las 4 paletas (`clasica`, `minimalista`, `contemporanea`, `alta_carga`).
  - Eliminación de colores fijos `#ffffff` y `#94A3B8` en favor de `var(--deck-fg)`, `var(--deck-muted)`, `var(--deck-on-acento)` y `var(--deck-border)`.
  - Respaldo de fondo y color en `body` y `.reveal`. Gradiente de portada derivado por paleta (sin `#031c18` en minimalista).
  - Eliminación integral de `notasOrador` en schema de IA (`app/api/ia/route.ts`), tipo `Slide`, `lib/deck.ts`, modales de edición y vista pedagógica.
  - Suite `tests/deck-legibilidad.test.ts` con 18 tests (contraste WCAG AA >= 4.5:1, compatibilidad con objetos previos).

## Recent Decisions (Last 3)
1. Tokens de paleta en `:root` del deck eliminan colores hardcodeados y garantizan contraste WCAG AAA/AA para docentes 50+.
2. Eliminación de notas de orador ahorra tokens en Gemini/OpenRouter y simplifica la UI.
3. Compatibilidad hacia atrás: presentaciones existentes con `notasOrador` se renderizan sin error ignorando el campo.

## Blockers / Open Edge Cases
- Ninguno. 100% verificado: 62/62 tests verde, `npm run check` OK, `npm run build` OK.
