// File: src/client/scenes/PilihKesulitanScene.ts
import { BaseScene } from './BaseScene';

export class PilihKesulitanScene extends BaseScene {
  private mode!: string;

  constructor() {
    super('PilihKesulitanScene');
  }

  init(data: { mode: string }) {
    this.mode = data.mode;
  }

  public override create() {
    super.create();
    super.createCommonButtons('PilihModeScene'); // Atur tombol kembali
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
    const title = this.add.text(this.centerX, this.scale.height * 0.2, 'Pilih tingkat Kesulitan', {
        fontSize: '40px', color: '#000000', align: 'center',
        wordWrap: { width: this.scale.width * 0.9 },
        stroke: '#ffffff', strokeThickness: 4
      }).setOrigin(0.5);
    this.sceneContentGroup.add(title);

    // Buat tombol
    const btn1 = this.createButton(this.scale.height * 0.4, 'Mudah');
    const btn2 = this.createButton(this.scale.height * 0.5, 'Menengah');
    const btn3 = this.createButton(this.scale.height * 0.6, 'Sulit');
    const btn4 = this.createButton(this.scale.height * 0.7, 'Pro');

    // Tambahkan tombol ke group
    this.sceneContentGroup.add(btn1);
    this.sceneContentGroup.add(btn2);
    this.sceneContentGroup.add(btn3);
    this.sceneContentGroup.add(btn4);
    
    // Simpan tombol dalam array
    const buttons = [
        { container: btn1, action: () => this.startGame('mudah') },
        { container: btn2, action: () => this.startGame('menengah') },
        { container: btn3, action: () => this.startGame('sulit') },
        { container: btn4, action: () => this.startGame('pro') }
    ];

    // 4. Daftarkan LISTENER PADA SCENE
    this.input.on(Phaser.Input.Events.POINTER_DOWN, (pointer: Phaser.Input.Pointer) => {
        buttons.forEach(btn => {
            if (this.isPointerOver(pointer, btn.container)) {
                const rect = btn.container.getAt(0) as Phaser.GameObjects.Rectangle;
                rect.setFillStyle(0xdddddd, 0.9);
                this.time.delayedCall(100, btn.action);
            }
        });
    });

    this.input.on(Phaser.Input.Events.POINTER_MOVE, (pointer: Phaser.Input.Pointer) => {
        let onButton = false;
        buttons.forEach(btn => {
            const rect = btn.container.getAt(0) as Phaser.GameObjects.Rectangle;
            if (this.isPointerOver(pointer, btn.container)) {
                onButton = true;
                if (!btn.container.getData('isHovered')) {
                   rect.setFillStyle(0xeeeeee, 0.9);
                   btn.container.setData('isHovered', true);
                }
            } else {
                 if (btn.container.getData('isHovered')) {
                    rect.setFillStyle(0xffffff, 0.9);
                    btn.container.setData('isHovered', false);
                 }
            }
        });
        this.input.setDefaultCursor(onButton ? 'pointer' : 'default');
    });

    this.input.on(Phaser.Input.Events.GAME_OUT, () => {
         buttons.forEach(btn => {
             const rect = btn.container.getAt(0) as Phaser.GameObjects.Rectangle;
             rect.setFillStyle(0xffffff, 0.9);
             btn.container.setData('isHovered', false);
         });
         this.input.setDefaultCursor('default');
    });
  }

  startGame(difficulty: 'mudah' | 'menengah' | 'sulit' | 'pro') {
    this.scene.start('GameScene', { mode: this.mode, difficulty: difficulty });
  }

  // Helper cek pointer (sama seperti MainMenuScene)
  private isPointerOver(pointer: Phaser.Input.Pointer, container: Phaser.GameObjects.Container): boolean {
      const bounds = container.getBounds();
      return bounds.contains(pointer.x, pointer.y);
  }

  // --- SALIN FUNGSI createButton DARI MainMenuScene.ts KE SINI ---
  // (Tanpa parameter onClick)
  createButton(y: number, text: string): Phaser.GameObjects.Container {
    const buttonWidth = this.scale.width * 0.8;
    const buttonHeight = 60;

    const buttonRect = this.add.rectangle(
        0, 0, buttonWidth, buttonHeight, 0xffffff, 0.9
    )
    .setStrokeStyle(2, 0x000000)
    .setOrigin(0, 0);

    const buttonText = this.add.text(
        buttonWidth / 2, buttonHeight / 2, text,
        { fontSize: '24px', color: '#000000' }
    ).setOrigin(0.5);

    const container = this.add.container(
        this.centerX - buttonWidth / 2,
        y - buttonHeight / 2
    );
    container.setSize(buttonWidth, buttonHeight);
    container.add([buttonRect, buttonText]);
    container.setName(text);
    container.setData('isHovered', false);

    return container;
  }
}
