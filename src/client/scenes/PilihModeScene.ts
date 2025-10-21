import Phaser from 'phaser';

export class PilihModeScene extends Phaser.Scene {
  constructor() {
    super('PilihModeScene');
  }

  create() {
    this.cameras.main.setBackgroundColor('#ffffff');

    this.add.text(this.scale.width / 2, 100, 'Pilih Mode', {
        fontSize: '48px',
        color: '#000000',
      }).setOrigin(0.5);

    // Tombol Belajar [cite: 25]
    this.createButton(250, 'Belajar', () => {
      this.scene.start('PilihKesulitanScene', { mode: 'belajar' });
    });

    // Tombol Survive [cite: 26]
    this.createButton(350, 'Survive', () => {
      this.scene.start('PilihKesulitanScene', { mode: 'survive' });
    });

    // Tombol Kembali
    this.createBackButton();
  }

  createButton(y: number, text: string, onClick: () => void) {
    // Implementasi tombol yang sama dengan MainMenuScene...
    const buttonWidth = 350;
    const buttonHeight = 60;
    const buttonRect = this.add.rectangle(this.scale.width / 2, y, buttonWidth, buttonHeight)
      .setFillStyle(0xffffff)
      .setStrokeStyle(2, 0x000000);
    this.add.text(this.scale.width / 2, y, text, {
        fontSize: '24px',
        color: '#000000',
      }).setOrigin(0.5);
    buttonRect.setInteractive({ useHandCursor: true })
      .on('pointerdown', onClick)
      .on('pointerover', () => buttonRect.setFillStyle(0xeeeeee))
      .on('pointerout', () => buttonRect.setFillStyle(0xffffff));
  }
  
  createBackButton() {
    const backButton = this.add.text(50, 50, '< Kembali', {
        fontSize: '24px',
        color: '#000000',
      }).setInteractive({ useHandCursor: true });
      
    backButton.on('pointerdown', () => this.scene.start('MainMenuScene'));
  }
}
