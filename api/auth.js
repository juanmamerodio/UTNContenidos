/**
 * api/auth.js — Autenticación Beta (Supabase Auth)
 * Sprint B1: login bootstrap root/root (usuario creado con scripts/seed_root.mjs)
 * Futuro: magic link por email (B2) + Microsoft Entra ID (Fase 2).
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

let sb = null;
function getClient() {
  if (!sb && supabaseUrl && supabaseServiceKey) {
    sb = createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } });
  }
  return sb;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.APP_URL || '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Usa POST.' });

  const client = getClient();
  if (!client) return res.status(500).json({ success: false, error: 'Supabase no configurado.' });

  const { accion } = req.body || {};

  try {
    // LOGIN root/root: legajo + dni actúan como usuario/clave del admin bootstrap
    if (accion === 'login') {
      const { legajo, dni } = req.body || {};
      const leg = String(legajo || '').trim();
      const dniLimpio = String(dni || '').trim();
      if (!leg || !dniLimpio) {
        return res.status(400).json({ success: false, error: 'Faltan legajo y DNI.' });
      }

      // 1. Buscar el docente por legajo+dni en la tabla (no confiar en strings hardcodeados)
      const { data: docente, error: errDoc } = await client
        .from('docentes').select('id, auth_uid, email, nombre, activo')
        .eq('legajo', leg).eq('dni', dniLimpio).maybeSingle();

      if (errDoc) return res.status(500).json({ success: false, error: 'Error interno.' });
      if (!docente || !docente.activo || !docente.auth_uid) {
        return res.status(403).json({ success: false, error: 'Credenciales inválidas o cuenta sin vincular.' });
      }

      // 2. Emitir sesión real con Supabase Auth.
      //    El password INTERNO del auth user es ROOT_AUTH_PASS (ver seed_root.mjs);
      //    la validación de autoridad la da la tabla docentes (legajo+dni), no el password.
      const { data: sesion, error: errLogin } = await client.auth.signInWithPassword({
        email: docente.email,
        password: process.env.ROOT_AUTH_PASS || 'root-root-utn'
      });
      if (errLogin || !sesion.session) {
        return res.status(403).json({ success: false, error: 'Credenciales inválidas.' });
      }

      return res.status(200).json({
        success: true,
        token: sesion.session.access_token,
        refreshToken: sesion.session.refresh_token,
        usuario: { nombre: docente.nombre, email: docente.email }
      });
    }

    // VALIDAR sesión JWT (para revalidar al recargar la página)
    if (accion === 'validar-sesion') {
      const token = String(req.headers.authorization || '').replace('Bearer ', '');
      if (!token) return res.status(401).json({ success: false, error: 'Sin token.' });

      const { data, error } = await client.auth.getUser(token);
      if (error || !data.user) {
        return res.status(401).json({ success: false, error: 'Sesión inválida o expirada.' });
      }

      // Cargar dashboard del docente (materias asignadas) — aún vacío en Beta desde cero
      return res.status(200).json({ success: true, usuario: { nombre: data.user.user_metadata?.nombre || 'Docente', email: data.user.email } });
    }

    return res.status(400).json({ success: false, error: 'Acción desconocida.' });
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }
}