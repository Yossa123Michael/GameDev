import { BaseScene } from './BaseScene';

export default class CreditScene extends BaseScene {
  private lines: Phaser.GameObjects.Text[] = [];
  constructor() { super('CreditScene'); }

  public override create() {
    super.create();
    this.ensureBackIcon(true);
    this.setTitle('Credit');

    const sections = [
      { title: 'Creator', body: ['Nama • Link', 'Nama • Link'] },
      { title: 'Backsound Artist', body: ['Nama • Link'] },
      { title: 'Animation Artist', body: ['Nama • Link', 'Nama • Link'] },
      { title: 'Sound Effect Artist', body: ['Nama • Link'] },
    ];

    let y = this.panelTop + Math.round(this.panelHeight * 0.3125) + 24;
    sections.forEach((sec) => {
      const title = this.add.text(this.centerX, y, sec.title, { fontFamily: 'Nunito', fontSize: '18px', color: '#000' }).setOrigin(0.5);
      this.lines.push(title); y += 26;
      sec.body.forEach((txt) => {
        const t = this.add.text(this.centerX, y, txt, { fontFamily: 'Nunito', fontSize: '16px', color: '#000' }).setOrigin(0.5);
        t.setInteractive({ useHandCursor: true }).on('pointerup', () => { /* TODO: window.open(link) */ });
        this.lines.push(t); y += 22;
      });
      y += 16;
    });
  }

  public override draw() {
    this.ensureBackIcon(true);
    this.setTitle('Credit');
    // statis
  }
}
