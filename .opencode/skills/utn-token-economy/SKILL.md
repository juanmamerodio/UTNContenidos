---
name: utn-token-economy
description: Use every session on UTNContenidos to minimize token usage. Prefer targeted search over full-file reads, use memory.md as index, and keep responses condensed.
---

# UTNContenidos — Economía de Tokens

Regla de oro: **no releer archivos completos si ya se conocen.**

## Preferencias de herramientas
1. `glob` para ubicar archivos por patrón.
2. `grep` para localizar símbolos (funciones, IDs, strings) en vez de `Read` completo.
3. `Read` con `offset/limit` SOLO para el tramo necesario.
4. Si `memory.md` ya tiene el dato, usarlo como índice y no re-explorar.

## Archivos grandes (evitar lectura completa)
| Archivo | Líneas | Cuándo leer entero |
|---------|--------|--------------------|
| `app.md` | ~1090 | Solo si se toca GAS |
| `style.css` | ~1830 | Solo si se toca estilo |
| `script.js` | ~890 | Solo si se toca frontend |

## Respuestas
- Condensar: tablas + bullets cortos. Sin preámbulos.
- Cambios chicos → reporte de 3-5 líneas con `archivo:línea`.
- Al cerrar trabajo: actualizar `memory.md` (una entrada) y `DocumentoCronologico.md` (si es hitórico de pasantía), no duplicar contexto en el chat.

## Config útil (opcional)
`tool_output.max_lines` y `max_bytes` recortan salidas de Bash; `compaction` activa reduce turnos.