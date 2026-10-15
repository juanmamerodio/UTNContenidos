# Tickets de Desarrollo — Producción Final

> **Ejecución:** Cada ticket representa un *Vertical Slice* de interfaz y comportamiento. Implementar aplicando TDD (donde aplique) y verificación escalonada (`npm run check` + prueba manual).

---

## [x] Ticket 1: UX/UI Dashboard y Botones
**Objetivo:** Rediseñar los botones de acción del Dashboard (MateriaCardPro) para alinear su diseño con la paleta de alto contraste y solucionar errores de maquetación Flexbox.

**Tareas:**
1. Editar `components/dashboard/MateriaCardPro.tsx`.
2. Identificar los botones de acción principal ("Crear clase", "Agregar Tema", etc.).
3. Aplicar clases Tailwind para fondo blanco (`bg-white`), borde de color primario (`border-2 border-[color-primario]`) y texto primario (`text-[color-primario]`).
4. Añadir animación `whileTap={{ scale: 0.95 }}` de Framer Motion.
5. Corregir el contenedor padre (Flexbox) ajustando el `align-items` o `justify-content` para que los botones queden prolijos y alineados inferior o centralmente sin desfasajes.

---

## [x] Ticket 2: Refactor del Historial (Carpetas por Cátedra)
**Objetivo:** Modificar la vista de Historial para implementar el diseño Mobile-First de agrupación por materias mediante tarjetas estilo "carpeta".

**Tareas:**
1. Editar `app/historial/page.tsx`.
2. Agrupar las presentaciones obtenidas por `materia_id` o `nombre_materia`.
3. Crear un estado local (ej. `materiaSeleccionada`) para alternar la vista entre el "Índice de Carpetas" y el "Detalle de Clases".
4. Renderizar la vista principal como una grilla (`grid-cols-2` en móvil, `gap-4`) de tarjetas grandes y táctiles que representen las materias.
5. Renderizar la vista de detalle con el listado de presentaciones de la materia seleccionada, incluyendo un botón de "Volver" grande y táctil.

---

## [x] Ticket 3: Legibilidad y Navegación Reveal.js
**Objetivo:** Garantizar que las presentaciones proyectadas sean legibles (alto contraste) y fáciles de navegar en dispositivos móviles de forma lineal.

**Tareas:**
1. Ubicar el archivo responsable de generar/renderizar la presentación Reveal.js (ej. `lib/deck.ts` o la plantilla en `app/api/presentacion/...`).
2. En la configuración de inicialización de Reveal.js, agregar/modificar la propiedad `navigationMode: 'linear'`.
3. Inyectar o modificar las reglas CSS de la plantilla (variables CSS de Reveal o `<style>` custom) para forzar un color de texto oscuro legible (ej. `#1F2937`) sobre los fondos predeterminados claros, solucionando los problemas de ilegibilidad.

---

## [x] Ticket 4: Microcopy y Espacios Vacíos
**Objetivo:** Proveer guías claras al usuario en formularios críticos y optimizar el uso del espacio.

**Tareas:**
1. Editar el formulario de ingesta de apuntes (probablemente `components/FormApunte.tsx` o similar dentro de `app/materias/[id]/apuntes/`).
2. Actualizar el placeholder o la etiqueta de ayuda del campo de URL para indicar explícitamente: *"Pegá el enlace a un apunte o artículo público. No se aceptan links con contraseña ni PDFs locales."*
3. Revisar los "Empty States" del historial y apuntes para asegurar que ofrezcan un texto cálido y direccional (ej. *"Aún no generaste clases. Andá al Dashboard para empezar."*).
4. Limpiar excesos de margen (`mb-32`, `pt-20`, etc. si los hay en exceso) para optimizar el espacio útil en pantallas pequeñas.
