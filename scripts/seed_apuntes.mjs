/**
 * scripts/seed_apuntes.mjs — Indexa apuntes con embeddings (B4 RAG)
 * Inserta un apunte de ejemplo para AM1 y calcula su embedding con
 * gemini-embedding-2 (3072 dims). Uso: npm run seed:apuntes
 */
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve('.env.local') });

const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, { auth: { persistSession: false } });
const API_KEY = process.env.GEMINI_API_KEY || '';

async function embedding(texto) {
  const r = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:embedContent?key=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'models/gemini-embedding-2', content: { parts: [{ text: texto }] } })
    }
  );
  if (!r.ok) throw new Error('embedding: ' + (await r.text()).slice(0, 200));
  const j = await r.json();
  return j.embedding.values;
}

const { data: asig, error: errAsig } = await sb.from('asignaciones').select('docente_id').eq('materia_id', 'AM1').limit(1).maybeSingle();
if (!asig) { console.error('✗ No hay docentes asignados a AM1. Corre seed:root y seed:materias primero.'); process.exit(1); }

const apunte = {
  materia_id: 'AM1',
  docente_id: asig.docente_id,
  titulo: 'Límites y Continuidad — Apunte de Cátedra',
  contenido: `Concepto de límite: decimos que f(x) tiende a L cuando x tiende a a si los valores de f(x) se aproximan arbitrariamente a L conforme x se acerca a a.
Propiedades: el límite de una suma es la suma de los límites; el límite de un producto es el producto de los límites.
Límites laterales: el límite existe si y solo si el límite por izquierda y por derecha existen y coinciden.
Límites indeterminados 0/0: se resuelven factorizando y simplificando, o racionalizando.
Continuidad: f es continua en a si el límite en a existe, f(a) existe y ambos coinciden.
Teorema del valor intermedio: si f es continua en [a,b], entonces f toma todos los valores entre f(a) y f(b).
Teorema de Weierstrass: toda función continua en un intervalo cerrado alcanza máximo y mínimo absolutos.`
};

// 1. Insertar/actualizar apunte
const { data: existente } = await sb.from('apuntes').select('id').eq('titulo', apunte.titulo).eq('docente_id', asig.docente_id).maybeSingle();
const id = existente?.id || undefined;
const { error: errUpsert } = await sb.from('apuntes').upsert({ id, ...apunte }, { onConflict: 'id' }).select('id').single();
if (errUpsert) { console.error('✗ upsert apunte:', errUpsert.message); process.exit(1); }
console.log('✓ apunte insertado');

// 2. Calcular embedding y actualizar
const vec = await embedding(apunte.contenido);
const { error: errVec } = await sb.from('apuntes').update({ embedding: vec }).eq('titulo', apunte.titulo);
if (errVec) { console.error('✗ embedding:', errVec.message); process.exit(1); }
console.log('✓ embedding de 3072 dims guardado');

console.log('\nSeed de apuntes finalizado.');
process.exit(0);