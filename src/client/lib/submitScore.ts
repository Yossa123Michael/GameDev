import { supabase } from './supabaseClient';

export type SubmitResult = {
  ok: boolean;
  skipped?: boolean;     // true jika tidak mengubah leaderboard
  reason?: string;       // 'not_higher' | 'no_user' | 'error'
  data?: any;
  error?: string;
};

const LS_KEY = 'rk:lastSubmission';

function setLastBestToLocal(user_id: string | null, name: string, score: number, created_at: string) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({ user_id, name, score, created_at }));
  } catch {}
}

export function getLastSubmission() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as { user_id: string | null; name: string; score: number; created_at: string };
  } catch {
    return null;
  }
}

// Tunggu sampai Supabase punya user.id (maks 5 detik)
async function waitForUserId(maxMs = 5000, stepMs = 150): Promise<string | null> {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    try {
      const { data } = await supabase.auth.getUser();
      const uid = (data as any)?.user?.id ?? null;
      if (uid) return uid;
    } catch {}
    await new Promise(r => setTimeout(r, stepMs));
  }
  // last try
  try {
    const { data } = await supabase.auth.getUser();
    const uid = (data as any)?.user?.id ?? null;
    return uid ?? null;
  } catch {
    return null;
  }
}

/**
 * HANYA update leaderboard jika skor baru > best user saat ini.
 * - Jika user_id belum siap (anon auth belum ada), tunggu dulu (maks 5s). Jika tetap null → skip (tidak insert).
 * - Jika skor baru <= best → skip (tidak insert).
 * - LocalStorage lastSubmission hanya di-update ketika new best disimpan.
 */
export async function submitScoreViaFunction(
  name: string,
  score: number,
  mode: string = 'belajar',
  duration?: number
): Promise<SubmitResult> {
  const safeName = String(name ?? '').trim().substring(0, 32) || 'Player';
  const safeScore = Math.round(Number(score ?? 0));
  const safeMode = String(mode ?? 'belajar');

  // Pastikan user_id siap
  let user_id = await waitForUserId();
  if (!user_id) {
    // Tidak ada user_id → jangan insert agar leaderboard tidak “turun”
    return { ok: true, skipped: true, reason: 'no_user' };
  }

  // Cek best saat ini (global; jika mau per-mode, tambahkan .eq('mode', safeMode))
  let currentBest: { score: number; created_at: string } | null = null;
  try {
    const { data: bestRow, error: bestErr } = await supabase
      .from('scores')
      .select('score,created_at')
      .eq('user_id', user_id)
      .order('score', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (!bestErr && bestRow) {
      currentBest = { score: (bestRow as any).score, created_at: (bestRow as any).created_at };
    }
  } catch (e) {
    console.warn('check best failed, proceed cautiously:', e);
  }

  // Jika skor baru tidak lebih besar → SKIP (tidak insert, tidak ubah LS)
  if (currentBest && safeScore <= currentBest.score) {
    return { ok: true, skipped: true, reason: 'not_higher', data: { best: currentBest.score } };
  }

  // Payload insert (new best)
  const payload: any = {
    name: safeName,
    score: safeScore,
    mode: safeMode,
    ...(typeof duration === 'number' ? { duration: Math.round(duration) } : {}),
    user_id
  };

  // 1) Edge Function (jika ada)
  try {
    const { data, error } = await supabase.functions.invoke('submit-score', { body: payload });
    if (!error) {
      const created_at = new Date().toISOString();
      setLastBestToLocal(user_id, safeName, safeScore, created_at);
      return { ok: true, data };
    }
    console.warn('submit-score invoke error:', error);
  } catch (e: any) {
    console.warn('submit-score invoke threw:', e?.message || e);
  }

  // 2) Fallback insert langsung
  try {
    const { data, error } = await supabase
      .from('scores')
      .insert([payload])
      .select('created_at')
      .single();

    if (error) return { ok: false, error: error.message };

    const created_at = (data as any)?.created_at ?? new Date().toISOString();
    setLastBestToLocal(user_id, safeName, safeScore, created_at);

    return { ok: true, data };
  } catch (e: any) {
    return { ok: false, error: e?.message || 'unknown' };
  }
}
