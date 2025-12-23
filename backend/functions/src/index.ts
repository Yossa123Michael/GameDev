import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as cors from 'cors';

admin.initializeApp();
const db = admin.firestore();

// Untuk development kita izinkan semua origin dulu.
// Nanti kalau sudah fix, bisa dibatasi ke domain game kamu saja.
const corsHandler = cors({ origin: true });

type Mode = 'belajar' | 'survive';

type LeaderboardEntry = {
  id: string;
  userId: string;
  redditUsername: string;
  score: number;
  mode: Mode;
  duration: number;
  createdAt: FirebaseFirestore.Timestamp;
};

// --------------------------
// Helper user (sementara dummy)
// --------------------------
//
// NANTI: fungsi ini diganti baca username dari cookie/token Reddit.
// SEKARANG: baca dari header X-Reddit-Username kalau ada,
// kalau tidak ada pakai "Guest".
function getUserFromRequest(req: functions.https.Request) {
  const headerName = 'x-reddit-username';
  const redditUsername =
    (req.headers[headerName] as string | undefined) ||
    (req.headers[headerName.toUpperCase()] as string | undefined);

  if (redditUsername) {
    return { id: redditUsername, redditUsername };
  }

  return { id: 'guest', redditUsername: 'Guest' };
}

// --------------------------
// POST /submitScore
// --------------------------
export const submitScore = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== 'POST') {
      res.status(405).send('Method not allowed');
      return;
    }

    try {
      const user = getUserFromRequest(req);
      const { score, mode, duration } = req.body ?? {};

      if (typeof score !== 'number' || typeof duration !== 'number' ||
          (mode !== 'belajar' && mode !== 'survive')) {
        res.status(400).json({ error: 'Invalid payload' });
        return;
      }

      const docRef = await db.collection('leaderboard').add({
        userId: user.id,
        redditUsername: user.redditUsername,
        score,
        mode,
        duration,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      res.status(201).json({ id: docRef.id });
    } catch (err) {
      console.error('submitScore error', err);
      res.status(500).json({ error: 'Internal error' });
    }
  });
});

// --------------------------
// GET /getLeaderboard
// --------------------------
export const getLeaderboard = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== 'GET') {
      res.status(405).send('Method not allowed');
      return;
    }

    try {
      const modeParam = req.query.mode as string | undefined;
      const limitParam = req.query.limit as string | undefined;
      const limit = limitParam ? Math.min(parseInt(limitParam, 10) || 20, 100) : 20;

      let query: FirebaseFirestore.Query = db.collection('leaderboard');

      if (modeParam === 'belajar' || modeParam === 'survive') {
        query = query.where('mode', '==', modeParam);
      }

      query = query.orderBy('score', 'desc').orderBy('createdAt', 'asc').limit(limit);

      const snap = await query.get();
      const entries: LeaderboardEntry[] = snap.docs.map((doc) => {
        const data = doc.data() as any;
        return {
          id: doc.id,
          userId: data.userId ?? '',
          redditUsername: data.redditUsername ?? 'Unknown',
          score: data.score ?? 0,
          mode: data.mode ?? 'belajar',
          duration: data.duration ?? 0,
          createdAt: data.createdAt ?? admin.firestore.Timestamp.now(),
        };
      });

      res.json({ entries });
    } catch (err) {
      console.error('getLeaderboard error', err);
      res.status(500).json({ error: 'Internal error' });
    }
  });
});

// --------------------------
// GET /me  (sementara dummy)
// --------------------------
export const me = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    try {
      const user = getUserFromRequest(req);
      res.json({
        id: user.id,
        redditUsername: user.redditUsername,
      });
    } catch (err) {
      console.error('me error', err);
      res.status(500).json({ error: 'Internal error' });
    }
  });
});
