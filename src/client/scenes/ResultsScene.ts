// File: src/client/scenes/ResultsScene.ts
// Hapus import Phaser
import { BaseScene } from './BaseScene'; // Import BaseScene

export class ResultsScene extends BaseScene { // extends BaseScene
  private finalScore: number = 0;

  constructor() {
    super('ResultsScene');
  }

  init(data: { score: number }) {
    this.finalScore = data.score;
  }

  public override create() {
    super.create(); // Panggil base create untuk background, tombol, resize
    this.draw();
  }

  public override draw() {
    super.draw(); // Panggil base draw untuk clear dan tombol umum

    this.add.text(this.centerX, this.scale.height * 0.3, 'Kuis Selesai!', {
        fontSize: '48px',
        color: '#000000',
        stroke: '#ffffff',
        strokeThickness: 4
      }).setOrigin(0.5);

    this.add.text(this.centerX, this.scale.height * 0.45, `Skor Akhir Anda: ${this.finalScore}`, {
        fontSize: '32px',
        color: '#000000',
        stroke: '#ffffff',
        strokeThickness: 2
      }).setOrigin(0.5);

    // Gunakan gaya tombol yang konsisten
    this.createStyledButton(this.centerX, this.scale.height * 0.6, 'Main Lagi', () => this.scene.start('MainMenuScene'));
    this.createStyledButton(this.centerX, this.scale.height * 0.7, 'Leaderboard', () => this.scene.start('LeaderboardScene'));

    // Tombol kembali sudah di BaseScene
  }

   // Helper untuk tombol dengan gaya berbeda (seperti di PDF Results tidak eksplisit)
   createStyledButton(x: number, y: number, text: string, onClick: () => void) {
     const buttonText = this.add.text(x, y, text, {
         fontSize: '32px',
         color: '#ffffff',
         backgroundColor: '#007bff', // Biru
         padding: { x: 20, y: 10 },
         align: 'center'
       }).setOrigin(0.5);

     buttonText.setInteractive({ useHandCursor: true });
     buttonText.on('pointerdown', onClick);
     buttonText.on('pointerover', () => buttonText.setBackgroundColor('#0056b3')); // Warna hover
     buttonText.on('pointerout', () => buttonText.setBackgroundColor('#007bff')); // Warna normal
   }
}
