// File: src/client/scenes/PilihKesulitanScene.ts
import { BaseScene } from './BaseScene';

// Definisikan tipe DifficultyKey
type DifficultyKey = 'mudah' | 'menengah' | 'sulit' | 'pro';

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
    // draw() dipanggil oleh BaseScene
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
    const title = this.add.text(this.centerX, this.scale.height * 0.2, 'Pilih tingkat Kesulitan', {
        fontFamily: 'Nunito',
        fontSize: '40px', color: '#000000', align: 'center',
        wordWrap: { width: this.scale.width * 0.9 },
        stroke: '#ffffff', strokeThickness: 4
      }).setOrigin(0.5);
    this.sceneContentGroup.add(title);

    // --- PERBAIKAN PERHITUNGAN JARAK TOMBOL (PENDEKATAN SLOT) ---
    const buttonTexts = ['Mudah', 'Menengah', 'Sulit', 'Pro'];
    const buttonCount = buttonTexts.length;

    // Tentukan area vertikal untuk tombol (misal, mulai dari 28% hingga 95% layar)
    const buttonAreaStartY = this.scale.height * 0.28;
    const buttonAreaEndY = this.scale.height * 0.95;
    const buttonAreaHeight = buttonAreaEndY - buttonAreaStartY;

    // Bagi area yang tersedia menjadi slot sebanyak jumlah tombol + 1
    // (Memberi jarak di atas tombol pertama dan di bawah tombol terakhir)
    const totalSlots = buttonCount + 1;
    const slotHeight = buttonAreaHeight / totalSlots;

    // Posisi Y tengah untuk slot pertama
    const firstButtonCenterY = buttonAreaStartY + (slotHeight / 2);
    // --- AKHIR PERBAIKAN PERHITUNGAN ---


    const buttons: { container: Phaser.GameObjects.Container, action: () => void }[] = [];

    // Buat tombol dan tempatkan di tengah slot masing-masing
    buttonTexts.forEach((text, index) => {
        // Posisi Y dihitung berdasarkan indeks
        const buttonCenterY = firstButtonCenterY + (index * slotHeight); // <-- INI LOGIKA JARAK
        const difficultyKey = text.toLowerCase() as DifficultyKey;

        const buttonContainer = this.createButton(buttonCenterY, text);
        this.sceneContentGroup.add(buttonContainer);
        buttons.push({
            container: buttonContainer,
            action: () => this.startGame(difficultyKey)
        });
    });


    // 3. Listener Scene (Kode ini tetap sama)
    this.input.on(Phaser.Input.Events.POINTER_DOWN, (pointer: Phaser.Input.Pointer) => {
        buttons.forEach(btn => {
            if (this.isPointerOver(pointer, btn.container)) {
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
            if (this.isPointerOver(pointer, btn.container)) {
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
        if (this.musicButton && this.isPointerOver(pointer, this.musicButton)) onUtilButton = true;
        if (this.backButton && this.isPointerOver(pointer, this.backButton)) onUtilButton = true;
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

  // Gunakan tipe DifficultyKey di sini
  startGame(difficulty: DifficultyKey) {
    this.scene.start('GameScene', { mode: this.mode, difficulty: difficulty });
  }

  // --- Fungsi createButton (Gaya Rounded & Font Nunito) ---
  createButton(y: number, text: string): Phaser.GameObjects.Container {
    const buttonWidth = this.scale.width * 0.8;
    const buttonHeight = 60; // Pastikan ini konsisten
    const cornerRadius = 20;

    const buttonGraphics = this.add.graphics();
    // Panggil updateButtonGraphics
    this.updateButtonGraphics(buttonGraphics, buttonWidth, buttonHeight, 0xffffff, 0.9, cornerRadius);

    const buttonText = this.add.text(
        buttonWidth / 2, buttonHeight / 2, text,
        {
            fontFamily: 'Nunito',
            fontSize: '24px',
            color: '#000000'
        }
    ).setOrigin(0.5);

    const container = this.add.container(
        this.centerX - buttonWidth / 2,
        y - buttonHeight / 2 // y adalah posisi tengah tombol
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

  // Helper SFX (salin dari BaseScene jika perlu, atau panggil super.playSound)
  protected override playSound(key: string, config?: Phaser.Types.Sound.SoundConfig) {
      // Panggil implementasi dari BaseScene (jika ada logika tambahan di sana)
      super.playSound(key, config);
  } // <-- Akhir playSound()

} // <-- Akhir Class
