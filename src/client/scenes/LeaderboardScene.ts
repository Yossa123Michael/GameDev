// File: src/client/scenes/LeaderboardScene.ts
// Hapus import Phaser
import { BaseScene } from './BaseScene'; // Ganti import dan extends

export class LeaderboardScene extends BaseScene { // Nama kelas sudah benar
  constructor() {
    super('LeaderboardScene'); // Key scene sudah benar
  }

  // Tambahkan override
  public override create() {
    super.create(); // Panggil base create
    this.draw();
  }

  // Tambahkan override
  public override draw() {
    super.draw(); // Panggil base draw

    this.add.text(this.centerX, this.scale.height * 0.2, 'Leaderboard', { // [cite: 61, 66, 73, 82]
        fontSize: '48px',
        color: '#000',
        stroke: '#fff',
        strokeThickness: 4,
      }).setOrigin(0.5);

    // Ganti dengan placeholder sesuai PDF
    this.add.text(this.centerX, this.centerY - 50, 'Peringkat Berdasarkan Skor', {
        fontSize: '24px', color: '#333', backgroundColor: '#ffffffaa', padding: 5
    }).setOrigin(0.5);
     this.add.text(this.centerX, this.centerY + 0, '1. Player A - 150', { fontSize: '20px', color: '#000', backgroundColor: '#ffffffaa', padding: 5 }).setOrigin(0.5); // [cite: 74]
     this.add.text(this.centerX, this.centerY + 40, '2. Player B - 120', { fontSize: '20px', color: '#000', backgroundColor: '#ffffffaa', padding: 5 }).setOrigin(0.5); // [cite: 75]
     this.add.text(this.centerX, this.centerY + 80, '3. Player C - 100', { fontSize: '20px', color: '#000', backgroundColor: '#ffffffaa', padding: 5 }).setOrigin(0.5); // [cite: 76]
     this.add.text(this.centerX, this.centerY + 120, '(Fitur lengkap segera hadir)', { fontSize: '16px', color: '#555', backgroundColor: '#ffffffaa', padding: 5 }).setOrigin(0.5); // [cite: 78, 79]

    // Tombol kembali sudah ada di BaseScene [cite: 59, 64, 71, 80]
    // Tombol Musik sudah ada di BaseScene [cite: 60, 65, 72, 81]
  }
}
