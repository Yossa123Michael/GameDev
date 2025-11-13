import Phaser from 'phaser';
import { SettingsManager } from '../lib/Settings';

type AudioRuntime = {
  hornIconMuted: boolean;
  musicRuntimeMuted: boolean;
  sfxRuntimeMuted: boolean;
};

const LS_SETTINGS_KEY = 'rk:settings';
const LS_RUNTIME_KEY  = 'rk:audioRuntime';

function loadRuntime(): AudioRuntime {
  try {
    const raw = localStorage.getItem(LS_RUNTIME_KEY);
    if (!raw) return { hornIconMuted: false, musicRuntimeMuted: false, sfxRuntimeMuted: false };
    const p = JSON.parse(raw) as Partial<AudioRuntime>;
    return {
      hornIconMuted: !!p.hornIconMuted,
      musicRuntimeMuted: !!p.musicRuntimeMuted,
      sfxRuntimeMuted: !!p.sfxRuntimeMuted
    };
  } catch {
    return { hornIconMuted: false, musicRuntimeMuted: false, sfxRuntimeMuted: false };
  }
}

function saveRuntime(patch: Partial<AudioRuntime>): AudioRuntime {
  const cur = loadRuntime();
  const next: AudioRuntime = { ...cur, ...patch };
  try { localStorage.setItem(LS_RUNTIME_KEY, JSON.stringify(next)); } catch {}
  return next;
}

// Ground truth settings (enable flags)
function readSettings(): any {
  try {
    const raw = localStorage.getItem(LS_SETTINGS_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch { return {}; }
}

export class BaseScene extends Phaser.Scene {
  protected centerX!: number;
  protected centerY!: number;

  protected musicButton!: Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle | undefined;
  protected backButton!: Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle | undefined;
  protected sceneContentGroup!: Phaser.GameObjects.Group;

  protected static backgroundMusic: Phaser.Sound.BaseSound | null = null;

  private settingsUnsub?: () => void;

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

  public override create() {
    console.log('BaseScene create starting...');
    this.updateCenter();

    if (this.cameras?.main) {
      this.cameras.main.setViewport(0, 0, this.scale.width, this.scale.height);
    }

    try {
      this.add.image(this.centerX, this.centerY, 'background')
        .setName('background_base')
        .setDisplaySize(this.scale.width, this.scale.height)
        .setDepth(-1);
    } catch {
      this.add.rectangle(this.centerX, this.centerY, this.scale.width, this.scale.height, 0x000000)
        .setOrigin(0.5).setDepth(-1);
    }

    this.sceneContentGroup = this.add.group().setName('sceneContentGroup_base');

    this.scale.on('resize', this.handleResize, this);
    this.events.once('shutdown', () => {
      this.scale.off('resize', this.handleResize, this);
      try { this.settingsUnsub?.(); } catch {}
    });

    this.renderer.on('contextrestored', () => {
      console.log(`WebGL Context Restored for scene: ${this.scene.key}`);
      this.handleResize(this.scale.gameSize);
    });

    // Apply initial playback based on settings + runtime mute
    this.applyInitialAudioState();

    this.createCommonButtons();

    // Subscribe ke SettingsManager agar kalau user ubah Option (enable flags) kita re-evaluasi playback,
    // TIDAK menyentuh runtime mute (horn state tetap).
    this.settingsUnsub = SettingsManager.subscribe(() => {
      this.reapplyAfterOptionChange();
    });

    // Unlock audio setelah gesture pertama
    this.input?.once?.('pointerdown', () => {
      try {
        this.sound.unlock();
        const rt = loadRuntime();
        const st = SettingsManager.get();
        if (st.musicOn && !rt.musicRuntimeMuted && BaseScene.backgroundMusic && !BaseScene.backgroundMusic.isPlaying) {
          BaseScene.backgroundMusic.play();
        }
      } catch {}
    });

    console.log('BaseScene create finished.');

    this.time.delayedCall(0, () => {
      if (typeof (this as any).draw === 'function') {
        try { (this as any).draw(); } catch (e) { console.warn('deferred draw() failed:', e); }
      }
    });
  }

  private applyInitialAudioState() {
    const settings = SettingsManager.get(); // enable flags
    const rt = loadRuntime();

    // Music instance
    if (!BaseScene.backgroundMusic && this.cache.audio.exists('bgm')) {
      BaseScene.backgroundMusic = this.sound.add('bgm', { loop: true, volume: settings.musicVol ?? 0.5 });
    }

    // Decide play/pause
    if (BaseScene.backgroundMusic) {
      if (settings.musicOn && !rt.musicRuntimeMuted) {
        try { if (!BaseScene.backgroundMusic.isPlaying) BaseScene.backgroundMusic.play(); } catch {}
      } else {
        try { if (BaseScene.backgroundMusic.isPlaying) BaseScene.backgroundMusic.pause(); } catch {}
      }
      try { (BaseScene.backgroundMusic as any)?.setVolume?.(settings.musicVol ?? 0.5); } catch {}
    }
  }

  private reapplyAfterOptionChange() {
    const settings = SettingsManager.get();
    const rt = loadRuntime();

    // Music playback mengikuti (musicOn && !runtimeMuted)
    if (BaseScene.backgroundMusic) {
      try {
        if (settings.musicOn && !rt.musicRuntimeMuted) {
          if (!BaseScene.backgroundMusic.isPlaying) BaseScene.backgroundMusic.resume();
        } else {
          if (BaseScene.backgroundMusic.isPlaying) BaseScene.backgroundMusic.pause();
        }
        (BaseScene.backgroundMusic as any)?.setVolume?.(settings.musicVol ?? 0.5);
      } catch {}
    } else if (settings.musicOn && !rt.musicRuntimeMuted) {
      if (this.cache.audio.exists('bgm')) {
        BaseScene.backgroundMusic = this.sound.add('bgm', { loop: true, volume: settings.musicVol ?? 0.5 });
        try { BaseScene.backgroundMusic.play(); } catch {}
      }
    }

    // Update icon
    this.updateHornIcon();
  }

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
    const rt = loadRuntime();

    const textureKey = rt.hornIconMuted ? 'music_off' : 'music_on';
    const existsAny = this.textures.exists('music_on') || this.textures.exists('music_off');

    if (existsAny) {
      const img = this.add.image(this.scale.width - pad, pad, textureKey)
        .setOrigin(1, 0)
        .setDisplaySize(iconSize, iconSize)
        .setDepth(2000)
        .setScrollFactor(0)
        .setInteractive({ useHandCursor: true });

      img.on('pointerup', () => {
        this.toggleHorn();
      });

      this.musicButton = img;
    } else {
      const g = this.add.rectangle(this.scale.width - pad, pad, iconSize, iconSize, 0x222222)
        .setOrigin(1, 0).setDepth(2000);
      g.setVisible(false);
      this.musicButton = g;
    }

    if (this.textures.exists('back_arrow')) {
      this.backButton = this.add.image(pad, pad, 'back_arrow')
        .setOrigin(0, 0)
        .setInteractive({ useHandCursor: true })
        .setDisplaySize(iconSize, iconSize)
        .setDepth(2000);

      (this.backButton as Phaser.GameObjects.Image).on('pointerup', () => {
        let target = targetBackSceneKey || 'MainMenuScene';
        if (this.scene.key === 'PilihModeScene') target = 'MainMenuScene';
        else if (this.scene.key === 'PilihKesulitanScene') target = 'PilihModeScene';
        else if (this.scene.key === 'GameScene') target = 'PilihKesulitanScene';
        else if (this.scene.key === 'ResultsScene') target = 'MainMenuScene';

        this.playSound('sfx_click', { volume: 0.7 });
        if (target === 'PilihKesulitanScene' && (this as any).mode) this.scene.start(target, { mode: (this as any).mode });
        else this.scene.start(target);
      });
    } else {
      const g = this.add.rectangle(pad, pad, iconSize, iconSize, 0x333333).setOrigin(0, 0).setVisible(false).setDepth(2000);
      this.backButton = g;
    }

    this.layoutCommonButtons();
  }

  protected layoutCommonButtons() {
    const { pad, iconSize } = this.getUIIconMetrics();
    this.musicButton?.setPosition(this.scale.width - pad, pad).setDisplaySize(iconSize, iconSize).setDepth(2000);
    this.backButton?.setPosition(pad, pad).setDisplaySize(iconSize, iconSize).setDepth(2000);
  }

  private updateHornIcon() {
    const rt = loadRuntime();
    const textureKey = rt.hornIconMuted ? 'music_off' : 'music_on';
    if (this.musicButton && 'setTexture' in this.musicButton && this.textures.exists(textureKey)) {
      (this.musicButton as Phaser.GameObjects.Image).setTexture(textureKey);
    }
  }

  // Horn logic: ALWAYS toggle icon. Does NOT change settings enable flags.
  private toggleHorn() {
    const settings = readSettings(); // enable flags
    let rt = loadRuntime();

    const musicOn = !!settings.musicOn;
    const sfxOn   = !!settings.sfxOn;

    if (musicOn && sfxOn) {
  // Sebelumnya:
  // const willMute = !(rt.musicRuntimeMuted === false && rt.sfxRuntimeMuted === false);

  // Perbaikan (toggle biner yang benar):
  const nextMute = !(rt.musicRuntimeMuted || rt.sfxRuntimeMuted);

  rt = saveRuntime({
    musicRuntimeMuted: nextMute,
    sfxRuntimeMuted: nextMute,
    hornIconMuted: nextMute
  });

  // Playback music mengikuti hasil runtime
  this.applyMusicRuntime(musicOn, rt.musicRuntimeMuted, settings.musicVol ?? 0.5);

  // Putar klik hanya jika setelah toggle SFX aktif (tidak runtime-mute) dan SFX di Options ON
  if (!rt.sfxRuntimeMuted && sfxOn) {
    this.playSound('sfx_click', { volume: 0.7 });
  }
}
    else if (musicOn && !sfxOn) {
      // Toggle hanya music runtime mute
      const willMute = !rt.musicRuntimeMuted;
      rt = saveRuntime({
        musicRuntimeMuted: willMute,
        hornIconMuted: willMute
      });
      this.applyMusicRuntime(musicOn, rt.musicRuntimeMuted, settings.musicVol ?? 0.5);
      // Tidak ada click sound karena SFX disabled di options
    } else if (!musicOn && sfxOn) {
      // Toggle hanya sfx runtime mute
      const willMute = !rt.sfxRuntimeMuted;
      rt = saveRuntime({
        sfxRuntimeMuted: willMute,
        hornIconMuted: willMute
      });
      // Mainkan click hanya jika hasil akhirnya tidak muted
      if (!rt.sfxRuntimeMuted && sfxOn) {
        this.playSound('sfx_click', { volume: 0.7 });
      }
    } else {
      // Keduanya disabled: hanya toggle ikon
      rt = saveRuntime({ hornIconMuted: !rt.hornIconMuted });
      // No audio changes
    }

    this.updateHornIcon();
  }

  private applyMusicRuntime(enabled: boolean, runtimeMuted: boolean, vol: number) {
    if (!enabled) {
      try { BaseScene.backgroundMusic?.pause(); } catch {}
      return;
    }
    if (!BaseScene.backgroundMusic && this.cache.audio.exists('bgm')) {
      BaseScene.backgroundMusic = this.sound.add('bgm', { loop: true, volume: vol ?? 0.5 });
    }
    if (BaseScene.backgroundMusic) {
      try {
        if (runtimeMuted) {
          if (BaseScene.backgroundMusic.isPlaying) BaseScene.backgroundMusic.pause();
        } else {
          if (!BaseScene.backgroundMusic.isPlaying) {
            try { BaseScene.backgroundMusic.resume(); } catch { BaseScene.backgroundMusic.play(); }
          }
          (BaseScene.backgroundMusic as any)?.setVolume?.(vol ?? 0.5);
        }
      } catch {}
    }
  }

  // Override playSound agar hormati runtime mute SFX
  protected playSound(key: string, config?: Phaser.Types.Sound.SoundConfig) {
    const settings = readSettings();
    const rt = loadRuntime();
    if (!settings.sfxOn) return;
    if (rt.sfxRuntimeMuted) return;
    const vol = (config?.volume ?? 1) * (settings.sfxVol ?? 1);
    try { if (this.cache.audio.exists(key)) this.sound.play(key, { ...config, volume: vol }); } catch {}
  }

  protected handleResize = (gameSize: Phaser.Structs.Size) => {
    if (!this.cameras?.main || !this.scale) return;
    const { width, height } = gameSize;
    this.cameras.main.setViewport(0, 0, width, height);
    const bg = this.children.getByName('background_base') as Phaser.GameObjects.Image | undefined;
    if (bg) bg.setDisplaySize(width, height).setPosition(width / 2, height / 2);
    this.updateCenter();
    this.layoutCommonButtons();
    if (typeof (this as any).draw === 'function') {
      try { (this as any).draw(); } catch (e) { console.warn('draw() on resize failed:', e); }
    }
  };

  protected updateCenter() {
    this.centerX = Math.floor(this.scale.width / 2);
    this.centerY = Math.floor(this.scale.height / 2);
  }

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
