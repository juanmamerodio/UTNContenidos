# Current Technical Memory (Beta Active State)

> Última actualización: 2026-10-07 · Caché de alta densidad (<300 palabras). Histórico: `DocumentoCronologico.md`.

## System Status
- **Stack:** Next.js 15.5 (App Router) + TS estricto + React 19 · Supabase (Auth + RLS + pgvector) · Gemini/OpenRouter · Framer Motion (UI 3D).
- **Deploy:** Vercel, $0. Prod: `utncontenidos.vercel.app`.
- **Fase Actual:** Post-MVP Mobile-First UX Refactor COMPLETADO (M1-M4 verificados: QA 36/36 tests OK, build OK).

## Completed Tickets (Post-MVP Mobile-First)
- **M1 (Dashboard & Tarjetas 3D):** Spring physics en `MateriaCardPro` (`whileTap`, `whileHover`), grid 1-columna en `< 768px`.
- **M2 (CRUD Apuntes Responsive):** Layout responsivo `.apuntes-layout`, textarea con auto-scroll y botones accesibles sin inline styles.
- **M3 (Generador Form & Stepper):** Stepper colapsable en mobile (`.step-label`), inputs flex-col con altura táctil >= 48px.
- **M4 (Visor Core & Bottom Sheets):** ModalEditarSlide y ModalReformular transformados en Bottom Sheets táctiles con físicas de resorte y stagger animation en slides.

## Recent Decisions (Last 3)
1. Estandarización de Bottom Sheets (`bottom-sheet-*`) con físicas de resorte para pantallas táctiles y auto-centrado en desktop.
2. Eliminación de estilos inline en favor de tokens semánticos en `globals.css` respetando diseño para 50+ y WCAG AAA.
3. Suite de tests `tests/mobile-ux.test.ts` con 10 pruebas cubriendo invariantes responsivos y animaciones.

## Blockers / Open Edge Cases
- Ninguno. 100% verificado: `npm run qa` verde (36 tests), `next build` OK.