/**
 * app/helpers.ts — Utilidades de sesión (server-side)
 */
import { cookies } from 'next/headers';
import { getServiceClient } from '@/lib/supabase';

export const SESION_COOKIE = 'utn_sesion';

/** Devuelve el usuario autenticado (vía JWT) o null. */
export async function getSesionUsuario(): Promise<{ email: string; nombre: string } | null> {
  const store = await cookies();
  const token = store.get(SESION_COOKIE)?.value;
  if (!token) return null;

  try {
    const sb = getServiceClient();
    const { data, error } = await sb.auth.getUser(token);
    if (error || !data.user) return null;

    const { data: docente } = await sb
      .from('docentes')
      .select('nombre')
      .eq('auth_uid', data.user.id)
      .maybeSingle();

    return {
      email: data.user.email || '',
      nombre: docente?.nombre || data.user.user_metadata?.nombre || 'Docente'
    };
  } catch (e) {
    console.error('getSesionUsuario error:', e);
    return null;
  }
}