import Phaser from 'phaser';
import { t } from '../lib/i18n';
import { SettingsManager } from '../lib/Settings';

export class BaseScene extends Phaser.Scene {
  protected centerX = 0;
  protected centerY = 0;
  protected panelWidth = 0;
  protected panelLeft = 0;
  protected panelTop = 0;

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
    this.load.image('btn_surrender', 'images/Menyerah.png');
  }


  private getGlobalBgm(): Phaser.Sound.BaseSound | undefined {
    return this.game.registry.get('globalBgm') as
      | Phaser.Sound.BaseSound
      | undefined;
  }

  private setGlobalBgm(bgm: Phaser.Sound.BaseSound | undefined) {
    this.game.registry.set('globalBgm', bgm ?? null);
  }

  protected initAudio() {
    const s = SettingsManager.get();
    if (!s.musicOn) {
      const existing = this.getGlobalBgm();
      existing?.stop();
      this.setGlobalBgm(undefined);
      return;
    }

    let bgm = this.getGlobalBgm();

    if (!bgm || !bgm.scene) {
      bgm = this.sound.add('bgm', {
        loop: true,
        volume: s.musicVol ?? 0.8,
      });
      bgm.play();
      this.setGlobalBgm(bgm);
    } else if (!bgm.isPlaying) {
      bgm.play({ loop: true, volume: s.musicVol ?? 0.8 });
    } else {
      bgm.setVolume(s.musicVol ?? 0.8);
    }
  }

  protected updateAudioSettings() {
    const s = SettingsManager.get();
    let bgm = this.getGlobalBgm();

    if (!s.musicOn) {
      bgm?.stop();
      this.setGlobalBgm(undefined);
    } else {
      if (!bgm || !bgm.scene) {
        bgm = this.sound.add('bgm', {
          loop: true,
          volume: s.musicVol ?? 0.8,
        });
        bgm.play();
        this.setGlobalBgm(bgm);
      } else {
        bgm.setVolume(s.musicVol ?? 0.8);
      }
    }
  }

  protected playSound(key: string) {
    const s = SettingsManager.get();
    if (!s.sfxOn) return;
    this.sound.play(key, { volume: s.sfxVol ?? 1 });
  }

  // ====== LIFECYCLE ===================================================

  create() {
    // background putih di semua scene
    this.cameras.main.setBackgroundColor('#ffffff');

    this.centerX = this.scale.width / 2;
    this.centerY = this.scale.height / 2;
    this.panelWidth = Math.min(this.scale.width * 0.92, 420);
    this.panelLeft = this.centerX - this.panelWidth / 2;
    this.panelTop = Math.round(this.scale.height * 0.14); // area konten di bawah title

    // Default header: title text + underline
    this.createTitleArea();
    this.createBackIcon();
    this.initAudio();
    this.draw();

    this.scale.on('resize', () => {
      this.centerX = this.scale.width / 2;
      this.centerY = this.scale.height / 2;
      this.panelWidth = Math.min(this.scale.width * 0.92, 420);
      this.panelLeft = this.centerX - this.panelWidth / 2;
      this.panelTop = Math.round(this.scale.height * 0.14);
      this.draw();
    });

    // JANGAN stop/destroy BGM di shutdown, karena kita pakai BGM global
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      // tempat yang bagus untuk bersih-bersih umum (timer, input) di scene turunan
    });
  }

  // ====== HEADER ======================================================

  protected createTitleArea() {
    const base = Math.min(this.scale.width, this.scale.height);
    const titleSize = Math.max(20, Math.round(base * 0.06));
    const titleY = this.scale.height * 0.10;

    this.titleText = this.add
      .text(this.centerX, titleY, '', {
        fontFamily: 'Nunito',
        fontSize: `${titleSize}px`,
        color: '#000000',
      })
      .setOrigin(0.5);

    const underlineY = titleY + Math.round(base * 0.06);
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

  /** Header khusus main menu: logo besar + title di bawahnya */
  protected createCenteredLogoTitleArea() {
    const base = Math.min(this.scale.width, this.scale.height);
    const targetHeight = Math.round(base * 0.18);
    const logoY = this.scale.height * 0.16;

    // Pakai scale agar rasio logo tidak gepeng
    const logo = this.add.image(this.centerX, logoY, 'logo').setOrigin(0.5);
    const originalHeight = logo.height || 1;
    const scale = targetHeight / originalHeight;
    logo.setScale(scale);

    const titleSize = Math.max(22, Math.round(base * 0.065));
    const titleY = logoY + targetHeight * 0.75;

    this.titleText = this.add
      .text(this.centerX, titleY, '', {
        fontFamily: 'Nunito',
        fontSize: `${titleSize}px`,
        color: '#000000',
      })
      .setOrigin(0.5);

    const underlineY = titleY + Math.round(base * 0.05);
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
    const size = Math.round(Math.min(this.scale.width, this.scale.height) * 0.08);
    const iconX = this.scale.width * 0.08;
    const iconY = this.scale.height * 0.06;

    this.backIcon = this.add
      .image(iconX, iconY, 'back_arrow')
      .setDisplaySize(size, size)
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

  // ====== PILL BUTTONS ===============================================

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

  protected layoutPillsCentered(
    containers: Phaser.GameObjects.Container[],
    buttonHeight: number,
    gap: number,
  ) {
    const contentTop = this.getContentAreaTop();
    const contentH = this.getContentAreaHeight();
    const n = containers.length;
    const total = n > 0 ? n * buttonHeight + (n - 1) * gap : 0;
    const startCenter =
      contentTop + (contentH - total) / 2 + buttonHeight / 2;

    const widthPx = Math.round(this.panelWidth * 0.86);
    const radius = Math.min(24, Math.floor(buttonHeight * 0.45));

    let yCenter = startCenter;
    for (const c of containers) {
      if (!c || !c.scene) continue;

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

  // Scene turunan override ini untuk layout ulang ketika resize
  public draw() {}
}
