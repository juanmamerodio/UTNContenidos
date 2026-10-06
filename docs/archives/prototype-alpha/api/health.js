/**
 * api/health.js — Healthcheck + keep-alive de Supabase (Beta B1)
 * Sirve para: 1) verificar que la DB responde, 2) mantener el free tier
 * activo (Vercel Cron lo llama cada 5 min).
 */
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || '';

let supabase = null;
function getClient() {
  if (!supabase && supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false }
    });
  }
  return supabase;
}

export default async function handler(req, res) {
  const start = Date.now();
  try {
    const client = getClient();
    if (!client) {
      return res.status(500).json({ success: false, error: 'Supabase no configurado (env).' });
    }

    // Query trivial para validar conexión y RLS
    const { error } = await client.from('materias').select('id').limit(1);
    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    return res.status(200).json({
      success: true,
      db: 'ok',
      ms: Date.now() - start,
      ts: new Date().toISOString()
    });
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }
}