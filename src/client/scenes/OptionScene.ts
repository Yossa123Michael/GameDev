// File: src/client/scenes/OptionScene.ts
// Hapus import Phaser
import { BaseScene } from './BaseScene';

// Ganti nama kelas menjadi OptionScene
export class OptionScene extends BaseScene {
  constructor() {
    // Ganti key scene menjadi 'OptionScene'
    super('OptionScene');
  }

  // Tambahkan override
  public override create() {
    super.create();
    this.draw();
  }

 // Tambahkan override
  public override draw() {
    super.draw();

    // Ganti judul sesuai PDF [cite: 113]
    this.add.text(this.centerX, this.scale.height * 0.2, 'Option', {
        fontSize: '48px',
        color: '#000',
        stroke: '#fff',
        strokeThickness: 4,
      }).setOrigin(0.5);

    // Tambahkan placeholder untuk opsi sesuai PDF [cite: 114-119]
    let yPos = this.scale.height * 0.35;
    const spacing = this.scale.height * 0.1;

    this.createOptionItem(yPos, 'Bahasa: Indonesia'); // [cite: 114]
    yPos += spacing;
    this.createOptionItem(yPos, 'Mode Theme: Light'); // [cite: 115, 116]
    yPos += spacing;
    this.createOptionItem(yPos, 'Sound Effect: On'); // [cite: 117]
    yPos += spacing;
    this.createOptionItem(yPos, 'Backsound: On'); // [cite: 118]
    yPos += spacing;
    this.createOptionItem(yPos, 'Remove Account'); // [cite: 119]

    // Tombol kembali dan Musik sudah ada di BaseScene [cite: 112, 120]
  }

  // Helper untuk membuat item opsi (hanya teks saat ini)
  createOptionItem(y: number, text: string) {
    this.add.text(this.centerX, y, text, {
      fontSize: '24px',
      color: '#000',
      backgroundColor: '#ffffffaa',
      padding: { x: 15, y: 8 },
      fixedWidth: this.scale.width * 0.7 // Beri lebar tetap
    }).setOrigin(0.5);
    // TODO: Tambahkan interaktivitas jika diperlukan
  }
}
