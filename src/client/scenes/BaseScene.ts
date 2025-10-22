// File: src/client/scenes/BaseScene.ts
import Phaser from 'phaser';

export class BaseScene extends Phaser.Scene {
  protected centerX!: number;
  protected centerY!: number;
  protected musicButton!: Phaser.GameObjects.Text;
  protected backButton!: Phaser.GameObjects.Text;
  protected sceneContentGroup!: Phaser.GameObjects.Group; // Grup untuk konten scene anak

  preload() {
    this.load.image('background', 'assets/bg.png');
  }

  create() {
    this.updateCenter();

    // Set viewport kamera
    this.cameras.main.setViewport(0, 0, this.scale.width, this.scale.height);

    // Background
    const bg = this.add.image(this.centerX, this.centerY, 'background');
    bg.setName('background_base');
    bg.setDisplaySize(this.scale.width, this.scale.height);
    bg.setDepth(-1);

    // Buat grup untuk konten scene anak
    this.sceneContentGroup = this.add.group();
    this.sceneContentGroup.setName('sceneContentGroup_base');

    // Listener resize
    this.scale.on('resize', this.handleResize, this);

    // Listener Context Restored (untuk layar hitam)
    this.sys.game.renderer.on(Phaser.Renderer.Events.CONTEXT_RESTORED, () => {
        console.log(`WebGL Context Restored for scene: ${this.scene.key}`);
        this.handleResize(this.scale); // Panggil handleResize
    });

    // Buat tombol umum (yang tidak dihancurkan)
    this.createCommonButtons();
    if (this.musicButton) this.musicButton.setName('musicButton_base');
    if (this.backButton) this.backButton.setName('backButton_base');

    // Panggil draw pertama kali (setelah delay)
    this.time.delayedCall(15, () => {
       if (this.scene.isActive(this.scene.key) && typeof (this as any).draw === 'function') {
         (this as any).draw();
       }
    }, [], this);
  }

  private handleResize(gameSize: Phaser.Structs.Size) {
    console.log(`Handling resize for scene: ${this.scene.key} - ${gameSize.width}x${gameSize.height}`);
    this.updateCenter();

    // Atur kamera
    this.cameras.main.setViewport(0, 0, gameSize.width, gameSize.height);
    this.cameras.main.setBounds(0, 0, gameSize.width, gameSize.height);

    // Reposisi elemen base
    const bg = this.children.getByName('background_base');
    if (bg instanceof Phaser.GameObjects.Image) {
      bg.setPosition(this.centerX, this.centerY);
      bg.setDisplaySize(gameSize.width, gameSize.height);
    }
    this.repositionCommonButtons();

    // Panggil fungsi draw() anak
    if (typeof (this as any).draw === 'function') {
      (this as any).draw();
    }
  }

  // updateCenter, createCommonButtons, repositionCommonButtons tetap sama
  private updateCenter() {
    this.centerX = this.scale.width / 2;
    this.centerY = this.scale.height / 2;
  }

   protected createCommonButtons(backTargetScene: string = 'MainMenuScene') {
     this.musicButton = this.add.text(this.scale.width * 0.9, this.scale.height * 0.1, 'Musik: On', {
       fontSize: '24px',
       color: '#000000',
       backgroundColor: '#ffffff',
       padding: { x: 10, y: 5 }
     }).setOrigin(1, 0.5).setInteractive({ useHandCursor: true });

     this.musicButton.on('pointerdown', () => {
       const currentText = this.musicButton.text;
       this.musicButton.setText(currentText === 'Musik: On' ? 'Musik: Off' : 'Musik: On');
     });

     if (this.scene.key !== 'MainMenuScene') {
        let targetScene = backTargetScene;
        if (this.scene.key === 'PilihModeScene') targetScene = 'MainMenuScene';
        else if (this.scene.key === 'PilihKesulitanScene') targetScene = 'PilihModeScene';
        else if (this.scene.key === 'GameScene') targetScene = 'PilihKesulitanScene';
        else if (this.scene.key === 'ResultsScene') targetScene = 'MainMenuScene';

         this.backButton = this.add.text(this.scale.width * 0.1, this.scale.height * 0.1, '< Kembali', {
           fontSize: '24px',
           color: '#000000',
           backgroundColor: '#ffffff',
           padding: { x: 10, y: 5 }
         }).setOrigin(0, 0.5).setInteractive({ useHandCursor: true });

         this.backButton.on('pointerdown', () => {
            if (targetScene === 'PilihKesulitanScene' && (this as any).mode) {
                 this.scene.start(targetScene, { mode: (this as any).mode });
            } else {
                 this.scene.start(targetScene);
            }
         });
     }
   }

    protected repositionCommonButtons() {
        if (this.musicButton) {
            this.musicButton.setPosition(this.scale.width * 0.9, this.scale.height * 0.1);
        }
        if (this.backButton) {
            this.backButton.setPosition(this.scale.width * 0.1, this.scale.height * 0.1);
        }
    }

  // Kembalikan clear() ke BaseScene.draw()
  public draw() {
    // Bersihkan HANYA group, bukan tombol musik/kembali
    if (this.sceneContentGroup) {
       this.sceneContentGroup.clear(true, true);
    } else {
       console.warn(`sceneContentGroup belum diinisialisasi di scene ${this.scene.key} saat draw() base dipanggil.`);
       this.sceneContentGroup = this.add.group();
       this.sceneContentGroup.setName('sceneContentGroup_base_fallback');
    }
  }
}
