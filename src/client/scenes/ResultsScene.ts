import { BaseScene } from './BaseScene';
import { t } from '../lib/i18n';

export class ResultsScene extends BaseScene {
  private scoreText?: Phaser.GameObjects.Text;
  private menuBtn?: Phaser.GameObjects.Container;
  private score = 0;

  constructor() {
    super('ResultsScene');
  }

  init(data: { score?: number }) {
    if (typeof data?.score === 'number') this.score = data.score;
  }

  public override create() {
    super.create();

    this.ensureBackIcon(true);
    this.setTitle(t('results') ?? 'Hasil');

    const heightPx = Math.max(
      48,
      Math.round(Math.min(this.scale.width, this.scale.height) * 0.06),
    );
    const yBase = this.getContentAreaTop() + heightPx;

    const scoreFont = Math.max(
      24,
      Math.round(Math.min(this.scale.width, this.scale.height) * 0.04),
    );

    this.scoreText = this.add
      .text(
        this.centerX,
        yBase,
        `${t('score') ?? 'Skor'}: ${this.score.toFixed(1)}`,
        {
          fontFamily: 'Nunito',
          fontSize: `${scoreFont}px`,
          color: '#000',
        },
      )
      .setOrigin(0.5);

    this.menuBtn = this.createWidePill(
      t('backToMenu') ?? 'Kembali ke Menu',
      () => {
        this.playSound('sfx_click');
        this.scene.start('MainMenuScene');
      },
      0.5,
      heightPx,
    );
    this.menuBtn.setPosition(
      this.centerX,
      yBase + Math.round(heightPx * 1.6),
    );
  }

  public override draw() {
    this.ensureBackIcon(true);
    this.setTitle(t('results') ?? 'Hasil');

    if (!this.scoreText || !this.menuBtn) return;

    const heightPx = Math.max(
      48,
      Math.round(Math.min(this.scale.width, this.scale.height) * 0.06),
    );
    const yBase = this.getContentAreaTop() + heightPx;

    const scoreFont = Math.max(
      24,
      Math.round(Math.min(this.scale.width, this.scale.height) * 0.04),
    );

    this.scoreText
      .setPosition(this.centerX, yBase)
      .setStyle({ fontSize: `${scoreFont}px` });

    this.menuBtn.setPosition(
      this.centerX,
      yBase + Math.round(heightPx * 1.6),
    );

    // Biarkan createWidePill mengatur graphics; tidak perlu set width/height manual
  }
}
