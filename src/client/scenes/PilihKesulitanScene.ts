import { BaseScene } from './BaseScene';
import { t } from '../lib/i18n';

export class PilihKesulitanScene extends BaseScene {
  private mode: 'belajar' | 'survive' = 'belajar';
  private buttons: Phaser.GameObjects.Container[] = [];

  constructor() { super('PilihKesulitanScene'); }
  init(data: { mode?: 'belajar' | 'survive' }) { if (data?.mode) this.mode = data.mode; }

  public override create() {
    super.create();
    this.ensureBackIcon(true);
    this.setTitle(t('chooseDifficultyTitle') ?? 'Pilih tingkat Kesulitan');

    const items = [
      { label: t('diffEasy') ?? 'Mudah', go: () => this.scene.start('GameScene', { mode: this.mode, difficulty: 'mudah' }) },
      { label: t('diffMedium') ?? 'Menengah', go: () => this.scene.start('GameScene', { mode: this.mode, difficulty: 'menengah' }) },
      { label: t('diffHard') ?? 'Sulit', go: () => this.scene.start('GameScene', { mode: this.mode, difficulty: 'sulit' }) },
      { label: 'Pro', go: () => this.scene.start('GameScene', { mode: this.mode, difficulty: 'pro' }) },
    ];

    const heightPx = 56;
    let y = this.panelTop + Math.round(this.panelHeight * 0.3125) + 24;
    for (const it of items) {
      const btn = this.createWidePill(it.label, it.go, 0.86, heightPx);
      btn.setPosition(this.centerX, y);
      this.buttons.push(btn);
      y += 60;
    }
  }

  public override draw() {
    this.ensureBackIcon(true);
    this.setTitle(t('chooseDifficultyTitle') ?? 'Pilih tingkat Kesulitan');
    const heightPx = 56; const widthPx = Math.round(this.panelWidth * 0.86);
    let y = this.panelTop + Math.round(this.panelHeight * 0.3125) + 24;
    const radius = Math.min(24, Math.floor(heightPx * 0.45));

    this.buttons.forEach((c) => {
      c.setPosition(this.centerX, y);
      (c as any).height = heightPx; (c as any).width = widthPx;
      this.ensureGraphicsInContainer(c, widthPx, heightPx, radius, 0xffffff, 0x000000, 2);
      (c.getAt(2) as Phaser.GameObjects.Zone | undefined)?.setSize(widthPx, heightPx);
      y += 60;
    });
  }
}
