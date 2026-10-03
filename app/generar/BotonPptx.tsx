'use client';

/**
 * BotonPptx.tsx — Botón de exportación a PowerPoint (.pptx).
 * Solicita al servidor Node generar el archivo para no incluir PptxGenJS en el bundle cliente.
 */
import { useState } from 'react';
import MaterialButton from '@/components/ui/MaterialButton';
import type { Clase } from '@/lib/deck';

export default function BotonPptx({ clase, materia, tema, estilo }: { clase: Clase; materia: string; tema: string; estilo: string }) {
  const [cargando, setCargando] = useState(false);

  async function exportar() {
    setCargando(true);
    try {
      const respuesta = await fetch('/api/pptx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clase, materia, tema, estilo })
      });
      if (!respuesta.ok) {
        const error = await respuesta.json().catch(() => null);
        throw new Error(error?.error || 'No se pudo generar el PowerPoint.');
      }

      const blob = await respuesta.blob();
      const url = URL.createObjectURL(blob);
      const enlace = document.createElement('a');
      const disposition = respuesta.headers.get('content-disposition');
      enlace.href = url;
      enlace.download = disposition?.match(/filename="([^"]+)"/)?.[1] || 'UTN_Clase.pptx';
      enlace.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('No se pudo generar el PowerPoint: ' + (e as Error).message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <MaterialButton variante="primary" onClick={exportar} disabled={cargando}>
      {cargando ? 'Generando...' : '⬇ PowerPoint'}
    </MaterialButton>
  );
}