---
name: supabase-auth
description: Use when working on authentication in UTNContenidos — Supabase Auth setup, the root/root bootstrap login, linking docentes↔auth.users via auth_uid, RLS identity, or adding a teacher login. Dispara al tocar api/auth, scripts/seed_*, auth env vars, docentes.auth_uid o el flujo login/validar-sesion.
---

# Supabase Auth — UTNContenidos (bootstrap B1)

Toda la autenticación pasa por **Supabase Auth**. La palabra clave del sistema: **desacople**.
Las credenciales que ve el docente (legajo + DNI, o root/root) son las que valida la tabla
`docentes`; Supabase solo emite la sesión. La autoridad la da la base, no el password del auth user.

## Modelo mental

- `docentes.auth_uid` FK → `auth.users(id)` es el puente: RLS se cuelga de él
  (`auth.uid() = auth_uid` en todas las políticas).
- Dos clientes en `lib/supabase.ts`: `getServiceClient()` (service role, SOLO server-side) y
  `getPublicClient()` (anon, navegador).
- El password del auth user es interno (`ROOT_AUTH_PASS`); `root/root` es la identidad visible.
- `login` valida legajo+dni contra `docentes` y recién ahí llama `signInWithPassword`.
  `validar-sesion` revalida el JWT con `getUser`.

## Flujo de instalación

1. **Configurar env** — `.env.local` con `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`,
   `SUPABASE_ANON_KEY`, `ROOT_AUTH_PASS`, `APP_URL`.
   *Criterio de fin:* las 5 seteadas; la service key jamás entra al navegador ni a git.
2. **Aplicar esquema** — correr `supabase/schema.sql` en el SQL Editor del proyecto.
   *Criterio de fin:* `docentes` con `auth_uid uuid unique references auth.users(id)`,
   RLS activo, políticas `auth.uid()` (`docentes_sel/ins`, `asign_sel`, `tpl_*`, `pres_*`, `sl_*`, `ev_*`).
3. **Sembrar root** — `npm run seed:root`.
   *Criterio de fin:* idempotente (si `root@utn.local` ya existe, solo re-vincula); crea el auth user
   + fila `docentes` con legajo/dni `root`, `activo: true`, `auth_uid` seteado.
4. **Verificar E2E** — contra Supabase real: `login` root/root devuelve token, y el docente
   recién ve sus propias materias vía RLS.
   *Criterio de fin:* docente → JWT → `getUser` PASS (QA E2E 3/3).

## Agregar un docente nuevo (workflow de referencia)

1. Crear auth user: `sb.auth.admin.createUser({ email, password, email_confirm: true })`
   (solo con service client; el password debe tener ≥ 6 caracteres).
2. Vincular: upsert en `docentes` con `auth_uid`, `legajo`, `dni`, `email`, `activo: true`,
   `onConflict: 'legajo'`.
3. Validar que RLS le deje ver sus `asignaciones` (con su propio token, no el service).

## Gotchas

- **Password ≥ 6 chars** (exigencia de Supabase); por eso root usa `root-root-utn`.
- **Nunca** `createClient` con service key en el navegador.
- **PII** (Ley 25.326): `dni`/`email` no van a logs ni a respuestas de API.
- **PG17**: no usar `CREATE TRIGGER IF NOT EXISTS`; reemplazar por `DO $$ ... pg_trigger ... $$`.