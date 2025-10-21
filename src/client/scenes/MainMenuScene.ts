import Phaser from 'phaser';

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super('MainMenuScene');
  }

  create() {
    this.cameras.main.setBackgroundColor('#ffffff'); // Latar putih

    // Judul Game [cite: 14]
    this.add.text(this.scale.width / 2, 100, 'Road Knowledge', {
        fontSize: '48px',
        color: '#000000',
        align: 'center',
      }).setOrigin(0.5);

    // Tombol-tombol [cite: 15-19]
    this.createButton(200, 'Start Test', () => this.scene.start('PilihModeScene'));
    this.createButton(280, 'Leaderboard', () => this.scene.start('LeaderboardScene'));
    this.createButton(360, 'Achievement', () => this.scene.start('AchievementScene'));
    this.createButton(440, 'Option', () => this.scene.start('OptionScene'));
    this.createButton(520, 'Credit', () => this.scene.start('CreditScene'));
  }

  // Fungsi helper untuk membuat tombol agar tidak berulang
  createButton(y: number, text: string, onClick: () => void) {
    const buttonWidth = 350;
    const buttonHeight = 60;

    // Kotak tombol
    const buttonRect = this.add.rectangle(this.scale.width / 2, y, buttonWidth, buttonHeight)
      .setFillStyle(0xffffff)
      .setStrokeStyle(2, 0x000000); // Putih dengan garis hitam

    // Teks tombol
    const buttonText = this.add.text(this.scale.width / 2, y, text, {
        fontSize: '24px',
        color: '#000000',
      }).setOrigin(0.5);

    // Interaksi
    buttonRect.setInteractive({ useHandCursor: true })
      .on('pointerdown', onClick)
      .on('pointerover', () => buttonRect.setFillStyle(0xeeeeee))
      .on('pointerout', () => buttonRect.setFillStyle(0xffffff));
  }
}
