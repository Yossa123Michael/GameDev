import { BaseScene } from './BaseScene';
import { submitScoreViaFunction } from '../lib/submitScore';

type ResultsData = { name?: string; score?: number; mode?: string; duration?: number };

export class ResultsScene extends BaseScene {
  private playerName = 'Player';
  private finalScore = 0;
  private mode = 'belajar';
  private duration: number | undefined;

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
    this.draw();

    const btn = this.add.text(this.centerX, this.scale.height * 0.7, 'Kirim ke Leaderboard', {
      fontFamily: 'Nunito', fontSize: '22px', color: '#ffffff', backgroundColor: '#007bff',
      padding: { left: 12, right: 12, top: 8, bottom: 8 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    const statusText = this.add.text(this.centerX, this.scale.height * 0.76, '', {
      fontFamily: 'Nunito', fontSize: '16px', color: '#444',
    }).setOrigin(0.5);

    btn.on('pointerup', async () => {
      btn.disableInteractive();
      btn.setText('Mengirim...');
      statusText.setText('');

      const res = await submitScoreViaFunction(this.playerName, this.finalScore, this.mode, this.duration);

      if (!res.ok) {
        console.error('Gagal submit skor:', res.error);
        btn.setText('Coba Lagi');
        btn.setInteractive({ useHandCursor: true });
        statusText.setText(res.error || 'Gagal mengirim skor');
        return;
      }

      statusText.setText('Terkirim!');
      this.time.delayedCall(500, () => this.scene.start('LeaderboardScene'));
    });
  }

  public override draw() {
    super.draw();
    if (!this.sceneContentGroup) return;

    const title = this.add.text(this.centerX, 90, 'Hasil Permainan', { fontFamily: 'Nunito', fontSize: '36px', color: '#000' }).setOrigin(0.5);
    const scoreText = this.add.text(this.centerX, this.scale.height * 0.4, `Skor: ${this.finalScore}`, { fontFamily: 'Nunito', fontSize: '28px', color: '#111' }).setOrigin(0.5);
    const modeText = this.add.text(this.centerX, this.scale.height * 0.48, `Mode: ${this.mode}`, { fontFamily: 'Nunito', fontSize: '20px', color: '#333' }).setOrigin(0.5);
    const durText = this.add.text(this.centerX, this.scale.height * 0.54, `Durasi: ${this.duration ?? 0}s`, { fontFamily: 'Nunito', fontSize: '20px', color: '#333' }).setOrigin(0.5);
    this.sceneContentGroup.addMultiple([title, scoreText, modeText, durText]);
  }
}
