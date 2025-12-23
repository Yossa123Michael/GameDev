import { BaseScene } from './BaseScene';
// Untuk state "bersih" tanpa isi, kita tampilkan placeholder kosong terpusat

export class LeaderboardScene extends BaseScene {
  private emptyText?: Phaser.GameObjects.Text;

  constructor() { super('LeaderboardScene'); }

  public override create() {
    super.create();
    this.ensureBackIcon(true);
    this.setTitle('LeaderBoard');

    // State bersih: tanpa list, hanya info kecil di tengah konten (bisa dihilangkan jika ingin benar-benar kosong)
    const fontSize = Math.max(16, Math.round(Math.min(this.scale.width, this.scale.height) * 0.03));
    this.emptyText = this.add.text(this.centerX, this.getContentAreaTop() + Math.round(this.getContentAreaHeight() / 2), '', {
      fontFamily: 'Nunito', fontSize: `${fontSize}px`, color: '#888'
    }).setOrigin(0.5);
  }

  public override draw() {
    this.ensureBackIcon(true);
    this.setTitle('LeaderBoard');
    this.emptyText?.setPosition(this.centerX, this.getContentAreaTop() + Math.round(this.getContentAreaHeight() / 2));
  }
}
