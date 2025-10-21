
import { BaseScene } from './BaseScene'; // Import BaseScene

export class ResultsScene extends BaseScene { // extends BaseScene
  private finalScore: number = 0;

  constructor() {
    super('ResultsScene');
  }

  init(data: { score: number }) {
    this.finalScore = data.score;
  }

  public override create() {
    super.create();
    this.draw();
  }

  public override draw() {
    super.draw();

    this.add.text(this.centerX, this.scale.height * 0.3, 'Kuis Selesai!', {
        fontSize: '48px',
        color: '#000',
      }).setOrigin(0.5);
    
    this.add.text(this.centerX, this.scale.height * 0.45, `Skor Akhir Anda: ${this.finalScore}`, {
        fontSize: '32px',
        color: '#000',
      }).setOrigin(0.5);

    const playAgainButton = this.add.text(this.centerX, this.scale.height * 0.6, 'Main Lagi', {
        fontSize: '32px',
        color: '#fff',
        backgroundColor: '#007bff',
        padding: { x: 20, y: 10 },
      }).setOrigin(0.5);

    playAgainButton.setInteractive({ useHandCursor: true });
    playAgainButton.on('pointerdown', () => this.scene.start('MainMenuScene'));
  }
}
