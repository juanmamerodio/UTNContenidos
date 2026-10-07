'use client';

import { useReducer, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { guardarPresentacion } from '@/app/datos';
import confetti from 'canvas-confetti';
import { ArrowLeft } from 'lucide-react';
import { faseInicial, faseReducer, pasoDeFase } from '@/lib/generador-fase';
import { crearParserSSE } from '@/lib/sse';
import StepperDidactico from '@/components/ui/StepperDidactico';
import FormularioConfiguracion, {
  configInicial,
  type Configuracion
} from '@/components/generador/FormularioConfiguracion';
import PantallaProcesando from '@/components/generador/PantallaProcesando';
import VisorResultado from '@/components/generador/VisorResultado';
import ModalEditarSlide from '@/components/generador/ModalEditarSlide';
import ModalReformular from '@/components/generador/ModalReformular';

interface Props {
  materiaId: string;
  materiaNombre: string;
  temaId: string;
  temaNombre: string;
}

function dispararConfetti() {
  try {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#06a28a', '#1ec4a8', '#5adcc4', '#047a68']
    });
  } catch {
    // Ignorar si no está soportado en el entorno
  }
}

export default function GeneradorClase({ materiaNombre, temaNombre, temaId }: Props) {
  const router = useRouter();
  const [config, setConfig] = useState<Configuracion>(configInicial);
  const [estado, dispatch] = useReducer(faseReducer<any>, faseInicial);
  const [slideEnEdicion, setSlideEnEdicion] = useState<number | null>(null);
  const [slideEnReformulacion, setSlideEnReformulacion] = useState<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const { fase, error, clase } = estado;

  async function generar() {
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    dispatch({ tipo: 'iniciar' });
    try {
      const r = await fetch('/api/ia?stream=1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: ctrl.signal,
        body: JSON.stringify({
          materia: materiaNombre,
          tema: temaNombre,
          configuracion: config
        })
      });

      let resultado: any = null;
      if (r.headers.get('content-type')?.includes('text/event-stream')) {
        const reader = r.body!.getReader();
        const decoder = new TextDecoder();
        const parser = crearParserSSE();
        const procesar = (eventos: ReturnType<typeof parser.push>) => {
          for (const ev of eventos) {
            if (ev.tipo === 'done') resultado = ev.clase;
            else if (ev.tipo === 'error') throw new Error(ev.error || 'Error al generar la clase');
            else if (ev.tipo === 'chunk') dispatch({ tipo: 'chunk', texto: ev.texto || '' });
            else if (ev.tipo === 'progreso') dispatch({ tipo: 'progreso', mensaje: ev.mensaje || '' });
          }
        };
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          procesar(parser.push(decoder.decode(value, { stream: true })));
        }
        procesar(parser.flush());
      } else {
        const json = await r.json();
        if (!json.success) throw new Error(json.error || 'Error al generar la clase');
        resultado = json;
      }

      if (!resultado) throw new Error('La generación terminó sin resultado.');
      dispatch({ tipo: 'exito', clase: resultado });
      
      const { id, error: errGuardar } = await guardarPresentacion(temaId, temaNombre, config, resultado);
      if (!errGuardar && id) {
        router.push(`/historial/${id}`);
      } else {
        dispararConfetti();
      }
    } catch (e) {
      if ((e as Error).name === 'AbortError') return; // ya se despachó "cancelar"
      dispatch({ tipo: 'fallo', error: (e as Error).message });
    }
  }

  function cancelar() {
    abortRef.current?.abort();
    dispatch({ tipo: 'cancelar' });
  }

  return (
    <div className="gen-wrap">
      <StepperDidactico pasoActual={pasoDeFase(fase)} />

      <nav className="gen-breadcrumb" aria-label="Ruta de navegación">
        <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <ArrowLeft size={16} />
          <span>Mis Materias</span>
        </Link>{' '}
        / <span>{materiaNombre}</span> / <strong>{temaNombre}</strong>
      </nav>

      {fase === 'config' && (
        <FormularioConfiguracion
          config={config}
          onChange={(c) => setConfig((prev) => ({ ...prev, ...c }))}
          onGenerar={generar}
          error={error}
        />
      )}

      {fase === 'procesando' && (
        <PantallaProcesando 
          onCancelar={cancelar} 
          streamText={estado.streamText} 
          progresoMsg={estado.progresoMsg} 
        />
      )}

      {fase === 'resultado' && clase && (
        <VisorResultado
          clase={clase}
          materiaNombre={materiaNombre}
          temaNombre={temaNombre}
          estilo={config.estilo}
          onEditarSlide={setSlideEnEdicion}
          onReformularSlide={setSlideEnReformulacion}
          onGenerarOtra={() => dispatch({ tipo: 'reiniciar' })}
        />
      )}

      {slideEnEdicion !== null && clase?.slides?.[slideEnEdicion] && (
        <ModalEditarSlide
          slide={clase.slides[slideEnEdicion]}
          slideIndex={slideEnEdicion}
          onGuardar={(slideModificada) => {
            const nuevasSlides = [...clase.slides];
            nuevasSlides[slideEnEdicion] = slideModificada;
            dispatch({ tipo: 'actualizar', clase: { ...clase, slides: nuevasSlides } });
            setSlideEnEdicion(null);
          }}
          onCerrar={() => setSlideEnEdicion(null)}
        />
      )}

      {slideEnReformulacion !== null && clase?.slides?.[slideEnReformulacion] && (
        <ModalReformular
          slide={clase.slides[slideEnReformulacion]}
          slideIndex={slideEnReformulacion}
          materiaNombre={materiaNombre}
          temaNombre={temaNombre}
          onSlideReformulada={(nuevaSlide) => {
            const nuevasSlides = [...clase.slides];
            nuevasSlides[slideEnReformulacion] = nuevaSlide;
            dispatch({ tipo: 'actualizar', clase: { ...clase, slides: nuevasSlides } });
            setSlideEnReformulacion(null);
          }}
          onCerrar={() => setSlideEnReformulacion(null)}
        />
      )}
    </div>
  );
}