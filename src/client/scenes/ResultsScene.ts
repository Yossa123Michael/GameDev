import { BaseScene } from './BaseScene';
import { t } from '../lib/i18n';

export class ResultsScene extends BaseScene {
  private scoreText?: Phaser.GameObjects.Text;
  private menuBtn?: Phaser.GameObjects.Container;
  private score = 0;

  constructor() { super('ResultsScene'); }
  init(data: { score?: number }) { if (typeof data?.score === 'number') this.score = data.score; }

  public override create() {
    super.create();
    this.ensureBackIcon(true);
    this.setTitle(t('results') ?? 'Hasil');

    const heightPx = Math.max(48, Math.round(Math.min(this.scale.width, this.scale.height) * 0.06));
    const yBase = this.getContentAreaTop() + heightPx;

    this.scoreText = this.add.text(this.centerX, yBase, `${t('score') ?? 'Skor'}: ${this.score}`, { fontFamily: 'Nunito', fontSize: `${Math.max(24, Math.round(Math.min(this.scale.width, this.scale.height) * 0.04))}px`, color: '#000' }).setOrigin(0.5);
    this.menuBtn = this.createWidePill(t('backToMenu') ?? 'Kembali ke Menu', () => { this.playSound('sfx_click'); this.scene.start('MainMenuScene'); }, 0.5, heightPx);
    this.menuBtn.setPosition(this.centerX, yBase + Math.round(heightPx * 1.2));
  }

  public override draw() {
    this.ensureBackIcon(true);
    this.setTitle(t('results') ?? 'Hasil');
    const heightPx = Math.max(48, Math.round(Math.min(this.scale.width, this.scale.height) * 0.06));
    const widthPx = Math.round(this.panelWidth * 0.5);
    const radius = Math.min(24, Math.floor(heightPx * 0.45));
    const yBase = this.getContentAreaTop() + heightPx;

    this.scoreText?.setPosition(this.centerX, yBase);
    this.menuBtn?.setPosition(this.centerX, yBase + Math.round(heightPx * 1.2));
    const c = this.menuBtn!;
    (c as any).height = heightPx; (c as any).width = widthPx;
    this.ensureGraphicsInContainer(c, widthPx, heightPx, radius, 0xffffff, 0x000000, 2);
    (c.getAt(2) as Phaser.GameObjects.Zone | undefined)?.setSize(widthPx, heightPx);
  }
}
