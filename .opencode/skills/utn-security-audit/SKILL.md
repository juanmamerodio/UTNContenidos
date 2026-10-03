---
name: utn-security-audit
description: Use when auditing security of the UTNContenidos Beta (Next.js + Supabase) before deploy, or after touching auth, endpoints, or any data-exposing function. OWASP checklist adapted to Serverless + Postgres + RLS.
---

# UTNContenidos Beta — Auditoría de Seguridad (checklist)

Stack target: Next.js 15 + Supabase (Postgres/RLS/Auth) + Serverless Vercel.
(El checklist legacy para GAS/Sheets está en `prototype-alpha/`.)

## Checklist
- [ ] Login con rate-limit + lockout (5 fallos → 15 min, tabla `eventos` acción LOGIN_FALLO)
- [ ] `/api/ia` exige sesión (`getDocenteSesion()`) → 401 sin cookie válida
- [ ] Tope diario de generaciones IA (20/día, `generaciones_dia` + `ultima_gen` en docentes)
- [ ] Cookie `utn_sesion` HttpOnly + secure + sameSite=lax (jamás localStorage)
- [ ] Service key SOLO en el server (`lib/supabase.ts`), nunca en cliente
- [ ] RLS activo en todas las tablas (politicas `docente_id`/`auth_uid`)
- [ ] Server actions con validación de autoridad (busca docente por sesión, no por input del cliente)
- [ ] Anti prompt-injection delimitando el material RAG
- [ ] RAG truncado (12k chars) + búsqueda solo dentro de la materia del docente
- [ ] CSP via `next.config.mjs` (script-src 'self', object-src 'none', frame-src 'self')
- [ ] XSS: React escapa por defecto; `escapeHtml` en el deck HTML (`lib/deck.ts`)
- [ ] Secrets solo en env vars de Vercel (.env.local gitignored)
- [ ] Parse tolerante del JSON de la IA (`extraerJsonPuro`/slice `{...}`)

## Prioridades (si conflicto)
Seguridad > Estabilidad > UX > Rendimiento > Estética

## Recordatorios críticos
- El JWT de Supabase Auth vence según config del proyecto; revalidar cuando falle getUser.
- El service client bypass RLS → la autorización es responsabilidad del server action/route, NO de RLS sola.
- `docentes.dni` y `docentes.email` son PII (Ley 25.326): no loguear, no exponer en APIs públicas.
- `registrarLog`/`eventos` guardan actividad; borrar LOGIN_FALLO al éxito.