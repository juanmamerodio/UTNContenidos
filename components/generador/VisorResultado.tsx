'use client';

import { useMemo } from 'react';
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
            {presentacionId && (
              <MaterialButton variante="primary" onClick={() => window.open(`/api/presentacion/${presentacionId}`, '_blank')}>
                <MonitorPlay size={18} />
                <span>Proyectar</span>
              </MaterialButton>
            )}
            <MaterialButton variante={presentacionId ? "secondary" : "primary"} onClick={descargarHtml}>
              <Download size={18} />
              <span>Descargar HTML</span>
            </MaterialButton>
            <MaterialButton variante="secondary" onClick={() => presentacionId ? window.open(`/api/presentacion/${presentacionId}?print-pdf`, '_blank') : window.print()}>
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
