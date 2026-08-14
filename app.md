/**
 * ============================================================================
 * UTNContenidos - Backend Serverless (Google Apps Script)
 * Arquitectura: JAMstack Costo $0 | Base de Datos: Google Sheets
 * ============================================================================
 */

// API Key de Gemini desde las propiedades del script (Costo $0 - Google AI Studio)
const GEMINI_API_KEY = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY') || '';

/**
 * Función auxiliar para normalizar IDs (remueve espacios y .0 al final habituales en sheets)
 */
function normalizarId(val) {
  if (val === undefined || val === null) return "";
  let str = String(val).trim();
  if (str.endsWith('.0')) {
    str = str.substring(0, str.length - 2);
  }
  return str;
}


/**
 * 0. WARMUP TRIGGER (Mantiene la instancia de GAS caliente y elimina Cold Starts)
 * Configurar en el editor de GAS: Triggers > Add Trigger > mantenerCaliente > Time-driven > Every 4 minutes
 */
function mantenerCaliente() {
  console.log('[Warmup] ' + new Date().toISOString());
}

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
 * 2. VALIDACIÓN DE LOGIN Y CARGA DE DASHBOARD (OPTIMIZADO CON CACHESERVICE & DLR 3NF)
 * Genera un token efímero guardado en caché y acelera la carga evitando re-lecturas redundantes.
 */
function validarDocente(legajo, dni) {
  try {
    const cache = CacheService.getScriptCache();
    const cleanLegajo = normalizarId(legajo);
    const dashboardCacheKey = 'dashboard_' + cleanLegajo;
    const cachedDashboard = cache.get(dashboardCacheKey);

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheetDocentes = ss.getSheetByName('Docentes');
    if (!sheetDocentes) {
      return { success: false, error: "Error de configuración: No se encontró la hoja 'Docentes'." };
    }
    const dataDocentes = sheetDocentes.getDataRange().getValues();

    // Ignoramos la cabecera (fila 0)
    for (let i = 1; i < dataDocentes.length; i++) {
      let row = dataDocentes[i];
      if (normalizarId(row[0]) === cleanLegajo && normalizarId(row[1]) === normalizarId(dni)) {

        // Si tenemos el dashboard en caché lo usamos, sino se consulta al modelo relacional
        let dashboardData;
        if (cachedDashboard) {
          try {
            dashboardData = JSON.parse(cachedDashboard);
          } catch (e) {
            dashboardData = null;
          }
        }

        if (!dashboardData) {
          dashboardData = obtenerMateriasYTemasRelacional(ss, cleanLegajo);
          // Cachear por 1 hora (3600 seg)
          cache.put(dashboardCacheKey, JSON.stringify(dashboardData), 3600);
        }

        // GENERACIÓN DE TOKEN DE SESIÓN EFÍMERO (UUID v4)
        const token = Utilities.getUuid();
        cache.put('token_' + token, String(cleanLegajo), 7200);

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
 * 4. ORQUESTADOR DE DATOS RELACIONALES (MODELO DLR / 3NF)
 * Realiza joins indexados en memoria con complejidad O(1) hash lookups.
 * Soporta la nueva tabla 'Asignaciones_Docente' y 'Temas', con fallback automático
 * si la planilla aún está migrando desde el esquema anterior ('Temario' / Columna CSV).
 */
function obtenerMateriasYTemasRelacional(ss, legajo, materiasIdsFiltro) {
  const cleanLegajo = normalizarId(legajo);
  const sheetMateriasObj = ss.getSheetByName('Materias');
  if (!sheetMateriasObj) return [];

  const sheetMaterias = sheetMateriasObj.getDataRange().getValues();
  let materiasMap = {}; // ID -> Objeto Materia

  for (let i = 1; i < sheetMaterias.length; i++) {
    let idMateria = normalizarId(sheetMaterias[i][0]);
    if (!idMateria) continue;

    // A: ID_Materia, B: Nombre o Codigo_Plan, C: Nivel o Nombre...
    // Soporte para esquema DLR (A: ID, B: Plan, C: Nombre, D: Nivel, E: Depto, F: Desc, G: Activa)
    // y esquema clásico (A: ID, B: Nombre, C: Nivel, D: Descripcion)
    let esDLR = sheetMaterias[0].length >= 6 && sheetMaterias[0][1].toString().toLowerCase().includes('plan');
    
    let nombre = esDLR ? sheetMaterias[i][2] : sheetMaterias[i][1];
    let nivel = esDLR ? (sheetMaterias[i][3] || 'General') : (sheetMaterias[i][2] || 'General');
    let descripcion = esDLR ? (sheetMaterias[i][5] || '') : (sheetMaterias[i][3] || '');
    let activa = esDLR ? (sheetMaterias[i][6] !== false && sheetMaterias[i][6] !== 'FALSE') : true;

    if (!activa) continue;

    materiasMap[idMateria] = {
      id: idMateria,
      nombre: nombre,
      nivel: nivel,
      descripcion: descripcion,
      temas: []
    };
  }

  // 1. OBTENER IDs DE MATERIAS ASIGNADAS AL DOCENTE
  let materiasAsignadasSet = new Set();

  if (materiasIdsFiltro && Array.isArray(materiasIdsFiltro)) {
    materiasIdsFiltro.forEach(id => materiasAsignadasSet.add(normalizarId(id)));
  } else {
    // Buscar en hoja Asignaciones_Docente (DLR)
    const sheetAsignaciones = ss.getSheetByName('Asignaciones_Docente');
    if (sheetAsignaciones) {
      const dataAsign = sheetAsignaciones.getDataRange().getValues();
      for (let i = 1; i < dataAsign.length; i++) {
        let legDoc = normalizarId(dataAsign[i][1]); // Col B: Legajo_Docente
        let matId = normalizarId(dataAsign[i][2]);  // Col C: ID_Materia
        if (legDoc === cleanLegajo && matId) {
          materiasAsignadasSet.add(matId);
        }
      }
    }

    // Fallback: Si no hay tabla de asignaciones o no encontró filas, buscar en Docentes col E (CSV antiguo)
    if (materiasAsignadasSet.size === 0) {
      const sheetDocentes = ss.getSheetByName('Docentes');
      if (sheetDocentes) {
        const dataDoc = sheetDocentes.getDataRange().getValues();
        for (let i = 1; i < dataDoc.length; i++) {
          if (normalizarId(dataDoc[i][0]) === cleanLegajo) {
            let csv = dataDoc[i][4] ? String(dataDoc[i][4]).split(',') : [];
            csv.forEach(id => { if (id.trim()) materiasAsignadasSet.add(normalizarId(id)); });
            break;
          }
        }
      }
    }
  }

  // 2. OBTENER TEMAS DE CÁTEDRA (HOJA 'Temas' O 'Temario' CON DETECCIÓN DINÁMICA)
  const sheetTemasObj = ss.getSheetByName('Temas') || ss.getSheetByName('Temario') || ss.getSheetByName('temario');

  if (sheetTemasObj) {
    const dataTemas = sheetTemasObj.getDataRange().getValues();
    const headers = (dataTemas[0] || []).map(h => String(h).toLowerCase().trim());
    
    // Detectar si la hoja tiene estructura DLR (id_tema, id_materia, orden_unidad, nombre_tema, descripcion, url, activo)
    // o estructura clásica de 5 columnas (legajo, id_materia, id_tema, nombre_tema, link)
    const esDLRTemas = headers.includes('orden_unidad') || (dataTemas[0].length >= 6 && headers[1] === 'id_materia');

    for (let i = 1; i < dataTemas.length; i++) {
      let row = dataTemas[i];
      if (!row || row.length === 0) continue;

      if (esDLRTemas) {
        // Estructura DLR: Col A: ID_Tema (0), Col B: ID_Materia (1), Col C: Orden (2), Col D: Nombre_Tema (3), Col E: Desc (4), Col F: URL (5), Col G: Activo (6)
        let idMateria = normalizarId(row[1]);
        let activo = row[6] !== false && row[6] !== 'FALSE' && String(row[6]).toLowerCase() !== 'inactivo';

        if (activo && materiasAsignadasSet.has(idMateria) && materiasMap[idMateria]) {
          materiasMap[idMateria].temas.push({
            idTema: normalizarId(row[0]) || ('TEMA_' + i),
            orden: row[2] || i,
            nombreTema: String(row[3] || 'Tema de Clase').trim(),
            descripcion: String(row[4] || '').trim(),
            contexto: '',
            linkTeoria: String(row[5] || '').trim()
          });
        }
      } else {
        // Estructura Clásica: Col A: Legajo (0), Col B: ID_Materia (1), Col C: ID_Tema (2), Col D: Nombre_Tema (3), Col E: Link (4)
        let rowLegajo = normalizarId(row[0]);
        let rowMateria = normalizarId(row[1]);
        
        // Acepta si coincide el legajo o si la fila no tiene legajo especificado (tema global de materia)
        if ((rowLegajo === cleanLegajo || !rowLegajo) && materiasAsignadasSet.has(rowMateria) && materiasMap[rowMateria]) {
          materiasMap[rowMateria].temas.push({
            idTema: normalizarId(row[2]) || ('TEMA_' + i),
            orden: i,
            nombreTema: String(row[3] || 'Tema de Clase').trim(),
            contexto: '',
            linkTeoria: String(row[4] || '').trim()
          });
        }
      }
    }
  }

  // 3. RETORNAR SÓLO LAS MATERIAS ASIGNADAS AL DOCENTE CON SUS TEMAS
  let resultado = [];
  materiasAsignadasSet.forEach(idMat => {
    if (materiasMap[idMat]) {
      let m = materiasMap[idMat];

      // Si la materia fue asignada pero aún no tiene temas cargados en la hoja Temario,
      // agregamos automáticamente un tema general para que SIEMPRE aparezca el botón "Preparar Clase"
      if (!m.temas || m.temas.length === 0) {
        m.temas = [{
          idTema: 'TEMA_GENERAL_' + idMat,
          orden: 1,
          nombreTema: 'Contenido General de ' + m.nombre,
          descripcion: 'Planificación sobre los contenidos de la cátedra.',
          contexto: '',
          linkTeoria: ''
        }];
      } else {
        m.temas.sort((a, b) => (Number(a.orden) || 0) - (Number(b.orden) || 0));
      }

      resultado.push(m);
    }
  });

  return resultado;
}

// Alias de retrocompatibilidad
function obtenerMateriasYTemas(materiasIds, ss, legajo) {
  return obtenerMateriasYTemasRelacional(ss, legajo, materiasIds);
}

/**
 * 5. RETROALIMENTACIÓN DE CONTEXTO (RAG CON CACHÉ)
 * Extrae texto del Google Doc usando CacheService para responder en ~100ms en hits.
 */
function obtenerContextoTema(token, linkTeoria) {
  const legajo = validarSesion(token);
  if (!legajo) {
    return { success: false, error: "Sesión inválida o expirada. Por favor, vuelva a ingresar." };
  }

  let textoOficial = "No se proporcionó bibliografía específica. Usa teoría estándar de nivel universitario.";
  let advertenciaRAG = null;

  if (linkTeoria && linkTeoria.includes('docs.google.com')) {
    const docId = extraerIdDoc(linkTeoria);
    if (docId) {
      const cache = CacheService.getScriptCache();
      const ragKey = 'rag_doc_' + docId;
      const cachedText = cache.get(ragKey);

      if (cachedText) {
        textoOficial = cachedText;
      } else {
        try {
          const doc = DocumentApp.openById(docId);
          let texto = doc.getBody().getText();

          if (texto.length > 50000) {
            texto = texto.substring(0, 50000);
          }
          textoOficial = texto;
          // Guardar en caché por 6 horas (21600 segundos)
          cache.put(ragKey, textoOficial, 21600);
        } catch (error) {
          console.error("Error al leer el apunte: " + error);
          textoOficial = "ADVERTENCIA: No se pudo leer el apunte oficial por falta de permisos de acceso. Usa teoría estándar de nivel universitario para esta materia.";
          advertenciaRAG = "No pudimos acceder a tu Google Doc de teoría (revisá que esté compartido). Se generará la clase con contenido general de ingeniería.";
        }
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
 * 6. EXPORTACIÓN A GOOGLE SLIDES & HISTORIAL (DISEÑO INSTITUCIONAL UTN & NOTAS DE ORADOR)
 * Crea una presentación profesional en el Drive del profesor con diseño de cátedra y notas pedagógicas.
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
    const tituloPresentacion = `UTN FRD - ${temaNombre || datosClase.slides[0].titulo}`;
    const presentacion = SlidesApp.create(tituloPresentacion);

    // 2. Llenar la Portada (Slide 0)
    const slides = presentacion.getSlides();
    const portada = slides[0];
    portada.getBackground().setSolidFill('#0A2540'); // Azul espacial profundo UTN

    let shapesPortada = portada.getShapes();
    if (shapesPortada.length >= 2) {
      // Título principal blanco
      let shapeTitulo = shapesPortada[0];
      shapeTitulo.getText().setText(datosClase.slides[0].titulo || temaNombre);
      shapeTitulo.getText().getTextStyle()
        .setForegroundColor('#FFFFFF')
        .setFontSize(36)
        .setBold(true);

      // Subtítulo institucional celeste/plata
      let shapeSub = shapesPortada[1];
      shapeSub.getText().setText(`${materiaNombre || 'Cátedra UTN'} | Facultad Regional Delta\nUniversidad Tecnológica Nacional`);
      shapeSub.getText().getTextStyle()
        .setForegroundColor('#94A3B8')
        .setFontSize(18);
    }

    // Notas de orador de la portada
    if (datosClase.slides[0].notasOrador) {
      try {
        portada.getNotesPage().getSpeakerNotesShape().getText().setText("🎙️ GUÍA DOCENTE:\n" + datosClase.slides[0].notasOrador);
      } catch (e) {
        console.warn("No se pudo agregar nota de orador a portada: " + e);
      }
    }

    // 3. Generar el resto de las Diapositivas Didácticas
    for (let i = 1; i < datosClase.slides.length; i++) {
      let slideData = datosClase.slides[i];
      let nuevaSlide = presentacion.appendSlide(SlidesApp.PredefinedLayout.TITLE_AND_BODY);
      nuevaSlide.getBackground().setSolidFill('#F8FAFC'); // Fondo off-white limpio para proyector

      let slideShapes = nuevaSlide.getShapes();
      if (slideShapes.length >= 2) {
        // Título con Azul UTN (#0055A6)
        let tituloShape = slideShapes[0];
        let categoriaTxt = slideData.categoria ? `[${slideData.categoria.toUpperCase()}] ` : '';
        tituloShape.getText().setText(categoriaTxt + (slideData.titulo || "Tema"));
        tituloShape.getText().getTextStyle()
          .setForegroundColor('#0055A6')
          .setFontSize(26)
          .setBold(true);

        // Cuerpo de contenido
        let cuerpoShape = slideShapes[1];
        let textoContenido = slideData.contenido || '';
        cuerpoShape.getText().setText(textoContenido);
        cuerpoShape.getText().getTextStyle()
          .setForegroundColor('#1E293B')
          .setFontSize(18);
      }

      // Notas de orador (machete pedagógico del profesor)
      if (slideData.notasOrador) {
        try {
          nuevaSlide.getNotesPage().getSpeakerNotesShape().getText().setText("🎙️ GUÍA DE AULA (CÁTEDRA UTN FRD):\n" + slideData.notasOrador);
        } catch (eNotes) {
          console.warn("Error al agregar nota de orador en slide " + i + ": " + eNotes);
        }
      }
    }

    const urlPresentacion = presentacion.getUrl();

    // 4. REGISTRAR EN EL HISTORIAL (Hoja: Historial_Presentaciones)
    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      let sheetHistorial = ss.getSheetByName('Historial_Presentaciones');
      if (!sheetHistorial) {
        sheetHistorial = ss.insertSheet('Historial_Presentaciones');
        sheetHistorial.appendRow(['ID_Historial', 'Legajo_Docente', 'Id_Materia', 'Nombre_Tema', 'URL_Slides', 'estado_generacion', 'Fecha_Creacion']);
      }

      const idHistorial = Utilities.getUuid();
      const fechaCreacion = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");

      sheetHistorial.appendRow([
        idHistorial,
        String(legajo),
        String(materiaNombre || materiaId || ''),
        String(temaNombre || ''),
        urlPresentacion,
        'EXITOSO',
        fechaCreacion
      ]);
    } catch (errHistorial) {
      console.error("Error al registrar en Historial_Presentaciones: " + errHistorial.toString());
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
      if (normalizarId(values[i][1]) === normalizarId(legajo)) {
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
      if (normalizarId(dataDocentes[i][0]) === normalizarId(legajo)) {
        let materiasIds = dataDocentes[i][4] ? String(dataDocentes[i][4]).split(',').map(id => normalizarId(id)) : [];
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
      case 'obtenerOfertaAcademica':
        responseData = obtenerOfertaAcademica(params.token);
        break;
      case 'reclamarMaterias':
        responseData = reclamarMaterias(params.token, params.materiasIdsSeleccionadas);
        break;
      case 'debugSheetData':
        responseData = debugSheetData();
        break;
      case 'generarClaseIA':
        responseData = generarClaseConGeminiGAS(params.token, params.materia, params.tema, params.textoOficial, params.contextoDinamico);
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
 * 9b. GENERADOR DE CLASE CON GEMINI EN GAS (FALLBACK HÍBRIDO 100% FUNCIONAL)
 * Permite generar la clase directamente desde Google Apps Script si Vercel Serverless no está corriendo localmente.
 */
function generarClaseConGeminiGAS(token, materia, tema, textoOficial, contextoDinamico) {
  const legajo = validarSesion(token);
  if (!legajo) return { success: false, error: "Sesión expirada o inválida." };

  try {
    const apiKey = GEMINI_API_KEY || PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
    if (!apiKey) {
      return { success: false, error: "Falta configurar la GEMINI_API_KEY en las Propiedades del Script de Google Apps Script." };
    }

    const promptSistema = `
      Actúa como un Profesor Titular de Cátedra y Diseñador Pedagógico Senior de la Universidad Tecnológica Nacional (UTN), Facultad Regional Delta.
      Tu misión es estructurar una clase universitaria MEMORABLE, DINÁMICA y VISUALMENTE EXCELENTE sobre el tema "${tema}" para la asignatura "${materia}".

      --- INICIO DEL MATERIAL/APUNTE DE CÁTEDRA ---
      ${textoOficial || 'Sin apunte específico cargado. Utilizar el estado del arte de la ingeniería y estándares universitarios de la UTN.'}
      --- FIN DEL MATERIAL DE CÁTEDRA ---

      Orientaciones específicas enviadas por el profesor para la clase de hoy: "${contextoDinamico || 'Ninguna indicación adicional'}"

      🚨 REGLAS INNEGOCIABLES DE CALIDAD DOCENTE Y PRESENTACIÓN:
      1. PROHIBIDO crear diapositivas con bloques densos de texto. Las diapositivas son para proyectar, no para leer.
      2. Cada diapositiva de contenido debe tener MÁXIMO 3 o 4 puntos clave, ultra sintéticos y contundentes (máximo 12 palabras por punto).
      3. ESTRUCTURA DIDÁCTICA ESTRICTA DE 7 DIAPOSITIVAS:
         - Slide 1 (portada): Título impactante del tema, materia y Facultad Regional Delta.
         - Slide 2 (hook/disparador): Un problema real de la industria/ingeniería o una pregunta provocadora para abrir el debate inicial.
         - Slide 3 (concepto_nucleo): Los fundamentos teóricos indispensables explicados con claridad meridiana.
         - Slide 4 (caso_aplicado): Ejemplo tangible en el mundo real, industria, infraestructura o sistemas tecnológicos.
         - Slide 5 (esquema_proceso): Paso a paso, arquitectura o metodología gráfica.
         - Slide 6 (desafio_aula): Una actividad, pregunta disparadora o reto interactivo para que los estudiantes discutan en clase durante 5 a 10 minutos.
         - Slide 7 (takeaway): Las 2 conclusiones maestras que el alumno se lleva grabadas al salir del aula.
      4. NOTAS DEL ORADOR OBLIGATORIAS: Cada slide DEBE incluir "notasOrador" redactadas en primera persona para el profesor.

      Debes devolver ÚNICAMENTE un JSON puro y válido (sin bloques markdown \`\`\`json) con el siguiente formato exacto:
      {
        "busqueda": ["Enfoque 1", "Enfoque 2", "Enfoque 3"],
        "plan": {
          "duracion": "2 horas cátedra (aprox. 80 - 90 minutos)",
          "objetivos": ["Objetivo 1", "Objetivo 2", "Objetivo 3"],
          "estructura": [
            { "fase": "Apertura y Gancho", "duracion": "15 min", "actividad": "Detalle didáctico..." },
            { "fase": "Desarrollo Conceptual", "duracion": "35 min", "actividad": "Detalle didáctico..." },
            { "fase": "Dinámica Activa en Aula", "duracion": "25 min", "actividad": "Detalle didáctico..." },
            { "fase": "Cierre y Conclusiones", "duracion": "15 min", "actividad": "Detalle didáctico..." }
          ]
        },
        "slides": [
          {
            "titulo": "${tema}",
            "subtitulo": "${materia} | UTN FRD",
            "categoria": "Portada Institucional",
            "tipo": "portada",
            "contenido": "",
            "notasOrador": "Bienvenida y presentación de la clase."
          },
          {
            "titulo": "¿Por qué es crucial entender esto?",
            "subtitulo": "El Desafío Real",
            "categoria": "Gancho y Problemática",
            "tipo": "hook",
            "contenido": "• Punto clave 1\\n• Punto clave 2\\n• Punto clave 3",
            "notasOrador": "Plantear caso real de la industria..."
          },
          {
            "titulo": "Fundamentos y Principios Clave",
            "subtitulo": "Concepto Núcleo",
            "categoria": "Teoría Esencial",
            "tipo": "concepto_nucleo",
            "contenido": "• Punto clave 1\\n• Punto clave 2\\n• Punto clave 3",
            "notasOrador": "Explicar la definición central..."
          },
          {
            "titulo": "Aplicación en la Industria Real",
            "subtitulo": "Caso de Uso",
            "categoria": "Ingeniería Aplicada",
            "tipo": "caso_aplicado",
            "contenido": "• Punto clave 1\\n• Punto clave 2\\n• Punto clave 3",
            "notasOrador": "Detallar el caso práctico..."
          },
          {
            "titulo": "Flujo de Funcionamiento / Arquitectura",
            "subtitulo": "Esquema Paso a Paso",
            "categoria": "Estructura Visual",
            "tipo": "esquema_proceso",
            "contenido": "1. Entrada\\n2. Proceso\\n3. Salida",
            "notasOrador": "Recorrer el diagrama..."
          },
          {
            "titulo": "Desafío Grupal (5 Minutos)",
            "subtitulo": "Manos a la Obra",
            "categoria": "Dinámica Participativa",
            "tipo": "desafio_aula",
            "contenido": "• Problema a resolver en parejas...",
            "notasOrador": "Monitorear el debate en el aula..."
          },
          {
            "titulo": "Conclusiones y Takeaways",
            "subtitulo": "Para Recordar Siempre",
            "categoria": "Cierre Magistral",
            "tipo": "takeaway",
            "contenido": "• Regla de oro...",
            "notasOrador": "Cierre y repaso para la próxima clase..."
          }
        ],
        "promptsImagenes": [
          "Prompt 1", "Prompt 2", "Prompt 3"
        ]
      }
    `;

    const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=" + apiKey;
    const payload = {
      contents: [{
        parts: [{ text: promptSistema }]
      }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.3
      }
    };

    const options = {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };

    const response = UrlFetchApp.fetch(url, options);
    const resCode = response.getResponseCode();
    if (resCode !== 200) {
      return { success: false, error: "Error en Gemini API (" + resCode + "): " + response.getContentText() };
    }

    const json = JSON.parse(response.getContentText());
    const textResult = json.candidates[0].content.parts[0].text;
    const claseObj = JSON.parse(textResult);
    claseObj.success = true;

    return claseObj;

  } catch (error) {
    console.error("Error en generarClaseConGeminiGAS: " + error.toString());
    return { success: false, error: "Error al generar con Gemini en el backend: " + error.toString() };
  }
}

/**
 * 10. OBTENER OFERTA ACADÉMICA COMPLETA AGRUPADA POR AÑO/NIVEL (DLR 3NF)
 */
function obtenerOfertaAcademica(token) {
  const legajo = validarSesion(token);
  if (!legajo) return { success: false, error: "Sesión expirada o inválida." };

  try {
    const cleanLegajo = normalizarId(legajo);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheetMateriasObj = ss.getSheetByName('Materias');

    if (!sheetMateriasObj) {
      return { success: false, error: "Error de configuración: No se encontró la hoja Materias." };
    }

    const sheetMaterias = sheetMateriasObj.getDataRange().getValues();
    const esDLR = sheetMaterias[0].length >= 6 && sheetMaterias[0][1].toString().toLowerCase().includes('plan');

    // 1. Obtener materias asignadas actualmente al docente (desde Asignaciones_Docente o Docentes CSV)
    let materiasAsignadasSet = new Set();
    const sheetAsignaciones = ss.getSheetByName('Asignaciones_Docente');
    if (sheetAsignaciones) {
      const dataAsign = sheetAsignaciones.getDataRange().getValues();
      for (let i = 1; i < dataAsign.length; i++) {
        if (normalizarId(dataAsign[i][1]) === cleanLegajo) {
          materiasAsignadasSet.add(normalizarId(dataAsign[i][2]));
        }
      }
    }

    if (materiasAsignadasSet.size === 0) {
      const sheetDocentes = ss.getSheetByName('Docentes');
      if (sheetDocentes) {
        const dataDoc = sheetDocentes.getDataRange().getValues();
        for (let i = 1; i < dataDoc.length; i++) {
          if (normalizarId(dataDoc[i][0]) === cleanLegajo) {
            let csv = dataDoc[i][4] ? String(dataDoc[i][4]).split(',') : [];
            csv.forEach(id => { if (id.trim()) materiasAsignadasSet.add(normalizarId(id)); });
            break;
          }
        }
      }
    }

    // 2. Construir catálogo agrupado
    let catalogo = {};
    for (let i = 1; i < sheetMaterias.length; i++) {
      let idMateria = normalizarId(sheetMaterias[i][0]);
      if (!idMateria) continue;

      let nombre = esDLR ? sheetMaterias[i][2] : sheetMaterias[i][1];
      let nivel = esDLR ? (sheetMaterias[i][3] || 'Otros') : (sheetMaterias[i][2] || 'Otros');
      let descripcion = esDLR ? (sheetMaterias[i][5] || '') : (sheetMaterias[i][3] || '');
      let activa = esDLR ? (sheetMaterias[i][6] !== false && sheetMaterias[i][6] !== 'FALSE') : true;

      if (!activa) continue;

      if (!catalogo[nivel]) catalogo[nivel] = [];

      catalogo[nivel].push({
        id: idMateria,
        nombre: nombre,
        descripcion: descripcion,
        asignada: materiasAsignadasSet.has(idMateria)
      });
    }

    return { success: true, catalogo: catalogo };
  } catch (error) {
    return { success: false, error: "Error al obtener la oferta académica: " + error.toString() };
  }
}

/**
 * 11. REGISTRAR RECLAMO DE MATERIAS Y REFRESCAR DASHBOARD (TRANSACCIONAL DLR)
 * Inserta/actualiza registros en la tabla relacional 'Asignaciones_Docente'
 * e invalida la caché del docente.
 */
function reclamarMaterias(token, materiasIdsSeleccionadas) {
  const legajo = validarSesion(token);
  if (!legajo) return { success: false, error: "Sesión expirada o inválida." };

  try {
    const cleanLegajo = normalizarId(legajo);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const idsSeleccionados = (materiasIdsSeleccionadas || []).map(id => normalizarId(id)).filter(Boolean);

    // 1. PERSISTIR EN TABLA RELACIONAL 'Asignaciones_Docente' (DLR)
    let sheetAsignaciones = ss.getSheetByName('Asignaciones_Docente');
    if (!sheetAsignaciones) {
      sheetAsignaciones = ss.insertSheet('Asignaciones_Docente');
      sheetAsignaciones.appendRow(['ID_Asignacion', 'Legajo_Docente', 'ID_Materia', 'Rol_Cargo', 'Comision', 'Ciclo_Lectivo', 'Fecha_Asignacion']);
    }

    const dataAsign = sheetAsignaciones.getDataRange().getValues();
    let filasAEliminar = [];

    // Detectar asignaciones previas del docente para eliminarlas
    for (let i = dataAsign.length - 1; i >= 1; i--) {
      if (normalizarId(dataAsign[i][1]) === cleanLegajo) {
        filasAEliminar.push(i + 1);
      }
    }

    // Borrar de abajo hacia arriba para no alterar índices
    filasAEliminar.forEach(fila => sheetAsignaciones.deleteRow(fila));

    // Insertar nuevas asignaciones
    const fechaActual = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
    const cicloActual = String(new Date().getFullYear());

    idsSeleccionados.forEach(idMateria => {
      sheetAsignaciones.appendRow([
        Utilities.getUuid(),
        cleanLegajo,
        idMateria,
        'Docente',
        '',
        cicloActual,
        fechaActual
      ]);
    });

    // 2. SINCRONIZAR FALLBACK EN HOJA 'Docentes' (Para no romper si alguien consulta CSV)
    const sheetDocentes = ss.getSheetByName('Docentes');
    if (sheetDocentes) {
      const dataDocentes = sheetDocentes.getDataRange().getValues();
      for (let i = 1; i < dataDocentes.length; i++) {
        if (normalizarId(dataDocentes[i][0]) === cleanLegajo) {
          sheetDocentes.getRange(i + 1, 5).setValue(idsSeleccionados.join(','));
          break;
        }
      }
    }

    // 3. INVALIDAR CACHÉ Y OBTENER DASHBOARD FRESCO
    const cache = CacheService.getScriptCache();
    cache.remove('dashboard_' + cleanLegajo);

    let nuevoDashboard = obtenerMateriasYTemasRelacional(ss, cleanLegajo, idsSeleccionados);
    cache.put('dashboard_' + cleanLegajo, JSON.stringify(nuevoDashboard), 3600);

    return {
      success: true,
      mensaje: "¡Materias asignadas a tu perfil con éxito!",
      dashboard: nuevoDashboard
    };
  } catch (err) {
    console.error("Error en reclamarMaterias: " + err.toString());
    return { success: false, error: "Error al guardar el reclamo de materias: " + err.toString() };
  }
}

/**
 * Función de diagnóstico para inspeccionar los encabezados y datos muestra de la planilla
 */
function debugSheetData() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let result = {};
    const sheets = ss.getSheets();
    for (let i = 0; i < sheets.length; i++) {
      let sheet = sheets[i];
      let name = sheet.getName();
      let data = sheet.getDataRange().getValues();
      result[name] = {
        rowsCount: data.length,
        headers: data[0] || [],
        sample: data.slice(1, 4) // primer de 3 filas de muestra
      };
    }
    return { success: true, sheets: result };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}

/**
 * Función auxiliar para retornar respuestas JSON con cabeceras correctas.
 */
function crearRespuestaJson(objeto) {
  return ContentService.createTextOutput(JSON.stringify(objeto))
    .setMimeType(ContentService.MimeType.JSON);
}

