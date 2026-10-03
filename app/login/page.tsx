import { loginRoot } from '../actions';
import GlassCard from '@/components/ui/GlassCard';
import MaterialButton from '@/components/ui/MaterialButton';

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const errorMsg = params.error === 'servidor' ? 'Error del servidor. Intentá de nuevo.'
    : params.error === 'bloqueado' ? 'Demasiados intentos fallidos. Esperá 15 minutos.'
    : params.error ? 'Credenciales inválidas. Verificá en Sysacad.'
    : null;

  return (
    <GlassCard className="login-card">
      <div className="login-brand">
        <h1>UTN Contenidos</h1>
        <p>Beta 0.1.0 — Ingreso Docente · Facultad Regional Delta</p>
      </div>

      <form action={loginRoot} className="login-form">
        <div className="field">
          <label htmlFor="legajo">Legajo</label>
          <input id="legajo" name="legajo" autoComplete="username" required autoFocus />
        </div>
        <div className="field">
          <label htmlFor="dni">DNI</label>
          <input id="dni" name="dni" type="password" autoComplete="current-password" required />
        </div>
        <MaterialButton type="submit" variante="primary" className="login-submit">Ingresar al Asistente</MaterialButton>
        {errorMsg && <p className="login-error">{errorMsg}</p>}
      </form>
    </GlassCard>
  );
}