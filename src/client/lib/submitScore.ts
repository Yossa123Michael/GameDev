import { supabase } from './supabaseClient';

export type SubmitResult = { ok: boolean; error?: string; data?: any };

export async function submitScoreViaFunction(
  name: string,
  score: number,
  mode: string = 'belajar',
  duration?: number
): Promise<SubmitResult> {
  const payload = {
    name: String(name ?? '').trim().substring(0, 32),
    score: Math.round(Number(score ?? 0)),
    mode: String(mode ?? 'belajar'),
    ...(typeof duration === 'number' ? { duration: Math.round(duration) } : {}),
  };

  // 1) Invoke Edge Function (menyertakan JWT user dari session anon)
  try {
    const { data, error } = await supabase.functions.invoke('submit-score', { body: payload });
    if (!error) return { ok: true, data };
    console.warn('submit-score invoke error:', error);
  } catch (e: any) {
    console.warn('submit-score invoke threw:', e?.message || e);
  }

  // 2) Fallback: insert langsung ke tabel agar fitur tetap jalan
  try {
    const { data, error } = await supabase
      .from('scores')
      .insert([payload])
      .select('*')
      .single();
    if (error) return { ok: false, error: error.message };
    return { ok: true, data };
  } catch (e: any) {
    return { ok: false, error: e?.message || 'unknown' };
  }
}
