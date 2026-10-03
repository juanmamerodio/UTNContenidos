'use client';

import { useState } from 'react';

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
      // Prompt correctivo quirúrgico para regenerar solo una diapositiva puntual
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

      // Si la API devolvió un slide dentro de slides[] o como objeto
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
    <dialog open style={{ display: 'block', position: 'fixed', inset: 0, zIndex: 250 }}>
      <div className="dialog-content glass-panel" style={{ background: '#ffffff', maxWidth: '640px' }}>
        <h2 style={{ marginBottom: '6px', color: 'var(--utn-green-dark)' }}>
          🔄 Reformular Diapositiva {slideIndex + 1} con IA
        </h2>
        <p style={{ marginBottom: '18px', color: 'var(--on-surface-2)', fontSize: '0.9rem' }}>
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

        {error && <p className="login-error">{error}</p>}

        <div className="dialog-actions">
          <button type="button" onClick={onCerrar} className="btn-secondary" disabled={cargando}>
            Cancelar
          </button>
          <button
            type="button"
            onClick={ejecutarReformulacion}
            className="btn-primary"
            disabled={cargando || !instruccion.trim()}
          >
            {cargando ? 'Reformulando...' : '🔄 Reformular Diapositiva'}
          </button>
        </div>
      </div>
    </dialog>
  );
}
