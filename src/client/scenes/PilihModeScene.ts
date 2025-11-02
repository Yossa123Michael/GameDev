import { BaseScene } from './BaseScene';

export class PilihModeScene extends BaseScene {
  constructor() {
    super('PilihModeScene');
  }

  public override create() {
    super.create();
    this.draw();
  }

  public override draw() {
    super.draw();
    if (!this.sceneContentGroup) return;

    // Judul
    const title = this.add
      .text(this.centerX, this.scale.height * 0.18, 'Pilih Mode', {
        fontFamily: 'Nunito',
        fontSize: '48px',
        color: '#000000',
        stroke: '#ffffff',
        strokeThickness: 4
      })
      .setOrigin(0.5);
    this.sceneContentGroup.add(title);

    // Tombol
    const belajarButton = this.createButton(this.scale.height * 0.45, 'Belajar', () =>
      this.scene.start('PilihKesulitanScene', { mode: 'belajar' })
    );
    const surviveButton = this.createButton(this.scale.height * 0.6, 'Survive', () =>
      this.scene.start('GameScene', { mode: 'survive', difficulty: 'mudah' })
    );

    this.sceneContentGroup.addMultiple([belajarButton, surviveButton]);
  }
}
