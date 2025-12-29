import Phaser from 'phaser';
import { t } from '../lib/i18n';
import { SettingsManager } from '../lib/Settings';

export class BaseScene extends Phaser.Scene {
  protected centerX = 0;
  protected centerY = 0;
  protected panelWidth = 0;

  protected titleText?: Phaser.GameObjects.Text;
  protected titleUnderline?: Phaser.GameObjects.Line;
  protected backIcon?: Phaser.GameObjects.Image;
  private bgm?: Phaser.Sound.BaseSound;

  constructor(sceneKey: string) {
    super(sceneKey);
  }

  preload() {
    this.load.image('logo', 'assets/Images/Logo.png');
    this.load.image('back_arrow', 'assets/Images/Back.png');
    this.load.audio('bgm', 'assets/Sounds/Backsound.wav');
    this.load.audio('sfx_click', 'assets/Sounds/Click.mp3');
  }

  create() {
    // Pastikan background putih di semua scene
    this.cameras.main.setBackgroundColor('#ffffff');

    this.centerX = this.scale.width / 2;
    this.centerY = this.scale.height / 2;
    this.panelWidth = Math.min(this.scale.width * 0.92, 420);

    // Default: title area tanpa logo besar
    this.createTitleArea();
    this.createBackIcon();
    this.initAudio();
    this.draw();

    this.scale.on('resize', () => {
      this.centerX = this.scale.width / 2;
      this.centerY = this.scale.height / 2;
      this.panelWidth = Math.min(this.scale.width * 0.92, 420);
      this.draw();
    });
  }

  /**
   * Default header: hanya title text di tengah + garis bawah, TANPA logo besar.
   * Scene lain (selain MainMenu) akan pakai ini.
   */
  protected createTitleArea() {
    const titleSize = Math.max(
      20,
      Math.round(Math.min(this.scale.width, this.scale.height) * 0.06),
    );
    const titleY = this.scale.height * 0.12;

    this.titleText = this.add
      .text(this.centerX, titleY, '', {
        fontFamily: 'Nunito',
        fontSize: `${titleSize}px`,
        color: '#000000',
      })
      .setOrigin(0.5);

    const underlineY =
      titleY + Math.round(Math.min(this.scale.width, this.scale.height) * 0.06);
    this.titleUnderline = this.add
      .line(
        this.centerX,
        underlineY,
        -this.panelWidth / 2,
        0,
        this.panelWidth / 2,
        0,
        0xe0e0e0,
      )
      .setLineWidth(1, 1);
  }

  /**
   * Header khusus untuk MainMenu: logo besar di tengah atas + title di bawahnya.
   */
  protected createCenteredLogoTitleArea() {
    const logoSize = Math.round(Math.min(this.scale.width, this.scale.height) * 0.18);
    const logoY = this.scale.height * 0.16;

    this.add
      .image(this.centerX, logoY, 'logo')
      .setDisplaySize(logoSize, logoSize)
      .setOrigin(0.5);

    const titleSize = Math.max(
      22,
      Math.round(Math.min(this.scale.width, this.scale.height) * 0.065),
    );
    const titleY = logoY + logoSize * 0.75;

    this.titleText = this.add
      .text(this.centerX, titleY, '', {
        fontFamily: 'Nunito',
        fontSize: `${titleSize}px`,
        color: '#000000',
      })
      .setOrigin(0.5);

    const underlineY =
      titleY + Math.round(Math.min(this.scale.width, this.scale.height) * 0.05);
    this.titleUnderline = this.add
      .line(
        this.centerX,
        underlineY,
        -this.panelWidth / 2,
        0,
        this.panelWidth / 2,
        0,
        0xe0e0e0,
      )
      .setLineWidth(1, 1);
  }

  protected createBackIcon() {
    const iconSize = Math.round(Math.min(this.scale.width, this.scale.height) * 0.08);
    const iconX = this.scale.width * 0.08;
    const iconY = this.scale.height * 0.06;

    this.backIcon = this.add
      .image(iconX, iconY, 'back_arrow')
      .setDisplaySize(iconSize, iconSize)
      .setOrigin(0, 0.5)
      .setVisible(false)
      .setInteractive({ useHandCursor: true });

    this.backIcon.on('pointerup', () => {
      this.playSound('sfx_click');
      this.scene.start('MainMenuScene');
    });
  }

  protected setTitle(text: string) {
    this.titleText?.setText(text);
  }

  protected ensureBackIcon(visible: boolean) {
    this.backIcon?.setVisible(visible);
  }

  protected getContentAreaTop() {
    if (!this.titleUnderline) return this.scale.height * 0.18;
    return this.titleUnderline.y + Math.round(this.scale.height * 0.02);
  }

  protected getContentAreaHeight() {
    return (
      this.scale.height -
      this.getContentAreaTop() -
      Math.round(this.scale.height * 0.04)
    );
  }

  protected createWidePill(
    label: string,
    onTap: () => void,
    widthFactor: number,
    heightPx: number,
  ): Phaser.GameObjects.Container {
    const widthPx = Math.round(this.panelWidth * widthFactor);
    const c = this.add.container(0, 0);

    const radius = Math.min(24, Math.floor(heightPx * 0.45));
    const g = this.add.graphics();
    g.lineStyle(2, 0x000000, 1);
    g.fillStyle(0xffffff, 1);
    g.fillRoundedRect(-widthPx / 2, -heightPx / 2, widthPx, heightPx, radius);
    g.strokeRoundedRect(-widthPx / 2, -heightPx / 2, widthPx, heightPx, radius);

    const fontSizePx = Math.max(16, Math.floor(heightPx * 0.42));
    const txt = this.add
      .text(0, 0, label, {
        fontFamily: 'Nunito',
        fontSize: `${fontSizePx}px`,
        color: '#000000',
        align: 'center',
      })
      .setOrigin(0.5);

    const zone = this.add
      .zone(0, 0, widthPx, heightPx)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    zone.on('pointerup', () => onTap());

    c.add([g, txt, zone]);
    return c;
  }

  // Versi AMAN: tidak memanggil setSize pada null
  protected layoutPillsCentered(
    containers: Phaser.GameObjects.Container[],
    buttonHeight: number,
    gap: number,
  ) {
    const contentTop = this.getContentAreaTop();
    const contentH = this.getContentAreaHeight();
    const n = containers.length;
    const total = n > 0 ? n * buttonHeight + (n - 1) * gap : 0;
    const startCenter = contentTop + (contentH - total) / 2 + buttonHeight / 2;

    const widthPx = Math.round(this.panelWidth * 0.86);
    const radius = Math.min(24, Math.floor(buttonHeight * 0.45));

    let yCenter = startCenter;
    for (const c of containers) {
      if (!c || !c.scene) continue; // sudah di-destroy

      c.setPosition(this.centerX, Math.round(yCenter));
      (c as any).height = buttonHeight;
      (c as any).width = widthPx;

      this.ensureGraphicsInContainer(
        c,
        widthPx,
        buttonHeight,
        radius,
        0xffffff,
        0x000000,
        2,
      );

      const zone = c.getAt(2) as Phaser.GameObjects.Zone | null | undefined;
      if (zone && typeof (zone as any).setSize === 'function') {
        zone.setSize(widthPx, buttonHeight);
      }

      yCenter += buttonHeight + gap;
    }
  }

  protected ensureGraphicsInContainer(
    c: Phaser.GameObjects.Container,
    widthPx: number,
    heightPx: number,
    radius: number,
    fillColor: number,
    strokeColor: number,
    strokeWidth: number,
  ) {
    let g = c.getAt(0) as Phaser.GameObjects.Graphics | null;
    if (!g || !(g instanceof Phaser.GameObjects.Graphics)) {
      g = this.add.graphics();
      c.addAt(g, 0);
    }
    g.clear();
    g.lineStyle(strokeWidth, strokeColor, 1);
    g.fillStyle(fillColor, 1);
    g.fillRoundedRect(-widthPx / 2, -heightPx / 2, widthPx, heightPx, radius);
    g.strokeRoundedRect(-widthPx / 2, -heightPx / 2, widthPx, heightPx, radius);
  }

  protected initAudio() {
    const s = SettingsManager.get();
    if (s.musicOn) {
      this.bgm = this.sound.add('bgm', { loop: true, volume: s.musicVol ?? 0.8 });
      this.bgm.play();
    }
  }

  protected playSound(key: string) {
    const s = SettingsManager.get();
    if (!s.sfxOn) return;
    this.sound.play(key, { volume: s.sfxVol ?? 1 });
  }

  protected updateAudioSettings() {
    const s = SettingsManager.get();
    if (!s.musicOn) {
      this.bgm?.stop();
      this.bgm?.destroy();
      this.bgm = undefined;
    } else if (!this.bgm) {
      this.bgm = this.sound.add('bgm', { loop: true, volume: s.musicVol ?? 0.8 });
      this.bgm.play();
    } else {
      this.bgm.setVolume(s.musicVol ?? 0.8);
    }
  }

  // Scene turunan override ini untuk layout ulang ketika resize
  public draw() {}
}
