import { redirect } from 'next/navigation';
import { getSesionUsuario } from '../helpers';
import { getHistorial, borrarPresentacion } from '../datos';
import { revalidatePath } from 'next/cache';
import GlassCard from '@/components/ui/GlassCard';
import MaterialButton from '@/components/ui/MaterialButton';
import AppHeader from '@/components/layout/AppHeader';

const BADGES: Record<string, { label: string; cls: string }> = {
  LISTA: { label: '● Reciente', cls: 'badge' },
  ARCHIVADO: { label: '● Antigua', cls: 'badge badge-archivo' }
};

function desglosar(item: any): { estado: string; dias: number } {
  const creada = item.actualizada_en || item.creada_en;
  const dias = creada ? Math.max(0, Math.floor((Date.now() - new Date(creada).getTime()) / 86400000)) : 0;
  return { estado: dias > 15 ? 'ARCHIVADO' : 'LISTA', dias };
}

export default async function HistorialPage() {
  const usuario = await getSesionUsuario();
  if (!usuario) redirect('/login');

  const historial = await getHistorial();
  const recientes = historial.filter((h: any) => desglosar(h).estado === 'LISTA');
  const antiguas = historial.filter((h: any) => desglosar(h).estado === 'ARCHIVADO');

  async function eliminarAction(formData: FormData) {
    'use server'
    const id = formData.get('id') as string;
    await borrarPresentacion(id);
    revalidatePath('/historial');
  }

  const renderCard = (h: any) => {
    const { estado, dias } = desglosar(h);
    const badge = BADGES[estado] || BADGES.LISTA;
    return (
      <GlassCard className="materia-card" key={h.id}>
        <div className="materia-head">
          <span className={badge.cls}>{badge.label}</span>
          <h2>{h.contenido?.tema || h.configuracion?.tema || 'Presentación'}</h2>
          <p className="materia-desc">Actualizada hace {dias} día(s)</p>
        </div>
        <div className="materia-actions" style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
          <a href={`/historial/${h.id}`} className="btn-primary" style={{ textDecoration: 'none' }}>Ver Clase</a>
          <form action={eliminarAction}>
            <input type="hidden" name="id" value={h.id} />
            <button type="submit" className="btn-secondary" style={{ color: 'red' }}>Eliminar</button>
          </form>
        </div>
      </GlassCard>
    );
  };

  return (
    <>
      <AppHeader usuario={usuario} activePath="/historial" />

      <section className="dash-header glass-panel">
        <div>
          <h1>Historial de Clases</h1>
          <p>Hola <strong>{usuario?.nombre}</strong> — accedé a todas las presentaciones que preparaste.</p>
        </div>
        <div>
          <a href="/dashboard" className="btn-secondary">← Volver a Mis Materias</a>
        </div>
      </section>

      {historial.length === 0 ? (
        <section className="dash-materias">
          <GlassCard className="estado-card">
            <h2>No hay presentaciones todavía</h2>
            <p>Generá tu primera clase desde «Mis Materias».</p>
            <a href="/dashboard" className="btn-primary historial-btn-link">Ir a Mis Materias</a>
          </GlassCard>
        </section>
      ) : (
        <>
          {recientes.length > 0 && (
            <section className="dash-materias">
              <h2 style={{ width: '100%', marginBottom: '16px' }}>Recientes</h2>
              {recientes.map(renderCard)}
            </section>
          )}
          {antiguas.length > 0 && (
            <section className="dash-materias" style={{ marginTop: '32px' }}>
              <h2 style={{ width: '100%', marginBottom: '16px' }}>Antiguas</h2>
              {antiguas.map(renderCard)}
            </section>
          )}
        </>
      )}
    </>
  );
}