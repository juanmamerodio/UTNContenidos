/**
 * app/api/health/route.ts — Healthcheck + keep-alive de Supabase free tier.
 * Llamado por Vercel Cron (ver vercel.json) cada 5 minutos.
 */
import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';

export async function GET() {
  const start = Date.now();
  try {
    const sb = getServiceClient();
    const { error } = await sb.from('materias').select('id').limit(1);
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, ms: Date.now() - start, ts: new Date().toISOString() });
  } catch (e) {
    return NextResponse.json({ success: false, error: (e as Error).message }, { status: 500 });
  }
}