// File: src/client/scenes/MainMenuScene.ts
import { BaseScene } from './BaseScene'; // Import BaseScene

export class MainMenuScene extends BaseScene { // extends BaseScene
  constructor() {
    super('MainMenuScene');
  }

  // Hapus override karena create() tidak di-override, hanya memanggil super
  create() {
    super.create(); // Panggil create() dari BaseScene untuk background & resize handler
    this.draw();    // Panggil draw() pertama kali
  }

  // Fungsi create() diubah menjadi draw()
  // Tambahkan override karena draw() ada di BaseScene
  public override draw() {
    super.draw(); // Bersihkan elemen spesifik scene ini (jika ada)

    // Judul Game - Posisi dinamis [cite: 21, 22]
    this.add.text(this.centerX, this.scale.height * 0.2, 'Road Knowledge', {
        fontSize: '48px',
        color: '#000000', // Ubah warna agar kontras dengan background baru
        align: 'center',
        // Tambahkan stroke agar lebih terbaca di atas background gradient
        stroke: '#ffffff',
        strokeThickness: 4
      }).setOrigin(0.5);

    // Tombol-tombol - Posisi dinamis
    this.createButton(this.scale.height * 0.4, 'Start Test', () => this.scene.start('PilihModeScene')); // [cite: 23]
    this.createButton(this.scale.height * 0.5, 'Leaderboard', () => this.scene.start('LeaderboardScene')); // [cite: 24]
    this.createButton(this.scale.height * 0.6, 'Achievement', () => this.scene.start('AchievementScene')); // [cite: 25] (Typo di PDF, pakai Achievement)
    this.createButton(this.scale.height * 0.7, 'Option', () => this.scene.start('OptionScene')); // [cite: 26]
    this.createButton(this.scale.height * 0.8, 'Credit', () => this.scene.start('CreditScene')); // [cite: 27]
  }

  // Fungsi helper untuk membuat tombol
  createButton(y: number, text: string, onClick: () => void) {
    const buttonWidth = this.scale.width * 0.8;
    const buttonHeight = 60;

    const buttonRect = this.add.rectangle(this.centerX, y, buttonWidth, buttonHeight)
      .setFillStyle(0xffffff, 0.9) // Buat agak transparan
      .setStrokeStyle(2, 0x000000);

    const buttonText = this.add.text(this.centerX, y, text, {
        fontSize: '24px',
        color: '#000000',
      }).setOrigin(0.5);

    // Jadikan container agar rectangle dan text jadi satu kesatuan interaktif
    const container = this.add.container(0, 0, [buttonRect, buttonText]);
    container.setSize(buttonWidth, buttonHeight); // Set ukuran container untuk hit area
    container.setInteractive({ useHandCursor: true })
      .on('pointerdown', onClick)
      .on('pointerover', () => buttonRect.setFillStyle(0xeeeeee, 0.9))
      .on('pointerout', () => buttonRect.setFillStyle(0xffffff, 0.9));

    // Posisikan container, bukan rectangle
    container.setPosition(this.centerX - container.width / 2, y - container.height / 2);
  }
}
