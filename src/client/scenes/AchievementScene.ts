// File: src/client/scenes/AchievementScene.ts
import { BaseScene } from './BaseScene';

export class AchievementScene extends BaseScene {
  constructor() {
    super('AchievementScene');
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
    const title = this.add.text(this.centerX, this.scale.height * 0.2, 'Achievement', {
        fontSize: '48px', color: '#000', stroke: '#fff', strokeThickness: 4,
      }).setOrigin(0.5);
    this.sceneContentGroup.add(title);

    const cat1 = this.add.text(this.centerX, this.centerY - 50, 'Kategori 1: [ ] [ ] [ ]', { fontSize: '20px', color: '#000', backgroundColor: '#ffffffaa', padding: { x: 5, y: 5 } }).setOrigin(0.5);
    const cat2 = this.add.text(this.centerX, this.centerY + 0, 'Kategori 2: [ ] [ ] [ ]', { fontSize: '20px', color: '#000', backgroundColor: '#ffffffaa', padding: { x: 5, y: 5 } }).setOrigin(0.5);
    const cat3 = this.add.text(this.centerX, this.centerY + 50, 'Kategori 3: [ ] [ ] [ ]', { fontSize: '20px', color: '#000', backgroundColor: '#ffffffaa', padding: { x: 5, y: 5 } }).setOrigin(0.5);
    const soon = this.add.text(this.centerX, this.centerY + 100, '(Fitur segera hadir)', { fontSize: '16px', color: '#555', backgroundColor: '#ffffffaa', padding: { x: 5, y: 5 } }).setOrigin(0.5);

    this.sceneContentGroup.add(cat1);
    this.sceneContentGroup.add(cat2);
    this.sceneContentGroup.add(cat3);
    this.sceneContentGroup.add(soon);

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
