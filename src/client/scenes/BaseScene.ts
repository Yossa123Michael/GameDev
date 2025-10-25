// File: src/client/scenes/BaseScene.ts
import Phaser from 'phaser';

export class BaseScene extends Phaser.Scene {
  protected centerX!: number;
  protected centerY!: number;
  // Ganti tipe dari Text ke Image
  protected musicButton!: Phaser.GameObjects.Image;
  protected backButton!: Phaser.GameObjects.Image;
  protected sceneContentGroup!: Phaser.GameObjects.Group;

  // Status musik (true = on, false = off)
  protected isMusicOn: boolean = true; // Asumsi awal musik nyala

  preload() {
    this.load.image('background', 'assets/Background.png'); // Pastikan nama file background benar
    this.load.image('logo', 'assets/Asset 2.png'); // Pastikan nama file logo benar

    // --- Muat Aset Tombol Baru ---
    this.load.image('music_on', 'assets/music_on.png');   // Ganti nama file jika perlu
    this.load.image('music_off', 'assets/music_off.png'); // Ganti nama file jika perlu
    this.load.image('back_arrow', 'assets/back_arrow.png'); // Ganti nama file jika perlu
    // --- Akhir Muat Aset ---
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

  // Parameter gameSize sudah benar
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
     // Posisi lebih ke pojok (misal 30px dari tepi)
     const iconMargin = 30;
     const iconScale = 0.1; // Skala ikon (sesuaikan agar pas)

     // Tombol Musik
     const musicButtonX = this.scale.width - iconMargin;
     const musicButtonY = iconMargin;
     // Tentukan ikon awal berdasarkan state
     const initialMusicTexture = this.isMusicOn ? 'music_on' : 'music_off';

     this.musicButton = this.add.image(musicButtonX, musicButtonY, initialMusicTexture)
       .setOrigin(1, 0) // Origin kanan-atas
       .setScale(iconScale) // Terapkan skala
       .setInteractive({ useHandCursor: true });

     this.musicButton.on(Phaser.Input.Events.POINTER_DOWN, () => {
       this.isMusicOn = !this.isMusicOn; // Toggle state
       // Ganti tekstur gambar
       this.musicButton.setTexture(this.isMusicOn ? 'music_on' : 'music_off');
       console.log('Music Toggled:', this.isMusicOn);
       // TODO: Implementasikan logika Mute/Unmute Audio Sebenarnya
     });

     // Tombol Kembali (jika bukan Main Menu)
     if (this.scene.key !== 'MainMenuScene') {
        const backButtonX = iconMargin;
        const backButtonY = iconMargin; // Y sama dengan tombol musik
        let finalTarget = backTargetScene; // Ambil default

         this.backButton = this.add.image(backButtonX, backButtonY, 'back_arrow')
            .setOrigin(0, 0) // Origin kiri-atas
            .setScale(iconScale) // Skala sama
            .setInteractive({ useHandCursor: true });

         this.backButton.on(Phaser.Input.Events.POINTER_DOWN, () => {
            // Logika target scene (sudah benar dari sebelumnya)
            if (this.scene.key === 'PilihModeScene') finalTarget = 'MainMenuScene';
            else if (this.scene.key === 'PilihKesulitanScene') finalTarget = 'PilihModeScene';
            else if (this.scene.key === 'GameScene') finalTarget = 'PilihKesulitanScene';
            else if (this.scene.key === 'ResultsScene') finalTarget = 'MainMenuScene';

            console.log(`Back button clicked, going to: ${finalTarget}`); // Debug
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
        const iconMargin = 30; // Gunakan margin yang sama
        const musicButtonX = this.scale.width - iconMargin;
        const musicButtonY = iconMargin;
        const backButtonX = iconMargin;
        const backButtonY = iconMargin;

        if (this.musicButton) {
            this.musicButton.setPosition(musicButtonX, musicButtonY);
            // Anda bisa juga menyesuaikan skala lagi jika perlu saat resize
            // this.musicButton.setScale(...);
        }
        if (this.backButton) {
            this.backButton.setPosition(backButtonX, backButtonY);
            // this.backButton.setScale(...);
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
