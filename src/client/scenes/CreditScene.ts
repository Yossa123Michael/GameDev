import Phaser from 'phaser';

export class CreditScene extends Phaser.Scene {
  constructor() {
    super('CreditScene');
  }
  create() {
    this.cameras.main.setBackgroundColor('#ffffff');
    this.add.text(50, 50, 'Credit (Segera Hadir)', { color: '#000', fontSize: '28px' });
    this.add.text(50, 100, '< Kembali', { color: '#000', fontSize: '24px' }).setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.scene.start('MainMenuScene'));
  }
}
