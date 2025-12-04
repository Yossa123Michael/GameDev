import { BaseScene } from './BaseScene';

export class AchievementScene extends BaseScene {
  private groupsText: Phaser.GameObjects.Text[] = [];
  private items: Phaser.GameObjects.Container[] = [];
  constructor() { super('AchievementScene'); }

  public override create() {
    super.create();
    this.ensureBackIcon(true);
    this.setTitle('Achievement');

    const heightPx = 44;
    let y = this.panelTop + Math.round(this.panelHeight * 0.3125) + 24;

    const groups = [
      { title: 'Kategori A', items: ['Icon • Icon • Icon', 'Icon • Icon • Icon'] },
      { title: 'Kategori B', items: ['Icon • Icon', 'Icon • Icon • Icon'] },
    ];

    groups.forEach((grp) => {
      const t = this.add.text(this.centerX, y, grp.title, { fontFamily: 'Nunito', fontSize: '18px', color: '#000' }).setOrigin(0.5);
      this.groupsText.push(t); y += 26;
      grp.items.forEach((txt) => {
        const pill = this.createWidePill(txt, () => {}, 0.86, heightPx);
        pill.setPosition(this.centerX, y);
        this.items.push(pill);
        y += 50;
      });
      y += 16;
    });
  }

  public override draw() {
    this.ensureBackIcon(true);
    this.setTitle('Achievement');
    const heightPx = 44; const widthPx = Math.round(this.panelWidth * 0.86);
    const radius = Math.min(24, Math.floor(heightPx * 0.45));

    let y = this.panelTop + Math.round(this.panelHeight * 0.3125) + 24;
    this.groupsText.forEach((t) => { t.setPosition(this.centerX, y); y += 26; });
    this.items.forEach((c) => {
      c.setPosition(this.centerX, y);
      (c as any).height = heightPx; (c as any).width = widthPx;
      this.ensureGraphicsInContainer(c, widthPx, heightPx, radius, 0xffffff, 0x000000, 2);
      (c.getAt(2) as Phaser.GameObjects.Zone | undefined)?.setSize(widthPx, heightPx);
      y += 50;
    });
  }
}
