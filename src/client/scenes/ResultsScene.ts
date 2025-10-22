// File: src/client/scenes/ResultsScene.ts
import { BaseScene } from './BaseScene';

export class ResultsScene extends BaseScene {
  private finalScore: number = 0;

  constructor() {
    super('ResultsScene');
  }

  init(data: { score: number }) {
    this.finalScore = data.score;
  }

  public override create() {
    super.create();
    // this.draw() dipanggil oleh BaseScene
  }

  public override draw() {
    // 1. Panggil super.draw() PERTAMA
    super.draw();
    if (!this.sceneContentGroup) return;

    // 2. HAPUS LISTENER LAMA DARI SCENE
    this.input.off(Phaser.Input.Events.POINTER_DOWN);
    this.input.off(Phaser.Input.Events.POINTER_MOVE);
    this.input.off(Phaser.Input.Events.GAME_OUT);
    this.input.setDefaultCursor('default');

    // 3. Buat elemen dan tambahkan ke group
    const title = this.add.text(this.centerX, this.scale.height * 0.3, 'Kuis Selesai!', {
        fontSize: '48px', color: '#000000', stroke: '#ffffff', strokeThickness: 4
      }).setOrigin(0.5);
    this.sceneContentGroup.add(title);

    const scoreText = this.add.text(this.centerX, this.scale.height * 0.45, `Skor Akhir Anda: ${this.finalScore}`, {
        fontSize: '32px', color: '#000000', stroke: '#ffffff', strokeThickness: 2
      }).setOrigin(0.5);
    this.sceneContentGroup.add(scoreText);

    // Buat tombol (menggunakan helper yang sudah interaktif)
    const btn1 = this.createStyledButton(this.centerX, this.scale.height * 0.6, 'Main Lagi');
    const btn2 = this.createStyledButton(this.centerX, this.scale.height * 0.7, 'Leaderboard');
    
    // Tambahkan tombol ke group
    this.sceneContentGroup.add(btn1);
    this.sceneContentGroup.add(btn2);
    
    // Simpan tombol dalam array
    const buttons = [
        { button: btn1, action: () => this.scene.start('MainMenuScene') },
        { button: btn2, action: () => this.scene.start('LeaderboardScene') }
    ];

    // 4. Daftarkan LISTENER PADA SCENE
    this.input.on(Phaser.Input.Events.POINTER_DOWN, (pointer: Phaser.Input.Pointer) => {
        buttons.forEach(btn => {
            // Helper ini menggunakan Text, jadi pakai getBounds()
            if (this.isPointerOver(pointer, btn.button)) {
                 btn.button.setBackgroundColor('#004499'); // Warna klik
                 this.time.delayedCall(100, btn.action);
            }
        });
    });

    this.input.on(Phaser.Input.Events.POINTER_MOVE, (pointer: Phaser.Input.Pointer) => {
        let onButton = false;
        buttons.forEach(btn => {
            if (this.isPointerOver(pointer, btn.button)) {
                onButton = true;
                if (!btn.button.getData('isHovered')) {
                    btn.button.setBackgroundColor('#0056b3'); // Warna hover
                    btn.button.setData('isHovered', true);
                }
            } else {
                 if (btn.button.getData('isHovered')) {
                     btn.button.setBackgroundColor('#007bff'); // Warna normal
                     btn.button.setData('isHovered', false);
                 }
            }
        });
        // Cek juga tombol musik/kembali
        let onUtilButton = false;
        if (this.musicButton && this.isPointerOver(pointer, this.musicButton)) onUtilButton = true;
        if (this.backButton && this.isPointerOver(pointer, this.backButton)) onUtilButton = true;
        this.input.setDefaultCursor(onButton || onUtilButton ? 'pointer' : 'default');
    });

    this.input.on(Phaser.Input.Events.GAME_OUT, () => {
         buttons.forEach(btn => {
             btn.button.setBackgroundColor('#007bff');
             btn.button.setData('isHovered', false);
         });
         this.input.setDefaultCursor('default');
    });
  }
  
   // Helper cek pointer
   public isPointerOver(pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject): boolean {
        if (!(gameObject instanceof Phaser.GameObjects.Container || gameObject instanceof Phaser.GameObjects.Text)) {
             return false;
        }
        const bounds = gameObject.getBounds();
        return bounds.contains(pointer.x, pointer.y);
    }

   // Helper ini MENGEMBALIKAN Text, TANPA listener klik
   createStyledButton(x: number, y: number, text: string): Phaser.GameObjects.Text {
     const buttonText = this.add.text(x, y, text, {
         fontSize: '32px', color: '#ffffff', backgroundColor: '#007bff',
         padding: { x: 20, y: 10 }, align: 'center'
       }).setOrigin(0.5);

     buttonText.setData('isHovered', false); // State awal hover
     buttonText.setName(text); // Nama debug
     // **TIDAK ADA .setInteractive() atau .on() di sini**

     return buttonText;
   }
}
