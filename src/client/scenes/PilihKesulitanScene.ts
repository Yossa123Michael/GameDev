import { BaseScene } from './BaseScene';

type DifficultyKey = 'mudah' | 'menengah' | 'sulit' | 'pro';

export class PilihKesulitanScene extends BaseScene {
  public mode: 'belajar' | 'survive' = 'belajar';

  constructor() { super('PilihKesulitanScene'); }

  init(data: { mode?: 'belajar' | 'survive' }) {
    if (data?.mode) this.mode = data.mode;
  }

  public override create() {
    super.create();
    // Tombol kembali OK di layar ini (kembali ke PilihMode)
    this.createCommonButtons('PilihModeScene');
    this.draw();
  }

  public override draw() {
    super.draw();
    if (!this.sceneContentGroup) return;

    const title = this.add.text(this.centerX, this.scale.height * 0.18, 'Pilih Kesulitan', {
      fontFamily: 'Nunito', fontSize: '40px', color: '#000', stroke: '#fff', strokeThickness: 3
    }).setOrigin(0.5);
    this.sceneContentGroup.add(title);

    const make = (y: number, label: string, diff: DifficultyKey) =>
      this.createButton(y, label, () => this.scene.start('GameScene', { mode: this.mode, difficulty: diff }));

    const mudah = make(this.scale.height * 0.45, 'Mudah', 'mudah');
    const menengah = make(this.scale.height * 0.58, 'Menengah', 'menengah');
    const sulit = make(this.scale.height * 0.71, 'Sulit', 'sulit');

    this.sceneContentGroup.addMultiple([mudah, menengah, sulit]);
  }
}
