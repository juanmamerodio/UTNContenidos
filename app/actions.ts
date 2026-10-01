/**
 * app/actions.ts — Server Actions de autenticación (Beta)
 * Solo corren en el servidor (seguras por diseño: nunca se exponen al cliente).
 */
'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getServiceClient } from '@/lib/supabase';

const SESION_COOKIE = 'utn_sesion';

export async function loginRoot(formData: FormData): Promise<void> {
  const legajo = String(formData.get('legajo') || '').trim();
  const dni = String(formData.get('dni') || '').trim();

  if (!legajo || !dni) {
    redirect('/login?error=credenciales');
  }

  const sb = getServiceClient();
  let token: string | null = null;
  try {
    // 1. Buscar docente por legajo+dni (la autoridad la da la tabla, no el password)
    const { data: docente, error: errDoc } = await sb
      .from('docentes')
      .select('id, auth_uid, email, nombre, activo')
      .eq('legajo', legajo)
      .eq('dni', dni)
      .maybeSingle();

    if (errDoc || !docente || !docente.activo || !docente.auth_uid) {
      redirect('/login?error=credenciales');
    }

    // 2. Emitir sesión real de Supabase Auth (JWT)
    const { data: sesion, error: errLogin } = await sb.auth.signInWithPassword({
      email: docente!.email,
      password: process.env.ROOT_AUTH_PASS || 'root-root-utn'
    });

    if (errLogin || !sesion.session) {
      redirect('/login?error=credenciales');
    }

    token = sesion.session.access_token;
  } catch (e) {
    // NEXT_REDIRECT se lanza como excepción controlada: NO debe caer en el catch de error.
    if (e instanceof Error && e.message.includes('NEXT_REDIRECT')) throw e;
    console.error('loginRoot error:', e);
    redirect('/login?error=servidor');
  }

  // 3. Cookie HttpOnly (no accesible desde JS → anti-XSS)
  if (token) {
    const store = await cookies();
    store.set(SESION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 días
    });
  }

  redirect('/dashboard');
}

export async function logout() {
  const store = await cookies();
  store.delete(SESION_COOKIE);
  redirect('/');
}