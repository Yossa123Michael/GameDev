export type GraphicsQuality = 'normal' | 'low';
export type LanguageCode = 'en' | 'id';

import { VersionCode, normalizeVersion } from '../versions';

export type Settings = {
  musicOn: boolean;
  sfxOn: boolean;
  musicVol: number; // 0..1
  sfxVol: number;   // 0..1
  graphics: GraphicsQuality;
  language: LanguageCode;
  vibration: boolean;
  version: VersionCode; // 'global' | 'id' | 'de' | 'jp' | ...
};

const LS_KEY = 'rk:settings';

const DEFAULTS: Settings = {
  musicOn: true,
  sfxOn: true,
  musicVol: 0.8,
  sfxVol: 1.0,
  graphics: 'normal',
  language: 'en',
  vibration: true,
  version: 'global',
};

export function clamp01(x: number) {
  if (Number.isNaN(x)) return 0;
  if (x < 0) return 0;
  if (x > 1) return 1;
  return x;
}

export class SettingsManager {
  private static cache: Settings | undefined;
  private static subs = new Set<(s: Settings) => void>();

  static get(): Settings {
    if (this.cache) return this.cache;
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) {
        this.cache = { ...DEFAULTS };
        return this.cache;
      }
      const parsed = JSON.parse(raw) as Partial<Settings>;
      const merged: Settings = {
        ...DEFAULTS,
        ...parsed,
        musicVol: clamp01(parsed.musicVol ?? DEFAULTS.musicVol),
        sfxVol: clamp01(parsed.sfxVol ?? DEFAULTS.sfxVol),
        version: normalizeVersion((parsed as any).version),
      };
      this.cache = merged;
      return merged;
    } catch {
      this.cache = { ...DEFAULTS };
      return this.cache;
    }
  }

  static save(next: Partial<Settings>) {
    const cur = this.get();
    const merged: Settings = {
      ...cur,
      ...next,
      musicVol: clamp01(next.musicVol ?? cur.musicVol),
      sfxVol: clamp01(next.sfxVol ?? cur.sfxVol),
      version: normalizeVersion((next as any).version ?? cur.version),
    };
    try { localStorage.setItem(LS_KEY, JSON.stringify(merged)); } catch {}
    this.cache = merged;
    // notify
    for (const fn of Array.from(this.subs)) {
      try { fn(merged); } catch {}
    }
  }

  static subscribe(fn: (s: Settings) => void) {
    this.subs.add(fn);
    return () => this.subs.delete(fn);
  }

  static reset() {
    try { localStorage.removeItem(LS_KEY); } catch {}
    this.cache = { ...DEFAULTS };
    for (const fn of Array.from(this.subs)) {
      try { fn(this.cache); } catch {}
    }
  }
}
