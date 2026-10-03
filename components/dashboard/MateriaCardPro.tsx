'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { agregarTema } from '@/app/datos';
import { GraduationCap, ArrowRight, Plus, X, BookOpen, Layers } from 'lucide-react';

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
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.25 } }}
      className="materia-card glass-panel"
      key={materia.id}
    >
      <div className="materia-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Layers size={13} />
            {materia.nivel}
          </span>
        </div>
        <h2>{materia.nombre}</h2>
        {materia.descripcion && <p className="materia-desc">{materia.descripcion}</p>}
      </div>

      <ul className="tema-list">
        {materia.temas.length === 0 ? (
          <li style={{ color: 'var(--on-surface-3)', fontStyle: 'italic' }}>
            No hay temas registrados en esta cátedra. Podés agregar uno con el botón inferior.
          </li>
        ) : (
          materia.temas.map((t, index) => (
            <motion.li
              key={t.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, duration: 0.2 }}
              whileHover={{ x: 4, transition: { duration: 0.15 } }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={16} color="var(--utn-green-primary)" />
                <span>{t.nombre}</span>
              </div>
              <Link
                href={`/generar?materia=${encodeURIComponent(materia.id)}&tema=${encodeURIComponent(
                  t.id
                )}&nombre=${encodeURIComponent(t.nombre)}`}
                className="btn-primary"
              >
                <span>Preparar Clase</span>
                <ArrowRight size={16} strokeWidth={2.5} />
              </Link>
            </motion.li>
          ))
        )}
      </ul>

      <div style={{ marginTop: '1.2rem' }}>
        <button
          type="button"
          onClick={() => setModalAbierto(true)}
          className="btn-secondary"
          style={{ fontSize: '0.88rem', padding: '0.5rem 1rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={16} />
          <span>Agregar tema a la materia</span>
        </button>
      </div>

      <AnimatePresence>
        {modalAbierto && (
          <dialog
            open
            style={{ display: 'block', position: 'fixed', inset: 0, zIndex: 200 }}
            aria-labelledby={`nuevo-tema-title-${materia.id}`}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="dialog-content glass-panel"
              style={{ background: '#ffffff' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h2 id={`nuevo-tema-title-${materia.id}`} style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Plus size={22} color="var(--utn-green-primary)" />
                  <span>Agregar tema a {materia.nombre}</span>
                </h2>
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                  aria-label="Cerrar"
                >
                  <X size={20} color="var(--on-surface-3)" />
                </button>
              </div>

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
            </motion.div>
          </dialog>
        )}
      </AnimatePresence>
    </motion.article>
  );
}
