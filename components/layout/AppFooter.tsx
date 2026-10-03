import React from 'react';
import Image from 'next/image';

/**
 * components/layout/AppFooter.tsx
 * Footer Institucional Glassmorphism UTN FRD
 * Información de contacto de la Facultad Regional Delta, enlaces universitarios y soporte.
 */
export default function AppFooter() {
  return (
    <footer role="contentinfo" id="main-footer" className="main-footer glass-panel">
      <div className="footer-container">
        <div className="footer-column">
          <div className="footer-brand-title">
            <Image
              src="/UTN.jpg"
              alt="Logo Universidad Tecnológica Nacional"
              width={48}
              height={48}
              className="footer-logo-img"
            />
            <div>
              <h3>Universidad Tecnológica Nacional</h3>
              <p className="footer-faculty-name">Facultad Regional Delta</p>
            </div>
          </div>
          <address>
            San Martín 1171, B2804 Campana<br />
            Provincia de Buenos Aires, Argentina<br />
            Tel: +54 3489 420400
          </address>
        </div>

        <div className="footer-column">
          <h3>Enlaces Institucionales</h3>
          <ul>
            <li>
              <a href="https://www.frd.utn.edu.ar/" target="_blank" rel="noopener noreferrer">
                Sitio Web Oficial FRD ↗
              </a>
            </li>
            <li>
              <a href="https://sysacad.frd.utn.edu.ar/" target="_blank" rel="noopener noreferrer">
                Sysacad Docente ↗
              </a>
            </li>
            <li>
              <a href="https://cv.frd.utn.edu.ar/" target="_blank" rel="noopener noreferrer">
                Campus Virtual Moodle ↗
              </a>
            </li>
          </ul>
        </div>

        <div className="footer-column">
          <h3>Soporte Técnico Docente</h3>
          <p>¿Tenés alguna consulta técnica o pedagógica sobre la herramienta?</p>
          <a href="mailto:sistemas@frd.utn.edu.ar" className="footer-support-email">
            sistemas@frd.utn.edu.ar
          </a>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2026 UTN Facultad Regional Delta. Diseñado especialmente para nuestros equipos docentes.</p>
      </div>
    </footer>
  );
}
