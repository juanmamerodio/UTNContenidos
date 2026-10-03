# 🎨 PLAN MAESTRO: MOTOR VISUAL DE PRESENTACIONES ÉLITE (INSPIRACIÓN NOTEBOOKLM / GOOGLE RESEARCH)

> **Diagnóstico del problema:** Las presentaciones actuales (`lib/deck.ts` y Reveal.js por defecto) son listas de viñetas secas sobre fondos planos con tipografía de sistema (`Segoe UI`), carentes de narrativa visual, diagramación y diseño editorial.
> **Objetivo innegociable:** Transformar el motor de presentaciones de UTNContenidos en una experiencia visual de **calidad de publicación académica (NotebookLM / Apple Keynote / Awwwards)**: diagramación *Bento Grid*, métricas numéricas colosales, esquemas visuales de proceso (*Mermaid.js / SVG*), tarjetas conceptuales translúcidas y tipografía suiza/moderna de alto impacto.

---

## 🔬 ANATOMÍA VISUAL: ¿POR QUÉ NOTEBOOKLM FUNCIONA TAN BIEN?

NotebookLM de Google no genera diapositivas de texto aburrido: genera **artefactos cognitivos estructurados**:

| Componente | Estado Actual (Deficiente) | Estándar NotebookLM / Élite 2026 |
|---|---|---|
| **Estructura por Slide** | Título + 4 viñetas verticales idénticas. | **Layouts asimétricos dinámicos**: Bento-Grid de 2 o 3 columnas, comparativas lado a lado, flujo de etapas secuenciales. |
| **Puntos de Foco Cognitivo** | Cero jerarquía. Todo el texto tiene el mismo tamaño. | **Métricas Gigantes (Big Numbers)**: *KPIs* o conceptos centrales en display de 48px–64px con microetiquetas. |
| **Diagramas y Esquemas** | Ausentes. Solo texto. | **Diagramas interactivos renderizados en vivo**: soporte nativo de **Mermaid.js** (árboles, grafos, secuencias) y diagramas SVG vectoriales. |
| **Visual Cards & Glass** | Fondos blancos o azules lisos. | **Superficies táctiles satinadas**: tarjetas con bordes luminiscentes, badges de taxonomía de clase y pastillas temáticas. |
| **Tipografía y Estilo** | `Segoe UI` estándar sin jerarquía. | Tipografía editorial: `Outfit` (Headings) + `Inter` (Cuerpo y notas) + `Fira Code` (bloques técnicos/fórmulas). |
| **Pedagogía de Aula** | Sin indicación de dinámica. | Indicador del momento didáctico activo en cabecera: *[Gancho ⚡]*, *[Concepto Núcleo 🧠]*, *[Caso Real 🏢]*, *[Desafío 🎯]*. |

---

## 🏛️ ARQUITECTURA DEL NUEVO MOTOR VISUAL

```
lib/
├── deck.ts                # Builder HTML Reveal.js: Inyecta CSS NotebookLM, layouts dinámicos y Mermaid.js
├── pptx.ts                # Motor PPTX: Tarjetas bento nativas, formas geométricas y badges estilizados
app/
├── api/ia/route.ts        # Prompt Élite: Obliga al modelo a estructurar diapositivas con tipologías ricas
components/
└── generador/
    ├── GeneradorClase.tsx # Visor interactivo con controles de diapositiva, pantalla completa y notas
```

---

## 📐 TIPOLOGÍAS DE DIAPOSITIVAS RICAS (LAYOUT CATALOG)

El motor de IA y el builder soportarán **6 arquetipos de diseño** según el contenido pedagógico:

### 1. `portada_hero`
- Gran banda institucional de ingeniería UTN FRD.
- Título monumental con interlineado ajustado.
- Metadatos en pastillas: Cátedra, Nivel, Fecha, Profesor.
- Gradiente profundo satinado con micro-resplandor esmeralda.

### 2. `bento_conceptos` (3 Cards Asimétricas)
- **Card Principal:** Concepto neurálgico con fondo contrastante o acentuado.
- **Card Secundaria:** Ejemplo tangible o caso práctico del polo Zárate/Campana.
- **Card Métrica/Impacto:** Número clave o dato duro sintetizado.

### 3. `comparativa_vs` (Lado a Lado)
- 2 columnas simétricas perfectamente delimitadas.
- Columna A: Enfoque Clásico / Premisas tradicionales.
- Columna B: Enfoque Moderno / Paradigma UTN.

### 4. `diagrama_proceso` (Mermaid.js integrado)
- Renderizado de diagramas de flujo interactivos directamente en la diapositiva:
  `A[Entrada de Datos] --> B[Procesamiento Algorítmico] --> C[Resultado en Planta]`

### 5. `cita_o_desafio` (Minimal Impact)
- Pregunta disparadora para el aula en tamaño 2.5rem con comillas tipográficas de autor.
- Caja de diálogo docente: dinámica propuesta para los estudiantes.

### 6. `takeaway_sintesis`
- Resumen final de cátedra en cuadrícula de 3 conclusiones clave antes de cerrar la clase.

---

## 🛠️ FASES DE EJECUCIÓN PASO A PASO

### 🔹 FASE 1: Rediseño del Prompt en `app/api/ia/route.ts`
- Modificar el `SYSTEM_PROMPT` para que la IA asigne a cada slide un `layout` específico:
  - `layout: 'portada' | 'bento' | 'comparativa' | 'proceso' | 'desafio' | 'sintesis'`
- Exigir campos estructurados de diseño: `metricaGigante`, `diagramaMermaid`, `columnas`, `destacado`.

### 🔹 FASE 2: Transformación Integral de `lib/deck.ts` (Reveal.js 5)
- Inyectar el runtime de **Mermaid.js** autocontenido para graficar automáticamente procesos sin imágenes externas.
- Rediseñar el CSS embebido de Reveal con el tema **NotebookLM Élite**:
  - Sombras suaves, radios de 16px, bordes especulares y colores institucionales (`#06a28a`, `#047a68`, `#0f1f1c`).
  - Renderizador condicional por cada `layout`.

### 🔹 FASE 3: Elevación del Exportador PowerPoint (`lib/pptx.ts`)
- Replicar la diagramación Bento Grid en formato vectorial de PowerPoint:
  - Rectángulos redondeados nativos (`roundRect`), cajas de acento diferenciadas, iconos temáticos y jerarquías tipográficas en 16:9.

### 🔹 FASE 4: Experiencia de Proyección en Pantalla Completa
- Integrar en `GeneradorClase.tsx` toolbar interactiva:
  - Botón **"🖥️ Proyectar Clase (Pantalla Completa)"** que abre la presentación sin bordes para el cañón del aula.
  - Atajos de teclado: flechas, barra espaciadora y tecla `S` para ventana de orador con cronómetro.

---

## 🎯 DEFINICIÓN DE ÉXITO (DoD)
1. Ninguna diapositiva generada es una simple lista de viñetas aburridas.
2. Cada presentación cuenta con variedad de composiciones (Bento, Proceso, Comparativa).
3. Los diagramas de ingeniería se dibujan en vivo mediante Mermaid.js.
4. Las exportaciones en PPTX e imprimibles reflejan exactamente la misma riqueza visual.
5. El First Load JS y rendimiento no se ven afectados (costo $0, cero dependencias pesadas innecesarias).
