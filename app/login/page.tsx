import { loginRoot } from '../actions';
import Image from 'next/image';
import { Zap, Lock, FileCheck, Clock } from 'lucide-react';
import AppHeader from '@/components/layout/AppHeader';

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const errorMsg =
    params.error === 'servidor'
      ? 'Error del servidor. Intentá de nuevo.'
      : params.error === 'bloqueado'
      ? 'Demasiados intentos fallidos. Por seguridad esperá 15 minutos.'
      : params.error
      ? 'Credenciales inválidas. Verificá tu Legajo y DNI en Sysacad.'
      : null;

  const bloqueado = params.error === 'bloqueado';

  return (
    <>
      <AppHeader usuario={null} />

      <section id="view-login" className="login-wrapper login-split glass-panel" aria-labelledby="login-title">
        <aside className="login-beneficios" aria-label="Qué ganás con el asistente">
          <h2>Tu clase lista en minutos</h2>
          <ul>
            <li>
              <Zap size={28} aria-hidden="true" />
              <span><strong>Clases en 3 clics</strong> Elegí el tema y generá.</span>
            </li>
            <li>
              <Lock size={28} aria-hidden="true" />
              <span><strong>Buscá en tu propia bibliografía</strong> Tus apuntes son privados.</span>
            </li>
            <li>
              <FileCheck size={28} aria-hidden="true" />
              <span><strong>Formato oficial UTN</strong> Presentación lista para proyectar.</span>
            </li>
          </ul>
        </aside>
        <div className="login-form-panel">

          <div className="login-brand-header">
            <div className="login-logo-wrapper">
              <Image
                src="/UTN.jpg"
                alt="Logo Universidad Tecnológica Nacional"
                width={72}
                height={72}
                className="login-logo-img"
                priority
              />
            </div>
            <span className="login-header-badge">Campus Docente UTN FRD</span>
          </div>

          <h1 id="login-title">Ingreso Docente</h1>
          <p className="login-subtitle">
            Planificación didáctica y creación de clases universitarias con IA asistida.
          </p>

          <form action={loginRoot} method="POST" className="login-form">
            <div className="form-group">
              <label htmlFor="input-legajo">Legajo Docente</label>
              <input
                id="input-legajo"
                name="legajo"
                type="text"
                autoComplete="username"
                required
                autoFocus
                placeholder="Ej: 12345 o root"
              />
            </div>

            <div className="form-group">
              <label htmlFor="input-dni">Número de DNI</label>
              <input
                id="input-dni"
                name="dni"
                type="password"
                autoComplete="current-password"
                required
                placeholder="Ingresá tu DNI sin puntos"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="login-submit" id="btn-login-submit">
                <span>Ingresar al Asistente</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>

            {bloqueado ? (
              <div className="login-lockout" role="alert">
                <Clock size={32} aria-hidden="true" />
                <p>
                  Demasiados intentos fallidos. Por seguridad esperá <strong>15 minutos</strong> antes de volver a intentar.
                </p>
              </div>
            ) : (
              errorMsg && <p className="login-error" role="alert">{errorMsg}</p>
            )}

            <div className="form-help">
              <a href="mailto:sistemas@frd.utn.edu.ar">
                ¿Necesitás ayuda técnica con tu usuario institucional?
              </a>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}