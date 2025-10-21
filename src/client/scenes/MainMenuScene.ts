import Phaser from 'phaser';
import { BaseScene } from './BaseScene'; // Import BaseScene

export class MainMenuScene extends BaseScene { // extends BaseScene
  constructor() {
    super('MainMenuScene');
  }

  create() {
    super.create(); // Panggil create() dari BaseScene
    this.draw();    // Panggil draw() pertama kali
  }

  // Fungsi create() diubah menjadi draw()
  draw() {
    super.draw(); // Bersihkan layar

    // Judul Game - Posisi dinamis
    this.add.text(this.centerX, this.scale.height * 0.2, 'Road Knowledge', {
        fontSize: '48px',
        color: '#000000',
        align: 'center',
      }).setOrigin(0.5);

    // Tombol-tombol - Posisi dinamis
    // Gunakan persentase dari tinggi layar
    this.createButton(this.scale.height * 0.4, 'Start Test', () => this.scene.start('PilihModeScene'));
    this.createButton(this.scale.height * 0.5, 'Leaderboard', () => this.scene.start('LeaderboardScene'));
    this.createButton(this.scale.height * 0.6, 'Achievement', () => this.scene.start('AchievementScene'));
    this.createButton(this.scale.height * 0.7, 'Option', () => this.scene.start('OptionScene'));
    this.createButton(this.scale.height * 0.8, 'Credit', () => this.scene.start('CreditScene'));
  }

  // Fungsi helper untuk membuat tombol
  createButton(y: number, text: string, onClick: () => void) {
    // Lebar tombol 80% dari lebar layar
    const buttonWidth = this.scale.width * 0.8; 
    const buttonHeight = 60;

    const buttonRect = this.add.rectangle(this.centerX, y, buttonWidth, buttonHeight)
      .setFillStyle(0xffffff)
      .setStrokeStyle(2, 0x000000);

    const buttonText = this.add.text(this.centerX, y, text, {
        fontSize: '24px',
        color: '#000000',
      }).setOrigin(0.5);

    buttonRect.setInteractive({ useHandCursor: true })
      .on('pointerdown', onClick)
      .on('pointerover', () => buttonRect.setFillStyle(0xeeeeee))
      .on('pointerout', () => buttonRect.setFillStyle(0xffffff));
  }
}
