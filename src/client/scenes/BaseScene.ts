import Phaser from 'phaser';
import { SettingsManager } from '../lib/Settings';

export class BaseScene extends Phaser.Scene {
  protected centerX!: number;
  protected centerY!: number;

  // Panel tengah dengan gutter abu-abu
  protected panelWidth = 0;
  protected panelLeft = 0;
  protected panelTop = 0;
  protected panelHeight = 0;

  // Header: back di kiri atas canvas, judul di area atas panel
  protected backIcon?: Phaser.GameObjects.Image;
  protected titleText?: Phaser.GameObjects.Text;

  private gutterLeftRect?: Phaser.GameObjects.Rectangle | null;
  private gutterRightRect?: Phaser.GameObjects.Rectangle | null;
  private cardRect?: Phaser.GameObjects.Rectangle | null;

  protected static bgm: Phaser.Sound.BaseSound | null = null;
  protected static audioContextResumed = false;

  private resizeHandlerBound?: (size: Phaser.Structs.Size) => void;

  constructor(sceneKey: string) { super(sceneKey); }

  preload() {
    this.load.image('logo', 'assets/Images/Asset 7.png');
    this.load.image('back_arrow', 'assets/Images/Back.png');
    this.load.audio('bgm', 'assets/Sounds/Backsound.wav');
    this.load.audio('sfx_click', 'assets/Sounds/Click.mp3');
    this.load.audio('sfx_correct', 'assets/Sounds/Correct.mp3');
    this.load.audio('sfx_incorrect', 'assets/Sounds/Wrong.mp3');
  }

  create() {
    this.cameras.main.setBackgroundColor(0xffffff);
    this.centerX = Math.floor(this.scale.width / 2);
    this.centerY = Math.floor(this.scale.height / 2);

    this.computePanel();
    this.redrawPanel();
    this.ensureBackIcon(true);

    if (!BaseScene.audioContextResumed) {
      this.input.once(Phaser.Input.Events.POINTER_DOWN, async () => {
        const ctx = (this.sound as any)?.context;
        try { await ctx?.resume?.(); } catch {}
        BaseScene.audioContextResumed = true;
        this.updateAudioSettings();
      });
    } else {
      this.updateAudioSettings();
    }

    if (this.resizeHandlerBound) {
      this.scale.off(Phaser.Scale.Events.RESIZE, this.resizeHandlerBound as any, this);
    }
    this.resizeHandlerBound = this.onResize.bind(this) as any;
    this.scale.on(Phaser.Scale.Events.RESIZE, this.resizeHandlerBound as any, this);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.detachAll());
    this.events.once(Phaser.Scenes.Events.DESTROY, () => this.detachAll());
  }

  // Title dipusatkan di area atas panel (sekitar 31.25% tinggi panel digunakan untuk header + judul)
  protected setTitle(text: string) {
    const headerAreaHeight = Math.round(this.panelHeight * 0.3125);
    const y = this.panelTop + Math.min(headerAreaHeight - 20, 20);
    if (!this.titleText) {
      this.titleText = this.add.text(this.centerX, y, text, { fontFamily: 'Nunito', fontSize: '20px', color: '#000' })
        .setOrigin(0.5).setDepth(4);
    } else {
      this.titleText.setText(text).setPosition(this.centerX, y);
    }
  }

  protected ensureBackIcon(visible: boolean) {
    const x = this.panelLeft + 16;
    const y = this.panelTop + 16;
    if (!this.backIcon) {
      this.backIcon = this.add.image(x, y, 'back_arrow').setOrigin(0, 0).setDepth(5).setInteractive({ useHandCursor: true });
      const target = 20; const scale = target / Math.max(1, this.backIcon.height);
      this.backIcon.setScale(scale);
      this.backIcon.on('pointerup', () => this.scene.start('MainMenuScene'));
    } else {
      this.backIcon.setPosition(x, y);
    }
    this.backIcon.setVisible(visible);
  }
  protected hideBackIcon() { this.backIcon?.setVisible(false); }

  protected computePanel() {
    const minPanelW = Math.min(this.scale.width, 320);
    this.panelWidth = Math.max(minPanelW, Math.round(this.scale.width * 0.86));
    this.panelLeft = Math.max(0, Math.round((this.scale.width - this.panelWidth) / 2));
    this.panelTop = 12;
    this.panelHeight = Math.max(160, this.scale.height - this.panelTop);
  }

  protected redrawPanel() {
    try { this.gutterLeftRect?.destroy(); } catch {} this.gutterLeftRect = null;
    try { this.gutterRightRect?.destroy(); } catch {} this.gutterRightRect = null;
    try { this.cardRect?.destroy(); } catch {} this.cardRect = null;

    const leftW = Math.max(0, this.panelLeft);
    const rightW = Math.max(0, this.scale.width - (this.panelLeft + this.panelWidth));

    this.gutterLeftRect = this.add.rectangle(0, this.panelTop, Math.max(1, leftW), this.panelHeight, 0xf0f0f0).setOrigin(0, 0).setDepth(1);
    this.gutterRightRect = this.add.rectangle(this.panelLeft + this.panelWidth, this.panelTop, Math.max(1, rightW), this.panelHeight, 0xf0f0f0).setOrigin(0, 0).setDepth(1);
    this.cardRect = this.add.rectangle(this.panelLeft, this.panelTop, Math.max(1, this.panelWidth), this.panelHeight, 0xffffff).setOrigin(0, 0).setDepth(2);
  }

  protected drawBigLogoCentered(targetHeightPx = 160, marginBottomPx = 24) {
    if (!this.textures.exists('logo')) return this.panelTop + marginBottomPx;
    const existing = this.children.getByName('__biglogo__') as Phaser.GameObjects.Image | null;
    let img = existing;
    if (!img) {
      img = this.add.image(this.centerX, this.panelTop + targetHeightPx / 2 + 8, 'logo').setOrigin(0.5, 0.5).setDepth(3);
      (img as any).name = '__biglogo__';
    }
    img.setPosition(this.centerX, this.panelTop + targetHeightPx / 2 + 8);
    const scale = targetHeightPx / Math.max(1, img.height);
    img.setScale(scale);
    return img.y + targetHeightPx / 2 + marginBottomPx;
  }

  protected createWidePill(label: string, onClick: () => void, widthRatio = 0.86, heightPx = 56) {
    const widthPx = Math.round(this.panelWidth * widthRatio);
    const radius = Math.min(24, Math.floor(heightPx * 0.45));
    const c = this.add.container(0, 0).setDepth(4);

    const g = this.add.graphics();
    this.updateButtonGraphics(g, widthPx, heightPx, 0xffffff, 0x000000, 2, radius);

    const txt = this.add.text(0, 0, label, {
      fontFamily: 'Nunito', fontSize: `${Math.max(16, Math.floor(heightPx * 0.45))}px`,
      color: '#000', align: 'center', wordWrap: { width: Math.floor(widthPx * 0.9) }
    }).setOrigin(0.5);

    const zone = this.add.zone(0, 0, widthPx, heightPx).setOrigin(0.5).setInteractive({ useHandCursor: true });
    zone.on('pointerup', () => onClick());

    (c as any).width = widthPx; (c as any).height = heightPx;
    c.add([g, txt, zone]);
    return c;
  }

  protected ensureGraphicsInContainer(
    c: Phaser.GameObjects.Container,
    width: number,
    height: number,
    radius: number,
    fill = 0xffffff,
    stroke = 0x000000,
    lineW = 2
  ): Phaser.GameObjects.Graphics {
    let g = c.getAt(0) as Phaser.GameObjects.Graphics | undefined;
    if (!(g instanceof Phaser.GameObjects.Graphics)) {
      g = this.add.graphics();
      c.addAt(g, 0);
    }
    this.updateButtonGraphics(g, width, height, fill, stroke, lineW, radius);
    return g;
  }

  protected updateButtonGraphics(
    g: Phaser.GameObjects.Graphics | undefined,
    width: number,
    height: number,
    fill: number,
    stroke: number,
    lineW: number,
    radius = Math.min(24, Math.floor(height * 0.45))
  ) {
    if (!g || typeof g.clear !== 'function') return;
    g.clear();
    g.lineStyle(lineW, stroke, 1).fillStyle(fill, 1);
    g.fillRoundedRect(-width / 2, -height / 2, width, height, radius);
    g.strokeRoundedRect(-width / 2, -height / 2, width, height, radius);
  }

  protected updateAudioSettings() {
    const s = SettingsManager.get();
    try {
      if (!BaseScene.bgm) BaseScene.bgm = this.sound.add('bgm', { loop: true, volume: (s.musicVol ?? 1) * (s.musicOn ? 1 : 0) });
      (BaseScene.bgm as any)?.setVolume?.((s.musicVol ?? 1) * (s.musicOn ? 1 : 0));
      const playing = (BaseScene.bgm as any)?.isPlaying;
      if (s.musicOn && !playing) (BaseScene.bgm as any)?.play?.();
      if (!s.musicOn && playing) (BaseScene.bgm as any)?.pause?.();
    } catch {}
  }

  protected playSound(key: string, cfg?: any) {
    const s = SettingsManager.get();
    if (!s.sfxOn) return;
    const vol = (s.sfxVol ?? 1);
    if (key === 'sfx_correct' || key === 'sfx_incorrect') return; // hindari spam log
    try { this.sound.play(key, { volume: vol, ...cfg }); } catch {}
  }

  private onResize(_size: Phaser.Structs.Size) {
    this.centerX = Math.floor(this.scale.width / 2);
    this.centerY = Math.floor(this.scale.height / 2);
    this.computePanel();
    this.redrawPanel();
    this.ensureBackIcon(this.backIcon?.visible ?? true);
    if (this.titleText) this.setTitle(this.titleText.text);
    this.draw();
  }

  private detachAll() {
    try { if (this.resizeHandlerBound) this.scale.off(Phaser.Scale.Events.RESIZE, this.resizeHandlerBound as any, this); } catch {}
    this.resizeHandlerBound = undefined;
    try { this.gutterLeftRect?.destroy(); } catch {} this.gutterLeftRect = null;
    try { this.gutterRightRect?.destroy(); } catch {} this.gutterRightRect = null;
    try { this.cardRect?.destroy(); } catch {} this.cardRect = null;
  }

  public draw() {}
}
