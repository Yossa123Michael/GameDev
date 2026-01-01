import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabase: SupabaseClient | null = null;

export function getSupabaseClient() {
  if (!supabase) {
    supabase = createClient(
      import.meta.env.VITE_SUPABASE_URL!,
      import.meta.env.VITE_SUPABASE_ANON_KEY!,
    );
  }
  return supabase;
}

// Fungsi yang diharapkan main.ts
export async function ensureAnonAuth() {
  const client = getSupabaseClient();
  const { data, error } = await client.auth.getSession();
  if (error) {
    console.error('Supabase getSession error', error);
  }
  // kalau tidak ada session, biarkan Supabase pakai anon key default
  return data;
}
