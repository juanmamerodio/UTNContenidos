/**
 * lib/deck.ts — Builder de presentaciones HTML (B3)
 * Convierte la clase generada por la IA en un documento HTML autocontenido
 * con Reveal.js (self-hosted en /public/reveal). El docente tiene control
 * total: el HTML es editable, imprimible a PDF y descargable.
 */

export interface Slide {
  titulo: string;
  subtitulo?: string;
  categoria?: string;
  tipo?: string;
  contenido?: string;
  notasOrador?: string;
  destacado?: string;
  imagenKeyword?: string;
}

export interface Clase {
  plan?: { duracion?: string; objetivos?: string[]; estructura?: any[] };
  slides: Slide[];
  promptsImagenes?: string[];
}

const PALETAS: Record<string, { bg: string; fg: string; acento: string; resaltar: string; suave: string }> = {
  clasica: { bg: '#FFFFFF', fg: '#1E293B', acento: '#0055A6', resaltar: '#06A28A', suave: '#EAF1F9' },
  minimalista: { bg: '#F8FAFC', fg: '#334155', acento: '#06A28A', resaltar: '#047A68', suave: '#F0F9F6' },
  contemporanea: { bg: '#FFFFFF', fg: '#1F2937', acento: '#2563EB', resaltar: '#F59E0B', suave: '#EFF6FF' },
  alta_carga: { bg: '#FFFDF8', fg: '#1E293B', acento: '#7C3AED', resaltar: '#EF4444', suave: '#F5F3FF' }
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function slideToSection(s: Slide, idx: number, total: number, paleta: any, materia: string): string {
  const esPortada = s.tipo === 'portada' || idx === 0;
  if (esPortada) {
    return `
<section data-background-color="${paleta.acento}">
  <div style="text-align:left; padding: 2.5rem 3rem;">
    <p style="color:${paleta.resaltar}; font-weight:700; letter-spacing:.12em; font-size:.9rem; text-transform:uppercase;">UNIVERSIDAD TECNOLÓGICA NACIONAL · FRD</p>
    <h1 style="color:#fff; font-size:3rem; line-height:1.15; margin:1rem 0;">${escapeHtml(s.titulo || 'Clase')}</h1>
    <p style="color:#C7D2FE; font-size:1.3rem;">${escapeHtml(s.subtitulo || materia)}</p>
  </div>
</section>`;
  }

  const lineas = (s.contenido || '').split('\n').map(l => l.trim()).filter(Boolean).slice(0, 6);
  const bullets = lineas.map(l =>
    `<li style="display:flex; gap:.9rem; margin:.55rem 0; font-size:1.25rem;">
       <span style="color:${paleta.resaltar}; font-weight:900;">●</span>
       <span>${escapeHtml(l.replace(/^[•\-\*]\s*/, ''))}</span>
     </li>`
  ).join('');

  const destacado = s.destacado
    ? `<div style="margin-top:1.5rem; background:${paleta.suave}; border-left:6px solid ${paleta.resaltar}; padding:1rem 1.3rem; border-radius:8px;">
         <p style="font-weight:700; color:${paleta.acento}; font-size:1.1rem;">💡 ${escapeHtml(s.destacado)}</p>
       </div>` : '';

  const notas = s.notasOrador ? `<aside class="notes">🎙️ ${escapeHtml(s.notasOrador)}</aside>` : '';

  return `
<section data-background-color="${paleta.bg}">
  <div style="text-align:left; padding:2rem 3rem;">
    <p style="color:${paleta.acento}; font-weight:700; letter-spacing:.1em; font-size:.8rem; text-transform:uppercase; margin-bottom:.4rem;">${escapeHtml(s.categoria || 'CLASE')}</p>
    <h2 style="color:${paleta.acento}; font-size:1.9rem; margin-bottom:1.2rem;">${escapeHtml(s.titulo || 'Tema')}</h2>
    <ul style="list-style:none; margin:0; padding:0;">${bullets}</ul>
    ${destacado}
  </div>
  <p style="position:absolute; bottom:.6rem; left:3rem; color:#94A3B8; font-size:.7rem;">${escapeHtml(materia)} · ${idx + 1}/${total}</p>
  ${notas}
</section>`;
}

/** Genera el HTML completo autocontenido del deck. */
export function buildDeckHtml(clase: Clase, materia: string, tema: string, estilo: string): string {
  const paleta = PALETAS[estilo] || PALETAS.clasica;
  const slides = (clase.slides || []).map((s, i) => slideToSection(s, i, clase.slides.length, paleta, materia)).join('\n');

  return `<!DOCTYPE html>
<html lang="es-AR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>UTN FRD — ${escapeHtml(tema)}</title>
<link rel="stylesheet" href="/reveal/reset.min.css">
<link rel="stylesheet" href="/reveal/reveal.min.css">
<style>
  .reveal { font-family: 'Segoe UI', Roboto, sans-serif; }
  .reveal h1, .reveal h2 { font-family: 'Segoe UI', Roboto, sans-serif; text-transform: none; }
  .reveal .slides section { text-align: left; }
  ::selection { background: ${paleta.resaltar}; color: #fff; }
</style>
</head>
<body>
<div class="reveal"><div class="slides">
${slides}
</div></div>
<script src="/reveal/reveal.min.js"></script>
<script>
  Reveal.initialize({ hash: true, slideNumber: 'c/t' });
</script>
</body>
</html>`;
}

/** Título del archivo de descarga (sanitizado). */
export function nombreArchivoDeck(tema: string): string {
  return 'UTN_Clase_' + tema.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, '').trim().replace(/\s+/g, '_') + '.html';
}