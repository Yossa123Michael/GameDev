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

  private currentShuffledAnswers: { text: string; isCorrect: boolean }[] = [];

  private sessionTimeRemaining = 0;
  private perQuestionRemaining = 0;
  private questionStartMs = 0;
  private timerEvent: Phaser.Time.TimerEvent | null = null;

  private scoreText!: Phaser.GameObjects.Text;
  private timerText!: Phaser.GameObjects.Text;
  private livesText!: Phaser.GameObjects.Text;
  private questionTitle!: Phaser.GameObjects.Text;

  private optionButtons: Phaser.GameObjects.Container[] = [];
  private surrenderIcon?: Phaser.GameObjects.Image;
  private isLocked = false;
  private achievementPopup?: Phaser.GameObjects.Container;

  private confirmOverlay: Phaser.GameObjects.Rectangle | null = null;
  private confirmModal: Phaser.GameObjects.Container | null = null;

  private closeConfirmModal() {
  try { this.confirmOverlay?.destroy(); } catch {}
  this.confirmOverlay = null;

  try { this.confirmModal?.destroy(true); } catch {}
  this.confirmModal = null;
}

  constructor() {
    super('Game');
  }

  init(data: { mode?: Mode; difficulty?: DifficultyKey }) {
    if (data?.mode) this.mode = data.mode;
    if (data?.difficulty) this.difficulty = data.difficulty;
    this.cfg = difficultySettings[this.difficulty];
  }

  public override create() {
    super.create();
    this.ensureBackIcon(false);

    this.resetState();
    this.buildHUD();
    this.prepareQuestions();
    this.startTimer();
    this.showQuestion();

    this.events.once('shutdown', this.onShutdown, this);
    this.events.once('destroy', this.onShutdown, this);
  }

  // ==== LAYOUT ======================================================

  /** Bangun HUD + garis + tombol surrender, dengan layout terpusat dan rapi */
  private buildHUD() {
  const base = Math.min(this.scale.width, this.scale.height);
  const contentTop = this.getContentAreaTop();

  // HUD sedikit di bawah header title
  const hudY = contentTop + Math.round(base * 0.008);

  const fontPx = Math.max(14, Math.round(base * 0.038));

  // === Surrender di pojok kiri atas (ikon Menyerah.png) ===
  const surrenderSize = Math.max(32, Math.round(base * 0.06));
  const surrenderX =
    this.centerX - this.panelWidth / 2 + 16 + surrenderSize / 2;
  const surrenderY = hudY;

  this.surrenderIcon = this.add
    .image(surrenderX, surrenderY, 'btn_surrender') // preload di BaseScene: assets/Images/Menyerah.png
    .setDisplaySize(surrenderSize, surrenderSize)
    .setOrigin(0.5)
    .setInteractive({ useHandCursor: true });

  this.surrenderIcon.on('pointerup', () => {
  this.playSound('sfx_click');
  this.showSurrenderConfirm();
});

  // === Score & Waktu di tengah atas (2 baris) ===
  const centerX = this.centerX;
  const lineGap = Math.round(fontPx * 1.1);

  this.scoreText = this.add
    .text(centerX, hudY - lineGap / 2, `Score: ${this.score.toFixed(1)}`, {
      fontFamily: 'Nunito',
      fontSize: `${fontPx}px`,
      color: '#000',
    })
    .setOrigin(0.5, 0.5);

  const timeVal =
    this.mode === 'survive'
      ? this.perQuestionRemaining
      : this.sessionTimeRemaining;

  this.timerText = this.add
    .text(centerX, hudY + lineGap / 2, `Waktu: ${timeVal}`, {
      fontFamily: 'Nunito',
      fontSize: `${fontPx}px`,
      color: '#000',
    })
    .setOrigin(0.5, 0.5);

  // === Nyawa di kanan atas ===
  this.livesText = this.add
    .text(
      this.centerX + this.panelWidth / 2 - 16,
      hudY,
      `Nyawa: ${this.lives}`,
      {
        fontFamily: 'Nunito',
        fontSize: `${fontPx}px`,
        color: '#000',
      },
    )
    .setOrigin(1, 0.5);
  if (this.mode === 'belajar') {
    this.livesText.setVisible(false);
  }

  // === Teks pertanyaan di bawah HUD (multiline, center) ===
  const questionTop = hudY + surrenderSize + Math.round(base * 0.02);
  const qFont = Math.max(18, Math.round(base * 0.042));

  this.questionTitle = this.add
    .text(this.centerX, questionTop, 'Pertanyaan', {
      fontFamily: 'Nunito',
      fontSize: `${qFont}px`,
      color: '#000',
      align: 'center',
      wordWrap: { width: this.panelWidth * 0.9 }, // wrap SEKALI di sini
    })
    .setOrigin(0.5, 0);

  const underY =
    this.questionTitle.y +
    this.questionTitle.height +
    Math.round(base * 0.015);

  this.add
    .line(
      this.centerX,
      underY,
      this.centerX - this.panelWidth / 2 + 12,
      0,
      this.centerX + this.panelWidth / 2 - 12,
      0,
      0xdddddd,
    )
    .setOrigin(0.5, 0)
    .setLineWidth(2, 2);
}

  public override draw() {
  const base = Math.min(this.scale.width, this.scale.height);
  const contentTop = this.getContentAreaTop();
  const hudY = contentTop + Math.round(base * 0.008);
  const fontPx = Math.max(14, Math.round(base * 0.038));
  const lineGap = Math.round(fontPx * 1.1);

  // Surrender icon
  if (this.surrenderIcon) {
    const surrenderSize = Math.max(32, Math.round(base * 0.06));
    const surrenderX =
      this.centerX - this.panelWidth / 2 + 16 + surrenderSize / 2;
    const surrenderY = hudY;
    this.surrenderIcon
      .setPosition(surrenderX, surrenderY)
      .setDisplaySize(surrenderSize, surrenderSize);
  }

  // Score & Waktu
  this.scoreText?.setPosition(this.centerX, hudY - lineGap / 2);
  const timeVal =
    this.mode === 'survive'
      ? this.perQuestionRemaining
      : this.sessionTimeRemaining;
  this.timerText
    ?.setPosition(this.centerX, hudY + lineGap / 2)
    .setText(`Waktu: ${timeVal}`);

  // Nyawa
  if (this.mode === 'survive') {
    this.livesText
      ?.setPosition(this.centerX + this.panelWidth / 2 - 16, hudY)
      .setVisible(true)
      .setText(`Nyawa: ${this.lives}`);
  } else {
    this.livesText?.setVisible(false);
  }

  // Pertanyaan (posisi saja, wrap sudah di buildHUD)
  if (this.questionTitle) {
    const surrenderSize = Math.max(32, Math.round(base * 0.06));
    const questionTop = hudY + surrenderSize + Math.round(base * 0.02);
    this.questionTitle.setPosition(this.centerX, questionTop);
  }
}

  // ==== GAME LOGIC (as in your file, hanya sedikit dirapikan) =======

  private resetState() {
    this.score = 0;
    this.currentQuestionIndex = 0;
    this.isLocked = false;

    if (this.mode === 'survive') {
      this.lives = this.cfg.initialLives;
      this.perQuestionRemaining = this.cfg.perQuestionTime;
      this.sessionTimeRemaining = 0;
    } else {
      this.lives = 0;
      this.sessionTimeRemaining = this.cfg.totalTime;
      this.perQuestionRemaining = 0;
    }

    this.clearOptionButtons();
    this.timerEvent?.remove();
    this.timerEvent = null;
  }

  private showSurrenderConfirm() {
  // kalau sudah ada modal, jangan buat lagi
  if (this.confirmModal || this.confirmOverlay) return;

  // pause timer event kalau ada
  if (this.timerEvent) {
    this.timerEvent.paused = true;
  }

  const base = Math.min(this.scale.width, this.scale.height);
  const boxW = Math.min(420, Math.round(this.panelWidth * 0.9));
  const paddingX = Math.round(boxW * 0.08);
  const paddingY = Math.round(base * 0.03);

  const titleFont = Math.max(18, Math.round(base * 0.045));
  const msgFont = Math.max(14, Math.round(base * 0.034));
  const btnH = Math.max(40, Math.round(base * 0.055));

  const message = 'Yakin menyerah?';

  // Hitung tinggi konten
  const msgWrapWidth = boxW - paddingX * 2;
  const tempMsg = this.add
    .text(0, 0, message, {
      fontFamily: 'Nunito',
      fontSize: `${msgFont}px`,
      color: '#000',
      align: 'center',
      wordWrap: { width: msgWrapWidth },
    })
    .setOrigin(0.5, 0.5);
  const msgHeight = tempMsg.height;
  tempMsg.destroy(); // hanya untuk mengukur

  const contentH =
    titleFont * 1.5 + // kira2 tinggi judul
    msgHeight +
    btnH +
    Math.round(base * 0.04); // jarak antar elemen

  const boxH = paddingY * 2 + Math.round(contentH);

  // overlay
  this.confirmOverlay = this.add
    .rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.4)
    .setOrigin(0, 0)
    .setDepth(3000)
    .setInteractive({ useHandCursor: false });
  //this.confirmOverlay.on('pointerup', () => this.closeConfirmModal());

  // container modal
  this.confirmModal = this.add.container(0, 0).setDepth(3100);

  const boxX = this.centerX - boxW / 2;
  const boxY = this.centerY - boxH / 2;
  const radius = Math.round(base * 0.02);

  const g = this.add.graphics();
  g.lineStyle(2, 0x000000, 1);
  g.fillStyle(0xffffff, 1);
  g.fillRoundedRect(boxX, boxY, boxW, boxH, radius);
  g.strokeRoundedRect(boxX, boxY, boxW, boxH, radius);
  this.confirmModal.add(g);

  // Judul
  const titleY = boxY + paddingY + titleFont / 2;
  const title = this.add
    .text(this.centerX, titleY, 'Yakin Menyerah?', {
      fontFamily: 'Nunito',
      fontSize: `${titleFont}px`,
      color: '#000',
    })
    .setOrigin(0.5, 0.5);
  this.confirmModal.add(title);

  // Pesan
  const msgY = titleY + titleFont + Math.round(base * 0.01);
  const msg = this.add
    .text(this.centerX, msgY, message, {
      fontFamily: 'Nunito',
      fontSize: `${msgFont}px`,
      color: '#000',
      align: 'center',
      wordWrap: { width: msgWrapWidth },
    })
    .setOrigin(0.5, 0.5);
  this.confirmModal.add(msg);

  // Tombol Ya / Tidak (kiri–kanan)
      const btnY =
    msgY + msgHeight / 2 + Math.round(base * 0.04) + btnH / 2;

  // Lebar tombol & jarak (lebih dekat)
  const btnW = Math.round(boxW * 0.32);
  const btnGap = Math.round(boxW * 0.06); // jarak antar tombol
  
  const makeButton = (
    label: string,
    xCenter: number,
    onClick: () => void,
  ) => {
    const c = this.add.container(xCenter, btnY);

    const bg = this.add.graphics();
    const r = Math.round(btnH * 0.45);
    bg.lineStyle(2, 0x000000, 1);
    bg.fillStyle(0xffffff, 1);
    bg.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, r);
    bg.strokeRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH, r);

    const txt = this.add
      .text(0, 0, label, {
        fontFamily: 'Nunito',
        fontSize: `${Math.max(14, Math.round(btnH * 0.4))}px`,
        color: '#000',
      })
      .setOrigin(0.5, 0.5);

    const zone = this.add
      .zone(0, 0, btnW, btnH)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    zone.on('pointerup', () => {
      this.playSound('sfx_click');
      onClick();
    });

    c.add([bg, txt, zone]);
    this.confirmModal!.add(c);
  };

  const leftX = this.centerX - (btnW / 2 + btnGap / 2);
  const rightX = this.centerX + (btnW / 2 + btnGap / 2);

  // Kiri: Tidak (batal)
  makeButton('Tidak', leftX, () => {
    this.closeConfirmModal();
    if (this.timerEvent) this.timerEvent.paused = false;
  });

  // Kanan: Ya (benar2 menyerah)
  makeButton('Ya', rightX, () => {
    this.closeConfirmModal();
    this.endGame();
  });
}

private prepareQuestions() {
  const version = SettingsManager.get().version;
  const bank = getQuestionsForVersion(version);

  // Shuffle bank soal (Fisher–Yates)
  for (let i = bank.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [bank[i], bank[j]] = [bank[j], bank[i]];
  }

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
      },
    });
  }

  private handleTimeoutSurvive() {
    this.lives = Math.max(0, this.lives - 1);
    this.livesText?.setText(`Nyawa: ${this.lives}`);
    if (this.lives <= 0) {
      this.endGame();
      return;
    }
    this.currentQuestionIndex += 1;
    this.perQuestionRemaining = this.cfg.perQuestionTime;
    this.showQuestion();
  }

private showQuestion() {
  this.clearOptionButtons();
  this.isLocked = false;

  const q = this.questions[this.currentQuestionIndex];
  if (!q) {
    this.endGame();
    return;
  }

  const text = (q as any).text ?? (q as any).question ?? 'Pertanyaan';
  if (this.questionTitle) {
    this.questionTitle.setText(text);
  }

  this.questionStartMs = this.time.now;

  const base = Math.min(this.scale.width, this.scale.height);
  const minHeight = Math.max(48, Math.round(base * 0.06));
  const contentWidth = this.panelWidth * 0.86;

  // Tentukan jawaban benar
  const correctIdx =
    (q as any).answerIndex ?? (q as any).correctAnswerIndex ?? -1;

  const options = q.options.map((opt, idx) => ({
    text: opt,
    isCorrect: idx === correctIdx,
  }));

  // Shuffle jawaban
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  this.currentShuffledAnswers = options;

  // Tombol mulai agak di bawah teks pertanyaan
  const startY =
    this.questionTitle.y +
    this.questionTitle.height +
    Math.round(minHeight * 0.8);

  const gap = Math.round(minHeight * 0.3);
  const paddingVertical = Math.round(minHeight * 0.25);
  const radius = Math.min(24, Math.floor(minHeight * 0.45));

  const containers: Phaser.GameObjects.Container[] = [];

  options.forEach((opt, index) => {
    const c = this.add.container(this.centerX, 0);

    const txt = this.add
      .text(0, 0, opt.text, {
        fontFamily: 'Nunito',
        fontSize: `${Math.max(14, Math.round(minHeight * 0.35))}px`,
        color: '#000',
        align: 'center',
        wordWrap: { width: contentWidth * 0.9 },
      })
      .setOrigin(0.5, 0.5);

    const textHeight = txt.height;
    const btnHeight = Math.max(
      minHeight,
      textHeight + paddingVertical * 2,
    );

    const g = this.add.graphics();
    g.lineStyle(2, 0x000000, 1);
    g.fillStyle(0xffffff, 1);
    g.fillRoundedRect(
      -contentWidth / 2,
      -btnHeight / 2,
      contentWidth,
      btnHeight,
      radius,
    );
    g.strokeRoundedRect(
      -contentWidth / 2,
      -btnHeight / 2,
      contentWidth,
      btnHeight,
      radius,
    );

    const zone = this.add
      .zone(0, 0, contentWidth, btnHeight)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    zone.on('pointerup', () => this.onChoose(index));

    c.add([g, txt, zone]);
    containers.push(c);
  });

  let y = startY;
  containers.forEach(c => {
    const zone = c.getAt(2) as Phaser.GameObjects.Zone;
    const btnHeight = zone.height;
    c.setPosition(this.centerX, y + btnHeight / 2);
    y += btnHeight + gap;
  });

  this.optionButtons = containers;
}

private onChoose(optionIndex: number) {
  if (this.isLocked) return;
  this.isLocked = true;

  const q = this.questions[this.currentQuestionIndex];
  if (!q) return;

  const selection = this.currentShuffledAnswers[optionIndex];
  const correct = selection?.isCorrect === true;

    if (this.mode === 'belajar') {
      const elapsed = Math.max(
        0,
        Math.min(10, Math.floor((this.time.now - this.questionStartMs) / 1000)),
      );
      const add = correct
        ? this.cfg.scoreBase +
          Math.max(0, 10 - elapsed) * this.cfg.timeMultiplier
        : 0;
      if (correct) {
        this.score += add;
        this.scoreText?.setText(`Score: ${this.score.toFixed(1)}`);
        this.showAchievementPopup('Achievement');
        this.gotoNext(220);
      } else {
        this.gotoNext(900);
      }
    } else {
      if (correct) {
        this.score += 10;
        this.scoreText?.setText(`Score: ${this.score.toFixed(1)}`);
      } else {
        this.lives = Math.max(0, this.lives - 1);
        this.livesText?.setText(`Nyawa: ${this.lives}`);
        if (this.lives <= 0) {
          this.endGame();
          return;
        }
      }
      this.currentQuestionIndex += 1;
      if (this.currentQuestionIndex >= this.cfg.totalQuestions) {
        this.endGame();
        return;
      }
      const delay = correct ? 150 : 700;
      this.time.delayedCall(delay, () => {
        this.perQuestionRemaining = this.cfg.perQuestionTime;
        this.showQuestion();
      });
    }
  }

  private gotoNext(delayMs = 400) {
    this.time.delayedCall(delayMs, () => {
      this.currentQuestionIndex += 1;
      if (this.currentQuestionIndex >= this.cfg.totalQuestions) {
        this.endGame();
        return;
      }
      this.showQuestion();
    });
  }

  private showAchievementPopup(text: string) {
    try {
      this.achievementPopup?.destroy(true);
    } catch {}
    const w = Math.min(280, Math.round(this.panelWidth * 0.7));
    const h = 40;
    const c = this.add.container(0, 0).setDepth(999);
    const bg = this.add.graphics();
    bg.lineStyle(2, 0x000000, 1).fillStyle(0xffffff, 1);
    bg.fillRoundedRect(this.centerX - w / 2, this.getContentAreaTop() - h - 8, w, h, 10);
    bg.strokeRoundedRect(this.centerX - w / 2, this.getContentAreaTop() - h - 8, w, h, 10);
    const t = this.add
      .text(this.centerX, this.getContentAreaTop() - h / 2 - 8, text, {
        fontFamily: 'Nunito',
        fontSize: '16px',
        color: '#000',
      })
      .setOrigin(0.5);
    c.add([bg, t]);
    this.achievementPopup = c;
    this.time.delayedCall(1200, () => {
      try {
        this.achievementPopup?.destroy(true);
      } catch {}
    });
  }

  private clearOptionButtons() {
    this.optionButtons.forEach(b => b.destroy());
    this.optionButtons = [];
  }

  private async endGame() {
  this.timerEvent?.remove();
  this.timerEvent = null;

  // kirim skor ke leaderboard
  /*try {
    await submitScore({
      mode: this.mode,
      difficulty: this.mode === 'belajar' ? this.difficulty : null,
      score: this.score,
    });
  } catch (e) {
    console.error('submitScore error', e);
  }*/

  this.scene.start('ResultsScene', { score: this.score, mode: this.mode });
}

  private onShutdown() {
  this.timerEvent?.remove();
  this.timerEvent = null;
  this.clearOptionButtons();
  this.input.removeAllListeners();
  this.closeConfirmModal();
  try {
    this.achievementPopup?.destroy(true);
  } catch {}
}
}
