// Memanggil Edge Function submit-score dari frontend
export async function submitScoreViaFunction(
  name: string,
  score: number,
  mode: string,
  duration?: number
): Promise<{ ok: boolean; version?: string; error?: string }> {
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/submit-score`;
  const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${anon}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, score, mode, duration }),
  });

  // Coba parse JSON; bila gagal, balikan pesan generik
  const text = await res.text().catch(() => "");
  let json: any = undefined;
  try { json = text ? JSON.parse(text) : undefined; } catch {}

  if (!res.ok) {
    return { ok: false, error: json?.message || json?.error || `HTTP ${res.status}` };
  }
  return { ok: true, version: json?.version };
}
