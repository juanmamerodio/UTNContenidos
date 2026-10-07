/**
 * lib/auth.ts — Autenticación server-side compartida (Next.js + Supabase)
 * Usada por route handlers (api/*) y server actions para validar la sesión
 * del docente vía la cookie HttpOnly `utn_sesion` (JWT de Supabase).
 * Seguridad: retorna solo lo necesario; RLS aplica con el service client.
 */
import { cookies } from 'next/headers';
import { getServiceClient } from '@/lib/supabase';

export const SESION_COOKIE = 'utn_sesion';

export interface DocenteSesion {
  id: string;
  nombre: string;
  generacionesDia: number;
  ultimaGen: string | null;
}

/** Lee el token JWT de la cookie HttpOnly. */
export async function getToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(SESION_COOKIE)?.value || null;
}

/** Valida el JWT y devuelve el docente asociado, o null. */
export async function getDocenteSesion(): Promise<DocenteSesion | null> {
  const token = await getToken();
  if (!token) return null;
  try {
    const sb = getServiceClient();
    const { data: auth, error } = await sb.auth.getUser(token);
    if (error || !auth.user) return null;

    const { data: docente } = await sb
      .from('docentes')
      .select('id, nombre, generaciones_dia, ultima_gen')
      .eq('auth_uid', auth.user.id)
      .maybeSingle();

    if (!docente) return null;
    return {
      id: docente.id,
      nombre: docente.nombre,
      generacionesDia: docente.generaciones_dia || 0,
      ultimaGen: docente.ultima_gen || null
    };
  } catch (e) {
    console.error('getDocenteSesion:', e);
    return null;
  }
}

/** Verifica si la fecha de última generación corresponde a hoy (para reset diario). */
export function esHoy(ultimaGen: string | null): boolean {
  if (!ultimaGen) return false;
  const hoy = new Date().toISOString().slice(0, 10);
  return String(ultimaGen).slice(0, 10) === hoy;
}