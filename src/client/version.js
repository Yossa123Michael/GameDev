// Label yang ditampilkan ke user
export const versionLabels = {
    global: 'Global',
    id: 'Indonesia',
    de: 'Jerman',
    jp: 'Jepang',
};
export function formatVersionLabel(v) {
    return versionLabels[v] ?? v;
}
// Normalisasi string bebas ke salah satu VersionCode yang valid
export function normalizeVersion(v) {
    if (v === 'global' || v === 'id' || v === 'de' || v === 'jp')
        return v;
    return 'global';
}
// Ambil bank soal global (existing)
import { quizQuestions } from './questions';
// Contoh bank regional (placeholder). Silakan lengkapi/ubah kontennya.
// Indonesia
const bankID = [
    {
        question: '[ID] Rambu segi delapan merah bertuliskan "STOP" artinya?',
        options: ['Beri Jalan', 'Berhenti', 'Dilarang Masuk', 'Hati-hati'],
        correctAnswerIndex: 1,
        difficulty: 'mudah',
    },
    {
        question: '[ID] Rambu lingkaran merah dengan garis putih horizontal berlaku untuk?',
        options: ['Semua kendaraan dari arah tersebut', 'Hanya mobil', 'Hanya motor', 'Hanya bus'],
        correctAnswerIndex: 0,
        difficulty: 'mudah',
    },
    {
        question: '[ID] Marka "Zebra Cross" menandakan?',
        options: ['Area parkir', 'Penyeberangan pejalan kaki', 'Awal jalan tol', 'Jalan rusak'],
        correctAnswerIndex: 1,
        difficulty: 'mudah',
    },
];
// Jerman
const bankDE = [
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
// Jepang
const bankJP = [
    {
        question: '[JP] Rambu segitiga terbalik merah di Jepang artinya?',
        options: ['Beri Jalan', 'Berhenti Total', 'Dilarang Masuk', 'Zona Sekolah'],
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
// Urutan versi yang ditampilkan di picker
export const versionsOrder = ['global', 'id', 'de', 'jp'];
// Ambil bank soal sesuai versi
export function getQuestionsForVersion(v) {
    switch (v) {
        case 'id': return bankID.length ? bankID : quizQuestions;
        case 'de': return bankDE.length ? bankDE : quizQuestions;
        case 'jp': return bankJP.length ? bankJP : quizQuestions;
        case 'global':
        default:
            return quizQuestions;
    }
}
