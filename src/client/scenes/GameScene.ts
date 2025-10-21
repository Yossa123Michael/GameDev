import Phaser from 'phaser';
import { quizQuestions, Question } from '../questions';
import { BaseScene } from './BaseScene'; // Import BaseScene

// ... (Salin 'DifficultySettings' type dari file lama Anda) ...
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
  // ... (Salin semua properti private dari file lama Anda) ...
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
  private optionButtons: Phaser.GameObjects.Container[] = [];
  private feedbackText!: Phaser.GameObjects.Text;

  constructor() {
    super('GameScene');
  }

  init(data: { mode: string; difficulty: string }) {
    this.mode = data.mode;
    this.difficulty = data.difficulty;
  }

  create() {
    // --- Bagian Setup (Hanya sekali) ---
    const settings = this.difficultySettings[this.difficulty];
    if (!settings) {
      this.scene.start('MainMenuScene');
      return;
    }

    this.questions = this.selectQuestions(this.difficulty);
    if (this.questions.length < settings.totalQuestions) {
      alert(`Error: Bank soal tidak cukup`);
      this.scene.start('MainMenuScene');
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
    
    // Panggil create dari BaseScene (wajib)
    super.create();
    
    // --- Panggil Draw (Visual) ---
    this.draw();
  }

  draw() {
    super.draw(); // Bersihkan layar

    // --- Gambar Ulang Semua Elemen Visual ---
    
    // Posisi UI dinamis
    const topMargin = this.scale.height * 0.1;
    this.scoreText = this.add.text(this.scale.width * 0.1, topMargin, `Skor: ${this.score}`, {
      fontSize: '24px',
      color: '#000',
    }).setOrigin(0, 0.5);

    this.timerText = this.add.text(this.centerX, topMargin, `Waktu: ${this.remainingTime}`, {
      fontSize: '24px',
      color: '#000',
    }).setOrigin(0.5, 0.5);

    if (this.mode === 'survive') {
      this.livesText = this.add.text(this.scale.width * 0.9, topMargin, `Nyawa: ${this.lives}`, {
        fontSize: '24px',
        color: '#000',
      }).setOrigin(1, 0.5);
    }

    // Teks Pertanyaan
    this.questionText = this.add.text(this.centerX, this.scale.height * 0.25, '', {
      fontSize: '32px',
      color: '#000',
      align: 'center',
      wordWrap: { width: this.scale.width * 0.9 },
    }).setOrigin(0.5);

    // Teks Feedback
    this.feedbackText = this.add.text(this.centerX, this.scale.height * 0.9, '', {
      fontSize: '28px',
      color: '#000',
    }).setOrigin(0.5);

    // Tampilkan pertanyaan (akan menggambar tombol)
    this.displayQuestion();
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
    // Hapus tombol lama saja
    this.optionButtons.forEach(button => button.destroy());
    this.optionButtons = [];
    this.feedbackText.setText('');

    const currentQuestion = this.questions[this.currentQuestionIndex];
    if (!currentQuestion) {
      this.gameOver();
      return;
    }

    this.questionText.setText(currentQuestion.question);

    const buttonLabels = ['A', 'B', 'C', 'D'];
    const correctAnswerText = currentQuestion.options[currentQuestion.correctAnswerIndex];
    const shuffledOptions = this.shuffleArray([...currentQuestion.options]);

    // Posisi tombol dinamis
    let startY = this.scale.height * 0.45;
    const buttonSpacing = this.scale.height * 0.12;

    shuffledOptions.forEach((optionText, index) => {
      const buttonLabel = `${buttonLabels[index]}. ${optionText}`;
      const button = this.createButton(
        startY,
        buttonLabel,
        optionText,
        correctAnswerText
      );
      this.optionButtons.push(button);
      startY += buttonSpacing;
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

    const buttonText = this.add.text(0, 0, labelText, {
      fontSize: '20px',
      color: '#000000',
      align: 'left',
      wordWrap: { width: buttonWidth - 40 },
    }).setOrigin(0.5);

    const container = this.add.container(this.centerX, y, [buttonRect, buttonText]);
    container.setSize(buttonWidth, buttonHeight);
    container.setInteractive({ useHandCursor: true });
    container.setData('optionText', optionText);
    container.setData('correctAnswerText', correctAnswerText);

    container.on('pointerdown', () => this.handleAnswer(container));
    container.on('pointerover', () => (buttonRect as Phaser.GameObjects.Rectangle).setFillStyle(0xeeeeee));
    container.on('pointerout', () => (buttonRect as Phaser.GameObjects.Rectangle).setFillStyle(0xffffff));
    return container;
  }
  
  // ... (Salin sisa fungsi: handleAnswer, nextQuestion, gameOver, selectQuestions, shuffleArray) ...
  // ... dari file GameScene.ts lama Anda ...
  
  handleAnswer(selectedButton: Phaser.GameObjects.Container) {
    const selectedOptionText = selectedButton.getData('optionText');
    const correctAnswerText = selectedButton.getData('correctAnswerText');
    const selectedButtonRect = selectedButton.getAt(0) as Phaser.GameObjects.Rectangle;

    this.optionButtons.forEach(button => button.removeInteractive());
    this.timerEvent.paused = true;

    if (selectedOptionText === correctAnswerText) {
      this.score += 10;
      this.feedbackText.setText('BENAR!').setColor('#4CAF50');
      selectedButtonRect.setFillStyle(0x4CAF50);
    } else {
      if (this.mode === 'survive') {
        this.lives -= 1;
        this.livesText.setText(`Nyawa: ${this.lives}`);
      }
      this.feedbackText.setText('SALAH!').setColor('#F44336');
      selectedButtonRect.setFillStyle(0xF44336);

      const correctButton = this.optionButtons.find(
        button => button.getData('optionText') === correctAnswerText
      );
      if (correctButton) {
        const correctButtonRect = correctButton.getAt(0) as Phaser.GameObjects.Rectangle;
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
    this.draw(); // Panggil draw() untuk menggambar ulang pertanyaan baru
  }

  gameOver() {
    this.timerEvent.remove();
    this.scene.start('ResultsScene', { score: this.score });
  }

  selectQuestions(difficulty: string): Question[] {
    const settings = this.difficultySettings[difficulty];
    if (!settings) { return []; }

    const easyPool = this.shuffleArray(quizQuestions.filter((q: Question) => q.difficulty === 'mudah'));
    const mediumPool = this.shuffleArray(quizQuestions.filter((q: Question) => q.difficulty === 'menengah'));
    const hardPool = this.shuffleArray(quizQuestions.filter((q: Question) => q.difficulty === 'sulit'));
    const proPool = this.shuffleArray(quizQuestions.filter((q: Question) => q.difficulty === 'pro'));

    let finalQuestions: Question[] = [];
    const easyCount = Math.round(settings.totalQuestions * settings.mix.mudah);
    const mediumCount = Math.round(settings.totalQuestions * settings.mix.menengah);
    const hardCount = Math.round(settings.totalQuestions * settings.mix.sulit);
    const proCount = Math.round(settings.totalQuestions * settings.mix.pro);

    finalQuestions = finalQuestions.concat(easyPool.slice(0, easyCount));
    finalQuestions = finalQuestions.concat(mediumPool.slice(0, mediumCount));
    finalQuestions = finalQuestions.concat(hardPool.slice(0, hardCount));
    finalQuestions = finalQuestions.concat(proPool.slice(0, proCount));

    const remainingMediumPool = mediumPool.slice(mediumCount);
    while (finalQuestions.length < settings.totalQuestions && remainingMediumPool.length > 0) {
      const extraQuestion = remainingMediumPool.pop();
      if (extraQuestion) {
        finalQuestions.push(extraQuestion);
      }
    }
    return this.shuffleArray(finalQuestions).slice(0, settings.totalQuestions);
  }

  private shuffleArray<T>(array: T[]): T[] {
    let currentIndex = array.length, randomIndex;
    while (currentIndex != 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
  }
}
