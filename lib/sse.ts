/**
 * lib/sse.ts — Parser incremental de Server-Sent Events.
 * Mantiene un buffer: una línea `data:` cortada entre chunks se completa en el siguiente push.
 */
export type EventoSSE =
  | { tipo: 'progreso'; mensaje?: string }
  | { tipo: 'chunk'; texto?: string }
  | { tipo: 'done'; clase: any }
  | { tipo: 'error'; error?: string };

const TIPOS = new Set(['progreso', 'chunk', 'done', 'error']);

function parsearLinea(linea: string): EventoSSE | null {
  const l = linea.replace(/\r$/, '');
  if (!l.startsWith('data: ')) return null;
  try {
    const dato = JSON.parse(l.slice(6));
    return dato && TIPOS.has(dato.tipo) ? (dato as EventoSSE) : null;
  } catch {
    return null;
  }
}

export function crearParserSSE() {
  let buffer = '';

  function extraer(texto: string): EventoSSE[] {
    return texto
      .split('\n')
      .map(parsearLinea)
      .filter((e): e is EventoSSE => e !== null);
  }

  return {
    push(chunk: string): EventoSSE[] {
      buffer += chunk;
      const corte = buffer.lastIndexOf('\n');
      if (corte === -1) return [];
      const completo = buffer.slice(0, corte);
      buffer = buffer.slice(corte + 1);
      return extraer(completo);
    },
    flush(): EventoSSE[] {
      const resto = buffer;
      buffer = '';
      return extraer(resto);
    }
  };
}
