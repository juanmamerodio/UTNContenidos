# Plan S3: Pantallas Definitivas (UX/UI y Flujo Docente)

> **Sprint S3** · **Estado:** Alineado vía grill (listo para ejecutar)
> **Objetivo:** Transformar el prototipo funcional en una herramienta con un flujo guiado impecable, propuesta de valor clara y cero fricción para el docente 50+. Se apoya en el Design System v2 (S2).

---

## 1. Contexto y Problema

S2 resolvió la base visual (mobile-first, tipografías grandes, GPU, contrastes AAA). El **flujo cognitivo** sigue siendo árido: el docente debe entender *por qué* usar la herramienta antes de loguearse y *qué hacer* en cada paso sin adivinar.

Deuda UX/técnica (de `memory.md` y del código):
- `Login` directo, sin beneficios; el lockout es poco visible.
- `Dashboard` con *empty state* básico.
- `app/generar/page.tsx` pasa `materiaNombre={materiaId}` (bug H3); los params de URL no traen el nombre.
- `GeneradorClase.tsx` (417 líneas) mezcla configurador, progreso y resultado en una sola pantalla; el progreso muestra JSON crudo del SSE (últimos 400 chars); el parser SSE está embebido en `generar()` y se rompe si un chunk corta una línea `data:`.
- `StepperDidactico` solo conoce 2 estados (`clase ? 3 : 2`) y sus etiquetas no coinciden con el flujo real.

---

## 2. Decisiones del Grill (cerradas)

| # | Decisión |
|---|----------|
| Q1 | Nombre de materia: **consulta a Supabase** (cliente de servicio) por `materiaId` validando que pertenezca al docente. Si no existe/no pertenece → `redirect('/dashboard')`. Sin `materiaNombre` por URL. |
| Q2 | **Stepper reescrito**: etiquetas *Configurar / Generando / Lista*. En `/generar` arranca en paso 1 y sigue la fase del wizard. |
| Q3 | Paso 1: 3 campos principales visibles (Duración, Momentos, Estilo) + bloque plegable **"Opciones avanzadas"** (nivel, ejemplos, recursos visuales, nº diapositivas, orientaciones libres). Se puede generar con un solo botón. |
| Q4 | Paso 2: **mensajes de progreso humanos** ("Buscando en tu bibliografía…", "Armando las diapositivas…") + `Skeleton`. El stream se acumula internamente sin mostrarse. Sin fases del servidor → textos genéricos rotando cada pocos segundos. |
| Q5 | Error en paso 2 → vuelve a paso 1 con aviso visible y datos conservados. Botón **Cancelar** (`AbortController`) en paso 2. Botón **"Generar otra versión"** en paso 3. |
| Q6 | Login: panel dividido en escritorio (beneficios izq. / formulario der.); en móvil 360px beneficios compactos con íconos apilados arriba. Beneficios: "Clases en 3 clics", "Buscá en tu propia bibliografía (privado)", "Formato oficial UTN". Lockout en tarjeta destacada con ícono de reloj y **"15 minutos"** en negrita. |
| Q7 | **TDD** con Vitest (RED primero) solo sobre lógica pura; sin tests de componentes React. Verificación visual manual a 360px. |
| Q8 | `guardarPresentacion` / historial **fuera de S3** → próximo ticket. |

---

## 3. Alcance (Vertical UI/UX)

### Pantalla 1: Login con Propuesta de Valor
* Layout dividido / tarjeta enriquecida con los 3 beneficios (Q6).
* Lockout visual mejorado.
* **DoD:** el docente nuevo entiende qué gana antes de poner su legajo.

### Pantalla 2: Dashboard Guiado
* Empty state: *"Contactá a la secretaría académica para vincular tus cátedras"*.
* "Preparar Clase" como CTA principal con el degradado accesible de S2.

### Pantalla 3: Generador (Wizard de 3 pasos)
* **Paso 1 Configurar** → `FormularioConfiguracion` (Q3).
* **Paso 2 Procesando** → `PantallaProcesando` (Q4, Q5).
* **Paso 3 Lista** → `VisorResultado` (preview, descargas, `SeccionesPedagogicas`, "Generar otra versión").
* Fases mutuamente excluyentes: `config → procesando → resultado`; `procesando → config` en error/cancelación.
* Bugfix H3 vía Q1; `StepperDidactico` sincronizado con la fase (Q2).

---

## 4. Módulos y Tests (TDD Red-Green)

Lógica pura extraída y testeada primero (`tests/`):
1. **`lib/generador-fase.ts`** (reducer/hook): transiciones `config/procesando/resultado`, error, cancelación, reinicio. Conserva la configuración.
2. **`lib/sse.ts`** (parser de eventos SSE): buffer de líneas incompletas entre chunks; tipos `progreso | chunk | done | error`.
3. **`lib/materia.ts`** (helper): resolver nombre de materia validando pertenencia al docente.

## 5. Matriz de Componentes

| Componente / Ruta | Acción | Riesgo |
|-------------------|--------|--------|
| `app/login/page.tsx` | Panel de beneficios + lockout destacado | Bajo |
| `app/dashboard/page.tsx` | Empty state + CTA | Bajo |
| `app/generar/page.tsx` | Fetch de nombre + validación de pertenencia | Medio |
| `app/generar/GeneradorClase.tsx` | Orquestador delgado (<200 líneas) | Alto |
| `components/generador/FormularioConfiguracion.tsx` | Nuevo | Medio |
| `components/generador/PantallaProcesando.tsx` | Nuevo | Medio |
| `components/generador/VisorResultado.tsx` | Nuevo | Medio |
| `components/ui/StepperDidactico.tsx` | Nuevas etiquetas, prop de fase | Medio |

---

## 6. Reglas Innegociables
1. **Accesibilidad S2:** texto nuevo con `clamp()` y contrastes AAA.
2. **Carga cognitiva nula:** una cosa a la vez; el configurador no convive con la vista previa.
3. **Módulos profundos:** `GeneradorClase` no crece a 500 líneas; se subdivide como en §5.
4. **"Vos", letra grande, 2 clics.** Sin PII en logs/APIs.

## 7. Criterios de Aceptación (DoD S3)
- [ ] Login muestra ≥3 beneficios y lockout destacado.
- [ ] Dashboard con empty state accionable y CTA principal.
- [ ] `generar/page.tsx` resuelve el nombre real de la materia y redirige si no pertenece al docente.
- [ ] Wizard de 3 pasos funcional; nunca hay pantalla en blanco ni JSON crudo; cancelar y reintentar funcionan.
- [ ] Stepper refleja la fase real.
- [ ] Tests RED→GREEN de fase, SSE y materia; `npm run check`, `npm test`, `npm run build` en verde.
- [ ] 0 regresiones responsive a 360px y contrastes verificados.

## 8. Fuera de alcance
- `guardarPresentacion` / historial de presentaciones (siguiente ticket).
