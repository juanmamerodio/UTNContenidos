import { redirect } from 'next/navigation';
import { getSesionUsuario } from '../helpers';
import { getDashboard } from '../datos';
import AppHeader from '@/components/layout/AppHeader';
import StepperDidactico from '@/components/ui/StepperDidactico';
import MateriaCardPro from '@/components/dashboard/MateriaCardPro';
import Link from 'next/link';

export default async function DashboardPage() {
  const usuario = await getSesionUsuario();
  if (!usuario) redirect('/login');

  const materias = await getDashboard();

  return (
    <>
      <AppHeader usuario={usuario} activePath="/dashboard" />

      <StepperDidactico pasoActual={1} />

      <section className="dash-header glass-panel">
        <div>
          <h1>¿Qué clase preparamos hoy?</h1>
          <p>
            Hola <strong>{usuario.nombre}</strong> — seleccioná un tema de tus cátedras para estructurar tu clase.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link href="/historial" className="btn-secondary">
            📚 Ver Historial
          </Link>
        </div>
      </section>

      <section className="dash-materias">
        {materias.length === 0 ? (
          <div className="materia-card glass-panel" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
            <h2>Sin materias asignadas</h2>
            <p style={{ marginTop: '0.6rem', color: 'var(--on-surface-2)' }}>
              Todavía no tenés cátedras asignadas en tu perfil activo.
            </p>
          </div>
        ) : (
          materias.map((m: any) => (
            <MateriaCardPro key={m.id} materia={m} />
          ))
        )}
      </section>
    </>
  );
}