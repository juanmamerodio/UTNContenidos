# Current Technical Memory (Beta Active State)

> Última actualización: 2026-10-09 · Caché de alta densidad (<300 palabras). Histórico: `DocumentoCronologico.md`.

## System Status
- **Stack:** Next.js 15.5 (App Router) + TS estricto + React 19 · Supabase (Auth + RLS + pgvector) · Gemini/OpenRouter · Reveal.js 5.1 · Framer Motion (UI 3D).
- **Deploy:** Vercel, $0. Prod: `utncontenidos.vercel.app`.
- **Fase Actual:** Producción Final (Tickets 1 a 4 COMPLETADOS).

## Completed Tickets (Producción Final)
- **Ticket 1 (UX/UI Dashboard & Botones):** `MateriaCardPro` con `whileTap={{ scale: 0.95 }}` en botones de acción. Clases `.materia-actions` y `.btn-dashboard-action` con fondo blanco y borde de color primario sin desfasajes Flexbox.
- **Ticket 2 (Refactor Historial - Carpetas):** `HistorialClient` con agrupación por cátedra, grilla mobile-first (`grid-cols-2`, `gap-4`), estado `materiaSeleccionada` y vista detalle con botón "Volver a Carpetas" táctil.
- **Ticket 3 (Reveal.js Alto Contraste & Navegación Lineal):** `lib/deck.ts` configurado con `navigationMode: 'linear'` y contraste adaptativo oscuro (`#1F2937`) sobre temas de fondo claro.
- **Ticket 4 (Microcopy & Espacios Vacíos):** Placeholder y texto de ayuda en ingesta de apuntes ("No se aceptan links con contraseña ni PDFs locales") y empty states cálidos y direccionales.

## Recent Decisions (Last 3)
1. Extracción de `HistorialClient` para navegación interactiva sin recarga de página entre carpetas y clases.
2. Contraste adaptativo en Reveal.js garantizando legibilidad en proyectores y dispositivos sin romper paletas oscuras.
3. Suite de tests `tests/produccion-final.test.ts` cubriendo los 4 tickets.

## Blockers / Open Edge Cases
- Ninguno. Verificado con suite de pruebas y contratos validados.
