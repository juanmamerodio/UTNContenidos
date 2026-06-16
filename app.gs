/**
 * ============================================================================
 * UTNContenidos - Backend Serverless (Google Apps Script)
 * Arquitectura: JAMstack Costo $0 | Base de Datos: Google Sheets
 * ============================================================================
 */

// API Key de Gemini desde las propiedades del script (Costo $0 - Google AI Studio)
const GEMINI_API_KEY = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY') || '';

/**
 * 1. FUNCIÓN DE INICIO (Sirve la SPA)
 * Convierte tu index.html en una Web App.
 */
function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('UTNContenidos | FRD')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * 2. VALIDACIÓN DE LOGIN Y CARGA DE DASHBOARD
 * Genera un token efímero guardado en caché para validar las llamadas cliente-servidor.
 */
function validarDocente(legajo, dni) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheetDocentes = ss.getSheetByName('Docentes');
    if (!sheetDocentes) {
      return { success: false, error: "Error de configuración: No se encontró la hoja 'Docentes'." };
    }
    const dataDocentes = sheetDocentes.getDataRange().getValues();
    
    // Ignoramos la cabecera (fila 0)
    for (let i = 1; i < dataDocentes.length; i++) {
      let row = dataDocentes[i];
      // Convertimos a string para evitar errores de tipo
      if (String(row[0]).trim() === String(legajo).trim() && String(row[1]).trim() === String(dni).trim()) {
        
        // Login exitoso, ahora buscamos sus materias y temas
        let materiasIds = row[4] ? String(row[4]).split(',').map(id => id.trim()) : [];
        let dashboardData = obtenerMateriasYTemas(materiasIds, ss, legajo);
        
        // GENERACIÓN DE TOKEN DE SESIÓN EFÍMERO
        const token = Utilities.getUuid();
        const cache = CacheService.getScriptCache();
        // Guardamos el token asociando el legajo. Expira en 2 horas (7200 segundos).
        cache.put('token_' + token, String(legajo), 7200);
        
        return {
          success: true,
          token: token,
          usuario: {
            nombre: row[2],
            email: row[3]
          },
          dashboard: dashboardData
        };
      }
    }
    
    return { success: false, error: "Credenciales inválidas. Verifique en Sysacad." };
  } catch (error) {
    return { success: false, error: "Error en el servidor al validar credenciales: " + error.toString() };
  }
}

/**
 * 3. VALIDADOR DE TOKEN DE SESIÓN
 * Retorna el legajo si el token es válido, o null si expiró o es inexistente.
 */
function validarSesion(token) {
  if (!token) return null;
  try {
    const cache = CacheService.getScriptCache();
    return cache.get('token_' + token);
  } catch (e) {
    console.error("Error al leer caché de sesión: " + e.toString());
    return null;
  }
}

/**
 * 4. ORQUESTADOR DE DATOS RELACIONALES
 * Cruza las hojas 'Materias' y 'Temario' según el profesor.
 */
function obtenerMateriasYTemas(materiasIds, ss, legajo) {
  const sheetMateriasObj = ss.getSheetByName('Materias');
  const sheetTemarioObj = ss.getSheetByName('Temario');
  
  if (!sheetMateriasObj || !sheetTemarioObj) return [];
  
  const sheetMaterias = sheetMateriasObj.getDataRange().getValues();
  const sheetTemario = sheetTemarioObj.getDataRange().getValues();
  
  let resultado = [];
  
  // Filtrar Materias
  for (let i = 1; i < sheetMaterias.length; i++) {
    let idMateria = sheetMaterias[i][0];
    if (materiasIds.includes(String(idMateria).trim())) {
      let materiaObj = {
        id: idMateria,
        nombre: sheetMaterias[i][1],
        nivel: sheetMaterias[i][2],
        descripcion: sheetMaterias[i][3],
        temas: []
      };
      
      // Buscar temas de esta materia asignados a este docente
      for (let j = 1; j < sheetTemario.length; j++) {
        // A: Legajo_Docente (0), B: ID_Materia (1), C: ID_Tema (2), D: Nombre_Tema (3), E: Link_Teoria (4)
        let rowLegajo = String(sheetTemario[j][0]).trim();
        let rowMateria = String(sheetTemario[j][1]).trim();
        if (rowLegajo === String(legajo).trim() && rowMateria === String(idMateria).trim()) {
          materiaObj.temas.push({
            idTema: sheetTemario[j][2],
            nombreTema: sheetTemario[j][3],
            contexto: '',
            linkTeoria: sheetTemario[j][4] || ''
          });
        }
      }
      resultado.push(materiaObj);
    }
  }
  return resultado;
}

/**
 * 5. RETROALIMENTACIÓN DE CONTEXTO (RAG BÁSICO)
 * Extrae texto del Google Doc si existe y lo devuelve limpio al frontend.
 */
function obtenerContextoTema(token, linkTeoria) {
  // VALIDACIÓN DE SEGURIDAD EN EL SERVIDOR
  const legajo = validarSesion(token);
  if (!legajo) {
    return { success: false, error: "Sesión inválida o expirada. Por favor, vuelva a ingresar." };
  }

  let textoOficial = "No se proporcionó bibliografía específica. Usa teoría estándar de nivel universitario.";
  let advertenciaRAG = null;
  
  // EXTRAER LA TEORÍA (RAG básico)
  if (linkTeoria && linkTeoria.includes('docs.google.com')) {
    const docId = extraerIdDoc(linkTeoria);
    if (docId) {
      try {
        const doc = DocumentApp.openById(docId);
        textoOficial = doc.getBody().getText();
        
        // Acotar texto para optimizar la ventana de contexto y el tiempo
        if (textoOficial.length > 50000) {
           textoOficial = textoOficial.substring(0, 50000); 
        }
      } catch (error) {
        console.error("Error al leer el apunte: " + error);
        textoOficial = "ADVERTENCIA: No se pudo leer el apunte oficial por falta de permisos de acceso. Usa teoría estándar de nivel universitario para esta materia.";
        advertenciaRAG = "No pudimos acceder a tu Google Doc de teoría (revisá que esté compartido). Se generará la clase con contenido general de ingeniería.";
      }
    }
  }

  return {
    success: true,
    textoOficial: textoOficial,
    warning: advertenciaRAG
  };
}

/**
 * 6. EXPORTACIÓN A GOOGLE SLIDES & HISTORIAL
 * Crea una presentación real en el Drive del profesor y guarda el registro en Google Sheets.
 */
function exportarAGoogleSlides(token, materiaId, materiaNombre, temaNombre, datosClase) {
  // VALIDACIÓN DE SEGURIDAD EN EL SERVIDOR
  const legajo = validarSesion(token);
  if (!legajo) {
    return { success: false, error: "Sesión inválida o expirada. Por favor, vuelva a ingresar." };
  }

  try {
    if (!datosClase || !datosClase.slides || datosClase.slides.length === 0) {
      throw new Error("Datos de clase inválidos o sin diapositivas.");
    }

    // 1. Crear la presentación en blanco
    const presentacion = SlidesApp.create(`UTN_Clase_${datosClase.slides[0].titulo}`);
    
    // 2. Obtener la primera diapositiva (portada por defecto)
    const slides = presentacion.getSlides();
    const portada = slides[0];
    
    // 3. Llenar la portada
    let shapes = portada.getShapes();
    if (shapes.length >= 2) {
      shapes[0].getText().setText(datosClase.slides[0].titulo || "Tema de Clase");
      shapes[1].getText().setText((datosClase.slides[0].subtitulo || "UTN FRD") + "\nFacultad Regional Delta");
    }
    
    // 4. Generar el resto de las diapositivas
    for (let i = 1; i < datosClase.slides.length; i++) {
      let slideData = datosClase.slides[i];
      let nuevaSlide = presentacion.appendSlide(SlidesApp.PredefinedLayout.TITLE_AND_BODY);
      
      let slideShapes = nuevaSlide.getShapes();
      if (slideShapes.length >= 2) {
        slideShapes[0].getText().setText(slideData.titulo || "Diapositiva");
        slideShapes[1].getText().setText(slideData.contenido || "");
        
        // Estilo UTN básico al título (Azul UTN #0055A6)
        slideShapes[0].getText().getTextStyle().setForegroundColor('#0055A6');
      }
    }

    const urlPresentacion = presentacion.getUrl();

    // 5. REGISTRAR EN EL HISTORIAL (Hoja: Historial_Presentaciones)
    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      let sheetHistorial = ss.getSheetByName('Historial_Presentaciones');
      if (!sheetHistorial) {
        sheetHistorial = ss.insertSheet('Historial_Presentaciones');
        sheetHistorial.appendRow(['ID_Historial', 'Legajo_Docente', 'ID_Materia', 'Nombre_Tema', 'URL_Slides', 'Fecha_Creacion']);
      }
      
      const idHistorial = Utilities.getUuid();
      const fechaCreacion = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
      
      sheetHistorial.appendRow([
        idHistorial,
        String(legajo),
        String(materiaId || ''),
        String(temaNombre || ''),
        urlPresentacion,
        fechaCreacion
      ]);
    } catch (errHistorial) {
      console.error("Error al registrar en Historial_Presentaciones: " + errHistorial.toString());
      // No bloqueamos la ejecución si falla el registro en la base de datos
    }
    
    return {
      success: true,
      url: urlPresentacion
    };
    
  } catch (error) {
    console.error("Error al exportar a Google Slides: " + error.toString());
    return { success: false, error: error.toString() };
  }
}

/**
 * Función auxiliar para extraer el ID de un link de Google Docs
 */
function extraerIdDoc(url) {
  try {
    const match = url.match(/\/d\/(.+?)\//);
    return match ? match[1] : null;
  } catch (e) {
    return null;
  }
}

/**
 * 7. OBTENER HISTORIAL DE PRESENTACIONES DEL DOCENTE
 * Devuelve un array con las clases y slides generadas por el profesor logueado.
 */
function obtenerHistorialDocente(token) {
  const legajo = validarSesion(token);
  if (!legajo) {
    return { success: false, error: "Sesión inválida o expirada. Por favor, vuelva a ingresar." };
  }

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheetHistorial = ss.getSheetByName('Historial_Presentaciones');
    if (!sheetHistorial) {
      return { success: true, historial: [] };
    }

    const values = sheetHistorial.getDataRange().getValues();
    let historial = [];

    // Columna A: ID_Historial (0), B: Legajo_Docente (1), C: ID_Materia (2), D: Nombre_Tema (3), E: URL_Slides (4), F: Fecha_Creacion (5)
    for (let i = 1; i < values.length; i++) {
      if (String(values[i][1]).trim() === String(legajo).trim()) {
        historial.push({
          idHistorial: values[i][0],
          legajoDocente: values[i][1],
          materiaId: values[i][2],
          temaNombre: values[i][3],
          urlSlides: values[i][4],
          fechaCreacion: values[i][5]
        });
      }
    }

    // Ordenar por fecha decreciente
    historial.sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion));

    return { success: true, historial: historial };

  } catch (error) {
    console.error("Error en obtenerHistorialDocente: " + error.toString());
    return { success: false, error: "Error al recuperar historial: " + error.toString() };
  }
}

/**
 * 8. REVALIDACIÓN DE SESIÓN CON DASHBOARD
 * Llamada por el frontend al recargar la página cuando existe un token en sessionStorage.
 * Retorna { success: true, dashboard } si el token es válido, o { success: false } si expiró.
 */
function revalidarSesionConDashboard(token) {
  const legajo = validarSesion(token);
  if (!legajo) {
    return { success: false, error: "Token de sesión inválido o expirado." };
  }

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheetDocentes = ss.getSheetByName('Docentes');
    if (!sheetDocentes) {
      return { success: false, error: "Error de configuración: No se encontró la hoja 'Docentes'." };
    }

    const dataDocentes = sheetDocentes.getDataRange().getValues();
    for (let i = 1; i < dataDocentes.length; i++) {
      if (String(dataDocentes[i][0]).trim() === String(legajo).trim()) {
        let materiasIds = dataDocentes[i][4] ? String(dataDocentes[i][4]).split(',').map(id => id.trim()) : [];
        let dashboardData = obtenerMateriasYTemas(materiasIds, ss, legajo);
        return { success: true, dashboard: dashboardData };
      }
    }
    return { success: false, error: "Docente no encontrado en la base de datos." };
  } catch (error) {
    console.error("Error en revalidarSesionConDashboard: " + error.toString());
    return { success: false, error: "Error al recuperar datos de sesión." };
  }
}

/**
 * 9. CONTROLADOR DE PETICIONES HTTP POST (API REST)
 * Enruta las solicitudes externas desde el frontend en Vercel.
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return crearRespuestaJson({ success: false, error: "Solicitud vacía o inválida." });
    }
    
    const params = JSON.parse(e.postData.contents);
    const action = params.action;
    let responseData = {};

    switch (action) {
      case 'validarDocente':
        responseData = validarDocente(params.legajo, params.dni);
        break;
      case 'obtenerContextoTema':
        responseData = obtenerContextoTema(params.token, params.linkTeoria);
        break;
      case 'exportarAGoogleSlides':
        responseData = exportarAGoogleSlides(
          params.token, 
          params.materiaId, 
          params.materiaNombre, 
          params.temaNombre, 
          params.datosClase
        );
        break;
      case 'obtenerHistorialDocente':
        responseData = obtenerHistorialDocente(params.token);
        break;
      case 'revalidarSesionConDashboard':
        responseData = revalidarSesionConDashboard(params.token);
        break;
      default:
        responseData = { success: false, error: "Acción '" + action + "' no permitida o desconocida." };
    }

    return crearRespuestaJson(responseData);

  } catch (err) {
    console.error("Error en doPost: " + err.toString());
    return crearRespuestaJson({ success: false, error: "Excepción en el servidor: " + err.toString() });
  }
}

/**
 * Función auxiliar para retornar respuestas JSON con cabeceras correctas.
 */
function crearRespuestaJson(objeto) {
  return ContentService.createTextOutput(JSON.stringify(objeto))
    .setMimeType(ContentService.MimeType.JSON);
}

