import Phaser from 'phaser';

export class BaseScene extends Phaser.Scene {
  protected centerX!: number;
  protected centerY!: number;

  protected musicButton!: Phaser.GameObjects.Image;
  protected backButton!: Phaser.GameObjects.Image;
  protected sceneContentGroup!: Phaser.GameObjects.Group;

  protected static isMusicOn = true;
  protected static backgroundMusic: Phaser.Sound.BaseSound | null = null;

  preload() {
    this.load.image('background', 'assets/Images/Asset 8.png');
    this.load.image('logo', 'assets/Images/Asset 7.png');
    this.load.image('music_on', 'assets/Images/Unmute.png');
    this.load.image('music_off', 'assets/Images/Mute.png');
    this.load.image('back_arrow', 'assets/Images/Back.png');

    this.load.audio('bgm', 'assets/Sounds/Backsound.wav');
    this.load.audio('sfx_click', 'assets/Sounds/Click.mp3');
    this.load.audio('sfx_correct', 'assets/Sounds/Right.mp3');
    this.load.audio('sfx_incorrect', 'assets/Sounds/Wrong.mp3');

    console.log('BaseScene preload finished.');
  }

  create() {
    console.log('BaseScene create starting...');
    this.updateCenter();

    if (this.cameras && this.cameras.main) {
      this.cameras.main.setViewport(0, 0, this.scale.width, this.scale.height);
    }

    try {
      this.add
        .image(this.centerX, this.centerY, 'background')
        .setName('background_base')
        .setDisplaySize(this.scale.width, this.scale.height)
        .setDepth(-1);
    } catch (e) {
      console.error('Gagal membuat background image:', e);
      this.add
        .rectangle(this.centerX, this.centerY, this.scale.width, this.scale.height, 0x000000)
        .setOrigin(0.5)
        .setDepth(-1);
    }

    this.sceneContentGroup = this.add.group().setName('sceneContentGroup_base');

    this.scale.on('resize', this.handleResize, this);
    this.events.once('shutdown', () => {
      this.scale.off('resize', this.handleResize, this);
    });

    this.renderer.on('contextrestored', () => {
      console.log(`WebGL Context Restored for scene: ${this.scene.key}`);
      this.handleResize(this.scale.gameSize);
    });

    // Musik
    if (!BaseScene.backgroundMusic && BaseScene.isMusicOn) {
      if (this.cache.audio.exists('bgm')) {
        BaseScene.backgroundMusic = this.sound.add('bgm', { loop: true, volume: 0.5 });
        try { BaseScene.backgroundMusic.play(); } catch {
          console.warn('Autoplay blocked; music will play after user gesture.');
        }
      } else {
        console.warn("Audio key 'bgm' not found.");
      }
    } else if (BaseScene.backgroundMusic && !BaseScene.isMusicOn) {
      BaseScene.backgroundMusic.pause();
    } else if (BaseScene.backgroundMusic && BaseScene.isMusicOn && !BaseScene.backgroundMusic.isPlaying) {
      BaseScene.backgroundMusic.resume();
    }

    this.createCommonButtons();

    if (this.musicButton) {
      const key = BaseScene.isMusicOn ? 'music_on' : 'music_off';
      if (this.textures.exists(key)) this.musicButton.setTexture(key);
      else this.musicButton.setVisible(false).disableInteractive();
      this.musicButton.setName('musicButton_base');
    }
    if (this.backButton) this.backButton.setName('backButton_base');

    console.log('BaseScene create finished.');

    if (typeof (this as any).draw === 'function') {
      try { (this as any).draw(); } catch (e) { console.warn('initial draw() failed:', e); }
    }
  }

  protected updateCenter() {
    this.centerX = Math.floor(this.scale.width / 2);
    this.centerY = Math.floor(this.scale.height / 2);
  }

  // Hitung ukuran ikon dan padding yang responsif terhadap layar
  protected getUIIconMetrics() {
    const sMin = Math.min(this.scale.width, this.scale.height);
    const pad = Phaser.Math.Clamp(Math.round(sMin * 0.02), 8, 48);      // padding responsif
    const iconSize = Phaser.Math.Clamp(Math.round(sMin * 0.06), 24, 128); // ikon responsif
    return { pad, iconSize };
  }

  protected handleResize = (gameSize: Phaser.Structs.Size) => {
    // @ts-ignore
    if (!this.cameras || !this.cameras.main || !this.scale) return;

    const { width, height } = gameSize;
    this.cameras.main.setViewport(0, 0, width, height);

    const bg = this.children.getByName?.('background_base') as Phaser.GameObjects.Image | undefined;
    if (bg) bg.setDisplaySize(width, height).setPosition(width / 2, height / 2);

    this.updateCenter();
    this.layoutCommonButtons();

    if (typeof (this as any).draw === 'function') {
      try { (this as any).draw(); } catch (e) { console.warn('draw() on resize failed:', e); }
    }
  };

  protected createCommonButtons(targetBackSceneKey?: string) {
    const { pad, iconSize } = this.getUIIconMetrics();

    // Music
    const musicKey =
      this.textures.exists('music_on') || this.textures.exists('music_off')
        ? (BaseScene.isMusicOn ? 'music_on' : 'music_off')
        : null;

    if (musicKey) {
      this.musicButton = this.add
        .image(this.scale.width - pad, pad, musicKey)
        .setOrigin(1, 0)
        .setInteractive({ useHandCursor: true })
        .setDisplaySize(iconSize, iconSize);
      this.musicButton.on('pointerup', () => this.toggleMusic());
    } else {
      const g = this.add.rectangle(this.scale.width - pad, pad, iconSize, iconSize, 0x333333).setOrigin(1, 0);
      g.setVisible(false);
      // @ts-ignore
      this.musicButton = g as any;
    }

    // Back
    if (this.textures.exists('back_arrow')) {
      this.backButton = this.add
        .image(pad, pad, 'back_arrow')
        .setOrigin(0, 0)
        .setInteractive({ useHandCursor: true })
        .setDisplaySize(iconSize, iconSize);

      this.backButton.on('pointerup', () => {
        let target = targetBackSceneKey || 'MainMenuScene';
        if (this.scene.key === 'PilihModeScene') target = 'MainMenuScene';
        else if (this.scene.key === 'PilihKesulitanScene') target = 'PilihModeScene';
        else if (this.scene.key === 'GameScene') target = 'PilihKesulitanScene';
        else if (this.scene.key === 'ResultsScene') target = 'MainMenuScene';

        try { this.sound.play('sfx_click', { volume: 0.7 }); } catch {}
        if (target === 'PilihKesulitanScene' && (this as any).mode) this.scene.start(target, { mode: (this as any).mode });
        else this.scene.start(target);
      });
    } else {
      const g = this.add.rectangle(pad, pad, iconSize, iconSize, 0x333333).setOrigin(0, 0);
      g.setVisible(false);
      // @ts-ignore
      this.backButton = g as any;
    }

    this.layoutCommonButtons();
  }

  protected layoutCommonButtons() {
    const { pad, iconSize } = this.getUIIconMetrics();

    if (this.musicButton) {
      this.musicButton.setPosition(this.scale.width - pad, pad).setDisplaySize(iconSize, iconSize);
    }
    if (this.backButton) {
      this.backButton.setPosition(pad, pad).setDisplaySize(iconSize, iconSize);
    }
  }

  protected toggleMusic() {
    BaseScene.isMusicOn = !BaseScene.isMusicOn;

    if (BaseScene.backgroundMusic) {
      if (BaseScene.isMusicOn) {
        if (!BaseScene.backgroundMusic.isPlaying) {
          try { BaseScene.backgroundMusic.resume(); } catch { try { BaseScene.backgroundMusic.play(); } catch {} }
        }
      } else {
        BaseScene.backgroundMusic.pause();
      }
    } else if (BaseScene.isMusicOn) {
      if (this.cache.audio.exists('bgm')) {
        BaseScene.backgroundMusic = this.sound.add('bgm', { loop: true, volume: 0.5 });
        try { BaseScene.backgroundMusic.play(); } catch { console.warn('Autoplay blocked; music will play after user gesture.'); }
      }
    }

    if (this.musicButton) {
      const key = BaseScene.isMusicOn ? 'music_on' : 'music_off';
      if (this.textures.exists(key)) this.musicButton.setTexture(key);
      else this.musicButton.setVisible(false).disableInteractive();
    }

    console.log('Music Toggled:', BaseScene.isMusicOn);
  }

  // ========= Helper tombol reusable (area klik: seluruh kotak + teks) =========

  protected createButton(
    y: number,
    label: string,
    onClick?: () => void
  ): Phaser.GameObjects.Container {
    const width = Math.round(this.scale.width * 0.86);
    const height = Math.max(48, Math.round(this.scale.height * 0.08));
    const radius = Math.min(24, Math.floor(height * 0.35));

    const container = this.add.container(this.centerX, y);
    (container as any).width = width;
    (container as any).height = height;

    const g = this.add.graphics();
    this.updateButtonGraphics(g, width, height, 0xffffff, 0x000000, 3, radius);
    container.add(g);

    const txt = this.add.text(0, 0, label, {
      fontFamily: 'Nunito',
      fontSize: `${Math.max(16, Math.floor(height * 0.38))}px`,
      color: '#000',
      align: 'center',
      wordWrap: { width: Math.floor(width * 0.9) }
    }).setOrigin(0.5);
    container.add(txt);

    const zone = this.add.zone(0, 0, width, height).setOrigin(0.5);
    zone.setInteractive({ useHandCursor: true });
    container.add(zone);

    zone.on('pointerover', () => this.updateButtonGraphics(g, width, height, 0xf5f5f5));
    zone.on('pointerout', () => this.updateButtonGraphics(g, width, height, 0xffffff));
    zone.on('pointerdown', () => this.updateButtonGraphics(g, width, height, 0xdddddd));
    zone.on('pointerup', () => {
      this.updateButtonGraphics(g, width, height, 0xf5f5f5);
      this.playSound('sfx_click');
      onClick?.();
    });

    container.setSize(width, height);
    return container;
  }

  protected updateButtonGraphics(
    graphics: Phaser.GameObjects.Graphics,
    width: number,
    height: number,
    fillColor: number,
    strokeColor: number = 0x000000,
    strokeWidth = 3,
    radius: number = Math.min(24, Math.floor(height * 0.35))
  ) {
    graphics.clear();
    graphics.lineStyle(strokeWidth, strokeColor, 1);
    graphics.fillStyle(fillColor, 1);

    const x = -width / 2;
    const y = -height / 2;

    graphics.fillRoundedRect(x, y, width, height, radius);
    graphics.strokeRoundedRect(x, y, width, height, radius);
  }

  public isPointerOver(pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject): boolean {
    const bounds = (gameObject as any).getBounds?.();
    if (!bounds) return false;
    return bounds.contains(pointer.x, pointer.y);
  }

  protected playSound(key: string, config?: Phaser.Types.Sound.SoundConfig) {
    try { if (this.cache.audio.exists(key)) this.sound.play(key, config); } catch {}
  }

  public draw() {
    if (this.sceneContentGroup) {
      this.sceneContentGroup.clear(true, true);
    } else {
      this.sceneContentGroup = this.add.group().setName('sceneContentGroup_base_fallback');
    }
  }
}
