'use client';

import React from 'react';
import { motion } from 'framer-motion';

/**
 * components/layout/AmbientGlow.tsx
 * Atmósfera lumínica 3D multicapa de UTNContenidos acelerada por Framer Motion.
 * Orbs volumétricas con física de fluidos, oscilación orgánica y desenfoque satinado.
 */
export default function AmbientGlow() {
  return (
    <div className="ambient-glow" aria-hidden="true">
      <motion.div
        className="orb orb-1"
        animate={{
          x: [0, 45, -25, 0],
          y: [0, -35, 40, 0],
          scale: [1, 1.12, 0.94, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="orb orb-2"
        animate={{
          x: [0, -50, 30, 0],
          y: [0, 45, -30, 0],
          scale: [1, 1.15, 0.9, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="orb orb-3"
        animate={{
          x: [0, 35, -45, 0],
          y: [0, -40, 25, 0],
          scale: [0.92, 1.18, 0.96, 0.92],
        }}
        transition={{
          duration: 16,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut',
        }}
      />
    </div>
  );
}
