// File: src/client/scenes/CreditScene.ts
// Hapus import Phaser
import { BaseScene } from './BaseScene';

// Ganti nama kelas menjadi CreditScene
export class CreditScene extends BaseScene {
  constructor() {
    // Ganti key scene menjadi 'CreditScene'
    super('CreditScene');
  }

  // Tambahkan override
  public override create() {
    super.create();
    this.draw();
  }

  // Tambahkan override
  public override draw() {
    super.draw();

    // Ganti judul sesuai PDF [cite: 123]
    this.add.text(this.centerX, this.scale.height * 0.2, 'Credit', {
        fontSize: '48px',
        color: '#000',
        stroke: '#fff',
        strokeThickness: 4,
      }).setOrigin(0.5);

    // Tambahkan teks credit placeholder sesuai PDF [cite: 124-137]
    const styleHeader = { fontSize: '24px', color: '#222', backgroundColor: '#ffffffaa', padding: 5 };
    const styleItem = { fontSize: '18px', color: '#000', backgroundColor: '#ffffffaa', padding: 3 };
    let yPos = this.scale.height * 0.35;

    this.add.text(this.centerX, yPos, 'Creator', styleHeader).setOrigin(0.5);
    yPos += 40;
    this.add.text(this.centerX, yPos, '- Yossa Michael', styleItem).setOrigin(0.5); // [cite: 125] (Contoh)
    yPos += 60;

    this.add.text(this.centerX, yPos, 'Backsound Artist', styleHeader).setOrigin(0.5); // [cite: 126]
    yPos += 40;
    this.add.text(this.centerX, yPos, '- Artist BGM 1', styleItem).setOrigin(0.5); // [cite: 127] (Contoh)
    yPos += 30;
    this.add.text(this.centerX, yPos, '- Artist BGM 2', styleItem).setOrigin(0.5); // [cite: 128] (Contoh)
    yPos += 60;

    // ... Tambahkan bagian lain seperti Animation Artist [cite: 130], Sound Effect Artist [cite: 135] jika perlu ...
     this.add.text(this.centerX, yPos, 'Sound Effect Artist', styleHeader).setOrigin(0.5);
     yPos += 40;
     this.add.text(this.centerX, yPos, '- Artist SFX', styleItem).setOrigin(0.5); // [cite: 136] (Contoh)


    // Tombol kembali dan Musik sudah ada di BaseScene [cite: 121, 122]
  }
}
