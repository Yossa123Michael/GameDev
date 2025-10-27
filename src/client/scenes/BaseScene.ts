// File: src/client/scenes/BaseScene.ts
import Phaser from 'phaser';

export class BaseScene extends Phaser.Scene {
  protected centerX!: number;
  protected centerY!: number;
  protected musicButton!: Phaser.GameObjects.Image; // Gambar
  protected backButton!: Phaser.GameObjects.Image; // Gambar
  protected sceneContentGroup!: Phaser.GameObjects.Group;
  protected static backgroundMusic: Phaser.Sound.BaseSound | null = null;
  protected static isMusicOn: boolean = true;

  preload() {
    this.load.image('background', 'assets/Asset 8.png'); // Sesuai file Anda
    this.load.image('logo', 'assets/Asset 7.png'); // Sesuai file Anda
    this.load.image('music_on', 'assets/Asset 5.png');   // Sesuai file Anda
    this.load.image('music_off', 'assets/Asset 4.png'); // Sesuai file Anda
    this.load.image('back_arrow', 'assets/Asset 3.png'); // Sesuai file Anda
    this.load.audio('bgm', 'assets/backsound.wav'); // Route 66 Blues - Loop
    this.load.audio('sfx_click', 'assets/click.mp3');       // https://pixabay.com/sound-effects/computer-mouse-click-352734/
    this.load.audio('sfx_correct', 'assets/sounds/correct.wav');     // Ganti nama file jika perlu
    this.load.audio('sfx_incorrect', 'assets/sounds/incorrect.wav');
  }

  create() {
    this.updateCenter();
    this.cameras.main.setViewport(0, 0, this.scale.width, this.scale.height);

    this.add.image(this.centerX, this.centerY, 'background')
        .setName('background_base').setDisplaySize(this.scale.width, this.scale.height).setDepth(-2);

    this.sceneContentGroup = this.add.group().setName('sceneContentGroup_base');

    this.scale.on('resize', this.handleResize, this);

    // Listener Context Restored (menggunakan string event)
    this.renderer.on('contextrestored', () => {
        console.log(`WebGL Context Restored for scene: ${this.scene.key}`);
        this.handleResize(this.scale.gameSize); // Berikan argumen yang benar
    });

    // --- Putar Musik Latar (jika belum diputar dan status ON) ---
    if (!BaseScene.backgroundMusic && BaseScene.isMusicOn) {
        BaseScene.backgroundMusic = this.sound.add('bgm', { loop: true, volume: 0.5 }); // Volume 50%
        BaseScene.backgroundMusic.play();
        console.log("Playing background music");
    } else if (BaseScene.backgroundMusic && !BaseScene.isMusicOn) {
        // Jika scene reload dan musik seharusnya OFF, pastikan berhenti
        BaseScene.backgroundMusic.pause();
    } else if (BaseScene.backgroundMusic && BaseScene.isMusicOn && !BaseScene.backgroundMusic.isPlaying) {
         // Jika scene reload dan musik seharusnya ON tapi berhenti
         BaseScene.backgroundMusic.resume();
    }
    // --- Akhir Putar Musik Latar ---

    // Buat tombol umum (sekarang gambar)
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
     // Posisi ikon (sesuaikan margin dan skala)
     const iconMarginHorizontal = this.scale.width * 0.05; // 5% dari tepi horizontal
     const iconMarginVertical = this.scale.height * 0.05; // 5% dari tepi vertikal
     const iconScale = 0.5; // Skala ikon (coba naikkan jika terlalu kecil)

     // Tombol Musik
     const musicButtonX = this.scale.width - iconMarginHorizontal;
     const musicButtonY = iconMarginVertical;
     const initialMusicTexture = BaseScene.isMusicOn ? 'music_on' : 'music_off';

     this.musicButton = this.add.image(musicButtonX, musicButtonY, initialMusicTexture)
       .setOrigin(1, 0) // Kanan-atas
       .setScale(iconScale)
       .setInteractive({ useHandCursor: true });

     this.musicButton.on(Phaser.Input.Events.POINTER_DOWN, () => {
       BaseScene.isMusicOn = !BaseScene.isMusicOn; // Toggle state static
       this.musicButton.setTexture(BaseScene.isMusicOn ? 'music_on' : 'music_off'); // Ganti ikon
       console.log('Music Toggled:', BaseScene.isMusicOn);

       // Logika Mute/Unmute
       if (BaseScene.backgroundMusic) {
           if (BaseScene.isMusicOn) {
               if (!BaseScene.backgroundMusic.isPlaying) { BaseScene.backgroundMusic.resume(); }
           } else {
               BaseScene.backgroundMusic.pause();
           }
       } else if (BaseScene.isMusicOn) { // Jika belum ada, buat & mainkan
            BaseScene.backgroundMusic = this.sound.add('bgm', { loop: true, volume: 0.5 });
            BaseScene.backgroundMusic.play();
       }

       this.playSound('sfx_click'); // Mainkan SFX klik
     });

     // Tombol Kembali
     if (this.scene.key !== 'MainMenuScene') {
        const backButtonX = iconMarginHorizontal;
        const backButtonY = iconMarginVertical; // Y sama dengan tombol musik
        let finalTarget = backTargetScene;

         this.backButton = this.add.image(backButtonX, backButtonY, 'back_arrow')
            .setOrigin(0, 0) // Kiri-atas
            .setScale(iconScale)
            .setInteractive({ useHandCursor: true });

         this.backButton.on(Phaser.Input.Events.POINTER_DOWN, () => {
            this.playSound('sfx_click'); // Mainkan SFX klik

            // Logika pindah scene (delay sedikit)
            this.time.delayedCall(100, () => {
                if (this.scene.key === 'PilihModeScene') finalTarget = 'MainMenuScene';
                else if (this.scene.key === 'PilihKesulitanScene') finalTarget = 'PilihModeScene';
                else if (this.scene.key === 'GameScene') finalTarget = 'PilihKesulitanScene';
                else if (this.scene.key === 'ResultsScene') finalTarget = 'MainMenuScene';

                if (finalTarget === 'PilihKesulitanScene' && (this as any).mode) {
                     this.scene.start(finalTarget, { mode: (this as any).mode });
                } else {
                     this.scene.start(finalTarget);
                }
            });
         });
     }
   }

    // --- REVISI: Reposisi Tombol Gambar ---
    protected repositionCommonButtons() {
        const iconMarginHorizontal = this.scale.width * 0.05;
        const iconMarginVertical = this.scale.height * 0.05;
        // const iconScale = 0.5; // Anda bisa set ulang skala di sini jika perlu

        if (this.musicButton) {
            this.musicButton.setPosition(this.scale.width - iconMarginHorizontal, iconMarginVertical);
            // this.musicButton.setScale(iconScale);
        }
        if (this.backButton) {
            this.backButton.setPosition(iconMarginHorizontal, iconMarginVertical);
            // this.backButton.setScale(iconScale);
        }
    }

  // draw() membersihkan group
  public draw() {
    if (this.sceneContentGroup) {
       this.sceneContentGroup.clear(true, true);
    } else {
       console.warn(`sceneContentGroup belum diinisialisasi di scene ${this.scene.key}.`);
       this.sceneContentGroup = this.add.group().setName('sceneContentGroup_base_fallback');
    }
  }

  // --- Helper isPointerOver (PENTING ADA DI BASE) ---
  public isPointerOver(pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject): boolean {
    if (!(gameObject instanceof Phaser.GameObjects.Container || gameObject instanceof Phaser.GameObjects.Text || gameObject instanceof Phaser.GameObjects.Image)) {
        return false;
    }
    let worldX: number, worldY: number, width: number, height: number;
    if (gameObject instanceof Phaser.GameObjects.Image) {
        const scaleX = gameObject.scaleX * (gameObject.parentContainer ? gameObject.parentContainer.scaleX : 1);
        const scaleY = gameObject.scaleY * (gameObject.parentContainer ? gameObject.parentContainer.scaleY : 1);
        width = gameObject.width * scaleX;
        height = gameObject.height * scaleY;
        const displayOriginX = width * gameObject.originX;
        const displayOriginY = height * gameObject.originY;
        const wt = gameObject.getWorldTransformMatrix();
        worldX = wt.tx - displayOriginX;
        worldY = wt.ty - displayOriginY;
    } else if (gameObject instanceof Phaser.GameObjects.Container) {
        worldX = gameObject.x;
        worldY = gameObject.y;
        width = gameObject.width;
        height = gameObject.height;
    } else { // Text
        const bounds = gameObject.getBounds();
        if (!bounds) return false;
        worldX = bounds.x;
        worldY = bounds.y;
        width = bounds.width;
        height = bounds.height;
    }
    const hitAreaRect = new Phaser.Geom.Rectangle(worldX, worldY, width, height);
    return hitAreaRect.contains(pointer.x, pointer.y);
  }
  // --- Akhir Helper isPointerOver ---

  // --- Helper SFX ---
  protected playSound(key: string, config?: Phaser.Types.Sound.SoundConfig) {
      // Cek mute global atau state musik BGM (sesuaikan kebutuhan)
      // if (!this.sound.mute) {
      if (BaseScene.isMusicOn || !key.startsWith('bgm')) { // Mainkan SFX meskipun BGM mati
          this.sound.play(key, config);
      }
  }
  // --- Akhir Helper SFX ---

} // Akhir Class
