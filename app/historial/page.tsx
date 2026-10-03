import { redirect } from 'next/navigation';
import { getSesionUsuario } from '../helpers';
import { logout } from '../actions';
import { getHistorial } from '../datos';
import GlassCard from '@/components/ui/GlassCard';
import MaterialButton from '@/components/ui/MaterialButton';

const BADGES: Record<string, { label: string; cls: string }> = {
  LISTA: { label: '● Reciente', cls: 'badge' },
  ARCHIVADO: { label: '● Archivado', cls: 'badge badge-archivo' }
};

function desglosar(item: any): { estado: string; dias: number } {
  const creada = item.actualizada_en || item.creada_en;
  const dias = creada ? Math.max(0, Math.floor((Date.now() - new Date(creada).getTime()) / 86400000)) : 0;
  return { estado: dias > 15 ? 'ARCHIVADO' : (item.estado || 'LISTA'), dias };
}

export default async function HistorialPage() {
  const usuario = await getSesionUsuario();
  if (!usuario) redirect('/login');

  const historial = await getHistorial();

  return (
    <>
      <GlassCard className="dash-header">
        <div>
          <h1>Historial de Clases</h1>
          <p>Hola {usuario?.nombre} — tus presentaciones generadas.</p>
        </div>
        <form action={logout}>
          <MaterialButton type="submit" variante="secondary">Cerrar Sesión</MaterialButton>
        </form>
      </GlassCard>

      <section className="dash-materias">
        {historial.length === 0 ? (
          <GlassCard className="estado-card">
            <h2>No hay presentaciones todavía</h2>
            <p>Generá tu primera clase desde «Mis Materias».</p>
            <a href="/dashboard" className="btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>Ir a Mis Materias</a>
          </GlassCard>
        ) : (
          historial.map((h: any) => {
            const { estado, dias } = desglosar(h);
            const badge = BADGES[estado] || BADGES.LISTA;
            return (
              <GlassCard className="materia-card" key={h.id}>
                <div className="materia-head">
                  <span className={badge.cls}>{badge.label}</span>
                  <h2>{h.contenido?.tema || h.configuracion?.tema || 'Presentación'}</h2>
                  <p className="materia-desc">Generada hace {dias} día(s) · Carpeta: {h.carpeta || 'General'}</p>
                </div>
              </GlassCard>
            );
          })
        )}
      </section>
    </>
  );
}