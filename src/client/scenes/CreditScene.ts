import { BaseScene } from './BaseScene';

export class CreditScene extends BaseScene {
  private lines: Phaser.GameObjects.Text[] = [];
  constructor() { super('CreditScene'); }

  public override create() {
    super.create();
    this.ensureBackIcon(true);
    this.setTitle('Credit');

    const titleSize = Math.max(18, Math.round(Math.min(this.scale.width, this.scale.height) * 0.032));
    const bodySize = Math.max(16, Math.round(Math.min(this.scale.width, this.scale.height) * 0.028));

    const sections = [
      { title: 'Creator', body: ['Nama • Link', 'Nama • Link'] },
      { title: 'Backsound Artist', body: ['Nama • Link'] },
      { title: 'Animation Artist', body: ['Nama • Link', 'Nama • Link'] },
      { title: 'Sound Effect Artist', body: ['Nama • Link'] },
    ];

    let y = this.getContentAreaTop() + 16;
    for (const sec of sections) {
      const title = this.add.text(this.centerX, y, sec.title, { fontFamily: 'Nunito', fontSize: `${titleSize}px`, color: '#000' }).setOrigin(0.5);
      this.lines.push(title); y += Math.round(titleSize * 1.3);
      for (const txt of sec.body) {
        const t = this.add.text(this.centerX, y, txt, { fontFamily: 'Nunito', fontSize: `${bodySize}px`, color: '#000' }).setOrigin(0.5);
        t.setInteractive({ useHandCursor: true }).on('pointerup', () => { /* TODO: window.open(link) */ });
        this.lines.push(t); y += Math.round(bodySize * 1.2);
      }
      y += Math.round(bodySize * 0.8);
    }
  }

  public override draw() {
    this.ensureBackIcon(true);
    this.setTitle('Credit');
  }
}
