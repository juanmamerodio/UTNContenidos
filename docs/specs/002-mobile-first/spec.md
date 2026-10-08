# Spec de Producto (Fase Post-T: Mobile-First UX Refactor)

## 1. Visión
UTNContenidos completó su MVP (T0-T9) pero sufre de una UX pensada para Desktop. Los profesores ingresan desde sus celulares, por lo que la prioridad número uno (Post-T) es refactorizar toda la experiencia hacia una filosofía **Mobile-first**, inmersiva y con feedback visual instantáneo (animaciones 3D estilo iOS 27 mediante Framer Motion).

## 2. Invariantes UX/UI (Skill: smooth-ae)
- **Físicas sobre Tiempos:** Todas las transiciones espaciales usarán `springs`.
- **Cero Modales Genéricos:** La edición de slides emerge de la propia tarjeta generada (`Shared Layout`).
- **Navegabilidad Táctil:** Botones enormes (min 48x48px), listados en columna (stack vertical), swipe/scroll nativo sin iframes rotos.
- **Feedback Constante:** Ningún botón se queda "pensando" sin estado de carga; interacciones de tap con retroalimentación (scale down).

## 3. Flujo Principal (Slices a intervenir)
1. **Dashboard (Tarjetas Materias):** Grid adaptativo. Tarjetas con tilt 3D sutil que se expanden hacia la vista de Generador (Hero Transition).
2. **Ingesta de Apuntes (CRUD):** Formulario responsivo. Evitar inputs cortados o teclados solapando la UI en iOS/Android.
3. **Generador y Configuración:** Layout en columna para el celular. El stepper didáctico se adapta a pantallas de 320px sin romperse.
4. **Visor de Resultados (Core):** Stagger de tarjetas (slides) en columna. Al tocar "Editar", un bottom sheet inmersivo a pantalla completa reemplaza la vista plana.

## 4. Fuera de esta Spec (Para Fase 3)
- Exportación a PPTX.
- Subida de archivos locales (PDF/Word).
- Multi-institución o links públicos a alumnos.
*(Nota: Estos requerimientos fueron movidos al backlog. La prioridad absoluta ahora es UX Mobile).*
