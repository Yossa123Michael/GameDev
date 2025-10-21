// File: src/client/scenes/PilihModeScene.ts
// Hapus import Phaser
import { BaseScene } from './BaseScene'; // Import BaseScene

export class PilihModeScene extends BaseScene { // extends BaseScene
  constructor() {
    super('PilihModeScene');
  }

  // Hapus override karena create() tidak di-override, hanya memanggil super
  create() {
    super.create(); // Panggil create() dari BaseScene
    this.draw();
  }

  // Tambahkan override
  public override draw() {
    super.draw(); // Panggil draw dari BaseScene untuk membersihkan + tombol umum

    this.add.text(this.centerX, this.scale.height * 0.2, 'Pilih Mode', { // [cite: 30]
        fontSize: '48px',
        color: '#000000',
        stroke: '#ffffff',
        strokeThickness: 4
      }).setOrigin(0.5);

    // Tombol Belajar [cite: 31]
    this.createButton(this.scale.height * 0.45, 'Belajar', () => {
      this.scene.start('PilihKesulitanScene', { mode: 'belajar' });
    });

    // Tombol Survive [cite: 32]
    this.createButton(this.scale.height * 0.6, 'Survive', () => {
      this.scene.start('PilihKesulitanScene', { mode: 'survive' });
    });

    // Tombol Kembali sudah dihandle BaseScene
  }

  // Fungsi createButton sama seperti di MainMenuScene, bisa dipindahkan ke BaseScene jika mau
  createButton(y: number, text: string, onClick: () => void) {
    const buttonWidth = this.scale.width * 0.8;
    const buttonHeight = 60;
    const buttonRect = this.add.rectangle(0, 0, buttonWidth, buttonHeight) // Posisi 0,0 relatif terhadap container
      .setFillStyle(0xffffff, 0.9)
      .setStrokeStyle(2, 0x000000);
    const buttonText = this.add.text(buttonWidth / 2, buttonHeight / 2, text, { // Posisi tengah relatif terhadap container
        fontSize: '24px',
        color: '#000000',
      }).setOrigin(0.5);

    const container = this.add.container(this.centerX - buttonWidth / 2, y - buttonHeight / 2, [buttonRect, buttonText]);
    container.setSize(buttonWidth, buttonHeight);
    container.setInteractive({ useHandCursor: true })
      .on('pointerdown', onClick)
      .on('pointerover', () => buttonRect.setFillStyle(0xeeeeee, 0.9))
      .on('pointerout', () => buttonRect.setFillStyle(0xffffff, 0.9));
  }
}
