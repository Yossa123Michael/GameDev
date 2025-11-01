// @ts-nocheck
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Versi untuk validasi/log
const VERSION = "v5";

// Hindari crash: jangan panggil createClient di top-level.
// Tambah util untuk sanitasi & validasi URL.
function sanitizeUrl(u?: string | null) {
  if (!u) return undefined;
  // trim spasi, hapus kutip di ujung, hilangkan slash di akhir
  const s = u.trim().replace(/^['"]+|['"]+$/g, "").replace(/\/+$/, "");
  return s || undefined;
}

function getEnv() {
  // Prioritas SB_URL → SUPABASE_URL
  const rawUrl = Deno.env.get("SB_URL") ?? Deno.env.get("SUPABASE_URL");
  const url = sanitizeUrl(rawUrl);

  // Prioritas SERVICE_ROLE_KEY → SUPABASE_SERVICE_ROLE_KEY
  const rawKey = Deno.env.get("SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const serviceRole = rawKey?.trim();

  return { url, serviceRole, rawUrl, rawKey };
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });

// Log boot agar mudah cek versi kode yang aktif
console.log("submit-score BOOT", { VERSION });

serve(async (req: Request) => {
  // Health check: GET harus selalu berhasil jika worker tidak crash
  if (req.method === "GET") {
    return json({ ok: true, code: "ALIVE", version: VERSION }, 200);
  }
  if (req.method !== "POST") return json({ error: "Method Not Allowed" }, 405);

  const { url, serviceRole, rawUrl } = getEnv();

  try {
    if (!url || !serviceRole) {
      console.error("MISSING_ENV", { hasUrl: !!url, hasServiceRole: !!serviceRole, rawUrl });
      return json(
        {
          ok: false,
          code: "MISSING_ENV",
          message:
            "Missing SB_URL/SUPABASE_URL or SERVICE_ROLE_KEY/SUPABASE_SERVICE_ROLE_KEY in Edge Function environment.",
        },
        500,
      );
    }
    // Wajib bentuk: https://<ref>.supabase.co
    const re = /^https:\/\/[a-z0-9-]+\.supabase\.co$/;
    if (!re.test(url)) {
      console.error("URL_INVALID", { rawUrl, sanitized: url });
      return json(
        { ok: false, code: "URL_INVALID", message: "SB_URL must be like https://<ref>.supabase.co", sanitized: url },
        500,
      );
    }
    // Pastikan bisa di-parse
    new URL(url);
  } catch (e) {
    console.error("URL_PARSE_ERROR", e);
    return json({ ok: false, code: "URL_PARSE_ERROR", message: String(e) }, 500);
  }

  // Buat client di dalam handler (aman dari crash startup)
  const sb = createClient(url, serviceRole);

  try {
    const body = (await req.json().catch(() => null)) as
      | { name?: string; score?: number; mode?: string; duration?: number }
      | null;

    if (!body || typeof body.name !== "string" || typeof body.score !== "number") {
      return json({ error: "Invalid payload" }, 400);
    }

    const name = body.name.trim().slice(0, 32) || "Anonymous";
    const score = Math.max(0, Math.round(body.score));
    const mode = (body.mode || "belajar").slice(0, 16);
    const duration = typeof body.duration === "number" ? Math.max(0, Math.round(body.duration)) : null;

    // Anti-cheat sederhana
    if (duration !== null) {
      const maxPointsPerSecond = 20;
      const maxAllowed = Math.max(5000, duration * maxPointsPerSecond);
      if (score > maxAllowed) return json({ error: "Score rejected (implausible)" }, 400);
    }

    const { error } = await sb.from("scores").insert([{ name, score, mode, duration }]);
    if (error) {
      console.error("DB_INSERT_FAILED", error);
      return json({ ok: false, code: "DB_INSERT_FAILED", message: error.message }, 500);
    }

    return json({ ok: true, version: VERSION }, 200);
  } catch (e: any) {
    console.error("INTERNAL_ERROR", e?.message || e);
    return json({ ok: false, code: "INTERNAL_ERROR", message: e?.message || "Internal error" }, 500);
  }
});
