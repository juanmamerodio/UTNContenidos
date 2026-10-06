'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Sparkles, Download, Printer, ArrowLeft, Sliders, Clock, Layers, HelpCircle, CheckCircle2 } from 'lucide-react';
import { buildDeckHtml, nombreArchivoDeck } from '@/lib/deck';
import GlassCard from '@/components/ui/GlassCard';
import MaterialButton from '@/components/ui/MaterialButton';
import StepperDidactico from '@/components/ui/StepperDidactico';
import SeccionesPedagogicas from '@/components/generador/SeccionesPedagogicas';
import ModalEditarSlide from '@/components/generador/ModalEditarSlide';
import ModalReformular from '@/components/generador/ModalReformular';

interface Props {
  materiaId: string;
  materiaNombre: string;
  temaId: string;
  temaNombre: string;
}

export default function GeneradorClase({ materiaId, materiaNombre, temaId, temaNombre }: Props) {
  // Configuración didáctica iOS 27
  const [numSlides, setNumSlides] = useState(7);
  const [duracion, setDuracion] = useState('80-90');
  const [estilo, setEstilo] = useState('');
  const [nivel, setNivel] = useState('');
  const [ejemplos, setEjemplos] = useState('');
  const [imagenes, setImagenes] = useState('');
  const [instrucciones, setInstrucciones] = useState('');
  const [momentos, setMomentos] = useState<string[]>([
    'hook',
    'concepto_nucleo',
    'caso_aplicado',
    'esquema_proceso',
    'desafio_aula'
  ]);

  // Estados de generación y datos
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [clase, setClase] = useState<any>(null);
  const [progreso, setProgreso] = useState('');

  // Modales interactivos quirúrgicos
  const [slideEnEdicion, setSlideEnEdicion] = useState<number | null>(null);
  const [slideEnReformulacion, setSlideEnReformulacion] = useState<number | null>(null);

  function dispararConfetti() {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#06a28a', '#1ec4a8', '#5adcc4', '#047a68'],
      });
    } catch {
      // Ignorar si no está soportado en entorno específico
    }
  }

  function toggleMomento(id: string) {
    setMomentos((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  }

  async function generar() {
    setCargando(true);
    setError('');
    setProgreso('Conectando con la IA pedagógica...');
    try {
      const r = await fetch('/api/ia?stream=1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          materia: materiaNombre,
          tema: temaNombre,
          configuracion: {
            numSlides,
            duracion,
            estilo,
            nivel,
            ejemplos,
            imagenes,
            momentos,
            instrucciones
          }
        })
      });

      if (r.headers.get('content-type')?.includes('text/event-stream')) {
        const reader = r.body!.getReader();
        const decoder = new TextDecoder();
        let acumulado = '';
        setProgreso('');

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });

          for (const linea of chunk.split('\n')) {
            if (!linea.startsWith('data: ')) continue;
            const dato = JSON.parse(linea.slice(6));
            if (dato.tipo === 'progreso') {
              setProgreso(dato.mensaje || '');
            } else if (dato.tipo === 'chunk') {
              acumulado += dato.texto || '';
              setProgreso(acumulado.slice(-400));
            } else if (dato.tipo === 'done') {
              setClase(dato.clase);
              setProgreso('');
              dispararConfetti();
            } else if (dato.tipo === 'error') {
              throw new Error(dato.error || 'Error al generar la clase');
            }
          }
        }
      } else {
        const json = await r.json();
        if (!json.success) throw new Error(json.error || 'Error al generar la clase');
        setClase(json);
        setProgreso('');
        dispararConfetti();
      }
    } catch (e) {
      setError((e as Error).message);
      setProgreso('');
    } finally {
      setCargando(false);
    }
  }

  const deckHtml = useMemo(() => {
    if (!clase) return '';
    try {
      return buildDeckHtml(clase, materiaNombre, temaNombre, estilo);
    } catch {
      return '';
    }
  }, [clase, materiaNombre, temaNombre, estilo]);

  function descargarHtml() {
    if (!deckHtml) return;
    const blob = new Blob([deckHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombreArchivoDeck(temaNombre);
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="gen-wrap">
      {/* Stepper Activo en Fase 2 o 3 */}
      <StepperDidactico pasoActual={clase ? 3 : 2} />

      <nav className="gen-breadcrumb" aria-label="Ruta de navegación">
        <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <ArrowLeft size={16} />
          <span>Mis Materias</span>
        </Link>{' '}
        / <span>{materiaNombre}</span> / <strong>{temaNombre}</strong>
      </nav>

      {/* CONFIGURADOR iOS 27 ELEVADO */}
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

        <div className="ios27-seccion">
          <div className="ios27-label">Parámetros de Presentación</div>
          <div className="gen-grid">
            <motion.label whileHover={{ scale: 1.01 }} className="gen-pill">
              Diapositivas <b>{numSlides}</b>
              <input
                type="range"
                min={5}
                max={20}
                value={numSlides}
                onChange={(e) => setNumSlides(Number(e.target.value))}
              />
            </motion.label>

            <motion.label whileHover={{ scale: 1.01 }} className="gen-pill">
              Duración estimada
              <select value={duracion} onChange={(e) => setDuracion(e.target.value)}>
                <option value="80-90">80–90 min (2 hs cátedra)</option>
                <option value="40">40 min</option>
                <option value="60">60 min</option>
                <option value="120">120 min</option>
                <option value="180">Bloque triple (3 hs)</option>
              </select>
            </motion.label>

            <motion.label whileHover={{ scale: 1.01 }} className="gen-pill">
              Estilo visual
              <select value={estilo} onChange={(e) => setEstilo(e.target.value)}>
                <option value="">Clásica UTN (Esmeralda)</option>
                <option value="minimalista">Minimalista Satinado</option>
                <option value="contemporanea">Contemporánea Oscura</option>
                <option value="alta_carga">Alta Carga Técnica</option>
              </select>
            </motion.label>

            <motion.label whileHover={{ scale: 1.01 }} className="gen-pill">
              Nivel de audiencia
              <select value={nivel} onChange={(e) => setNivel(e.target.value)}>
                <option value="">Intermedio (Nivel Cátedra)</option>
                <option value="intro">Introductorio / 1er año</option>
                <option value="avanzado">Avanzado / Últimos años</option>
                <option value="mixto">Teoría + Debate Práctico</option>
              </select>
            </motion.label>

            <motion.label whileHover={{ scale: 1.01 }} className="gen-pill">
              Ejemplos didácticos
              <select value={ejemplos} onChange={(e) => setEjemplos(e.target.value)}>
                <option value="">Equilibrados (Cotidiano + Industria)</option>
                <option value="cotidianos">Cotidianos y visuales</option>
                <option value="industria">Industria Regional (Campana/Zárate)</option>
                <option value="ninguno">Sin ejemplos adicionales</option>
              </select>
            </motion.label>

            <motion.label whileHover={{ scale: 1.01 }} className="gen-pill">
              Recursos visuales
              <select value={imagenes} onChange={(e) => setImagenes(e.target.value)}>
                <option value="">Fotos y diagramas conceptuales</option>
                <option value="diagramas">Solo esquemas y diagramas</option>
                <option value="ilustraciones">Ilustraciones didácticas</option>
                <option value="ninguna">Solo tipografía y estructura</option>
              </select>
            </motion.label>
          </div>
        </div>

        <div className="ios27-seccion">
          <div className="ios27-label">Momentos Pedagógicos a Incluir</div>
          <div className="momentos-chips">
            {[
              { id: 'hook', label: 'Gancho Inicial' },
              { id: 'concepto_nucleo', label: 'Concepto Núcleo' },
              { id: 'caso_aplicado', label: 'Caso Aplicado' },
              { id: 'esquema_proceso', label: 'Esquema de Proceso' },
              { id: 'desafio_aula', label: 'Desafío en el Aula' }
            ].map((m) => (
              <motion.label
                key={m.id}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`chip ${momentos.includes(m.id) ? 'active' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={momentos.includes(m.id)}
                  onChange={() => toggleMomento(m.id)}
                />
                <span>{m.label}</span>
              </motion.label>
            ))}
          </div>
        </div>

        <div className="ios27-seccion">
          <div className="ios27-label">Orientaciones Docentes Libres</div>
          <textarea
            value={instrucciones}
            onChange={(e) => setInstrucciones(e.target.value)}
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
        </div>

        <MaterialButton
          variante="primary"
          className="gen-generar"
          onClick={generar}
          disabled={cargando}
        >
          {cargando ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={20} className="animate-spin" />
              <span>Conectando con el motor pedagógico...</span>
            </span>
          ) : (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={20} />
              <span>Generar Clase Completa</span>
            </span>
          )}
        </MaterialButton>

        {progreso && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="gen-progreso"
            aria-live="polite"
          >
            <div className="spinner-wrapper" style={{ width: '40px', height: '40px', marginBottom: '10px' }}>
              <svg className="spinner" viewBox="0 0 50 50">
                <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="4.5" />
              </svg>
            </div>
            <span>{progreso}</span>
          </motion.div>
        )}

        {error && <p className="login-error" role="alert">{error}</p>}
      </motion.section>

      {/* RESULTADO Y VISTA DE ENTREGA DOBLE (PRESENTACIÓN + SECCIONES PEDAGÓGICAS) */}
      <AnimatePresence>
        {clase && (
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{ marginTop: '2rem' }}
          >
            <GlassCard className="gen-resultado glass-panel">
              <div className="gen-actions">
                <div>
                  <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={22} color="var(--success)" />
                    <span>Tu presentación Reveal.js está lista</span>
                  </h2>
                  <p style={{ color: 'var(--on-surface-2)', fontSize: '0.9rem' }}>
                    Podés proyectarla de inmediato o descargarla para su uso sin conexión.
                  </p>
                </div>
                <div className="gen-botones">
                  <MaterialButton variante="primary" onClick={descargarHtml}>
                    <Download size={18} />
                    <span>Descargar Reveal.js (HTML)</span>
                  </MaterialButton>
                  <MaterialButton variante="secondary" onClick={() => window.print()}>
                    <Printer size={18} />
                    <span>Imprimir / PDF</span>
                  </MaterialButton>
                </div>
              </div>

              {deckHtml && (
                <iframe
                  className="gen-frame"
                  title="Vista previa interactiva de la presentación Reveal.js"
                  srcDoc={deckHtml}
                />
              )}
            </GlassCard>

            {/* 4 SECCIONES PEDAGÓGICAS (ENFOQUES, PLAN DE AULA, DIAPOSITIVAS Y PIZARRA) */}
            <SeccionesPedagogicas
              plan={clase.plan}
              slides={clase.slides}
              promptsImagenes={clase.promptsImagenes}
              onEditarSlide={(idx) => setSlideEnEdicion(idx)}
              onReformularSlide={(idx) => setSlideEnReformulacion(idx)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL DE EDICIÓN QUIRÚRGICA DE SLIDE */}
      {slideEnEdicion !== null && clase?.slides?.[slideEnEdicion] && (
        <ModalEditarSlide
          slide={clase.slides[slideEnEdicion]}
          slideIndex={slideEnEdicion}
          onGuardar={(slideModificada) => {
            const nuevasSlides = [...clase.slides];
            nuevasSlides[slideEnEdicion] = slideModificada;
            setClase({ ...clase, slides: nuevasSlides });
            setSlideEnEdicion(null);
          }}
          onCerrar={() => setSlideEnEdicion(null)}
        />
      )}

      {/* MODAL DE REFORMULACIÓN CON IA */}
      {slideEnReformulacion !== null && clase?.slides?.[slideEnReformulacion] && (
        <ModalReformular
          slide={clase.slides[slideEnReformulacion]}
          slideIndex={slideEnReformulacion}
          materiaNombre={materiaNombre}
          temaNombre={temaNombre}
          onSlideReformulada={(nuevaSlide) => {
            const nuevasSlides = [...clase.slides];
            nuevasSlides[slideEnReformulacion] = nuevaSlide;
            setClase({ ...clase, slides: nuevasSlides });
            setSlideEnReformulacion(null);
          }}
          onCerrar={() => setSlideEnReformulacion(null)}
        />
      )}
    </div>
  );
}