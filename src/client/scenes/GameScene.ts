// File: src/client/scenes/GameScene.ts
import { quizQuestions, Question } from '../questions';
import { BaseScene } from './BaseScene';

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

export class Game extends BaseScene {
   // ... (difficultySettings, properti private lain tetap sama) ...
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

  // Referensi ke elemen UI
  private timerText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private livesText!: Phaser.GameObjects.Text;
  private questionText!: Phaser.GameObjects.Text;
  private feedbackText!: Phaser.GameObjects.Text;
  
  // Array untuk menyimpan tombol OPSI yang aktif
  private activeOptionButtons: { container: Phaser.GameObjects.Container }[] = [];

  constructor() {
    super('GameScene');
  }

  init(data: { mode: string; difficulty: string }) {
    this.mode = data.mode;
    this.difficulty = data.difficulty;
  }

  public override create() {
    // ... (Logika validasi settings dan questions tetap sama) ...
    const settings = this.difficultySettings[this.difficulty];
    if (!settings) {
      console.error("Invalid difficulty setting:", this.difficulty);
      this.scene.start('PilihKesulitanScene', { mode: this.mode });
      return;
    }

    this.questions = this.selectQuestions(this.difficulty);
    if (!this.questions || this.questions.length < settings.totalQuestions) {
      alert(`Error: Bank soal tidak cukup untuk kesulitan ${this.difficulty}. Butuh ${settings.totalQuestions}, tersedia ${this.questions?.length || 0}.`);
      this.scene.start('PilihKesulitanScene', { mode: this.mode });
      return;
    }


    this.currentQuestionIndex = 0;
    this.score = 0;
    this.remainingTime = settings.totalTime;
    this.lives = this.mode === 'survive' ? 3 : 99;

    this.timerEvent = this.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true,
    });

    super.create();
    super.createCommonButtons('PilihKesulitanScene');
    // this.draw() dipanggil oleh BaseScene
  }

  public override draw() {
    // 1. Panggil super.draw() PERTAMA
    super.draw();
    if (!this.sceneContentGroup) return;

    // 2. HAPUS LISTENER LAMA DARI SCENE
    this.input.off(Phaser.Input.Events.POINTER_DOWN);
    this.input.off(Phaser.Input.Events.POINTER_MOVE);
    this.input.off(Phaser.Input.Events.GAME_OUT);
    this.input.setDefaultCursor('default');
    
    // Reset array tombol aktif
    this.activeOptionButtons = [];

    // 3. Buat elemen UI dan tambahkan ke group
    const topMargin = this.scale.height * 0.15;
    const questionY = this.scale.height * 0.30;
    let startY = this.scale.height * 0.45;
    const buttonSpacing = this.scale.height * 0.12;
    const feedbackY = this.scale.height * 0.9;

    // Score Text
    this.scoreText = this.add.text(this.scale.width * 0.1, topMargin, `Skor: ${this.score}`, {
      fontSize: '24px', color: '#000', backgroundColor: '#ffffffcc', padding: { x: 5, y: 2 }
    }).setOrigin(0, 0.5);
    this.sceneContentGroup.add(this.scoreText);

    // Timer Text
    this.timerText = this.add.text(this.centerX, topMargin, `Waktu: ${this.remainingTime}`, {
      fontSize: '24px', color: '#000', backgroundColor: '#ffffffcc', padding: { x: 5, y: 2 }
    }).setOrigin(0.5, 0.5);
    this.sceneContentGroup.add(this.timerText);

    // Lives Text
    if (this.mode === 'survive') {
      this.livesText = this.add.text(this.scale.width * 0.9, topMargin, `Nyawa: ${this.lives}`, {
        fontSize: '24px', color: '#000', backgroundColor: '#ffffffcc', padding: { x: 5, y: 2 }
      }).setOrigin(1, 0.5);
      this.sceneContentGroup.add(this.livesText);
    }

    // Question Text
    this.questionText = this.add.text(this.centerX, questionY, '', {
      fontSize: '28px', color: '#000', align: 'center', wordWrap: { width: this.scale.width * 0.9 },
      backgroundColor: '#ffffffcc', padding: { x: 10, y: 5 }
    }).setOrigin(0.5);
    this.sceneContentGroup.add(this.questionText);

    // Feedback Text
    this.feedbackText = this.add.text(this.centerX, feedbackY, '', {
      fontSize: '28px', color: '#000', backgroundColor: '#ffffffcc', padding: { x: 10, y: 5 }
    }).setOrigin(0.5);
    this.sceneContentGroup.add(this.feedbackText);

    // Tampilkan Pertanyaan
    const currentQuestion = this.questions[this.currentQuestionIndex];
    if (!currentQuestion) {
      this.gameOver();
      return;
    }
    this.questionText.setText(`(${this.currentQuestionIndex + 1}/${this.questions.length}) ${currentQuestion.question}`);

    // Acak dan buat tombol opsi
    const optionsWithOriginalIndex = currentQuestion.options.map((option, index) => ({ text: option, originalIndex: index }));
    const shuffledOptions = this.shuffleArray(optionsWithOriginalIndex);

    shuffledOptions.forEach((optionData) => {
      const isCorrect = optionData.originalIndex === currentQuestion.correctAnswerIndex;
      const buttonContainer = this.createOptionButton(startY, optionData.text, isCorrect);
      this.sceneContentGroup.add(buttonContainer); // Tambah ke group
      this.activeOptionButtons.push({ container: buttonContainer }); // Tambah ke array aktif
      startY += buttonSpacing;
    });

    // 4. Daftarkan LISTENER PADA SCENE (untuk tombol opsi)
    this.input.on(Phaser.Input.Events.POINTER_DOWN, (pointer: Phaser.Input.Pointer) => {
        // Cek HANYA tombol opsi yang aktif
        this.activeOptionButtons.forEach(btn => {
            if (this.isPointerOver(pointer, btn.container)) {
                // Panggil handleAnswer saat tombol opsi diklik
                this.handleAnswer(btn.container);
                // Tidak perlu delay atau setFill di sini, handleAnswer yg urus
            }
        });
    });

    this.input.on(Phaser.Input.Events.POINTER_MOVE, (pointer: Phaser.Input.Pointer) => {
        let onButton = false;
        // Cek HANYA tombol opsi yang aktif
        this.activeOptionButtons.forEach(btn => {
            const rect = btn.container.getAt(0) as Phaser.GameObjects.Rectangle;
            if (this.isPointerOver(pointer, btn.container)) {
                onButton = true;
                if (!btn.container.getData('isHovered')) {
                   rect.setFillStyle(0xeeeeee, 0.9);
                   btn.container.setData('isHovered', true);
                }
            } else {
                 if (btn.container.getData('isHovered')) {
                    rect.setFillStyle(0xffffff, 0.9);
                    btn.container.setData('isHovered', false);
                 }
            }
        });
        // Jangan ubah kursor default jika sedang tidak di atas tombol opsi aktif
        if (onButton) {
            this.input.setDefaultCursor('pointer');
        } else {
             // Cek juga tombol musik/kembali (jika ada)
             let onUtilButton = false;
             if (this.musicButton && this.isPointerOver(pointer, this.musicButton)) onUtilButton = true;
             if (this.backButton && this.isPointerOver(pointer, this.backButton)) onUtilButton = true;
             this.input.setDefaultCursor(onUtilButton ? 'pointer' : 'default');
        }
    });

    this.input.on(Phaser.Input.Events.GAME_OUT, () => {
         this.activeOptionButtons.forEach(btn => {
             const rect = btn.container.getAt(0) as Phaser.GameObjects.Rectangle;
             rect.setFillStyle(0xffffff, 0.9);
             btn.container.setData('isHovered', false);
         });
         this.input.setDefaultCursor('default');
    });
  }

    // Helper cek pointer (sama seperti MainMenuScene)
    // Dibuat public agar bisa dipakai di listener scene
    public isPointerOver(pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject): boolean {
        // Perlu cast ke tipe yang punya getBounds
        if (!(gameObject instanceof Phaser.GameObjects.Container || gameObject instanceof Phaser.GameObjects.Text)) {
             return false;
        }
        const bounds = gameObject.getBounds();
        return bounds.contains(pointer.x, pointer.y);
    }

    // --- FUNGSI createOptionButton (DISEDERHANAKAN) ---
    // (Hanya membuat visual, tanpa listener)
    createOptionButton(y: number, text: string, isCorrect: boolean): Phaser.GameObjects.Container {
        const buttonWidth = this.scale.width * 0.9;
        const buttonHeight = 60;

        const buttonRect = this.add.rectangle(
            0, 0, buttonWidth, buttonHeight, 0xffffff, 0.9
        )
        .setStrokeStyle(2, 0x000000)
        .setOrigin(0, 0);

        const buttonText = this.add.text(
            20, buttonHeight / 2, text, {
                fontSize: '20px', color: '#000000', align: 'left',
                wordWrap: { width: buttonWidth - 40 }
            }
        ).setOrigin(0, 0.5);

        const container = this.add.container(
            this.centerX - buttonWidth / 2,
            y - buttonHeight / 2
        );
        container.setSize(buttonWidth, buttonHeight);
        container.add([buttonRect, buttonText]);
        container.setData('isCorrect', isCorrect); // Simpan data jawaban
        container.setName(`Option: ${text.substring(0, 10)}...`); // Nama debug
        container.setData('isHovered', false); // State awal hover

        // **TIDAK ADA .setInteractive() di sini**

        return container;
    }


    handleAnswer(selectedButton: Phaser.GameObjects.Container) {
        // Nonaktifkan listener scene agar tidak bisa klik lagi saat animasi/delay
        this.input.off(Phaser.Input.Events.POINTER_DOWN);
        this.input.off(Phaser.Input.Events.POINTER_MOVE);
        this.input.off(Phaser.Input.Events.GAME_OUT);
        this.input.setDefaultCursor('default'); // Reset kursor
        
        // Hapus state hover dari semua tombol aktif
         this.activeOptionButtons.forEach(btn => {
             btn.container.setData('isHovered', false);
         });
        
        // Kosongkan array tombol aktif karena sudah tidak bisa diklik
        this.activeOptionButtons = [];

        // Lanjutkan logika jawaban...
        this.timerEvent.paused = true;
        const isCorrect = selectedButton.getData('isCorrect');
        const selectedButtonRect = selectedButton.getAt(0) as Phaser.GameObjects.Rectangle;

        if (isCorrect) {
            this.score += 10;
            this.feedbackText.setText('BENAR!').setColor('#008000').setBackgroundColor('#90EE90cc');
            selectedButtonRect.setFillStyle(0x90EE90); // Hijau muda
        } else {
            if (this.mode === 'survive') {
                this.lives -= 1;
                if (this.livesText) this.livesText.setText(`Nyawa: ${this.lives}`);
            }
            this.feedbackText.setText('SALAH!').setColor('#FF0000').setBackgroundColor('#FFCCCBcc');
            selectedButtonRect.setFillStyle(0xFFCCCB); // Merah muda

            // Temukan container jawaban benar (dari SEMUA anak group, bukan hanya activeOptionButtons)
            this.sceneContentGroup.getChildren().forEach(child => {
                 if (child instanceof Phaser.GameObjects.Container && child.getData('isCorrect') === true) {
                      const correctRect = child.getAt(0) as Phaser.GameObjects.Rectangle;
                      if (correctRect) {
                           correctRect.setFillStyle(0x90EE90); // Tandai benar
                      }
                 }
            });
        }

        this.scoreText.setText(`Skor: ${this.score}`);
        this.time.delayedCall(1500, () => this.nextQuestion());
    }

    // ... (updateTimer, nextQuestion, gameOver, selectQuestions, shuffleArray tetap sama) ...
    updateTimer() {
        if (!this.timerEvent || this.timerEvent.paused) return; // Tambah cek
        if (this.remainingTime > 0) {
            this.remainingTime--;
            if (this.timerText) {
                this.timerText.setText(`Waktu: ${this.remainingTime}`);
            }
            if (this.remainingTime <= 10) {
                 if (this.timerText) this.timerText.setColor('#FF0000');
            }
        }

        if (this.remainingTime <= 0) {
            this.timerEvent.remove();
            this.gameOver('Waktu Habis!');
        }
    }


    nextQuestion() {
        if (this.mode === 'survive' && this.lives <= 0) {
        this.gameOver('Nyawa Habis!');
        return;
        }

        this.currentQuestionIndex++;
        if (this.currentQuestionIndex >= this.questions.length) {
        this.gameOver('Kuis Selesai!');
        return;
        }

        if(this.timerEvent) this.timerEvent.paused = false; // Pastikan timer ada
        this.draw(); // Panggil draw() untuk menggambar ulang
    }

    gameOver(reason: string = 'Game Over') {
        this.input.off(Phaser.Input.Events.POINTER_DOWN); // Matikan input scene
        this.input.off(Phaser.Input.Events.POINTER_MOVE);
        this.input.off(Phaser.Input.Events.GAME_OUT);
        this.input.setDefaultCursor('default');

        this.timerEvent?.remove();

        this.feedbackText.setText(reason).setColor(reason.includes('Selesai') ? '#0000FF' : '#FF0000');
        // Tombol sudah tidak ada di activeOptionButtons

        this.time.delayedCall(2000, () => {
            this.scene.start('ResultsScene', { score: this.score });
        });
    }

   selectQuestions(difficulty: string): Question[] {
        const settings = this.difficultySettings[difficulty];
        if (!settings) { return []; }
        if (!quizQuestions || quizQuestions.length === 0) { return []; }

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
        let currentTotal = counts.mudah + counts.menengah + counts.sulit + counts.pro;
        while (currentTotal > settings.totalQuestions) {
            if (counts.pro > 0) counts.pro--;
            else if (counts.sulit > 0) counts.sulit--;
            else if (counts.menengah > 0) counts.menengah--;
            else if (counts.mudah > 0) counts.mudah--;
            currentTotal--;
        }
        while (currentTotal < settings.totalQuestions) {
            if (settings.mix.menengah > 0) counts.menengah++;
            else if (settings.mix.sulit > 0) counts.sulit++;
            else if (settings.mix.pro > 0) counts.pro++;
            else counts.mudah++;
            currentTotal++;
        }
        finalQuestions = finalQuestions.concat(easyPool.slice(0, counts.mudah));
        finalQuestions = finalQuestions.concat(mediumPool.slice(0, counts.menengah));
        finalQuestions = finalQuestions.concat(hardPool.slice(0, counts.sulit));
        finalQuestions = finalQuestions.concat(proPool.slice(0, counts.pro));
        const pools = [easyPool.slice(counts.mudah), mediumPool.slice(counts.menengah), hardPool.slice(counts.sulit), proPool.slice(counts.pro)];
        let poolIndex = 0;
        while(finalQuestions.length < settings.totalQuestions) {
            const pool = pools[poolIndex % pools.length];
            if (pool && pool.length > 0) { finalQuestions.push(pool.shift()!); }
            poolIndex++;
            if (pools.every(p => p.length === 0) && poolIndex > pools.length * 2) break;
        }
        return this.shuffleArray(finalQuestions.slice(0, settings.totalQuestions));
    }

    private shuffleArray<T>(array: T[]): T[] {
        let currentIndex = array.length, randomIndex;
        while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex]!, array[randomIndex]!] = [
            array[randomIndex]!, array[currentIndex]!
        ];
        }
        return array;
    }
}
