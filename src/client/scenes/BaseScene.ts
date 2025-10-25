// File: src/client/scenes/BaseScene.ts
import Phaser from 'phaser';

export class BaseScene extends Phaser.Scene {
  protected centerX!: number;
  protected centerY!: number;
  // --- GANTI TIPE DARI TEXT KE IMAGE ---
  protected musicButton!: Phaser.GameObjects.Image;
  protected backButton!: Phaser.GameObjects.Image;
  protected sceneContentGroup!: Phaser.GameObjects.Group;

  // Status musik (true = on, false = off)
  protected static isMusicOn: boolean = true; // Gunakan static agar state tersimpan antar scene

  preload() {
    this.load.image('music_on', 'assets/Asset 5.png');   // PASTIKAN NAMA FILE SAMA
    this.load.image('music_off', 'assets/Asset 4.png'); // PASTIKAN NAMA FILE SAMA
    this.load.image('back_arrow', 'assets/Asset 3.png'); // PASTIKAN NAMA FILE SAMA
    this.load.image('background', 'assets/Background.png'); // GANTI NAMA FILE JIKA PERLU
    this.load.image('logo', 'assets/Asset 7.png'); // GANTI NAMA FILE JIKA PERLU
  }

  create() {
    this.updateCenter();
    this.cameras.main.setViewport(0, 0, this.scale.width, this.scale.height);

    this.add.image(this.centerX, this.centerY, 'background')
        .setName('background_base').setDisplaySize(this.scale.width, this.scale.height).setDepth(-1);

    this.sceneContentGroup = this.add.group().setName('sceneContentGroup_base');

    this.scale.on('resize', this.handleResize, this);

    this.renderer.on('contextrestored', () => {
        console.log(`WebGL Context Restored for scene: ${this.scene.key}`);
        this.handleResize(this.scale.gameSize);
    });

    // Buat tombol umum (sekarang gambar)
    this.createCommonButtons();
    if (this.musicButton) this.musicButton.setName('musicButton_base');
    if (this.backButton) this.backButton.setName('backButton_base');

    this.time.delayedCall(15, () => {
       if (this.scene.isActive(this.scene.key) && typeof (this as any).draw === 'function') {
         (this as any).draw();
       }
    }, [], this);
  }

  private handleResize(gameSize: Phaser.Structs.Size) {
    this.updateCenter();

    this.cameras.main.setViewport(0, 0, gameSize.width, gameSize.height);
    this.cameras.main.setBounds(0, 0, gameSize.width, gameSize.height);

    const bg = this.children.getByName('background_base');
    if (bg instanceof Phaser.GameObjects.Image) {
      bg.setPosition(this.centerX, this.centerY);
      bg.setDisplaySize(gameSize.width, gameSize.height);
    }
    this.repositionCommonButtons(); // Panggil reposisi

    if (typeof (this as any).draw === 'function') {
      (this as any).draw();
    }
  }

  private updateCenter() {
    this.centerX = this.scale.width / 2;
    this.centerY = this.scale.height / 2;
  }

   // --- REVISI: Membuat Tombol Gambar ---
   protected createCommonButtons(backTargetScene: string = 'MainMenuScene') {
     // Posisi lebih ke pojok (misal 5% dari tepi)
     const iconMarginHorizontal = this.scale.width * 0.05;
     const iconMarginVertical = this.scale.height * 0.05;
     const iconScale = 0.5; // Skala ikon (sesuaikan agar pas)

     // Tombol Musik
     const musicButtonX = this.scale.width - iconMarginHorizontal;
     const musicButtonY = iconMarginVertical;
     // Tentukan ikon awal berdasarkan state
     const initialMusicTexture = BaseScene.isMusicOn ? 'music_on' : 'music_off';

     this.musicButton = this.add.image(musicButtonX, musicButtonY, initialMusicTexture)
       .setOrigin(1, 0) // Origin kanan-atas
       .setScale(iconScale) // Terapkan skala
       .setInteractive({ useHandCursor: true });

     this.musicButton.on(Phaser.Input.Events.POINTER_DOWN, () => {
       BaseScene.isMusicOn = !BaseScene.isMusicOn; // Toggle state static
       // Ganti tekstur gambar
       this.musicButton.setTexture(BaseScene.isMusicOn ? 'music_on' : 'music_off');
       console.log('Music Toggled:', BaseScene.isMusicOn);
       // TODO: Implementasikan logika Mute/Unmute Audio Sebenarnya
     });

     // Tombol Kembali (jika bukan Main Menu)
     if (this.scene.key !== 'MainMenuScene') {
        const backButtonX = iconMarginHorizontal;
        const backButtonY = iconMarginVertical; // Y sama dengan tombol musik
        let finalTarget = backTargetScene; // Ambil default

         this.backButton = this.add.image(backButtonX, backButtonY, 'back_arrow')
            .setOrigin(0, 0) // Origin kiri-atas
            .setScale(iconScale) // Skala sama
            .setInteractive({ useHandCursor: true });

         this.backButton.on(Phaser.Input.Events.POINTER_DOWN, () => {
            // Logika target scene
            if (this.scene.key === 'PilihModeScene') finalTarget = 'MainMenuScene';
            else if (this.scene.key === 'PilihKesulitanScene') finalTarget = 'PilihModeScene';
            else if (this.scene.key === 'GameScene') finalTarget = 'PilihKesulitanScene';
            else if (this.scene.key === 'ResultsScene') finalTarget = 'MainMenuScene';
            // Scene lain akan menggunakan backTargetScene (defaultnya MainMenuScene)

            if (finalTarget === 'PilihKesulitanScene' && (this as any).mode) {
                 this.scene.start(finalTarget, { mode: (this as any).mode });
            } else {
                 this.scene.start(finalTarget);
            }
         });
     }
   }

    // --- REVISI: Reposisi Tombol Gambar ---
    protected repositionCommonButtons() {
        const iconMarginHorizontal = this.scale.width * 0.05;
        const iconMarginVertical = this.scale.height * 0.05;

        if (this.musicButton) {
            this.musicButton.setPosition(this.scale.width - iconMarginHorizontal, iconMarginVertical);
        }
        if (this.backButton) {
            this.backButton.setPosition(iconMarginHorizontal, iconMarginVertical);
        }
    }

  // draw() membersihkan group (tetap sama)
  public draw() {
    if (this.sceneContentGroup) {
       this.sceneContentGroup.clear(true, true);
    } else {
       console.warn(`sceneContentGroup belum diinisialisasi di scene ${this.scene.key}.`);
       this.sceneContentGroup = this.add.group().setName('sceneContentGroup_base_fallback');
    }
  }
}
