export type LangKey = 'id' | 'en';

type Dict = Record<string, string>;

const dicts: Record<LangKey, Dict> = {
  id: {
    optionsTitle: 'Opsi',
    music: 'Musik',
    sfx: 'SFX',
    on: 'Nyala',
    off: 'Mati',
    musicVolume: 'Volume Musik',
    sfxVolume: 'Volume SFX',
    language: 'Bahasa',
    indonesian: 'Indonesia',
    english: 'Inggris',
    vibration: 'Getar',
    version: 'Versi',
    prev: 'Sebelum',
    next: 'Berikut',
    change: 'Ubah',
    resetLocal: 'Reset Progres (Lokal)',
    animation: 'Animasi',

    // Leaderboard (title/header akan dihapus, tapi tetap disediakan bila ingin pakai kembali)
    leaderboardTitle: 'Papan Skor',
    headerRank: 'Peringkat',
    headerName: 'Nama',
    headerScore: 'Skor',

    // Achievement
    achievementTitle: 'Pencapaian',
    achievementSectionStart: 'Memulai',
    achievementSectionScore: 'Skor',
    achievementSectionCombo: 'Kombo',
    achievementSectionCollect: 'Koleksi',

    // Credit
    creditTitle: 'Kredit',
    creditCreator: 'Pembuat',
    creditVisualArtist: 'Seniman Visual',
    creditSoundArtist: 'Seniman Suara',
    creditFont: 'Font',

    // Main Menu & Mode (contoh)
    mainPlay: 'Main',
    mainOptions: 'Opsi',
    mainLeaderboard: 'Papan Skor',
    mainAchievement: 'Pencapaian',
    mainQuit: 'Keluar',
    chooseModeTitle: 'Pilih Mode',
    chooseDifficultyTitle: 'Pilih Kesulitan',
  },
  en: {
    optionsTitle: 'Options',
    music: 'Music',
    sfx: 'SFX',
    on: 'On',
    off: 'Off',
    musicVolume: 'Music Volume',
    sfxVolume: 'SFX Volume',
    language: 'Language',
    indonesian: 'Indonesian',
    english: 'English',
    vibration: 'Vibration',
    version: 'Version',
    prev: 'Prev',
    next: 'Next',
    change: 'Change',
    resetLocal: 'Reset Progress (Local)',
    animation: 'Animation',

    leaderboardTitle: 'Leaderboard',
    headerRank: 'Rank',
    headerName: 'Name',
    headerScore: 'Score',

    achievementTitle: 'Achievement',
    achievementSectionStart: 'Start',
    achievementSectionScore: 'Score',
    achievementSectionCombo: 'Combo',
    achievementSectionCollect: 'Collection',

    creditTitle: 'Credit',
    creditCreator: 'Creator',
    creditVisualArtist: 'Visual Artist',
    creditSoundArtist: 'Sound Artist',
    creditFont: 'Font',

    mainPlay: 'Play',
    mainOptions: 'Options',
    mainLeaderboard: 'Leaderboard',
    mainAchievement: 'Achievement',
    mainQuit: 'Quit',
    chooseModeTitle: 'Choose Mode',
    chooseDifficultyTitle: 'Choose Difficulty',
  },
};

let currentLang: LangKey = getInitialLang();

function getInitialLang(): LangKey {
  try {
    const raw = localStorage.getItem('rk:lang');
    if (raw === 'id' || raw === 'en') return raw;
  } catch {}
  return 'id';
}

export function setLang(lang: LangKey) {
  currentLang = lang;
  try { localStorage.setItem('rk:lang', lang); } catch {}
}

export function getLang(): LangKey {
  return currentLang;
}

export function t(key: keyof typeof dicts['id']): string {
  const d = dicts[currentLang];
  return d[key] ?? key;
}

export function nextLang(): LangKey {
  return currentLang === 'id' ? 'en' : 'id';
}

// Event helper (opsional): panggil setelah setLang
export function emitLanguageChanged(scene: Phaser.Scene) {
  scene.game.events.emit('lang:changed', getLang());
}
