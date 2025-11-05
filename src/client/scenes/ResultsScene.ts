import { BaseScene } from './BaseScene';
import { submitScoreViaFunction } from '../lib/submitScore';

type ResultsData = { name?: string; score?: number; mode?: string; duration?: number };

export class ResultsScene extends BaseScene {
  private playerName = 'Player';
  private finalScore = 0;
  private mode = 'belajar';
  private duration: number | undefined;

  private titleText?: Phaser.GameObjects.Text;
  private scoreText?: Phaser.GameObjects.Text;
  private modeText?: Phaser.GameObjects.Text;
  private durText?: Phaser.GameObjects.Text;

  private submitBtn?: Phaser.GameObjects.Container;
  private submitStatus?: Phaser.GameObjects.Text;

  private isSubmitting = false;
  private hasAutoStarted = false;

  constructor() { super('ResultsScene'); }

  init(data: ResultsData) {
    if (typeof data?.score === 'number') this.finalScore = Math.max(0, Math.round(data.score));
    if (typeof data?.duration === 'number') this.duration = Math.max(0, Math.round(data.duration));
    if (typeof data?.mode === 'string') this.mode = data.mode;
    if (typeof data?.name === 'string' && data.name.trim()) this.playerName = data.name.substring(0, 32);
  }

  public override create() {
    super.create();
    super.createCommonButtons('MainMenuScene');

    this.buildTexts();
    this.buildButton();

    // Auto submit (tanpa klik)
    this.startAutoSubmit();

    this.events.once('shutdown', this.cleanup, this);
    this.events.once('destroy', this.cleanup, this);
  }

  private async startAutoSubmit() {
    if (this.hasAutoStarted) return;
    this.hasAutoStarted = true;

    this.setStatus('Mengirim skor...');
    if (this.submitBtn) this.submitBtn.setVisible(false); // sembunyikan saat auto

    // Retry 3x
    const ok = await this.attemptSubmitWithRetry(3, [0, 500, 900]);
    if (ok) {
      // Beri waktu indexing
      this.setStatus('Terkirim! Membuka Leaderboard...');
      this.time.delayedCall(800, () => this.scene.start('LeaderboardScene'));
    } else {
      this.setStatus('Gagal mengirim. Coba lagi.');
      if (this.submitBtn) this.submitBtn.setVisible(true);
      this.setButtonEnabled(true);
    }
  }

  private async attemptSubmitWithRetry(times: number, delaysMs: number[]) {
    for (let i = 0; i < times; i++) {
      const ok = await this.safeSubmitOnce();
      if (ok) return true;
      const delay = delaysMs[i] ?? 700;
      await new Promise(r => setTimeout(r, delay));
    }
    return false;
  }

  private async safeSubmitOnce(): Promise<boolean> {
    if (this.isSubmitting) return false;
    this.isSubmitting = true;
    try {
      const res = await submitScoreViaFunction(this.playerName, this.finalScore, this.mode, this.duration);
      if (!res.ok) return false;

      if (res.skipped) {
        // Dua skenario skip yang dianggap "sukses" bagi user:
        // - not_higher: skor baru <= best → leaderboard tidak berubah (sesuai keinginanmu)
        // - no_user: anon auth belum siap → tidak menyimpan, tapi juga tidak menurunkan leaderboard
        const msg = res.reason === 'not_higher'
          ? 'Skor tidak melampaui rekor. Leaderboard tetap.'
          : 'Sesi belum siap. Leaderboard tetap.';
        this.setStatus(msg);
      }
      return true;
    } catch (e) {
      return false;
    } finally {
      this.isSubmitting = false;
    }
  }

  // Tombol fallback jika auto-submit gagal
  private handleSubmitClick() {
    if (this.isSubmitting) return;
    this.setButtonEnabled(false);
    this.setStatus('Mengirim...');
    this.safeSubmitOnce().then(ok => {
      if (ok) {
        this.setStatus('Terkirim! Membuka Leaderboard...');
        this.time.delayedCall(800, () => this.scene.start('LeaderboardScene'));
      } else {
        this.setStatus('Gagal mengirim. Coba lagi.');
        this.setButtonEnabled(true);
      }
    });
  }

  // UI
  private buildTexts() {
    this.titleText?.destroy(); this.scoreText?.destroy(); this.modeText?.destroy(); this.durText?.destroy();
    this.submitStatus?.destroy();

    this.titleText = this.add.text(this.centerX, 90, 'Hasil Permainan', {
      fontFamily: 'Nunito', fontSize: '36px', color: '#000'
    }).setOrigin(0.5);

    this.scoreText = this.add.text(this.centerX, this.scale.height * 0.40, `Skor: ${this.finalScore}`, {
      fontFamily: 'Nunito', fontSize: '28px', color: '#111'
    }).setOrigin(0.5);

    this.modeText = this.add.text(this.centerX, this.scale.height * 0.48, `Mode: ${this.mode}`, {
      fontFamily: 'Nunito', fontSize: '20px', color: '#333'
    }).setOrigin(0.5);

    this.durText = this.add.text(this.centerX, this.scale.height * 0.54, `Durasi: ${this.duration ?? 0}s`, {
      fontFamily: 'Nunito', fontSize: '20px', color: '#333'
    }).setOrigin(0.5);

    this.submitStatus = this.add.text(this.centerX, this.scale.height * 0.76, '', {
      fontFamily: 'Nunito', fontSize: '16px', color: '#444'
    }).setOrigin(0.5);

    this.sceneContentGroup.addMultiple([this.titleText, this.scoreText, this.modeText, this.durText, this.submitStatus]);
  }

  private buildButton() {
    if (this.submitBtn) { try { this.submitBtn.destroy(true); } catch {} this.submitBtn = undefined; }
    const y = this.scale.height * 0.70;
    const btn = this.createButton(y, 'Kirim ke Leaderboard', () => this.handleSubmitClick());
    btn.setName('submit_button_results');
    btn.setDepth(10);
    this.sceneContentGroup.add(btn);
    this.submitBtn = btn;
    this.setButtonEnabled(true);
  }

  private setButtonEnabled(enabled: boolean) {
    if (!this.submitBtn) return;
    const textObj = this.submitBtn.getAt(1) as Phaser.GameObjects.Text | undefined;
    const zone = this.submitBtn.getAt(2) as Phaser.GameObjects.Zone | undefined;
    if (enabled) {
      textObj?.setText('Kirim ke Leaderboard');
      zone?.setInteractive({ useHandCursor: true });
    } else {
      zone?.disableInteractive();
    }
  }

  private setStatus(msg: string) {
    this.submitStatus?.setText(msg);
  }

  public override draw() {
    super.draw();
    this.titleText?.setPosition(this.centerX, 90);
    this.scoreText?.setPosition(this.centerX, this.scale.height * 0.40).setText(`Skor: ${this.finalScore}`);
    this.modeText?.setPosition(this.centerX, this.scale.height * 0.48).setText(`Mode: ${this.mode}`);
    this.durText?.setPosition(this.centerX, this.scale.height * 0.54).setText(`Durasi: ${this.duration ?? 0}s`);
    this.submitStatus?.setPosition(this.centerX, this.scale.height * 0.76);

    if (this.submitBtn) {
      const width = Math.round(this.scale.width * 0.86);
      const height = Math.max(48, Math.round(this.scale.height * 0.08));
      const radius = Math.min(24, Math.floor(height * 0.35));

      this.submitBtn.setPosition(this.centerX, this.scale.height * 0.70);
      (this.submitBtn as any).width = width;
      (this.submitBtn as any).height = height;

      const g = this.submitBtn.getAt(0) as Phaser.GameObjects.Graphics | undefined;
      const txt = this.submitBtn.getAt(1) as Phaser.GameObjects.Text | undefined;
      const zone = this.submitBtn.getAt(2) as Phaser.GameObjects.Zone | undefined;

      if (g) this.updateButtonGraphics(g, width, height, 0xffffff, 0x000000, 3, radius);
      if (txt) {
        txt.setStyle({
          fontFamily: 'Nunito',
          fontSize: `${Math.max(16, Math.floor(height * 0.38))}px`,
          color: '#000',
          align: 'center',
          wordWrap: { width: Math.floor(width * 0.9) }
        }).setOrigin(0.5);
      }
      if (zone) zone.setSize(width, height).setPosition(0, 0);
    }
  }

  private cleanup() {
    try { this.submitBtn?.destroy(true); } catch {}
    try { this.submitStatus?.destroy(); } catch {}
    this.isSubmitting = false;
    this.hasAutoStarted = false;
  }
}
