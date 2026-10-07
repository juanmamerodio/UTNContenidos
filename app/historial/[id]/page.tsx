import { redirect } from 'next/navigation';
import { getSesionUsuario } from '@/app/helpers';
import { getPresentacion } from '@/app/datos';
import AppHeader from '@/components/layout/AppHeader';
import HistorialVisor from './HistorialVisor';

export default async function PresentacionPage({ params }: { params: Promise<{ id: string }> }) {
  const usuario = await getSesionUsuario();
  if (!usuario) redirect('/login');

  const { id } = await params;
  const presentacion = await getPresentacion(id);
  if (!presentacion) redirect('/historial');

  return (
    <>
      <AppHeader usuario={usuario} activePath="/historial" />
      <HistorialVisor presentacion={presentacion} id={id} />
    </>
  );
}
