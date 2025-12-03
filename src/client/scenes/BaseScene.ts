import Phaser from 'phaser';
import { SettingsManager } from '../lib/Settings';

export class BaseScene extends Phaser.Scene {
  protected centerX!: number;
  protected centerY!: number;

  protected backButton!: Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle | undefined;
  protected sceneContentGroup!: Phaser.GameObjects.Group;

  protected static backgroundMusic: Phaser.Sound.BaseSound | null = null;

  private settingsUnsub?: () => void;

  constructor() {
    // Beri key unik agar TIDAK pernah “default”
    super('BaseScene');
  }

  preload() {
    this.load.image('background', 'assets/Images/Asset 8.png');
    this.load.image('logo', 'assets/Images/Asset 7.png');
    this.load.image('back_arrow', 'assets/Images/Back.png');
    this.load.audio('bgm', 'assets/Sounds/Backsound.wav');
    this.load.audio('sfx_click', 'assets/Sounds/Click.mp3');
    this.load.audio('sfx_correct', 'assets/Sounds/Correct.mp3');
    this.load.audio('sfx_incorrect', 'assets/Sounds/Wrong.mp3');
  }

  create() {
    this.centerX = Math.floor(this.scale.width / 2);
    this.centerY = Math.floor(this.scale.height / 2);

    if (!this.sceneContentGroup) {
      this.sceneContentGroup = this.add.group();
    }

    // latar
    const bg = this.add.image(this.centerX, this.centerY, 'background').setName('background_base');
    const s = Math.max(this.scale.width, this.scale.height) / Math.max(bg.width, bg.height);
    bg.setDisplaySize(bg.width * s, bg.height * s);

    // tombol kembali (default disediakan, scene tertentu bisa menyembunyikan/menghapusnya)
    this.backButton = this.createBackButton();

    // dengarkan perubahan Settings bila diperlukan
    this.settingsUnsub = SettingsManager.subscribe(() => {
      // scene turunannya bisa override
      this.draw();
    });

    // musik latar global
    if (!BaseScene.backgroundMusic) {
      BaseScene.backgroundMusic = this.sound.add('bgm', { loop: true, volume: 0.4 });
      BaseScene.backgroundMusic.play();
    }
  }

  protected createBackButton() {
    const w = Math.max(40, Math.round(this.scale.height * 0.06));
    const btn = this.add.image(Math.round(this.scale.width * 0.08), 50, 'back_arrow')
      .setName('back_button')
      .setOrigin(0.5)
      .setDisplaySize(w, w)
      .setInteractive({ useHandCursor: true });

    btn.on('pointerup', () => {
      this.playSound('sfx_click', { volume: 0.7 });
      this.scene.start('MainMenuScene');
    });
    return btn;
  }

  protected updateCenter() {
    this.centerX = Math.floor(this.scale.width / 2);
    this.centerY = Math.floor(this.scale.height / 2);
  }

  public draw() {
    // Scene turunannya override ini untuk layout responsif
  }

  protected playSound(key: string, cfg?: Phaser.Types.Sound.SoundManagerPlayOptions) {
    try { this.sound.play(key, cfg); } catch {}
  }

  protected updateButtonGraphics(
    g: Phaser.GameObjects.Graphics,
    width: number,
    height: number,
    fill: number,
    stroke: number,
    lineW: number,
    radius = Math.min(24, Math.floor(height * 0.35))
  ) {
    g.clear();
    g.lineStyle(lineW, stroke, 1).fillStyle(fill, 1);
    g.fillRoundedRect(-width / 2, -height / 2, width, height, radius);
    g.strokeRoundedRect(-width / 2, -height / 2, width, height, radius);
  }

  public override shutdown() {
    try { this.settingsUnsub?.(); } catch {}
  }
}
