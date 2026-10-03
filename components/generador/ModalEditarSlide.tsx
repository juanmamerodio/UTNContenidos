'use client';

import { useState } from 'react';

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
    <dialog open style={{ display: 'block', position: 'fixed', inset: 0, zIndex: 250 }}>
      <div className="dialog-content glass-panel" style={{ background: '#ffffff', maxWidth: '680px' }}>
        <h2 style={{ marginBottom: '6px', color: 'var(--utn-green-dark)' }}>
          ✏️ Editar Diapositiva {slideIndex + 1}
        </h2>
        <p style={{ marginBottom: '18px', color: 'var(--on-surface-2)', fontSize: '0.9rem' }}>
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
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              border: '1.5px solid var(--border-glass-dark)',
              fontFamily: 'inherit',
              fontSize: '0.95rem'
            }}
          />
        </div>

        <div className="form-group">
          <label htmlFor="modal-edit-notas">Notas del orador (guía docente)</label>
          <textarea
            id="modal-edit-notas"
            rows={3}
            value={notasOrador}
            onChange={(e) => setNotasOrador(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              border: '1.5px solid var(--border-glass-dark)',
              fontFamily: 'inherit',
              fontSize: '0.95rem'
            }}
          />
        </div>

        <div className="dialog-actions">
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
      </div>
    </dialog>
  );
}
