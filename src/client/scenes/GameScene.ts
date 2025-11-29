import { Question, DifficultyKey } from '../questions';
import { BaseScene } from './BaseScene';
import { SettingsManager } from '../lib/Settings';
import { getQuestionsForVersion } from '../version';

type Mode = 'belajar' | 'survive';

type DifficultyConfig = {
  totalQuestions: number;
  totalTime: number;
  perQuestionTime: number;
  initialLives: number;
  scoreBase: number;
  timeMultiplier: number;
  timeCeiling: boolean;
  mix?: { mudah: number; menengah: number; sulit: number; pro?: number };
};

const difficultySettings: Record<DifficultyKey, DifficultyConfig> = {
  mudah:    { totalQuestions: 20, totalTime: 180, perQuestionTime: 10, initialLives: 3, scoreBase: 1,   timeMultiplier: 1,   timeCeiling: false, mix: { mudah: 0.9, menengah: 0.1, sulit: 0.0 } },
  menengah: { totalQuestions: 20, totalTime: 180, perQuestionTime: 10, initialLives: 3, scoreBase: 2,   timeMultiplier: 1.5, timeCeiling: true,  mix: { mudah: 0.1, menengah: 0.8, sulit: 0.1 } },
  sulit:    { totalQuestions: 20, totalTime: 180, perQuestionTime: 10, initialLives: 2, scoreBase: 2.5, timeMultiplier: 2,   timeCeiling: true,  mix: { mudah: 0.0, menengah: 0.1, sulit: 0.9 } },
  // FIX: penuhi tipe mix (mudah & menengah wajib ada)
  pro:      { totalQuestions: 20, totalTime: 150, perQuestionTime: 10, initialLives: 1, scoreBase: 5,   timeMultiplier: 2,   timeCeiling: false, mix: { mudah: 0.0, menengah: 0.0, sulit: 1.0 } },
};

export class Game extends BaseScene {
  private mode: Mode = 'belajar';
  private difficulty: DifficultyKey = 'mudah';
  private cfg!: DifficultyConfig;

  // data
  private questions: Question[] = [];
  private currentQuestionIndex = 0;
  private score = 0;
  private lives = 0;

  // timer
  private sessionTimeRemaining = 0; // belajar
  private perQuestionRemaining = 0; // survive
  private questionStartMs = 0;
  private timerEvent: Phaser.Time.TimerEvent | null = null;

  // UI
  private scoreText: Phaser.GameObjects.Text | null = null;
  private timerText: Phaser.GameObjects.Text | null = null;
  private livesText: Phaser.GameObjects.Text | null = null;
  private questionText: Phaser.GameObjects.Text | null = null;

  private activeOptionButtons: Phaser.GameObjects.Container[] = [];

  // guard klik ganda
  private isLocked = false;

  constructor() { super('GameScene'); }

  public init(data: { mode?: Mode; difficulty?: DifficultyKey }) {
    if (data?.mode) this.mode = data.mode;
    if (data?.difficulty) this.difficulty = data.difficulty;
    this.cfg = difficultySettings[this.difficulty];
  }

  public override create() {
    super.create();

    // hapus tombol kembali di mode game
    if (this.backButton) {
      this.backButton.destroy();
      // @ts-ignore
      this.backButton = undefined;
    }

    this.resetState();
    this.buildHUD();
    this.prepareQuestions();
    this.startTimer();
    this.showQuestion();

    this.events.once('shutdown', this.onShutdown, this);
    this.events.once('destroy', this.onShutdown, this);
  }

  private resetState() {
    this.score = 0;
    this.currentQuestionIndex = 0;
    this.isLocked = false;

    if (this.mode === 'survive') {
      this.lives = this.cfg.initialLives;
      this.perQuestionRemaining = this.cfg.perQuestionTime;
      this.sessionTimeRemaining = 0;
    } else {
      this.lives = 0; // tidak dipakai
      this.sessionTimeRemaining = this.cfg.totalTime;
      this.perQuestionRemaining = 0;
    }

    this.clearOptionButtons();
    this.timerEvent?.remove();
    this.timerEvent = null;
  }

  // Responsif: skala font HUD & pertanyaan
  private getHudFontPx() {
    const s = Math.min(this.scale.width, this.scale.height);
    return Math.max(14, Math.round(s * 0.035));
  }
  private getQuestionFontPx() {
    const f = Math.min(this.scale.width * 0.055, this.scale.height * 0.06);
    return Math.max(16, Math.round(f));
  }

  private buildHUD() {
    const topY = 50;
    const hudFont = this.getHudFontPx();

    this.scoreText = this.add.text(this.scale.width * 0.1, topY, `Skor: ${this.score.toFixed(1)}`, {
      fontFamily: 'Nunito', fontSize: `${hudFont}px`, color: '#000'
    }).setOrigin(0, 0.5);

    const timeVal = this.mode === 'survive' ? this.perQuestionRemaining : this.sessionTimeRemaining;
    this.timerText = this.add.text(this.centerX, topY, `Waktu: ${timeVal}`, {
      fontFamily: 'Nunito', fontSize: `${hudFont}px`, color: '#000'
    }).setOrigin(0.5);

    this.livesText = this.add.text(this.scale.width * 0.9, topY, `Nyawa: ${this.lives}`, {
      fontFamily: 'Nunito', fontSize: `${hudFont}px`, color: '#000'
    }).setOrigin(1, 0.5);

    if (this.mode === 'belajar') this.livesText.setVisible(false);
  }

  private prepareQuestions() {
    // Ambil versi dari Settings
    const version = SettingsManager.get().version;
    const bank = getQuestionsForVersion(version);
    const n = Math.min(this.cfg.totalQuestions, bank.length);
    this.questions = bank.slice(0, n);
    this.currentQuestionIndex = 0;
  }

  private startTimer() {
    this.timerEvent?.remove();
    this.timerEvent = this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        if (!this.scene.isActive()) return;

        if (this.mode === 'survive') {
          if (this.perQuestionRemaining > 0) {
            this.perQuestionRemaining -= 1;
            this.timerText?.setText(`Waktu: ${this.perQuestionRemaining}`);
            if (this.perQuestionRemaining === 0) this.handleTimeoutSurvive();
          }
        } else {
          if (this.sessionTimeRemaining > 0) {
            this.sessionTimeRemaining -= 1;
            this.timerText?.setText(`Waktu: ${this.sessionTimeRemaining}`);
            if (this.sessionTimeRemaining === 0) this.endGame();
          }
        }
      }
    });
  }

  private handleTimeoutSurvive() {
    this.lives = Math.max(0, this.lives - 1);
    this.livesText?.setText(`Nyawa: ${this.lives}`);
    if (this.lives <= 0) { this.endGame(); return; }
    this.currentQuestionIndex += 1;
    this.perQuestionRemaining = this.cfg.perQuestionTime;
    this.showQuestion();
  }

  private showQuestion() {
    this.clearOptionButtons();
    this.isLocked = false;

    const q = this.questions[this.currentQuestionIndex];
    if (!q) { this.endGame(); return; }

    if (this.mode === 'survive') {
      this.perQuestionRemaining = this.cfg.perQuestionTime;
      this.timerText?.setText(`Waktu: ${this.perQuestionRemaining}`);
    }

    this.questionStartMs = this.time.now;

    if (this.questionText) this.questionText.destroy();
    const qFont = this.getQuestionFontPx();
    this.questionText = this.add.text(this.centerX, this.scale.height * 0.25, q.question, {
      fontFamily: 'Nunito',
      fontSize: `${qFont}px`,
      color: '#000',
      align: 'center',
      wordWrap: { width: Math.floor(this.scale.width * 0.9) }
    }).setOrigin(0.5);

    const startY = this.scale.height * 0.38;
    const space = Math.max(56, Math.round(this.scale.height * 0.10));
    q.options.forEach((opt, i) => {
      const y = startY + i * space;
      this.createOptionButton(y, opt, () => this.onChoose(i));
    });
  }

  private getAnswerIndex(q: Question): number {
    return (q as any).answerIndex ?? (q as any).correctAnswerIndex ?? -1;
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
      fontSize: `${Math.max(14, Math.floor(height * 0.38))}px`,
      color: '#000',
      align: 'center',
      wordWrap: { width: Math.floor(width * 0.9) }
    }).setOrigin(0.5);
    container.add(txt);

    const zone = this.add.zone(0, 0, width, height).setOrigin(0.5);
    zone.setInteractive({ useHandCursor: true });
    container.add(zone);

    zone.on('pointerover', () => {
      if (this.isLocked) return;
      this.updateButtonGraphics(g, width, height, 0xf5f5f5, 0x000000, 3, radius);
    });
    zone.on('pointerout', () => {
      if (this.isLocked) return;
      this.updateButtonGraphics(g, width, height, 0xffffff, 0x000000, 3, radius);
    });
    zone.on('pointerdown', () => {
      if (this.isLocked) return;
      this.updateButtonGraphics(g, width, height, 0xdddddd, 0x000000, 3, radius);
    });
    zone.on('pointerup', () => {
      if (this.isLocked) return;
      this.updateButtonGraphics(g, width, height, 0xf5f5f5, 0x000000, 3, radius);
      // Suara klik
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

  private highlightCorrect(correctIdx: number) {
    const btn = this.activeOptionButtons[correctIdx];
    if (!btn) return;
    const width = (btn as any).width ?? 200;
    const height = (btn as any).height ?? 48;
    const radius = Math.min(24, Math.floor(height * 0.35));
    const g = btn.getAt(0) as Phaser.GameObjects.Graphics;
    this.updateButtonGraphics(g, width, height, 0xd4edda, 0x28a745, 3, radius);
  }

  private onChoose(optionIndex: number) {
    if (this.isLocked) return;
    this.isLocked = true;

    const q = this.questions[this.currentQuestionIndex];
    if (!q) return;

    const correctIdx = this.getAnswerIndex(q);
    const correct = optionIndex === correctIdx;

    // Suara benar/salah
    if (correct) {
      this.playSound('sfx_correct', { volume: 1 });
    } else {
      this.playSound('sfx_incorrect', { volume: 1 });
    }

    if (this.mode === 'belajar') {
      const elapsedSec = Math.max(0, Math.min(10, Math.floor((this.time.now - this.questionStartMs) / 1000)));
      const base = this.cfg.scoreBase;
      const bonus = Math.max(0, (10 - elapsedSec)) * this.cfg.timeMultiplier;
      const add = base + bonus;

      if (correct) {
        this.score += add;
        this.scoreText?.setText(`Skor: ${this.score.toFixed(1)}`);
        this.gotoNextQuestion(200);
      } else {
        this.highlightCorrect(correctIdx);
        this.gotoNextQuestion(900);
      }
    } else {
      if (correct) {
        this.score += 10;
        this.scoreText?.setText(`Skor: ${this.score.toFixed(1)}`);
      } else {
        this.highlightCorrect(correctIdx);
        this.lives = Math.max(0, this.lives - 1);
        this.livesText?.setText(`Nyawa: ${this.lives}`);
        if (this.lives <= 0) { this.endGame(); return; }
      }

      this.currentQuestionIndex += 1;
      if (this.currentQuestionIndex >= this.cfg.totalQuestions) { this.endGame(); return; }
      const delay = correct ? 150 : 700;
      this.time.delayedCall(delay, () => {
        this.perQuestionRemaining = this.cfg.perQuestionTime;
        this.showQuestion();
      });
    }
  }

  private gotoNextQuestion(delayMs = 400) {
    this.time.delayedCall(delayMs, () => {
      this.currentQuestionIndex += 1;
      if (this.currentQuestionIndex >= this.cfg.totalQuestions) { this.endGame(); return; }
      this.showQuestion();
    });
  }

  private endGame() {
    this.timerEvent?.remove();
    this.timerEvent = null;
    const duration = this.mode === 'belajar' ? (this.cfg.totalTime - this.sessionTimeRemaining) : 0;
    this.scene.start('ResultsScene', { score: this.score, mode: this.mode, duration });
  }

  private onShutdown() {
    this.timerEvent?.remove();
    this.timerEvent = null;
    this.clearOptionButtons();
    this.input.removeAllListeners();
  }

  public override draw() {
    super.draw();

    const topY = 50;
    const hudFont = this.getHudFontPx();

    this.scoreText?.setPosition(this.scale.width * 0.1, topY).setStyle({ fontSize: `${hudFont}px` });
    const timeVal = this.mode === 'survive' ? this.perQuestionRemaining : this.sessionTimeRemaining;
    this.timerText?.setPosition(this.centerX, topY).setText(`Waktu: ${timeVal}`).setStyle({ fontSize: `${hudFont}px` });
    if (this.mode === 'survive') {
      this.livesText?.setPosition(this.scale.width * 0.9, topY).setVisible(true).setText(`Nyawa: ${this.lives}`).setStyle({ fontSize: `${hudFont}px` });
    } else {
      this.livesText?.setVisible(false);
    }

    const qFont = this.getQuestionFontPx();
    this.questionText?.setPosition(this.centerX, this.scale.height * 0.25);
    if (this.questionText) {
      this.questionText.setStyle({
        fontSize: `${qFont}px`,
        wordWrap: { width: Math.floor(this.scale.width * 0.9) },
        align: 'center',
        color: '#000'
      });
    }

    if (this.activeOptionButtons.length > 0) {
      const width = Math.round(this.scale.width * 0.9);
      const height = Math.max(48, Math.round(this.scale.height * 0.08));
      const radius = Math.min(24, Math.floor(height * 0.35));
      const startY = this.scale.height * 0.38;
      const space = Math.max(56, Math.round(this.scale.height * 0.10));

      this.activeOptionButtons.forEach((btn, i) => {
        btn.setPosition(this.centerX, startY + i * space);
        (btn as any).width = width;
        (btn as any).height = height;

        const g = btn.getAt(0) as Phaser.GameObjects.Graphics;
        const txt = btn.getAt(1) as Phaser.GameObjects.Text;
        const zone = btn.getAt(2) as Phaser.GameObjects.Zone;

        this.updateButtonGraphics(g, width, height, 0xffffff, 0x000000, 3, radius);
        txt.setStyle({
          fontSize: `${Math.max(14, Math.floor(height * 0.38))}px`,
          wordWrap: { width: Math.floor(width * 0.9) },
          align: 'center',
          color: '#000'
        });
        zone.setSize(width, height).setPosition(0, 0);
      });
    }
  }
}
