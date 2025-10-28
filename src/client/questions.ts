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
    options: ['Kendaraan dari arah kanan', 'Kendaraan yang lebih besar', 'Kendaraan yang melaju lebih cepat', 'Kendaraan dari arah kiri'],
    correctAnswerIndex: 0,
    difficulty: 'menengah',
  },
  {
    question: 'Lampu kuning pada traffic light berarti...',
    options: ['Jalan terus', 'Langsung berhenti', 'Bersiap-siap untuk berhenti', 'Boleh berbelok'],
    correctAnswerIndex: 2,
    difficulty: 'mudah',
  },
  {
    question: 'Apa arti dari lampu lalu lintas berwarna merah?',
    options: ['Jalan terus', 'Langsung berhenti', 'Bersiap-siap untuk berhenti', 'Boleh berbelok'],
    correctAnswerIndex: 2,
    difficulty: 'mudah',
  },
  {
    question: 'Apa yang wajib Anda lakukan? (Segi delapan merah tulusan "stop")',
    options: ['Hanya melambat dan melihat keadaan', 'Berhenti total, kemudian melanjutkan perjalanan jika sudah aman', 'Membunyikan klakson untuk memberi peringatan', 'Mengebut'],
    correctAnswerIndex: 1,
    difficulty: 'mudah',
  },
  {
    question: 'Saat mendekati "zebra cross" dan ada pejalan kaki yang jelas-jelas menunggu untuk menyeberang, apa tindakan yang benar?',
    options: ['Menambah kecepatan agar cepat lewat', 'Membunyikan klakson agar pejalan kaki tidak jadi menyeberang', 'Melambat dan berhenti untuk memberikan jalan kepada pejalan kaki', 'Menyempatkan nyalip kendaraan di depan'],
    correctAnswerIndex: 2,
    difficulty: 'mudah',
  },
  {
    question: 'Rambu ini berarti (rambu larangan masuk yang berlaku untuk semua jenis kendaraan dari arah tersebut.)',
    options: ['Jalan satu arah', 'Dilarang masuk bagi semua kendaraan', 'Area parkir', 'Boleh berbelok'],
    correctAnswerIndex: 1,
    difficulty: 'mudah',
  },
  {
    question: 'Apa arti rambu ini? (rambu segitiga terbalik dengan tepi merah)',
    options: ['Wajib berhenti total', 'Beri prioritas (beri jalan) kepada lalu lintas di jalan yang akan Anda masuki', 'Peringatan ada persimpangan berbahaya di depan', 'Area parkir'],
    correctAnswerIndex: 1,
    difficulty: 'sulit',
  },
  {
    question: 'Apa arti dari rambu ini? (Segi delapan merah)',
    options: ['Dilarang Masuk', 'Berhenti', 'Wajib Belok Kiri', 'Hati-hati'],
    correctAnswerIndex: 1,
    difficulty: 'mudah',
  },
  {
    question: 'Di persimpangan tanpa lampu, siapa yang didahulukan?',
    options: ['Kendaraan dari arah kanan', 'Kendaraan yang lebih besar', 'Kendaraan yang melaju lebih cepat', 'Kendaraan dari arah kiri'],
    correctAnswerIndex: 0,
    difficulty: 'menengah',
  },
  {
    question: 'Lampu kuning pada traffic light berarti...',
    options: ['Jalan terus', 'Langsung berhenti', 'Bersiap-siap untuk berhenti', 'Boleh berbelok'],
    correctAnswerIndex: 2,
    difficulty: 'mudah',
  },
  {
    question: 'Apa arti dari lampu lalu lintas berwarna merah?',
    options: ['Jalan terus', 'Langsung berhenti', 'Bersiap-siap untuk berhenti', 'Boleh berbelok'],
    correctAnswerIndex: 2,
    difficulty: 'mudah',
  },
  {
    question: 'Apa yang wajib Anda lakukan? (Segi delapan merah tulusan "stop")',
    options: ['Hanya melambat dan melihat keadaan', 'Berhenti total, kemudian melanjutkan perjalanan jika sudah aman', 'Membunyikan klakson untuk memberi peringatan', 'Mengebut'],
    correctAnswerIndex: 1,
    difficulty: 'mudah',
  },
  {
    question: 'Saat mendekati "zebra cross" dan ada pejalan kaki yang jelas-jelas menunggu untuk menyeberang, apa tindakan yang benar?',
    options: ['Menambah kecepatan agar cepat lewat', 'Membunyikan klakson agar pejalan kaki tidak jadi menyeberang', 'Melambat dan berhenti untuk memberikan jalan kepada pejalan kaki', 'Menyempatkan nyalip kendaraan di depan'],
    correctAnswerIndex: 2,
    difficulty: 'mudah',
  },
  {
    question: 'Rambu ini berarti (rambu larangan masuk yang berlaku untuk semua jenis kendaraan dari arah tersebut.)',
    options: ['Jalan satu arah', 'Dilarang masuk bagi semua kendaraan', 'Area parkir', 'Boleh berbelok'],
    correctAnswerIndex: 1,
    difficulty: 'mudah',
  },
  {
    question: 'Apa arti rambu ini? (rambu segitiga terbalik dengan tepi merah)',
    options: ['Wajib berhenti total', 'Beri prioritas (beri jalan) kepada lalu lintas di jalan yang akan Anda masuki', 'Peringatan ada persimpangan berbahaya di depan', 'Area parkir'],
    correctAnswerIndex: 1,
    difficulty: 'sulit',
  },
  // 58
];
