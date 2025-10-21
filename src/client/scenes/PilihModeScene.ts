import Phaser from 'phaser';
import { BaseScene } from './BaseScene'; // Import BaseScene

export class PilihModeScene extends BaseScene { // extends BaseScene
  constructor() {
    super('PilihModeScene');
  }

  create() {
    super.create();
    this.draw();
  }

  draw() {
    super.draw();

    this.add.text(this.centerX, this.scale.height * 0.2, 'Pilih Mode', {
        fontSize: '48px',
        color: '#000000',
      }).setOrigin(0.5);

    // Tombol Belajar
    this.createButton(this.scale.height * 0.45, 'Belajar', () => {
      this.scene.start('PilihKesulitanScene', { mode: 'belajar' });
    });

    // Tombol Survive
    this.createButton(this.scale.height * 0.6, 'Survive', () => {
      this.scene.start('PilihKesulitanScene', { mode: 'survive' });
    });

    // Tombol Kembali
    this.createBackButton();
  }

  createButton(y: number, text: string, onClick: () => void) {
    const buttonWidth = this.scale.width * 0.8;
    const buttonHeight = 60;
    const buttonRect = this.add.rectangle(this.centerX, y, buttonWidth, buttonHeight)
      .setFillStyle(0xffffff)
      .setStrokeStyle(2, 0x000000);
    this.add.text(this.centerX, y, text, {
        fontSize: '24px',
        color: '#000000',
      }).setOrigin(0.5);
    buttonRect.setInteractive({ useHandCursor: true })
      .on('pointerdown', onClick)
      .on('pointerover', () => buttonRect.setFillStyle(0xeeeeee))
      .on('pointerout', () => buttonRect.setFillStyle(0xffffff));
  }
  
  createBackButton() {
    // Tombol kembali di pojok kiri atas
    const backButton = this.add.text(this.scale.width * 0.1, this.scale.height * 0.1, '< Kembali', {
        fontSize: '24px',
        color: '#000000',
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });
      
    backButton.on('pointerdown', () => this.scene.start('MainMenuScene'));
  }
}
