import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { logout } from '@/app/actions';

interface AppHeaderProps {
  usuario?: {
    nombre: string;
    email?: string;
  } | null;
  activePath?: string;
}

/**
 * components/layout/AppHeader.tsx
 * Header Flotante Institucional Glassmorphism iOS 27
 * Logo oficial UTN FRD, selector de vistas y menú táctil para docentes 50+
 */
export default function AppHeader({ usuario, activePath = '/dashboard' }: AppHeaderProps) {
  return (
    <header role="banner" id="main-header" className="main-header glass-panel">
      <div className="header-container">
        <Link href={usuario ? "/dashboard" : "/login"} className="brand-logo-container">
          <Image
            src="/UTN.jpg"
            alt="Logo Universidad Tecnológica Nacional"
            width={44}
            height={44}
            className="brand-logo-img"
            priority
          />
          <div className="brand-text-group">
            <span className="brand-text">UTN Contenidos</span>
            <span className="brand-subtext">Facultad Regional Delta</span>
          </div>
        </Link>

        {usuario && (
          <nav role="navigation" aria-label="Navegación principal" className="main-nav">
            <ul>
              <li>
                <Link
                  href="/dashboard"
                  className={activePath === '/dashboard' ? 'active' : ''}
                >
                  Mis Materias
                </Link>
              </li>
              <li>
                <Link
                  href="/historial"
                  className={activePath === '/historial' ? 'active' : ''}
                >
                  Historial
                </Link>
              </li>
            </ul>
          </nav>
        )}

        {usuario ? (
          <div className="user-profile">
            <div className="user-profile-badge">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span className="user-name-display">{usuario.nombre}</span>
            </div>
            <form action={logout}>
              <button type="submit" className="btn-logout-header" title="Cerrar sesión institucional">
                Salir
              </button>
            </form>
          </div>
        ) : (
          <div className="header-badge-public">
            <span className="campus-badge">Campus Docente</span>
          </div>
        )}
      </div>
    </header>
  );
}
