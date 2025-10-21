
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
    this.draw();
  }

  public override draw() {
    super.draw();

    this.add.text(this.centerX, this.scale.height * 0.2, 'Pilih tingkat Kesulitan', {
        fontSize: '40px',
        color: '#000000',
        align: 'center',
        wordWrap: { width: this.scale.width * 0.9 }
      }).setOrigin(0.5);

    // Tombol Kesulitan
    this.createButton(this.scale.height * 0.4, 'Mudah', () => this.startGame('mudah'));
    this.createButton(this.scale.height * 0.5, 'Menengah', () => this.startGame('menengah'));
    this.createButton(this.scale.height * 0.6, 'Sulit', () => this.startGame('sulit'));
    this.createButton(this.scale.height * 0.7, 'Pro', () => this.startGame('pro'));

    // Tombol Kembali
    const backButton = this.add.text(this.scale.width * 0.1, this.scale.height * 0.1, '< Kembali', {
        fontSize: '24px',
        color: '#000000',
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });
      
    backButton.on('pointerdown', () => this.scene.start('PilihModeScene'));
  }

  startGame(difficulty: 'mudah' | 'menengah' | 'sulit' | 'pro') {
    this.scene.start('GameScene', { mode: this.mode, difficulty: difficulty });
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
}
