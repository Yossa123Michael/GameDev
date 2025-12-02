// i18n sederhana: simpan bahasa di localStorage, sediakan dictionary, dan helper t()

export type LangKey = 'id' | 'en';

type Dict = Record<string, string>;

const dicts: Record<LangKey, Dict> = {
  id: {
    leaderboardTitle: 'Leaderboard',
    headerRank: 'Peringkat',
    headerName: 'Nama',
    headerScore: 'Skor Tertinggi',
    you: 'Anda',
    noData: 'Tidak ada data',
    mainMenu: 'Menu Utama',
    language: 'Bahasa',
    english: 'Inggris',
    indonesian: 'Indonesia',
  },
  en: {
    leaderboardTitle: 'Leaderboard',
    headerRank: 'Rank',
    headerName: 'Name',
    headerScore: 'High Score',
    you: 'You',
    noData: 'No data',
    mainMenu: 'Main Menu',
    language: 'Language',
    english: 'English',
    indonesian: 'Indonesian',
  },
};

let currentLang: LangKey = getInitialLang();

function getInitialLang(): LangKey {
  try {
    const raw = localStorage.getItem('rk:lang');
    if (raw === 'id' || raw === 'en') return raw;
  } catch {}
  return 'id'; // default Indonesia
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

// Utility: buat tombol toggle bahasa sederhana
export function nextLang(): LangKey {
  return currentLang === 'id' ? 'en' : 'id';
}
