import Phaser from 'phaser';

export class LeaderboardScene extends Phaser.Scene {
  constructor() {
    super('LeaderboardScene');
  }

  create() {
    this.cameras.main.setBackgroundColor('#ffffff');
    this.add.text(this.scale.width / 2, 100, 'Leaderboard', {
        fontSize: '48px',
        color: '#000',
      }).setOrigin(0.5);
    
    this.add.text(this.scale.width / 2, 300, 'Fitur ini sedang dalam pengembangan.', {
        fontSize: '20px',
        color: '#555',
      }).setOrigin(0.5);

    const backButton = this.add.text(50, 50, '< Kembali', {
        fontSize: '24px',
        color: '#000',
      }).setInteractive({ useHandCursor: true });
      
    backButton.on('pointerdown', () => this.scene.start('MainMenuScene'));
  }
}
