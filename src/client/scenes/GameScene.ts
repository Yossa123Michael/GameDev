import { quizQuestions, Question } from '../questions';
import { BaseScene } from './BaseScene';

type DifficultyKey = 'mudah' | 'menengah' | 'sulit' | 'pro';

export class Game extends BaseScene {
  private mode: 'belajar' | 'survive' = 'belajar';
  private difficulty: DifficultyKey = 'mudah';

  private questions: Question[] = [];
  private currentQuestionIndex = 0;

  private score = 0;
  private lives = 3;

  private remainingTime = 0;
  private perQuestionTime = 10;

  private timerEvent: Phaser.Time.TimerEvent | null = null;

  private scoreText: Phaser.GameObjects.Text | null = null;
  private timerText: Phaser.GameObjects.Text | null = null;
  private livesText: Phaser.GameObjects.Text | null = null;
  private questionText: Phaser.GameObjects.Text | null = null;

  private activeOptionButtons: Phaser.GameObjects.Container[] = [];

  constructor() {
    super('GameScene');
  }

  public init(data: { mode?: 'belajar' | 'survive'; difficulty?: DifficultyKey }) {
    if (data?.mode) this.mode = data.mode;
    if (data?.difficulty) this.difficulty = data.difficulty;
  }

  public override create() {
    super.create();

    // Hapus tombol kembali di mode game (sesuai permintaan)
    if (this.backButton) {
      this.backButton.destroy();
      // Hindari referensi lama
      // @ts-ignore
      this.backButton = undefined;
    }

    // Reset semua state agar main ulang tidak mewarisi state lama
    this.resetState();

    // Bangun HUD lalu mulai game
    this.buildHUD();
    this.prepareQuestions();
    this.startTimer();       // mulai timer per detik
    this.showQuestion();     // render pertanyaan pertama

    // Pastikan resource dibersihkan saat keluar scene
    this.events.once('shutdown', this.onShutdown, this);
    this.events.once('destroy', this.onShutdown, this);
  }

  private resetState() {
    this.score = 0;
    this.lives = this.initialLivesFor(this.difficulty);
    this.remainingTime = this.perQuestionTime;
    this.currentQuestionIndex = 0;

    // Bersihkan sisa-sisa dari permainan sebelumnya, jika ada
    this.clearOptionButtons();
    this.timerEvent?.remove();
    this.timerEvent = null;
  }

  private initialLivesFor(diff: DifficultyKey): number {
    switch (diff) {
      case 'mudah': return 3;
      case 'menengah': return 3;
      case 'sulit': return 2;
      case 'pro': return 1;
      default: return 3;
    }
  }

  private buildHUD() {
    const topY = 50;

    this.scoreText = this.add.text(this.scale.width * 0.1, topY, `Skor: ${this.score.toFixed(1)}`, {
      fontFamily: 'Nunito', fontSize: '28px', color: '#000'
    }).setOrigin(0, 0.5);

    this.timerText = this.add.text(this.centerX, topY, `Waktu: ${this.remainingTime}`, {
      fontFamily: 'Nunito', fontSize: '28px', color: '#000'
    }).setOrigin(0.5);

    this.livesText = this.add.text(this.scale.width * 0.9, topY, `Nyawa: ${this.lives}`, {
      fontFamily: 'Nunito', fontSize: '28px', color: '#000'
    }).setOrigin(1, 0.5);
  }

  private prepareQuestions() {
    // TODO: sesuaikan dengan generator soal yang kamu punya
    // Untuk contoh, ambil 20 soal pertama (atau sesuai difficulty)
    this.questions = quizQuestions.slice(0, 20);
    this.currentQuestionIndex = 0;
  }

  private startTimer() {
    // Pastikan timer sebelumnya dimatikan
    this.timerEvent?.remove();
    this.timerEvent = this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        // Jika scene sudah non-aktif, jangan apa-apa
        if (!this.scene.isActive()) return;

        if (this.remainingTime > 0) {
          this.remainingTime -= 1;
          this.timerText?.setText(`Waktu: ${this.remainingTime}`);
          if (this.remainingTime === 0) {
            this.handleTimeout();
          }
        }
      }
    });
  }

  private handleTimeout() {
    this.lives = Math.max(0, this.lives - 1);
    this.livesText?.setText(`Nyawa: ${this.lives}`);

    if (this.lives <= 0) {
      this.endGame();
      return;
    }

    // Anggap jawaban salah dan lanjut ke soal berikutnya
    this.currentQuestionIndex += 1;
    this.remainingTime = this.perQuestionTime;
    this.showQuestion();
  }

  // ================== Render pertanyaan & opsi ==================
  private showQuestion() {
    this.clearOptionButtons();

    const q = this.questions[this.currentQuestionIndex];
    if (!q) {
      this.endGame();
      return;
    }

    // Reset waktu per pertanyaan
    this.remainingTime = this.perQuestionTime;
    this.timerText?.setText(`Waktu: ${this.remainingTime}`);

    // Teks pertanyaan rata TENGAH
    if (this.questionText) this.questionText.destroy();
    this.questionText = this.add.text(this.centerX, this.scale.height * 0.25, q.question, {
      fontFamily: 'Nunito',
      fontSize: '36px',
      color: '#000',
      align: 'center',
      wordWrap: { width: Math.floor(this.scale.width * 0.9) }
    }).setOrigin(0.5);

    // Buat opsi sebagai tombol penuh (zona interaktif menutupi kotak + teks)
    const startY = this.scale.height * 0.38;
    const space = Math.max(64, Math.round(this.scale.height * 0.11));

    q.options.forEach((opt, i) => {
      const y = startY + i * space;
      this.createOptionButton(y, opt, () => this.onChoose(i));
    });
  }

  private createOptionButton(centerY: number, label: string, onClick: () => void): Phaser.GameObjects.Container {
    const width = Math.round(this.scale.width * 0.9);
    const height = Math.max(48, Math.round(this.scale.height * 0.08));
    const radius = Math.min(24, Math.floor(height * 0.35));

    const container = this.add.container(this.centerX, centerY);
    (container as any).width = width;
    (container as any).height = height;

    const g = this.add.graphics();
    this.updateButtonGraphics(g, width, height, 0xffffff, 0x000000, 3, radius);
    container.add(g);

    const txt = this.add.text(0, 0, label, {
      fontFamily: 'Nunito',
      fontSize: `${Math.max(16, Math.floor(height * 0.38))}px`,
      color: '#000',
      align: 'center',
      wordWrap: { width: Math.floor(width * 0.9) }
    }).setOrigin(0.5);
    container.add(txt);

    const zone = this.add.zone(0, 0, width, height).setOrigin(0.5);
    zone.setInteractive({ useHandCursor: true });
    container.add(zone);

    zone.on('pointerover', () => this.updateButtonGraphics(g, width, height, 0xf5f5f5));
    zone.on('pointerout', () => this.updateButtonGraphics(g, width, height, 0xffffff));
    zone.on('pointerdown', () => this.updateButtonGraphics(g, width, height, 0xdddddd));
    zone.on('pointerup', () => {
      this.updateButtonGraphics(g, width, height, 0xf5f5f5);
      this.playSound('sfx_click');
      onClick();
    });

    this.activeOptionButtons.push(container);
    return container;
  }

  private clearOptionButtons() {
    this.activeOptionButtons.forEach(c => c.destroy());
    this.activeOptionButtons = [];
  }

  private onChoose(optionIndex: number) {
    const q = this.questions[this.currentQuestionIndex];
    if (!q) return;

    const correct = optionIndex === q.answerIndex;
    if (correct) {
      // Contoh scoring sederhana
      this.score += 10;
      this.scoreText?.setText(`Skor: ${this.score.toFixed(1)}`);
    } else {
      this.lives = Math.max(0, this.lives - 1);
      this.livesText?.setText(`Nyawa: ${this.lives}`);
      if (this.lives <= 0) {
        this.endGame();
        return;
      }
    }

    // Lanjut ke soal berikutnya
    this.currentQuestionIndex += 1;
    this.remainingTime = this.perQuestionTime;
    this.showQuestion();
  }

  private endGame() {
    // Hentikan timer agar tidak bocor ke scene berikutnya
    this.timerEvent?.remove();
    this.timerEvent = null;

    // Pindah ke hasil
    this.scene.start('ResultsScene', {
      score: this.score,
      mode: this.mode,
      duration: 0
    });
  }

  private onShutdown() {
    // Bersihkan semua supaya saat main ulang tidak freeze
    this.timerEvent?.remove();
    this.timerEvent = null;
    this.clearOptionButtons();
    this.input.removeAllListeners();
  }

  // Saat resize, cukup relayout UI tanpa membangun ulang tombol (agar tidak rebind handler)
  public override draw() {
    super.draw();

    const topY = 50;
    this.scoreText?.setPosition(this.scale.width * 0.1, topY);
    this.timerText?.setPosition(this.centerX, topY);
    this.livesText?.setPosition(this.scale.width * 0.9, topY);

    // Relayout pertanyaan dan opsi
    this.questionText?.setPosition(this.centerX, this.scale.height * 0.25);
    if (this.questionText) {
      this.questionText.setStyle({ wordWrap: { width: Math.floor(this.scale.width * 0.9) } });
    }

    if (this.activeOptionButtons.length > 0) {
      const width = Math.round(this.scale.width * 0.9);
      const height = Math.max(48, Math.round(this.scale.height * 0.08));
      const radius = Math.min(24, Math.floor(height * 0.35));
      const startY = this.scale.height * 0.38;
      const space = Math.max(64, Math.round(this.scale.height * 0.11));

      this.activeOptionButtons.forEach((btn, i) => {
        btn.setPosition(this.centerX, startY + i * space);
        (btn as any).width = width;
        (btn as any).height = height;

        // children: [graphics, text, zone]
        const g = btn.getAt(0) as Phaser.GameObjects.Graphics;
        const txt = btn.getAt(1) as Phaser.GameObjects.Text;
        const zone = btn.getAt(2) as Phaser.GameObjects.Zone;

        this.updateButtonGraphics(g, width, height, 0xffffff);
        txt.setStyle({
          fontSize: `${Math.max(16, Math.floor(height * 0.38))}px`,
          wordWrap: { width: Math.floor(width * 0.9) },
          align: 'center',
          color: '#000'
        });
        zone.setSize(width, height).setPosition(0, 0);
      });
    }
  }
}
