import type { Question } from './questions';

// Kode versi (negara) — bisa ditambah sewaktu-waktu
export type VersionCode = 'global' | 'de' | 'jp';

// Label yang ditampilkan ke user
export const versionLabels: Record<VersionCode, string> = {
  global: 'Global',
  de: 'Jerman',
  jp: 'Jepang',
};

export function formatVersionLabel(v: VersionCode) {
  return versionLabels[v] ?? v;
}

// Fallback normalisasi dari string bebas ke salah satu VersionCode
export function normalizeVersion(v: string | undefined | null): VersionCode {
  if (v === 'de' || v === 'jp' || v === 'global') return v;
  return 'global';
}

// Ambil bank soal global (existing)
import { quizQuestions } from './questions';

// Contoh bank regional (placeholder). Silakan lengkapi/ubah kontennya:
// Catatan: Ini HANYA contoh beberapa butir agar arsitektur jalan, bukan soal final.
const bankDE: Question[] = [
  {
    question: '[DE] Apa arti rambu "Autobahn"?',
    options: ['Jalan Tol', 'Zona 30', 'Area Pejalan Kaki', 'Larangan Parkir'],
    correctAnswerIndex: 0,
    difficulty: 'menengah',
  },
  {
    question: '[DE] Rambu bundar biru panah lurus artinya?',
    options: ['Wajib Lurus', 'Dilarang Lurus', 'Beri Jalan', 'Berhenti'],
    correctAnswerIndex: 0,
    difficulty: 'mudah',
  },
];

const bankJP: Question[] = [
  {
    question: '[JP] Rambu segitiga terbalik merah di Jepang artinya?',
    options: ['Beri Jalan (止まれ/Yield?)', 'Berhenti Total', 'Dilarang Masuk', 'Zona Sekolah'],
    correctAnswerIndex: 0,
    difficulty: 'menengah',
  },
  {
    question: '[JP] Lingkaran merah dengan angka kecepatan (contoh 40) artinya?',
    options: ['Batas Kecepatan 40 km/j', 'Kecepatan Minimum 40', 'Zona 40 Meter', 'Jarak 40 m'],
    correctAnswerIndex: 0,
    difficulty: 'mudah',
  },
];

// Urutan versi yang akan ditampilkan di picker
export const versionsOrder: VersionCode[] = ['global', 'de', 'jp'];

// Ambil bank soal sesuai versi
export function getQuestionsForVersion(v: VersionCode): Question[] {
  switch (v) {
    case 'de': return bankDE.length ? bankDE : quizQuestions; // fallback jika kosong
    case 'jp': return bankJP.length ? bankJP : quizQuestions; // fallback jika kosong
    case 'global':
    default:
      return quizQuestions;
  }
}
