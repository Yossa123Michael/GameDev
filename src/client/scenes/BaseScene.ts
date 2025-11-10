import Phaser from 'phaser';

// Sederhana: baca settings dari localStorage (agar tidak memaksa SettingsManager)
type SettingsLite = {
  musicOn?: boolean;
  musicVol?: number;
  sfxOn?: boolean;
  sfxVol?: number;
  graphics?: 'normal' | 'low';
  vibration?: boolean;
};
function getSettingsLite(): SettingsLite {
  try {
    const raw = localStorage.getItem('rk:settings');
    if (!raw) return {};
    return JSON.parse(raw) as SettingsLite;
  } catch { return {}; }
}

function setSettingsLite(patch: SettingsLite) {
  try {
    const cur = getSettingsLite();
    const next = { ...cur, ...patch };
    localStorage.setItem('rk:settings', JSON.stringify(next));
  } catch { /* ignore */ }
}

export class BaseScene extends Phaser.Scene {
  protected centerX!: number;
  protected centerY!: number;

  protected musicButton!: Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle | undefined;
  protected backButton!: Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle | undefined;
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

    // Terapkan settings sederhana
    const s = getSettingsLite();
    BaseScene.isMusicOn = s.musicOn ?? BaseScene.isMusicOn;

    // Musik global
    if (!BaseScene.backgroundMusic && BaseScene.isMusicOn) {
      if (this.cache.audio.exists('bgm')) {
        BaseScene.backgroundMusic = this.sound.add('bgm', { loop: true, volume: s.musicVol ?? 0.5 });
        try { BaseScene.backgroundMusic.play(); } catch {}
      } else {
        console.warn("Audio key 'bgm' not found.");
      }
    } else if (BaseScene.backgroundMusic && !BaseScene.isMusicOn) {
      BaseScene.backgroundMusic.pause();
    } else if (BaseScene.backgroundMusic && BaseScene.isMusicOn && !BaseScene.backgroundMusic.isPlaying) {
      BaseScene.backgroundMusic.resume();
    }
    // Set volume aman (hindari TS complain)
    try { (BaseScene.backgroundMusic as any)?.setVolume?.(s.musicVol ?? 0.5); } catch {}

    // Graphics quality sederhana
    try {
      if (s.graphics === 'low') {
        (this.textures as any).setDefaultFilter?.(Phaser.Textures.FilterMode.NEAREST);
      } else {
        (this.textures as any).setDefaultFilter?.(Phaser.Textures.FilterMode.LINEAR);
      }
    } catch {}

    this.createCommonButtons();

    const key = BaseScene.isMusicOn ? 'music_on' : 'music_off';
    if (this.musicButton && 'setTexture' in this.musicButton) {
      if (this.textures.exists(key)) {
        try { (this.musicButton as Phaser.GameObjects.Image).setTexture(key); } catch {}
      } else {
        try { this.musicButton.setVisible(false).disableInteractive(); } catch {}
      }
      try { this.musicButton.setName('musicButton_base'); } catch {}
    }
    if (this.backButton) try { this.backButton.setName('backButton_base'); } catch {}

    // Unlock audio setelah gesture pertama
    this.input?.once?.('pointerdown', () => {
      try {
        this.sound.unlock();
        if (BaseScene.backgroundMusic && BaseScene.isMusicOn && !BaseScene.backgroundMusic.isPlaying) {
          BaseScene.backgroundMusic.play();
        }
      } catch {}
    });

    console.log('BaseScene create finished.');

    // Tunda draw pertama satu tick
    this.time.delayedCall(0, () => {
      if (typeof (this as any).draw === 'function') {
        try { (this as any).draw(); } catch (e) { console.warn('deferred draw() failed:', e); }
      }
    });
  }

  protected updateCenter() {
    this.centerX = Math.floor(this.scale.width / 2);
    this.centerY = Math.floor(this.scale.height / 2);
  }

  protected handleResize = (gameSize: Phaser.Structs.Size) => {
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

  protected getUIIconMetrics() {
    const sMin = Math.min(this.scale.width, this.scale.height);
    const pad = Phaser.Math.Clamp(Math.round(sMin * 0.02), 8, 48);
    const iconSize = Phaser.Math.Clamp(Math.round(sMin * 0.06), 24, 128);
    return { pad, iconSize };
  }

  protected createCommonButtons(targetBackSceneKey?: string) {
    try { if (this.musicButton) { (this.musicButton as any).destroy?.(); this.musicButton = undefined; } } catch {}
    try { if (this.backButton)  { (this.backButton  as any).destroy?.(); this.backButton  = undefined; } } catch {}

    const { pad, iconSize } = this.getUIIconMetrics();

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
      (this.musicButton as Phaser.GameObjects.Image).on('pointerup', () => this.toggleMusic());
    } else {
      const g = this.add.rectangle(this.scale.width - pad, pad, iconSize, iconSize, 0x333333).setOrigin(1, 0);
      g.setVisible(false);
      this.musicButton = g;
    }

    if (this.textures.exists('back_arrow')) {
      this.backButton = this.add
        .image(pad, pad, 'back_arrow')
        .setOrigin(0, 0)
        .setInteractive({ useHandCursor: true })
        .setDisplaySize(iconSize, iconSize);

      (this.backButton as Phaser.GameObjects.Image).on('pointerup', () => {
        let target = targetBackSceneKey || 'MainMenuScene';
        if (this.scene.key === 'PilihModeScene') target = 'MainMenuScene';
        else if (this.scene.key === 'PilihKesulitanScene') target = 'PilihModeScene';
        else if (this.scene.key === 'GameScene') target = 'PilihKesulitanScene';
        else if (this.scene.key === 'ResultsScene') target = 'MainMenuScene';

        try { this.playSound('sfx_click', { volume: 0.7 }); } catch {}
        if (target === 'PilihKesulitanScene' && (this as any).mode) this.scene.start(target, { mode: (this as any).mode });
        else this.scene.start(target);
      });
    } else {
      const g = this.add.rectangle(pad, pad, iconSize, iconSize, 0x333333).setOrigin(0, 0);
      g.setVisible(false);
      this.backButton = g;
    }

    this.layoutCommonButtons();
  }

  protected layoutCommonButtons() {
    const { pad, iconSize } = this.getUIIconMetrics();
    try { this.musicButton?.setPosition(this.scale.width - pad, pad).setDisplaySize(iconSize, iconSize); } catch {}
    try { this.backButton?.setPosition(pad, pad).setDisplaySize(iconSize, iconSize); } catch {}
  }

  protected toggleMusic() {
    BaseScene.isMusicOn = !BaseScene.isMusicOn;
    setSettingsLite({ musicOn: BaseScene.isMusicOn });

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
        BaseScene.backgroundMusic = this.sound.add('bgm', { loop: true, volume: getSettingsLite().musicVol ?? 0.5 });
        try { BaseScene.backgroundMusic.play(); } catch {}
      }
    }

    const key = BaseScene.isMusicOn ? 'music_on' : 'music_off';
    if (this.musicButton && 'setTexture' in this.musicButton) {
      if (this.textures.exists(key)) {
        try { (this.musicButton as Phaser.GameObjects.Image).setTexture(key); } catch {}
      } else {
        try { this.musicButton.setVisible(false).disableInteractive(); } catch {}
      }
    }

    console.log('Music Toggled:', BaseScene.isMusicOn);
  }

  // SFX aware settings
  protected playSound(key: string, config?: Phaser.Types.Sound.SoundConfig) {
    const s = getSettingsLite();
    if (s.sfxOn === false) return;
    const vol = (config?.volume ?? 1) * (s.sfxVol ?? 1);
    try { if (this.cache.audio.exists(key)) this.sound.play(key, { ...config, volume: vol }); } catch {}
  }

  // Helper tombol reusable
  protected createButton(y: number, label: string, onClick?: () => void): Phaser.GameObjects.Container {
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
      this.playSound('sfx_click', { volume: 0.7 });
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

  public draw() {
    if (this.sceneContentGroup) {
      this.sceneContentGroup.clear(true, true);
    } else {
      this.sceneContentGroup = this.add.group().setName('sceneContentGroup_base_fallback');
    }
  }
}
