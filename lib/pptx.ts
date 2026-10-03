/**
 * lib/pptx.ts — Exportador de presentación a PowerPoint (.pptx)
 * Usa PptxGenJS 4.x en Node.js para mantener sus dependencias fuera del bundle cliente.
 * Mentiene el branding UTN: paletas por estilo + portada institucional.
 */
import type { Clase } from './deck';

const PALETAS: Record<string, string> = {
  '': '0055A6',
  clasica: '0055A6',
  minimalista: '06A28A',
  contemporanea: '2563EB',
  alta_carga: '7C3AED'
};

export async function exportarPptx(clase: Clase, materia: string, tema: string, estilo: string): Promise<Uint8Array> {
  const PptxGenJS = (await import('pptxgenjs')).default;
  const pptx = new PptxGenJS();
  const ACENTO = PALETAS[estilo] || PALETAS.clasica;

  pptx.defineLayout({ name: 'UTN_16x9', width: 10, height: 5.625 });
  pptx.layout = 'UTN_16x9';
  pptx.author = 'UTN Contenidos — FRD';
  pptx.title = tema;

  (clase.slides || []).forEach((slide, idx) => {
    const s = pptx.addSlide();
    const esPortada = slide.tipo === 'portada' || idx === 0;

    if (esPortada) {
      s.background = { color: '0A2540' };
      s.addText('UNIVERSIDAD TECNOLÓGICA NACIONAL · FACULTAD REGIONAL DELTA', {
        x: 0.6, y: 0.4, w: 8.8, h: 0.4, fontSize: 11, color: '94A3B8', bold: true, charSpacing: 2
      });
      s.addText(slide.titulo || tema, {
        x: 0.6, y: 1.6, w: 8.8, h: 1.4, fontSize: 34, color: 'FFFFFF', bold: true
      });
      s.addText(slide.subtitulo || materia, {
        x: 0.6, y: 3.2, w: 8.8, h: 0.6, fontSize: 16, color: ACENTO, bold: true
      });
    } else {
      s.background = { color: 'FFFFFF' };
      // Banda de acento superior
      s.addText('', { x: 0, y: 0, w: 10, h: 0.12, fill: { color: ACENTO } });
      // Categoría
      if (slide.categoria) {
        s.addText(slide.categoria.toUpperCase(), {
          x: 0.6, y: 0.45, w: 4, h: 0.4, fontSize: 12, color: ACENTO, bold: true, charSpacing: 1
        });
      }
      // Título
      s.addText(slide.titulo || 'Tema', {
        x: 0.6, y: 0.95, w: 8.8, h: 0.8, fontSize: 24, color: '0A2540', bold: true
      });
      // Contenido: bullets con guiones largos
      const bullets = (slide.contenido || '')
        .split('\n')
        .map(l => l.trim().replace(/^[•\-\*]\s*/, ''))
        .filter(Boolean)
        .slice(0, 6)
        .map(linea => ({ text: linea, options: { bullet: { code: '2013', indent: 12 }, color: '1E293B', fontSize: 15, breakLine: true } }));

      if (bullets.length > 0) {
        s.addText(bullets, { x: 0.8, y: 2.0, w: 8.4, h: 3.0, valign: 'top' });
      }
      // Destacado
      if (slide.destacado) {
        s.addText('💡 ' + slide.destacado, {
          x: 0.8, y: 4.6, w: 8.4, h: 0.7, fontSize: 13, color: ACENTO, bold: true, italic: true
        });
      }
      // Pie: numeración
      s.addText(`${materia} · ${idx + 1}/${clase.slides.length}`, {
        x: 0.6, y: 5.25, w: 4, h: 0.3, fontSize: 9, color: '94A3B8'
      });
    }
  });

  const archivo = await pptx.write({ outputType: 'nodebuffer' });
  return archivo as Uint8Array;
}