// File: src/client/scenes/GameScene.ts
// Hapus import Phaser
import { quizQuestions, Question } from '../questions';
import { BaseScene } from './BaseScene'; // Import BaseScene

// ... (DifficultySettings type tetap sama) ...
type DifficultySettings = {
  [key: string]: {
    totalQuestions: number;
    totalTime: number;
    mix: {
      mudah: number;
      menengah: number;
      sulit: number;
      pro: number;
    };
  };
};

export class Game extends BaseScene { // extends BaseScene
  // ... (Properti private tetap sama) ...
   private difficultySettings: DifficultySettings = {
    mudah: {
      totalQuestions: 20,
      totalTime: 180,
      mix: { mudah: 0.9, menengah: 0.1, sulit: 0.0, pro: 0.0 },
    },
    menengah: {
      totalQuestions: 30,
      totalTime: 300,
      mix: { mudah: 0.3, menengah: 0.5, sulit: 0.2, pro: 0.0 },
    },
    sulit: {
      totalQuestions: 30,
      totalTime: 300,
      mix: { mudah: 0.1, menengah: 0.3, sulit: 0.5, pro: 0.1 },
    },
    pro: {
      totalQuestions: 30,
      totalTime: 240,
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

  // Pisahkan elemen UI agar bisa di-update
  private timerText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private livesText!: Phaser.GameObjects.Text;
  private questionText!: Phaser.GameObjects.Text;
  private optionButtons: Phaser.GameObjects.Container[] = []; // Ubah ke Container
  private feedbackText!: Phaser.GameObjects.Text;


  constructor() {
    super('GameScene');
  }

  init(data: { mode: string; difficulty: string }) {
    this.mode = data.mode;
    this.difficulty = data.difficulty;
  }

  // Tambahkan override
  public override create() {
    const settings = this.difficultySettings[this.difficulty];
    if (!settings) {
      console.error("Invalid difficulty setting:", this.difficulty);
      this.scene.start('PilihKesulitanScene', { mode: this.mode }); // Kembali ke scene sebelumnya
      return;
    }

    this.questions = this.selectQuestions(this.difficulty);
    if (!this.questions || this.questions.length < settings.totalQuestions) {
      alert(`Error: Bank soal tidak cukup untuk kesulitan ${this.difficulty}. Butuh ${settings.totalQuestions}, tersedia ${this.questions?.length || 0}.`);
      this.scene.start('PilihKesulitanScene', { mode: this.mode }); // Kembali
      return;
    }


    this.currentQuestionIndex = 0;
    this.score = 0;
    this.remainingTime = settings.totalTime;
    this.lives = this.mode === 'survive' ? 3 : 99; // 99 dianggap infinite untuk mode belajar

    this.timerEvent = this.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true,
    });

    super.create(); // Panggil create dari BaseScene (background, resize handler)
    // Setel ulang target tombol kembali & tambahkan tombol musik
    super.createCommonButtons('PilihKesulitanScene');
    this.draw(); // Panggil draw untuk elemen scene ini
  }

  // Tambahkan override
  public override draw() {
    super.draw(); // Bersihkan elemen spesifik scene + panggil tombol umum

    const topMargin = this.scale.height * 0.15; // Sedikit turunkan UI atas
    const questionY = this.scale.height * 0.30; // Posisi Y pertanyaan
    let startY = this.scale.height * 0.45; // Posisi Y tombol jawaban pertama
    const buttonSpacing = this.scale.height * 0.12; // Jarak antar tombol jawaban
    const feedbackY = this.scale.height * 0.9; // Posisi Y feedback

    // Score Text [cite: 42]
    this.scoreText = this.add.text(this.scale.width * 0.1, topMargin, `Skor: ${this.score}`, {
      fontSize: '24px',
      color: '#000',
      backgroundColor: '#ffffffcc', // Background semi-transparan
      padding: { x: 5, y: 2 }
    }).setOrigin(0, 0.5);

    // Timer Text [cite: 43]
    this.timerText = this.add.text(this.centerX, topMargin, `Waktu: ${this.remainingTime}`, {
      fontSize: '24px',
      color: '#000',
      backgroundColor: '#ffffffcc',
      padding: { x: 5, y: 2 }
    }).setOrigin(0.5, 0.5);

    // Lives Text (jika mode survive)
    if (this.mode === 'survive') {
      this.livesText = this.add.text(this.scale.width * 0.9, topMargin, `Nyawa: ${this.lives}`, {
        fontSize: '24px',
        color: '#000',
        backgroundColor: '#ffffffcc',
        padding: { x: 5, y: 2 }
      }).setOrigin(1, 0.5);
    }

    // Teks Pertanyaan [cite: 44]
    this.questionText = this.add.text(this.centerX, questionY, '', {
      fontSize: '28px', // Sedikit lebih kecil agar muat
      color: '#000',
      align: 'center',
      wordWrap: { width: this.scale.width * 0.9 },
      backgroundColor: '#ffffffcc',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);

    // Teks Feedback
    this.feedbackText = this.add.text(this.centerX, feedbackY, '', {
      fontSize: '28px',
      color: '#000',
      backgroundColor: '#ffffffcc',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);

    // Hapus tombol jawaban lama sebelum menampilkan yang baru
    this.optionButtons.forEach(button => button.destroy());
    this.optionButtons = [];
    this.feedbackText.setText('');

    const currentQuestion = this.questions[this.currentQuestionIndex];
    if (!currentQuestion) {
      this.gameOver();
      return;
    }

    this.questionText.setText(`(${this.currentQuestionIndex + 1}/${this.questions.length}) ${currentQuestion.question}`);

    // Acak jawaban
    const optionsWithOriginalIndex = currentQuestion.options.map((option, index) => ({ text: option, originalIndex: index }));
    const shuffledOptions = this.shuffleArray(optionsWithOriginalIndex);


    // Buat tombol jawaban baru [cite: 45, 46, 47, 48]
    shuffledOptions.forEach((optionData) => {
      const button = this.createOptionButton(
        startY,
        optionData.text,
        optionData.originalIndex === currentQuestion.correctAnswerIndex // Tandai jika ini jawaban benar
      );
      this.optionButtons.push(button);
      startY += buttonSpacing;
    });
  }


    createOptionButton(y: number, text: string, isCorrect: boolean): Phaser.GameObjects.Container {
        const buttonWidth = this.scale.width * 0.9;
        const buttonHeight = 60;

        const buttonRect = this.add.rectangle(0, 0, buttonWidth, buttonHeight)
            .setFillStyle(0xffffff, 0.9)
            .setStrokeStyle(2, 0x000000);

        const buttonText = this.add.text(20, buttonHeight / 2, text, { // Posisi teks dari kiri
            fontSize: '20px',
            color: '#000000',
            align: 'left',
            wordWrap: { width: buttonWidth - 40 }
        }).setOrigin(0, 0.5); // Origin kiri tengah

        const container = this.add.container(this.centerX - buttonWidth / 2, y - buttonHeight / 2, [buttonRect, buttonText]);
        container.setSize(buttonWidth, buttonHeight);
        container.setInteractive({ useHandCursor: true });
        container.setData('isCorrect', isCorrect); // Simpan status jawaban benar/salah

        container.on('pointerdown', () => this.handleAnswer(container));
        container.on('pointerover', () => (buttonRect as Phaser.GameObjects.Rectangle).setFillStyle(0xeeeeee, 0.9));
        container.on('pointerout', () => (buttonRect as Phaser.GameObjects.Rectangle).setFillStyle(0xffffff, 0.9));

        return container;
    }


    handleAnswer(selectedButton: Phaser.GameObjects.Container) {
        const isCorrect = selectedButton.getData('isCorrect');
        const selectedButtonRect = selectedButton.getAt(0) as Phaser.GameObjects.Rectangle;

        // Nonaktifkan semua tombol & pause timer
        this.optionButtons.forEach(button => button.removeInteractive());
        this.timerEvent.paused = true;

        if (isCorrect) {
            this.score += 10;
            this.feedbackText.setText('BENAR!').setColor('#008000').setBackgroundColor('#90EE90cc'); // Hijau
            selectedButtonRect.setFillStyle(0x90EE90); // Light green fill
        } else {
            if (this.mode === 'survive') {
                this.lives -= 1;
                if (this.livesText) this.livesText.setText(`Nyawa: ${this.lives}`);
            }
            this.feedbackText.setText('SALAH!').setColor('#FF0000').setBackgroundColor('#FFCCCBcc'); // Merah
            selectedButtonRect.setFillStyle(0xFFCCCB); // Light red fill

            // Tandai jawaban yang benar
            const correctButton = this.optionButtons.find(button => button.getData('isCorrect'));
            if (correctButton) {
                const correctRect = correctButton.getAt(0) as Phaser.GameObjects.Rectangle;
                correctRect.setFillStyle(0x90EE90); // Tandai benar dengan hijau muda
            }
        }

        this.scoreText.setText(`Skor: ${this.score}`);

        // Tunggu sejenak sebelum ke pertanyaan berikutnya atau game over
        this.time.delayedCall(1500, () => this.nextQuestion());
    }


  updateTimer() {
    if (this.remainingTime > 0) {
        this.remainingTime--;
        if (this.timerText) { // Pastikan timerText sudah dibuat
            this.timerText.setText(`Waktu: ${this.remainingTime}`);
        }
        if (this.remainingTime <= 10) { // Beri warna merah jika waktu hampir habis
             if (this.timerText) this.timerText.setColor('#FF0000');
        }
    }

    if (this.remainingTime <= 0) {
        this.timerEvent.remove();
        this.gameOver('Waktu Habis!'); // Beri alasan game over
    }
}


  nextQuestion() {
    if (this.mode === 'survive' && this.lives <= 0) {
      this.gameOver('Nyawa Habis!'); // Beri alasan
      return;
    }

    this.currentQuestionIndex++;
    if (this.currentQuestionIndex >= this.questions.length) {
      this.gameOver('Kuis Selesai!'); // Beri alasan
      return;
    }

    this.timerEvent.paused = false;
    this.draw(); // Panggil draw() untuk menggambar ulang pertanyaan baru dan UI lainnya
  }

  gameOver(reason: string = 'Game Over') {
      this.timerEvent?.remove(); // Hentikan timer jika ada

      // Tampilkan alasan game over sebelum pindah scene
      this.feedbackText.setText(reason).setColor(reason.includes('Selesai') ? '#0000FF' : '#FF0000'); // Biru jika selesai, Merah jika gagal
      this.optionButtons.forEach(button => button.removeInteractive()); // Nonaktifkan tombol

      this.time.delayedCall(2000, () => { // Tunggu 2 detik
          this.scene.start('ResultsScene', { score: this.score });
      });
  }


  // ... (selectQuestions dan shuffleArray tetap sama) ...
   selectQuestions(difficulty: string): Question[] {
    const settings = this.difficultySettings[difficulty];
    if (!settings) { return []; }

    // Pastikan quizQuestions memiliki isi
    if (!quizQuestions || quizQuestions.length === 0) {
        console.error("Bank soal (quizQuestions) kosong!");
        return [];
    }


    const easyPool = this.shuffleArray(quizQuestions.filter((q: Question) => q.difficulty === 'mudah'));
    const mediumPool = this.shuffleArray(quizQuestions.filter((q: Question) => q.difficulty === 'menengah'));
    const hardPool = this.shuffleArray(quizQuestions.filter((q: Question) => q.difficulty === 'sulit'));
    const proPool = this.shuffleArray(quizQuestions.filter((q: Question) => q.difficulty === 'pro'));

    let finalQuestions: Question[] = [];
    const counts = {
        mudah: Math.round(settings.totalQuestions * settings.mix.mudah),
        menengah: Math.round(settings.totalQuestions * settings.mix.menengah),
        sulit: Math.round(settings.totalQuestions * settings.mix.sulit),
        pro: Math.round(settings.totalQuestions * settings.mix.pro)
    };

    // Pastikan total count tidak melebihi totalQuestions karena pembulatan
    let currentTotal = counts.mudah + counts.menengah + counts.sulit + counts.pro;
    while (currentTotal > settings.totalQuestions) {
        // Kurangi dari kategori terbanyak (selain mudah jika memungkinkan)
        if (counts.pro > 0) counts.pro--;
        else if (counts.sulit > 0) counts.sulit--;
        else if (counts.menengah > 0) counts.menengah--;
        else if (counts.mudah > 0) counts.mudah--; // Terpaksa kurangi mudah
        currentTotal--;
    }
     while (currentTotal < settings.totalQuestions) {
        // Tambah ke kategori menengah atau sulit jika memungkinkan, lalu mudah
        if (settings.mix.menengah > 0) counts.menengah++;
        else if (settings.mix.sulit > 0) counts.sulit++;
        else if (settings.mix.pro > 0) counts.pro++;
        else counts.mudah++; // Terpaksa tambah mudah
        currentTotal++;
    }


    finalQuestions = finalQuestions.concat(easyPool.slice(0, counts.mudah));
    finalQuestions = finalQuestions.concat(mediumPool.slice(0, counts.menengah));
    finalQuestions = finalQuestions.concat(hardPool.slice(0, counts.sulit));
    finalQuestions = finalQuestions.concat(proPool.slice(0, counts.pro));


    // Jika jumlah masih kurang (misal bank soal kurang), coba ambil dari pool lain
    const pools = [easyPool.slice(counts.mudah), mediumPool.slice(counts.menengah), hardPool.slice(counts.sulit), proPool.slice(counts.pro)];
    let poolIndex = 0;
     while(finalQuestions.length < settings.totalQuestions) {
        const pool = pools[poolIndex % pools.length];
        if (pool.length > 0) {
            finalQuestions.push(pool.shift()!);
        }
        poolIndex++;
        // Hentikan jika semua pool sudah kosong tapi soal masih kurang
        if (pools.every(p => p.length === 0) && poolIndex > pools.length * 2) break;
     }


    return this.shuffleArray(finalQuestions.slice(0, settings.totalQuestions));
  }

  private shuffleArray<T>(array: T[]): T[] {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
  }
}
