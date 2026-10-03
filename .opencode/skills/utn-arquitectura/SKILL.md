---
name: utn-arquitectura
description: Use when someone needs to understand how the UTNContenidos Beta codebase fits together — architecture, data flow, components, or why each piece exists. Modeled after the "graphs that teach" philosophy (Understand-Anything): document where each piece lives and how they connect.
---

# UTNContenidos — Mapa de Arquitectura (Beta 0.1.0)

"Gráficos que enseñan > gráficos que impresionan." Este skill es el grafo de
conocimiento en texto plano del proyecto. El codebase real vive en: `memory.md`
(fuente de verdad), `diagramas.html` y `PLAN_BETA_*.md`.

## Stack (quiénes son los actores)
- **Frontend:** Next.js 15 (App Router) + React 19 + TypeScript. Vanilla CSS con tokens `--utn-*` (sin Tailwind).
- **API/negocio:** Server Actions (`app/actions.ts`, `app/datos.ts`) + Route Handlers (`app/api/*`).
- **Datos:** Supabase (PostgreSQL + RLS + pgvector) + Supabase Auth (JWT).
- **IA:** Gemini (`gemini-3.5-flash-lite`, env `IA_MODEL`) con fallback OpenRouter (B4).
- **Presentaciones:** Reveal.js self-hosted (`public/reveal/`).

## Mapa de carpetas (qué vive dónde)
```
app/
├── page.tsx            → redirige / → /login o /dashboard según sesión
├── layout.tsx          → <html lang="es-AR"> + metadata
├── globals.css         → design system (tokens, glass con fallback, elevación)
├── actions.ts          → loginRoot (root/root auto-reparable) + logout
├── helpers.ts          → getSesionUsuario (JWT → docente)
├── datos.ts            → getDashboard, agregarTema, plantillas, historial, guardarPresentacion
├── login/page.tsx      → form server action
├── dashboard/page.tsx  → materias + temas reales de Supabase
├── generar/page.tsx    → server: valida sesión + pasa props
├── generar/GeneradorClase.tsx → client: configurador + fetch /api/ia + iframe deck
├── api/ia/route.ts     → orquestador IA (RAG + streaming + enforcement + tope diario)
└── api/health/route.ts → keep-alive Supabase free tier (cron diario)
lib/
├── supabase.ts         → getServiceClient / getPublicClient (singletons)
├── auth.ts             → getToken / getDocenteSesion / esHoy (cookie HttpOnly)
└── deck.ts             → buildDeckHtml (Reveal autocontenido) + paletas por estilo
scripts/                → seed_root, seed_materias, seed_apuntes (.mjs, idempotentes)
supabase/               → schema.sql + patch_b4.sql (aplicar por SQL Editor)
prototype-alpha/        → SPA legacy (GAS/Sheets) ARCHIVADA — referencia histórica
```

## Flujo de datos (el camino de una clase)
```
login root/root
  → actions.loginRoot → docentes (Supabase) → signInWithPassword → cookie HttpOnly utn_sesion
dashboard
  → datos.getDashboard → asignaciones ⋈ materias ⋈ temas (RLS por service client)
generar
  → GeneradorClase → POST /api/ia?stream=1 (cookie → getDocenteSesion)
    → buscarApuntesRAG (match_apuntes pgvector) → llamarModelo (Gemini→OpenRouter)
    → streaming SSE → buildDeckHtml → iframe srcDoc → descarga HTML
```

## Reglas de arquitectura NO negociables
1. **Nunca** exponer la service key al cliente. Solo `lib/supabase.ts` en server.
2. La sesión viaja SIEMPRE en cookie HttpOnly (`utn_sesion`), jamás en localStorage.
3. Los route handlers sensibles (`/api/ia`) validan sesión con `getDocenteSesion()`.
4. El SQL se mantiene como archivos `supabase/*.sql` (tablas + RLS + funciones).
5. Los seeds son idempotentes (upsert o delete+insert), no duplican datos.

## Relación con Understand-Anything
Adoptamos la filosofía "mapas que enseñan" pero **sin el plugin pesado** (alta
carga de tokens). Nuestro "grafo" = este skill + memory.md + diagramas.html.
Si el proyecto creciera a 5k+ archivos, recién ahí valdría adoptar
`/understand` para auto-generar el grafo.