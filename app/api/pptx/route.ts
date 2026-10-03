import { NextResponse } from 'next/server';
import { getDocenteSesion } from '@/lib/auth';
import { exportarPptx } from '@/lib/pptx';
import type { Clase } from '@/lib/deck';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const docente = await getDocenteSesion();
  if (!docente) {
    return NextResponse.json({ error: 'No autorizado. Iniciá sesión.' }, { status: 401 });
  }

  const contentLength = Number(req.headers.get('content-length') || 0);
  if (contentLength > 1_000_000) {
    return NextResponse.json({ error: 'La presentación supera el tamaño permitido.' }, { status: 413 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'La solicitud no contiene JSON válido.' }, { status: 400 });
  }

  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Faltan los datos de la presentación.' }, { status: 400 });
  }

  const datos = body as Record<string, unknown>;
  const clase = datos.clase as Clase | undefined;
  const materia = typeof datos.materia === 'string' ? datos.materia.trim().slice(0, 200) : '';
  const tema = typeof datos.tema === 'string' ? datos.tema.trim().slice(0, 200) : '';
  const estilo = typeof datos.estilo === 'string' ? datos.estilo : '';

  if (!materia || !tema || !clase || !Array.isArray(clase.slides) || clase.slides.length < 1 || clase.slides.length > 20) {
    return NextResponse.json({ error: 'Los datos de la presentación son inválidos.' }, { status: 400 });
  }

  try {
    const archivo = await exportarPptx(clase, materia, tema, estilo);
    const nombreSeguro = tema.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80) || 'Clase';
    return new NextResponse(Buffer.from(archivo), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'Content-Disposition': `attachment; filename="UTN_Clase_${nombreSeguro}.pptx"`,
        'Cache-Control': 'private, no-store'
      }
    });
  } catch (error) {
    console.error('api/pptx error:', error);
    return NextResponse.json({ error: 'No se pudo generar el PowerPoint.' }, { status: 500 });
  }
}