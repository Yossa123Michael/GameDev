export interface Question {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  difficulty: 'mudah' | 'menengah' | 'sulit' | 'pro';
}

// Daftar semua pertanyaan Anda
export const quizQuestions: Question[] = [
  {
    question: 'Apa arti dari rambu ini? (Segi delapan merah)',
    options: ['Dilarang Masuk', 'Berhenti', 'Wajib Belok Kiri', 'Hati-hati'],
    correctAnswerIndex: 1,
    difficulty: 'mudah',
  },
  {
    question: 'Di persimpangan tanpa lampu, siapa yang didahulukan?',
    options: [
      'Kendaraan dari arah kanan',
      'Kendaraan yang lebih besar',
      'Kendaraan yang melaju lebih cepat',
      'Kendaraan dari arah kiri',
    ],
    correctAnswerIndex: 0,
    difficulty: 'menengah',
  },
  {
    question: 'Lampu kuning pada traffic light berarti...',
    options: ['Jalan terus', 'Langsung berhenti', 'Bersiap-siap untuk berhenti', 'Boleh berbelok'],
    correctAnswerIndex: 2,
    difficulty: 'mudah',
  },
  // ... (Tambahkan sisa pertanyaan Anda di sini) ...
];
