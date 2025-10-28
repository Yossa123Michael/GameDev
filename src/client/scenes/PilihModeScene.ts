// File: src/client/scenes/PilihModeScene.ts
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
    // 1. Bersihkan group & listener lama
    super.draw();
    if (!this.sceneContentGroup) return;
    this.input.off(Phaser.Input.Events.POINTER_DOWN);
    this.input.off(Phaser.Input.Events.POINTER_MOVE);
    this.input.off(Phaser.Input.Events.GAME_OUT);
    this.input.setDefaultCursor('default');

    // 2. Buat elemen (Font Nunito)
    const title = this.add.text(this.centerX, this.scale.height * 0.2, 'Pilih Mode', {
        fontFamily: 'Nunito', // <-- FONT
        fontSize: '48px', color: '#000000', stroke: '#ffffff', strokeThickness: 4
      }).setOrigin(0.5);
    this.sceneContentGroup.add(title);

    // Buat tombol (Gaya Rounded)
    const belajarButton = this.createButton(this.scale.height * 0.45, 'Belajar');
    const surviveButton = this.createButton(this.scale.height * 0.6, 'Survive');

    // Tambahkan tombol ke group
    this.sceneContentGroup.add(belajarButton);
    this.sceneContentGroup.add(surviveButton);

    const buttons = [
        { container: belajarButton, action: () => this.scene.start('PilihKesulitanScene', { mode: 'belajar' }) },
        { container: surviveButton, action: () => this.scene.start('PilihKesulitanScene', { mode: 'survive' }) }
    ];

    // 3. Listener Scene
    this.input.on(Phaser.Input.Events.POINTER_DOWN, (pointer: Phaser.Input.Pointer) => {
        buttons.forEach(btn => {
            if (this.isPointerOver(pointer, btn.container)) { // Pakai isPointerOver dari BaseScene
                const graphics = btn.container.getAt(0) as Phaser.GameObjects.Graphics;
                this.updateButtonGraphics(graphics, btn.container.width, btn.container.height, 0xdddddd);
                this.time.delayedCall(100, () => {
                    this.playSound('sfx_click'); // Mainkan SFX
                    btn.action();
                });
            }
        });
    });

    this.input.on(Phaser.Input.Events.POINTER_MOVE, (pointer: Phaser.Input.Pointer) => {
        let onButton = false;
        buttons.forEach(btn => {
            // Pastikan container dan graphics ada sebelum diakses
            if (!btn.container || !btn.container.active) return;
            const graphics = btn.container.getAt(0) as Phaser.GameObjects.Graphics;
            if (!graphics) return;
            
            if (this.isPointerOver(pointer, btn.container)) { // Pakai isPointerOver dari BaseScene
                onButton = true;
                if (!btn.container.getData('isHovered')) {
                   this.updateButtonGraphics(graphics, btn.container.width, btn.container.height, 0xeeeeee); // Hover
                   btn.container.setData('isHovered', true);
                }
            } else {
                 if (btn.container.getData('isHovered')) {
                    this.updateButtonGraphics(graphics, btn.container.width, btn.container.height, 0xffffff); // Normal
                    btn.container.setData('isHovered', false);
                 }
            }
        });
        // Cek tombol utilitas
        let onUtilButton = false;
        if (this.musicButton && this.isPointerOver(pointer, this.musicButton)) onUtilButton = true;
        if (this.backButton && this.isPointerOver(pointer, this.backButton)) onUtilButton = true;
        this.input.setDefaultCursor(onButton || onUtilButton ? 'pointer' : 'default');
    });

    this.input.on(Phaser.Input.Events.GAME_OUT, () => {
         buttons.forEach(btn => {
             if (!btn.container || !btn.container.active) return;
             const graphics = btn.container.getAt(0) as Phaser.GameObjects.Graphics;
             if (!graphics) return;
             this.updateButtonGraphics(graphics, btn.container.width, btn.container.height, 0xffffff); // Normal
             btn.container.setData('isHovered', false);
         });
         this.input.setDefaultCursor('default');
    });
  }

  // --- Fungsi createButton (Gaya Rounded & Font Nunito) ---
  createButton(y: number, text: string): Phaser.GameObjects.Container {
    const buttonWidth = this.scale.width * 0.8;
    const buttonHeight = 60;
    const cornerRadius = 20;

    const buttonGraphics = this.add.graphics();
    this.updateButtonGraphics(buttonGraphics, buttonWidth, buttonHeight, 0xffffff, 0.9, cornerRadius);

    // Gunakan font Nunito
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

  // --- Helper gambar tombol ---
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

  // --- Helper SFX (Tambahkan override) ---
  protected override playSound(key: string, config?: Phaser.Types.Sound.SoundConfig) {
      super.playSound(key, config);
  }

}
