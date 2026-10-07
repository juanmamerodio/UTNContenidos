'use client';

import { motion } from 'framer-motion';
import { Sparkles, Sliders } from 'lucide-react';
import MaterialButton from '@/components/ui/MaterialButton';

export interface Configuracion {
  numSlides: number;
  duracion: string;
  estilo: string;
  nivel: string;
  ejemplos: string;
  imagenes: string;
  instrucciones: string;
  momentos: string[];
}

export const configInicial: Configuracion = {
  numSlides: 7,
  duracion: '80-90',
  estilo: '',
  nivel: '',
  ejemplos: '',
  imagenes: '',
  instrucciones: '',
  momentos: ['hook', 'concepto_nucleo', 'caso_aplicado', 'esquema_proceso', 'desafio_aula']
};

const MOMENTOS = [
  { id: 'hook', label: 'Gancho Inicial' },
  { id: 'concepto_nucleo', label: 'Concepto Núcleo' },
  { id: 'caso_aplicado', label: 'Caso Aplicado' },
  { id: 'esquema_proceso', label: 'Esquema de Proceso' },
  { id: 'desafio_aula', label: 'Desafío en el Aula' }
];

interface Props {
  config: Configuracion;
  onChange: (cambios: Partial<Configuracion>) => void;
  onGenerar: () => void;
  error: string;
}

/** Paso 1: 3 campos principales + opciones avanzadas plegables. */
export default function FormularioConfiguracion({ config, onChange, onGenerar, error }: Props) {
  const { numSlides, duracion, estilo, nivel, ejemplos, imagenes, instrucciones, momentos } = config;

  function toggleMomento(id: string) {
    onChange({
      momentos: momentos.includes(id) ? momentos.filter((m) => m !== id) : [...momentos, id]
    });
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="gen-config glass-panel"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
        <Sliders size={24} color="var(--utn-green-primary)" />
        <h1>Personalizá tu clase universitaria</h1>
      </div>
      <p>Todo es opcional: si no modificás nada, se aplica el formato pedagógico estándar de la UTN.</p>

      {error && (
        <p className="login-error" role="alert">
          {error} Tus datos se conservaron: podés volver a intentarlo.
        </p>
      )}

      <div className="ios27-seccion">
        <div className="gen-grid">
          <label className="gen-pill">
            Duración estimada
            <select value={duracion} onChange={(e) => onChange({ duracion: e.target.value })}>
              <option value="80-90">80–90 min (2 hs cátedra)</option>
              <option value="40">40 min</option>
              <option value="60">60 min</option>
              <option value="120">120 min</option>
              <option value="180">Bloque triple (3 hs)</option>
            </select>
          </label>

          <label className="gen-pill">
            Estilo visual
            <select value={estilo} onChange={(e) => onChange({ estilo: e.target.value })}>
              <option value="">Clásica UTN (Esmeralda)</option>
              <option value="minimalista">Minimalista Satinado</option>
              <option value="contemporanea">Contemporánea Oscura</option>
              <option value="alta_carga">Alta Carga Técnica</option>
            </select>
          </label>
        </div>
      </div>

      <div className="ios27-seccion">
        <div className="ios27-label">Momentos Pedagógicos a Incluir</div>
        <div className="momentos-chips">
          {MOMENTOS.map((m) => (
            <label key={m.id} className={`chip ${momentos.includes(m.id) ? 'active' : ''}`}>
              <input
                type="checkbox"
                checked={momentos.includes(m.id)}
                onChange={() => toggleMomento(m.id)}
              />
              <span>{m.label}</span>
            </label>
          ))}
        </div>
      </div>

      <details className="gen-avanzadas">
        <summary>Opciones avanzadas</summary>
        <div className="gen-grid">
          <label className="gen-pill">
            Diapositivas <b>{numSlides}</b>
            <input
              type="range"
              min={5}
              max={20}
              value={numSlides}
              onChange={(e) => onChange({ numSlides: Number(e.target.value) })}
            />
          </label>

          <label className="gen-pill">
            Nivel de audiencia
            <select value={nivel} onChange={(e) => onChange({ nivel: e.target.value })}>
              <option value="">Intermedio (Nivel Cátedra)</option>
              <option value="intro">Introductorio / 1er año</option>
              <option value="avanzado">Avanzado / Últimos años</option>
              <option value="mixto">Teoría + Debate Práctico</option>
            </select>
          </label>

          <label className="gen-pill">
            Ejemplos didácticos
            <select value={ejemplos} onChange={(e) => onChange({ ejemplos: e.target.value })}>
              <option value="">Equilibrados (Cotidiano + Industria)</option>
              <option value="cotidianos">Cotidianos y visuales</option>
              <option value="industria">Industria Regional (Campana/Zárate)</option>
              <option value="ninguno">Sin ejemplos adicionales</option>
            </select>
          </label>

          <label className="gen-pill">
            Recursos visuales
            <select value={imagenes} onChange={(e) => onChange({ imagenes: e.target.value })}>
              <option value="">Fotos y diagramas conceptuales</option>
              <option value="diagramas">Solo esquemas y diagramas</option>
              <option value="ilustraciones">Ilustraciones didácticas</option>
              <option value="ninguna">Solo tipografía y estructura</option>
            </select>
          </label>
        </div>

        <div className="ios27-label" style={{ marginTop: '1rem' }}>Orientaciones Docentes Libres</div>
        <textarea
          value={instrucciones}
          onChange={(e) => onChange({ instrucciones: e.target.value })}
          placeholder="Ej: Dar especial énfasis en la seguridad industrial; incluir una pregunta disparadora para debate con los alumnos..."
          rows={2}
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            borderRadius: '12px',
            border: '1.5px solid var(--border-glass-dark)',
            fontFamily: 'inherit',
            fontSize: '0.95rem'
          }}
        />
      </details>

      <MaterialButton variante="primary" className="gen-generar" onClick={onGenerar}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={20} />
          <span>Generar Clase Completa</span>
        </span>
      </MaterialButton>
    </motion.section>
  );
}
