# Plan de Implementación: Corrección y Optimización de UTNContenidos

Este plan detalla las correcciones y modificaciones en `app.gs` y `script.js` para resolver los problemas identificados en la auditoría general y cumplir con los requerimientos del usuario.

## User Review Required

> [!IMPORTANT]
> - Se descartará el uso de `style.css` y se asume que la CDN de Tailwind CSS está inyectada en `index.html` (o que se inyectará posteriormente).
> - La generación de contenidos con IA (`generarClaseIA`) seguirá un flujo simulado por el momento, pero con toda la estructura del JSON preparada para la conexión definitiva con Gemini (usando RAG desde Google Docs si se proporciona un enlace).
> - Se implementará `sessionStorage` para almacenar temporalmente los datos del docente y del dashboard, evitando que se pierda la sesión al recargar la página durante la misma pestaña.

## Proposed Changes

### Backend (`app.gs`)

#### [MODIFY] [app.gs](file:///c:/Users/lsi/Documents/UTNContenidos/app.gs)
- Eliminar la redundancia al abrir la hoja de cálculo reemplazando `SpreadsheetApp.openById(SHEET_ID)` por `SpreadsheetApp.getActiveSpreadsheet()`.
- Agregar la variable `GEMINI_API_KEY` utilizando `PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY')`.
- Fusionar las dos definiciones de `generarClaseIA` en una única función que reciba `(materiaNombre, temaNombre, contexto, linkTeoria)`.
- En esta función fusionada:
  1. Si hay `linkTeoria` de Google Docs, extraer su contenido de texto.
  2. Preparar el prompt del sistema (para Gemini).
  3. Retornar la estructura JSON simulada que incluye `busqueda` (prompts), `plan` (duración, objetivos y fases con tiempos), `slides` (portada, conceptos clave, esquema y caso práctico) y `promptsImagenes`.

### Frontend (`script.js`)

#### [MODIFY] [script.js](file:///c:/Users/lsi/Documents/UTNContenidos/script.js)
- **Persistencia de sesión:**
  - Al cargar la página, verificar si existe una sesión activa en `sessionStorage` (datos del usuario y del dashboard). Si es así, renderizar el dashboard e ir directamente a esa vista.
  - Al iniciar sesión con éxito, guardar los datos en `sessionStorage`.
  - Al cerrar sesión, limpiar `sessionStorage`.
- **Inyección dinámica en el DOM:**
  - Completar la lógica en `manejarGeneracionIA` para inyectar dinámicamente los datos devueltos por `generarClaseIA` en las secciones correspondientes del DOM de `view-generator`:
    - Sección A: Prompts de búsqueda profesional.
    - Sección B: Objetivos de aprendizaje y tabla de estructura pedagógica.
    - Sección C: Diapositivas generadas dinámicamente (generando elementos HTML para cada slide).
    - Sección D: Prompts de generación de imágenes.

---

## Verification Plan

### Manual Verification
1. Cargar el frontend y realizar el login. Verificar que se renderice correctamente el dashboard dinámico.
2. Hacer clic en "Generar clase" para un tema. Verificar que la vista de generación se cargue con los datos dinámicos inyectados correctamente (título del tema, objetivos, pasos de la clase en la tabla, diapositivas y prompts de imágenes).
3. Hacer clic en "Exportar a Google Slides" y verificar que la presentación se cree en Google Drive con las diapositivas correspondientes.
4. Refrescar la pantalla después de iniciar sesión para comprobar que la sesión se mantiene activa gracias a `sessionStorage`.
5. Hacer clic en "Cerrar Sesión" y verificar que se limpien las credenciales y se regrese a la pantalla de login.
