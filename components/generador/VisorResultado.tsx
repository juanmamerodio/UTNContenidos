'use client';

import { useMemo, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Printer, CheckCircle2, RefreshCw, MonitorPlay } from 'lucide-react';
import { buildDeckHtml, nombreArchivoDeck } from '@/lib/deck';
import GlassCard from '@/components/ui/GlassCard';
import MaterialButton from '@/components/ui/MaterialButton';
import SeccionesPedagogicas from '@/components/generador/SeccionesPedagogicas';

interface Props {
  presentacionId?: string;
  clase: any;
  materiaNombre: string;
  temaNombre: string;
  estilo: string;
  onEditarSlide: (idx: number) => void;
  onReformularSlide: (idx: number) => void;
  onGenerarOtra: () => void;
}

/** Paso 3: vista previa, descargas, secciones pedagógicas y "Generar otra versión". */
export default function VisorResultado({
  presentacionId,
  clase,
  materiaNombre,
  temaNombre,
  estilo,
  onEditarSlide,
  onReformularSlide,
  onGenerarOtra
}: Props) {
  const deckHtml = useMemo(() => {
    try {
      return buildDeckHtml(clase, materiaNombre, temaNombre, estilo);
    } catch {
      return '';
    }
  }, [clase, materiaNombre, temaNombre, estilo]);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.key === 'ArrowRight') {
        iframeRef.current?.contentWindow?.postMessage({ tipo: 'SIGUIENTE_SLIDE' }, '*');
      } else if (e.key === 'ArrowLeft') {
        iframeRef.current?.contentWindow?.postMessage({ tipo: 'ANTERIOR_SLIDE' }, '*');
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  function openHtmlWindow(html: string) {
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    if (!win || win.closed || typeof win.closed === 'undefined') {
      const popup = window.open('', '_blank');
      if (popup) {
        popup.document.open();
        popup.document.write(html);
        popup.document.close();
      }
    }
  }

  function proyectar() {
    if (presentacionId) {
      window.open(`/api/presentacion/${presentacionId}`, '_blank');
      return;
    }
    if (!deckHtml) return;
    openHtmlWindow(deckHtml);
  }

  function imprimirPdf() {
    if (presentacionId) {
      window.open(`/api/presentacion/${presentacionId}?print-pdf`, '_blank');
      return;
    }
    try {
      const printDeckHtml = buildDeckHtml(clase, materiaNombre, temaNombre, estilo, { printPdf: true });
      openHtmlWindow(printDeckHtml);
    } catch {
      if (deckHtml) openHtmlWindow(deckHtml);
    }
  }

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
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <GlassCard className="gen-resultado glass-panel">
        <div className="gen-actions">
          <div>
            <h2 className="visor-resultado-title">
              <CheckCircle2 size={22} color="var(--success)" />
              <span>Tu presentación Reveal.js está lista</span>
            </h2>
            <p className="visor-resultado-desc">
              Podés proyectarla de inmediato o descargarla para su uso sin conexión.
            </p>
          </div>
          <div className="gen-botones">
            <MaterialButton variante="primary" onClick={proyectar}>
              <MonitorPlay size={18} />
              <span>Proyectar</span>
            </MaterialButton>
            <MaterialButton variante="secondary" onClick={descargarHtml}>
              <Download size={18} />
              <span>Descargar HTML</span>
            </MaterialButton>
            <MaterialButton variante="secondary" onClick={imprimirPdf}>
              <Printer size={18} />
              <span>Imprimir / PDF</span>
            </MaterialButton>
            <MaterialButton variante="secondary" onClick={onGenerarOtra}>
              <RefreshCw size={18} />
              <span>Generar otra versión</span>
            </MaterialButton>
          </div>
        </div>

        {deckHtml && (
          <iframe
            ref={iframeRef}
            className="gen-frame"
            title="Vista previa interactiva de la presentación Reveal.js"
            srcDoc={deckHtml}
          />
        )}
      </GlassCard>

      <SeccionesPedagogicas
        plan={clase.plan}
        slides={clase.slides}
        promptsImagenes={clase.promptsImagenes}
        onEditarSlide={onEditarSlide}
        onReformularSlide={onReformularSlide}
      />
    </motion.div>
  );
}
