/**
 * app/datos.ts — Server Actions de negocio (B2: chau GAS)
 * Todas las operaciones CRUD sobre Supabase, ejecutadas solo en el servidor.
 * Seguridad: se usa la sesión JWT (cookie HttpOnly) para identificar al docente,
 * y los permisos por fila (RLS) se aplican de todas formas con el service client.
 */
'use server';

import { redirect } from 'next/navigation';
import { getServiceClient } from '@/lib/supabase';
import { getSesionUsuario } from './helpers';

/** Obtiene el docente autenticado (id) o redirige a login. */
async function requireDocenteId(): Promise<string> {
  const usuario = await getSesionUsuario();
  if (!usuario) redirect('/login');
  const sb = getServiceClient();
  const { data } = await sb
    .from('docentes')
    .select('id')
    .eq('email', usuario.email)
    .maybeSingle();
  if (!data) redirect('/login');
  return data.id;
}

/** Dashboard: materias asignadas al docente con sus temas. */
export async function getDashboard() {
  const sb = getServiceClient();
  const docenteId = await requireDocenteId();

  const { data: asignaciones } = await sb
    .from('asignaciones')
    .select('materia_id')
    .eq('docente_id', docenteId);

  const materiaIds = (asignaciones || []).map((a: any) => a.materia_id);
  if (materiaIds.length === 0) return [];

  const { data: materias } = await sb
    .from('materias')
    .select('*')
    .in('id', materiaIds)
    .eq('activa', true);

  const { data: temas } = await sb
    .from('temas')
    .select('*')
    .in('materia_id', materiaIds)
    .eq('activo', true)
    .order('orden');

  return (materias || []).map((m: any) => ({
    id: m.id,
    nombre: m.nombre,
    nivel: m.nivel,
    descripcion: m.descripcion,
    temas: (temas || []).filter((t: any) => t.materia_id === m.id)
  }));
}

/** Catálogo completo de materias (para reclamar). */
export async function getOfertaAcademica() {
  const sb = getServiceClient();
  await requireDocenteId();
  const { data } = await sb.from('materias').select('*').eq('activa', true).order('nivel');
  return data || [];
}

/** Agregar tema a una materia (B2). */
export async function agregarTema(formData: FormData): Promise<void> {
  const sb = getServiceClient();
  await requireDocenteId();

  const materiaId = String(formData.get('materiaId') || '').trim();
  const nombre = String(formData.get('nombre') || '').trim().slice(0, 200);
  const descripcion = String(formData.get('descripcion') || '').trim().slice(0, 500);
  const urlApunte = String(formData.get('urlApunte') || '').trim().slice(0, 500);

  if (!materiaId || !nombre) {
    redirect('/dashboard?error=tema');
  }

  // Próximo orden disponible
  const { data: temas } = await sb.from('temas').select('orden').eq('materia_id', materiaId);
  const maxOrden = Math.max(0, ...(temas || []).map((t: any) => t.orden || 0));

  const { error } = await sb.from('temas').insert({
    materia_id: materiaId,
    orden: maxOrden + 1,
    nombre,
    descripcion,
    url_apunte: urlApunte,
    activo: true
  });

  if (error) {
    console.error('agregarTema:', error.message);
    redirect('/dashboard?error=tema');
  }
  redirect('/dashboard');
}

/** Plantillas: listar / guardar / borrar. */
export async function getPlantillas() {
  const sb = getServiceClient();
  const docenteId = await requireDocenteId();
  const { data } = await sb
    .from('plantillas')
    .select('id, nombre, configuracion')
    .eq('docente_id', docenteId)
    .order('nombre');
  return data || [];
}

export async function guardarPlantilla(nombre: string, configuracion: object): Promise<{ error?: string }> {
  const sb = getServiceClient();
  const docenteId = await requireDocenteId();
  const { error } = await sb.from('plantillas').upsert({
    docente_id: docenteId,
    nombre: String(nombre).slice(0, 60),
    configuracion
  }, { onConflict: 'docente_id,nombre' });
  if (error) return { error: error.message };
  return {};
}

export async function borrarPlantilla(id: string): Promise<{ error?: string }> {
  const sb = getServiceClient();
  await requireDocenteId();
  const { error } = await sb.from('plantillas').delete().eq('id', id);
  if (error) return { error: error.message };
  return {};
}

/** Historial de presentaciones del docente. */
export async function getHistorial() {
  const sb = getServiceClient();
  const docenteId = await requireDocenteId();
  const { data } = await sb
    .from('presentaciones')
    .select('*')
    .eq('docente_id', docenteId)
    .order('actualizada_en', { ascending: false });
  return data || [];
}

/** Guardar una presentación generada (B3). */
export async function guardarPresentacion(
  temaId: string,
  temaNombre: string,
  configuracion: object,
  contenido: object
): Promise<{ error?: string }> {
  const sb = getServiceClient();
  const docenteId = await requireDocenteId();
  const { error } = await sb.from('presentaciones').insert({
    docente_id: docenteId,
    tema_id: temaId || null,
    configuracion,
    contenido,
    estado: 'LISTA'
  });
  if (error) return { error: error.message };
  return {};
}