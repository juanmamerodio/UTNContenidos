'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { User, LogOut, BookOpen, History } from 'lucide-react';
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
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      role="banner"
      id="main-header"
      className="main-header glass-panel"
    >
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
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <BookOpen size={16} />
                  <span>Mis Materias</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/historial"
                  className={activePath === '/historial' ? 'active' : ''}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <History size={16} />
                  <span>Historial</span>
                </Link>
              </li>
            </ul>
          </nav>
        )}

        {usuario ? (
          <div className="user-profile">
            <div className="user-profile-badge">
              <User size={16} strokeWidth={2.5} />
              <span className="user-name-display">{usuario.nombre}</span>
            </div>
            <form action={logout}>
              <button
                type="submit"
                className="btn-logout-header"
                title="Cerrar sesión institucional"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <LogOut size={14} />
                <span>Salir</span>
              </button>
            </form>
          </div>
        ) : (
          <div className="header-badge-public">
            <span className="campus-badge">Campus Docente</span>
          </div>
        )}
      </div>
    </motion.header>
  );
}
