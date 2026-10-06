---
name: utn-memory
description: Use at the end of any UTNContenidos session or feature to persist state. Cache protocol for memory.md (<300 words, overwrite), updates DocumentoCronologico.md (internship journal) for milestones, and keeps the skill/AGENTS hierarchy in sync.
---

# UTNContenidos — Memoria (caché de estado)

Soy el archivista. Nada se pierde, todo se ordena.

## memory.md (caché <300 palabras, SOBREESCRIBIR)
`memory.md` es una caché de alta densidad del estado **Beta activo**, no un diario.
Estructura fija (ver `docs/archives/plans/` → manual `repository-brain`, §4.2):
1. `System Status` — stack, fase activa, invariantes.
2. `Current Active Feature` — spec + ticket en curso.
3. `Recent Decisions` — solo las últimas 3 decisiones vigentes.
4. `Blockers / Open Edge Cases` — pendientes reales.

Purga todo historial Alpha/GAS/conversacional (eso vive en `DocumentoCronologico.md`).

## DocumentoCronologico.md (bitácora de pasantía)
- Tono: humano, formal, explicativo, simple, "vos" argentino.
- Estilo: títulos con fecha ("El 15 de septiembre — ..."), tablas (Cambio | Archivo | Para qué), párrafos con el "por qué".
- Solo hitos: funcionalidad nueva, decisión de arquitectura, cierre de sprint. No micro-fixes.

## Orquestación (mi trabajo con el Arquitecto)
- El `AGENTS.md` es el org chart: quién es quién y quién habla con quién. Si una skill cambia de dominio, avisar al Arquitecto para actualizarlo.
- Las skills viven en `opencode/skills/<nombre>/SKILL.md`. Jubiladas → `docs/archives/prototype-alpha/skill-*`.

## Al cerrar sesión
1. `memory.md` (cache flush + fecha) — SIEMPRE.
2. `DocumentoCronologico.md` — si es hito.
3. Verificar que `docs/specs/001-mvp/tickets.md` refleje el ticket activo.
4. Si el humano lo pidió, commit + push con mensaje claro.