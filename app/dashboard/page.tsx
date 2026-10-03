import { redirect } from 'next/navigation';
import { getSesionUsuario } from '../helpers';
import { logout } from '../actions';
import { getDashboard } from '../datos';
import { agregarTema } from '../datos';
import GlassCard from '@/components/ui/GlassCard';
import MaterialButton from '@/components/ui/MaterialButton';

export default async function DashboardPage() {
  const usuario = await getSesionUsuario();
  if (!usuario) redirect('/login');

  const materias = await getDashboard();

  return (
    <>
      <GlassCard className="dash-header">
        <div>
          <h1>¿Qué clase preparamos hoy?</h1>
          <p>Hola {usuario?.nombre} — elegí una materia y un tema.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <a href="/historial" className="btn-secondary">Historial</a>
          <form action={logout}>
            <MaterialButton type="submit" variante="secondary">Cerrar Sesión</MaterialButton>
          </form>
        </div>
      </GlassCard>

      <section className="dash-materias">
        {materias.length === 0 ? (
          <GlassCard className="estado-card">
            <h2>Sin materias asignadas</h2>
            <p>Todavía no tenés materias en tu perfil. Contactá a sistemas o probá el flujo con el usuario root.</p>
          </GlassCard>
        ) : (
          materias.map((m: any) => (
            <article className="materia-card" key={m.id}>
              <div className="materia-head">
                <span className="badge">{m.nivel}</span>
                <h2>{m.nombre}</h2>
                {m.descripcion && <p className="materia-desc">{m.descripcion}</p>}
              </div>
              <ul className="tema-list">
                {m.temas.map((t: any) => (
                  <li key={t.id}>
                    <span>{t.nombre}</span>
                    <a href={`/generar?materia=${encodeURIComponent(m.id)}&tema=${encodeURIComponent(t.id)}&nombre=${encodeURIComponent(t.nombre)}`} className="btn-primary">
                      Preparar Clase
                    </a>
                  </li>
                ))}
              </ul>
              <details className="nuevo-tema">
                <summary>＋ Agregar tema</summary>
                <form action={agregarTema}>
                  <input type="hidden" name="materiaId" value={m.id} />
                  <input type="text" name="nombre" placeholder="Nombre del tema" required maxLength={200} />
                  <input type="text" name="descripcion" placeholder="Descripción (opcional)" maxLength={500} />
                  <input type="url" name="urlApunte" placeholder="URL del apunte (opcional)" maxLength={500} />
                  <MaterialButton type="submit" variante="primary">Guardar tema</MaterialButton>
                </form>
              </details>
            </article>
          ))
        )}
      </section>
    </>
  );
}