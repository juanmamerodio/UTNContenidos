/**
 * components/ui/Skeleton.tsx — Loader esqueletal (gama baja amigable).
 * Reemplaza spinners: se siente más rápido y no consume animación de GPU.
 */
export default function Skeleton({ width = '100%', height = '1rem', radius = '8px' }: { width?: string; height?: string; radius?: string }) {
  return <div className="skeleton" style={{ width, height, borderRadius: radius }} aria-hidden="true" />;
}