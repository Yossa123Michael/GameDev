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

    const heightPx = Math.max(52, Math.round(Math.min(this.scale.width, this.scale.height) * 0.07));
    const items = [
      { label: t('diffEasy') ?? 'Mudah', go: () => this.scene.start('GameScene', { mode: this.mode, difficulty: 'mudah' }) },
      { label: t('diffMedium') ?? 'Menengah', go: () => this.scene.start('GameScene', { mode: this.mode, difficulty: 'menengah' }) },
      { label: t('diffHard') ?? 'Sulit', go: () => this.scene.start('GameScene', { mode: this.mode, difficulty: 'sulit' }) },
      { label: 'Pro', go: () => this.scene.start('GameScene', { mode: this.mode, difficulty: 'pro' }) },
    ];
    items.forEach(it => this.buttons.push(this.createWidePill(it.label, () => { this.playSound('sfx_click'); it.go(); }, 0.86, heightPx)));
    this.layoutPillsCentered(this.buttons, heightPx, Math.round(heightPx * 0.2));
  }

  public override draw() {
    this.ensureBackIcon(true);
    this.setTitle(t('chooseDifficultyTitle') ?? 'Pilih tingkat Kesulitan');
    const heightPx = Math.max(52, Math.round(Math.min(this.scale.width, this.scale.height) * 0.07));
    this.layoutPillsCentered(this.buttons, heightPx, Math.round(heightPx * 0.2));
  }
}
