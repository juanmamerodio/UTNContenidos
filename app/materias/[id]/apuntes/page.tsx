import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSesionUsuario } from '@/app/helpers';
import AppHeader from '@/components/layout/AppHeader';
import { getServiceClient } from '@/lib/supabase';
import { ArrowLeft, BookOpen } from 'lucide-react';
import GestorApuntes from './GestorApuntes';

export default async function ApuntesMateriaPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const usuario = await getSesionUsuario();
  if (!usuario) redirect('/login');

  const { id } = await params;

  const sb = getServiceClient();
  
  // Obtenemos el ID del docente a partir del usuario
  const { data: docente } = await sb
    .from('docentes')
    .select('id')
    .eq('email', usuario.email)
    .maybeSingle();

  if (!docente) redirect('/login');

  const { data: materia } = await sb
    .from('materias')
    .select('nombre')
    .eq('id', id)
    .single();

  if (!materia) {
    redirect('/dashboard');
  }

  // Obtenemos todos los apuntes del docente para esta materia
  const { data: apuntes } = await sb
    .from('apuntes')
    .select('titulo, contenido')
    .eq('materia_id', id)
    .eq('docente_id', docente.id);

  // Agrupamos por título para mostrarlos
  const agrupadosMap = new Map<string, { titulo: string; fragmentos: number; bytes: number }>();
  for (const apunte of (apuntes || [])) {
    const act = agrupadosMap.get(apunte.titulo) || { titulo: apunte.titulo, fragmentos: 0, bytes: 0 };
    act.fragmentos += 1;
    act.bytes += (apunte.contenido?.length || 0);
    agrupadosMap.set(apunte.titulo, act);
  }
  
  const apuntesAgrupados = Array.from(agrupadosMap.values());

  return (
    <>
      <AppHeader usuario={usuario} activePath="/dashboard" />
      <div className="layout-container">
        <header className="dash-header glass-panel">
          <div>
            <Link href="/dashboard" className="back-link btn-secondary" style={{ display: 'inline-flex', marginBottom: '1rem' }}>
              <ArrowLeft size={16} />
              <span>Volver al Dashboard</span>
            </Link>
            <h1>Apuntes de {materia.nombre}</h1>
            <p>Gestioná los documentos y URLs indexados para esta materia. La IA usará exclusivamente estos textos para generar las clases.</p>
          </div>
        </header>

        <GestorApuntes materiaId={id} apuntesAgrupados={apuntesAgrupados} />
      </div>
    </>
  );
}
