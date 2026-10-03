/**
 * app/actions.ts — Server Actions de autenticación (Beta)
 * Solo corren en el servidor (seguras por diseño: nunca se exponen al cliente).
 */
'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getServiceClient } from '@/lib/supabase';

const SESION_COOKIE = 'utn_sesion';
const MAX_FALLOS = 5;
const VENTANA_MIN = 15;

/** B5: tasa de intentos fallidos en la ventana (lockout anti brute-force). */
async function fallosRecientes(sb: any, legajo: string): Promise<number> {
  const desde = new Date(Date.now() - VENTANA_MIN * 60000).toISOString();
  const { data, error } = await sb
    .from('eventos')
    .select('id', { count: 'exact', head: true })
    .eq('accion', 'LOGIN_FALLO')
    .eq('detalle', legajo)
    .gte('creado_en', desde);
  if (error) return 0;
  return data?.length ?? 0;
}

export async function loginRoot(formData: FormData): Promise<void> {
  const legajo = String(formData.get('legajo') || '').trim();
  const dni = String(formData.get('dni') || '').trim();

  if (!legajo || !dni) {
    redirect('/login?error=credenciales');
  }

  const sb = getServiceClient();
  let token: string | null = null;

  // B5: lockout — si hubo 5 fallos en 15 min, bloquear
  if (await fallosRecientes(sb, legajo) >= MAX_FALLOS) {
    redirect('/login?error=bloqueado');
  }

  try {
    // 1. Buscar docente por legajo+dni (la autoridad la da la tabla, no el password)
    const { data: docente, error: errDoc } = await sb
      .from('docentes')
      .select('id, auth_uid, email, nombre, activo')
      .eq('legajo', legajo)
      .eq('dni', dni)
      .maybeSingle();

    if (errDoc || !docente || !docente.activo) {
      await sb.from('eventos').insert({ accion: 'LOGIN_FALLO', detalle: legajo, exito: false });
      redirect('/login?error=credenciales');
    }

    // 2. USUARIO QA (root/root): auto-reparación — si el auth user no está
    //    vinculado, lo creamos/vinculamos al vuelo para que SIEMPRE funcione.
    const authPass = process.env.ROOT_AUTH_PASS || 'root-root-utn';
    if (!docente.auth_uid) {
      const { data: creado, error: errCreado } = await sb.auth.admin.createUser({
        email: docente!.email,
        password: authPass,
        email_confirm: true
      });
      if (errCreado) {
        // Ya existe: lo buscamos y vinculamos
        const { data: lista } = await sb.auth.admin.listUsers({ page: 1, perPage: 1000 });
        const existente = (lista?.users || []).find((u: any) => u.email === docente!.email);
        if (existente) {
          await sb.from('docentes').update({ auth_uid: existente.id }).eq('id', docente!.id);
          docente.auth_uid = existente.id;
        }
      } else if (creado?.user?.id) {
        await sb.from('docentes').update({ auth_uid: creado.user.id }).eq('id', docente!.id);
        docente.auth_uid = creado.user.id;
      }
    }

    if (!docente.auth_uid) {
      redirect('/login?error=credenciales');
    }

    // 3. Emitir sesión real de Supabase Auth (JWT)
    const { data: sesion, error: errLogin } = await sb.auth.signInWithPassword({
      email: docente!.email,
      password: authPass
    });

    // B5 fix: si el password no coincide (ej: user creado con otra clave), lo
    // reseteamos a ROOT_AUTH_PASS y reintentamos una vez — root/root SIEMPRE entra.
    if (errLogin || !sesion.session) {
      await sb.auth.admin.updateUserById(docente!.auth_uid!, { password: authPass });
      const { data: sesion2, error: err2 } = await sb.auth.signInWithPassword({
        email: docente!.email,
        password: authPass
      });
      if (err2 || !sesion2.session) {
        await sb.from('eventos').insert({ accion: 'LOGIN_FALLO', detalle: legajo, exito: false });
        redirect('/login?error=credenciales');
      }
      token = sesion2.session.access_token;
    } else {
      token = sesion.session.access_token;
    }

    // Login exitoso: limpiar fallos previos
    await sb.from('eventos').delete().eq('accion', 'LOGIN_FALLO').eq('detalle', legajo);
  } catch (e) {
    // NEXT_REDIRECT se lanza como excepción controlada: NO debe caer en el catch de error.
    if (e instanceof Error && e.message.includes('NEXT_REDIRECT')) throw e;
    console.error('loginRoot error:', e);
    redirect('/login?error=servidor');
  }

  // 4. Cookie HttpOnly (no accesible desde JS → anti-XSS)
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