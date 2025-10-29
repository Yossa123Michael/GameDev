import { supabase } from './supabaseClient';

export type SubmitResult = { ok: boolean; error?: string; data?: any };

export async function submitScoreDirect(name: string, score: number, mode = 'belajar', duration?: number): Promise<SubmitResult> {
  try {
    const payload: any = { name: name.substring(0, 32), score: Math.round(score), mode };
    if (typeof duration === 'number') payload.duration = Math.round(duration);

    const { data, error } = await supabase.from('scores').insert([payload]);
    if (error) return { ok: false, error: error.message };
    return { ok: true, data };
  } catch (e: any) {
    console.error('submitScoreDirect error', e);
    return { ok: false, error: e?.message || 'unknown' };
  }
}

// Preferred for production: use Edge Function that validates score server-side
export async function submitScoreViaFunction(name: string, score: number, mode = 'belajar', duration?: number): Promise<SubmitResult> {
  try {
    // ensure name length and numeric score
    const body = { name: name.substring(0, 32), score: Math.round(score), mode, duration: typeof duration === 'number' ? Math.round(duration) : undefined };
    // supabase.functions.invoke returns a Response-like object in newer clients
    // Use supabase.functions.invoke if available
    // If not available in your client version, call the HTTP function endpoint directly.
    // Here we attempt supabase.functions.invoke and fall back to fetch if not present.
    const fn: any = (supabase as any).functions;
    if (fn && typeof fn.invoke === 'function') {
      const res = await fn.invoke('submit-score', { body: JSON.stringify(body) });
      if (res && (res as any).status >= 400) {
        const txt = await (res as any).text().catch(() => null);
        return { ok: false, error: txt || 'Function returned error' };
      }
      const json = await (res as any).json().catch(() => null);
      return { ok: true, data: json };
    }

    // Fallback: direct POST to function endpoint (you must replace URL if using this)
    const url = (import.meta.env.VITE_SUPABASE_URL as string) + '/functions/v1/submit-score';
    const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${anon}` },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const txt = await response.text().catch(() => null);
      return { ok: false, error: txt || `HTTP ${response.status}` };
    }
    const json = await response.json().catch(() => null);
    return { ok: true, data: json };
  } catch (e: any) {
    console.error('submitScoreViaFunction error', e);
    return { ok: false, error: e?.message || 'unknown' };
  }
}
