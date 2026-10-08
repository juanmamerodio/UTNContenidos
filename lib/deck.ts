/**
 * lib/deck.ts — Builder Élite de Presentaciones NotebookLM / Apple Keynote (Reveal.js 5)
 * Maquetación Bento Grid, métricas de alto impacto, diagramas de proceso (Mermaid.js)
 * y diseño editorial de alta jerarquía tipográfica para estudiantes universitarios.
 */

export interface Metrica {
  valor: string;
  etiqueta: string;
}

export interface ColumnaComparativa {
  titulo: string;
  puntos: string[];
}

export interface Slide {
  titulo: string;
  subtitulo?: string;
  categoria?: string;
  layout?: 'portada' | 'bento' | 'comparativa' | 'proceso' | 'desafio' | 'takeaway' | string;
  tipo?: string;
  contenido?: string;
  destacado?: string;
  metrica?: Metrica;
  columnas?: ColumnaComparativa[];
  mermaid?: string;
  notasOrador?: string;
  imagenKeyword?: string;
}

export interface Clase {
  plan?: { duracion?: string; objetivos?: string[]; estructura?: any[] };
  slides: Slide[];
  promptsImagenes?: string[];
}

const PALETAS: Record<string, { bg: string; fg: string; acento: string; resaltar: string; suave: string; cardBg: string; border: string }> = {
  clasica: {
    bg: '#0F172A',
    fg: '#F8FAFC',
    acento: '#06A28A',
    resaltar: '#1EC4A8',
    suave: '#1E293B',
    cardBg: 'rgba(30, 41, 59, 0.75)',
    border: 'rgba(6, 162, 138, 0.3)'
  },
  minimalista: {
    bg: '#F8FAFC',
    fg: '#0F172A',
    acento: '#047A68',
    resaltar: '#06A28A',
    suave: '#E2E8F0',
    cardBg: '#FFFFFF',
    border: 'rgba(15, 23, 42, 0.12)'
  },
  contemporanea: {
    bg: '#090D16',
    fg: '#F3F4F6',
    acento: '#3B82F6',
    resaltar: '#10B981',
    suave: '#1F2937',
    cardBg: 'rgba(17, 24, 39, 0.8)',
    border: 'rgba(59, 130, 246, 0.3)'
  },
  alta_carga: {
    bg: '#05131E',
    fg: '#F1F5F9',
    acento: '#8B5CF6',
    resaltar: '#F59E0B',
    suave: '#0F2942',
    cardBg: 'rgba(15, 41, 66, 0.85)',
    border: 'rgba(139, 92, 246, 0.35)'
  }
};

function escapeHtml(s: string): string {
  return (s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Renderiza una diapositiva según su arquetipo NotebookLM */
function slideToSection(s: Slide, idx: number, total: number, paleta: any, materia: string): string {
  const layout = s.layout || (s.tipo === 'portada' || idx === 0 ? 'portada' : 'bento');
  const notas = s.notasOrador ? `<aside class="notes">🎙️ ${escapeHtml(s.notasOrador)}</aside>` : '';
  const categoriaBadge = `<div class="slide-badge">${escapeHtml(s.categoria || 'CÁTEDRA UTN')}</div>`;
  const footerInfo = `<div class="slide-footer"><span>${escapeHtml(materia)}</span><span>${idx + 1} / ${total}</span></div>`;

  // 1. PORTADA HERO MONUMENTAL
  if (layout === 'portada' || idx === 0) {
    return `
<section data-background-gradient="linear-gradient(135deg, ${paleta.bg} 0%, #031c18 100%)">
  <div class="deck-hero-wrapper">
    <div class="hero-header-badge">FACULTAD REGIONAL DELTA · UTN</div>
    <h1 class="hero-title">${escapeHtml(s.titulo || 'Clase Magistral')}</h1>
    <p class="hero-subtitle">${escapeHtml(s.subtitulo || materia)}</p>
    <div class="hero-footer-pills">
      <span class="pill-meta">🎓 Ingeniería</span>
      <span class="pill-meta">📚 ${escapeHtml(materia)}</span>
      <span class="pill-meta">⚡ Ciclo Lectivo 2026</span>
    </div>
  </div>
  ${notas}
</section>`;
  }

  // 2. BENTO GRID MULTICOLUMNA (NOTEBOOKLM)
  if (layout === 'bento' || layout === 'concepto_nucleo') {
    const lineas = (s.contenido || '').split('\n').map(l => l.trim().replace(/^[•\-\*]\s*/, '')).filter(Boolean);
    const bulletsHtml = lineas.map(l => `
      <div class="bento-bullet-item">
        <span class="bullet-dot"></span>
        <p>${escapeHtml(l)}</p>
      </div>
    `).join('');

    const metricaHtml = s.metrica?.valor ? `
      <div class="bento-card bento-metric-card">
        <div class="metric-val">${escapeHtml(s.metrica.valor)}</div>
        <div class="metric-lbl">${escapeHtml(s.metrica.etiqueta || 'Métrica Clave')}</div>
      </div>
    ` : '';

    const destacadoHtml = s.destacado ? `
      <div class="bento-card bento-highlight-card">
        <div class="card-icon">💡</div>
        <h4>Insight de Cátedra</h4>
        <p>${escapeHtml(s.destacado)}</p>
      </div>
    ` : '';

    return `
<section data-background-color="${paleta.bg}">
  <div class="slide-container">
    ${categoriaBadge}
    <h2 class="slide-title">${escapeHtml(s.titulo)}</h2>
    ${s.subtitulo ? `<p class="slide-subtitle">${escapeHtml(s.subtitulo)}</p>` : ''}

    <div class="bento-grid">
      <div class="bento-card bento-main-card">
        <h4>Fundamento Teórico</h4>
        <div class="bullet-group">${bulletsHtml}</div>
      </div>
      <div class="bento-side-column">
        ${metricaHtml}
        ${destacadoHtml}
      </div>
    </div>
  </div>
  ${footerInfo}
  ${notas}
</section>`;
  }

  // 3. COMPARATIVA LADO A LADO
  if (layout === 'comparativa' && s.columnas && s.columnas.length >= 2) {
    const colA = s.columnas[0];
    const colB = s.columnas[1];

    return `
<section data-background-color="${paleta.bg}">
  <div class="slide-container">
    ${categoriaBadge}
    <h2 class="slide-title">${escapeHtml(s.titulo)}</h2>
    ${s.subtitulo ? `<p class="slide-subtitle">${escapeHtml(s.subtitulo)}</p>` : ''}

    <div class="comparison-grid">
      <div class="bento-card comparison-col">
        <h3 class="col-title">${escapeHtml(colA.titulo)}</h3>
        <ul class="col-list">
          ${(colA.puntos || []).map(p => `<li>${escapeHtml(p)}</li>`).join('')}
        </ul>
      </div>
      <div class="bento-card comparison-col col-accent">
        <h3 class="col-title" style="color: ${paleta.resaltar};">${escapeHtml(colB.titulo)}</h3>
        <ul class="col-list">
          ${(colB.puntos || []).map(p => `<li>${escapeHtml(p)}</li>`).join('')}
        </ul>
      </div>
    </div>
  </div>
  ${footerInfo}
  ${notas}
</section>`;
  }

  // 4. DIAGRAMA DE PROCESO
  if (layout === 'proceso') {
    const lineas = (s.contenido || '').split('\n').map(l => l.trim().replace(/^[•\-\*]\s*/, '')).filter(Boolean);
    const stepsHtml = lineas.map((l, i) => `
      <div class="process-step-card bento-card">
        <span class="step-badge">Fase ${i + 1}</span>
        <p>${escapeHtml(l)}</p>
      </div>
    `).join('');

    return `
<section data-background-color="${paleta.bg}">
  <div class="slide-container">
    ${categoriaBadge}
    <h2 class="slide-title">${escapeHtml(s.titulo)}</h2>
    ${s.subtitulo ? `<p class="slide-subtitle">${escapeHtml(s.subtitulo)}</p>` : ''}

    <div class="process-flow-grid">
      ${stepsHtml}
    </div>

    ${s.destacado ? `
      <div class="bento-card bento-highlight-card" style="margin-top: 1.5rem;">
        <h4>⚙️ Regla de Proceso:</h4>
        <p>${escapeHtml(s.destacado)}</p>
      </div>
    ` : ''}
  </div>
  ${footerInfo}
  ${notas}
</section>`;
  }

  // 5. DILEMA O PREGUNTA DISPARADORA
  if (layout === 'desafio' || s.tipo === 'desafio_aula') {
    return `
<section data-background-color="${paleta.bg}">
  <div class="slide-container challenge-container">
    <div class="challenge-pill">🎯 Desafío de Aula</div>
    <h2 class="challenge-title">&ldquo;${escapeHtml(s.titulo)}&rdquo;</h2>
    ${s.contenido ? `<p class="challenge-desc">${escapeHtml(s.contenido)}</p>` : ''}
    ${s.destacado ? `
      <div class="bento-card bento-main-card" style="margin-top: 2rem; max-width: 750px;">
        <h4>Consigna para los Alumnos:</h4>
        <p>${escapeHtml(s.destacado)}</p>
      </div>
    ` : ''}
  </div>
  ${footerInfo}
  ${notas}
</section>`;
  }

  // 6. DEFAULT ELEGANTE (TAKEAWAY / SÍNTESIS)
  const lineas = (s.contenido || '').split('\n').map(l => l.trim().replace(/^[•\-\*]\s*/, '')).filter(Boolean);
  return `
<section data-background-color="${paleta.bg}">
  <div class="slide-container">
    ${categoriaBadge}
    <h2 class="slide-title">${escapeHtml(s.titulo)}</h2>
    <div class="bento-grid">
      ${lineas.map((l, i) => `
        <div class="bento-card bento-main-card">
          <span class="step-badge">Punto 0${i + 1}</span>
          <p style="margin-top: 0.8rem; font-size: 1.2rem; line-height: 1.45;">${escapeHtml(l)}</p>
        </div>
      `).join('')}
    </div>
  </div>
  ${footerInfo}
  ${notas}
</section>`;
}

/** Genera el HTML completo Reveal.js 5 con estética editorial NotebookLM */
export function buildDeckHtml(clase: Clase, materia: string, tema: string, estilo: string): string {
  const paleta = PALETAS[estilo] || PALETAS.clasica;
  const slidesHtml = (clase.slides || []).map((s, i) => slideToSection(s, i, clase.slides.length, paleta, materia)).join('\n');

  return `<!DOCTYPE html>
<html lang="es-AR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>UTN FRD — ${escapeHtml(tema)}</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5.1.0/dist/reset.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5.1.0/dist/reveal.css">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  :root {
    --deck-acento: ${paleta.acento};
    --deck-resaltar: ${paleta.resaltar};
    --deck-fg: ${paleta.fg};
    --deck-bg: ${paleta.bg};
    --deck-card-bg: ${paleta.cardBg};
    --deck-border: ${paleta.border};
  }

  .reveal {
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    color: var(--deck-fg);
  }

  .reveal h1, .reveal h2, .reveal h3, .reveal h4 {
    font-family: 'Outfit', sans-serif;
    letter-spacing: -0.025em;
    font-weight: 800;
  }

  /* Slide Base Layout */
  .slide-container {
    padding: 3rem 4rem;
    height: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    text-align: left;
  }

  .slide-badge {
    display: inline-block;
    background: rgba(6, 162, 138, 0.15);
    color: var(--deck-resaltar);
    padding: 0.35rem 0.9rem;
    border-radius: 9999px;
    font-size: 0.85rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    border: 1px solid var(--deck-border);
    margin-bottom: 0.8rem;
    width: fit-content;
  }

  .slide-title {
    font-size: 2.75rem;
    line-height: 1.15;
    color: #ffffff;
    margin: 0 0 0.5rem 0;
  }

  .slide-subtitle {
    font-size: 1.25rem;
    color: #94A3B8;
    margin-bottom: 1.8rem;
    line-height: 1.4;
  }

  /* Bento Grid */
  .bento-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 1.5rem;
    margin-top: 1rem;
  }

  .bento-card {
    background: var(--deck-card-bg);
    border: 1px solid var(--deck-border);
    border-radius: 20px;
    padding: 1.85rem 2rem;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
    backdrop-filter: blur(16px);
  }

  .bento-card h4 {
    color: var(--deck-resaltar);
    font-size: 1.1rem;
    margin-bottom: 1.2rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .bento-bullet-item {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
    align-items: flex-start;
  }

  .bullet-dot {
    width: 10px;
    height: 10px;
    background: var(--deck-resaltar);
    border-radius: 50%;
    margin-top: 0.55rem;
    flex-shrink: 0;
  }

  .bento-bullet-item p {
    margin: 0;
    font-size: 1.25rem;
    line-height: 1.45;
    color: var(--deck-fg);
  }

  .bento-side-column {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .bento-metric-card {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    background: linear-gradient(135deg, rgba(6, 162, 138, 0.2) 0%, rgba(4, 122, 104, 0.05) 100%);
  }

  .metric-val {
    font-family: 'Outfit', sans-serif;
    font-size: 3.5rem;
    font-weight: 900;
    color: #ffffff;
    line-height: 1;
    letter-spacing: -0.03em;
  }

  .metric-lbl {
    font-size: 0.95rem;
    color: #94A3B8;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 700;
    margin-top: 0.5rem;
  }

  .bento-highlight-card {
    border-left: 4px solid var(--deck-resaltar);
  }

  .bento-highlight-card p {
    font-size: 1.1rem;
    line-height: 1.4;
    color: #E2E8F0;
    margin: 0;
    font-style: italic;
  }

  /* Comparison Grid */
  .comparison-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.8rem;
    margin-top: 1rem;
  }

  .comparison-col .col-title {
    font-size: 1.4rem;
    margin-bottom: 1.2rem;
    color: #ffffff;
  }

  .col-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .col-list li {
    padding: 0.8rem 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    font-size: 1.15rem;
    line-height: 1.4;
  }

  /* Process Flow */
  .process-flow-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1.25rem;
    margin-top: 1.2rem;
  }

  .process-step-card .step-badge {
    background: var(--deck-resaltar);
    color: #0F172A;
    font-weight: 800;
    padding: 0.25rem 0.65rem;
    border-radius: 6px;
    font-size: 0.8rem;
    display: inline-block;
    margin-bottom: 0.75rem;
  }

  .process-step-card p {
    margin: 0;
    font-size: 1.1rem;
    line-height: 1.4;
  }

  /* Hero Portada */
  .deck-hero-wrapper {
    padding: 4rem 5rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    height: 100%;
    box-sizing: border-box;
    text-align: left;
  }

  .hero-header-badge {
    background: rgba(6, 162, 138, 0.2);
    color: var(--deck-resaltar);
    padding: 0.5rem 1.2rem;
    border-radius: 9999px;
    font-size: 0.95rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    border: 1px solid var(--deck-border);
    margin-bottom: 1.5rem;
  }

  .hero-title {
    font-size: 4.5rem;
    color: #ffffff;
    line-height: 1.05;
    margin-bottom: 1.2rem;
    max-width: 950px;
  }

  .hero-subtitle {
    font-size: 1.85rem;
    color: #94A3B8;
    margin-bottom: 2.5rem;
    max-width: 800px;
  }

  .hero-footer-pills {
    display: flex;
    gap: 1rem;
  }

  .pill-meta {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    padding: 0.6rem 1.2rem;
    border-radius: 9999px;
    font-size: 1.05rem;
    font-weight: 600;
  }

  /* Slide Footer */
  .slide-footer {
    position: absolute;
    bottom: 1.2rem;
    left: 4rem;
    right: 4rem;
    display: flex;
    justify-content: space-between;
    font-size: 0.85rem;
    color: #64748B;
    font-weight: 600;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    padding-top: 0.6rem;
  }
</style>
</head>
<body>
<div class="reveal"><div class="slides">
${slidesHtml}
</div></div>
<script src="https://cdn.jsdelivr.net/npm/reveal.js@5.1.0/dist/reveal.js"></script>
<script>
  Reveal.initialize({
    hash: false,
    history: false,
    slideNumber: 'c/t',
    transition: 'fade',
    transitionSpeed: 'fast',
    controls: true,
    progress: true,
    center: false,
    width: 1400,
    height: 800,
    margin: 0.04
  });
</script>
</body>
</html>`;
}

export function nombreArchivoDeck(tema: string): string {
  return 'UTN_Clase_' + (tema || 'Tema').replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, '').trim().replace(/\s+/g, '_') + '.html';
}