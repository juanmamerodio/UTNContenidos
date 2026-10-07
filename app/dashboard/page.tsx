import { redirect } from 'next/navigation';
import { getSesionUsuario } from '../helpers';
import { getDashboard } from '../datos';
import AppHeader from '@/components/layout/AppHeader';
import MateriaCardPro from '@/components/dashboard/MateriaCardPro';
import Link from 'next/link';

export default async function DashboardPage() {
  const usuario = await getSesionUsuario();
  if (!usuario) redirect('/login');

  const materias = await getDashboard();

  return (
    <>
      <AppHeader usuario={usuario} activePath="/dashboard" />

      <section className="dash-header glass-panel">
        <div>
          <h1>¿Qué clase preparamos hoy?</h1>
          <p>
            Hola <strong>{usuario.nombre}</strong> — seleccioná un tema de tus cátedras para estructurar tu clase.
          </p>
        </div>
        <div className="dash-header-actions">
          <Link href="/historial" className="btn-secondary">
            📚 Ver Historial
          </Link>
        </div>
      </section>

      <section className="dash-materias">
        {materias.length === 0 ? (
          <div className="materia-card glass-panel materia-card-empty">
            <h2>Sin materias asignadas</h2>
            <p className="materia-empty-desc">
              Contactá a la secretaría académica para vincular tus cátedras. Apenas estén asignadas, vas a poder preparar tu clase desde acá.
            </p>
            <a href="mailto:sistemas@frd.utn.edu.ar" className="btn-primary">
              Escribir a la secretaría
            </a>
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