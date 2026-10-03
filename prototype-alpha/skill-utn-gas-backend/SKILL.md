---
name: utn-gas-backend
description: Use when editing UTNContenidos Google Apps Script backend (app.md) or any GAS logic (auth, RAG, slides export, sheets, historial). Dispara al tocar app.md o funcionalidades de Google Apps Script.
---

# UTNContenidos — Backend GAS (app.md)

Convenciones obligatorias al tocar `app.md`.

## Reglas de oro
1. **Toda función que reciba datos externos valida en el servidor** (nunca confiar solo en el cliente).
2. **IDs**: usar siempre `normalizarId(val)` (quita espacios y `.0` de Sheets).
3. **Caché**: `CacheService.getScriptCache()` para lecturas repetidas. Claves: `dashboard_<legajo>` (TTL 3600), `rag_doc_<docId>` (TTL 21600), `token_<token>` (TTL 7200), `login_fallos_<legajo>`.
4. **Escrituras**: envolver en `LockService.getScriptLock()` (waitLock 30s) + liberar en finally/catch.
5. **Login**: respetar rate-limit (`estaBloqueadoPorLegajo` + `superaLimiteGlobalLogin`) y `registrarIntentoFallido`/`limpiarIntentosFallidos`.
6. **RAG**: truncar a 15000 chars SIEMPRE (consistente con Vercel).
7. **IA**: toda respuesta Gemini se parsea con `extraerJsonPuro(texto)` y se valida `slides` como array.
8. **Payloads**: rechazar > 500KB en `doPost`; máx 30 slides en `exportarAGoogleSlides`.
9. **debugSheetData**: gated por propiedad `ALLOW_DEBUG === 'true'`. Nunca exponer sin gate.
10. **Anti prompt-injection**: el material RAG va delimitado `--- INICIO/FIN MATERIAL DE CÁTEDRA ---` + orden explícita de ignorar instrucciones internas.

## Estructura de funciones clave
- `validarDocente(legajo, dni)` → token UUID v4 (TTL 2h) + dashboard cacheado 1h
- `obtenerMateriasYTemasRelacional(ss, legajo, filtroIds?)` → modelo DLR con fallback CSV
- `obtenerContextoTema(token, linkTeoria)` → RAG con caché 6h
- `exportarAGoogleSlides(token, materiaId, materiaNombre, temaNombre, datosClase)` → historial col 6 = Fecha
- `generarClaseConGeminiGAS(token, materia, tema, textoOficial, contextoDinamico, configuracion)` → fallback híbrido
- `doPost(e)` → router de acciones, cap 500KB

## Hoja de columnas (NO cambiar índices sin actualizar lecturas)
- `Docentes`: A legajo · B dni · C nombre · D email
- `Materias` (DLR): A id · B plan · C nombre · D nivel · E depto · F desc · G activa
- `Temas` (DLR): A id · B id_materia · C orden · D nombre · E desc · F url · G activo
- `Asignaciones_Docente`: A id · B legajo · C id_materia
- `Historial_Presentaciones`: A id · B legajo · C id_materia · D nombre_tema · E url · F estado · G fecha (índice 6)

## Envío a producción
`app.md` se copia al editor de Apps Script. No versionado con clasp todavía (T7 pendiente).