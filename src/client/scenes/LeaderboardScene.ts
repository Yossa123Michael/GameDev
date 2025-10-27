// File: src/client/scenes/LeaderboardScene.ts
import { BaseScene } from './BaseScene';

export class LeaderboardScene extends BaseScene {
  constructor() {
    super('LeaderboardScene');
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
    const title = this.add.text(this.centerX, this.scale.height * 0.2, 'Leaderboard', {
        fontFamily: 'Nunito', fontSize: '48px', color: '#000', stroke: '#fff', strokeThickness: 4,
      }).setOrigin(0.5);
    this.sceneContentGroup.add(title);

    const subTitle = this.add.text(this.centerX, this.centerY - 50, 'Peringkat Berdasarkan Skor', {
        fontFamily: 'Nunito', fontSize: '24px', color: '#333', backgroundColor: '#ffffffaa', padding: { x: 5, y: 5 }
    }).setOrigin(0.5);
    this.sceneContentGroup.add(subTitle);

    const p1 = this.add.text(this.centerX, this.centerY + 0, '1. Player A - 150', { fontFamily: 'Nunito', fontSize: '20px', color: '#000', backgroundColor: '#ffffffaa', padding: { x: 5, y: 5 } }).setOrigin(0.5);
    const p2 = this.add.text(this.centerX, this.centerY + 40, '2. Player B - 120', { fontFamily: 'Nunito', fontSize: '20px', color: '#000', backgroundColor: '#ffffffaa', padding: { x: 5, y: 5 } }).setOrigin(0.5);
    const p3 = this.add.text(this.centerX, this.centerY + 80, '3. Player C - 100', { fontFamily: 'Nunito', fontSize: '20px', color: '#000', backgroundColor: '#ffffffaa', padding: { x: 5, y: 5 } }).setOrigin(0.5);
    const soon = this.add.text(this.centerX, this.centerY + 120, '(Fitur lengkap segera hadir)', { fontFamily: 'Nunito', fontSize: '16px', color: '#555', backgroundColor: '#ffffffaa', padding: { x: 5, y: 5 } }).setOrigin(0.5);

    this.sceneContentGroup.add(p1);
    this.sceneContentGroup.add(p2);
    this.sceneContentGroup.add(p3);
    this.sceneContentGroup.add(soon);

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
}
