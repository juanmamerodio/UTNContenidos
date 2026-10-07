/**
 * lib/materia.ts — Resuelve el nombre de una materia validando que pertenezca al docente.
 * Devuelve null si el docente/materia no existe, está inactiva o no está asignada.
 */
import type { SupabaseClient } from '@supabase/supabase-js';

export async function resolverNombreMateria(
  sb: Pick<SupabaseClient, 'from'>,
  docenteEmail: string,
  materiaId: string
): Promise<string | null> {
  if (!docenteEmail || !materiaId) return null;

  const { data: docente } = await sb
    .from('docentes')
    .select('id')
    .eq('email', docenteEmail)
    .maybeSingle();
  if (!docente) return null;

  const { data: asignacion } = await sb
    .from('asignaciones')
    .select('materia_id')
    .eq('docente_id', docente.id)
    .eq('materia_id', materiaId)
    .maybeSingle();
  if (!asignacion) return null;

  const { data: materia } = await sb
    .from('materias')
    .select('nombre')
    .eq('id', materiaId)
    .eq('activa', true)
    .maybeSingle();

  return materia?.nombre ?? null;
}
