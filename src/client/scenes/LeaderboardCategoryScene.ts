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

    const heightPx = 48;
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
    this.setTitle('LeaderBoard');
    const heightPx = 48; const widthPx = Math.round(this.panelWidth * 0.86);
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
