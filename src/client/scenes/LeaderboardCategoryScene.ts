import { BaseScene } from './BaseScene';
type LBType = 'belajar' | 'survive';

export class LeaderboardCategoryScene extends BaseScene {
  private type: LBType = 'belajar';
  private buttons: Phaser.GameObjects.Container[] = [];
  constructor() { super('LeaderboardCategoryScene'); }
  init(data: { type?: LBType }) { if (data?.type) this.type = data.type; }

  public override create() {
    super.create();
    this.ensureBackIcon(true);
    this.setTitle('LeaderBoard');

    const heightPx = Math.max(48, Math.round(Math.min(this.scale.width, this.scale.height) * 0.06));
    const items = this.type === 'belajar'
      ? [
        { label: 'Mudah', go: () => this.scene.start('LeaderboardScene', { type: 'belajar', category: 'mudah' }) },
        { label: 'Menengah', go: () => this.scene.start('LeaderboardScene', { type: 'belajar', category: 'menengah' }) },
        { label: 'Sulit', go: () => this.scene.start('LeaderboardScene', { type: 'belajar', category: 'sulit' }) },
        { label: 'Pro', go: () => this.scene.start('LeaderboardScene', { type: 'belajar', category: 'pro' }) },
      ]
      : [
        { label: 'Survive', go: () => this.scene.start('LeaderboardScene', { type: 'survive', category: 'survive' }) },
      ];
    items.forEach(it => this.buttons.push(this.createWidePill(it.label, () => { this.playSound('sfx_click'); it.go(); }, 0.86, heightPx)));
    this.layoutPillsCentered(this.buttons, heightPx, Math.round(heightPx * 0.18));
  }

  public override draw() {
    this.ensureBackIcon(true);
    this.setTitle('LeaderBoard');
    const heightPx = Math.max(48, Math.round(Math.min(this.scale.width, this.scale.height) * 0.06));
    this.layoutPillsCentered(this.buttons, heightPx, Math.round(heightPx * 0.18));
  }
}
