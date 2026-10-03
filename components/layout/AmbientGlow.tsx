import React from 'react';

/**
 * components/layout/AmbientGlow.tsx
 * Atmósfera lumínica 3D multicapa de UTNContenidos
 * Traslada fielmente la estética Alpha de orbs esmeralda (#06a28a)
 * con desenfoque 120px volumétrico e interactividad satinada.
 */
export default function AmbientGlow() {
  return (
    <div className="ambient-glow" aria-hidden="true">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
    </div>
  );
}
