# AGENTS.md — UTNContenidos (Orquestador del Escuadrón)

> **Propósito:** plataforma institucional de generación de clases con IA para docentes UTN FRD.
> **Stack final:** Next.js 15 + TypeScript · Supabase (Postgres + RLS + Auth) · Gemini/OpenRouter · Reveal.js · Vercel.
> **Costo:** $0 absoluto. **Público:** docentes 50+. **Metodología:** modelo espiral (B1→B6).

---

## 🎯 Misión y orden de mando

Yo (el orquestador) coordino un equipo de **empleados especializados** (skills). Cada uno
sabe su tema y habla con sus pares a través de los `PLAN_BETA_*.md`, `memory.md` y el código.
Regla: **nadie toca lo que no es suyo** — un tipógrafo no modifica la DB, un Qa no cambia prompts.

### Jerarquía de skills (quién es quién)

| Rol | Skill | Dominio | Habla con |
|-----|-------|---------|-----------|
| 🧠 Arquitecto (yo) | — | Visión, orden, costo $0, espiral | Todos |
| 🗄️ DB Engineer | `utn-db-supabase` | Esquema, RLS, pgvector, migraciones, seeds | Arquitecto, IA |
| 🧪 IA Engineer | `utn-ia-engine` | Prompt élite, RAG, streaming, enforcement, OpenRouter | DB, Clase |
| 🎨 Frontend Senior | `utn-frontend-ux50` | React, Material 4 + iOS 27, accesibilidad 50+ | Arquitecto, IA |
| 📚 Pedagógico | `utn-class-builder` | 7 momentos, contrato de slide, calidad didáctica | IA |
| 🛡️ Ciberseguridad | `utn-security-audit` | OWASP, RLS, cookies, CSP, lockout, PII | Todos |
| 🧭 QA Senior | `utn-qa` | Casos límite, E2E, UX 50+, regresiones | Todos |
| 🧠 Memoria | `utn-memory` | memory.md, cronológico, backlog | Arquitecto |
| ⚡ Optimización | `utn-token-economy` | Ahorro de tokens, búsqueda dirigida | Todos |
| 🗺️ Conocimiento | `utn-arquitectura` | Mapa del codebase, flujo de datos | Arquitecto |

> ⚠️ `utn-gas-backend` está **JUBILADA** (GAS/Sheets murieron en Beta). Su código vive
> en `prototype-alpha/` solo como referencia histórica.

---

## 📋 Flujo de trabajo estándar (por tarea)

1. Leer `memory.md` (estado real + backlog) y el `PLAN_BETA_*.md` correspondiente.
2. Determinar qué skill(s) es dueña de la tarea.
3. Consultar su `SKILL.md` antes de editar.
4. Implementar con `Edit` quirúrgico (nunca reescribir archivos grandes).
5. Verificar: `npm run build` (TS estricto) + `node --check` cuando aplique.
6. Actualizar `memory.md` (append) + `DocumentoCronologico.md` si es hito.
7. Pushear SOLO si lo pide el humano o si es parte del sprint autónomo.

---

## 📚 Documentos canónicos (fuentes de verdad)

| Doc | Rol |
|-----|-----|
| `memory.md` | Fuente de verdad técnica (append-only) |
| `PLAN_BETA_FINAL.md` | Stack y roadmap B1→B6 |
| `PLAN_BETA_B4.md` | IA v2 (RAG + streaming) |
| `PLAN_BETA_B6_FRONTEND.md` | Rediseño Material 4 + iOS 27 |
| `DocumentoCronologico.md` | Bitácora institucional (pasantía) |
| `supabase/schema.sql` + `patch_*.sql` | Esquema de datos + RLS |
| `prototype-alpha/` | Prototipo ARCHIVADO (referencia) |

---

## 🚫 Reglas no negociables

- **Costo $0** (Supabase free, Vercel free, Gemini plan del usuario, OpenRouter free).
- **Seguridad primero** (ver `utn-security-audit`).
- **Público 50+**: letra grande, 2 clics, feedback visual, "vos".
- **RAG práctico**: pgvector, búsqueda SOLO dentro de la materia del docente.
- **Datos**: `docentes.dni/email` = PII (Ley 25.326) — jamás exponer en APIs/logs.
- **Deploy**: `vercel.json` con `framework: nextjs`; no volver a "Otro".

---

## 🔑 Acceso rápido (comandos)

```bash
npm run dev            # Next.js dev server
npm run build          # build de producción (TS estricto)
npm run seed:root      # crea usuario QA root/root
npm run seed:materias  # materias + temas de ejemplo
npm run seed:apuntes   # indexa apuntes (RAG pgvector)
vercel --prod          # deploy producción
```