import { redirect } from 'next/navigation';
import { getSesionUsuario } from '../helpers';
import { logout } from '../actions';

export default async function DashboardPage() {
  const usuario = await getSesionUsuario();
  if (!usuario) redirect('/login');

  return (
    <>
      <header className="dash-header">
        <div>
          <h1>¿Qué clase preparamos hoy?</h1>
          <p>Hola {usuario?.nombre} — tu plataforma Beta está activa.</p>
        </div>
        <form action={logout}>
          <button type="submit" className="btn-secondary">Cerrar Sesión</button>
        </form>
      </header>

      <section className="estado-card">
        <h2>🚀 Beta 0.1.0 — Fundaciones listas</h2>
        <ul>
          <li>✅ Base de datos Supabase (PostgreSQL + RLS) conectada</li>
          <li>✅ Autenticación real con Supabase Auth (JWT + cookie HttpOnly)</li>
          <li>✅ Framework Next.js 15 + TypeScript (XSS imposible por diseño)</li>
          <li>🔜 Próximo: B2 — acciones de negocio en Supabase (chau GAS)</li>
          <li>🔜 Próximo: B3 — presentaciones HTML con Reveal.js</li>
        </ul>
      </section>
    </>
  );
}