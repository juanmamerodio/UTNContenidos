'use client';

import { useState } from 'react';

interface Slide {
  titulo: string;
  subtitulo?: string;
  categoria?: string;
  tipo?: string;
  contenido: string;
  notasOrador?: string;
  imagenKeyword?: string;
}

interface Plan {
  duracion?: string;
  objetivos?: string[];
  estructura?: Array<{ fase: string; duracion: string; actividad: string }>;
}

interface SeccionesPedagogicasProps {
  plan?: Plan;
  slides?: Slide[];
  promptsImagenes?: string[];
  onEditarSlide: (index: number) => void;
  onReformularSlide: (index: number) => void;
}

export default function SeccionesPedagogicas({
  plan,
  slides = [],
  promptsImagenes = [],
  onEditarSlide,
  onReformularSlide
}: SeccionesPedagogicasProps) {
  const [tabActiva, setTabActiva] = useState<'plan' | 'slides' | 'imagenes'>('slides');

  return (
    <div className="generator-content-grid">
      {/* Selector de pestañas pedagógicas táctiles */}
      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => setTabActiva('slides')}
          className={tabActiva === 'slides' ? 'btn-primary' : 'btn-secondary'}
          style={{ minHeight: '44px', padding: '0.5rem 1.2rem' }}
        >
          📑 Tarjetas de Diapositivas ({slides.length})
        </button>
        {plan && (
          <button
            type="button"
            onClick={() => setTabActiva('plan')}
            className={tabActiva === 'plan' ? 'btn-primary' : 'btn-secondary'}
            style={{ minHeight: '44px', padding: '0.5rem 1.2rem' }}
          >
            📋 Organización de Aula & Momentos
          </button>
        )}
        {promptsImagenes.length > 0 && (
          <button
            type="button"
            onClick={() => setTabActiva('imagenes')}
            className={tabActiva === 'imagenes' ? 'btn-primary' : 'btn-secondary'}
            style={{ minHeight: '44px', padding: '0.5rem 1.2rem' }}
          >
            🎨 Sugerencias Visuales & Pizarra ({promptsImagenes.length})
          </button>
        )}
      </div>

      {/* SECCIÓN SLIDES INDIVIDUALES CON ACCIÓN QUIRÚRGICA */}
      {tabActiva === 'slides' && (
        <section className="content-section glass-panel">
          <h2>Estructura de Diapositivas Sugerida</h2>
          <p className="section-desc">
            Revisá cada diapositiva en formato ficha. Podés retocar textos manualmente o pedirle a la IA que reformule una diapositiva en particular.
          </p>

          <div className="slides-grid">
            {slides.map((slide, index) => {
              const lineas = (slide.contenido || '').split('\n').filter((l) => l.trim());
              return (
                <article key={index} className="slide-card">
                  <div>
                    {slide.categoria && <span className="badge">{slide.categoria}</span>}
                    <h3 style={{ marginTop: '0.5rem' }}>
                      Diap. {index + 1}: {slide.titulo}
                    </h3>
                    {slide.subtitulo && (
                      <p style={{ color: 'var(--on-surface-2)', fontSize: '0.9rem', marginBottom: '0.6rem' }}>
                        {slide.subtitulo}
                      </p>
                    )}

                    <ul style={{ paddingLeft: '1.2rem', margin: '0.6rem 0', color: 'var(--on-surface)' }}>
                      {lineas.map((line, i) => (
                        <li key={i} style={{ marginBottom: '0.4rem', lineHeight: '1.45' }}>
                          {line.replace(/^[•\-\*]\s*/, '')}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="slide-actions">
                    <button
                      type="button"
                      onClick={() => onEditarSlide(index)}
                      className="btn-secondary"
                      style={{ fontSize: '0.85rem', padding: '0.45rem 0.9rem', minHeight: '40px' }}
                    >
                      ✏️ Editar texto
                    </button>
                    {slide.tipo !== 'portada' && (
                      <button
                        type="button"
                        onClick={() => onReformularSlide(index)}
                        className="btn-secondary"
                        style={{ fontSize: '0.85rem', padding: '0.45rem 0.9rem', minHeight: '40px' }}
                      >
                        🔄 Reformular con IA
                      </button>
                    )}
                  </div>

                  {slide.notasOrador && (
                    <div className="docente-notas">
                      <strong style={{ display: 'block', fontSize: '0.8rem', color: 'var(--utn-green-dark)', marginBottom: '3px' }}>
                        🎙️ NOTAS DE AULA (GUÍA DOCENTE):
                      </strong>
                      <p style={{ margin: 0 }}>{slide.notasOrador}</p>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* SECCIÓN PLAN DE AULA */}
      {tabActiva === 'plan' && plan && (
        <section className="content-section glass-panel">
          <h2>Organización y Cronograma de Clase</h2>
          <p className="section-desc">
            Distribución pedagógica para <strong>{plan.duracion || '2 horas cátedra'}</strong>.
          </p>

          {plan.objetivos && plan.objetivos.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--utn-green-dark)', marginBottom: '0.6rem' }}>
                Objetivos didácticos de la clase:
              </h3>
              <ul style={{ paddingLeft: '1.4rem', color: 'var(--on-surface-2)', lineHeight: '1.7' }}>
                {plan.objetivos.map((obj, i) => (
                  <li key={i}>{obj}</li>
                ))}
              </ul>
            </div>
          )}

          {plan.estructura && plan.estructura.length > 0 && (
            <table className="table-plan">
              <thead>
                <tr>
                  <th scope="col">Momento Didáctico</th>
                  <th scope="col">Tiempo Estimado</th>
                  <th scope="col">Dinámica en el Aula</th>
                </tr>
              </thead>
              <tbody>
                {plan.estructura.map((item, i) => (
                  <tr key={i}>
                    <td>
                      <strong>{item.fase}</strong>
                    </td>
                    <td>{item.duracion}</td>
                    <td>{item.actividad}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}

      {/* SECCIÓN ILUSTRACIONES Y PIZARRA */}
      {tabActiva === 'imagenes' && promptsImagenes.length > 0 && (
        <section className="content-section glass-panel">
          <h2>Sugerencias Visuales y Diagramas de Pizarra</h2>
          <p className="section-desc">
            Ideas y esquemas sugeridos para ilustrar los conceptos de la clase en pizarra o diapositivas.
          </p>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {promptsImagenes.map((prompt, i) => (
              <div
                key={i}
                style={{
                  background: 'var(--surface-0)',
                  padding: '1.1rem 1.4rem',
                  borderRadius: '12px',
                  border: '1px solid var(--border-glass-dark)'
                }}
              >
                <strong style={{ color: 'var(--utn-green-dark)', display: 'block', marginBottom: '0.4rem' }}>
                  Esquema {i + 1}:
                </strong>
                <p style={{ margin: 0, color: 'var(--on-surface-2)', fontStyle: 'italic' }}>
                  &ldquo;{prompt}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
