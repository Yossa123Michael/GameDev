// File: src/client/scenes/GameScene.ts
import { quizQuestions, Question } from '../questions';
import { BaseScene } from './BaseScene';

type DifficultyKey = 'mudah' | 'menengah' | 'sulit' | 'pro';
type DifficultySettings = {
  [key in DifficultyKey]: {
    totalQuestions: number;
    totalTime: number;
    mix: { mudah: number; menengah: number; sulit: number; pro: number; };
  };
};

export class Game extends BaseScene {
   private difficultySettings: DifficultySettings = {
       mudah: { totalQuestions: 20, totalTime: 180, mix: { mudah: 0.9, menengah: 0.1, sulit: 0.0, pro: 0.0 }},
       menengah: { totalQuestions: 30, totalTime: 300, mix: { mudah: 0.3, menengah: 0.5, sulit: 0.2, pro: 0.0 }},
       sulit: { totalQuestions: 30, totalTime: 300, mix: { mudah: 0.1, menengah: 0.3, sulit: 0.5, pro: 0.1 }},
       pro: { totalQuestions: 30, totalTime: 240, mix: { mudah: 0.0, menengah: 0.1, sulit: 0.4, pro: 0.5 }},
   };
   private mode!: string;
   private difficulty!: DifficultyKey;
   private questions: Question[] = [];
   private currentQuestionIndex: number = 0;
   private score: number = 0;
   private lives: number = 0;
   private timerEvent!: Phaser.Time.TimerEvent;
   private remainingTime: number = 0;
   private timerText!: Phaser.GameObjects.Text;
   private scoreText!: Phaser.GameObjects.Text;
   private livesText!: Phaser.GameObjects.Text;
   private questionText!: Phaser.GameObjects.Text;
   private feedbackText!: Phaser.GameObjects.Text;
   private activeOptionButtons: { container: Phaser.GameObjects.Container }[] = [];

  constructor() {
    super('GameScene');
  }

  init(data: { mode: string; difficulty: DifficultyKey }) {
    this.mode = data.mode;
    this.difficulty = data.difficulty;
  }

  public override create() {
    const settings = this.difficultySettings[this.difficulty];
    if (!settings) { /* ... handle error ... */ return; }
    this.questions = this.selectQuestions(this.difficulty);
    if (!this.questions || this.questions.length < settings.totalQuestions) { /* ... handle error ... */ return; }
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.remainingTime = settings.totalTime;
    this.lives = this.mode === 'survive' ? 3 : 99;
    this.timerEvent = this.time.addEvent({ delay: 1000, callback: this.updateTimer, callbackScope: this, loop: true });
    super.create();
    super.createCommonButtons('PilihKesulitanScene');
  }

  public override draw() {
    // 1. Bersihkan group & listener lama
    super.draw();
    if (!this.sceneContentGroup) return;
    this.input.off(Phaser.Input.Events.POINTER_DOWN);
    this.input.off(Phaser.Input.Events.POINTER_MOVE);
    this.input.off(Phaser.Input.Events.GAME_OUT);
    this.input.setDefaultCursor('default');
    this.activeOptionButtons = [];

    // 2. Buat elemen UI (Font Nunito)
    const topMargin = this.scale.height * 0.15;
    const questionY = this.scale.height * 0.30;
    let startY = this.scale.height * 0.45;
    const buttonSpacing = this.scale.height * 0.12;
    const feedbackY = this.scale.height * 0.9;

    const textStyleBase = { fontFamily: 'Nunito', color: '#000', backgroundColor: '#ffffffcc' }; // <-- FONT
    const scoreStyle = { ...textStyleBase, fontSize: '24px', padding: { x: 5, y: 2 } };
    const questionStyle = { ...textStyleBase, fontSize: '28px', align: 'center', wordWrap: { width: this.scale.width * 0.9 }, padding: { x: 10, y: 5 } };
    const feedbackStyle = { ...textStyleBase, fontSize: '28px', padding: { x: 10, y: 5 } };

    this.scoreText = this.add.text(this.scale.width * 0.1, topMargin, `Skor: ${this.score}`, scoreStyle).setOrigin(0, 0.5);
    this.sceneContentGroup.add(this.scoreText);
    this.timerText = this.add.text(this.centerX, topMargin, `Waktu: ${this.remainingTime}`, scoreStyle).setOrigin(0.5, 0.5);
    this.sceneContentGroup.add(this.timerText);
    if (this.mode === 'survive') {
      this.livesText = this.add.text(this.scale.width * 0.9, topMargin, `Nyawa: ${this.lives}`, scoreStyle).setOrigin(1, 0.5);
      this.sceneContentGroup.add(this.livesText);
    }
    this.questionText = this.add.text(this.centerX, questionY, '', questionStyle).setOrigin(0.5);
    this.sceneContentGroup.add(this.questionText);
    this.feedbackText = this.add.text(this.centerX, feedbackY, '', feedbackStyle).setOrigin(0.5);
    this.sceneContentGroup.add(this.feedbackText);

    // 3. Tampilkan Pertanyaan & Buat Tombol Opsi (Gaya Rounded)
    const currentQuestion = this.questions[this.currentQuestionIndex];
    if (!currentQuestion) { this.gameOver("Error: Pertanyaan tidak ditemukan"); return; }
    this.questionText.setText(`(${this.currentQuestionIndex + 1}/${this.questions.length}) ${currentQuestion.question}`);

    const optionsWithOriginalIndex = currentQuestion.options.map((option, index) => ({ text: option, originalIndex: index }));
    const shuffledOptions = this.shuffleArray(optionsWithOriginalIndex);

    shuffledOptions.forEach((optionData) => {
      const isCorrect = optionData.originalIndex === currentQuestion.correctAnswerIndex;
      const buttonContainer = this.createOptionButton(startY, optionData.text, isCorrect);
      this.sceneContentGroup.add(buttonContainer);
      this.activeOptionButtons.push({ container: buttonContainer });
      startY += buttonSpacing;
    });

    // 4. Listener Scene
    this.input.on(Phaser.Input.Events.POINTER_DOWN, (pointer: Phaser.Input.Pointer) => {
        this.activeOptionButtons.forEach(btn => {
            if (this.isPointerOver(pointer, btn.container)) { // Pakai isPointerOver dari BaseScene
                this.handleAnswer(btn.container);
            }
        });
    });
    this.input.on(Phaser.Input.Events.POINTER_MOVE, (pointer: Phaser.Input.Pointer) => {
        let onButton = false;
        this.activeOptionButtons.forEach(btn => {
            const graphics = btn.container.getAt(0) as Phaser.GameObjects.Graphics;
            if (this.isPointerOver(pointer, btn.container)) { // Pakai isPointerOver dari BaseScene
                onButton = true;
                if (!btn.container.getData('isHovered')) {
                   this.updateButtonGraphics(graphics, btn.container.width, btn.container.height, 0xeeeeee);
                   btn.container.setData('isHovered', true);
                }
            } else {
                 if (btn.container.getData('isHovered')) {
                    this.updateButtonGraphics(graphics, btn.container.width, btn.container.height, 0xffffff);
                    btn.container.setData('isHovered', false);
                 }
            }
        });
        let onUtilButton = false;
        if (this.musicButton && this.isPointerOver(pointer, this.musicButton)) onUtilButton = true;
        if (this.backButton && this.isPointerOver(pointer, this.backButton)) onUtilButton = true;
        this.input.setDefaultCursor(onButton || onUtilButton ? 'pointer' : 'default');
    });
    this.input.on(Phaser.Input.Events.GAME_OUT, () => {
         this.activeOptionButtons.forEach(btn => {
             const graphics = btn.container.getAt(0) as Phaser.GameObjects.Graphics;
             this.updateButtonGraphics(graphics, btn.container.width, btn.container.height, 0xffffff);
             btn.container.setData('isHovered', false);
         });
         this.input.setDefaultCursor('default');
    });
  } // <-- Akhir draw()


    // --- ADAPTASI createOptionButton (Gaya Rounded & Font Nunito) ---
    createOptionButton(y: number, text: string, isCorrect: boolean): Phaser.GameObjects.Container {
        const buttonWidth = this.scale.width * 0.9;
        const buttonHeight = 60;
        const cornerRadius = 15;

        const buttonGraphics = this.add.graphics();
        this.updateButtonGraphics(buttonGraphics, buttonWidth, buttonHeight, 0xffffff, 0.9, cornerRadius);

        const buttonText = this.add.text(
            20, buttonHeight / 2, text, {
                fontFamily: 'Nunito', // <-- FONT
                fontSize: '20px', color: '#000000', align: 'left',
                wordWrap: { width: buttonWidth - 40 }
            }
        ).setOrigin(0, 0.5);

        const container = this.add.container(
            this.centerX - buttonWidth / 2,
            y - buttonHeight / 2
        );
        container.setSize(buttonWidth, buttonHeight);
        container.add([buttonGraphics, buttonText]);
        container.setData('isCorrect', isCorrect);
        container.setName(`Option: ${text.substring(0, 10)}...`);
        container.setData('isHovered', false);

        return container;
    } // <-- Akhir createOptionButton()

    // --- Helper gambar tombol ---
    private updateButtonGraphics(
        graphics: Phaser.GameObjects.Graphics,
        width: number,
        height: number,
        fillColor: number,
        alpha: number = 0.9,
        cornerRadius: number = 15
    ) {
        graphics.clear();
        graphics.fillStyle(fillColor, alpha);
        graphics.lineStyle(2, 0x000000, 1);
        graphics.fillRoundedRect(0, 0, width, height, cornerRadius);
        graphics.strokeRoundedRect(0, 0, width, height, cornerRadius);
    } // <-- Akhir updateButtonGraphics()

    handleAnswer(selectedButton: Phaser.GameObjects.Container) {
        // Matikan listener scene
        this.input.off(Phaser.Input.Events.POINTER_DOWN);
        this.input.off(Phaser.Input.Events.POINTER_MOVE);
        this.input.off(Phaser.Input.Events.GAME_OUT);
        this.input.setDefaultCursor('default');
        
        this.activeOptionButtons.forEach(btn => btn.container.setData('isHovered', false));
        this.activeOptionButtons = []; // Kosongkan array

        this.timerEvent.paused = true;
        const isCorrect = selectedButton.getData('isCorrect');
        const selectedButtonGraphics = selectedButton.getAt(0) as Phaser.GameObjects.Graphics;

        if (isCorrect) {
            this.score += 10;
            this.feedbackText.setText('BENAR!').setColor('#008000').setBackgroundColor('#90EE90cc');
            this.updateButtonGraphics(selectedButtonGraphics, selectedButton.width, selectedButton.height, 0x90EE90); // Update warna
            this.playSound('sfx_correct'); // SFX Benar
        } else {
            if (this.mode === 'survive') {
                this.lives -= 1;
                if (this.livesText) this.livesText.setText(`Nyawa: ${this.lives}`);
            }
            this.feedbackText.setText('SALAH!').setColor('#FF0000').setBackgroundColor('#FFCCCBcc');
            this.updateButtonGraphics(selectedButtonGraphics, selectedButton.width, selectedButton.height, 0xFFCCCB); // Update warna
            this.playSound('sfx_incorrect'); // SFX Salah

            // Cari tombol benar dan update warnanya
            this.sceneContentGroup.getChildren().forEach(child => {
                 if (child instanceof Phaser.GameObjects.Container && child.getData('isCorrect') === true) {
                      const correctGraphics = child.getAt(0) as Phaser.GameObjects.Graphics;
                      if (correctGraphics) {
                           this.updateButtonGraphics(correctGraphics, child.width, child.height, 0x90EE90); // Update warna
                      }
                 }
            });
        }

        this.scoreText.setText(`Skor: ${this.score}`);
        this.time.delayedCall(1500, () => this.nextQuestion());
    } // <-- Akhir handleAnswer()

    updateTimer() {
        if (!this.timerEvent || this.timerEvent.paused) return;
        if (this.remainingTime > 0) {
            this.remainingTime--;
            if (this.timerText) this.timerText.setText(`Waktu: ${this.remainingTime}`);
            if (this.remainingTime <= 10 && this.timerText) this.timerText.setColor('#FF0000');
        }
        if (this.remainingTime <= 0) {
            this.timerEvent.remove();
            this.gameOver('Waktu Habis!');
        }
    }

    nextQuestion() {
        if (this.mode === 'survive' && this.lives <= 0) { this.gameOver('Nyawa Habis!'); return; }
        this.currentQuestionIndex++;
        if (this.currentQuestionIndex >= this.questions.length) { this.gameOver('Kuis Selesai!'); return; }
        if(this.timerEvent) this.timerEvent.paused = false;
        this.draw();
    }

    gameOver(reason: string = 'Game Over') {
        this.input.off(Phaser.Input.Events.POINTER_DOWN);
        this.input.off(Phaser.Input.Events.POINTER_MOVE);
        this.input.off(Phaser.Input.Events.GAME_OUT);
        this.input.setDefaultCursor('default');
        this.timerEvent?.remove();
        this.feedbackText.setText(reason).setColor(reason.includes('Selesai') || reason.includes('Habis') ? '#FF0000' : '#0000FF');
        this.activeOptionButtons = [];
        this.time.delayedCall(2000, () => { this.scene.start('ResultsScene', { score: this.score }); });
    }

   selectQuestions(difficulty: DifficultyKey): Question[] {
        const settings = this.difficultySettings[difficulty];
        if (!settings) { return []; }
        if (!quizQuestions || quizQuestions.length === 0) { console.error("Bank soal kosong!"); return []; }
        const easyPool = this.shuffleArray(quizQuestions.filter(q => q.difficulty === 'mudah'));
        const mediumPool = this.shuffleArray(quizQuestions.filter(q => q.difficulty === 'menengah'));
        const hardPool = this.shuffleArray(quizQuestions.filter(q => q.difficulty === 'sulit'));
        const proPool = this.shuffleArray(quizQuestions.filter(q => q.difficulty === 'pro'));
        let finalQuestions: Question[] = [];
        const counts = {
            mudah: Math.round(settings.totalQuestions * settings.mix.mudah),
            menengah: Math.round(settings.totalQuestions * settings.mix.menengah),
            sulit: Math.round(settings.totalQuestions * settings.mix.sulit),
            pro: Math.round(settings.totalQuestions * settings.mix.pro)
        };
        let currentTotal = counts.mudah + counts.menengah + counts.sulit + counts.pro;
        while (currentTotal > settings.totalQuestions) { /* adjust */ if (counts.pro > 0) counts.pro--; else if (counts.sulit > 0) counts.sulit--; else if (counts.menengah > 0) counts.menengah--; else counts.mudah--; currentTotal--; }
        while (currentTotal < settings.totalQuestions) { /* adjust */ if (settings.mix.menengah > 0) counts.menengah++; else if (settings.mix.sulit > 0) counts.sulit++; else if (settings.mix.pro > 0) counts.pro++; else counts.mudah++; currentTotal++; }
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
        [array[currentIndex]!, array[randomIndex]!] = [array[randomIndex]!, array[currentIndex]!];
        }
        return array;
    }

  // Helper SFX
  protected playSound(key: string, config?: Phaser.Types.Sound.SoundConfig) {
      if (!this.sound.mute) {
          this.sound.play(key, config);
      }
  }

} // Akhir Class
