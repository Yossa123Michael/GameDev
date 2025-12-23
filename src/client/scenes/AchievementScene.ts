import { BaseScene } from './BaseScene';

export class AchievementScene extends BaseScene {
  private groupsText: Phaser.GameObjects.Text[] = [];
  private items: Phaser.GameObjects.Container[] = [];
  constructor() { super('AchievementScene'); }

  public override create() {
    super.create();
    this.ensureBackIcon(true);
    this.setTitle('Achievement');

    const heightPx = Math.max(44, Math.round(Math.min(this.scale.width, this.scale.height) * 0.055));
    const groups = [
      { title: 'Kategori A', items: ['Icon • Icon • Icon', 'Icon • Icon • Icon'] },
      { title: 'Kategori B', items: ['Icon • Icon', 'Icon • Icon • Icon'] },
    ];

    for (const grp of groups) {
      const t = this.add.text(this.centerX, 0, grp.title, { fontFamily: 'Nunito', fontSize: `${Math.max(16, Math.round(Math.min(this.scale.width, this.scale.height) * 0.03))}px`, color: '#000' }).setOrigin(0.5);
      this.groupsText.push(t);
      for (const txt of grp.items) {
        const pill = this.createWidePill(txt, () => {}, 0.86, heightPx);
        this.items.push(pill);
      }
    }
    this.draw();
  }

  public override draw() {
    this.ensureBackIcon(true);
    this.setTitle('Achievement');

    const widthPx = Math.round(this.panelWidth * 0.86);
    const buttonH = Math.max(44, Math.round(Math.min(this.scale.width, this.scale.height) * 0.055));
    const gap = Math.round(buttonH * 0.2);
    const blockGap = Math.round(buttonH * 0.25);
    const radius = Math.min(24, Math.floor(buttonH * 0.45));
    let y = this.getContentAreaTop() + 16;

    let idx = 0;
    for (const t of this.groupsText) {
      t.setPosition(this.centerX, y); y += Math.max(24, Math.round(Math.min(this.scale.width, this.scale.height) * 0.03));
      for (let k = 0; k < 2; k++) {
        const c = this.items[idx];
        if (!c) continue;
        c.setPosition(this.centerX, y + buttonH / 2);
        (c as any).height = buttonH; (c as any).width = widthPx;
        this.ensureGraphicsInContainer(c, widthPx, buttonH, radius, 0xffffff, 0x000000, 2);
        const z = c.getAt(2) as Phaser.GameObjects.Zone | undefined;
        z?.setSize(widthPx, buttonH);
        y += buttonH + gap;
        idx++;
      }
      y += blockGap;
    }
  }
}
