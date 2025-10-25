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
    // 1. Panggil super.draw() PERTAMA
    super.draw();
    if (!this.sceneContentGroup) return;

    // 2. HAPUS LISTENER LAMA DARI SCENE
    this.input.off(Phaser.Input.Events.POINTER_DOWN);
    this.input.off(Phaser.Input.Events.POINTER_MOVE);
    this.input.off(Phaser.Input.Events.GAME_OUT);
    this.input.setDefaultCursor('default');

    // 3. Buat elemen dan tambahkan ke group
    const title = this.add.text(this.centerX, this.scale.height * 0.2, 'Pilih Mode', {
        fontSize: '48px', color: '#000000', stroke: '#ffffff', strokeThickness: 4
      }).setOrigin(0.5);
    this.sceneContentGroup.add(title);

    // Buat tombol
    const belajarButton = this.createButton(this.scale.height * 0.45, 'Belajar');
    const surviveButton = this.createButton(this.scale.height * 0.6, 'Survive');

    // Tambahkan tombol ke group
    this.sceneContentGroup.add(belajarButton);
    this.sceneContentGroup.add(surviveButton);
    
    // Simpan tombol dalam array
    const buttons = [
        { container: belajarButton, action: () => this.scene.start('PilihKesulitanScene', { mode: 'belajar' }) },
        { container: surviveButton, action: () => this.scene.start('PilihKesulitanScene', { mode: 'survive' }) }
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

  // Helper cek pointer (sama seperti MainMenuScene)
  // Helper baru untuk cek pointer (LEBIH ANDAL)
private isPointerOver(pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject): boolean {
    // Hanya periksa Container atau Text (untuk tombol Result)
    if (!(gameObject instanceof Phaser.GameObjects.Container || gameObject instanceof Phaser.GameObjects.Text )) {
        return false;
    }

    // Dapatkan posisi X, Y, Lebar, Tinggi gameObject di dunia
    // Untuk Container, width/height berasal dari setSize()
    // Untuk Text, kita perlu getBounds() untuk ukuran sebenarnya
    let worldX: number;
    let worldY: number;
    let width: number;
    let height: number;

    if (gameObject instanceof Phaser.GameObjects.Container) {
        worldX = gameObject.x; // Posisi container di scene
        worldY = gameObject.y; // Posisi container di scene
        width = gameObject.width; // Ukuran dari setSize()
        height = gameObject.height; // Ukuran dari setSize()
    } else { // Berarti Text
        const bounds = gameObject.getBounds();
        if (!bounds) return false;
        worldX = bounds.x; // Posisi batas text di scene
        worldY = bounds.y; // Posisi batas text di scene
        width = bounds.width;
        height = bounds.height;
    }

    // Buat rectangle manual berdasarkan posisi dan ukuran di dunia
    const hitAreaRect = new Phaser.Geom.Rectangle(worldX, worldY, width, height);

    /* --- DEBUGGING (bisa dihapus nanti) ---
    const debugName = (gameObject instanceof Phaser.GameObjects.Container) ? gameObject.name : 'TextButton';
    console.log(`Pointer: (${pointer.x.toFixed(1)}, ${pointer.y.toFixed(1)}) | ${debugName} HitArea: x:${hitAreaRect.x.toFixed(1)}, y:${hitAreaRect.y.toFixed(1)}, w:${hitAreaRect.width.toFixed(1)}, h:${hitAreaRect.height.toFixed(1)} | Contains: ${hitAreaRect.contains(pointer.x, pointer.y)}`);
    // --- Akhir Debugging --- */

    // Cek apakah pointer ada di dalam rectangle manual ini
    return hitAreaRect.contains(pointer.x, pointer.y);
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
