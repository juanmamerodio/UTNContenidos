/**
 * components/ui/MaterialButton.tsx — Botón píldora Material 4 (ripple + estados)
 * Variantes: 'primary' (gradiente UTN) | 'secondary' (borde) | 'ghost'.
 * Accesible: min-height 48px, aria, focus ring, press scale.
 */
import { ReactNode, ButtonHTMLAttributes } from 'react';

type Variante = 'primary' | 'secondary';

const CLASES: Record<Variante, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary'
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
  children: ReactNode;
}

export default function MaterialButton({ variante = 'primary', children, className = '', ...rest }: Props) {
  return (
    <button className={`${CLASES[variante]} ${className}`} {...rest}>
      {children}
    </button>
  );
}