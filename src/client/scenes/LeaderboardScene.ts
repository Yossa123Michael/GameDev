import { BaseScene } from './BaseScene';

export class LeaderboardScene extends BaseScene {
  private type: 'belajar' | 'survive' = 'belajar';
  private category: 'mudah' | 'menengah' | 'sulit' | 'pro' | 'survive' = 'mudah';
  private rows: Phaser.GameObjects.Container[] = [];
  constructor() { super('LeaderboardScene'); }
  init(data: { type?: 'belajar' | 'survive', category?: any }) { if (data?.type) this.type = data.type; if (data?.category) this.category = data.category; }

  public override create() {
    super.create();
    this.ensureBackIcon(true);
    this.setTitle('LeaderBoard');

    const entries = Array.from({ length: 10 }).map((_, i) => ({ name: `Player ${String.fromCharCode(65 + i)}`, score: Math.round(Math.random() * 100) }));
    const heightPx = 48;
    let y = this.panelTop + Math.round(this.panelHeight * 0.3125) + 24;
    for (const e of entries) {
      const pill = this.createWidePill(`${e.name}  •  ${e.score}`, () => {}, 0.86, heightPx);
      pill.setPosition(this.centerX, y);
      this.rows.push(pill);
      y += 52;
    }
  }

  public override draw() {
    this.ensureBackIcon(true);
    this.setTitle('LeaderBoard');
    const heightPx = 48; const widthPx = Math.round(this.panelWidth * 0.86);
    let y = this.panelTop + Math.round(this.panelHeight * 0.3125) + 24;
    const radius = Math.min(24, Math.floor(heightPx * 0.45));
    this.rows.forEach((c) => {
      c.setPosition(this.centerX, y);
      (c as any).height = heightPx; (c as any).width = widthPx;
      this.ensureGraphicsInContainer(c, widthPx, heightPx, radius, 0xffffff, 0x000000, 2);
      (c.getAt(2) as Phaser.GameObjects.Zone | undefined)?.setSize(widthPx, heightPx);
      y += 52;
    });
  }
}
