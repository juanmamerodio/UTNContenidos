/**
 * scripts/seed_materias.mjs — Materias de ejemplo para el desarrollo (B2)
 * Uso: npm run seed:materias   (idempotente: limpia y reinserta temas/asignaciones)
 * NOTA: requiere el patch_b2.sql (constraints UNIQUE) o funciona igual con
 * delete+insert (estrategia usada aquí para no depender de constraints).
 */
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve('.env.local') });

const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, { auth: { persistSession: false } });

const materias = [
  { id: 'AM1', nombre: 'Análisis Matemático I', nivel: '1er Año', departamento: 'Matemática', descripcion: 'Límites, continuidad y derivadas.', activa: true },
  { id: 'AIS', nombre: 'Análisis de Sistemas', nivel: '2do Año', departamento: 'Sistemas', descripcion: 'Ingeniería de requisitos y análisis.', activa: true },
  { id: 'ING', nombre: 'Inglés Técnico I', nivel: '1er Año', departamento: 'Lenguas', descripcion: 'Comprensión de textos técnicos.', activa: true }
];

const temas = [
  { materia_id: 'AM1', orden: 1, nombre: 'Límites y Continuidad', descripcion: 'Concepto de límite, propiedades y continuidad.', url_apunte: '', activo: true },
  { materia_id: 'AM1', orden: 2, nombre: 'Derivadas', descripcion: 'Regla de la cadena, extremos y aplicaciones.', url_apunte: '', activo: true },
  { materia_id: 'AIS', orden: 1, nombre: 'Relevamiento de Requisitos', descripcion: 'Técnicas de relevamiento y especificación.', url_apunte: '', activo: true },
  { materia_id: 'AIS', orden: 2, nombre: 'Modelado de Procesos', descripcion: 'Diagramas de flujo y casos de uso.', url_apunte: '', activo: true },
  { materia_id: 'ING', orden: 1, nombre: 'Reading Comprehension', descripcion: 'Estrategias de lectura técnica.', url_apunte: '', activo: true }
];

// Materias: upsert por id
for (const m of materias) {
  const { error } = await sb.from('materias').upsert(m, { onConflict: 'id' });
  if (error) console.error('✗ materia ' + m.id + ':', error.message);
  else console.log('✓ materia ' + m.id);
}

// Temas: limpiar y reinsertar (idempotente sin constraints)
const { error: delT } = await sb.from('temas').delete().in('materia_id', materias.map(m => m.id));
if (delT) console.error('✗ limpiar temas:', delT.message);
const { error: insT } = await sb.from('temas').insert(temas);
if (insT) console.error('✗ insertar temas:', insT.message);
else console.log('✓ ' + temas.length + ' temas insertados');

// Asignaciones: limpiar y reinsertar para root
const { data: root } = await sb.from('docentes').select('id').eq('legajo', 'root').maybeSingle();
if (root) {
  const { error: delA } = await sb.from('asignaciones').delete().eq('docente_id', root.id);
  if (delA) console.error('✗ limpiar asignaciones:', delA.message);
  const { error: insA } = await sb.from('asignaciones').insert(
    materias.map(m => ({ docente_id: root.id, materia_id: m.id, rol: 'Docente' }))
  );
  if (insA) console.error('✗ insertar asignaciones:', insA.message);
  else console.log('✓ materias asignadas a root (' + materias.length + ')');
} else {
  console.log('⚠ no se encontró el docente root');
}

console.log('\nSeed de materias finalizado.');
process.exit(0);