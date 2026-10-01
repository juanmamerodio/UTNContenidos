'use client';

import { useMemo, useState } from 'react';
import { buildDeckHtml, nombreArchivoDeck } from '@/lib/deck';

interface Props {
  materiaId: string;
  materiaNombre: string;
  temaId: string;
  temaNombre: string;
}

export default function GeneradorClase({ materiaId, materiaNombre, temaId, temaNombre }: Props) {
  const [numSlides, setNumSlides] = useState(7);
  const [estilo, setEstilo] = useState('');
  const [nivel, setNivel] = useState('');
  const [ejemplos, setEjemplos] = useState('');
  const [instrucciones, setInstrucciones] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [clase, setClase] = useState<any>(null);
  const [progreso, setProgreso] = useState('');

  async function generar() {
    setCargando(true);
    setError('');
    setProgreso('Conectando con la IA...');
    try {
      const r = await fetch('/api/ia?stream=1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          materia: materiaNombre,
          tema: temaNombre,
          configuracion: { numSlides, estilo, nivel, ejemplos, instrucciones }
        })
      });

      // B4-4: streaming SSE — el texto llega por partes y se muestra en vivo
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
              setProgreso(acumulado.slice(-400)); // muestra el final del texto generado
            } else if (dato.tipo === 'done') {
              setClase(dato.clase);
              setProgreso('');
            } else if (dato.tipo === 'error') {
              throw new Error(dato.error || 'Error al generar');
            }
          }
        }
      } else {
        const json = await r.json();
        if (!json.success) throw new Error(json.error || 'Error al generar');
        setClase(json);
        setProgreso('');
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
    try { return buildDeckHtml(clase, materiaNombre, temaNombre, estilo); }
    catch { return ''; }
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
      <nav className="gen-breadcrumb">
        <a href="/dashboard">← Mis Materias</a> / {materiaNombre} / <strong>{temaNombre}</strong>
      </nav>

      <section className="gen-config">
        <h1>Personalizá tu clase</h1>
        <p>Todo es opcional: si no tocás nada, sale con el formato predeterminado de la UTN.</p>

        <div className="gen-grid">
          <label className="gen-pill">
            Diapositivas <b>{numSlides}</b>
            <input type="range" min={5} max={20} value={numSlides} onChange={(e) => setNumSlides(Number(e.target.value))} />
          </label>
          <label className="gen-pill">
            Estilo
            <select value={estilo} onChange={(e) => setEstilo(e.target.value)}>
              <option value="">Clásica UTN</option>
              <option value="minimalista">Minimalista</option>
              <option value="contemporanea">Contemporánea</option>
              <option value="alta_carga">Alta carga</option>
            </select>
          </label>
          <label className="gen-pill">
            Nivel
            <select value={nivel} onChange={(e) => setNivel(e.target.value)}>
              <option value="">Intermedio</option>
              <option value="intro">Introductorio</option>
              <option value="avanzado">Avanzado</option>
              <option value="mixto">Teoría + debate</option>
            </select>
          </label>
          <label className="gen-pill">
            Ejemplos
            <select value={ejemplos} onChange={(e) => setEjemplos(e.target.value)}>
              <option value="">Ambos</option>
              <option value="cotidianos">Cotidianos</option>
              <option value="industria">Industria regional</option>
              <option value="ninguno">Sin ejemplos</option>
            </select>
          </label>
          <label className="gen-pill gen-full">
            Instrucciones libres (opcional)
            <textarea value={instrucciones} onChange={(e) => setInstrucciones(e.target.value)} placeholder="Ej: Quiero slides cargadas de información, con ejemplos cotidianos..." rows={2} />
          </label>
        </div>

        <button className="btn-primary gen-generar" onClick={generar} disabled={cargando}>
          {cargando ? 'Generando con IA...' : '⚡ Generar Clase'}
        </button>
        {progreso && <p className="gen-progreso" aria-live="polite">{progreso}</p>}
        {error && <p className="login-error">{error}</p>}
      </section>

      {clase && (
        <section className="gen-resultado">
          <div className="gen-actions">
            <h2>Tu presentación está lista</h2>
            <div className="gen-botones">
              <button className="btn-primary" onClick={descargarHtml}>⬇ Descargar HTML</button>
              <button className="btn-secondary" onClick={() => window.print()}>🖨 PDF</button>
            </div>
          </div>
          {deckHtml && (
            <iframe className="gen-frame" title="Vista previa de la presentación" srcDoc={deckHtml} />
          )}
        </section>
      )}
    </div>
  );
}