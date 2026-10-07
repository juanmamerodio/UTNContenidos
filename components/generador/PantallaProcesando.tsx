'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import MaterialButton from '@/components/ui/MaterialButton';
import Skeleton from '@/components/ui/Skeleton';

const MENSAJES = [
  'Buscando en tu bibliografía…',
  'Organizando los momentos de la clase…',
  'Armando las diapositivas…',
  'Redactando el plan de aula…',
  'Puliendo los últimos detalles…'
];

interface Props {
  onCancelar: () => void;
  /** Intervalo de rotación de mensajes en ms. */
  intervaloMs?: number;
}

/** Paso 2: mensajes humanos rotativos + skeleton. Nunca muestra el stream crudo. */
export default function PantallaProcesando({ onCancelar, intervaloMs = 4000 }: Props) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => Math.min(i + 1, MENSAJES.length - 1)), intervaloMs);
    return () => clearInterval(t);
  }, [intervaloMs]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="gen-config glass-panel gen-procesando"
    >
      <h1>Estamos preparando tu clase</h1>
      <p className="gen-progreso-msg" role="status" aria-live="polite">
        {MENSAJES[idx]}
      </p>
      <div className="gen-skeletons" aria-hidden="true">
        <Skeleton height="1.6rem" width="70%" />
        <Skeleton height="1rem" />
        <Skeleton height="1rem" width="90%" />
        <Skeleton height="10rem" radius="16px" />
      </div>
      <p style={{ color: 'var(--on-surface-2)' }}>Puede demorar hasta un minuto. No cierres esta pantalla.</p>
      <MaterialButton variante="secondary" onClick={onCancelar}>
        <span>Cancelar</span>
      </MaterialButton>
    </motion.section>
  );
}
