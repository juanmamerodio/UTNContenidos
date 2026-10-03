'use client';

import { ReactNode, ButtonHTMLAttributes } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

type Variante = 'primary' | 'secondary';

const CLASES: Record<Variante, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary'
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
  children: ReactNode;
}

/**
 * components/ui/MaterialButton.tsx
 * Botón píldora Material 4 con física elástica de resorte háptico Framer Motion.
 * Escala sutil al presionar, elevación flotante al hover y accesibilidad para docentes 50+.
 */
export default function MaterialButton({
  variante = 'primary',
  children,
  className = '',
  ...rest
}: Props) {
  return (
    <motion.button
      whileHover={{ y: -3, transition: { type: 'spring', stiffness: 450, damping: 25 } }}
      whileTap={{ scale: 0.96, transition: { type: 'spring', stiffness: 600, damping: 20 } }}
      className={`${CLASES[variante]} ${className}`}
      {...(rest as any)}
    >
      {children}
    </motion.button>
  );
}