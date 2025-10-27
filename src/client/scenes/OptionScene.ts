// File: src/client/scenes/OptionScene.ts
import { BaseScene } from './BaseScene';

export class OptionScene extends BaseScene {
  constructor() {
    super('OptionScene');
  }

  public override create() {
    super.create();
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
    const title = this.add.text(this.centerX, this.scale.height * 0.2, 'Option', {
        fontFamily: 'Nunito', fontSize: '48px', color: '#000', stroke: '#fff', strokeThickness: 4,
      }).setOrigin(0.5);
    this.sceneContentGroup.add(title);

    let yPos = this.scale.height * 0.35;
    const spacing = this.scale.height * 0.1;

    // Helper akan menambahkan item ke group (font di helper)
    this.createOptionItem(yPos, 'Bahasa: Indonesia');
    yPos += spacing;
    this.createOptionItem(yPos, 'Mode Theme: Light');
    yPos += spacing;
    this.createOptionItem(yPos, 'Sound Effect: On');
    yPos += spacing;
    this.createOptionItem(yPos, 'Backsound: On');
    yPos += spacing;
    this.createOptionItem(yPos, 'Remove Account');

     // 3. Listener HANYA untuk tombol musik/kembali
     this.input.on(Phaser.Input.Events.POINTER_MOVE, (pointer: Phaser.Input.Pointer) => {
        let onUtilButton = false;
        if (this.musicButton && this.isPointerOver(pointer, this.musicButton)) onUtilButton = true;
        if (this.backButton && this.isPointerOver(pointer, this.backButton)) onUtilButton = true;
        this.input.setDefaultCursor(onUtilButton ? 'pointer' : 'default');
     });
     this.input.on(Phaser.Input.Events.GAME_OUT, () => {
         this.input.setDefaultCursor('default');
     });
  }

  // Helper ini langsung MENAMBAHKAN ke group (Font Nunito)
  createOptionItem(y: number, text: string) {
    if (!this.sceneContentGroup) return;

    const itemText = this.add.text(this.centerX, y, text, {
      fontFamily: 'Nunito', // <-- FONT
      fontSize: '24px', color: '#000', backgroundColor: '#ffffffaa',
      padding: { x: 15, y: 8 }, fixedWidth: this.scale.width * 0.7
    }).setOrigin(0.5);

    this.sceneContentGroup.add(itemText);
    // TODO: Tambahkan interaktivitas jika perlu (gunakan pola listener scene)
  }
}
