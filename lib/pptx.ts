/**
 * lib/pptx.ts — Exportador Élite de PowerPoint (.pptx) estilo NotebookLM
 * Tarjetas bento vectoriales, métricas gigantes, contrastes limpios y tipografía nítida en 16:9.
 */
import type { Clase } from './deck';

const PALETAS: Record<string, { bg: string; card: string; acento: string; texto: string; sub: string }> = {
  '': { bg: '0B132B', card: '1C2541', acento: '06A28A', texto: 'FFFFFF', sub: '94A3B8' },
  clasica: { bg: '0B132B', card: '1C2541', acento: '06A28A', texto: 'FFFFFF', sub: '94A3B8' },
  minimalista: { bg: 'F8FAFC', card: 'FFFFFF', acento: '047A68', texto: '0F172A', sub: '64748B' },
  contemporanea: { bg: '090D16', card: '111827', acento: '3B82F6', texto: 'FFFFFF', sub: '9CA3AF' },
  alta_carga: { bg: '05131E', card: '0F2942', acento: '8B5CF6', texto: 'FFFFFF', sub: '94A3B8' }
};

export async function exportarPptx(clase: Clase, materia: string, tema: string, estilo: string): Promise<Uint8Array> {
  const PptxGenJS = (await import('pptxgenjs')).default;
  const pptx = new PptxGenJS();
  const pal = PALETAS[estilo] || PALETAS.clasica;

  pptx.defineLayout({ name: 'UTN_16x9', width: 10, height: 5.625 });
  pptx.layout = 'UTN_16x9';
  pptx.author = 'UTN Contenidos — FRD';
  pptx.title = tema;

  (clase.slides || []).forEach((slide, idx) => {
    const s = pptx.addSlide();
    const esPortada = slide.tipo === 'portada' || idx === 0;

    if (esPortada) {
      // Fondo oscuro editorial
      s.background = { color: pal.bg };

      // Badge institucional superior
      s.addShape(pptx.ShapeType.roundRect, {
        x: 0.8, y: 0.8, w: 4.8, h: 0.35,
        fill: { color: pal.card },
        line: { color: pal.acento, width: 1 },
        rectRadius: 0.15
      });
      s.addText('FACULTAD REGIONAL DELTA · UTN', {
        x: 0.8, y: 0.8, w: 4.8, h: 0.35,
        fontSize: 10, color: pal.acento, bold: true, charSpacing: 1.5, align: 'center'
      });

      // Título y subtítulo
      s.addText(slide.titulo || tema, {
        x: 0.8, y: 1.6, w: 8.4, h: 1.8,
        fontSize: 36, color: pal.texto, bold: true, fontFace: 'Trebuchet MS', lineSpacing: 42
      });

      s.addText(slide.subtitulo || materia, {
        x: 0.8, y: 3.5, w: 8.4, h: 0.6,
        fontSize: 18, color: pal.sub, fontFace: 'Calibri'
      });

      // Pastilla de cátedra
      s.addShape(pptx.ShapeType.roundRect, {
        x: 0.8, y: 4.4, w: 3.2, h: 0.4,
        fill: { color: pal.acento },
        rectRadius: 0.2
      });
      s.addText(`Cátedra: ${materia}`, {
        x: 0.8, y: 4.4, w: 3.2, h: 0.4,
        fontSize: 11, color: 'FFFFFF', bold: true, align: 'center'
      });
    } else {
      s.background = { color: pal.bg };

      // Badge de categoría
      s.addText((slide.categoria || 'CLASE').toUpperCase(), {
        x: 0.8, y: 0.4, w: 4, h: 0.3,
        fontSize: 10, color: pal.acento, bold: true, charSpacing: 1.5
      });

      // Título
      s.addText(slide.titulo || 'Tema', {
        x: 0.8, y: 0.7, w: 8.4, h: 0.7,
        fontSize: 24, color: pal.texto, bold: true, fontFace: 'Trebuchet MS'
      });

      // BENTO CARD PRINCIPAL (Izquierda)
      s.addShape(pptx.ShapeType.roundRect, {
        x: 0.8, y: 1.5, w: 5.5, h: 3.4,
        fill: { color: pal.card },
        line: { color: pal.acento, width: 0.8 },
        rectRadius: 0.15
      });

      const bullets = (slide.contenido || '')
        .split('\n')
        .map(l => l.trim().replace(/^[•\-\*]\s*/, ''))
        .filter(Boolean)
        .slice(0, 5)
        .map(linea => ({
          text: linea,
          options: {
            bullet: { code: '2022', indent: 15 },
            color: pal.texto,
            fontSize: 14,
            breakLine: true,
            lineSpacing: 22
          }
        }));

      if (bullets.length > 0) {
        s.addText(bullets, { x: 1.1, y: 1.8, w: 4.9, h: 2.8, valign: 'top' });
      }

      // BENTO CARD SECUNDARIA / MÉTRICA (Derecha)
      if (slide.metrica?.valor) {
        s.addShape(pptx.ShapeType.roundRect, {
          x: 6.6, y: 1.5, w: 2.6, h: 1.6,
          fill: { color: pal.card },
          line: { color: pal.acento, width: 1.5 },
          rectRadius: 0.15
        });
        s.addText(slide.metrica.valor, {
          x: 6.6, y: 1.7, w: 2.6, h: 0.8,
          fontSize: 32, color: pal.texto, bold: true, align: 'center', fontFace: 'Trebuchet MS'
        });
        s.addText(slide.metrica.etiqueta || 'Métrica Clave', {
          x: 6.7, y: 2.5, w: 2.4, h: 0.4,
          fontSize: 10, color: pal.sub, bold: true, align: 'center', charSpacing: 1
        });
      }

      // BENTO CARD DESTACADO (Derecha abajo)
      if (slide.destacado) {
        const yPos = slide.metrica?.valor ? 3.3 : 1.5;
        const hPos = slide.metrica?.valor ? 1.6 : 3.4;

        s.addShape(pptx.ShapeType.roundRect, {
          x: 6.6, y: yPos, w: 2.6, h: hPos,
          fill: { color: pal.card },
          line: { color: pal.acento, width: 0.8 },
          rectRadius: 0.15
        });
        s.addText('💡 INSIGHT:', {
          x: 6.8, y: yPos + 0.15, w: 2.2, h: 0.3,
          fontSize: 9, color: pal.acento, bold: true
        });
        s.addText(slide.destacado, {
          x: 6.8, y: yPos + 0.45, w: 2.2, h: hPos - 0.6,
          fontSize: 11, color: pal.texto, italic: true
        });
      }

      // Pie de diapositiva
      s.addText(`${materia} · ${idx + 1} / ${clase.slides.length}`, {
        x: 0.8, y: 5.1, w: 8.4, h: 0.3,
        fontSize: 9, color: pal.sub, align: 'right'
      });
    }

    if (slide.notasOrador) {
      s.addNotes(`🎙️ GUÍA DOCENTE:\n${slide.notasOrador}`);
    }
  });

  const archivo = await pptx.write({ outputType: 'nodebuffer' });
  return archivo as Uint8Array;
}