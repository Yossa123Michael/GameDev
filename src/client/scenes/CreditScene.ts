import { BaseScene } from './BaseScene';

export class CreditScene extends BaseScene {
  constructor() {
    super('CreditScene');
  }

  public override create() {
    super.create();
    // draw() dipanggil oleh BaseScene
  }

  public override draw() {
    super.draw();
    if (!this.sceneContentGroup) return;
    this.input.off(Phaser.Input.Events.POINTER_DOWN);
    this.input.off(Phaser.Input.Events.POINTER_MOVE);
    this.input.off(Phaser.Input.Events.GAME_OUT);
    this.input.setDefaultCursor('default');

    // 2. Buat elemen (Font Nunito)
    const title = this.add.text(this.centerX, this.scale.height * 0.2, 'Credit', {
        fontFamily: 'Nunito', fontSize: '48px', color: '#000', stroke: '#fff', strokeThickness: 4,
      }).setOrigin(0.5);
    this.sceneContentGroup.add(title);

    // Gunakan font Nunito di style
    const styleHeader = { fontFamily: 'Nunito', fontSize: '24px', color: '#222', backgroundColor: '#ffffffaa', padding: { x: 5, y: 5 } };
    const styleItem = { fontFamily: 'Nunito', fontSize: '18px', color: '#000', backgroundColor: '#ffffffaa', padding: { x: 3, y: 3 } };
    let yPos = this.scale.height * 0.35; // Mulai posisi Y

    // Creator
    const h1 = this.add.text(this.centerX, yPos, 'Creator', styleHeader).setOrigin(0.5);
    yPos += 40; // Jarak setelah header
    const i1 = this.add.text(this.centerX, yPos, '- Yossa Michael', styleItem).setOrigin(0.5);
    yPos += 60; // Jarak setelah item, sebelum header berikutnya
    this.sceneContentGroup.add(h1);
    this.sceneContentGroup.add(i1);

    //Sound Artist
    const h2 = this.add.text(this.centerX, yPos, 'Backsound Artist', styleHeader).setOrigin(0.5);
    yPos += 40; // Jarak setelah header
    const i2 = this.add.text(this.centerX, yPos, '- Artist BGM 1', styleItem).setOrigin(0.5);
    yPos += 30; // Jarak antar item
    const i3 = this.add.text(this.centerX, yPos, '- Artist BGM 2', styleItem).setOrigin(0.5);
    yPos += 60; // Jarak setelah item terakhir di section ini
    this.sceneContentGroup.add(h2);
    this.sceneContentGroup.add(i2);
    this.sceneContentGroup.add(i3);

    // Sound Effect Artist
    const h3 = this.add.text(this.centerX, yPos, 'Sound Effect Artist', styleHeader).setOrigin(0.5);
     yPos += 40; // Jarak setelah header
    const i4 = this.add.text(this.centerX, yPos, '- Artist SFX', styleItem).setOrigin(0.5);
    yPos += 60; // Jarak setelah item terakhir di section ini
    this.sceneContentGroup.add(h3);
    this.sceneContentGroup.add(i4);

    // Font Section
    const h4 = this.add.text(this.centerX, yPos, 'Font', styleHeader).setOrigin(0.5);
     yPos += 40; // Jarak setelah header
    const i5 = this.add.text(this.centerX, yPos, '- Nunito', styleItem).setOrigin(0.5);
    // yPos += 60; // Jarak setelah item terakhir (jika ada section lagi)
    this.sceneContentGroup.add(h4);
    this.sceneContentGroup.add(i5);

     //Listener HANYA untuk tombol musik dan kembali
     this.input.on(Phaser.Input.Events.POINTER_MOVE, (pointer: Phaser.Input.Pointer) => {
        let onUtilButton = false;
        // Gunakan isPointerOver dari BaseScene
        if (this.musicButton && this.isPointerOver(pointer, this.musicButton)) onUtilButton = true;
        if (this.backButton && this.isPointerOver(pointer, this.backButton)) onUtilButton = true;
        this.input.setDefaultCursor(onUtilButton ? 'pointer' : 'default');
     });
     this.input.on(Phaser.Input.Events.GAME_OUT, () => {
         this.input.setDefaultCursor('default');
     });
  } 
}
