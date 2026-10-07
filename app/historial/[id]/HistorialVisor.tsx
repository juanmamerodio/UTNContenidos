'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import VisorResultado from '@/components/generador/VisorResultado';
import ModalEditarSlide from '@/components/generador/ModalEditarSlide';
import ModalReformular from '@/components/generador/ModalReformular';
import { actualizarPresentacion } from '@/app/datos';
import MaterialButton from '@/components/ui/MaterialButton';

export default function HistorialVisor({ presentacion, id }: { presentacion: any; id: string }) {
  const router = useRouter();
  const [clase, setClase] = useState(presentacion.contenido);
  const [slideEnEdicion, setSlideEnEdicion] = useState<number | null>(null);
  const [slideEnReformulacion, setSlideEnReformulacion] = useState<number | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [hayCambios, setHayCambios] = useState(false);

  const materiaNombre = presentacion.configuracion?.materia || 'Materia';
  const temaNombre = presentacion.configuracion?.tema || 'Tema';
  const estilo = presentacion.configuracion?.estilo || 'UTN';

  async function guardarCambios() {
    setGuardando(true);
    await actualizarPresentacion(id, clase);
    setHayCambios(false);
    setGuardando(false);
    router.refresh();
  }

  return (
    <div className="gen-wrap">
      <nav className="gen-breadcrumb" aria-label="Ruta de navegación" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Link href="/historial" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <ArrowLeft size={16} />
            <span>Historial</span>
          </Link>{' '}
          / <span>{materiaNombre}</span> / <strong>{temaNombre}</strong>
        </div>
        {hayCambios && (
          <MaterialButton variante="primary" onClick={guardarCambios} disabled={guardando}>
            <Save size={18} />
            <span>{guardando ? 'Guardando...' : 'Guardar Cambios'}</span>
          </MaterialButton>
        )}
      </nav>

      <VisorResultado
        clase={clase}
        materiaNombre={materiaNombre}
        temaNombre={temaNombre}
        estilo={estilo}
        onEditarSlide={setSlideEnEdicion}
        onReformularSlide={setSlideEnReformulacion}
        onGenerarOtra={() => router.push('/dashboard')}
      />

      {slideEnEdicion !== null && clase?.slides?.[slideEnEdicion] && (
        <ModalEditarSlide
          slide={clase.slides[slideEnEdicion]}
          slideIndex={slideEnEdicion}
          onGuardar={(slideModificada) => {
            const nuevasSlides = [...clase.slides];
            nuevasSlides[slideEnEdicion] = slideModificada;
            setClase({ ...clase, slides: nuevasSlides });
            setHayCambios(true);
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
            setClase({ ...clase, slides: nuevasSlides });
            setHayCambios(true);
            setSlideEnReformulacion(null);
          }}
          onCerrar={() => setSlideEnReformulacion(null)}
        />
      )}
    </div>
  );
}
