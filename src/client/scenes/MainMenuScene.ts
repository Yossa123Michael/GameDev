// File: src/client/scenes/MainMenuScene.ts
import { BaseScene } from './BaseScene';

export class MainMenuScene extends BaseScene {
  constructor() {
    super('MainMenuScene');
  }

  public override create() {
    super.create();
    // this.draw() dipanggil oleh BaseScene setelah delay
  }

  public override draw() {
    // 1. Bersihkan group & listener lama
    super.draw();
    if (!this.sceneContentGroup) return;
    this.input.off(Phaser.Input.Events.POINTER_DOWN);
    this.input.off(Phaser.Input.Events.POINTER_MOVE);
    this.input.off(Phaser.Input.Events.GAME_OUT);
    this.input.setDefaultCursor('default');

    // --- Konstanta Layout ---
    const topSectionHeightRatio = 0.3125;
    const bottomSectionHeightRatio = 1 - topSectionHeightRatio;
    const topSectionHeight = this.scale.height * topSectionHeightRatio;
    const bottomSectionStartY = topSectionHeight;

    // 2. Buat LOGO di bagian atas
    const logoY = topSectionHeight * 0.5;
    const logo = this.add.image(this.centerX, logoY, 'logo');
    const targetWidth = this.scale.width * 0.7;
    const scale = targetWidth / logo.width;
    logo.setScale(scale);
    this.sceneContentGroup.add(logo);

    // 3. Buat Tombol di bagian bawah
    const buttonCount = 5;
    const buttonSlotCount = buttonCount + 1;
    const buttonAreaHeight = this.scale.height * bottomSectionHeightRatio;
    const buttonSpacing = buttonAreaHeight / buttonSlotCount;
    let currentButtonY = bottomSectionStartY + buttonSpacing;

    const startButton = this.createButton(currentButtonY, 'Start Test');
    currentButtonY += buttonSpacing;
    const leaderboardButton = this.createButton(currentButtonY, 'Leaderboard');
    currentButtonY += buttonSpacing;
    const achievementButton = this.createButton(currentButtonY, 'Achievment');
    currentButtonY += buttonSpacing;
    const optionButton = this.createButton(currentButtonY, 'Option');
    currentButtonY += buttonSpacing;
    const creditButton = this.createButton(currentButtonY, 'Credit');

    // Tambahkan tombol ke group
    this.sceneContentGroup.add(startButton);
    this.sceneContentGroup.add(leaderboardButton);
    this.sceneContentGroup.add(achievementButton);
    this.sceneContentGroup.add(optionButton);
    this.sceneContentGroup.add(creditButton);

    // Simpan tombol untuk listener
    // PERBAIKAN: Pastikan variabel 'buttons' digunakan
    const buttons = [
        { container: startButton, action: () => this.scene.start('PilihModeScene') },
        { container: leaderboardButton, action: () => this.scene.start('LeaderboardScene') },
        { container: achievementButton, action: () => this.scene.start('AchievementScene') },
        { container: optionButton, action: () => this.scene.start('OptionScene') },
        { container: creditButton, action: () => this.scene.start('CreditScene') }
    ];

    // 4. Daftarkan Listener Scene

    // Event POINTER_DOWN
    // PERBAIKAN: Tambahkan '_' jika pointer tidak dipakai atau gunakan 'pointer'
    this.input.on(Phaser.Input.Events.POINTER_DOWN, (pointer: Phaser.Input.Pointer) => {
        buttons.forEach(btn => {
            // Panggil isPointerOver
            if (this.isPointerOver(pointer, btn.container)) {
                console.log(`Button "${btn.container.name}" DOWN`);
                const graphics = btn.container.getAt(0) as Phaser.GameObjects.Graphics;
                // Panggil updateButtonGraphics
                // PERBAIKAN TYPO: this.updateButtonGraphics
                this.updateButtonGraphics(graphics, btn.container.width, btn.container.height, 0xdddddd);
                this.time.delayedCall(100, btn.action);
            }
        });
    });

    // Event POINTER_MOVE (untuk hover)
    // PERBAIKAN: Tambahkan '_' jika pointer tidak dipakai atau gunakan 'pointer'
    this.input.on(Phaser.Input.Events.POINTER_MOVE, (pointer: Phaser.Input.Pointer) => {
        let onButton = false;
        buttons.forEach(btn => {
            const graphics = btn.container.getAt(0) as Phaser.GameObjects.Graphics;
            // Panggil isPointerOver
            if (this.isPointerOver(pointer, btn.container)) {
                onButton = true;
                if (!btn.container.getData('isHovered')) {
                   // Panggil updateButtonGraphics
                   // PERBAIKAN TYPO: this.updateButtonGraphics
                   this.updateButtonGraphics(graphics, btn.container.width, btn.container.height, 0xeeeeee); // Hover
                   btn.container.setData('isHovered', true);
                }
            } else {
                 if (btn.container.getData('isHovered')) {
                    // Panggil updateButtonGraphics
                    // PERBAIKAN TYPO: this.updateButtonGraphics
                    this.updateButtonGraphics(graphics, btn.container.width, btn.container.height, 0xffffff); // Normal
                    btn.container.setData('isHovered', false);
                 }
            }
        });
        // Cek juga tombol utilitas
        let onUtilButton = false;
        // PERBAIKAN: Panggil isPointerOver
        if (this.musicButton && this.isPointerOver(pointer, this.musicButton)) onUtilButton = true;
        // Tombol kembali tidak ada di MainMenuScene
        this.input.setDefaultCursor(onButton || onUtilButton ? 'pointer' : 'default');
    });

    // Event GAME_OUT
    this.input.on(Phaser.Input.Events.GAME_OUT, () => {
         buttons.forEach(btn => {
             const graphics = btn.container.getAt(0) as Phaser.GameObjects.Graphics;
             // Panggil updateButtonGraphics
             // PERBAIKAN TYPO: this.updateButtonGraphics
             this.updateButtonGraphics(graphics, btn.container.width, btn.container.height, 0xffffff); // Normal
             btn.container.setData('isHovered', false);
         });
         this.input.setDefaultCursor('default');
    });
  } // <-- Akhir dari draw()

  // Helper cek pointer (sekarang digunakan)
  // PERBAIKAN: Parameter gameObject digunakan
  private isPointerOver(pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject): boolean {
      if (!(gameObject instanceof Phaser.GameObjects.Container || gameObject instanceof Phaser.GameObjects.Text || gameObject instanceof Phaser.GameObjects.Image)) {
          return false;
      }
      const bounds = gameObject.getBounds();
      if (!bounds) return false;
      return bounds.contains(pointer.x, pointer.y);
      // PERBAIKAN: Pastikan ada return value
  } // <-- Akhir dari isPointerOver()


  // --- FUNGSI createButton (MENGGUNAKAN GRAPHICS) ---
  // (Parameter y dan text digunakan)
  // PERBAIKAN: Parameter y dan text digunakan
  createButton(y: number, text: string): Phaser.GameObjects.Container {
    const buttonWidth = this.scale.width * 0.8;
    const buttonHeight = 60;
    const cornerRadius = 20;

    // PERBAIKAN: Definisikan buttonGraphics di sini
    const buttonGraphics = this.add.graphics();
    // Panggil updateButtonGraphics
    this.updateButtonGraphics(buttonGraphics, buttonWidth, buttonHeight, 0xffffff, 0.9, cornerRadius);

    const buttonText = this.add.text(
        buttonWidth / 2, buttonHeight / 2, text,
        { fontSize: '24px', color: '#000000' }
    ).setOrigin(0.5);

    const container = this.add.container(
        this.centerX - buttonWidth / 2,
        y - buttonHeight / 2 // Gunakan parameter y
    );
    container.setSize(buttonWidth, buttonHeight);
    container.add([buttonGraphics, buttonText]);
    container.setName(text); // Gunakan parameter text
    container.setData('isHovered', false);

    // **TIDAK ADA .setInteractive() di sini**

    return container; // <-- Pastikan ada return
  } // <-- Akhir dari createButton()


  // --- Helper baru untuk menggambar ulang graphics tombol ---
  // (Sekarang digunakan)
  // PERBAIKAN: Hapus deklarasi tipe dari dalam body
  private updateButtonGraphics(
      graphics: Phaser.GameObjects.Graphics,
      width: number,
      height: number,
      fillColor: number,
      alpha: number = 0.9,
      cornerRadius: number = 20
  ) {
      graphics.clear();
      graphics.fillStyle(fillColor, alpha);
      graphics.lineStyle(2, 0x000000, 1);
      graphics.fillRoundedRect(0, 0, width, height, cornerRadius);
      graphics.strokeRoundedRect(0, 0, width, height, cornerRadius);
  } // <-- Akhir dari updateButtonGraphics()

} // <-- Akhir dari class MainMenuScene
