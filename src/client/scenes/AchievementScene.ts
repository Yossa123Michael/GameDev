// File: src/client/scenes/AchievementScene.ts
// Hapus import Phaser
import { BaseScene } from './BaseScene';

// Ganti nama kelas menjadi AchievementScene
export class AchievementScene extends BaseScene {
  constructor() {
    // Ganti key scene menjadi 'AchievementScene'
    super('AchievementScene');
  }

  // Tambahkan override
  public override create() {
    super.create();
    this.draw();
  }

  // Tambahkan override
  public override draw() {
    super.draw();

    // Ganti judul sesuai PDF [cite: 49] (asumsi page 5 adalah achievement)
    this.add.text(this.centerX, this.scale.height * 0.2, 'Achievement', {
        fontSize: '48px',
        color: '#000',
        stroke: '#fff',
        strokeThickness: 4,
      }).setOrigin(0.5);

    // Placeholder sesuai PDF page 10 [cite: 92-111] (tampilan ikon sulit tanpa aset)
     this.add.text(this.centerX, this.centerY - 50, 'Kategori 1: [ ] [ ] [ ]', { fontSize: '20px', color: '#000', backgroundColor: '#ffffffaa', padding: 5 }).setOrigin(0.5);
     this.add.text(this.centerX, this.centerY + 0, 'Kategori 2: [ ] [ ] [ ]', { fontSize: '20px', color: '#000', backgroundColor: '#ffffffaa', padding: 5 }).setOrigin(0.5);
     this.add.text(this.centerX, this.centerY + 50, 'Kategori 3: [ ] [ ] [ ]', { fontSize: '20px', color: '#000', backgroundColor: '#ffffffaa', padding: 5 }).setOrigin(0.5);
     this.add.text(this.centerX, this.centerY + 100, '(Fitur segera hadir)', { fontSize: '16px', color: '#555', backgroundColor: '#ffffffaa', padding: 5 }).setOrigin(0.5);


    // Tombol kembali dan Musik sudah ada di BaseScene [cite: 50, 51]
  }
}
