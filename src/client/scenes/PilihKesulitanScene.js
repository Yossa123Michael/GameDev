import { BaseScene } from './BaseScene';
export class PilihKesulitanScene extends BaseScene {
    constructor() {
        super('PilihKesulitanScene');
        this.mode = 'belajar';
    }
    init(data) {
        if (data?.mode)
            this.mode = data.mode;
    }
    create() {
        super.create();
        // tombol kembali ke PilihModeScene
        this.createCommonButtons('PilihModeScene');
        this.draw();
    }
    draw() {
        super.draw();
        if (!this.sceneContentGroup)
            return;
        const title = this.add.text(this.centerX, this.scale.height * 0.18, 'Pilih Kesulitan', {
            fontFamily: 'Nunito', fontSize: '40px', color: '#000', stroke: '#fff', strokeThickness: 3
        }).setOrigin(0.5);
        this.sceneContentGroup.add(title);
        const make = (y, label, diff) => this.createButton(y, label, () => this.scene.start('GameScene', { mode: this.mode, difficulty: diff }));
        const mudah = make(this.scale.height * 0.45, 'Mudah', 'mudah');
        const menengah = make(this.scale.height * 0.58, 'Menengah', 'menengah');
        const sulit = make(this.scale.height * 0.71, 'Sulit', 'sulit');
        const pro = make(this.scale.height * 0.84, 'Pro', 'pro'); // tombol PRO dikembalikan
        this.sceneContentGroup.addMultiple([mudah, menengah, sulit, pro]);
    }
}
