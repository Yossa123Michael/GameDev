import type { VersionCode } from '../version';

export type GraphicsQuality = 'normal' | 'low';

export type Settings = {
  musicOn: boolean;
  sfxOn: boolean;
  musicVol: number;  // 0..1
  sfxVol: number;    // 0..1
  graphics: GraphicsQuality;
  language?: string;
  vibration: boolean;
  version: VersionCode;   // CHANGED: was string
  animation?: boolean;
};

const LS_KEY = 'rk:settings';

let current: Settings = {
  musicOn: true,
  sfxOn: true,
  musicVol: 0.8,
  sfxVol: 1,
  graphics: 'normal',
  vibration: true,
  version: 'global',       // default VersionCode
  animation: true,
};

try {
  const raw = localStorage.getItem(LS_KEY);
  if (raw) {
    const parsed = JSON.parse(raw);
    current = { ...current, ...parsed };
  }
} catch {}

type SettingsSubscriber = (s: Settings) => void;
const subs = new Set<SettingsSubscriber>();

export const SettingsManager = {
  get(): Settings {
    return current;
  },

  save(patch: Partial<Settings>) {
    current = { ...current, ...patch };
    try { localStorage.setItem(LS_KEY, JSON.stringify(current)); } catch {}
    subs.forEach(fn => {
      try { fn(current); } catch {}
    });
  },

  reset() {
    current = {
      musicOn: true,
      sfxOn: true,
      musicVol: 0.8,
      sfxVol: 1,
      graphics: 'normal',
      vibration: true,
      version: 'global',
      animation: true,
    };
    try { localStorage.setItem(LS_KEY, JSON.stringify(current)); } catch {}
    subs.forEach(fn => {
      try { fn(current); } catch {}
    });
  },

  subscribe(fn: SettingsSubscriber): () => void {
    subs.add(fn);
    return () => { try { subs.delete(fn); } catch {} };
  },
};

export function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}
