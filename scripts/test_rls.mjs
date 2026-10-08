import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve('.env.local') });

const sbAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, { auth: { persistSession: false } });

async function createDocente(email, password, nombre) {
  // 1. Create auth user
  const { data: user, error: userErr } = await sbAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });
  const isAlreadyRegistered = userErr && (
    userErr.message.toLowerCase().includes('already') ||
    userErr.message.toLowerCase().includes('exists')
  );
  if (userErr && !isAlreadyRegistered) {
    throw new Error('Create user error: ' + userErr.message);
  }

  let authUid = user?.user?.id;
  if (!authUid) {
    const { data: authUser } = await sbAdmin.from('docentes').select('auth_uid').eq('email', email).maybeSingle();
    authUid = authUser?.auth_uid;
  }

  if (!authUid) {
    const { data: userList } = await sbAdmin.auth.admin.listUsers();
    const u = userList?.users?.find(u => u.email === email);
    authUid = u?.id;
  }

  if (!authUid) {
    throw new Error('No se pudo encontrar auth_uid para ' + email);
  }

  // Garantizar password y confirmación para el test de login
  await sbAdmin.auth.admin.updateUserById(authUid, { password, email_confirm: true });

  // 2. Upsert docente
  const docente = {
    auth_uid: authUid,
    legajo: 'T-' + Date.now() + Math.random(),
    dni: 'DNI-' + Date.now(),
    email,
    nombre,
    activo: true,
  };
  
  const { data: existingDoc } = await sbAdmin.from('docentes').select('id, auth_uid').eq('email', email).maybeSingle();
  let docId = existingDoc?.id;
  if (!docId) {
    const { data: insDoc, error: insErr } = await sbAdmin.from('docentes').insert(docente).select('id').single();
    if (insErr) throw new Error('Insert docente error: ' + insErr.message);
    docId = insDoc.id;
  } else if (existingDoc.auth_uid !== authUid) {
    await sbAdmin.from('docentes').update({ auth_uid: authUid }).eq('id', docId);
  }
  
  // 3. Materia and Asignacion
  await sbAdmin.from('materias').upsert({ id: 'TEST-' + nombre, nombre: 'Test ' + nombre });
  await sbAdmin.from('asignaciones').upsert({ docente_id: docId, materia_id: 'TEST-' + nombre }, { onConflict: 'docente_id, materia_id' });

  return { email, password, docId, materia_id: 'TEST-' + nombre };
}

async function run() {
  console.log('--- Iniciando test de RLS de Apuntes ---');

  const d1 = await createDocente('docente1@utn.local', 'password123', 'Docente1');
  const d2 = await createDocente('docente2@utn.local', 'password123', 'Docente2');

  // Insertar apuntes
  await sbAdmin.from('apuntes').delete().in('docente_id', [d1.docId, d2.docId]);

  await sbAdmin.from('apuntes').insert({
    docente_id: d1.docId,
    materia_id: d1.materia_id,
    titulo: 'Apunte 1',
    contenido: 'Contenido 1'
  });
  
  await sbAdmin.from('apuntes').insert({
    docente_id: d2.docId,
    materia_id: d2.materia_id,
    titulo: 'Apunte 2',
    contenido: 'Contenido 2'
  });

  console.log('✓ Usuarios y apuntes creados');

  // Test como Docente 1
  const sb1 = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, { auth: { persistSession: false } });
  await sb1.auth.signInWithPassword({ email: d1.email, password: d1.password });
  const { data: apuntes1 } = await sb1.from('apuntes').select('*');
  
  if (apuntes1.length !== 1 || apuntes1[0].titulo !== 'Apunte 1') {
    console.error('✗ Fallo RLS: Docente 1 ve', apuntes1);
  } else {
    console.log('✓ Docente 1 ve solo sus apuntes');
  }

  // Test como Docente 2
  const sb2 = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, { auth: { persistSession: false } });
  await sb2.auth.signInWithPassword({ email: d2.email, password: d2.password });
  const { data: apuntes2 } = await sb2.from('apuntes').select('*');
  
  if (apuntes2.length !== 1 || apuntes2[0].titulo !== 'Apunte 2') {
    console.error('✗ Fallo RLS: Docente 2 ve', apuntes2);
  } else {
    console.log('✓ Docente 2 ve solo sus apuntes');
  }

  console.log('--- Test finalizado ---');
}

run().catch(console.error);
