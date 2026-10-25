/**
 * lib/ia-parser.ts — Módulo profundo para parsear y reparar JSON generado por LLMs.
 * Resuelve errores típicos de modelos de lenguaje:
 * - Cercos markdown (```json ... ```)
 * - Comas finales (trailing commas) antes de } o ]
 * - Claves sin comillas o con comillas simples
 * - Strings con comillas simples
 * - Saltos de línea y tabulaciones literales sin escapar dentro de strings
 * - Comentarios estilo JavaScript (// y /* *\/)
 * - Respuestas truncadas por límite de tokens (cierre automático de llaves/corchetes)
 */

export class ErrorJSONIA extends Error {
  constructor(mensaje: string, public readonly causaOriginal?: string) {
    super(mensaje);
    this.name = 'ErrorJSONIA';
  }
}

/**
 * Repara cadenas JSON malformadas por LLMs antes de parsear.
 */
export function repararJSON(raw: string): string {
  if (!raw || typeof raw !== 'string') {
    throw new ErrorJSONIA('No se recibió contenido de texto para interpretar.');
  }

  // 1. Quitar cercos de markdown y espacios externos
  let s = raw.trim();
  s = s.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

  // 2. Extraer rango desde el primer { o [
  const primerLlave = s.indexOf('{');
  const primerCorchete = s.indexOf('[');
  let inicio = -1;
  if (primerLlave !== -1 && primerCorchete !== -1) {
    inicio = Math.min(primerLlave, primerCorchete);
  } else if (primerLlave !== -1) {
    inicio = primerLlave;
  } else if (primerCorchete !== -1) {
    inicio = primerCorchete;
  }

  if (inicio === -1) {
    throw new ErrorJSONIA('No se encontró ninguna estructura JSON en la respuesta de la IA.');
  }

  s = s.slice(inicio);

  // 3. Normalizar comillas simples en claves y valores
  // Claves con comillas simples: 'clave': -> "clave":
  s = s.replace(/([{,]\s*)'([^'\n\r\t]+)'\s*:/g, '$1"$2":');
  // Claves sin comillas: clave: -> "clave":
  s = s.replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":');
  // Valores en formato 'valor': -> "valor" (evitando dentro de palabras en español)
  s = s.replace(/:\s*'([^'\n\r]*)'/g, ': "$1"');
  s = s.replace(/(\[|,)\s*'([^'\n\r]*)'/g, '$1 "$2"');

  // 4. Máquina de estados para procesar caracteres dentro y fuera de strings
  let resultado = '';
  let enString = false;
  let escape = false;
  const stack: ('{' | '[')[] = [];

  for (let i = 0; i < s.length; i++) {
    const char = s[i];
    const next = s[i + 1];

    if (escape) {
      resultado += char;
      escape = false;
      continue;
    }

    if (char === '\\') {
      escape = true;
      resultado += char;
      continue;
    }

    if (char === '"') {
      enString = !enString;
      resultado += char;
      continue;
    }

    if (enString) {
      // Escapar caracteres de control literales dentro de strings JSON
      if (char === '\n') {
        resultado += '\\n';
      } else if (char === '\r') {
        resultado += '\\r';
      } else if (char === '\t') {
        resultado += '\\t';
      } else {
        resultado += char;
      }
      continue;
    }

    // --- Fuera de strings ---

    // Comentarios de una línea: // ...
    if (char === '/' && next === '/') {
      const finLinea = s.indexOf('\n', i + 2);
      if (finLinea === -1) break;
      i = finLinea;
      continue;
    }

    // Comentarios multilínea: /* ... */
    if (char === '/' && next === '*') {
      const finComent = s.indexOf('*/', i + 2);
      if (finComent === -1) break;
      i = finComent + 1;
      continue;
    }

    // Seguimiento de balance de llaves y corchetes
    if (char === '{' || char === '[') {
      stack.push(char);
    } else if (char === '}') {
      if (stack.length > 0 && stack[stack.length - 1] === '{') {
        stack.pop();
      }
    } else if (char === ']') {
      if (stack.length > 0 && stack[stack.length - 1] === '[') {
        stack.pop();
      }
    }

    resultado += char;
  }

  // 5. Eliminar comas finales (trailing commas) repetidamente hasta que no queden
  let prev = '';
  while (prev !== resultado) {
    prev = resultado;
    resultado = resultado.replace(/,\s*([}\]])/g, '$1');
  }

  // 6. Cerrar estructuras truncadas si quedaron llaves/corchetes abiertos
  resultado = resultado.trim().replace(/,\s*$/, '');
  while (stack.length > 0) {
    const esperado = stack.pop();
    if (esperado === '{') resultado += '}';
    else if (esperado === '[') resultado += ']';
  }

  return resultado;
}

/**
 * Parsea el texto devuelto por la IA garantizando tolerancia a fallos.
 * Si el texto es válido, lo parsea directamente. Si tiene errores típicos,
 * lo repara. Si falla totalmente, lanza un error amigable en español.
 */
export function parsearJSONIA<T = any>(texto: string): T {
  if (!texto || typeof texto !== 'string') {
    throw new ErrorJSONIA('No se pudo estructurar la respuesta de la IA (respuesta vacía).');
  }

  // Intento 1: Parse rápido si viene limpio o con cercos básicos
  const simple = texto.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  const inicio = simple.indexOf('{');
  const fin = simple.lastIndexOf('}');
  if (inicio >= 0 && fin > inicio) {
    try {
      return JSON.parse(simple.slice(inicio, fin + 1));
    } catch {
      // Continúa con la reparación profunda
    }
  }

  // Intento 2: Reparación profunda (comas sobrantes, comentarios, caracteres de control, truncado)
  try {
    const reparado = repararJSON(texto);
    return JSON.parse(reparado);
  } catch (e) {
    const causa = (e as Error).message;
    throw new ErrorJSONIA(
      'No se pudo estructurar la respuesta de la IA. Por favor, intentá generar de nuevo.',
      causa
    );
  }
}
