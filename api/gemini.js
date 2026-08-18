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

    // System Instruction nativo de Élite Pedagógica UTN (ahorro extremo de tokens)
    const systemInstruction = `
Actúa como un Profesor Titular de Cátedra y Diseñador Pedagógico Senior de la Universidad Tecnológica Nacional (UTN), Facultad Regional Delta.
Tu misión es estructurar una clase universitaria MEMORABLE, DINÁMICA y VISUALMENTE EXCELENTE sobre el tema solicitado.

🚨 REGLAS PEDAGÓGICAS INNEGOCIABLES:
1. PROHIBIDO crear diapositivas con bloques densos de texto. Las diapositivas son para proyectar, no para leer.
2. Cada diapositiva de contenido debe tener MÁXIMO 3 o 4 puntos clave, ultra sintéticos y contundentes (máximo 12 palabras por punto).
3. ESTRUCTURA DIDÁCTICA ESTRICTA DE EXACTAMENTE 7 DIAPOSITIVAS:
   - Slide 1 (portada): Título impactante del tema, materia y mención a la Facultad Regional Delta.
   - Slide 2 (hook): Problema real de la industria/ingeniería o pregunta provocadora para abrir el debate inicial.
   - Slide 3 (concepto_nucleo): Fundamentos teóricos indispensables explicados con claridad meridiana.
   - Slide 4 (caso_aplicado): Ejemplo tangible en el mundo real, industria, infraestructura o sistemas tecnológicos.
   - Slide 5 (esquema_proceso): Paso a paso, arquitectura o metodología lógica/gráfica.
   - Slide 6 (desafio_aula): Actividad, pregunta disparadora o reto interactivo para debate en clase (5 a 10 min).
   - Slide 7 (takeaway): Las 2 conclusiones maestras que el alumno se lleva grabadas al salir del aula.
4. NOTAS DEL ORADOR: Redactadas en primera persona para el profesor (ej: "Explicar a los alumnos que...", "Hacer énfasis en...").
5. IMAGEN KEYWORD: Para cada slide, proporciona 2 a 3 palabras clave en inglés representativas del concepto para búsqueda de imagen libre (ej: "industrial robotics arm", "database network server", "electrical power grid").
`;

    // Recorte inteligente del texto de cátedra para no saturar tokens (máx 15.000 caracteres / ~3000 palabras clave)
    let textoCatedraLimpio = textoOficial || 'Sin apunte específico cargado. Utilizar el estado del arte de la ingeniería y estándares universitarios de la UTN.';
    if (textoCatedraLimpio.length > 15000) {
      textoCatedraLimpio = textoCatedraLimpio.substring(0, 15000) + '... [Material resumido para síntesis didáctica]';
    }

    const userPrompt = `
Materia: "${materia}"
Tema a exponer: "${tema}"
Orientaciones específicas del docente: "${contextoDinamico || 'Ninguna indicación adicional'}"

Material de Cátedra de referencia:
${textoCatedraLimpio}
`;

    // Esquema estricto Structured Outputs (Garantiza 7 slides y ahorra miles de tokens de ejemplos)
    const responseSchema = {
      type: "OBJECT",
      properties: {
        busqueda: {
          type: "ARRAY",
          description: "3 enfoques didácticos sugeridos para la clase",
          items: { type: "STRING" }
        },
        plan: {
          type: "OBJECT",
          properties: {
            duracion: { type: "STRING", description: "Ej: 2 horas cátedra (aprox. 80-90 min)" },
            objetivos: {
              type: "ARRAY",
              description: "3 objetivos de aprendizaje específicos",
              items: { type: "STRING" }
            },
            estructura: {
              type: "ARRAY",
              description: "Cronograma de momentos de clase (4 fases)",
              items: {
                type: "OBJECT",
                properties: {
                  fase: { type: "STRING" },
                  duracion: { type: "STRING" },
                  actividad: { type: "STRING" }
                },
                required: ["fase", "duracion", "actividad"]
              }
            }
          },
          required: ["duracion", "objetivos", "estructura"]
        },
        slides: {
          type: "ARRAY",
          description: "Colección estricta de exactamente 7 diapositivas didácticas estructuradas",
          items: {
            type: "OBJECT",
            properties: {
              titulo: { type: "STRING", description: "Título breve y contundente de la diapositiva" },
              subtitulo: { type: "STRING", description: "Subtítulo o contexto temático" },
              categoria: { type: "STRING", description: "Momento pedagógico: Portada, Gancho y Problemática, Concepto Núcleo, etc." },
              tipo: { 
                type: "STRING", 
                enum: ["portada", "hook", "concepto_nucleo", "caso_aplicado", "esquema_proceso", "desafio_aula", "takeaway"] 
              },
              contenido: { type: "STRING", description: "Texto formateado con viñetas (• punto 1\\n• punto 2) sintético" },
              puntosClave: {
                type: "ARRAY",
                description: "Los 2 a 4 puntos clave desglosados (máximo 12 palabras cada uno)",
                items: { type: "STRING" }
              },
              destacado: { type: "STRING", description: "Frase, pregunta de debate o takeaway resaltado" },
              imagenKeyword: { type: "STRING", description: "2 o 3 palabras clave en inglés para la imagen (ej: tech server room, robotic arm)" },
              notasOrador: { type: "STRING", description: "Guía docente en primera persona con indicaciones para el aula" }
            },
            required: ["titulo", "subtitulo", "categoria", "tipo", "contenido", "notasOrador"]
          }
        },
        promptsImagenes: {
          type: "ARRAY",
          description: "3 prompts en inglés de alta calidad para generación de imágenes",
          items: { type: "STRING" }
        }
      },
      required: ["busqueda", "plan", "slides", "promptsImagenes"]
    };

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${geminiApiKey}`;
    const payload = {
      systemInstruction: {
        parts: [{ text: systemInstruction }]
      },
      contents: [{
        parts: [{ text: userPrompt }]
      }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.2
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
