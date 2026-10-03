# 🌟 PLAN MAESTRO DE FUSIÓN INTEGRAL: ALPHA UX → NEXT.JS 15 BETA (3D 2026 / iOS 27 + Material 4)

> **Misión:** Trasladar el 100% de la experiencia visual, calidez institucional y riqueza interactiva del prototipo Alpha (`prototype-alpha/index.html` y `style.css`) a la arquitectura moderna **Next.js 15 + TypeScript + Supabase**, elevándola con estética **3D Glassmorphism 2026 (iOS 27)** y microinteracciones fluidas **Material 4**.
> **Principio de ingeniería:** Mantener intacto el backend existente (Next Server Actions, RAG pgvector, Gemini 3.5, streaming SSE, Reveal.js) mientras se reemplaza la capa visual deficiente por la interfaz definitiva.

---

## 🏛️ DIAGNÓSTICO DE LA BRECHA (GAP ANALYSIS)

| Dimensión | Prototipo Alpha (Aclamado) | Estado Actual Beta (Next.js) | Meta Fusión 2026 |
|---|---|---|---|
| **Atmósfera & Fondo** | `ambient-glow` con 3 esferas orbs animadas y gradientes esmeralda UTN (#06a28a). | Fondo plano gris/blanco sin profundidad. | **Orbs multicapa 3D reactivas** con desenfoque 120px + iluminación volumétrica satinada. |
| **Identidad & Layout** | Header flotante glass con logo oficial UTN, subtexto "Facultad Regional Delta", badges y dropdown de usuario. | Título simple `<h1>` suelto en cada página sin cohesión. | **AppShell institucional unificado:** Header glass flotante con logo UTN, navegación activa y footer institucional con links FRD y soporte. |
| **Flujo Didáctico** | Stepper pedagógico de 3 pasos ("1. Elegí tu Materia → 2. Revisá el Plan → 3. Exportá"). | Sin guía visual: el docente no sabe en qué etapa está. | **Stepper interactivo háptico/elástico** (`cubic-bezier(0.16, 1, 0.3, 1)`) adaptado a docentes 50+. |
| **Dashboard de Materias** | Tarjetas `materia-card` con elevación, insignias de nivel, botón "Gestionar/Reclamar", filas táctiles ≥48px con hover satinado. | Tarjetas despojadas con un tag `<details>` seco. | **Cards 3D elevadas (Material 4)** con chips de nivel translúcidos, hover con elevación sutil, botón modal de gestión y nuevo tema. |
| **Configurador de Clase** | Modal iOS 27 con pills de duración/slides, selects en pastillas, chips de momentos didácticos y acordeones de opciones avanzadas. | Formulario vertical básico en la página `/generar`. | **Configurador iOS 27 completo:** selector de diapositivas 5-20 con display numérico gigante, chips de momentos, detalles colapsables y selector de plantillas. |
| **Visualizador de Clase** | Grilla de 4 secciones pedagógicas (Enfoques, Plan de Aula, Diapositivas con editor/reformulador quirúrgico, Ilustraciones) + Slides. | Solo un iframe plano con botones HTML/PPTX/PDF. | **Vista de Entrega Doble:** Panel pedagógico enriquecido (plan de clase + momentos) + Visor Reveal.js en marco glass 3D con acciones de descarga directa. |
| **Modales & Diálogos** | Modales nativos `<dialog>` con backdrop blur, modal de reformulación, modal de edición manual y confirmaciones claras. | Sin modales: acciones dispersas o ausentes. | **Sistema de Modales 3D Glass:** Edición de slide previa al export, reformulación quirúrgica y modal de carga con spinner de pulso esmeralda. |

---

## 📐 ARQUITECTURA DE MÓDULOS DE FUSIÓN

```
app/
├── layout.tsx                   # Inyecta: Fuentes Google (Outfit+Inter+Montserrat), Ambient Glow 3D, AppShell
├── globals.css                  # Reconstrucción 100%: Tokens Alpha + Sombras 3D + Glass iOS 27 + Material 4
├── components/
│   ├── layout/
│   │   ├── AppHeader.tsx        # Header flotante con logo UTN.jpg, badge campus y user menu
│   │   ├── AppFooter.tsx        # Footer institucional UTN FRD (dirección, enlaces, soporte)
│   │   └── AmbientGlow.tsx      # Orbs animadas con gradientes UTN esmeralda
│   ├── ui/
│   │   ├── StepperDidactico.tsx # Stepper 3 pasos para docentes 50+
│   │   ├── GlassCard.tsx        # Card con borde de luz reflectiva y blur satinado
│   │   ├── MaterialButton.tsx   # Botón táctil con elevación, píldora y micro-resorte
│   │   └── ToastNotification.tsx# Toasts translúcidos institucionales
│   ├── dashboard/
│   │   ├── MateriaCardPro.tsx   # Card de cátedra con badges, filas de temas y modal "Agregar tema"
│   │   └── ModalReclamar.tsx    # Diálogo de oferta académica para asociar cátedras
│   └── generador/
│       ├── ConfigPanelIOS27.tsx # Configurador completo de parámetros y momentos didácticos
│       ├── SeccionesPedagogicas.tsx # Guía docente: enfoques, cronograma de aula y prompts
│       ├── SlideCardInteractive.tsx # Card de slide con botones "✏️ Editar" y "🔄 Reformular"
│       ├── ModalEditarSlide.tsx # Edición manual de textos previa al export
│       └── ModalReformular.tsx  # Prompt correctivo para regenerar 1 diapositiva puntual
```

---

## 🚀 FASES DE EJECUCIÓN PASO A PASO (SIN DESARMAR EL BACKEND)

### 🔹 FASE 1: Fundación Visual, Atmósfera 3D y AppShell
- [ ] Copiar `prototype-alpha/UTN.jpg` a `public/UTN.jpg` para disponer del logo oficial institucional.
- [ ] Trasladar e integrar la paleta cromática, sombras satinadas y reglas tipográficas de `prototype-alpha/style.css` dentro de `app/globals.css`, sumándole variables de perspectiva 3D y bordes especulares (iOS 27).
- [ ] Crear los componentes `AmbientGlow.tsx`, `AppHeader.tsx` y `AppFooter.tsx`.
- [ ] Conectar en `app/layout.tsx` las fuentes `Outfit`, `Montserrat` e `Inter` junto con la estructura de layout permanente.

### 🔹 FASE 2: Pantalla de Login Institucional Premium
- [ ] Revestir `app/login/page.tsx` con el diseño original de la Alpha:
  - Tarjeta central `glass-panel` con logo UTN prominente.
  - Badge institucional "Campus Docente UTN FRD".
  - Subtítulo explicativo universitario.
  - Inputs con etiquetas flotantes e iconos SVG accesibles.
  - Botón táctil con flecha de avance y efecto brillo.

### 🔹 FASE 3: Dashboard Universitario y Gestión de Materias
- [ ] Incorporar el `StepperDidactico` activo en el Paso 1.
- [ ] Migrar el header del Dashboard ("¿Qué clase preparamos hoy?" + botón "Gestionar / Reclamar Materias").
- [ ] Diseñar `MateriaCardPro` respetando el formato visual de cátedra: badge de nivel, descripción abreviada, lista de temas con hover dinámico y botón destacado "Preparar Clase".
- [ ] Integrar el modal estilizado para agregar nuevo tema y catálogo de materias.

### 🔹 FASE 4: Generador de Clases & Configurador iOS 27
- [ ] Integrar el stepper activo en el Paso 2 ("Estructura de Clase Lista").
- [ ] Reconstruir el panel de configuración con estética iOS 27:
  - Pastillas (pills) para duración, estilo visual, nivel de audiencia, tipo de ejemplos y tipo de imágenes.
  - Slider háptico de diapositivas (5 a 20) con indicador numérico grande para fácil lectura.
  - Chips interactivos para seleccionar los Momentos Didácticos (Gancho, Concepto, Caso aplicado, Esquema, Desafío).
  - Acordeón colapsable para instrucciones libres y URLs complementarias.

### 🔹 FASE 5: Entrega Pedagógica, Visor Reveal.js 3D & Modales Quirúrgicos
- [ ] Restaurar la presentación en 4 secciones pedagógicas generadas por IA:
  - **A. Enfoques sugeridos** (orientaciones de cátedra).
  - **B. Plan y cronograma de aula** (tabla de tiempos y momentos didácticos).
  - **C. Presentación Reveal.js interactiva** (con toolbar superior de descarga HTML, PPTX y PDF).
  - **D. Tarjetas de diapositivas individuales** con acciones directas:
    - Botón **"✏️ Editar"** → `ModalEditarSlide`: permite retocar títulos, viñetas y notas de orador sin tocar el backend.
    - Botón **"🔄 Reformular"** → `ModalReformular`: conecta con el endpoint existente para regenerar solo esa slide vía IA.
- [ ] Modal de progreso con spinner esmeralda institucional y pulso continuo mientras la IA procesa.

### 🔹 FASE 6: Verificación de Integridad y Rendimiento
- [ ] Ejecutar `npm run build` para garantizar compilación TypeScript estricta.
- [ ] Verificar compatibilidad con dispositivos de gama baja (fallback sólido en ausencia de `backdrop-filter`).
- [ ] Comprobar el flujo completo: Login root → Dashboard → Configurar clase → Streaming IA → Editar slide → Descargar Reveal.js / PPTX.

---

## 🎯 DEFINICIÓN DE ÉXITO (DoD)
1. La aplicación luce idéntica o superior a la versión de referencia de `prototype-alpha`, con la riqueza visual de los orbs, cristales nítidos y tipografía institucional.
2. Incorpora los componentes modernos de interacción (Reveal.js 5, streaming SSE en vivo, exportación PPTX nativa).
3. Cumple las directrices de accesibilidad para docentes mayores de 50 años (tipografía legible, botones grandes, contraste WCAG AAA).
4. No se alteró ningún contrato de datos de Supabase ni rutas de API existentes.
