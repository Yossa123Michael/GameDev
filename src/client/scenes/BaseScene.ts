import Phaser from 'phaser';
import { SettingsManager } from '../lib/Settings';

export class BaseScene extends Phaser.Scene {
  protected centerX!: number;
  protected centerY!: number;

  protected panelWidth = 0;
  protected panelLeft = 0;
  protected panelTop = 0;
  protected panelHeight = 0;

  protected backIcon?: Phaser.GameObjects.Image;
  protected titleText?: Phaser.GameObjects.Text;
  private headerDividerGfx: Phaser.GameObjects.Graphics | null = null;

  private cardRect: Phaser.GameObjects.Rectangle | null = null;

  protected static bgm: Phaser.Sound.BaseSound | null = null;
  protected static audioContextResumed = false;

  private resizeHandlerBound: ((size: Phaser.Structs.Size) => void) | undefined;

  constructor(sceneKey: string) { super(sceneKey); }

  preload() {
    this.load.image('logo', 'assets/Images/Logo.png');
    this.load.image('back_arrow', 'assets/Images/Back.png');
    this.load.audio('bgm', 'assets/Sounds/Backsound.wav');
    this.load.audio('sfx_click', 'assets/Sounds/Click.mp3');
    // Jangan load correct/incorrect untuk mencegah error decode jika aset belum valid
    // this.load.audio('sfx_correct', 'assets/Sounds/Correct.mp3');
    // this.load.audio('sfx_incorrect', 'assets/Sounds/Wrong.mp3');
  }

  protected getHeaderRatio() {
    const key = this.sys.settings.key as string;
    return key === 'MainMenuScene' ? 0.3125 : 0.25;
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

  protected getHeaderAreaHeight() { return Math.round(this.panelHeight * this.getHeaderRatio()); }
  protected getHeaderCenterY() { return this.panelTop + Math.round(this.getHeaderAreaHeight() / 2); }
  protected getContentAreaTop() { return this.panelTop + this.getHeaderAreaHeight(); }
  protected getContentAreaHeight() { return this.panelHeight - this.getHeaderAreaHeight(); }

  // Safe setTitle: tangani error drawImage/null dengan retry
  protected setTitle(text: string, attempt = 0) {
    const y = this.getHeaderCenterY();
    const fontSize = Math.max(24, Math.round(Math.min(this.scale.width, this.scale.height) * 0.055));
    try {
      if (!this.titleText) {
        this.titleText = this.add.text(this.centerX, y, text, { fontFamily: 'Nunito', fontSize: `${fontSize}px`, color: '#000' })
          .setOrigin(0.5).setDepth(900);
      } else {
        this.titleText.setText(text).setPosition(this.centerX, y).setStyle({ fontSize: `${fontSize}px` });
      }
      this.drawHeaderDivider();
    } catch (err) {
      // Jika WebGL context/font belum siap, coba lagi sebentar
      if (attempt < 5) {
        this.time.delayedCall(50, () => this.setTitle(text, attempt + 1));
      } else {
        // fallback: buat baru
        try { this.titleText?.destroy(); } catch {}
        this.titleText = this.add.text(this.centerX, y, text, { fontFamily: 'Nunito', fontSize: `${fontSize}px`, color: '#000' })
          .setOrigin(0.5).setDepth(900);
        this.drawHeaderDivider();
      }
    }
  }

  protected drawHeaderDivider() {
    const leftX = this.panelLeft + 12;
    const rightX = this.panelLeft + this.panelWidth - 12;
    const y = this.getContentAreaTop();

    if (!this.headerDividerGfx) {
      this.headerDividerGfx = this.add.graphics().setDepth(850);
    }
    const g = this.headerDividerGfx;
    g.clear();
    g.lineStyle(2, 0xdddddd, 1);
    g.beginPath();
    g.moveTo(leftX, y);
    g.lineTo(rightX, y);
    g.strokePath();
  }

  protected ensureBackIcon(visible: boolean) {
    const x = this.panelLeft + 16;
    const y = this.panelTop + 16;
    const target = Math.max(28, Math.round(Math.min(this.scale.width, this.scale.height) * 0.06));
    try {
      if (!this.backIcon) {
        this.backIcon = this.add.image(x, y, 'back_arrow')
          .setOrigin(0, 0)
          .setDepth(3000)
          .setInteractive({ useHandCursor: true });
        const scale = target / Math.max(1, this.backIcon.height);
        this.backIcon.setScale(scale);
        this.backIcon.on('pointerup', () => this.scene.start('MainMenuScene'));
      } else {
        this.backIcon.setPosition(x, y);
        const scale = target / Math.max(1, this.backIcon.height);
        this.backIcon.setScale(scale);
        this.backIcon.setDepth(3000);
      }
      this.backIcon.setVisible(visible);
    } catch {
      // Retry jika context belum siap
      this.time.delayedCall(50, () => this.ensureBackIcon(visible));
    }
  }
  protected hideBackIcon() { this.backIcon?.setVisible(false); }

  protected computePanel() {
    // Full putih: panel = seluruh canvas
    this.panelLeft = 0;
    this.panelTop = 0;
    this.panelWidth = this.scale.width;
    this.panelHeight = this.scale.height;
  }

  protected redrawPanel() {
    try { this.cardRect?.destroy(); } catch {} this.cardRect = null;
    this.cardRect = this.add.rectangle(0, 0, Math.max(1, this.scale.width), Math.max(1, this.scale.height), 0xffffff)
      .setOrigin(0, 0).setDepth(200);
  }

  protected drawLogoInHeader(preferredHeight = 160, marginTop = 12) {
    if (!this.textures.exists('logo')) return;
    const headerH = this.getHeaderAreaHeight();
    const availableH = Math.max(10, headerH - marginTop - 12);
    const scaled = Math.max(120, Math.round(Math.min(this.scale.width, this.scale.height) * 0.22));
    const finalH = Math.min(preferredHeight, availableH, scaled);

    let img = this.children.getByName('__biglogo__') as Phaser.GameObjects.Image | null;
    if (!img) {
      img = this.add.image(this.centerX, 0, 'logo').setOrigin(0.5).setDepth(800);
      (img as any).name = '__biglogo__';
    }
    const scale = finalH / Math.max(1, img.height);
    img.setScale(scale);
    const y = this.panelTop + marginTop + finalH / 2;
    img.setPosition(this.centerX, y);

    this.drawHeaderDivider();
  }

  protected createWidePill(label: string, onClick: () => void, widthRatio = 0.86, heightPx = 56) {
    const widthPx = Math.round(this.panelWidth * widthRatio);
    const radius = Math.min(24, Math.floor(heightPx * 0.45));
    const c = this.add.container(0, 0).setDepth(400);

    const g = this.add.graphics();
    this.updateButtonGraphics(g, widthPx, heightPx, 0xffffff, 0x000000, 2, radius);

    const txtSize = Math.max(16, Math.floor(heightPx * 0.45));
    const txt = this.add.text(0, 0, label, {
      fontFamily: 'Nunito', fontSize: `${txtSize}px`,
      color: '#000', align: 'center', wordWrap: { width: Math.floor(widthPx * 0.9) }
    }).setOrigin(0.5);

    const zone = this.add.zone(0, 0, widthPx, heightPx).setOrigin(0.5).setInteractive({ useHandCursor: true });
    zone.on('pointerup', () => onClick());

    (c as any).width = widthPx; (c as any).height = heightPx;
    c.add([g, txt, zone]);
    return c;
  }

  protected layoutPillsCentered(containers: Phaser.GameObjects.Container[], buttonHeight: number, gap: number) {
    const contentTop = this.getContentAreaTop();
    const contentH = this.getContentAreaHeight();
    const n = containers.length;
    const total = n > 0 ? n * buttonHeight + (n - 1) * gap : 0;
    const startCenter = contentTop + (contentH - total) / 2 + buttonHeight / 2;

    const widthPx = Math.round(this.panelWidth * 0.86);
    const radius = Math.min(24, Math.floor(buttonHeight * 0.45));

    let yCenter = startCenter;
    for (const c of containers) {
      c.setPosition(this.centerX, Math.round(yCenter));
      (c as any).height = buttonHeight; (c as any).width = widthPx;
      this.ensureGraphicsInContainer(c, widthPx, buttonHeight, radius, 0xffffff, 0x000000, 2);
      (c.getAt(2) as Phaser.GameObjects.Zone | undefined)?.setSize(widthPx, buttonHeight);
      yCenter += buttonHeight + gap;
    }
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
    if (key === 'sfx_correct' || key === 'sfx_incorrect') return;
    try { this.sound.play(key, { volume: (s.sfxVol ?? 1), ...cfg }); } catch {}
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
    try { this.cardRect?.destroy(); } catch {} this.cardRect = null;
    try { this.headerDividerGfx?.destroy(); } catch {} this.headerDividerGfx = null;
  }

  public draw() {}
}
