import Phaser from 'phaser';

export class AchievementScene extends Phaser.Scene {
  constructor() {
    super('AchievementScene');
  }
  create() {
    this.cameras.main.setBackgroundColor('#ffffff');
    this.add.text(50, 50, 'Achievement (Segera Hadir)', { color: '#000', fontSize: '28px' });
    this.add.text(50, 100, '< Kembali', { color: '#000', fontSize: '24px' }).setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.scene.start('MainMenuScene'));
  }
}
