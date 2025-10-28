// File: src/client/scenes/GameScene.ts
import { quizQuestions, Question } from '../questions'; // Pastikan quizQuestions benar diekspor
import { BaseScene } from './BaseScene';

// Definisikan tipe kunci secara eksplisit
type DifficultyKey = 'mudah' | 'menengah' | 'sulit' | 'pro';

type DifficultySettings = {
  [key in DifficultyKey]: { // Gunakan tipe kunci ini
    totalQuestions: number;
    totalTime: number;
    mix: { mudah: number; menengah: number; sulit: number; pro: number; };
    scoreBase: number;
    scoreTimeMultiplier: number;
    scoreTimeCeiling: boolean;
  };
};

export class Game extends BaseScene {
   // --- Data Settings ---
   private difficultySettings: DifficultySettings = {
       mudah:    { totalQuestions: 20, totalTime: 180, mix: { mudah: 0.9, menengah: 0.1, sulit: 0.0, pro: 0.0 }, scoreBase: 1,   scoreTimeMultiplier: 1,   scoreTimeCeiling: false },
       menengah: { totalQuestions: 20, totalTime: 180, mix: { mudah: 0.1, menengah: 0.8, sulit: 0.1, pro: 0.0 }, scoreBase: 2,   scoreTimeMultiplier: 1.5, scoreTimeCeiling: true  },
       sulit:    { totalQuestions: 20, totalTime: 180, mix: { mudah: 0.0, menengah: 0.1, sulit: 0.8, pro: 0.1 }, scoreBase: 2.5, scoreTimeMultiplier: 2,   scoreTimeCeiling: true  },
       pro:      { totalQuestions: 20, totalTime: 150, mix: { mudah: 0.0, menengah: 0.0, sulit: 0.0, pro: 1.0 }, scoreBase: 5,   scoreTimeMultiplier: 2,   scoreTimeCeiling: false },
   };
   // --- Akhir Data Settings ---

   private mode!: string;
   private difficulty!: DifficultyKey; // Gunakan tipe kunci
   private questions: Question[] = [];
   private currentQuestionIndex: number = 0;
   private score: number = 0;
   private lives: number = 0;
   private timerEvent: Phaser.Time.TimerEvent | null = null;
   private remainingTime: number = 0;
   private timerText: Phaser.GameObjects.Text | null = null;
   private scoreText: Phaser.GameObjects.Text | null = null;
   private livesText: Phaser.GameObjects.Text | null = null;
   private questionText: Phaser.GameObjects.Text | null = null;
   private feedbackText: Phaser.GameObjects.Text | null = null;
   private activeOptionButtons: { container: Phaser.GameObjects.Container }[] = [];
   private isDrawing: boolean = false;

  constructor() {
    super('GameScene');
  }

  public init (data: { mode?: string; difficulty?: DifficultyKey }) {
  // Simpan mode jika dikirim
  if (data.mode) {
    this.mode = data.mode;
  }
  // Simpan difficulty jika dikirim; kalau tidak, pakai fallback 'mudah'
  if (data.difficulty) {
    this.difficulty = data.difficulty;
  } else {
    console.warn('GameScene.init: difficulty tidak diberikan — menggunakan default "mudah"');
    this.difficulty = 'mudah';
  }

  // Reset state (sama seperti yang sebelumnya di init awal)
  this.currentQuestionIndex = 0;
  this.score = 0;
  this.remainingTime = 0;
  this.lives = 0;
  if (this.timerEvent) { this.timerEvent.remove(); this.timerEvent = null; }
  this.timerEvent = null;
  this.timerText = null;
  this.scoreText = null;
  this.livesText = null;
  this.questionText = null;
  this.feedbackText = null;
  this.activeOptionButtons = [];
  this.isDrawing = false;

  console.log(`GameScene.init -> mode: ${this.mode}, difficulty: ${this.difficulty}`);
}
  
  public override create() {
    console.log("GameScene create starting...");
    const settings = this.difficultySettings[this.difficulty];
    if (!settings) { console.error("Invalid difficulty"); this.scene.start('PilihKesulitanScene', { mode: this.mode }); return; }

    this.questions = this.selectQuestions(this.difficulty, settings.totalQuestions);
    if (!this.questions || this.questions.length === 0 || this.questions.length < settings.totalQuestions) {
        alert(`Bank soal tidak cukup`); this.scene.start('PilihKesulitanScene', { mode: this.mode }); return;
    }

    this.currentQuestionIndex = 0;
    this.score = 0;
    this.remainingTime = settings.totalTime;
    this.lives = this.mode === 'survive' ? 3 : 99;

    if (this.timerEvent) { this.timerEvent.remove(); this.timerEvent = null; }
    this.timerEvent = this.time.addEvent({ delay: 1000, callback: this.updateTimer, callbackScope: this, loop: true });
    console.log("Timer created in create()");

    super.create();
    super.createCommonButtons('PilihKesulitanScene');
    console.log("GameScene create finished.");
  }

  public override draw() {
    if (this.isDrawing) { console.warn("Skipping draw()"); return; }
    this.isDrawing = true;
    // console.log(`GameScene draw() started.`);

    try {
        super.draw(); // Bersihkan group
        // Reset referensi
        this.scoreText = null; this.timerText = null; this.livesText = null;
        this.questionText = null; this.feedbackText = null; this.activeOptionButtons = [];

        if (!this.sceneContentGroup || !this.sceneContentGroup.active) {
            console.error("sceneContentGroup lost!");
            this.sceneContentGroup = this.add.group().setName('sceneContentGroup_game_fallback');
        }

        // Hapus listener lama
        this.input.off(Phaser.Input.Events.POINTER_DOWN);
        this.input.off(Phaser.Input.Events.POINTER_MOVE);
        this.input.off(Phaser.Input.Events.GAME_OUT);
        this.input.setDefaultCursor('default');

        // Buat elemen UI baru
        const topMargin = this.scale.height * 0.15;
        const questionY = this.scale.height * 0.30;
        let startY = this.scale.height * 0.45;
        const buttonSpacing = this.scale.height * 0.12;
        const feedbackY = this.scale.height * 0.9;

        const textStyleBase = { fontFamily: 'Nunito', color: '#000', backgroundColor: '#ffffffcc' };
        const scoreStyle = { ...textStyleBase, fontSize: '24px', padding: { x: 5, y: 2 } };
        const questionStyle = { ...textStyleBase, fontSize: '28px', align: 'center', wordWrap: { width: this.scale.width * 0.9 }, padding: { x: 10, y: 5 } };
        const feedbackStyle = { ...textStyleBase, fontSize: '28px', padding: { x: 10, y: 5 } };

        this.scoreText = this.add.text(this.scale.width * 0.1, topMargin, `Skor: ${this.score.toFixed(1)}`, scoreStyle).setOrigin(0, 0.5);
        this.sceneContentGroup.add(this.scoreText);
        this.timerText = this.add.text(this.centerX, topMargin, `Waktu: ${this.remainingTime}`, scoreStyle).setOrigin(0.5, 0.5);
        if (this.remainingTime <= 10 && this.timerText) this.timerText.setColor('#FF0000');
        this.sceneContentGroup.add(this.timerText);
        if (this.mode === 'survive') {
          this.livesText = this.add.text(this.scale.width * 0.9, topMargin, `Nyawa: ${this.lives}`, scoreStyle).setOrigin(1, 0.5);
          this.sceneContentGroup.add(this.livesText);
        }
        this.questionText = this.add.text(this.centerX, questionY, '', questionStyle).setOrigin(0.5);
        this.sceneContentGroup.add(this.questionText);
        this.feedbackText = this.add.text(this.centerX, feedbackY, '', feedbackStyle).setOrigin(0.5);
        this.sceneContentGroup.add(this.feedbackText);

        // Tampilkan Pertanyaan & Buat Tombol Opsi
        if (this.currentQuestionIndex < 0 || this.currentQuestionIndex >= this.questions.length) { throw new Error("Invalid index"); }
        const currentQuestion = this.questions[this.currentQuestionIndex];
        if (!currentQuestion) { throw new Error("Question null"); }
        if(this.questionText) { this.questionText.setText(`(${this.currentQuestionIndex + 1}/${this.questions.length}) ${currentQuestion.question}`); }
        else { throw new Error("questionText null"); }

        const optionsWithOriginalIndex = currentQuestion.options.map((option, index) => ({ text: option, originalIndex: index }));
        const shuffledOptions = this.shuffleArray(optionsWithOriginalIndex);

        shuffledOptions.forEach((optionData) => {
            const isCorrect = optionData.originalIndex === currentQuestion.correctAnswerIndex;
            const buttonContainer = this.createOptionButton(startY, optionData.text, isCorrect);
            if (this.sceneContentGroup && this.sceneContentGroup.active) {
                this.sceneContentGroup.add(buttonContainer);
                this.activeOptionButtons.push({ container: buttonContainer });
            }
            startY += buttonSpacing;
        });

        // Listener Scene
        this.input.on(Phaser.Input.Events.POINTER_DOWN, (pointer: Phaser.Input.Pointer) => {
            [...this.activeOptionButtons].forEach(btn => {
                if (btn.container && btn.container.active && this.isPointerOver(pointer, btn.container)) {
                    this.handleAnswer(btn.container);
                }
            });
        });
        this.input.on(Phaser.Input.Events.POINTER_MOVE, (pointer: Phaser.Input.Pointer) => { // Gunakan 'pointer'
            let onButton = false;
            [...this.activeOptionButtons].forEach(btn => {
                 if (!btn.container || !btn.container.active) return;
                 const graphics = btn.container.getAt(0) as Phaser.GameObjects.Graphics;
                 if (!graphics) return;
                 if (this.isPointerOver(pointer, btn.container)) { // Gunakan 'pointer'
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
            if (this.musicButton && this.isPointerOver(pointer, this.musicButton)) onUtilButton = true; // Gunakan 'pointer'
            if (this.backButton && this.isPointerOver(pointer, this.backButton)) onUtilButton = true; // Gunakan 'pointer'
            this.input.setDefaultCursor(onButton || onUtilButton ? 'pointer' : 'default');
        });
        this.input.on(Phaser.Input.Events.GAME_OUT, () => {
             [...this.activeOptionButtons].forEach(btn => {
                  if (!btn.container || !btn.container.active) return;
                  const graphics = btn.container.getAt(0) as Phaser.GameObjects.Graphics;
                  if (!graphics) return;
                  this.updateButtonGraphics(graphics, btn.container.width, btn.container.height, 0xffffff);
                  btn.container.setData('isHovered', false);
             });
             this.input.setDefaultCursor('default');
        });

    } catch (error) { /* ... handle error ... */ }
    finally { this.isDrawing = false; }
  } // <-- Akhir draw()


    // --- Fungsi createOptionButton ---
    createOptionButton(y: number, text: string, isCorrect: boolean): Phaser.GameObjects.Container {
        const buttonWidth = this.scale.width * 0.9;
        const buttonHeight = 60;
        const cornerRadius = 15;

        const buttonGraphics = this.add.graphics();
        this.updateButtonGraphics(buttonGraphics, buttonWidth, buttonHeight, 0xffffff, 0.9, cornerRadius);

        const buttonText = this.add.text(
            20, buttonHeight / 2, text, {
                fontFamily: 'Nunito', fontSize: '20px', color: '#000000', align: 'left',
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

    // --- Fungsi updateButtonGraphics (Parameter digunakan) ---
    private updateButtonGraphics(
        graphics: Phaser.GameObjects.Graphics,
        width: number,
        height: number,
        fillColor: number,
        alpha: number = 0.9,
        cornerRadius: number = 15
    ) {
        graphics.clear();
        // PERBAIKAN TS2554: Gunakan fillColor dan alpha
        graphics.fillStyle(fillColor, alpha);
        graphics.lineStyle(2, 0x000000, 1);
        graphics.fillRoundedRect(0, 0, width, height, cornerRadius);
        graphics.strokeRoundedRect(0, 0, width, height, cornerRadius);
    } // <-- Akhir updateButtonGraphics()

    // --- Fungsi handleAnswer (Gunakan selectedButton) ---
    handleAnswer(selectedButton: Phaser.GameObjects.Container) { // Gunakan selectedButton
        console.log(`handleAnswer called for button: ${selectedButton.name}`);
        this.input.off(Phaser.Input.Events.POINTER_DOWN);
        // ... matikan input lain ...
        this.input.off(Phaser.Input.Events.POINTER_MOVE);
        this.input.off(Phaser.Input.Events.GAME_OUT);
        this.input.setDefaultCursor('default');


        if (this.timerEvent) { this.timerEvent.paused = true; }
        else { console.warn("timerEvent null in handleAnswer"); }

        this.activeOptionButtons.forEach(btn => btn.container?.setData('isHovered', false));
        this.activeOptionButtons = [];

        const isCorrect = selectedButton.getData('isCorrect'); // Gunakan selectedButton
        const selectedButtonGraphics = selectedButton.getAt(0) as Phaser.GameObjects.Graphics;
        if (!selectedButtonGraphics) { return; }

        // PERBAIKAN TS6133: Gunakan scoreSettings
        const scoreSettings = this.difficultySettings[this.difficulty];

        if (isCorrect) {
            let timeBonus = this.remainingTime * scoreSettings.scoreTimeMultiplier;
            if (scoreSettings.scoreTimeCeiling) { timeBonus = Math.ceil(timeBonus); }
            const scoreToAdd = scoreSettings.scoreBase + timeBonus;
            this.score += scoreToAdd;

            if(this.feedbackText) this.feedbackText.setText('BENAR!').setColor('#008000').setBackgroundColor('#90EE90cc');
            this.updateButtonGraphics(selectedButtonGraphics, selectedButton.width, selectedButton.height, 0x90EE90);
            this.playSound('sfx_correct');
        } else {
            if (this.mode === 'survive') { this.lives -= 1; if (this.livesText) this.livesText.setText(`Nyawa: ${this.lives}`); }
            if(this.feedbackText) this.feedbackText.setText('SALAH!').setColor('#FF0000').setBackgroundColor('#FFCCCBcc');
            this.updateButtonGraphics(selectedButtonGraphics, selectedButton.width, selectedButton.height, 0xFFCCCB);
             this.playSound('sfx_incorrect');

            this.sceneContentGroup?.getChildren().forEach(child => { // PERBAIKAN TS6133: Gunakan child
                 if (child instanceof Phaser.GameObjects.Container && child.getData('isCorrect') === true) {
                      const correctGraphics = child.getAt(0) as Phaser.GameObjects.Graphics;
                      if (correctGraphics) {
                           this.updateButtonGraphics(correctGraphics, child.width, child.height, 0x90EE90);
                      }
                 }
            });
        }

        if(this.scoreText) this.scoreText.setText(`Skor: ${this.score.toFixed(1)}`);
        this.time.delayedCall(1500, () => this.nextQuestion());
    } // <-- Akhir handleAnswer()

    updateTimer() { /* ... kode sama ... */ }
    nextQuestion() { /* ... kode sama ... */ }

    // Gunakan parameter 'reason'
    gameOver(reason: string = 'Game Over') { // Gunakan reason
         console.log(`gameOver called: ${reason}`);
         if (!this.scene?.isActive(this.scene.key)) { return; }
         if (this.timerEvent) { this.timerEvent.remove(); this.timerEvent = null; }
         this.input.off(Phaser.Input.Events.POINTER_DOWN);
         // ... matikan input lain ...

         this.activeOptionButtons = [];

         if (this.feedbackText && this.scene?.isActive(this.scene.key)) {
              try {
                  const color = reason.includes('Selesai') || reason.includes('Habis') ? '#FF0000' : '#0000FF';
                  this.feedbackText.setText(reason).setColor(color); // Gunakan reason
                } catch(e) {/*...*/}
         } else { console.warn("feedbackText null/inactive in gameOver"); }

         this.time.delayedCall(2000, () => {
             if (this.scene?.isActive(this.scene.key)) {
                  this.scene.start('ResultsScene', { score: this.score });
             } else { console.warn("Start ResultsScene skipped"); }
         });
    } // <-- Akhir gameOver()

   // --- Fungsi selectQuestions (Perbaikan counts & pools) ---
   selectQuestions(difficulty: DifficultyKey, totalQuestions: number): Question[] { // Gunakan parameter
        const settings = this.difficultySettings[difficulty];
        if (!settings) { return []; }
        // Gunakan quizQuestions
        if (!quizQuestions || quizQuestions.length === 0) { // Gunakan quizQuestions
             console.error("Bank soal (quizQuestions) kosong!");
             return [];
        }

        // Gunakan quizQuestions
        const easyPool = this.shuffleArray(quizQuestions.filter(q => q.difficulty === 'mudah'));
        const mediumPool = this.shuffleArray(quizQuestions.filter(q => q.difficulty === 'menengah')); // Gunakan mediumPool
        const hardPool = this.shuffleArray(quizQuestions.filter(q => q.difficulty === 'sulit')); // Gunakan hardPool
        const proPool = this.shuffleArray(quizQuestions.filter(q => q.difficulty === 'pro')); // Gunakan proPool

        let finalQuestions: Question[] = [];
        // PERBAIKAN TS2339: Inisialisasi counts dengan benar
        const counts = {
            mudah: Math.round(totalQuestions * settings.mix.mudah),       // Akses counts.mudah
            menengah: Math.round(totalQuestions * settings.mix.menengah), // Akses counts.menengah
            sulit: Math.round(totalQuestions * settings.mix.sulit),       // Akses counts.sulit
            pro: Math.round(totalQuestions * settings.mix.pro)            // Akses counts.pro
        };

        let currentTotal = counts.mudah + counts.menengah + counts.sulit + counts.pro; // Gunakan counts
        // Adjust counts
        while (currentTotal > totalQuestions) {
             if (counts.pro > 0 && settings.mix.pro > 0) counts.pro--;           // Gunakan counts
             else if (counts.sulit > 0 && settings.mix.sulit > 0) counts.sulit--; // Gunakan counts
             else if (counts.menengah > 0 && settings.mix.menengah > 0) counts.menengah--; // Gunakan counts
             else if (counts.mudah > 0 && settings.mix.mudah > 0) counts.mudah--;     // Gunakan counts
             else { /* Fallback */
                 if(counts.pro > 0) counts.pro--;
                 else if(counts.sulit > 0) counts.sulit--;
                 else if(counts.menengah > 0) counts.menengah--;
                 else counts.mudah--;
             }
             currentTotal--;
        }
        while (currentTotal < totalQuestions) {
             if (settings.mix.pro > 0) counts.pro++;           // Gunakan counts
             else if (settings.mix.sulit > 0) counts.sulit++; // Gunakan counts
             else if (settings.mix.menengah > 0) counts.menengah++; // Gunakan counts
             else counts.mudah++;                               // Gunakan counts
             currentTotal++;
        }

        finalQuestions = finalQuestions.concat(easyPool.slice(0, counts.mudah));     // Gunakan counts
        finalQuestions = finalQuestions.concat(mediumPool.slice(0, counts.menengah)); // Gunakan counts, Gunakan mediumPool
        finalQuestions = finalQuestions.concat(hardPool.slice(0, counts.sulit));     // Gunakan counts, Gunakan hardPool
        finalQuestions = finalQuestions.concat(proPool.slice(0, counts.pro));       // Gunakan counts, Gunakan proPool

        // PERBAIKAN TS6133: Gunakan pools dan poolIndex
        const pools: Question[][] = [ // Gunakan pools
             proPool.slice(counts.pro),       // Gunakan counts, Gunakan proPool
             hardPool.slice(counts.sulit),     // Gunakan counts, Gunakan hardPool
             mediumPool.slice(counts.menengah), // Gunakan counts, Gunakan mediumPool
             easyPool.slice(counts.mudah)      // Gunakan counts
        ];
        let poolIndex = 0; // Gunakan poolIndex
        while(finalQuestions.length < totalQuestions && pools.some(p => p.length > 0)) { // Gunakan pools
             const pool = pools[poolIndex % pools.length]; // Gunakan pools & poolIndex
             if (pool && pool.length > 0) { finalQuestions.push(pool.shift()!); }
             poolIndex++; // Gunakan poolIndex
             if (pools.every(p => p.length === 0) && poolIndex > pools.length * 2) break; // Gunakan pools & poolIndex
        }

        finalQuestions = finalQuestions.slice(0, totalQuestions);
        return this.shuffleArray(finalQuestions); // Panggil shuffleArray
    } // <-- Akhir selectQuestions()

  // --- Fungsi shuffleArray (Gunakan parameter array dan randomIndex) ---
  private shuffleArray<T>(array: T[]): T[] { // Gunakan array
    // PERBAIKAN TS6133: Gunakan randomIndex
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex); // Gunakan randomIndex
      currentIndex--;
      [array[currentIndex]!, array[randomIndex]!] = [
        array[randomIndex]!, array[currentIndex]! // Gunakan randomIndex
      ];
    }
    return array; // <-- Return value
  } // <-- Akhir shuffleArray()

  // Helper SFX (Tambahkan override)
  protected override playSound(key: string, config?: Phaser.Types.Sound.SoundConfig) {
      super.playSound(key, config);
  } // <-- Akhir playSound()

  // --- HAPUS SEMUA DEKLARASI FUNGSI SISA DI BAWAH INI ---
  // Pastikan tidak ada lagi deklarasi seperti:
  // selectQuestions(...);
  // shuffleArray(...);

} // Akhir Class
