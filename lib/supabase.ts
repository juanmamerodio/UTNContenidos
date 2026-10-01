/**
 * lib/supabase.ts — Clientes de Supabase (Beta)
 *  - getServiceClient(): cliente con service role (solo server-side, NUNCA en el navegador)
 *  - getPublicClient(): cliente anon (auth del navegador)
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL || '';
const serviceKey = process.env.SUPABASE_SERVICE_KEY || '';
const anonKey = process.env.SUPABASE_ANON_KEY || '';

let serviceClient: SupabaseClient | null = null;
let publicClient: SupabaseClient | null = null;

export function getServiceClient(): SupabaseClient {
  if (!serviceClient) {
    serviceClient = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
  }
  return serviceClient;
}

export function getPublicClient(): SupabaseClient {
  if (!publicClient) {
    publicClient = createClient(url, anonKey, {
      auth: { persistSession: true }
    });
  }
  return publicClient;
}

export const SUPABASE_URL = url;