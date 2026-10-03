'use client';

import { useState } from 'react';
import Link from 'next/link';
import { agregarTema } from '@/app/datos';

interface Tema {
  id: string;
  nombre: string;
  descripcion?: string;
  url_apunte?: string;
}

interface Materia {
  id: string;
  nombre: string;
  nivel: string;
  descripcion?: string;
  temas: Tema[];
}

export default function MateriaCardPro({ materia }: { materia: Materia }) {
  const [modalAbierto, setModalAbierto] = useState(false);

  return (
    <article className="materia-card glass-panel" key={materia.id}>
      <div className="materia-head">
        <span className="badge">{materia.nivel}</span>
        <h2>{materia.nombre}</h2>
        {materia.descripcion && <p className="materia-desc">{materia.descripcion}</p>}
      </div>

      <ul className="tema-list">
        {materia.temas.length === 0 ? (
          <li style={{ color: 'var(--on-surface-3)', fontStyle: 'italic' }}>
            No hay temas registrados en esta cátedra. Podés agregar uno con el botón inferior.
          </li>
        ) : (
          materia.temas.map((t) => (
            <li key={t.id}>
              <span>{t.nombre}</span>
              <Link
                href={`/generar?materia=${encodeURIComponent(materia.id)}&tema=${encodeURIComponent(
                  t.id
                )}&nombre=${encodeURIComponent(t.nombre)}`}
                className="btn-primary"
              >
                <span>Preparar Clase</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </Link>
            </li>
          ))
        )}
      </ul>

      <div style={{ marginTop: '1.2rem' }}>
        <button
          type="button"
          onClick={() => setModalAbierto(true)}
          className="btn-secondary"
          style={{ fontSize: '0.88rem', padding: '0.5rem 1rem' }}
        >
          ＋ Agregar tema a la materia
        </button>
      </div>

      {modalAbierto && (
        <dialog
          open
          style={{ display: 'block', position: 'fixed', inset: 0, zIndex: 200 }}
          aria-labelledby={`nuevo-tema-title-${materia.id}`}
        >
          <div className="dialog-content glass-panel" style={{ background: '#ffffff' }}>
            <h2 id={`nuevo-tema-title-${materia.id}`} style={{ marginBottom: '6px' }}>
              ＋ Agregar tema a {materia.nombre}
            </h2>
            <p style={{ marginBottom: '16px', color: 'var(--on-surface-2)', fontSize: '0.9rem' }}>
              Cargá un tema nuevo del programa oficial. Si tenés el apunte de cátedra, pegá el link.
            </p>

            <form
              action={async (formData: FormData) => {
                await agregarTema(formData);
                setModalAbierto(false);
              }}
            >
              <input type="hidden" name="materiaId" value={materia.id} />
              <div className="form-group">
                <label htmlFor={`nuevo-nombre-${materia.id}`}>Nombre del tema *</label>
                <input
                  id={`nuevo-nombre-${materia.id}`}
                  type="text"
                  name="nombre"
                  placeholder="Ej: Integrales impropias y aplicaciones"
                  required
                  maxLength={200}
                />
              </div>

              <div className="form-group">
                <label htmlFor={`nuevo-desc-${materia.id}`}>Descripción pedagógica (opcional)</label>
                <input
                  id={`nuevo-desc-${materia.id}`}
                  type="text"
                  name="descripcion"
                  placeholder="Qué conceptos clave se abordan"
                  maxLength={500}
                />
              </div>

              <div className="form-group">
                <label htmlFor={`nuevo-url-${materia.id}`}>Enlace al apunte de cátedra (opcional)</label>
                <input
                  id={`nuevo-url-${materia.id}`}
                  type="url"
                  name="urlApunte"
                  placeholder="https://drive.google.com/..."
                  maxLength={500}
                />
              </div>

              <div className="dialog-actions">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Guardar Tema
                </button>
              </div>
            </form>
          </div>
        </dialog>
      )}
    </article>
  );
}
