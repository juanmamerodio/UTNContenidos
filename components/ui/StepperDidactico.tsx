'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, ChevronRight } from 'lucide-react';

interface StepperProps {
  pasoActual: 1 | 2 | 3;
}

/**
 * components/ui/StepperDidactico.tsx
 * Stepper animado con física elástica de resorte háptico Framer Motion para docentes 50+.
 * Guía clara en 3 pasos sincronizados con la fase del wizard: Configurar -> Generando -> Lista.
 */
export default function StepperDidactico({ pasoActual }: StepperProps) {
  const pasos = [
    { num: 1, label: 'Configurar' },
    { num: 2, label: 'Generando' },
    { num: 3, label: 'Lista' },
  ];

  return (
    <nav className="educational-guide-steps" aria-label="Progreso didáctico de creación de clase">
      {pasos.map((p, idx) => {
        const isActive = pasoActual === p.num;
        const isCompleted = pasoActual > p.num;

        return (
          <React.Fragment key={p.num}>
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -2, transition: { duration: 0.15 } }}
              className={`guide-step ${isActive ? 'active' : isCompleted ? 'completed' : ''}`}
            >
              <span className="step-number">
                {isCompleted ? <Check size={14} strokeWidth={3} /> : p.num}
              </span>
              <span>{p.label}</span>
            </motion.div>

            {idx < pasos.length - 1 && (
              <ChevronRight
                size={18}
                className="step-divider"
                color={pasoActual > p.num ? 'var(--utn-green-primary)' : 'var(--on-surface-3)'}
                aria-hidden="true"
              />
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
