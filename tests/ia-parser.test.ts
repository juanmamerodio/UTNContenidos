import { describe, it, expect } from 'vitest';
import { parsearJSONIA } from '@/lib/ia-parser';

describe('parsearJSONIA — Reparador y parser tolerante de JSON de IA', () => {
  it('parsea JSON perfectamente válido', () => {
    const raw = JSON.stringify({
      plan: { duracion: '90m' },
      slides: [{ titulo: 'Intro', layout: 'portada', tipo: 'portada' }]
    });
    const parsed = parsearJSONIA(raw);
    expect(parsed.slides).toHaveLength(1);
    expect(parsed.slides[0].titulo).toBe('Intro');
  });

  it('soporta markdown fences (```json ... ```) con texto alrededor', () => {
    const raw = `Aquí está la clase solicitada:
\`\`\`json
{
  "plan": { "duracion": "90m" },
  "slides": [{ "titulo": "Intro", "layout": "portada", "tipo": "portada" }]
}
\`\`\`
Espero que te sirva.`;
    const parsed = parsearJSONIA(raw);
    expect(parsed.slides[0].titulo).toBe('Intro');
  });

  it('repara comas finales (trailing commas) en objetos y arrays (causa del error reportado)', () => {
    // Este caso reproduce exactamente: Expected double-quoted property name in JSON at position ...
    const raw = `{
      "plan": { "duracion": "90m", },
      "slides": [
        {
          "titulo": "Tema Principal",
          "layout": "bento",
          "tipo": "concepto_nucleo",
          "columnas": [
            { "titulo": "Columna 1", "puntos": ["Punto A", "Punto B",], },
          ],
        },
      ],
    }`;
    const parsed = parsearJSONIA(raw);
    expect(parsed.slides[0].titulo).toBe('Tema Principal');
    expect(parsed.slides[0].columnas[0].puntos).toEqual(['Punto A', 'Punto B']);
  });

  it('repara propiedades con comillas simples o sin comillas', () => {
    const raw = `{
      'plan': { duracion: "90m" },
      slides: [
        { 'titulo': 'Intro', layout: "portada", tipo: "portada" }
      ]
    }`;
    const parsed = parsearJSONIA(raw);
    expect(parsed.slides[0].titulo).toBe('Intro');
    expect(parsed.slides[0].layout).toBe('portada');
  });

  it('soporta saltos de línea literales sin escapar dentro de strings', () => {
    const raw = `{\n  "plan": { "duracion": "90m" },\n  "slides": [\n    {\n      "titulo": "Intro",\n      "layout": "portada",\n      "tipo": "portada",\n      "contenido": "• Punto 1\n• Punto 2"\n    }\n  ]\n}`;
    const parsed = parsearJSONIA(raw);
    expect(parsed.slides[0].contenido).toContain('Punto 1');
  });

  it('repara JSON truncado cerrando llaves y corchetes abiertos', () => {
    const raw = `{
      "plan": { "duracion": "90m" },
      "slides": [
        { "titulo": "Slide 1", "layout": "portada", "tipo": "portada" }
    `;
    const parsed = parsearJSONIA(raw);
    expect(parsed.slides).toHaveLength(1);
    expect(parsed.slides[0].titulo).toBe('Slide 1');
  });

  it('elimina comentarios JavaScript // y /* */', () => {
    const raw = `{
      // Comentario de cabecera
      "plan": { "duracion": "90m" }, /* comentario inline */
      "slides": []
    }`;
    const parsed = parsearJSONIA(raw);
    expect(parsed.plan.duracion).toBe('90m');
  });

  it('lanza un error amigable en español si el contenido es completamente inválido', () => {
    expect(() => parsearJSONIA('Esto no es un JSON en absoluto')).toThrowError(
      /No se pudo estructurar la respuesta de la IA/
    );
  });
});
