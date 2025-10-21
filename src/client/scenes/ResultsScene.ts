import Phaser from 'phaser';

export class ResultsScene extends Phaser.Scene {
  private finalScore: number = 0;

  constructor() {
    super('ResultsScene');
  }

  init(data: { score: number }) {
    this.finalScore = data.score;
  }

  create() {
    this.cameras.main.setBackgroundColor('#ffffff');

    this.add.text(this.scale.width / 2, 150, 'Kuis Selesai!', {
        fontSize: '48px',
        color: '#000',
      }).setOrigin(0.5);
    
    this.add.text(this.scale.width / 2, 250, `Skor Akhir Anda: ${this.finalScore}`, {
        fontSize: '32px',
        color: '#000',
      }).setOrigin(0.5);

    const playAgainButton = this.add.text(this.scale.width / 2, 400, 'Main Lagi', {
        fontSize: '32px',
        color: '#fff',
        backgroundColor: '#007bff',
        padding: { x: 20, y: 10 },
      }).setOrigin(0.5);

    playAgainButton.setInteractive({ useHandCursor: true });
    // Kembali ke Menu Utama, bukan langsung ke Game
    playAgainButton.on('pointerdown', () => this.scene.start('MainMenuScene'));
  }
}
