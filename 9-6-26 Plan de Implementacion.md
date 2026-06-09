# UTNContenidos — Walkthrough de Implementación v2.0

## Qué se hizo

### ✅ Seguridad
| Vulnerabilidad | Estado |
|---|---|
| Token de sesión no enviado al backend en `generarClaseIA` | **Corregido** |
| Token de sesión no enviado al backend en `exportarAGoogleSlides` | **Corregido** |
| Datos sensibles del dashboard en `sessionStorage` | **Corregido** — solo se guarda token + nombre |
| XSS en renderizado del dashboard y slides | **Corregido** — `sanitizeHTML()` en todos los campos |
| CSS gradient token roto (`#0055N6`) | **Corregido** — `#0055A6` |
| Google Fonts no cargaba (faltaba el `<link href>`) | **Corregido** |

### ✅ UX y Funciones Completadas
- **Toasts de notificación** reemplazan todos los `alert()` del sistema (4 variantes: success, error, warning, info)
- **Dropdown de usuario** funciona: toggle al click, cierra al click fuera del área
- **Empty state** para docentes sin materias asignadas
- **Botón PDF** completamente funcional usando `html2pdf.js` — genera un PDF A4 con membrete institucional UTN FRD
- **Advertencia RAG** visible via toast cuando el Google Doc de teoría no es accesible
- **Revalidación de sesión en vivo** al recargar: el frontend llama a `revalidarSesionConDashboard()` en lugar de usar datos cacheados

### ✅ Backend (app.gs)
- Nueva función `revalidarSesionConDashboard(token)` — validación de token + re-fetch del dashboard
- Todos los `generarClaseIA` y `exportarAGoogleSlides` ya tenían su guard de token (estaba bien en el server, el problema era que el frontend no lo pasaba)

---

## 🚀 GUÍA DE DESPLIEGUE

### PASO 1 — Desplegar en Google Apps Script (el verdadero backend)

> [!IMPORTANT]
> Esta app **NO se ejecuta en Vercel**. El backend y el frontend estático son servidos ambos por **Google Apps Script** como Web App. Vercel es solo una opción para documentación estática o landing page de redireccionamiento.

1. Abrí [Google Apps Script](https://script.google.com/) y cargá (o creá) tu proyecto con los archivos `app.gs`, `index.html`, `style.css` y `script.js`.

2. En el menú de GAS: **Configuración del Proyecto → Propiedades del Script** — Agregá la propiedad:
   ```
   Clave: GEMINI_API_KEY
   Valor: [tu clave de API de Google AI Studio]
   ```

3. **Publicar la Web App:**
   - Menú: **Implementar → Nueva implementación**
   - Tipo: **Aplicación web**
   - Ejecutar como: **Yo (el desarrollador)**
   - Quién tiene acceso: **Cualquier persona** (para que los docentes sin cuenta institucional puedan acceder)
   - Click en **Implementar**

4. GAS te dará una URL del estilo:

```
╔══════════════════════════════════════════════════════════════════╗
║  ⬇️  AQUÍ APARECE LA URL DE TU APLICACIÓN WEB  ⬇️              ║
║                                                                  ║
║  https://script.google.com/macros/s/XXXXXXXXXXXXXXXXXX/exec    ║
║                                                                  ║
║  ✅  ESA ES LA URL QUE COMPARTÍS CON LOS DOCENTES               ║
║  ✅  COPIALA Y GUARDALA — TAMBIÉN VA EN EL PASO 2 DE VERCEL     ║
╚══════════════════════════════════════════════════════════════════╝
```

> [!CAUTION]
> Cada vez que modifiques `app.gs` debes hacer una **Nueva implementación** (no "administrar implementaciones existentes") para que los cambios tomen efecto en producción.

---

### PASO 2 — (Opcional) Desplegar una Landing Page en Vercel

Si querés que los docentes accedan a la app desde una URL personalizada (ej: `utncontenidos.vercel.app`), podés crear una landing page estática en Vercel que redirija a la URL de GAS.

1. Creá un archivo `vercel.json` en la raíz de tu repositorio de GitHub:

```json
{
  "redirects": [
    {
      "source": "/",
      "destination": "https://script.google.com/macros/s/XXXXXXXXXXXXXXXXXX/exec",
      "permanent": false
    }
  ]
}
```

> [!IMPORTANT]
> **Reemplazá `XXXXXXXXXXXXXXXXXX`** con el ID real de tu Web App de GAS obtenido en el Paso 1.

2. Empujá el repositorio a GitHub y conectalo en [vercel.com](https://vercel.com/).
3. Vercel te dará una URL como `utncontenidos.vercel.app` — esa la podés compartir con los docentes.

---

### PASO 3 — Configurar la Hoja de Cálculo (Google Sheets)

La hoja de cálculo debe tener **3 pestañas** con exactamente estos nombres:

#### Hoja: `Docentes`
| A: Legajo | B: DNI | C: Nombre | D: Email | E: IDs_Materias |
|---|---|---|---|---|
| 12345 | 30123456 | Juan García | juan@frd.utn.edu.ar | M01,M02 |

#### Hoja: `Materias`
| A: ID_Materia | B: Nombre | C: Nivel | D: Descripción |
|---|---|---|---|
| M01 | Análisis Matemático I | 1er Año | Cálculo de una variable |

#### Hoja: `Temario`
| A: Legajo_Docente | B: ID_Materia | C: ID_Tema | D: Nombre_Tema | E: Link_Teoria |
|---|---|---|---|---|
| 12345 | M01 | T01 | Límites y Continuidad | https://docs.google.com/document/d/... |

---

## Verificación Post-Despliegue

- [ ] Ingresar con credenciales válidas → Dashboard se muestra correctamente
- [ ] Ingresar con credenciales inválidas → Mensaje de error visible (no `alert()`)
- [ ] Docente sin materias → Empty state se muestra con botón de contacto
- [ ] Generar clase → Toasts de advertencia si el Doc no es accesible
- [ ] Exportar a Slides → Modal de éxito con enlace abre correctamente
- [ ] Descargar PDF → Archivo A4 con membrete UTN FRD descargado
- [ ] Recargar página → Sesión restaurada en vivo desde el servidor
- [ ] Cerrar sesión → Dropdown, token y datos limpiados
- [ ] Inyectar `<script>alert(1)</script>` en un nombre de tema → No ejecuta código
