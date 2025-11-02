import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('Supabase env vars not set. Set VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY in src/client/.env.local');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Pastikan ada session (login anonim) agar Edge Function yang "Protect with JWT" ON bisa diakses
export async function ensureAnonAuth(): Promise<void> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      const { error } = await supabase.auth.signInAnonymously();
      if (error) {
        console.warn('Anonymous sign-in failed:', error.message);
      } else {
        console.log('Anonymous sign-in success');
      }
    }
  } catch (e: any) {
    console.warn('ensureAnonAuth error:', e?.message || e);
  }
}
