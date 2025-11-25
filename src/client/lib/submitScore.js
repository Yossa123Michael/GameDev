import { supabase } from './supabaseClient';
const LS_KEY_LAST = 'rk:lastSubmission'; // legacy, tetap ada tapi tidak dipakai untuk “You”
const LS_KEY_BEST = 'rk:best'; // device best (angka tertinggi di perangkat ini)
function setLastSubmission(user_id, name, score, created_at) {
    try {
        localStorage.setItem(LS_KEY_LAST, JSON.stringify({ user_id, name, score, created_at }));
    }
    catch { }
}
export function getLastSubmission() {
    try {
        const raw = localStorage.getItem(LS_KEY_LAST);
        return raw ? JSON.parse(raw) : null;
    }
    catch {
        return null;
    }
}
function getDeviceBest() {
    try {
        const raw = localStorage.getItem(LS_KEY_BEST);
        return raw ? Number(raw) : null;
    }
    catch {
        return null;
    }
}
function setDeviceBestIfHigher(score) {
    try {
        const cur = getDeviceBest();
        if (cur == null || score > cur)
            localStorage.setItem(LS_KEY_BEST, String(score));
    }
    catch { }
}
// Tunggu user_id siap (maks 5 detik)
async function waitForUserId(maxMs = 5000, stepMs = 150) {
    const start = Date.now();
    while (Date.now() - start < maxMs) {
        try {
            const { data } = await supabase.auth.getUser();
            const uid = data?.user?.id ?? null;
            if (uid)
                return uid;
        }
        catch { }
        await new Promise(r => setTimeout(r, stepMs));
    }
    try {
        const { data } = await supabase.auth.getUser();
        return data?.user?.id ?? null;
    }
    catch {
        return null;
    }
}
/**
 * Auto-submit skor dengan aturan:
 * - Menunggu user_id; jika tak ada → skip (ok:true, skipped:true, reason:'no_user')
 * - Ambil best user saat ini; jika score <= best → skip (ok:true, skipped:true, reason:'not_higher')
 * - Hanya insert jika score > best. Device best (rk:best) juga hanya naik, tak pernah turun.
 * - lastSubmission disimpan hanya ketika benar-benar menyimpan skor baru (best).
 */
export async function submitScoreViaFunction(name, score, mode = 'belajar', duration) {
    const safeName = String(name ?? '').trim().substring(0, 32) || 'Player';
    const safeScore = Math.round(Number(score ?? 0));
    const safeMode = String(mode ?? 'belajar');
    // Pastikan device best tak pernah turun
    setDeviceBestIfHigher(safeScore);
    // Wajib punya user_id agar “per user” konsisten
    const user_id = await waitForUserId();
    if (!user_id) {
        // Tanpa user, JANGAN insert supaya leaderboard tidak bisa “turun”
        return { ok: true, skipped: true, reason: 'no_user' };
    }
    // Cek best user saat ini
    let currentBest = null;
    try {
        const { data: bestRow } = await supabase
            .from('scores')
            .select('score,created_at')
            .eq('user_id', user_id)
            .order('score', { ascending: false })
            .order('created_at', { ascending: true })
            .limit(1)
            .maybeSingle();
        if (bestRow)
            currentBest = { score: bestRow.score, created_at: bestRow.created_at };
    }
    catch (e) {
        // abaikan error cek best
    }
    // Jika skor tidak lebih tinggi dari best → SKIP
    if (currentBest && safeScore <= currentBest.score) {
        // Perkuat device best dengan nilai best database (untuk jaga agar “You” tak turun)
        setDeviceBestIfHigher(currentBest.score);
        return { ok: true, skipped: true, reason: 'not_higher', data: { best: currentBest.score } };
    }
    // Payload new best
    const payload = {
        name: safeName,
        score: safeScore,
        mode: safeMode,
        ...(typeof duration === 'number' ? { duration: Math.round(duration) } : {}),
        user_id
    };
    // 1) Coba via Edge Function
    try {
        const { data, error } = await supabase.functions.invoke('submit-score', { body: payload });
        if (!error) {
            const created_at = new Date().toISOString();
            setDeviceBestIfHigher(safeScore);
            setLastSubmission(user_id, safeName, safeScore, created_at);
            return { ok: true, data };
        }
    }
    catch { }
    // 2) Fallback insert langsung
    try {
        const { data, error } = await supabase
            .from('scores')
            .insert([payload])
            .select('created_at')
            .single();
        if (error)
            return { ok: false, error: error.message };
        const created_at = data?.created_at ?? new Date().toISOString();
        setDeviceBestIfHigher(safeScore);
        setLastSubmission(user_id, safeName, safeScore, created_at);
        return { ok: true, data };
    }
    catch (e) {
        return { ok: false, error: e?.message || 'unknown' };
    }
}
