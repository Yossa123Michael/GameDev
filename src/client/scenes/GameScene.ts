import Phaser from 'phaser';
// Jalur import ini sudah benar untuk struktur folder Anda
import { quizQuestions, Question } from '../questions';

// Tipe data untuk menyimpan pengaturan level
type DifficultySettings = {
  [key: string]: {
    totalQuestions: number;
    totalTime: number; // dalam detik
    mix: {
      mudah: number;
      menengah: number;
      sulit: number;
      pro: number;
    };
  };
};

export class Game extends Phaser.Scene {
  // Pengaturan untuk setiap level
  private difficultySettings: DifficultySettings = {
    mudah: {
      totalQuestions: 20,
      totalTime: 180, // 3 menit
      mix: { mudah: 0.9, menengah: 0.1, sulit: 0.0, pro: 0.0 },
    },
    menengah: {
      totalQuestions: 30,
      totalTime: 300, // 5 menit (asumsi)
      mix: { mudah: 0.3, menengah: 0.5, sulit: 0.2, pro: 0.0 },
    },
    sulit: {
      totalQuestions: 30,
      totalTime: 300, // 5 menit (asumsi)
      mix: { mudah: 0.1, menengah: 0.3, sulit: 0.5, pro: 0.1 },
    },
    pro: {
      totalQuestions: 30,
      totalTime: 240, // 4 menit (asumsi, lebih sulit)
      mix: { mudah: 0.0, menengah: 0.1, sulit: 0.4, pro: 0.5 },
    },
  };

  private mode!: string;
  private difficulty!: string;

  private questions: Question[] = [];
  private currentQuestionIndex: number = 0;
  private score: number = 0;
  private lives: number = 0;

  private timerEvent!: Phaser.Time.TimerEvent;
  private remainingTime: number = 0;
  private timerText!: Phaser.GameObjects.Text;

  private questionText!: Phaser.GameObjects.Text;
  private optionButtons: Phaser.GameObjects.Container[] = [];
  private feedbackText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private livesText!: Phaser.GameObjects.Text;

  constructor() {
    super('GameScene');
  }

  init(data: { mode: string; difficulty: string }) {
    this.mode = data.mode;
    this.difficulty = data.difficulty;
  }

  create() {
    this.cameras.main.setBackgroundColor('#ffffff');

    // 1. Ambil pengaturan untuk level ini
    const settings = this.difficultySettings[this.difficulty];
    if (!settings) {
      console.error('Pengaturan kesulitan tidak ditemukan!');
      this.scene.start('MainMenuScene');
      return;
    }

    // 2. Pilih pertanyaan berdasarkan campuran kesulitan
    this.questions = this.selectQuestions(this.difficulty);

    // Jika tidak ada cukup soal di bank soal, kembali
    if (this.questions.length < settings.totalQuestions) {
      alert(
        `Error: Bank soal tidak cukup untuk level ${this.difficulty}.\nButuh: ${settings.totalQuestions}, Tersedia: ${this.questions.length}`
      );
      this.scene.start('MainMenuScene');
      return;
    }

    this.currentQuestionIndex = 0;
    this.score = 0;
    this.remainingTime = settings.totalTime;

    // Atur game berdasarkan Mode
    if (this.mode === 'survive') {
      this.lives = 3;
    } else {
      this.lives = 99; // Nyawa "tak terbatas" untuk mode belajar
    }

    // Tampilkan UI (Skor, Waktu)
    this.scoreText = this.add.text(50, 50, `Skor: ${this.score}`, {
      fontSize: '24px',
      color: '#000',
    });
    this.timerText = this.add
      .text(this.scale.width / 2, 50, `Waktu: ${this.remainingTime}`, {
        fontSize: '24px',
        color: '#000',
      })
      .setOrigin(0.5);

    if (this.mode === 'survive') {
      this.livesText = this.add.text(
        this.scale.width - 150,
        50,
        `Nyawa: ${this.lives}`,
        { fontSize: '24px', color: '#000' }
      );
    }

    // Teks Pertanyaan
    this.questionText = this.add
      .text(this.scale.width / 2, 150, '', {
        fontSize: '32px',
        color: '#000',
        align: 'center',
        wordWrap: { width: this.scale.width - 100 },
      })
      .setOrigin(0.5);

    this.feedbackText = this.add
      .text(this.scale.width / 2, 520, '', {
        fontSize: '28px',
        color: '#000',
      })
      .setOrigin(0.5);

    // Timer
    this.timerEvent = this.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true,
    });

    this.displayQuestion();
  }

  /**
   * Fungsi BARU: Memilih pertanyaan secara acak sesuai campuran kesulitan
   */
  selectQuestions(difficulty: string): Question[] {
    const settings = this.difficultySettings[difficulty];

    // TAMBAHKAN BLOK INI
    if (!settings) {
      console.error(`Pengaturan untuk ${difficulty} tidak ada!`);
      return []; // Kembalikan array kosong
    }

    // Pisahkan bank soal berdasarkan kesulitan
    const easyPool = this.shuffleArray(
      quizQuestions.filter((q: Question) => q.difficulty === 'mudah')
    );
    const mediumPool = this.shuffleArray(
      quizQuestions.filter((q: Question) => q.difficulty === 'menengah')
    );
    const hardPool = this.shuffleArray(
      quizQuestions.filter((q: Question) => q.difficulty === 'sulit')
    );
    const proPool = this.shuffleArray(
      quizQuestions.filter((q: Question) => q.difficulty === 'pro')
    );
    
    // ===============================================
    // ========= PERBAIKAN 1: TAMBAHKAN BARIS INI =========
    let finalQuestions: Question[] = [];
    // ===============================================

    // Hitung jumlah soal dari tiap pool
    const easyCount = Math.round(settings.totalQuestions * settings.mix.mudah);
    const mediumCount = Math.round(
      settings.totalQuestions * settings.mix.menengah
    );
    const hardCount = Math.round(settings.totalQuestions * settings.mix.sulit);
    const proCount = Math.round(settings.totalQuestions * settings.mix.pro);

    // Ambil soal dari pool
    finalQuestions = finalQuestions.concat(easyPool.slice(0, easyCount));
    finalQuestions = finalQuestions.concat(mediumPool.slice(0, mediumCount));
    finalQuestions = finalQuestions.concat(hardPool.slice(0, hardCount));
    finalQuestions = finalQuestions.concat(proPool.slice(0, proCount));

    // Pastikan jumlahnya pas (jika ada pembulatan)
    const remainingMediumPool = mediumPool.slice(mediumCount);
    
    // Pastikan jumlahnya pas (jika ada pembulatan)
    while (
      finalQuestions.length < settings.totalQuestions &&
      remainingMediumPool.length > 0
    ) {
      // Ambil dari sisa pool dan pastikan tidak undefined
      const extraQuestion = remainingMediumPool.pop();
      if (extraQuestion) {
        finalQuestions.push(extraQuestion);
      }
    }

    // Acak urutan terakhir dari semua soal yang dipilih
    return this.shuffleArray(finalQuestions).slice(0, settings.totalQuestions);
  }

  updateTimer() {
    this.remainingTime--;
    this.timerText.setText(`Waktu: ${this.remainingTime}`);

    if (this.remainingTime <= 0) {
      this.timerEvent.remove();
      this.gameOver();
    }
  }

  displayQuestion() {
    this.optionButtons.forEach(button => button.destroy());
    this.optionButtons = [];
    this.feedbackText.setText('');

    const currentQuestion = this.questions[this.currentQuestionIndex];

    // --- TAMBAHKAN PENGECEKAN INI ---
    if (!currentQuestion) {
      console.error('Pertanyaan tidak ditemukan, mengakhiri game.');
      this.gameOver();
      return;
    }
    // --- AKHIR PENGECEKAN ---

    this.questionText.setText(currentQuestion.question);

    const buttonLabels = ['A', 'B', 'C', 'D']; // Sesuai wireframe

    // LOGIKA ACAK JAWABAN
    // 1. Dapatkan teks jawaban yang benar
    const correctAnswerText =
      currentQuestion.options[currentQuestion.correctAnswerIndex];

    // 2. Buat array baru dari pilihan dan acak
    const shuffledOptions = this.shuffleArray([...currentQuestion.options]);

    let startY = 250;

    // 3. Buat tombol berdasarkan urutan yang sudah diacak
    shuffledOptions.forEach((optionText, index) => {
      const buttonLabel = `${buttonLabels[index]}. ${optionText}`;
      const button = this.createButton(
        startY,
        buttonLabel,
        optionText, // Kirim teks asli sebagai data
        correctAnswerText // Kirim teks jawaban benar sebagai data
      );
      this.optionButtons.push(button);
      startY += 70;
    });
  }

  createButton(
    y: number,
    labelText: string,
    optionText: string,
    correctAnswerText: string
  ): Phaser.GameObjects.Container {
    const buttonWidth = this.scale.width * 0.9;
    const buttonHeight = 60;

    const buttonRect = this.add
      .rectangle(0, 0, buttonWidth, buttonHeight)
      .setFillStyle(0xffffff)
      .setStrokeStyle(2, 0x000000);

    const buttonText = this.add
      .text(0, 0, labelText, {
        fontSize: '20px',
        color: '#000000',
        align: 'left',
        wordWrap: { width: buttonWidth - 40 },
      })
      .setOrigin(0.5);

    const container = this.add.container(this.scale.width / 2, y, [
      buttonRect,
      buttonText,
    ]);
    container.setSize(buttonWidth, buttonHeight);
    container.setInteractive({ useHandCursor: true });

    // Simpan data di dalam container
    container.setData('optionText', optionText);
    container.setData('correctAnswerText', correctAnswerText);

    container.on('pointerdown', () => this.handleAnswer(container));
    container.on('pointerover', () =>
      (buttonRect as Phaser.GameObjects.Rectangle).setFillStyle(0xeeeeee)
    );
    container.on('pointerout', () =>
      (buttonRect as Phaser.GameObjects.Rectangle).setFillStyle(0xffffff)
    );

    return container;
  }

  handleAnswer(selectedButton: Phaser.GameObjects.Container) {
    const selectedOptionText = selectedButton.getData('optionText');
    const correctAnswerText = selectedButton.getData('correctAnswerText');

    const selectedButtonRect =
      selectedButton.getAt(0) as Phaser.GameObjects.Rectangle;

    this.optionButtons.forEach(button => button.removeInteractive());
    this.timerEvent.paused = true;

    if (selectedOptionText === correctAnswerText) {
      // Jawaban Benar
      this.score += 10;
      this.feedbackText.setText('BENAR!').setColor('#4CAF50');
      selectedButtonRect.setFillStyle(0x4CAF50);
    } else {
      // Jawaban Salah
      if (this.mode === 'survive') {
        this.lives -= 1;
        this.livesText.setText(`Nyawa: ${this.lives}`);
      }
      this.feedbackText.setText('SALAH!').setColor('#F44336');
      selectedButtonRect.setFillStyle(0xF44336);

      // Tampilkan jawaban yang benar
      const correctButton = this.optionButtons.find(
        button => button.getData('optionText') === correctAnswerText
      );
      if (correctButton) {
        const correctButtonRect =
          correctButton.getAt(0) as Phaser.GameObjects.Rectangle;
        correctButtonRect.setFillStyle(0x4CAF50);
      }
    }

    this.scoreText.setText(`Skor: ${this.score}`);
    this.time.delayedCall(1500, () => this.nextQuestion());
  }

  nextQuestion() {
    if (this.mode === 'survive' && this.lives <= 0) {
      this.gameOver();
      return;
    }

    this.currentQuestionIndex++;
    if (this.currentQuestionIndex >= this.questions.length) {
      this.gameOver();
      return;
    }

    this.timerEvent.paused = false;
    this.displayQuestion();
  }

  gameOver() {
    this.timerEvent.remove();
    // Kirim skor ke server Devvit (langkah selanjutnya)
    // context.ui.send('submit-score', { score: this.score, difficulty: this.difficulty, mode: this.mode });

    this.scene.start('ResultsScene', { score: this.score });
  }
  
  // =========================================================
  // ========= PERBAIKAN 2: GANTI FUNGSI SHUFFLEARRAY =========
  private shuffleArray<T>(array: T[]): T[] {
  let currentIndex = array.length,
    randomIndex;

  // Selama masih ada elemen untuk diacak
  while (currentIndex != 0) {
    // Ambil elemen yang tersisa
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // Dan tukar dengan elemen saat ini (menggunakan 'temp')
    const temp = array[currentIndex];
    array[currentIndex] = array[randomIndex]!;
    array[randomIndex] = temp!;
  }

  return array;
}
  // =========================================================
}
