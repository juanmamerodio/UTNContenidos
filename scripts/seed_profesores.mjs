/**
 * scripts/seed_profesores.mjs — Carga profesores de prueba para QA
 * Crea usuarios docentes vinculados en auth.users y en la tabla 'docentes',
 * asignándoles materias para comprobar la funcionalidad del sistema.
 * 
 * Uso: node scripts/seed_profesores.mjs
 */
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve('.env.local') });

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  console.error('Error: faltan SUPABASE_URL o SUPABASE_SERVICE_KEY en .env.local');
  process.exit(1);
}

const sb = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  { auth: { persistSession: false } }
);

const DEFAULT_AUTH_PASS = process.env.ROOT_AUTH_PASS || 'root-root-utn';

const PROFESORES = [
  {
    legajo: 'DOC01',
    dni: '30111222',
    email: 'doc01@utn.local',
    nombre: 'Prof. Carlos Benítez',
    materias: ['AM1'],
    rol: 'Titular'
  },
  {
    legajo: 'DOC02',
    dni: '28333444',
    email: 'doc02@utn.local',
    nombre: 'Ing. Laura Gómez',
    materias: ['AIS'],
    rol: 'Adjunto'
  },
  {
    legajo: 'DOC03',
    dni: '25555666',
    email: 'doc03@utn.local',
    nombre: 'Lic. Mariana Rossi',
    materias: ['ING'],
    rol: 'Titular'
  },
  {
    legajo: 'DOC04',
    dni: '32777888',
    email: 'doc04@utn.local',
    nombre: 'Dr. Alejandro Morales',
    materias: ['AM1', 'AIS'],
    rol: 'JTP'
  }
];

console.log('--- Iniciando carga de Profesores de Prueba para QA ---');

// Obtener lista de usuarios de Auth existentes
let existingUsers = [];
try {
  const { data } = await sb.auth.admin.listUsers({ page: 1, perPage: 1000 });
  existingUsers = data?.users || [];
} catch (e) {
  console.warn('Advertencia al listar usuarios Auth:', e.message);
}

for (const p of PROFESORES) {
  console.log(`\nProcesando ${p.nombre} (Legajo: ${p.legajo})...`);
  
  let authUser = existingUsers.find(u => u.email === p.email);

  if (!authUser) {
    const { data: newUser, error: errAuth } = await sb.auth.admin.createUser({
      email: p.email,
      password: DEFAULT_AUTH_PASS,
      email_confirm: true
    });
    if (errAuth) {
      console.error(`  ✗ Error creando Auth User para ${p.email}:`, errAuth.message);
      continue;
    }
    authUser = newUser.user;
    console.log(`  ✓ Auth user creado con ID: ${authUser.id}`);
  } else {
    // Asegurar contraseña estandarizada
    await sb.auth.admin.updateUserById(authUser.id, { password: DEFAULT_AUTH_PASS });
    console.log(`  ✓ Auth user ya existía con ID: ${authUser.id}`);
  }

  // Upsert en la tabla docentes
  const { data: docRow, error: errDoc } = await sb.from('docentes').upsert({
    auth_uid: authUser.id,
    legajo: p.legajo,
    dni: p.dni,
    email: p.email,
    nombre: p.nombre,
    activo: true
  }, { onConflict: 'legajo' }).select('id').single();

  if (errDoc) {
    console.error(`  ✗ Error guardando docente en DB:`, errDoc.message);
    continue;
  }

  const docenteId = docRow.id;
  console.log(`  ✓ Docente guardado en DB con ID: ${docenteId}`);

  // Limpiar y reasignar materias
  if (p.materias && p.materias.length > 0) {
    await sb.from('asignaciones').delete().eq('docente_id', docenteId);
    const asignaciones = p.materias.map(matId => ({
      docente_id: docenteId,
      materia_id: matId,
      rol: p.rol
    }));

    const { error: errAsig } = await sb.from('asignaciones').insert(asignaciones);
    if (errAsig) {
      console.error(`  ✗ Error asignando materias:`, errAsig.message);
    } else {
      console.log(`  ✓ Materias asignadas (${p.materias.join(', ')})`);
    }
  }
}

console.log('\n======================================================');
console.log('✓ Profesores cargados exitosamente para pruebas QA:');
PROFESORES.forEach(p => {
  console.log(` • ${p.nombre} -> Legajo: ${p.legajo} | DNI: ${p.dni} (Materias: ${p.materias.join(', ')})`);
});
console.log('======================================================\n');
process.exit(0);
