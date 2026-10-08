'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RefreshCw, Loader2 } from 'lucide-react';

interface Slide {
  titulo: string;
  subtitulo?: string;
  categoria?: string;
  tipo?: string;
  contenido: string;
  notasOrador?: string;
}

interface ModalReformularProps {
  slide: Slide;
  slideIndex: number;
  materiaNombre: string;
  temaNombre: string;
  onSlideReformulada: (nuevaSlide: Slide) => void;
  onCerrar: () => void;
}

export default function ModalReformular({
  slide,
  slideIndex,
  materiaNombre,
  temaNombre,
  onSlideReformulada,
  onCerrar
}: ModalReformularProps) {
  const [instruccion, setInstruccion] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  async function ejecutarReformulacion() {
    if (!instruccion.trim()) return;
    setCargando(true);
    setError('');

    try {
      const prompt = `
Materia: "${materiaNombre}"
Tema: "${temaNombre}"
Diapositiva actual (Número ${slideIndex + 1}):
- Título: ${slide.titulo}
- Subtítulo: ${slide.subtitulo || ''}
- Contenido: ${slide.contenido}
- Tipo: ${slide.tipo || 'contenido'}

Instrucción de reformulación solicitada por el docente:
"${instruccion}"

Devolvé ÚNICAMENTE un objeto JSON válido con la diapositiva corregida:
{
  "titulo": "...",
  "subtitulo": "...",
  "categoria": "${slide.categoria || 'Concepto'}",
  "tipo": "${slide.tipo || 'concepto_nucleo'}",
  "contenido": "• punto 1\\n• punto 2",
  "notasOrador": "..."
}
`;

      const r = await fetch('/api/ia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          materia: materiaNombre,
          tema: temaNombre,
          configuracion: {
            numSlides: 1,
            instrucciones: prompt
          }
        })
      });

      const json = await r.json();
      if (!json.success) throw new Error(json.error || 'Error al reformular');

      const slideNueva = (json.slides && json.slides[0]) ? json.slides[0] : json.slide || json;
      if (slideNueva && slideNueva.titulo) {
        onSlideReformulada(slideNueva);
      } else {
        throw new Error('Formato de diapositiva no reconocido por el asistente.');
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        className="bottom-sheet-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`modal-reformular-title-${slideIndex}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => {
          if (!cargando && e.target === e.currentTarget) onCerrar();
        }}
      >
        <motion.div
          className="bottom-sheet-container glass-panel"
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
        >
          <div className="bottom-sheet-handle" aria-hidden="true" />

          <div className="bottom-sheet-header">
            <h2 id={`modal-reformular-title-${slideIndex}`}>
              <RefreshCw size={20} className="inline-icon" />
              <span>Reformular Diapositiva {slideIndex + 1} con IA</span>
            </h2>
            <button
              type="button"
              onClick={onCerrar}
              className="bottom-sheet-close-btn"
              disabled={cargando}
              aria-label="Cerrar modal"
            >
              <X size={20} />
            </button>
          </div>

          <div className="bottom-sheet-body">
            <p className="dialog-desc">
              Indicá qué querés cambiar de esta diapositiva puntual. El resto de la clase permanece intacto.
            </p>

            <div className="form-group">
              <label htmlFor="modal-reformular-text">Indicaciones para la IA</label>
              <textarea
                id="modal-reformular-text"
                rows={4}
                value={instruccion}
                onChange={(e) => setInstruccion(e.target.value)}
                placeholder="Ej: Hacela más concisa, cambialo por un ejemplo de la industria regional de Campana/Zárate, simplificá el lenguaje técnico..."
                className="apuntes-textarea"
                disabled={cargando}
              />
            </div>

            {error && (
              <p className="login-error" role="alert">
                {error}
              </p>
            )}
          </div>

          <div className="bottom-sheet-footer">
            <button type="button" onClick={onCerrar} className="btn-secondary" disabled={cargando}>
              Cancelar
            </button>
            <button
              type="button"
              onClick={ejecutarReformulacion}
              className="btn-primary"
              disabled={cargando || !instruccion.trim()}
            >
              {cargando ? (
                <>
                  <Loader2 size={18} className="spin" />
                  <span>Reformulando...</span>
                </>
              ) : (
                <>
                  <RefreshCw size={18} />
                  <span>Reformular Diapositiva</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
