import Phaser from 'phaser';

export class PilihKesulitanScene extends Phaser.Scene {
  private mode!: string;

  constructor() {
    super('PilihKesulitanScene');
  }

  init(data: { mode: string }) {
    this.mode = data.mode; // Menerima data 'mode' dari scene sebelumnya
  }

  create() {
    this.cameras.main.setBackgroundColor('#ffffff');

    this.add.text(this.scale.width / 2, 100, 'Pilih tingkat Kesulitan', {
        fontSize: '40px',
        color: '#000000',
      }).setOrigin(0.5);

    // Tombol Kesulitan [cite: 30, 31, 33, 34]
    this.createButton(200, 'Mudah', () => this.startGame('mudah'));
    this.createButton(280, 'Menengah', () => this.startGame('menengah'));
    this.createButton(360, 'Sulit', () => this.startGame('sulit'));
    this.createButton(440, 'Pro', () => this.startGame('pro'));

    // Tombol Kembali
    const backButton = this.add.text(50, 50, '< Kembali', {
        fontSize: '24px',
        color: '#000000',
      }).setInteractive({ useHandCursor: true });
      
    backButton.on('pointerdown', () => this.scene.start('PilihModeScene'));
  }

  startGame(difficulty: 'mudah' | 'menengah' | 'sulit' | 'pro') {
    // Mengirim data 'mode' dan 'difficulty' ke GameScene
    this.scene.start('GameScene', { mode: this.mode, difficulty: difficulty });
  }
  
  createButton(y: number, text: string, onClick: () => void) {
    // Implementasi tombol...
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
}
