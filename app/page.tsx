import { redirect } from 'next/navigation';
import { getSesionUsuario } from './helpers';

export default async function HomePage() {
  const usuario = await getSesionUsuario();
  if (usuario) redirect('/dashboard');
  redirect('/login');
}