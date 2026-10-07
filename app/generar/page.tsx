import { redirect } from 'next/navigation';
import { getSesionUsuario } from '../helpers';
import AppHeader from '@/components/layout/AppHeader';
import { getServiceClient } from '@/lib/supabase';
import { resolverNombreMateria } from '@/lib/materia';
import GeneradorClase from './GeneradorClase';

export default async function GenerarPage({
  searchParams
}: {
  searchParams: Promise<{ materia?: string; tema?: string; nombre?: string }>;
}) {
  const usuario = await getSesionUsuario();
  if (!usuario) redirect('/login');

  const params = await searchParams;
  const materiaId = params.materia || '';
  const temaId = params.tema || '';
  const temaNombre = params.nombre || 'Clase';

  if (!materiaId || !temaId) redirect('/dashboard');

  const materiaNombre = await resolverNombreMateria(getServiceClient(), usuario.email, materiaId);
  if (!materiaNombre) redirect('/dashboard');

  return (
    <>
      <AppHeader usuario={usuario} activePath="/generar" />
      <GeneradorClase
        materiaId={materiaId}
        materiaNombre={materiaNombre}
        temaId={temaId}
        temaNombre={temaNombre}
      />
    </>
  );
}