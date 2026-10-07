import { NextRequest, NextResponse } from 'next/server';
import { getSesionUsuario } from '@/app/helpers';
import { getPresentacion } from '@/app/datos';
import { buildDeckHtml } from '@/lib/deck';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const usuario = await getSesionUsuario();
  if (!usuario) {
    return new NextResponse('No autorizado', { status: 401 });
  }

  const { id } = await params;
  const presentacion = await getPresentacion(id);

  if (!presentacion) {
    return new NextResponse('Presentación no encontrada', { status: 404 });
  }

  const { contenido, configuracion } = presentacion;
  const materiaNombre = configuracion?.materia || 'Materia';
  const temaNombre = configuracion?.tema || 'Tema';
  const estilo = configuracion?.estilo || 'UTN';

  const html = buildDeckHtml(contenido, materiaNombre, temaNombre, estilo);

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8'
    }
  });
}
