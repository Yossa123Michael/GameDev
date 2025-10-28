import { BaseScene } from './BaseScene';

// Definisikan tipe DifficultyKey
type DifficultyKey = 'mudah' | 'menengah' | 'sulit' | 'pro';

export class PilihKesulitanScene extends BaseScene {
  private mode!: string;

  constructor() {
    super('PilihKesulitanScene');
  }

  init(data: { mode: string }) {
    this.mode = data.mode;
  }

  public override create() {
    super.create();
    super.createCommonButtons('PilihModeScene'); // Atur tombol kembali
  }

  public override draw() { // draw() dipanggil oleh BaseScene
    super.draw();
    if (!this.sceneContentGroup) return;
    this.input.off(Phaser.Input.Events.POINTER_DOWN);
    this.input.off(Phaser.Input.Events.POINTER_MOVE);
    this.input.off(Phaser.Input.Events.GAME_OUT);
    this.input.setDefaultCursor('default');

    const title = this.add.text(this.centerX, this.scale.height * 0.2, 'Pilih tingkat Kesulitan', {
        fontFamily: 'Nunito',
        fontSize: '40px', color: '#000000', align: 'center',
        wordWrap: { width: this.scale.width * 0.9 },
        stroke: '#ffffff', strokeThickness: 4
      }).setOrigin(0.5);
    this.sceneContentGroup.add(title);

    const buttonTexts = ['Mudah', 'Menengah', 'Sulit', 'Pro'];
    const buttonCount = buttonTexts.length;
    // const buttonHeight = 60;

    const buttonAreaStartY = this.scale.height * 0.28;
    const buttonAreaEndY = this.scale.height * 0.95;
    const buttonAreaHeight = buttonAreaEndY - buttonAreaStartY;
    const totalSlots = buttonCount + 1;
    const slotHeight = buttonAreaHeight / totalSlots;
    const firstButtonCenterY = buttonAreaStartY + (slotHeight / 2);

    const buttons: { container: Phaser.GameObjects.Container, action: () => void }[] = [];

    //Buat tombol dan tempatkan di tengah slot masing-masing
    buttonTexts.forEach((text, index) => {
        const buttonCenterY = firstButtonCenterY + (index * slotHeight);
        const difficultyKey = text.toLowerCase() as DifficultyKey;

        const buttonContainer = this.createButton(buttonCenterY, text);
        this.sceneContentGroup.add(buttonContainer);
        buttons.push({
            container: buttonContainer,
            action: () => this.startGame(difficultyKey)
        });
    });

    //Listener Scene (Pointer untuk hilangkan warning)
    this.input.on(Phaser.Input.Events.POINTER_DOWN, (pointer: Phaser.Input.Pointer) => {
        buttons.forEach(btn => {
            if (this.isPointerOver(pointer, btn.container)) { // pointer digunakan di sini
                const graphics = btn.container.getAt(0) as Phaser.GameObjects.Graphics;
                this.updateButtonGraphics(graphics, btn.container.width, btn.container.height, 0xdddddd);
                this.time.delayedCall(100, () => {
                     this.playSound('sfx_click');
                     btn.action();
                });
            }
        });
    });

    this.input.on(Phaser.Input.Events.POINTER_MOVE, (pointer: Phaser.Input.Pointer) => {
        let onButton = false;
        buttons.forEach(btn => {
            const graphics = btn.container.getAt(0) as Phaser.GameObjects.Graphics;
            if (this.isPointerOver(pointer, btn.container)) {
                onButton = true;
                if (!btn.container.getData('isHovered')) {
                   this.updateButtonGraphics(graphics, btn.container.width, btn.container.height, 0xeeeeee);
                   btn.container.setData('isHovered', true);
                }
            } else {
                 if (btn.container.getData('isHovered')) {
                    this.updateButtonGraphics(graphics, btn.container.width, btn.container.height, 0xffffff);
                    btn.container.setData('isHovered', false);
                 }
            }
        });
        let onUtilButton = false;
        if (this.musicButton && this.isPointerOver(pointer, this.musicButton)) onUtilButton = true;
        if (this.backButton && this.isPointerOver(pointer, this.backButton)) onUtilButton = true;
    });

    this.input.on(Phaser.Input.Events.GAME_OUT, () => {
         buttons.forEach(btn => {
             const graphics = btn.container.getAt(0) as Phaser.GameObjects.Graphics;
             this.updateButtonGraphics(graphics, btn.container.width, btn.container.height, 0xffffff);
             btn.container.setData('isHovered', false);
         });
         this.input.setDefaultCursor('default');
    });
  }

  startGame(difficulty: DifficultyKey) {
  console.log('PilihKesulitanScene.startGame ->', { mode: this.mode, difficulty });
  this.scene.start('GameScene', { mode: this.mode, difficulty: difficulty });
}

  //CreateButton (Rounded & Font)
  createButton(y: number, text: string): Phaser.GameObjects.Container {
    const buttonWidth = this.scale.width * 0.8;
    const buttonHeight = 60; // Nilai tinggi tetap dipakai di sini
    const cornerRadius = 20;

    const buttonGraphics = this.add.graphics();
    this.updateButtonGraphics(buttonGraphics, buttonWidth, buttonHeight, 0xffffff, 0.9, cornerRadius);

    const buttonText = this.add.text(
        buttonWidth / 2, buttonHeight / 2, text,
        {
            fontFamily: 'Nunito',
            fontSize: '24px',
            color: '#000000'
        }
    ).setOrigin(0.5);

    const container = this.add.container(
        this.centerX - buttonWidth / 2,
        y - buttonHeight / 2 // y adalah posisi tengah tombol
    );
    container.setSize(buttonWidth, buttonHeight);
    container.add([buttonGraphics, buttonText]);
    container.setName(text);
    container.setData('isHovered', false);

    return container;
  } //CreateButton()
  
  //Helper gambar tombol ---
  private updateButtonGraphics(
      graphics: Phaser.GameObjects.Graphics,
      width: number,
      height: number,
      fillColor: number,
      alpha: number = 0.9,
      cornerRadius: number = 20
  ) {
      graphics.clear();
      graphics.fillStyle(fillColor, alpha);
      graphics.lineStyle(2, 0x000000, 1);
      graphics.fillRoundedRect(0, 0, width, height, cornerRadius);
      graphics.strokeRoundedRect(0, 0, width, height, cornerRadius);
  }

  protected override playSound(key: string, config?: Phaser.Types.Sound.SoundConfig) {
      super.playSound(key, config);
  } // <-- Akhir playSound()

}
