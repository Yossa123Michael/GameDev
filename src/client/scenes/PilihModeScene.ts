import { BaseScene } from './BaseScene';

export class PilihModeScene extends BaseScene {
  constructor() {
    super('PilihModeScene');
  }

  public override create() {
    super.create();
    // this.draw() dipanggil oleh BaseScene
  }

  public override draw() {
    super.draw();
    if (!this.sceneContentGroup) return;
    this.input.off(Phaser.Input.Events.POINTER_DOWN);
    this.input.off(Phaser.Input.Events.POINTER_MOVE);
    this.input.off(Phaser.Input.Events.GAME_OUT);
    this.input.setDefaultCursor('default');

    const title = this.add.text(this.centerX, this.scale.height * 0.2, 'Pilih Mode', {
        fontFamily: 'Nunito',
        fontSize: '48px', color: '#000000', stroke: '#ffffff', strokeThickness: 4
      }).setOrigin(0.5);
    this.sceneContentGroup.add(title);

    const belajarButton = this.createButton(this.scale.height * 0.45, 'Belajar');
    const surviveButton = this.createButton(this.scale.height * 0.6, 'Survive');

    this.sceneContentGroup.add(belajarButton);
    this.sceneContentGroup.add(surviveButton);

    // PERUBAHAN: Untuk 'Survive' langsung mulai GameScene (mode: 'survive') sehingga tidak
    // melewati layar PilihKesulitanScene.
    const buttons = [
        { container: belajarButton, action: () => this.scene.start('PilihKesulitanScene', { mode: 'belajar' }) },
        { container: surviveButton, action: () => this.scene.start('GameScene', { mode: 'survive', difficulty: 'mudah' }) }
    ];

    this.input.on(Phaser.Input.Events.POINTER_DOWN, (pointer: Phaser.Input.Pointer) => {
        buttons.forEach(btn => {
            if (this.isPointerOver(pointer, btn.container)) {
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
        this.input.setDefaultCursor(onButton || onUtilButton ? 'pointer' : 'default');
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

  //CreateButton (Rounded & Font)
  createButton(y: number, text: string): Phaser.GameObjects.Container {
    const buttonWidth = this.scale.width * 0.8;
    const buttonHeight = 60;
    const cornerRadius = 20;

    const buttonGraphics = this.add.graphics();
    this.updateButtonGraphics(buttonGraphics, buttonWidth, buttonHeight, 0xffffff, 0.9, cornerRadius);

    //Font Nunito
    const buttonText = this.add.text(
        buttonWidth / 2, buttonHeight / 2, text,
        {
            fontFamily: 'Nunito', // <-- FONT
            fontSize: '24px',
            color: '#000000'
        }
    ).setOrigin(0.5);

    const container = this.add.container(
        this.centerX - buttonWidth / 2,
        y - buttonHeight / 2
    );
    container.setSize(buttonWidth, buttonHeight);
    container.add([buttonGraphics, buttonText]);
    container.setName(text);
    container.setData('isHovered', false);

    return container;
  }

  //Helper gambar tombol
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

  // --- Helper SFX (Tambahkan override)
  protected override playSound(key: string, config?: Phaser.Types.Sound.SoundConfig) {
      super.playSound(key, config);
  }

}
