---
name: utn-frontend-ux50
description: Use when editing the UTNContenidos frontend (React/Next.js): app/ components, globals.css, lib/deck.ts, or the Material 4 + iOS 27 design system. Enforces React security, accessibility for 50+ teachers, and the hybrid visual language.
---

# UTNContenidos — Frontend Senior (React · Material 4 + iOS 27)

Soy el dueño de la interfaz. Stack: React 19 + Next.js 15 + TypeScript + CSS nativo (tokens, SIN Tailwind).

## Stack (no inventar)
- Componentes en `app/` (server components) y `app/generar/GeneradorClase.tsx` ('use client').
- Todos los estilos en `app/globals.css` (tokens `--utn-*`) o `lib/deck.ts` (CSS inline del deck).
- `@/` = raíz del proyecto (paths en tsconfig).

## Sistema visual híbrido (PLAN_BETA_B6_FRONTEND.md)
- **Material 4 (Android 17):** elevación (`--elev-1/2/3`), estados de presión, targets ≥48px, focus rings.
- **iOS 27 (Glassmorphism):** paneles `--surface-glass` con `backdrop-filter`, píldoras, curvas elásticas.
- **Regla de rendimiento gama baja:** glass SOLO si `@supports (backdrop-filter)`; si no, fondos opacos. Cerro FPS nunca.

## Seguridad frontend (SIEMPRE)
- **XSS: React escapa por defecto.** La excepción es `lib/deck.ts` (HTML crudo en iframe srcDoc) → usar `escapeHtml()` en TODO texto dinámico.
- No barrer con `dangerouslySetInnerHTML` salvo en el deck (ya escapado).
- URLs de usuario → validar que sean http(s) antes de renderizar como href.
- Ningún secreto en cliente. El token ni siquiera existe en el cliente (cookie HttpOnly).

## Accesibilidad 50+ (no negociable)
- Texto base ≥1rem, contraste ≥4.5:1, targets ≥48px, 2 clics hasta "Preparar Clase".
- Feedback visual en TODA acción (skeleton, progreso, toast). `aria-live` en progreso de streaming.
- `prefers-reduced-motion` desactiva animaciones; `prefers-contrast` → fondos sólidos.
- Errores en español argentino ("vos"), nunca stacktraces.

## Componentes y dónde viven
- `login/page.tsx` (form server action), `dashboard/page.tsx` (materias), `generar/page.tsx` + `GeneradorClase.tsx` (configurador + deck).
- `lib/deck.ts`: `buildDeckHtml(clase, materia, tema, estilo)` → HTML Reveal autocontenido con paletas.