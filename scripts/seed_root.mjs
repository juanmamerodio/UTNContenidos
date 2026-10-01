/**
 * scripts/seed_root.mjs — Crea el usuario administrador root/root (Beta B1)
 * 1) Crea el user en Supabase Auth (email root@utn.local, password root)
 * 2) Lo vincula a la tabla docentes (auth_uid) para que RLS funcione
 *
 * Uso: npm run seed:root   (requiere .env.local con SUPABASE_URL + SUPABASE_SERVICE_KEY)
 * Idempotente: si ya existe, solo vincula.
 */
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve('.env.local') });

const sb = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  { auth: { persistSession: false } }
);

const ROOT_EMAIL = 'root@utn.local';
// Supabase exige mínimo 6 caracteres. El password REAL del auth user es distinto
// de "root": la autoridad la valida la tabla docentes (legajo+dni) y el backend
// emite la sesión con ESTE password interno. Así el login visible sigue siendo root/root.
const ROOT_AUTH_PASS = 'root-root-utn';

// 1. Buscar si el user ya existe
let authUid = null;
try {
  const { data } = await sb.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const existing = (data?.users || []).find(u => u.email === ROOT_EMAIL);
  if (existing) {
    authUid = existing.id;
    console.log('✓ user root ya existía');
  }
} catch (e) { console.log('listUsers:', e.message); }

// 2. Si no existe, crearlo
if (!authUid) {
  const { data, error } = await sb.auth.admin.createUser({
    email: ROOT_EMAIL,
    password: ROOT_AUTH_PASS,
    email_confirm: true
  });
  if (error) {
    console.error('✗ createUser:', error.message);
    process.exit(1);
  }
  authUid = data.user.id;
  console.log('✓ user root creado');
}

// 3. Vincular a docentes (idempotente: upsert por legajo)
const { data: row, error } = await sb.from('docentes').upsert({
  auth_uid: authUid,
  legajo: 'root',
  dni: 'root',
  email: ROOT_EMAIL,
  nombre: 'Administrador',
  activo: true
}, { onConflict: 'legajo' }).select('*').maybeSingle();

if (error) {
  console.error('✗ vincular docentes:', error.message);
  process.exit(1);
}

console.log('✓ docente root vinculado:', row.id);
console.log('\nLogin de prueba: root / root');
process.exit(0);