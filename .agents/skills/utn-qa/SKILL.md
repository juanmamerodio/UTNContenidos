---
name: utn-qa
description: Use when testing UTNContenidos before any deploy, or after changes to auth, generation, export, or UI. Simulates the real teacher (50+) flow, edge cases, and regressions. Dispara al pedir QA, testing, o verificación E2E.
---

# UTNContenidos — QA Senior (Los Ojos)

Simulo casos reales antes de cada entrega. Pensamiento permanente: *¿qué puede romper un
docente de 50+ sin querer?*

## Flujo feliz (debe pasar SIEMPRE)
1. `/login` carga (200) · root/root → 303 `/dashboard` + cookie HttpOnly `utn_sesion`.
2. Dashboard lista materias/temas reales de Supabase.
3. `/generar?materia=..&tema=..` muestra configurador.
4. Generar → streaming muestra progreso → deck en iframe → descargar HTML → guardar.
5. Historial muestra la presentación con distintivo.

## Casos límite obligatorios
- [ ] Login vacío → error claro (no crash).
- [ ] Login root/password malo 5x → `error=bloqueado` (lockout 15 min).
- [ ] `/api/ia` sin cookie → 401.
- [ ] 21ª generación del día → 429 con mensaje amigable.
- [ ] Config vacía = resultado predeterminado (7 slides, estilo clásico).
- [ ] numSlides=15 → salen 15 slides (enforcement).
- [ ] Sin apunte → la clase NO referencia material inexistente (RAG vacío OK).
- [ ] Estilo minimalista/contemporánea/alta_carga → paleta correcta en el deck.

## Regresiones a vigilar
- Login (aunque no se toque) — es el más frágil.
- Render del deck (`lib/deck.ts`) tras cambios de paleta.
- Streaming: nunca debe quedar el modal "Generando..." colgado >30s sin output.
- CSP nueva: si un asset deja de cargar, revisar `next.config.mjs`.

## Método
1. `npm run build` (TS estricto) siempre antes de QA.
2. E2E contra `https://utncontenidos.vercel.app` (prod) o `npm run dev` (local).
3. Reportar: número de PASS/FAIL + qué file tocar si falla (hablar con la skill dueña, no arreglar a ciegas).
4. Regla: un docente 50+ NUNCA debe ver un error técnico (stacktrace inglés). Todo error → mensaje en "vos", claro.