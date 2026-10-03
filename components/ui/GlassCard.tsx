/**
 * components/ui/GlassCard.tsx — Panel con glassmorphism iOS 27 (fallback sólido gama baja).
 * El blur se habilita solo si el navegador lo soporta (CSS @supports en globals.css).
 */
import { ReactNode, HTMLAttributes } from 'react';

export default function GlassCard({ children, className = '', ...rest }: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return <div className={`glass ${className}`} {...rest}>{children}</div>;
}