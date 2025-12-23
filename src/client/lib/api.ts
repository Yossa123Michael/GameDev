import { createClient, SupabaseClient } from '@supabase/supabase-js';

export type CurrentUser = {
  id: string;
  redditUsername: string;
};

export type LeaderboardEntry = {
  id: string;
  redditUsername: string;
  score: number;
  mode: 'belajar' | 'survive';
  duration: number;
  createdAt: string;
};

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

let supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (!supabase) {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error('Supabase env not set');
    }
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return supabase;
}

/**
 * Untuk sekarang kita belum punya OAuth Reddit,
 * jadi kita kembalikan user dummy. Nanti, kalau kamu
 * sudah punya username Reddit di luar game, tinggal
 * ganti implementasi ini.
 */
export async function getCurrentUser(): Promise<CurrentUser> {
  // TODO: ganti dengan real reddit username
  return { id: 'demo', redditUsername: 'DemoUser' };
}

export async function submitScore(params: {
  user: CurrentUser;
  score: number;
  mode: 'belajar' | 'survive';
  duration: number;
}) {
  const client = getSupabase();

  const { error } = await client.from('leaderboard').insert({
    reddit_username: params.user.redditUsername,
    score: Math.round(params.score),
    mode: params.mode,
    duration: params.duration,
  });

  if (error) {
    console.error('submitScore supabase error', error);
    throw error;
  }
}

export async function fetchLeaderboard(
  mode: 'belajar' | 'survive' | 'all' = 'all',
): Promise<LeaderboardEntry[]> {
  const client = getSupabase();

  let query = client
    .from('leaderboard')
    .select('id, reddit_username, score, mode, duration, created_at')
    .order('score', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(20);

  if (mode !== 'all') {
    query = query.eq('mode', mode);
  }

  const { data, error } = await query;
  if (error) {
    console.error('fetchLeaderboard supabase error', error);
    throw error;
  }

  return (data ?? []).map((row: any) => ({
    id: row.id,
    redditUsername: row.reddit_username,
    score: row.score,
    mode: row.mode,
    duration: row.duration,
    createdAt: row.created_at,
  }));
}
