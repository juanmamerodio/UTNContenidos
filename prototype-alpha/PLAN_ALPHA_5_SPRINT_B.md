# PLAN_ALPHA_5_SPRINT_B — Configurador de Clase (Modelo Espiral)

> **Meta:** transformar la generación de clases en un **asistente personalizable estilo NotebookLM**: duración, cantidad de diapositivas, estilo visual, nivel, ejemplos, imágenes, momentos, temas extra y plantillas guardadas. Todo opcional → vacío = plantilla predeterminada.

## Fundamentos del modelo espiral aplicado al Sprint B

Cada ciclo = **Planificar → Analizar riesgos → Desarrollar/Verificar → Revisar**. Avanzamos un giro por iteración, manteniendo la build estable.

---

## Espiral 1 — Contrato y Alcance [IMPLEMENTADO en esta iteración]
**Planificar:** definir contrato `configuracion` end-to-end y el configurador UI.
**Riesgos:** romper el flujo de 7 slides · confundir al docente 50+ con muchas opciones · gasto de tokens extra.
**Mitigación:** todos los campos opcionales · progressive disclosure (selects con "Predeterminado") · cap 20 slides.
**Verificación:** los campos llegan a Gemini y la salida respeta N slides.

### Contrato `configuracion` (frontend → backend → prompt)
```js
{
  duracion: "",        // "" | "40" | "60" | "120" | "bloque-doble"
  numSlides: 7,        // 5..20
  estilo: "",          // "" | "minimalista" | "contemporanea" | "alta-carga"
  nivel: "",           // "" | "intro" | "intermedio" | "avanzado" | "mixto"
  ejemplos: "",        // "" | "cotidianos" | "industria" | "ambos" | "ninguno"
  imagenes: "",        // "" | "fotos" | "ilustraciones" | "diagramas" | "ninguna"
  urlTeoria: "",       // override del temario
  temasAdicionales: [],// ["tema A", "tema B"]
  momentos: [],        // subset de [hook, concepto_nucleo, caso_aplicado, esquema_proceso, desafio_aula]
  instrucciones: ""    // texto libre ≤2000
}
```

**Implementado:**
- `index.html`: modal `modal-contexto` reescrito como Configurador (selects + slider + momentos + plantillas).
- `script.js`: recolección de `configuracion`, plantillas en `localStorage.utn_template_clase`, `ejecutarGeneracionIA(materia, tema, configuracion)`.
- `app.md`: `generarClaseConGeminiGAS(..., configuracion)` → N slides dinámicas + momentos seleccionados.
- `api/gemini.js`: `configuracion` inyectado en el prompt con regla de N slides.

---

## Espiral 2 — Regeneración quirúrgica (1 slide) [IMPLEMENTADO]
**Objetivo:** botón "Reformular esta diapositiva" por card en `view-generator`.
**Riesgo:** inconsistencia del JSON de salida. **Mitigación:** pedir SOLO el objeto de esa slide contra el schema y reemplazar por índice.
**DoD:** al regenerar, la slide N cambia; el resto intacto; export usa el array completo.

**Implementado:**
- `index.html`: modal `modal-reformular` (textarea + confirmar/cancelar).
- `script.js`: `renderizarSlidesGrid()` reutilizable (botón "🔄 Reformular" por card, salvo portada) + flujo híbrido (Vercel `modo=regenerarSlide` → fallback GAS `regenerarSlideIA`) con reemplazo quirúrgico por índice.
- `app.md`: `regenerarSlideConGeminiGAS()` + case `regenerarSlideIA` en `doPost`.
- `api/gemini.js`: modo `regenerarSlide` con `slideSchema` propio (mismo formato de slide) y `extraerJsonPuro`.

---

## Espiral 3 — Editor previo a exportar [IMPLEMENTADO]
**Objetivo:** editar títulos/contenido a mano en el cliente antes de "Guardar en Slides".
**Riesgo:** ediciones no validadas → XSS. **Mitigación:** sanitizar al renderizar y al exportar (`sanitizeHTML`/`sanitizeURL`).
**DoD:** el JSON en memoria (claseGeneradaActual) refleja las ediciones; Slides y PDF exportan lo editado.

**Implementado:**
- `index.html`: modal `modal-editar` (título, subtítulo, contenido, notas del orador) con maxlength.
- `script.js`: botón "✏️ Editar contenido" en toda tarjeta (incluida portada) + `abrirModalEditar`/guardar que muta `claseGeneradaActual.slides[i]` y re-renderiza. Export Slides/PDF ya consumen ese objeto → ediciones se propagan automáticamente.

---

## Espiral 4 — Plantillas y Cierre [IMPLEMENTADO]
**Objetivo:** "Guardar como plantilla" con nombre, lista de plantillas, borrado.
**Riesgo:** localStorage lleno/roto. **Mitigación:** cap de 10 plantillas, try/catch de parseo.
**DoD:** flujo completo: configurar → generar → editar → exportar, en ≤6 clics, con plantilla reutilizable.

**Implementado:**
- `index.html`: selector de plantillas + campo de nombre + botones Guardar/Cargar/Borrar.
- `script.js`: `utn_plantillas` (objeto nombre→config), `leerPlantillas`/`guardarPlantillas`/`refrescarSelectorPlantillas` con try/catch, N plantillas con nombre en localStorage.

---

## QA global Sprint B (los 4 giros)
- [ ] Login → elegir materia/tema → configurar → generar → exportar en ≤6 clics.
- [ ] Configuración vacía = resultado idéntico al formato predeterminado actual.
- [ ] `node --check` sin errores en `app.md`/`script.js`/`api/gemini.js`.
- [ ] PDF y Slides respetan el número de diapositivas solicitado.
- [ ] Checklist `utn-security-audit` OK (sin regresiones del Sprint A).
- [ ] Costo $0 intacto.