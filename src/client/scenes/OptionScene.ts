import Phaser from 'phaser';
import { BaseScene } from './BaseScene'; // Import BaseScene

export class LeaderboardScene extends BaseScene { // extends BaseScene
  constructor() {
    super('LeaderboardScene');
  }

  create() {
    super.create();
    this.draw();
  }

  draw() {
    super.draw();
    
    this.add.text(this.centerX, this.scale.height * 0.2, 'Leaderboard', {
        fontSize: '48px',
        color: '#000',
      }).setOrigin(0.5);
    
    this.add.text(this.centerX, this.centerY, 'Fitur ini sedang dalam pengembangan.', {
        fontSize: '20px',
        color: '#555',
      }).setOrigin(0.5);

    const backButton = this.add.text(this.scale.width * 0.1, this.scale.height * 0.1, '< Kembali', {
        fontSize: '24px',
        color: '#000',
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });
      
    backButton.on('pointerdown', () => this.scene.start('MainMenuScene'));
  }
}
