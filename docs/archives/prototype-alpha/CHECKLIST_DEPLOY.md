# CHECKLIST_DEPLOY — UTNContenidos (α0.7)

Guía paso a paso para desplegar el backend y el frontend sin romper nada.

## 1. Backend Google Apps Script
1. Ir a `https://script.google.com/` → el proyecto vinculado a la planilla.
2. Pegar TODO el contenido de `app.md` (reemplaza el código anterior).
3. **Guardar** (Ctrl+S).
4. **Implementar → Administrar implementaciones → Editar** (o nueva "Web app"):
   - **Ejecutar como:** *Yo* (el dueño del script).
   - **Quién tiene acceso:** *Cualquier usuario* (anónimo).
5. Guardar → **Nueva versión** → copiar la URL nueva (`/exec`).
6. Verificar la URL con un POST (debe responder JSON, no 401):
   ```bash
   curl -X POST -H "Content-Type: text/plain;charset=utf-8" \
     -d '{"action":"validarDocente","legajo":"00000","dni":"00000000"}' \
     "URL_NUEVA"
   # Esperado: {"success":false,"error":"Credenciales inválidas..."}
   ```
7. **Propiedades del script** (ajustes → Configuración del proyecto → Propiedades):
   - `GEMINI_API_KEY` = tu clave de Google AI Studio.
   - `ALLOW_DEBUG` = `false` (o `true` solo para depurar).
   - `TRANSFERIR_PROPIEDAD` = `true` (para que el Slides vaya al Drive del docente).

## 2. Frontend (Vercel + GitHub)
1. En `script.js` actualizar `GAS_API_URL` con la URL verificada del paso 1.
2. Commit + push a `main` (Vercel auto-deploya).
3. Verificar en `https://utncontenidos.vercel.app`:
   - Login OK.
   - Generar una clase → Guardar en Slides → el archivo aparece en el Drive del docente (dueño).

## 3. Planilla (Google Sheets)
- Hoja `Docentes`: A legajo · B dni · C nombre · D email · E estado · F fecha.
- Hoja `Temas`: A id · B id_materia · C orden · D nombre · E desc · F link · G activo.
- Hoja `Plantillas`: A id · B legajo · C nombre · D config JSON · E fecha.
- Hoja `Historial_Presentaciones`: A id · B legajo · C id_materia · D tema · E url · F estado · G fecha · H carpeta · I datosClase.
- Hoja `Log_Eventos`: A fecha · B legajo · C acción · D éxito · E detalle. (se crea sola)
- Compartir la planilla con los docentes si el Web App corre como "Usuario que accede".

## 4. Post-deploy (verificación rápida)
- [ ] `validarDocente` responde JSON (no 401).
- [ ] Login real funciona (legajo + DNI válidos).
- [ ] Exportar a Slides termina OK y el archivo es del docente.
- [ ] Historial muestra la clase con distintivo.
- [ ] Plantillas se guardan/cargan (localStorage + hoja Plantillas).
- [ ] Límite diario de 20 generaciones activo.
- [ ] `Log_Eventos` registra las acciones.