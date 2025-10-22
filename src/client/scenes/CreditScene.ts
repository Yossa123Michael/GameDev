// File: src/client/scenes/CreditScene.ts
import { BaseScene } from './BaseScene';

export class CreditScene extends BaseScene {
  constructor() {
    super('CreditScene');
  }

  public override create() {
    super.create();
    // this.draw() dipanggil oleh BaseScene
  }

  public override draw() {
    // Panggil super.draw() PERTAMA
    super.draw();
    if (!this.sceneContentGroup) return;

    // Hapus listener scene input
    this.input.off(Phaser.Input.Events.POINTER_DOWN);
    this.input.off(Phaser.Input.Events.POINTER_MOVE);
    this.input.off(Phaser.Input.Events.GAME_OUT);
    this.input.setDefaultCursor('default');

    // Buat elemen teks dan tambahkan ke group
    const title = this.add.text(this.centerX, this.scale.height * 0.2, 'Credit', {
        fontSize: '48px', color: '#000', stroke: '#fff', strokeThickness: 4,
      }).setOrigin(0.5);
    this.sceneContentGroup.add(title);
      
    const styleHeader = { fontSize: '24px', color: '#222', backgroundColor: '#ffffffaa', padding: { x: 5, y: 5 } };
    const styleItem = { fontSize: '18px', color: '#000', backgroundColor: '#ffffffaa', padding: { x: 3, y: 3 } };
    let yPos = this.scale.height * 0.35;

    const h1 = this.add.text(this.centerX, yPos, 'Creator', styleHeader).setOrigin(0.5);
    yPos += 40;
    const i1 = this.add.text(this.centerX, yPos, '- Yossa Michael', styleItem).setOrigin(0.5);
    yPos += 60;
    this.sceneContentGroup.add(h1);
    this.sceneContentGroup.add(i1);

    const h2 = this.add.text(this.centerX, yPos, 'Backsound Artist', styleHeader).setOrigin(0.5);
    yPos += 40;
    const i2 = this.add.text(this.centerX, yPos, '- Artist BGM 1', styleItem).setOrigin(0.5);
    yPos += 30;
    const i3 = this.add.text(this.centerX, yPos, '- Artist BGM 2', styleItem).setOrigin(0.5);
    yPos += 60;
    this.sceneContentGroup.add(h2);
    this.sceneContentGroup.add(i2);
    this.sceneContentGroup.add(i3);

    const h3 = this.add.text(this.centerX, yPos, 'Sound Effect Artist', styleHeader).setOrigin(0.5);
     yPos += 40;
    const i4 = this.add.text(this.centerX, yPos, '- Artist SFX', styleItem).setOrigin(0.5);
    this.sceneContentGroup.add(h3);
    this.sceneContentGroup.add(i4);

     // Listener untuk tombol musik/kembali
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
  
  // Helper cek pointer
  public isPointerOver(pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject): boolean {
        if (!(gameObject instanceof Phaser.GameObjects.Container || gameObject instanceof Phaser.GameObjects.Text)) { return false; }
        const bounds = gameObject.getBounds();
        return bounds.contains(pointer.x, pointer.y);
    }
}
