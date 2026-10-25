import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { buildDeckHtml, Clase } from '@/lib/deck';

function getLuminance(hex: string): number {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;
  const [lr, lg, lb] = [r, g, b].map(v => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
}

function getContrast(hex1: string, hex2: string): number {
  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

const claseEjemplo: Clase & { [key: string]: any } = {
  plan: { duracion: '2 horas', objetivos: ['Aprender TDD'] },
  slides: [
    {
      titulo: 'Título Portada',
      subtitulo: 'Subtítulo Portada',
      layout: 'portada',
      tipo: 'portada',
      contenido: 'Bienvenida',
      notasOrador: 'Nota secreta del orador en portada'
    } as any,
    {
      titulo: 'Fundamentos Bento',
      subtitulo: 'Explicación conceptual',
      layout: 'bento',
      tipo: 'concepto_nucleo',
      contenido: '• Punto clave 1\n• Punto clave 2',
      metrica: { valor: '99%', etiqueta: 'Efectividad' },
      destacado: 'Insight fundamental',
      notasOrador: 'Nota secreta en bento'
    } as any,
    {
      titulo: 'Comparativa de Enfoques',
      layout: 'comparativa',
      tipo: 'caso_aplicado',
      columnas: [
        { titulo: 'Tradicional', puntos: ['Lento', 'Rígido'] },
        { titulo: 'Moderno', puntos: ['Rápido', 'Adaptativo'] }
      ],
      notasOrador: 'Nota secreta en comparativa'
    } as any,
    {
      titulo: 'Flujo de Trabajo',
      layout: 'proceso',
      tipo: 'esquema_proceso',
      contenido: 'Paso 1: Requisitos\nPaso 2: TDD\nPaso 3: Deploy',
      destacado: 'Siempre verificar en verde',
      notasOrador: 'Nota secreta en proceso'
    } as any
  ]
};

describe('Deck Legibilidad & Eliminación de Notas de Orador (Issue #1)', () => {
  const paletas = ['clasica', 'minimalista', 'contemporanea', 'alta_carga'];

  describe('Fondo y texto de respaldo en body y .reveal', () => {
    it.each(paletas)('define fondo y color de respaldo en body y .reveal para la paleta %s', (paleta) => {
      const html = buildDeckHtml(claseEjemplo, 'Sistemas Operativos', 'Concurrencia', paleta);
      
      // Debe contener estilos de body con fondo y texto definidos
      expect(html).toMatch(/body\s*{[^}]*background(-color)?:\s*var\(--deck-bg\)/i);
      expect(html).toMatch(/body\s*{[^}]*color:\s*var\(--deck-fg\)/i);
      // Reveal container debe definir background
      expect(html).toMatch(/\.reveal\s*{[^}]*background(-color)?:\s*var\(--deck-bg\)/i);
    });
  });

  describe('Eliminación de colores de texto fijos incompatibles (#ffffff, #94a3b8 en títulos/subtítulos)', () => {
    it.each(paletas)('no utiliza colores fijos blancos o grises claros en títulos ni subtítulos para %s', (paleta) => {
      const html = buildDeckHtml(claseEjemplo, 'Sistemas Operativos', 'Concurrencia', paleta);

      // Los títulos no deben tener color: #ffffff fijo
      expect(html).not.toMatch(/\.slide-title\s*{[^}]*color:\s*#ffffff/i);
      expect(html).not.toMatch(/\.hero-title\s*{[^}]*color:\s*#ffffff/i);
      expect(html).not.toMatch(/\.comparison-col\s+\.col-title\s*{[^}]*color:\s*#ffffff/i);
      expect(html).not.toMatch(/\.metric-val\s*{[^}]*color:\s*#ffffff/i);

      // Los subtítulos y labels no deben tener color: #94A3B8 fijo
      expect(html).not.toMatch(/\.slide-subtitle\s*{[^}]*color:\s*#94A3B8/i);
      expect(html).not.toMatch(/\.hero-subtitle\s*{[^}]*color:\s*#94A3B8/i);
      expect(html).not.toMatch(/\.metric-lbl\s*{[^}]*color:\s*#94A3B8/i);

      // Los elementos deben usar tokens semánticos
      expect(html).toMatch(/\.slide-title\s*{[^}]*color:\s*var\(--deck-fg\)/i);
      expect(html).toMatch(/\.hero-title\s*{[^}]*color:\s*var\(--deck-fg\)/i);
      expect(html).toMatch(/\.slide-subtitle\s*{[^}]*color:\s*var\(--deck-muted\)/i);
      expect(html).toMatch(/\.hero-subtitle\s*{[^}]*color:\s*var\(--deck-muted\)/i);
    });
  });

  describe('Gradiente de portada derivado de la paleta', () => {
    it('no usa un fondo oscuro fijo (#031c18) en la paleta minimalista', () => {
      const html = buildDeckHtml(claseEjemplo, 'Sistemas Operativos', 'Concurrencia', 'minimalista');
      expect(html).not.toContain('#031c18');
    });
  });

  describe('Contraste WCAG AA en todas las paletas', () => {
    it.each(paletas)('cumple contraste WCAG AA (>= 4.5:1) en texto primario y atenuado para %s', (paleta) => {
      const html = buildDeckHtml(claseEjemplo, 'Materia', 'Tema', paleta);
      
      const bgMatch = html.match(/--deck-bg:\s*([^;]+);/);
      const fgMatch = html.match(/--deck-fg:\s*([^;]+);/);
      const mutedMatch = html.match(/--deck-muted:\s*([^;]+);/);
      const resaltarMatch = html.match(/--deck-resaltar:\s*([^;]+);/);
      const onAcentoMatch = html.match(/--deck-on-acento:\s*([^;]+);/);

      expect(bgMatch).not.toBeNull();
      expect(fgMatch).not.toBeNull();
      expect(mutedMatch).not.toBeNull();
      expect(resaltarMatch).not.toBeNull();
      expect(onAcentoMatch).not.toBeNull();

      const bg = bgMatch![1].trim();
      const fg = fgMatch![1].trim();
      const muted = mutedMatch![1].trim();
      const resaltar = resaltarMatch![1].trim();
      const onAcento = onAcentoMatch![1].trim();

      // Contraste fg vs bg: >= 4.5:1 (para 50+ idealmente >= 7:1)
      const contrastFg = getContrast(fg, bg);
      expect(contrastFg).toBeGreaterThanOrEqual(4.5);

      // Contraste muted vs bg: >= 4.5:1
      const contrastMuted = getContrast(muted, bg);
      expect(contrastMuted).toBeGreaterThanOrEqual(4.5);

      // Contraste onAcento vs resaltar (en badges): >= 4.5:1
      const contrastBadge = getContrast(onAcento, resaltar);
      expect(contrastBadge).toBeGreaterThanOrEqual(4.5);
    });
  });

  describe('Eliminación total de notas de orador en el deck', () => {
    it.each(paletas)('no renderiza notas de orador ni micrófono ni aside.notes para %s aunque vengan en el objeto', (paleta) => {
      const html = buildDeckHtml(claseEjemplo, 'Materia', 'Tema', paleta);
      expect(html).not.toContain('<aside class="notes">');
      expect(html).not.toContain('🎙️');
      expect(html).not.toContain('Nota secreta');
    });
  });

  describe('Eliminación de notas de orador en prompt de IA', () => {
    it('no menciona notasOrador ni en el SYSTEM prompt ni en el schema del prompt de IA', () => {
      const routePath = path.resolve(process.cwd(), 'app/api/ia/route.ts');
      const routeContent = fs.readFileSync(routePath, 'utf-8');
      expect(routeContent).not.toContain('notasOrador');
    });
  });
});
