/**
 * scripts/migrar.mjs — Migración Sheets (CSV) → Supabase (Beta B1)
 *
 * Uso:
 *   1) Exportar cada hoja de Google Sheets como CSV dentro de data/:
 *        data/docentes.csv   (A legajo,B dni,C nombre,D email)
 *        data/materias.csv   (A id,B plan,C nombre,D nivel,E depto,F desc,G activa)
 *        data/temas.csv      (A id_tema,B id_materia,C orden,D nombre,E desc,F url,G activo)
 *        data/asignaciones.csv (A id,B legajo,C id_materia)
 *   2) node scripts/migrar.mjs
 *
 * Idempotente: hace UPSERT por clave (legajo, id, etc). Correr las veces que quieras.
 * Requiere .env.local con SUPABASE_URL + SUPABASE_SERVICE_KEY (o env vars del shell).
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync } from 'fs';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve('.env.local') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const csv = (path) => readFileSync(resolve(path), 'utf8')
  .split(/\r?\n/).filter(l => l.trim().length > 0)
  .map(l => l.split(',').map(c => c.trim().replace(/^"|"$/g, '')));

async function upsert(table, rows, onConflict) {
  if (!rows.length) { console.log(`- ${table}: 0 filas (vacío)`); return; }
  const { error, count } = await supabase
    .from(table).upsert(rows, { onConflict, ignoreDuplicates: false }).select('*');
  if (error) console.error(`✗ ${table}: ${error.message}`);
  else console.log(`✓ ${table}: ${rows.length} filas`);
}

const leer = (file) => {
  try { return csv(`data/${file}`); } catch { console.log(`- data/${file}: no existe, se omite`); return []; }
};

// DOCENTES (A legajo, B dni, C nombre, D email)
const d = leer('docentes.csv');
await upsert('docentes', d.slice(1).filter(r => r[0]).map(r => ({
  legajo: r[0], dni: r[1], nombre: r[2] || 'Docente', email: r[3] || ''
})), 'legajo');

// MATERIAS (A id, B plan, C nombre, D nivel)
const m = leer('materias.csv');
await upsert('materias', m.slice(1).filter(r => r[0]).map(r => ({
  id: r[0], nombre: r[2] || r[1] || 'Materia', nivel: r[3] || 'General'
})), 'id');

// TEMAS (A id, B id_materia, C orden, D nombre, E desc, F url, G activo)
const t = leer('temas.csv');
await upsert('temas', t.slice(1).filter(r => r[0] && r[1]).map(r => ({
  materia_id: r[1], orden: parseInt(r[2] || '1', 10) || 1,
  nombre: r[3] || 'Tema', descripcion: r[4] || '', url_apunte: r[5] || '',
  activo: String(r[6]).toUpperCase() !== 'FALSE'
})), 'id');

// ASIGNACIONES (A id, B legajo, C id_materia) → mapear legajo→docente id
const as = leer('asignaciones.csv');
if (as.length > 1) {
  const { data: docentes } = await supabase.from('docentes').select('id, legajo');
  const mapLegajo = Object.fromEntries((docentes || []).map(x => [String(x.legajo), x.id]));
  const filas = as.slice(1).filter(r => r[1] && r[2] && mapLegajo[r[1]]).map(r => ({
    docente_id: mapLegajo[r[1]], materia_id: r[2]
  }));
  await upsert('asignaciones', filas, 'id');
}

console.log('\nMigración finalizada. Revisar errores arriba si los hubo.');
process.exit(0);