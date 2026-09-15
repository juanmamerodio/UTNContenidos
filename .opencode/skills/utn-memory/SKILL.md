---
name: utn-memory
description: Use at the end of any UTNContenidos session or feature to persist state. Append-only protocol for memory.md (source of truth) and updates to DocumentoCronologico.md (internship journal) when the change is user-facing or architectural.
---

# UTNContenidos — Protocolo de Memoria

## memory.md (fuente de verdad técnica)
- SOLO append. Nunca sobreescribir entradas anteriores.
- 4 secciones a mantener:
  1. `Mapa de Archivos` — actualizar si cambió la estructura.
  2. `Backlog Técnico Priorizado` — mover ítems a ✅ con la tarea.
  3. `Log de Conversaciones` — 1 fila por evento: fecha + qué + archivos.
  4. `Decisiones de Arquitectura Permanentes` — solo decisiones que guían el futuro.
- Actualizar la fecha de "Última actualización" en el header.

## DocumentoCronologico.md (bitácora de pasantía)
- Tono: humano, formal, explicativo, simple. Español argentino.
- Estilo: títulos con fecha ("## El 8 de septiembre — ..."), tablas (Cambio | Archivo | Para qué), párrafos con el "por qué".
- Se actualiza cuando el cambio es: funcionalidad nueva, hito, decisión de arquitectura, o hitos de sprint.
- No registrar cada micro-fix; agrupar por día/sprint.

## Al cerrar sesión
1. Actualizar `memory.md` (log + backlog + fecha).
2. Si corresponde, agregar sección a `DocumentoCronologico.md`.
3. Verificar que `PLAN_ALPHA_5*.md` refleje el sprint actual.