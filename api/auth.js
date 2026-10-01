/**
 * api/auth.js — Autenticación Beta (Supabase Auth)
 * Flujo: 1) magic link por email (sin contraseña, ideal 50+)
 *        2) verificación opcional legajo+DNI contra tabla docentes
 *        3) mapeo docente ↔ auth.users para RLS
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || '';

let supabase = null;
function getClient() {
  if (!supabase && supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });
  }
  return supabase;
}

export default async function handler(req, res) {
  // CORS (mismo origen que la SPA)
  res.setHeader('Access-Control-Allow-Origin', process.env.APP_URL || '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Usa POST.' });

  const client = getClient();
  if (!client) return res.status(500).json({ success: false, error: 'Supabase no configurado.' });

  const { accion, email, legajo, dni } = req.body || {};

  try {
    if (accion === 'solicitar-codigo') {
      // 1) Validar que el email pertenece a un docente registrado (institucional)
      const { data: docente, error: errDoc } = await client
        .from('docentes').select('id, email, nombre, activo')
        .eq('email', String(email || '').trim().toLowerCase())
        .maybeSingle();
      if (errDoc) return res.status(500).json({ success: false, error: 'Error interno.' });
      if (!docente || !docente.activo) {
        return res.status(403).json({ success: false, error: 'Ese email no está registrado como docente. Contactá a sistemas.' });
      }

      // 2) Enviar magic link (OTP) — Supabase email built-in (free tier)
      const { error: errOtp } = await client.auth.admin.generateLink({
        type: 'magiclink',
        email: docente.email,
        options: { redirectTo: process.env.APP_URL }
      });
      if (errOtp) return res.status(500).json({ success: false, error: 'No se pudo enviar el código.' });

      return res.status(200).json({ success: true, mensaje: 'Te enviamos el link de ingreso por email.' });
    }

    if (accion === 'verificar-codigo') {
      // Flujo PKCE manual: el cliente resuelve el OTP y devuelve la sesión JWT.
      // (En la práctica, el front usa supabase.auth.signInWithOtp + verifyOtp.)
      const { data, error } = await client.auth.signInWithOtp({
        email: String(email || '').trim().toLowerCase(),
        token: String(legajo || ''), // placeholder real: token OTP
        shouldCreateUser: false
      });
      // Nota: signInWithOtp con token requiere el SDK; aquí se resuelve en el front.
      return res.status(501).json({ success: false, error: 'Usar flujo OTP del cliente (ver api/README).' });
    }

    if (accion === 'validar-legajo-dni') {
      // Verificación transicional legajo+DNI (sin email) — se mapea a Supabase Auth
      const { data: docente, error } = await client
        .from('docentes').select('id, auth_uid, email, nombre, activo')
        .eq('legajo', String(legajo || '').trim())
        .eq('dni', String(dni || '').trim())
        .maybeSingle();
      if (error) return res.status(500).json({ success: false, error: 'Error interno.' });
      if (!docente || !docente.activo) {
        return res.status(403).json({ success: false, error: 'Credenciales inválidas.' });
      }
      if (!docente.auth_uid) {
        return res.status(403).json({ success: false, error: 'Tu cuenta aún no está vinculada a Supabase. Usá tu email institucional.' });
      }
      // Emitir sesión para el auth_uid (admin API)
      const { data: sesion } = await client.auth.admin.generateLink({
        type: 'magiclink', email: docente.email, options: { redirectTo: process.env.APP_URL }
      });
      return res.status(200).json({ success: true, email: docente.email, nombre: docente.nombre, magicLink: sesion });
    }

    return res.status(400).json({ success: false, error: 'Acción desconocida.' });
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }
}