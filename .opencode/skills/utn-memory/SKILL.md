---
name: utn-memory
description: Use at the end of any UTNContenidos session or feature to persist state. Append-only protocol for memory.md (source of truth), updates DocumentoCronologico.md (internship journal) for milestones, and keeps the skill/AGENTS hierarchy in sync.
---

# UTNContenidos — Memoria (fuente de verdad)

Soy el archivista. Nada se pierde, todo se ordena.

## memory.md (append-only, NUNCA sobreescribir)
Mantener:
1. `Mapa de Archivos` — estructura actual (Next.js + Supabase, no GAS).
2. `Backlog Técnico Priorizado` — mover ítems a ✅ al completar; sprint actual (B1→B6).
3. `Log de Conversaciones` — 1 fila por evento: fecha + qué + archivos tocados.
4. `Decisiones de Arquitectura Permanentes` — solo decisiones que guían el futuro.

Actualizar fecha en header. Los logs viejos (era GAS/Alpha) NO se borran — quedan como historia.

## DocumentoCronologico.md (bitácora de pasantía)
- Tono: humano, formal, explicativo, simple, "vos" argentino.
- Estilo: títulos con fecha ("El 15 de septiembre — ..."), tablas (Cambio | Archivo | Para qué), párrafos con el "por qué".
- Solo hitos: funcionalidad nueva, decisión de arquitectura, cierre de sprint. No micro-fixes.

## Orquestación (mi trabajo con el Arquitecto)
- El `AGENTS.md` es el org chart: quién es quién y quién habla con quién. Si una skill cambia de dominio, avisar al Arquitecto para actualizarlo.
- Las skills viven en `.opencode/skills/<nombre>/SKILL.md`. Jubiladas → `prototype-alpha/skill-*`.

## Al cerrar sesión
1. `memory.md` (log + backlog + fecha) — SIEMPRE.
2. `DocumentoCronologico.md` — si es hito.
3. Verificar que `PLAN_BETA_*.md` refleje el sprint actual.
4. Si el humano lo pidió, commit + push con mensaje claro.