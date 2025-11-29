import { normalizeVersion } from '../version';
const LS_KEY = 'rk:settings';
const DEFAULTS = {
    musicOn: true,
    sfxOn: true,
    musicVol: 0.8,
    sfxVol: 1.0,
    graphics: 'normal',
    language: 'en',
    vibration: true,
    version: 'global',
};
export function clamp01(x) {
    if (Number.isNaN(x))
        return 0;
    if (x < 0)
        return 0;
    if (x > 1)
        return 1;
    return x;
}
export class SettingsManager {
    static get() {
        if (this.cache)
            return this.cache;
        try {
            const raw = localStorage.getItem(LS_KEY);
            if (!raw) {
                this.cache = { ...DEFAULTS };
                return this.cache;
            }
            const parsed = JSON.parse(raw);
            const merged = {
                ...DEFAULTS,
                ...parsed,
                musicVol: clamp01(parsed.musicVol ?? DEFAULTS.musicVol),
                sfxVol: clamp01(parsed.sfxVol ?? DEFAULTS.sfxVol),
                version: normalizeVersion(parsed.version),
            };
            this.cache = merged;
            return merged;
        }
        catch {
            this.cache = { ...DEFAULTS };
            return this.cache;
        }
    }
    static save(next) {
        const cur = this.get();
        const merged = {
            ...cur,
            ...next,
            musicVol: clamp01(next.musicVol ?? cur.musicVol),
            sfxVol: clamp01(next.sfxVol ?? cur.sfxVol),
            version: normalizeVersion(next.version ?? cur.version),
        };
        try {
            localStorage.setItem(LS_KEY, JSON.stringify(merged));
        }
        catch { }
        this.cache = merged;
        // notify
        for (const fn of Array.from(this.subs)) {
            try {
                fn(merged);
            }
            catch { }
        }
    }
    static subscribe(fn) {
        this.subs.add(fn);
        return () => this.subs.delete(fn);
    }
    static reset() {
        try {
            localStorage.removeItem(LS_KEY);
        }
        catch { }
        this.cache = { ...DEFAULTS };
        for (const fn of Array.from(this.subs)) {
            try {
                fn(this.cache);
            }
            catch { }
        }
    }
}
SettingsManager.subs = new Set();
