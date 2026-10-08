'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Edit3 } from 'lucide-react';

interface Slide {
  titulo: string;
  subtitulo?: string;
  contenido: string;
  notasOrador?: string;
}

interface ModalEditarSlideProps {
  slide: Slide;
  slideIndex: number;
  onGuardar: (slideActualizada: Slide) => void;
  onCerrar: () => void;
}

export default function ModalEditarSlide({
  slide,
  slideIndex,
  onGuardar,
  onCerrar
}: ModalEditarSlideProps) {
  const [titulo, setTitulo] = useState(slide.titulo || '');
  const [subtitulo, setSubtitulo] = useState(slide.subtitulo || '');
  const [contenido, setContenido] = useState(slide.contenido || '');
  const [notasOrador, setNotasOrador] = useState(slide.notasOrador || '');

  return (
    <AnimatePresence>
      <motion.div
        className="bottom-sheet-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`modal-edit-title-${slideIndex}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onCerrar();
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
            <h2 id={`modal-edit-title-${slideIndex}`}>
              <Edit3 size={20} className="inline-icon" />
              <span>Editar Diapositiva {slideIndex + 1}</span>
            </h2>
            <button
              type="button"
              onClick={onCerrar}
              className="bottom-sheet-close-btn"
              aria-label="Cerrar ventana de edición"
            >
              <X size={20} />
            </button>
          </div>

          <div className="bottom-sheet-body">
            <p className="dialog-desc">
              Cambiá los textos a mano. Los cambios se reflejarán inmediatamente en la presentación y en las exportaciones.
            </p>

            <div className="form-group">
              <label htmlFor="modal-edit-titulo">Título</label>
              <input
                id="modal-edit-titulo"
                type="text"
                value={titulo}
                maxLength={140}
                onChange={(e) => setTitulo(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="modal-edit-subtitulo">Subtítulo (opcional)</label>
              <input
                id="modal-edit-subtitulo"
                type="text"
                value={subtitulo}
                maxLength={200}
                onChange={(e) => setSubtitulo(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="modal-edit-contenido">Contenido (un punto por línea)</label>
              <textarea
                id="modal-edit-contenido"
                rows={5}
                value={contenido}
                onChange={(e) => setContenido(e.target.value)}
                className="apuntes-textarea"
              />
            </div>

            <div className="form-group">
              <label htmlFor="modal-edit-notas">Notas del orador (guía docente)</label>
              <textarea
                id="modal-edit-notas"
                rows={3}
                value={notasOrador}
                onChange={(e) => setNotasOrador(e.target.value)}
                className="apuntes-textarea"
              />
            </div>
          </div>

          <div className="bottom-sheet-footer">
            <button type="button" onClick={onCerrar} className="btn-secondary">
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => onGuardar({ ...slide, titulo, subtitulo, contenido, notasOrador })}
              className="btn-primary"
            >
              Guardar Cambios
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
