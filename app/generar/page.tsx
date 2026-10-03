import { redirect } from 'next/navigation';
import { getSesionUsuario } from '../helpers';
import AppHeader from '@/components/layout/AppHeader';
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

  return (
    <>
      <AppHeader usuario={usuario} activePath="/generar" />
      <GeneradorClase
        materiaId={materiaId}
        materiaNombre={materiaId}
        temaId={temaId}
        temaNombre={temaNombre}
      />
    </>
  );
}