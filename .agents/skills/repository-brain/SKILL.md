---
name: repository-brain
description: Manual maestro y skill de orquestación agéntica para la auditoría, reorganización de archivos Markdown, depuración de memoria caliente (memory.md) y gobierno del repositorio bajo Spec-Driven Development (SDD).
---

# Manual Maestro y Skill de Gobernanza Agéntica: "Repository Brain"
> **Versión de Producción (Estado Beta)**  
> **Ámbito:** Orquestación Global de Contexto, Gobierno de Markdown y Saneamiento de Memoria  
> **Destinatario:** Agentes de Terminal (Claude Code, OpenCode, Codex) y Sub-agentes Trabajadores

---

## 1. Diagnóstico / Fundamento Técnico: La Filosofía del Orden Contextual

### 1.1 El Orden Estructural como Techo de la Inteligencia Agéntica
Un modelo de lenguaje no razona en el vacío; su capacidad predictiva está directamente delimitada por la calidad del contexto al que accede. Como demostraron Simon Willison y Matt Pocock, el código de mala calidad y los repositorios desordenados son los insumos más costosos en la era de la IA. Un repositorio caótico genera "ruido contextual", forzando al modelo a re-leer miles de tokens irrelevantes, provocando **alucinaciones, regresiones y pérdida de alineación técnica**.

### 1.2 La Curva de la Votación de Atención: Smart Zone vs. Dumb Zone
El contexto de un LLM no tiene un rendimiento uniforme:
* **Smart Zone (<100k tokens):** Franja de máxima atención y razonamiento nítido. El modelo respeta las restricciones de arquitectura, aplica TDD con rigor y realiza cambios quirúrgicos.
* **Dumb Zone / Context Rot (>100k - 140k+ tokens):** Degradación cuadrática ($O(N^2)$) de la matriz de atención (*loss in the middle*). El modelo se vuelve difuso, ignora reglas del `CLAUDE.md`, acepta falsos positivos en los tests y gasta hasta un 98% más de tokens por turno en re-lecturas inútiles.

### 1.3 El Patrón Momento y la Eliminación del "Sedimento"
Confiar en la autocompactación tardía (`/compact`) deja un "sedimento" de decisiones pasadas, errores corregidos y alternativas descartadas. La solución profesional es el **Patrón Momento**: mantener el repositorio como una fuente de verdad en disco, extraer el estado actual mediante un traspaso de sesión (`/session-handoff`), ejecutar `/clear` para resetear el historial a **0 tokens**, y reiniciar la ejecución siempre dentro de la **Smart Zone**.

---

## 2. Leyes Innegociables del Repositorio (Constitución de Contexto)

1. **Carga Progresiva de Contexto (*Progressive Disclosure*):** Ningún archivo de configuración global (`CLAUDE.md` o `AGENTS.md`) debe superar las **150-200 líneas**. Actúa únicamente como ruteador e índice. Los detalles viven en `docs/` o `.agents/skills/`.
2. **Unicidad de la Fuente de Verdad:** Prohibida la coexistencia de reglas duplicadas o contradictorias en la raíz (ej. `AGENTS.md` vs `CLAUDE.md`). Se mantiene un único archivo primario y los demás rutean hacia él.
3. **Aislamiento de la Memoria Caliente (`memory.md`):** `memory.md` es una caché de sobreescritura de alta densidad (<300 palabras). No es un diario cronológico. Contiene exclusivamente la foto técnica del estado **Beta activo**.
4. **Desglose en Cortes Verticales (*Vertical Slices / Tracer Bullets*):** Cada especificación o ticket debe cruzar todas las capas (DB -> API -> UI) para permitir la validación determinista en runtime. Prohibido el rebanado horizontal aislado.
5. **Verificación Programática Estricta (TDD Red-Green + Runtime Check):** El agente debe forzar el fallo de un test (RED) antes de implementar (GREEN) y ejercitar el servidor local en ejecución mediante `curl` o runners automatizados.

---

## 3. Protocolo de Auditoría y Reorganización de Archivos Markdown (`docs/`)

Para evitar la pudrición de documentación (*Doc Rot*), el agente debe clasificar cada archivo `.md` del proyecto en una de las cuatro categorías operativas:

```
                                  ÁRBOLES DE CONOCIMIENTO (MARKDOWN)
                                                 │
        ┌────────────────────────┬───────────────┴───────────────┬────────────────────────┐
        ▼                        ▼                               ▼                        ▼
  [1. ACTIVOS]             [2. CALIENTES]                  [3. ARCHIVO]             [4. OBSOLETOS]
  (docs/constitution.md)   (memory.md < 300 words)         (docs/archives/)         (Eliminación total)
  (docs/specs/001/...)     (GLOSSARY.md)                   (Specs completadas)      (Alphas / Pruebas)
```

### 3.1 Matriz de Clasificación y Mantenimiento

| Categoría | Ubicación Permitida | Criterio de Inclusión | Acción del Agente |
| :--- | :--- | :--- | :--- |
| **Constitución & Ruteo** | `CLAUDE.md` / `AGENTS.md` | Ruteador global de <150 líneas. Invariantes del stack, comandos de test y mapa de rutas. | Mantener comprimido. Eliminar duplicaciones y punteros muertos. |
| **Glosario de Dominio** | `GLOSSARY.md` | Términos del Lenguaje Ubicuo (DDD) acordados durante el *grilling*. | Mantener actualizado en formato tabla Markdown. |
| **Especificación Activa** | `docs/specs/{id}-{nombre}/` | `spec.md` (formato EARS) y `tickets.md` de la feature actual en desarrollo. | Mantener en seguimiento activo mientras existan tickets pendientes `[ ]`. |
| **Memoria Caliente** | `memory.md` | Resumen de estado Beta activo (<300 palabras). Próximo ticket y decisiones vigentes. | Sobreescribir. Purgar todo historial Alpha o conversacional. |
| **Documentación Archivada** | `docs/archives/` | Specs, PRDs o notas de features cuyos PRs ya fueron integrados a `main`. | Mover desde `docs/specs/` a `docs/archives/`. Desactivar de la ruta principal. |
| **Basura / Obsolescencia** | Raíz o carpetas temporales | Borradores sueltos, notas de prueba, logs viejos de chat o archivos `.md` duplicados. | **Eliminar físicamente** del sistema de archivos. |

---

## 4. Protocolo de Saneamiento y Depuración de Caché Caliente (`memory.md`)

### 4.1 Diagnóstico de Contaminación de Caché
Un `memory.md` contaminado contiene registros de pruebas iniciales ("alphas"), errores de compilación antiguos, discusiones sobre librerías descartadas y logs de sesión pasados. Al iniciar un chat nuevo, la lectura de esta información desactualizada induce al modelo a usar patrones o rutas obsoletas.

### 4.2 Regla de Purga "Solo Beta"
El agente debe depurar `memory.md` reduciéndolo a una estructura fija que **no supere las 300 palabras**, aplicando el siguiente formato canonical:

```markdown
# Current Technical Memory (Beta Active State)

## System Status
- Architecture: Next.js 15 (App Router) + Supabase RLS + Vitest.
- Active Phase: Beta v1.0. All Alpha POCs deprecated and purged.
- Invariants: PII compliance (Ley 25.326). No ORM usage (`@supabase/supabase-js` only).

## Current Active Feature
- Feature: `docs/specs/001-mvp/spec.md`
- Active Ticket: Ticket #1 (Vertical Slice: Upload PDF -> Supabase DB -> UI).

## Recent Decisions (Last 3)
1. RLS policies enforce `docente` ownership on INSERT; public SELECT on published TPs.
2. Author identity relies on `display_name` to prevent PII leaks (`dni`/`email`).
3. Runtime verification requires local dev server execution + `curl` proof.

## Blockers / Open Edge Cases
- None. System stable.
```

---

## 5. Procedimiento Paso a Paso de Ejecución (SOP del "Repository Brain")

Cuando este manual sea invocado o el usuario solicite reorganizar/sanear el repositorio, el agente debe seguir estrictamente la siguiente secuencia de 5 pasos:

```
[Inicio] ➔ Paso 1: Escaneo ➔ Paso 2: Retro ➔ Paso 3: Purga Caché ➔ Paso 4: Reorganización ➔ Paso 5: Verificación
```

### Paso 1: Escaneo e Inspección del Árbol de Conocimiento
1. Inspeccionar la raíz del proyecto y listar todos los archivos `.md`.
2. Verificar si existe duplicación entre `AGENTS.md` y `CLAUDE.md`. Si ambos existen con contenido divergente, consolidar las reglas en `CLAUDE.md` y transformar `AGENTS.md` en un puntero comprimido.
3. Verificar la validez de los enlaces internos (detectar *dead pointers*).

### Paso 2: Auditoría con Retrospectiva Agéntica (`/retro`)
1. Inspeccionar los logs de las últimas sesiones para identificar ineficiencias de tokens, comandos fallidos o búsquedas repetitivas.
2. Identificar si el agente gastó ciclos buscando archivos ocultos (ej. carpetas `.claude/` o `.agents/`).
3. Agregar parches de una línea al `CLAUDE.md` para corregir los comandos de build/test/linter en caso de omisiones.

### Paso 3: Saneamiento y Depuración de `memory.md`
1. Abrir `memory.md`.
2. Eliminar toda referencia a pruebas "Alpha", prototipos descartados, firmas de funciones deprecadas y conversaciones pasadas.
3. Redactar la foto actual del **Estado Beta** en menos de 300 palabras siguiendo la plantilla del apartado 4.2.

### Paso 4: Reorganización de Specs y Archivos
1. Crear la carpeta `docs/archives/` si no existe.
2. Escanear `docs/specs/`:
   * Si un ticket o spec tiene todos sus elementos completados (`[x]`), mover la carpeta completa a `docs/archives/`.
   * Si una spec está activa, verificar que esté estructurada en formato EARS y desglosada en *Vertical Slices* dentro de `tickets.md`.
3. Eliminar archivos `.md` temporales o sueltos en la raíz que no pertenezcan al índice oficial.

### Paso 5: Verificación en Runtime e Informe Final
1. Ejecutar los comandos de verificación declarados en el `CLAUDE.md` (`npm run check`, `npm test`) para garantizar que la reorganización no rompió la suite de integración.
2. Emitir un informe sintético al usuario (2-3 oraciones) confirmando:
   * Archivos `.md` consolidados y archivados.
   * Reducción de líneas y sanitización realizada en `memory.md`.
   * Estado de sanidad del repositorio y consumo de contexto inicial post-limpieza.

---

## 6. Errores Comunes y Antipatrones a Evitar

1. **Mantener Logs Conversacionales en la Memoria:** Guardar conversaciones completas en `memory.md`. *Efecto:* Satura la ventana de contexto y arrastra errores viejos.
2. **Promover la Persona Corporativa Superficial:** Rellenar las reglas con roles como "CEO de Scrum" o "Master Senior". *Efecto:* Inyecta ruido y desperdicia tokens. Usar ruteo declarativo directo.
3. **No Mover Specs Finalizadas a `docs/archives/`:** Dejar decenas de specs viejas en la carpeta de lectura activa. *Efecto:* El agente sufre de *Doc Rot* e intenta conciliar código actual con requisitos del pasado.
4. **Reorganizacion Manual sin Sanity Test:** Mover carpetas o archivos sin correr los comandos de verificación de tipos (`tsc`) o tests (`vitest`). *Efecto:* Riesgo de romper referencias en build o en scripts de automatización.

---
*Manual y Skill empaquetado para la gobernanza integral de repositorios agénticos.*
