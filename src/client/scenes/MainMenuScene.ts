// File: src/client/scenes/MainMenuScene.ts
import { BaseScene } from './BaseScene';

export class MainMenuScene extends BaseScene {
  constructor() {
    super('MainMenuScene');
  }

  public override create() {
    super.create();
    // this.draw() dipanggil oleh BaseScene
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

    // 2. LOGO (Posisi Y sedikit turun, Skala lebih besar)
    const logoY = topSectionHeight * 0.55; // <-- Sedikit ke bawah
    const logo = this.add.image(this.centerX, logoY, 'logo');
    const targetWidth = this.scale.width * 0.8; // <-- Ukuran 80%
    const scale = targetWidth / logo.width;
    logo.setScale(scale);
    this.sceneContentGroup.add(logo);

    // 3. Tombol (Gaya Rounded & Font Nunito)
    const buttonCount = 5;
    const buttonSlotCount = buttonCount + 1; // Ruang atas/bawah
    const buttonAreaHeight = this.scale.height * bottomSectionHeightRatio;
    const buttonSpacing = buttonAreaHeight / buttonSlotCount;
    let currentButtonY = bottomSectionStartY + buttonSpacing; // Slot pertama

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
    const buttons = [
        { container: startButton, action: () => this.scene.start('PilihModeScene') },
        { container: leaderboardButton, action: () => this.scene.start('LeaderboardScene') },
        { container: achievementButton, action: () => this.scene.start('AchievementScene') },
        { container: optionButton, action: () => this.scene.start('OptionScene') },
        { container: creditButton, action: () => this.scene.start('CreditScene') }
    ];

    // 4. Daftarkan Listener Scene
    this.input.on(Phaser.Input.Events.POINTER_DOWN, (pointer: Phaser.Input.Pointer) => {
        buttons.forEach(btn => {
            if (this.isPointerOver(pointer, btn.container)) { // Pakai isPointerOver dari BaseScene
                const graphics = btn.container.getAt(0) as Phaser.GameObjects.Graphics;
                this.updateButtonGraphics(graphics, btn.container.width, btn.container.height, 0xdddddd);
                this.time.delayedCall(100, () => {
                    this.playSound('sfx_click'); // Mainkan SFX
                    btn.action();
                });
            }
        });
    });

    this.input.on(Phaser.Input.Events.POINTER_MOVE, (pointer: Phaser.Input.Pointer) => {
        let onButton = false;
        buttons.forEach(btn => {
            const graphics = btn.container.getAt(0) as Phaser.GameObjects.Graphics;
            if (this.isPointerOver(pointer, btn.container)) { // Pakai isPointerOver dari BaseScene
                onButton = true;
                if (!btn.container.getData('isHovered')) {
                   this.updateButtonGraphics(graphics, btn.container.width, btn.container.height, 0xeeeeee); // Hover
                   btn.container.setData('isHovered', true);
                }
            } else {
                 if (btn.container.getData('isHovered')) {
                    this.updateButtonGraphics(graphics, btn.container.width, btn.container.height, 0xffffff); // Normal
                    btn.container.setData('isHovered', false);
                 }
            }
        });
        // Cek tombol utilitas
        let onUtilButton = false;
        if (this.musicButton && this.isPointerOver(pointer, this.musicButton)) onUtilButton = true; // Pakai isPointerOver dari BaseScene
        // Tidak ada tombol back di MainMenu
        this.input.setDefaultCursor(onButton || onUtilButton ? 'pointer' : 'default');
    });

    this.input.on(Phaser.Input.Events.GAME_OUT, () => {
         buttons.forEach(btn => {
             const graphics = btn.container.getAt(0) as Phaser.GameObjects.Graphics;
             this.updateButtonGraphics(graphics, btn.container.width, btn.container.height, 0xffffff); // Normal
             btn.container.setData('isHovered', false);
         });
         this.input.setDefaultCursor('default');
    });
  } // <-- Akhir draw()


  // --- Fungsi createButton (Gaya Rounded & Font Nunito) ---
  createButton(y: number, text: string): Phaser.GameObjects.Container {
    const buttonWidth = this.scale.width * 0.8;
    const buttonHeight = 60;
    const cornerRadius = 20;

    const buttonGraphics = this.add.graphics();
    this.updateButtonGraphics(buttonGraphics, buttonWidth, buttonHeight, 0xffffff, 0.9, cornerRadius);

    // Gunakan font Nunito
    const buttonText = this.add.text(
        buttonWidth / 2, buttonHeight / 2, text,
        {
            fontFamily: 'Nunito', // <-- FONT
            fontSize: '24px',
            color: '#000000'
        }
    ).setOrigin(0.5);

    const container = this.add.container(
        this.centerX - buttonWidth / 2,
        y - buttonHeight / 2 // y adalah posisi tengah
    );
    container.setSize(buttonWidth, buttonHeight);
    container.add([buttonGraphics, buttonText]);
    container.setName(text);
    container.setData('isHovered', false);

    return container;
  } // <-- Akhir createButton()


  // --- Helper gambar tombol ---
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
  } // <-- Akhir updateButtonGraphics()

} // <-- Akhir Class
