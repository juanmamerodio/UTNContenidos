/**
 * api/gemini.js
 * Serverless Function para Vercel (Node.js)
 * Orquesta la llamada segura a Google Gemini desde el backend,
 * evitando exponer la API Key en el cliente.
 * Diseñado con ingeniería pedagógica de élite para la UTN Facultad Regional Delta.
 */

export default async function handler(req, res) {
  // Configuración de cabeceras CORS dinámicas y seguras
  const allowedOrigins = [
    'https://utn-contenidos.vercel.app',
    'http://localhost:3000',
    'http://127.0.0.1:5500'
  ];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Método no permitido. Usa POST.' });
  }

  try {
    const { textoOficial, materia, tema, contextoDinamico } = req.body;

    if (!materia || !tema) {
      return res.status(400).json({ success: false, error: 'Faltan parámetros obligatorios: materia y tema.' });
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return res.status(500).json({
        success: false,
        error: 'La variable de entorno GEMINI_API_KEY no está configurada en Vercel.'
      });
    }

    // System Prompt de Élite Pedagógica UTN
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
      4. NOTAS DEL ORADOR OBLIGATORIAS: Cada slide DEBE incluir "notasOrador" redactadas en primera persona para el profesor (ej: "Explicar a los alumnos que...", "Hacer énfasis en...", "Preguntar a la sala si...").

      Debes devolver ÚNICAMENTE un JSON puro y válido (sin bloques markdown \`\`\`json) con el siguiente formato exacto:
      {
        "busqueda": [
          "Enfoque didáctico sugerido 1 (ej: Enfoque inductivo partiendo de una falla real)",
          "Enfoque didáctico sugerido 2 (ej: Enfoque comparativo entre arquitecturas)",
          "Enfoque didáctico sugerido 3 (ej: Taller hands-on guiado)"
        ],
        "plan": {
          "duracion": "2 horas cátedra (aprox. 80 - 90 minutos)",
          "objetivos": [
            "Comprender los fundamentos esenciales de...",
            "Analizar críticamente la aplicación de...",
            "Resolver problemas prácticos vinculados a..."
          ],
          "estructura": [
            { "fase": "Apertura y Gancho", "duracion": "15 min", "actividad": "Presentación del problema real y disparador de debate." },
            { "fase": "Desarrollo Conceptual", "duracion": "35 min", "actividad": "Exposición guiada del núcleo teórico y ejemplos prácticos." },
            { "fase": "Dinámica Activa en Aula", "duracion": "25 min", "actividad": "Resolución del desafío propuesto en parejas o equipos." },
            { "fase": "Cierre y Conclusiones", "duracion": "15 min", "actividad": "Puesta en común, dudas y consolidación de los conceptos clave." }
          ]
        },
        "slides": [
          {
            "titulo": "${tema}",
            "subtitulo": "${materia} | UTN FRD",
            "categoria": "Portada Institucional",
            "tipo": "portada",
            "contenido": "",
            "notasOrador": "Bienvenida al curso. Presentar la hoja de ruta de la clase y establecer expectativas."
          },
          {
            "titulo": "¿Por qué es crucial entender esto?",
            "subtitulo": "El Desafío Real",
            "categoria": "Gancho y Problemática",
            "tipo": "hook",
            "contenido": "• El cuello de botella tradicional en la industria.\\n• Impacto en rendimiento y escalabilidad.\\n• ¿Qué pasa si no lo implementamos correctamente?",
            "notasOrador": "Plantear una anécdota o caso de fallo conocido. Dejar que 2 alumnos opinen antes de avanzar."
          },
          {
            "titulo": "Fundamentos y Principios Clave",
            "subtitulo": "Concepto Núcleo",
            "categoria": "Teoría Esencial",
            "tipo": "concepto_nucleo",
            "contenido": "• Definición formal y premisa central.\\n• Propiedades fundamentales del modelo.\\n• Relación directa con el estándar de ingeniería.",
            "notasOrador": "Desglosar cada punto en el pizarrón. Verificar con preguntas de control si quedó clara la definición."
          },
          {
            "titulo": "Aplicación en la Industria Real",
            "subtitulo": "Caso de Uso",
            "categoria": "Ingeniería Aplicada",
            "tipo": "caso_aplicado",
            "contenido": "• Implementación en escenarios de alta demanda.\\n• Comparativa de eficiencia: Antes vs Después.\\n• Buenas prácticas adoptadas en proyectos reales.",
            "notasOrador": "Detallar el caso de estudio. Invitar a relacionarlo con tecnologías que ellos ya utilicen."
          },
          {
            "titulo": "Flujo de Funcionamiento / Arquitectura",
            "subtitulo": "Esquema Paso a Paso",
            "categoria": "Estructura Visual",
            "tipo": "esquema_proceso",
            "contenido": "1. Inicialización y captura de parámetros.\\n2. Procesamiento y transformación de datos.\\n3. Validación, persistencia y entrega de resultados.",
            "notasOrador": "Recorrer las fases secuencialmente señalando posibles cuellos de botella en cada etapa."
          },
          {
            "titulo": "Desafío Grupal (5 Minutos)",
            "subtitulo": "Manos a la Obra",
            "categoria": "Dinámica Participativa",
            "tipo": "desafio_aula",
            "contenido": "• Problema: Optimizar el escenario expuesto.\\n• Discutan en parejas: ¿Qué decisión tomarían?\\n• Puesta en común rápida de 3 propuestas.",
            "notasOrador": "Caminar por el aula escuchando las hipótesis de los grupos. Luego pedir a 2 voluntarios que compartan su solución."
          },
          {
            "titulo": "Conclusiones y Takeaways",
            "subtitulo": "Para Recordar Siempre",
            "categoria": "Cierre Magistral",
            "tipo": "takeaway",
            "contenido": "• Regla de oro para el ejercicio profesional.\\n• El error más común a evitar en exámenes y proyectos.\\n• Próximo paso: Práctica de laboratorio en la siguiente clase.",
            "notasOrador": "Cerrar con energía. Remarcar que este tema se evaluará en el trabajo práctico e incentivar a consultar dudas."
          }
        ],
        "promptsImagenes": [
          "Modern minimalist engineering blueprint illustration of ${tema}, dark blue and tech accents, clean vector style, 4k",
          "Visual comparison diagram of system architecture for ${tema}, corporate university style, high contrast",
          "Concept art of collaborative engineering classroom in a technical university, vibrant modern atmosphere"
        ]
      }
    `;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${geminiApiKey}`;
    const payload = {
      contents: [{
        parts: [{
          text: promptSistema
        }]
      }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.3
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        success: false,
        error: `La API de Gemini devolvió un error: ${response.status} - ${errorText}`
      });
    }

    const jsonResponse = await response.json();
    if (!jsonResponse.candidates || jsonResponse.candidates.length === 0) {
      return res.status(500).json({
        success: false,
        error: 'La API de Gemini no retornó ninguna respuesta válida.'
      });
    }

    const textResult = jsonResponse.candidates[0].content.parts[0].text;
    const claseGenerada = JSON.parse(textResult);

    // Adjuntar la bandera de éxito
    claseGenerada.success = true;

    return res.status(200).json(claseGenerada);

  } catch (error) {
    console.error('Error en api/gemini:', error);
    return res.status(500).json({
      success: false,
      error: `Error interno en el servidor serverless: ${error.message}`
    });
  }
}
