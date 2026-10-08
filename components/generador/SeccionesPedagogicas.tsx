'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 25, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 350, damping: 28 }
  }
};

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
      <div className="pedagogicas-tabs">
        <button
          type="button"
          onClick={() => setTabActiva('slides')}
          className={`${tabActiva === 'slides' ? 'btn-primary' : 'btn-secondary'} btn-tab`}
        >
          📑 Tarjetas de Diapositivas ({slides.length})
        </button>
        {plan && (
          <button
            type="button"
            onClick={() => setTabActiva('plan')}
            className={`${tabActiva === 'plan' ? 'btn-primary' : 'btn-secondary'} btn-tab`}
          >
            📋 Organización de Aula & Momentos
          </button>
        )}
        {promptsImagenes.length > 0 && (
          <button
            type="button"
            onClick={() => setTabActiva('imagenes')}
            className={`${tabActiva === 'imagenes' ? 'btn-primary' : 'btn-secondary'} btn-tab`}
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

          <motion.div
            className="slides-grid"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {slides.map((slide, index) => {
              const lineas = (slide.contenido || '').split('\n').filter((l) => l.trim());
              return (
                <motion.article
                  key={index}
                  className="slide-card"
                  variants={cardVariants}
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                >
                  <div>
                    {slide.categoria && <span className="badge">{slide.categoria}</span>}
                    <h3 className="slide-card-title">
                      Diap. {index + 1}: {slide.titulo}
                    </h3>
                    {slide.subtitulo && (
                      <p className="slide-card-subtitle">
                        {slide.subtitulo}
                      </p>
                    )}

                    <ul className="slide-card-list">
                      {lineas.map((line, i) => (
                        <li key={i}>
                          {line.replace(/^[•\-\*]\s*/, '')}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="slide-actions">
                    <button
                      type="button"
                      onClick={() => onEditarSlide(index)}
                      className="btn-secondary slide-action-btn"
                    >
                      ✏️ Editar texto
                    </button>
                    {slide.tipo !== 'portada' && (
                      <button
                        type="button"
                        onClick={() => onReformularSlide(index)}
                        className="btn-secondary slide-action-btn"
                      >
                        🔄 Reformular con IA
                      </button>
                    )}
                  </div>

                  {slide.notasOrador && (
                    <div className="docente-notas">
                      <strong className="docente-notas-label">
                        🎙️ NOTAS DE AULA (GUÍA DOCENTE):
                      </strong>
                      <p className="docente-notas-text">{slide.notasOrador}</p>
                    </div>
                  )}
                </motion.article>
              );
            })}
          </motion.div>
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
            <div className="plan-objetivos-wrap">
              <h3 className="plan-objetivos-title">
                Objetivos didácticos de la clase:
              </h3>
              <ul className="plan-objetivos-list">
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
          <div className="imagenes-sugerencias-grid">
            {promptsImagenes.map((prompt, i) => (
              <div key={i} className="imagen-sugerencia-card">
                <strong className="imagen-sugerencia-label">
                  Esquema {i + 1}:
                </strong>
                <p className="imagen-sugerencia-prompt">
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
