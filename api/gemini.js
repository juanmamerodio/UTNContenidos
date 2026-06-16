/**
 * api/gemini.js
 * Serverless Function para Vercel (Node.js)
 * Orquesta la llamada segura a Google Gemini desde el backend,
 * evitando exponer la API Key en el cliente.
 */

export default async function handler(req, res) {
  // Configuración de cabeceras CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
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

    // El Prompt estructurado para Gemini
    const promptSistema = `
      Actúa como un profesor titular de la UTN Facultad Regional Delta. 
      Tu objetivo es estructurar una clase sobre el tema "${tema}" para la materia "${materia}".
      
      REGLA DE ORO DE CONTENIDO: 
      Si el siguiente texto oficial de la cátedra no tiene advertencias de falta de permisos, basate principalmente en él. Si tiene una advertencia, usá teoría universitaria estándar.
      
      --- INICIO DEL TEXTO OFICIAL DE LA CÁTEDRA ---
      ${textoOficial || 'No se proporcionó bibliografía específica. Usa teoría estándar de nivel universitario.'}
      --- FIN DEL TEXTO OFICIAL ---
      
      Indicaciones adicionales del profesor para orientar la clase: ${contextoDinamico || 'Ninguna'}
      
      Devuelve OBLIGATORIAMENTE un objeto en formato JSON puro (sin delimitadores de código markdown como \`\`\`json) que respete estrictamente esta estructura:
      {
        "busqueda": [
          "Sugerencia de enfoque 1",
          "Sugerencia de enfoque 2",
          "Sugerencia de enfoque 3"
        ],
        "plan": {
          "duracion": "tiempo estimado total (ej: 2 horas cátedra)",
          "objetivos": [
            "Objetivo conceptual de aprendizaje",
            "Objetivo procedimental o práctico"
          ],
          "estructura": [
            { "fase": "ej: Introducción", "duracion": "ej: 15 min", "actividad": "detalle didáctico de lo que se hace" }
          ]
        },
        "slides": [
          { "titulo": "${tema}", "subtitulo": "${materia} - UTN FRD", "tipo": "portada" },
          { "titulo": "título de slide", "contenido": "Punto 1\\nPunto 2\\nPunto 3", "tipo": "texto/esquema/practico" }
        ],
        "promptsImagenes": [
          "Prompt en inglés para imagen de portada",
          "Prompt en inglés para diagrama o gráfico de apoyo",
          "Prompt en inglés para caso práctico"
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
        responseMimeType: "application/json"
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
