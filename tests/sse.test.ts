import { describe, it, expect } from 'vitest';
import { crearParserSSE } from '@/lib/sse';

describe('parser SSE', () => {
  it('parsea eventos completos en un chunk', () => {
    const p = crearParserSSE();
    const ev = p.push('data: {"tipo":"progreso","mensaje":"hola"}\n\ndata: {"tipo":"chunk","texto":"x"}\n\n');
    expect(ev).toEqual([
      { tipo: 'progreso', mensaje: 'hola' },
      { tipo: 'chunk', texto: 'x' }
    ]);
  });

  it('bufferiza una línea cortada entre chunks', () => {
    const p = crearParserSSE();
    expect(p.push('data: {"tipo":"chu')).toEqual([]);
    expect(p.push('nk","texto":"ab"}\n')).toEqual([{ tipo: 'chunk', texto: 'ab' }]);
  });

  it('ignora líneas que no son data y JSON inválido', () => {
    const p = crearParserSSE();
    expect(p.push(': keepalive\nevent: x\ndata: no-json\n')).toEqual([]);
  });

  it('soporta CRLF', () => {
    const p = crearParserSSE();
    expect(p.push('data: {"tipo":"done","clase":{"a":1}}\r\n')).toEqual([
      { tipo: 'done', clase: { a: 1 } }
    ]);
  });

  it('flush procesa una última línea sin salto final', () => {
    const p = crearParserSSE();
    p.push('data: {"tipo":"error","error":"mal"}');
    expect(p.flush()).toEqual([{ tipo: 'error', error: 'mal' }]);
    expect(p.flush()).toEqual([]);
  });

  it('descarta tipos desconocidos', () => {
    const p = crearParserSSE();
    expect(p.push('data: {"tipo":"otro"}\n')).toEqual([]);
  });
});
