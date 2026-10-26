import { describe, it, expect } from 'vitest';
import { buildDeckHtml, Clase } from '@/lib/deck';
import fs from 'node:fs';
import path from 'node:path';

const mockClass: Clase = {
  slides: [
    { titulo: 'Portada UTN', layout: 'portada', tipo: 'portada', subtitulo: 'Sistemas Operativos' },
    { titulo: 'Procesos e Hilos', layout: 'bento', tipo: 'concepto_nucleo', contenido: '• Concurrencia\n• Paralelismo' },
    { titulo: 'Conclusión', layout: 'takeaway', contenido: '• Fin de clase' }
  ]
};

describe('TDD: Proyección, Navegación con Flechas e Impresión PDF en Reveal.js', () => {
  it('seam 1: buildDeckHtml debe inicializar Reveal con navigationMode: "linear"', () => {
    const html = buildDeckHtml(mockClass, 'Sistemas Operativos', 'Procesos', 'clasica');
    expect(html).toContain("navigationMode: 'linear'");
  });

  it('seam 2: buildDeckHtml debe habilitar navegación por teclado explícita para flechas', () => {
    const html = buildDeckHtml(mockClass, 'Sistemas Operativos', 'Procesos', 'clasica');
    expect(html).toContain("keyboard: true");
  });

  it('seam 3: buildDeckHtml debe escuchar postMessage para avanzar/retroceder slides desde el contenedor/iframe', () => {
    const html = buildDeckHtml(mockClass, 'Sistemas Operativos', 'Procesos', 'clasica');
    expect(html).toContain('SIGUIENTE_SLIDE');
    expect(html).toContain('ANTERIOR_SLIDE');
    expect(html).toContain('Reveal.next()');
    expect(html).toContain('Reveal.prev()');
  });

  it('seam 4: buildDeckHtml debe incluir soporte para impresión PDF automática con print-pdf', () => {
    const html = buildDeckHtml(mockClass, 'Sistemas Operativos', 'Procesos', 'clasica');
    expect(html).toContain('print-pdf');
    expect(html).toContain('window.print()');
  });

  it('seam 5: buildDeckHtml debe activar view print nativo al recibir printPdf: true', () => {
    const html = buildDeckHtml(mockClass, 'Sistemas Operativos', 'Procesos', 'clasica', { printPdf: true });
    expect(html).toContain("const forzarPrint = true;");
    expect(html).toContain("view: isPrintPdf ? 'print' : undefined");
  });

  it('seam 6: buildDeckHtml debe forzar print-color-adjust: exact en @media print para conservar colores de la cátedra', () => {
    const html = buildDeckHtml(mockClass, 'Sistemas Operativos', 'Procesos', 'clasica');
    expect(html).toMatch(/print-color-adjust:\s*exact/);
  });

  it('seam 7: VisorResultado debe mostrar siempre el botón Proyectar, incluso sin presentacionId', () => {
    const visorPath = path.join(process.cwd(), 'components/generador/VisorResultado.tsx');
    const visorSrc = fs.readFileSync(visorPath, 'utf8');

    expect(visorSrc).not.toMatch(/\{presentacionId\s*&&\s*\(\s*<MaterialButton[^>]*>\s*<MonitorPlay/);
    expect(visorSrc).toMatch(/proyectar/i);
  });

  it('seam 8: VisorResultado no debe hacer window.print() sobre la página principal', () => {
    const visorPath = path.join(process.cwd(), 'components/generador/VisorResultado.tsx');
    const visorSrc = fs.readFileSync(visorPath, 'utf8');

    expect(visorSrc).not.toContain(': window.print()');
  });

  it('seam 9: VisorResultado debe despachar flechas izquierda/derecha al iframe', () => {
    const visorPath = path.join(process.cwd(), 'components/generador/VisorResultado.tsx');
    const visorSrc = fs.readFileSync(visorPath, 'utf8');

    expect(visorSrc).toContain('SIGUIENTE_SLIDE');
    expect(visorSrc).toContain('ANTERIOR_SLIDE');
    expect(visorSrc).toContain('ArrowRight');
    expect(visorSrc).toContain('ArrowLeft');
  });

  it('seam 10: GeneradorClase debe propagar presentacionId si se guarda la presentación', () => {
    const generadorPath = path.join(process.cwd(), 'app/generar/GeneradorClase.tsx');
    const generadorSrc = fs.readFileSync(generadorPath, 'utf8');

    expect(generadorSrc).toContain('presentacionId={presentacionId');
  });
});
