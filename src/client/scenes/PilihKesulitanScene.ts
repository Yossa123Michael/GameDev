// File: src/client/scenes/PilihKesulitanScene.ts
// Hapus import Phaser
import { BaseScene } from './BaseScene'; // Import BaseScene

export class PilihKesulitanScene extends BaseScene { // extends BaseScene
  private mode!: string;

  constructor() {
    super('PilihKesulitanScene');
  }

  init(data: { mode: string }) {
    this.mode = data.mode;
  }

  public override create() {
    super.create();
    // Setel ulang target tombol kembali di BaseScene khusus untuk scene ini
    super.createCommonButtons('PilihModeScene');
    this.draw();
  }

  public override draw() {
    super.draw(); // Panggil draw dari BaseScene

    this.add.text(this.centerX, this.scale.height * 0.2, 'Pilih tingkat Kesulitan', { // [cite: 35]
        fontSize: '40px',
        color: '#000000',
        align: 'center',
        wordWrap: { width: this.scale.width * 0.9 },
        stroke: '#ffffff',
        strokeThickness: 4
      }).setOrigin(0.5);

    // Tombol Kesulitan
    this.createButton(this.scale.height * 0.4, 'Mudah', () => this.startGame('mudah')); // [cite: 36]
    this.createButton(this.scale.height * 0.5, 'Menengah', () => this.startGame('menengah')); // [cite: 37]
    this.createButton(this.scale.height * 0.6, 'Sulit', () => this.startGame('sulit')); // [cite: 38]
    this.createButton(this.scale.height * 0.7, 'Pro', () => this.startGame('pro')); // [cite: 39]

    // Tombol Kembali sudah dihandle BaseScene
  }

  startGame(difficulty: 'mudah' | 'menengah' | 'sulit' | 'pro') {
    // Kirim juga mode saat start GameScene
    this.scene.start('GameScene', { mode: this.mode, difficulty: difficulty });
  }

  // Fungsi createButton sama
  createButton(y: number, text: string, onClick: () => void) {
    const buttonWidth = this.scale.width * 0.8;
    const buttonHeight = 60;
    const buttonRect = this.add.rectangle(0, 0, buttonWidth, buttonHeight)
      .setFillStyle(0xffffff, 0.9)
      .setStrokeStyle(2, 0x000000);
    const buttonText = this.add.text(buttonWidth / 2, buttonHeight / 2, text, {
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
