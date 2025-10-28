import Phaser from 'phaser';

export class BaseScene extends Phaser.Scene {
  protected centerX!: number;
  protected centerY!: number;
  protected musicButton!: Phaser.GameObjects.Image;
  protected backButton!: Phaser.GameObjects.Image;
  protected sceneContentGroup!: Phaser.GameObjects.Group;

  protected static isMusicOn: boolean = true;
  protected static backgroundMusic: Phaser.Sound.BaseSound | null = null;

  preload() { //Aset Negara
    console.log("BaseScene preload starting...");
    this.load.image('background', 'assets/Images/Asset 8.png');
    this.load.image('logo', 'assets/Images/Asset 7.png'); 
    this.load.image('music_on', 'assets/Images/Unmute.png');
    this.load.image('music_off', 'assets/Images/Mute.png');
    this.load.image('back_arrow', 'assets/Images/Back.png');
    console.log("Loading audio assets...");
    this.load.audio('bgm', 'assets/Sounds/Backsound.wav');
    this.load.audio('sfx_click', 'assets/Sounds/Click.mp3');
    this.load.audio('sfx_correct', 'assets/Sounds/Right.mp3');
    this.load.audio('sfx_incorrect', 'assets/Sounds/Wrong.mp3');
    console.log("BaseScene preload finished.");
  }

  create() {
    console.log("BaseScene create starting...");
    this.updateCenter();
    this.cameras.main.setViewport(0, 0, this.scale.width, this.scale.height);

    try {
        this.add.image(this.centerX, this.centerY, 'background')
            .setName('background_base').setDisplaySize(this.scale.width, this.scale.height).setDepth(-1);
    } catch (e) { //Biang
        console.error("Gagal membuat background image:", e);
        this.add.rectangle(this.centerX, this.centerY, this.scale.width, this.scale.height, 0x000000).setOrigin(0.5);
    }

    this.sceneContentGroup = this.add.group().setName('sceneContentGroup_base');

    this.scale.on('resize', this.handleResize, this);

    this.renderer.on('contextrestored', () => {
        console.log(`WebGL Context Restored for scene: ${this.scene.key}`);
        this.handleResize(this.scale.gameSize);
    });

    //Logika Musik (Aktif)
    if (!BaseScene.backgroundMusic && BaseScene.isMusicOn) {
        if (this.cache.audio.exists('bgm')) {
            BaseScene.backgroundMusic = this.sound.add('bgm', { loop: true, volume: 0.5 });
            BaseScene.backgroundMusic.play();
            console.log("Playing background music");
        } else { console.warn("Audio key 'bgm' not found."); }
    } else if (BaseScene.backgroundMusic && !BaseScene.isMusicOn) { BaseScene.backgroundMusic.pause(); }
    else if (BaseScene.backgroundMusic && BaseScene.isMusicOn && !BaseScene.backgroundMusic.isPlaying) { BaseScene.backgroundMusic.resume(); }
    //Logika Musi

    this.createCommonButtons();
    if (this.musicButton) this.musicButton.setName('musicButton_base');
    if (this.backButton) this.backButton.setName('backButton_base');

    if (this.musicButton) {
        try {
             this.musicButton.setTexture(BaseScene.isMusicOn ? 'music_on' : 'music_off');
        } catch (e) {
            console.error("Gagal set tekstur tombol musik:", e);
        }
    }

    this.time.delayedCall(15, () => {
       if (this.scene.isActive(this.scene.key) && typeof (this as any).draw === 'function') {
         (this as any).draw();
       }
    }, [], this);
    console.log("BaseScene create finished.");
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
    this.repositionCommonButtons();

    if (typeof (this as any).draw === 'function') {
      (this as any).draw();
    }
  }

  private updateCenter() {
    this.centerX = this.scale.width / 2;
    this.centerY = this.scale.height / 2;
  }

   protected createCommonButtons(backTargetScene: string = 'MainMenuScene') {
     const iconMarginHorizontal = this.scale.width * 0.05;
     const iconMarginVertical = this.scale.height * 0.05;
     const iconScale = 0.5; 

     // Tombol Musik (try-catch)
     const musicButtonX = this.scale.width - iconMarginHorizontal;
     const musicButtonY = iconMarginVertical;
     const initialMusicTexture = BaseScene.isMusicOn ? 'music_on' : 'music_off';
     try {
         this.musicButton = this.add.image(musicButtonX, musicButtonY, initialMusicTexture)
           .setOrigin(1, 0).setScale(iconScale).setInteractive({ useHandCursor: true });

         this.musicButton.on(Phaser.Input.Events.POINTER_DOWN, () => {
           BaseScene.isMusicOn = !BaseScene.isMusicOn;
           try {
               this.musicButton.setTexture(BaseScene.isMusicOn ? 'music_on' : 'music_off');
           } catch(e) { console.error("Gagal set tekstur tombol musik saat klik:", e); }
           console.log('Music Toggled:', BaseScene.isMusicOn);
           
           //Logika Mute/Unmute
           if (BaseScene.backgroundMusic) {
               if (BaseScene.isMusicOn) {
                   if (!BaseScene.backgroundMusic.isPlaying) { BaseScene.backgroundMusic.resume(); }
               } else {
                   BaseScene.backgroundMusic.pause();
               }
           } else if (BaseScene.isMusicOn && this.cache.audio.exists('bgm')) {
                BaseScene.backgroundMusic = this.sound.add('bgm', { loop: true, volume: 0.5 });
                BaseScene.backgroundMusic.play();
           }
           this.playSound('sfx_click'); // Mainkan SFX
         });
     } catch (e) {
         console.error("Gagal membuat tombol musik:", e);
         this.musicButton = this.add.text(musicButtonX, musicButtonY, '[M]', {fontSize: '20px', color: '#fff'}).setOrigin(1,0) as any;
     }

     //Tombol Kembali (try-catch)
     if (this.scene.key !== 'MainMenuScene') {
        const backButtonX = iconMarginHorizontal;
        const backButtonY = iconMarginVertical;
        let finalTarget = backTargetScene;
        try {
             this.backButton = this.add.image(backButtonX, backButtonY, 'back_arrow')
                .setOrigin(0, 0).setScale(iconScale).setInteractive({ useHandCursor: true });

             this.backButton.on(Phaser.Input.Events.POINTER_DOWN, () => {
                this.playSound('sfx_click'); //Mainkan SFX
                
                //Pindah scene (delay SFX)
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
        } catch(e) {
             console.error("Gagal membuat tombol kembali:", e);
             this.backButton = this.add.text(backButtonX, backButtonY, '[<]', {fontSize: '20px', color: '#fff'}).setOrigin(0,0) as any;
        }
     }
   }

    protected repositionCommonButtons() {
        const iconMarginHorizontal = this.scale.width * 0.05;
        const iconMarginVertical = this.scale.height * 0.05;
        if (this.musicButton) this.musicButton.setPosition(this.scale.width - iconMarginHorizontal, iconMarginVertical);
        if (this.backButton) this.backButton.setPosition(iconMarginHorizontal, iconMarginVertical);
    }

  public draw() {
    if (this.sceneContentGroup) {
       this.sceneContentGroup.clear(true, true);
    } else {
       console.warn(`sceneContentGroup belum diinisialisasi di scene ${this.scene.key}.`);
       this.sceneContentGroup = this.add.group().setName('sceneContentGroup_base_fallback');
    }
  }

  //Biang
  public isPointerOver(pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject): boolean {
    if (!(gameObject instanceof Phaser.GameObjects.Container || gameObject instanceof Phaser.GameObjects.Text || gameObject instanceof Phaser.GameObjects.Image)) {
        return false;
    }

    let worldX: number;
    let worldY: number;
    let width: number;
    let height: number;

    if (gameObject instanceof Phaser.GameObjects.Image) {
        const scaleX = gameObject.scaleX * (gameObject.parentContainer ? gameObject.parentContainer.scaleX : 1);
        const scaleY = gameObject.scaleY * (gameObject.parentContainer ? gameObject.parentContainer.scaleY : 1);
        width = gameObject.width * scaleX;
        height = gameObject.height * scaleY;
        const originX = gameObject.originX;
        const originY = gameObject.originY;
        const displayOriginX = width * originX;
        const displayOriginY = height * originY;
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
  }//Biang

  //HELPER playSound (Diaktifkan)
  protected playSound(key: string, config?: Phaser.Types.Sound.SoundConfig) {
     try {
         // Cek jika key audio ada sebelum play
         if (this.cache.audio.exists(key)) {
             // Mainkan SFX meskipun BGM mati
             this.sound.play(key, config);
         } else {
             console.warn(`Audio key '${key}' not found.`);
         }
     } catch (e) {
         console.error(`Gagal memainkan audio '${key}':`, e);
     }
  }//HELPER playSound ---

}
