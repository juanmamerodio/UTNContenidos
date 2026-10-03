import React from 'react';

interface StepperProps {
  pasoActual: 1 | 2 | 3;
}

/**
 * components/ui/StepperDidactico.tsx
 * Stepper elástico y de alto contraste (WCAG AAA) para docentes 50+.
 * Guía clara en 3 pasos: Materia y Tema -> Revisión Didáctica -> Exportación.
 */
export default function StepperDidactico({ pasoActual }: StepperProps) {
  return (
    <div className="educational-guide-steps" aria-label="Progreso didáctico de creación de clase">
      <div className={`guide-step ${pasoActual === 1 ? 'active' : pasoActual > 1 ? 'completed' : ''}`}>
        <span className="step-number">{pasoActual > 1 ? '✓' : '1'}</span>
        <span>Elegí tu Materia y Tema</span>
      </div>
      <span className="step-divider" aria-hidden="true">→</span>
      <div className={`guide-step ${pasoActual === 2 ? 'active' : pasoActual > 2 ? 'completed' : ''}`}>
        <span className="step-number">{pasoActual > 2 ? '✓' : '2'}</span>
        <span>Revisá el Plan Pedagógico</span>
      </div>
      <span className="step-divider" aria-hidden="true">→</span>
      <div className={`guide-step ${pasoActual === 3 ? 'active' : ''}`}>
        <span className="step-number">3</span>
        <span>Exportá a Slides / PDF</span>
      </div>
    </div>
  );
}
