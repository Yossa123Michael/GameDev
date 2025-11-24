import { BaseScene } from './BaseScene';

export class AchievementScene extends BaseScene {
  constructor() {
    super('AchievementScene');
  }

  public override create() {
    super.create();
  }

  public override draw() {
    super.draw();
    if (!this.sceneContentGroup) return;
    this.input.off(Phaser.Input.Events.POINTER_DOWN);
    this.input.off(Phaser.Input.Events.POINTER_MOVE);
    this.input.off(Phaser.Input.Events.GAME_OUT);
    this.input.setDefaultCursor('default');

    //Element Font
    const title = this.add.text(this.centerX, this.scale.height * 0.2, 'Achievement', {
        fontFamily: 'Nunito', fontSize: '48px', color: '#000', stroke: '#fff', strokeThickness: 4,
      }).setOrigin(0.5);
    this.sceneContentGroup.add(title);

    const cat1 = this.add.text(this.centerX, this.centerY - 50, 'Kategori 1: [ ] [ ] [ ]', { fontFamily: 'Nunito', fontSize: '20px', color: '#000', backgroundColor: '#ffffffaa', padding: { x: 5, y: 5 } }).setOrigin(0.5);
    const cat2 = this.add.text(this.centerX, this.centerY + 0, 'Kategori 2: [ ] [ ] [ ]', { fontFamily: 'Nunito', fontSize: '20px', color: '#000', backgroundColor: '#ffffffaa', padding: { x: 5, y: 5 } }).setOrigin(0.5);
    const cat3 = this.add.text(this.centerX, this.centerY + 50, 'Kategori 3: [ ] [ ] [ ]', { fontFamily: 'Nunito', fontSize: '20px', color: '#000', backgroundColor: '#ffffffaa', padding: { x: 5, y: 5 } }).setOrigin(0.5);
    const soon = this.add.text(this.centerX, this.centerY + 100, '(Fitur segera hadir)', { fontFamily: 'Nunito', fontSize: '16px', color: '#555', backgroundColor: '#ffffffaa', padding: { x: 5, y: 5 } }).setOrigin(0.5);

    this.sceneContentGroup.add(cat1);
    this.sceneContentGroup.add(cat2);
    this.sceneContentGroup.add(cat3);
    this.sceneContentGroup.add(soon);

     //Listener HANYA untuk tombol musik/kembali
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
}
