import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let cached: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  return Boolean(url?.trim() && key?.trim());
}

export function getSupabase(): SupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new Error('VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY 未配置');
  }
  if (!cached) {
    const url = import.meta.env.VITE_SUPABASE_URL?.trim() ?? '';
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? '';
    cached = createClient(url, key);
  }
  return cached;
}
