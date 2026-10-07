'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getServiceClient } from '@/lib/supabase';
import { getSesionUsuario } from '@/app/helpers';

const API_KEY = process.env.GEMINI_API_KEY || '';

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

function chunkText(text: string, maxLen: number = 1500): string[] {
  const words = text.split(/\s+/);
  const chunks = [];
  let current = '';
  for (const w of words) {
    if (current.length + w.length > maxLen) {
      if (current.length > 0) chunks.push(current.trim());
      current = w + ' ';
    } else {
      current += w + ' ';
    }
  }
  if (current.trim().length > 0) chunks.push(current.trim());
  return chunks.slice(0, 50); // Mx 50 fragmentos
}

async function getEmbedding(text: string): Promise<number[] | null> {
  if (!API_KEY) return null;
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:embedContent?key=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'models/gemini-embedding-2',
        content: { parts: [{ text }] }
      })
    }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data?.embedding?.values || null;
}

function isSafeUrl(urlStr: string): boolean {
  try {
    const url = new URL(urlStr);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
    const host = url.hostname;
    // Anti-SSRF basico
    if (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '::1' ||
      host.startsWith('10.') ||
      host.startsWith('192.168.') ||
      host.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./)
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

async function extractTextFromUrl(url: string): Promise<string> {
  if (!isSafeUrl(url)) throw new Error('URL inválida o no permitida.');
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

  try {
    const res = await fetch(url, { signal: controller.signal, redirect: 'manual' });
    clearTimeout(timeoutId);

    // Si es redirect, evaluamos si el target es seguro
    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get('location');
      if (loc && !isSafeUrl(loc)) {
        throw new Error('Redirección a URL no permitida.');
      }
    }

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('text/html') && !contentType.includes('text/plain')) {
      throw new Error('Solo se admiten pginas web o texto (HTML/TXT).');
    }

    const html = await res.text();
    
    // Extraccin super bsica (remover scripts, styles, tags)
    let text = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (text.length < 50) {
      throw new Error('No se encontr suficiente texto. La pgina podra requerir JS o login.');
    }

    return text.slice(0, 100000);
  } catch (e) {
    throw new Error((e as Error).message || 'Error al obtener la URL.');
  }
}

export async function agregarApunte(prevState: any, formData: FormData) {
  const sb = getServiceClient();
  const docenteId = await requireDocenteId();
  
  const materiaId = String(formData.get('materiaId') || '');
  const titulo = String(formData.get('titulo') || '').trim();
  const tipo = String(formData.get('tipo') || '');
  const url = String(formData.get('url') || '').trim();
  const textoPegado = String(formData.get('texto') || '').trim();

  if (!materiaId || !titulo) {
    return { error: 'Faltan campos obligatorios (ttulo/materia).' };
  }

  try {
    let contenido = '';
    
    if (tipo === 'url') {
      if (!url) return { error: 'Debes proveer una URL.' };
      contenido = await extractTextFromUrl(url);
    } else {
      if (!textoPegado) return { error: 'Debes pegar el texto.' };
      contenido = textoPegado.slice(0, 100000);
    }

    const chunks = chunkText(contenido);
    if (chunks.length === 0) return { error: 'El apunte está vacío.' };

    for (const chunk of chunks) {
      const vec = await getEmbedding(chunk);
      if (!vec) {
        return { error: 'Error al generar embeddings (IA no disponible).' };
      }
      
      const { error: dbError } = await sb.from('apuntes').insert({
        materia_id: materiaId,
        docente_id: docenteId,
        titulo: titulo,
        contenido: chunk,
        embedding: vec
      });

      if (dbError) throw new Error(dbError.message);
    }

    revalidatePath(`/materias/${materiaId}/apuntes`);
    return { success: true };
  } catch (e) {
    return { error: (e as Error).message || 'Ocurri un error.' };
  }
}

export async function borrarApunte(materiaId: string, titulo: string) {
  const sb = getServiceClient();
  const docenteId = await requireDocenteId();
  
  const { error } = await sb
    .from('apuntes')
    .delete()
    .match({ materia_id: materiaId, docente_id: docenteId, titulo });

  if (error) return { error: error.message };
  revalidatePath(`/materias/${materiaId}/apuntes`);
  return { success: true };
}
