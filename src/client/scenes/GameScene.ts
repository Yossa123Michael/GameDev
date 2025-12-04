import { Question, DifficultyKey } from '../questions';
import { BaseScene } from './BaseScene';
import { SettingsManager } from '../lib/Settings';
import { getQuestionsForVersion } from '../version';

type Mode = 'belajar' | 'survive';
type DifficultyConfig = {
  totalQuestions: number; totalTime: number; perQuestionTime: number;
  initialLives: number; scoreBase: number; timeMultiplier: number; timeCeiling: boolean;
};

const difficultySettings: Record<DifficultyKey, DifficultyConfig> = {
  mudah:    { totalQuestions: 20, totalTime: 180, perQuestionTime: 10, initialLives: 3, scoreBase: 1,   timeMultiplier: 1,   timeCeiling: false },
  menengah: { totalQuestions: 20, totalTime: 180, perQuestionTime: 10, initialLives: 3, scoreBase: 2,   timeMultiplier: 1.5, timeCeiling: true  },
  sulit:    { totalQuestions: 20, totalTime: 180, perQuestionTime: 10, initialLives: 2, scoreBase: 2.5, timeMultiplier: 2,   timeCeiling: true  },
  pro:      { totalQuestions: 20, totalTime: 150, perQuestionTime: 10, initialLives: 1, scoreBase: 5,   timeMultiplier: 2,   timeCeiling: false },
};

export class Game extends BaseScene {
  private mode: Mode = 'belajar';
  private difficulty: DifficultyKey = 'mudah';
  private cfg!: DifficultyConfig;

  private questions: Question[] = [];
  private currentQuestionIndex = 0;
  private score = 0;
  private lives = 0;

  private sessionTimeRemaining = 0;
  private perQuestionRemaining = 0;
  private questionStartMs = 0;
  private timerEvent: Phaser.Time.TimerEvent | null = null;

  private scoreText!: Phaser.GameObjects.Text;
  private timerText!: Phaser.GameObjects.Text;
  private livesText!: Phaser.GameObjects.Text;
  private titleText!: Phaser.GameObjects.Text;

  private optionButtons: Phaser.GameObjects.Container[] = [];
  private isLocked = false;
  private achievementPopup?: Phaser.GameObjects.Container;

  constructor() { super('GameScene'); }
  init(data: { mode?: Mode; difficulty?: DifficultyKey }) { if (data?.mode) this.mode = data.mode; if (data?.difficulty) this.difficulty = data.difficulty; this.cfg = difficultySettings[this.difficulty]; }

  public override create() {
    super.create();
    this.hideBackIcon();

    this.resetState();
    this.buildHUD();
    this.prepareQuestions();
    this.startTimer();
    this.showQuestion();

    this.events.once('shutdown', this.onShutdown, this);
    this.events.once('destroy', this.onShutdown, this);
  }

  private buildHUD() {
    const headerAreaHeight = Math.round(this.panelHeight * 0.3125);
    const hudY = this.panelTop + Math.min(headerAreaHeight - 20, 20);
    const fontPx = Math.max(14, Math.round(Math.min(this.scale.width, this.scale.height) * 0.035));

    this.scoreText = this.add.text(this.panelLeft + 16, hudY, `Score: ${this.score.toFixed(1)}`, { fontFamily: 'Nunito', fontSize: `${fontPx}px`, color: '#000' }).setOrigin(0, 0.5);
    const timeVal = this.mode === 'survive' ? this.perQuestionRemaining : this.sessionTimeRemaining;
    this.timerText = this.add.text(this.centerX, hudY, `Waktu: ${timeVal}`, { fontFamily: 'Nunito', fontSize: `${fontPx}px`, color: '#000' }).setOrigin(0.5, 0.5);
    this.livesText = this.add.text(this.panelLeft + this.panelWidth - 16, hudY, `Nyawa: ${this.lives}`, { fontFamily: 'Nunito', fontSize: `${fontPx}px`, color: '#000' }).setOrigin(1, 0.5);
    if (this.mode === 'belajar') this.livesText.setVisible(false);

    this.titleText = this.add.text(this.centerX, hudY + 40, 'Pertanyaan', { fontFamily: 'Nunito', fontSize: '22px', color: '#000' }).setOrigin(0.5, 0.5);
    this.add.line(this.centerX, this.titleText.y + 24, this.panelLeft + 12, 0, this.panelLeft + this.panelWidth - 12, 0, 0xdddddd).setOrigin(0.5, 0).setLineWidth(2);
  }

  private resetState() {
    this.score = 0; this.currentQuestionIndex = 0; this.isLocked = false;
    if (this.mode === 'survive') { this.lives = this.cfg.initialLives; this.perQuestionRemaining = this.cfg.perQuestionTime; this.sessionTimeRemaining = 0; }
    else { this.lives = 0; this.sessionTimeRemaining = this.cfg.totalTime; this.perQuestionRemaining = 0; }
    this.clearOptionButtons();
    this.timerEvent?.remove(); this.timerEvent = null;
  }

  private prepareQuestions() {
    const version = SettingsManager.get().version;
    const bank = getQuestionsForVersion(version);
    const n = Math.min(this.cfg.totalQuestions, bank.length);
    this.questions = bank.slice(0, n);
    this.currentQuestionIndex = 0;
  }

  private startTimer() {
    this.timerEvent?.remove();
    this.timerEvent = this.time.addEvent({
      delay: 1000, loop: true, callback: () => {
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
    this.clearOptionButtons(); this.isLocked = false;
    const q = this.questions[this.currentQuestionIndex]; if (!q) { this.endGame(); return; }

    if (this.mode === 'survive') { this.perQuestionRemaining = this.cfg.perQuestionTime; this.timerText?.setText(`Waktu: ${this.perQuestionRemaining}`); }
    this.questionStartMs = this.time.now;

    const heightPx = 48;
    const startY = this.titleText.y + 62;
    q.options.forEach((opt, i) => {
      const btn = this.createWidePill(opt, () => this.onChoose(i), 0.86, heightPx);
      btn.setPosition(this.centerX, startY + i * Math.max(56, Math.round(this.scale.height * 0.09)));
      this.optionButtons.push(btn);
    });
  }

  private onChoose(optionIndex: number) {
    if (this.isLocked) return; this.isLocked = true;
    const q = this.questions[this.currentQuestionIndex]; if (!q) return;
    const correctIdx = (q as any).answerIndex ?? (q as any).correctAnswerIndex ?? -1;
    const correct = optionIndex === correctIdx;

    if (this.mode === 'belajar') {
      const elapsed = Math.max(0, Math.min(10, Math.floor((this.time.now - this.questionStartMs) / 1000)));
      const add = correct ? (this.cfg.scoreBase + Math.max(0, (10 - elapsed)) * this.cfg.timeMultiplier) : 0;
      if (correct) { this.score += add; this.scoreText?.setText(`Score: ${this.score.toFixed(1)}`); this.showAchievementPopup('Achievement'); this.gotoNext(220); }
      else { this.gotoNext(900); }
    } else {
      if (correct) { this.score += 10; this.scoreText?.setText(`Score: ${this.score.toFixed(1)}`); }
      else { this.lives = Math.max(0, this.lives - 1); this.livesText?.setText(`Nyawa: ${this.lives}`); if (this.lives <= 0) { this.endGame(); return; } }
      this.currentQuestionIndex += 1;
      if (this.currentQuestionIndex >= this.cfg.totalQuestions) { this.endGame(); return; }
      const delay = correct ? 150 : 700;
      this.time.delayedCall(delay, () => { this.perQuestionRemaining = this.cfg.perQuestionTime; this.showQuestion(); });
    }
  }

  private gotoNext(delayMs = 400) {
    this.time.delayedCall(delayMs, () => {
      this.currentQuestionIndex += 1;
      if (this.currentQuestionIndex >= this.cfg.totalQuestions) { this.endGame(); return; }
      this.showQuestion();
    });
  }

  private showAchievementPopup(text: string) {
    try { this.achievementPopup?.destroy(true); } catch {}
    const w = Math.min(280, Math.round(this.panelWidth * 0.7));
    const h = 40;
    const c = this.add.container(0, 0).setDepth(999);
    const bg = this.add.rectangle(this.centerX, this.panelTop + 12 + h / 2, w, h, 0xffffff).setStrokeStyle(2, 0x000000).setOrigin(0.5);
    const t = this.add.text(bg.x, bg.y, text, { fontFamily: 'Nunito', fontSize: '16px', color: '#000' }).setOrigin(0.5);
    c.add([bg, t]); this.achievementPopup = c;
    this.time.delayedCall(1200, () => { try { this.achievementPopup?.destroy(true); } catch {} });
  }

  private clearOptionButtons() { this.optionButtons.forEach(b => b.destroy()); this.optionButtons = []; }

  private endGame() { this.timerEvent?.remove(); this.timerEvent = null; this.scene.start('ResultsScene', { score: this.score, mode: this.mode }); }

  private onShutdown() { this.timerEvent?.remove(); this.timerEvent = null; this.clearOptionButtons(); this.input.removeAllListeners(); try { this.achievementPopup?.destroy(true); } catch {} }

  public override draw() {
    const headerAreaHeight = Math.round(this.panelHeight * 0.3125);
    const hudY = this.panelTop + Math.min(headerAreaHeight - 20, 20);
    const fontPx = Math.max(14, Math.round(Math.min(this.scale.width, this.scale.height) * 0.035));
    this.scoreText?.setPosition(this.panelLeft + 16, hudY).setStyle({ fontSize: `${fontPx}px` });
    const timeVal = this.mode === 'survive' ? this.perQuestionRemaining : this.sessionTimeRemaining;
    this.timerText?.setPosition(this.centerX, hudY).setText(`Waktu: ${timeVal}`).setStyle({ fontSize: `${fontPx}px` });
    if (this.mode === 'survive') { this.livesText?.setPosition(this.panelLeft + this.panelWidth - 16, hudY).setVisible(true).setText(`Nyawa: ${this.lives}`).setStyle({ fontSize: `${fontPx}px` }); }
    else { this.livesText?.setVisible(false); }
    this.titleText?.setPosition(this.centerX, hudY + 40);
  }
}
