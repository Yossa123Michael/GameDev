// Edge Function: submit-score (Deno)
/// <reference lib="deno.ns" />
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders: HeadersInit = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

function json(body: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers ?? {});
  for (const [k, v] of Object.entries(corsHeaders)) headers.set(k, v as string);
  headers.set("Content-Type", "application/json; charset=utf-8");
  return new Response(JSON.stringify(body), { ...init, headers });
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method === "GET") return json({ ok: true, code: "ALIVE", version: "v7" });
  if (req.method !== "POST") return json({ ok: false, error: "Method Not Allowed" }, { status: 405 });

  const SB_URL = Deno.env.get("SB_URL");
  const SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY");
  if (!SB_URL || !SERVICE_ROLE_KEY) return json({ ok: false, error: "MISSING_ENV" }, { status: 500 });

  let payload: any;
  try { payload = await req.json(); } catch { return json({ ok: false, error: "INVALID_JSON" }, { status: 400 }); }

  const name = String(payload?.name ?? "").trim().substring(0, 32);
  const score = Number.isFinite(payload?.score) ? Math.round(payload.score) : NaN;
  const mode = String(payload?.mode ?? "belajar");
  const duration = Number.isFinite(payload?.duration) ? Math.round(payload.duration) : null;
  const user_id = typeof payload?.user_id === "string" ? payload.user_id : null;

  if (!name || !Number.isFinite(score)) return json({ ok: false, error: "INVALID_INPUT" }, { status: 400 });

  try {
    const supabase = createClient(SB_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });
    const row: Record<string, unknown> = { name, score, mode };
    if (typeof duration === "number") row.duration = duration;
    if (user_id) row.user_id = user_id;

    const { data, error } = await supabase.from("scores").insert(row).select("id").single();
    if (error) {
      console.error("DB insert error", error);
      return json({ ok: false, error: "DB_INSERT_FAILED" }, { status: 500 });
    }
    return json({ ok: true, id: data?.id ?? null, version: "v7" });
  } catch (e) {
    console.error("Unhandled error", e);
    return json({ ok: false, error: "UNEXPECTED" }, { status: 500 });
  }
});
