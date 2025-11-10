import { BaseScene } from './BaseScene';

type GraphicsQuality = 'normal' | 'low';
type LanguageCode = 'en';

type Options = {
  musicOn: boolean;
  musicVol: number; // 0..1
  sfxOn: boolean;
  sfxVol: number;   // 0..1
  graphics: GraphicsQuality;
  language: LanguageCode; // EN sementara
  vibration: boolean;
  version: 'global';
};

const LS_KEY = 'rk:settings';

function clamp01(x: number) {
  if (!isFinite(x as any)) return 0;
  return Math.max(0, Math.min(1, Number(x)));
}

function loadOptions(): Options {
  const def: Options = {
    musicOn: true,
    musicVol: 0.8,
    sfxOn: true,
    sfxVol: 1,
    graphics: 'normal',
    language: 'en',
    vibration: true,
    version: 'global',
  };
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return def;
    const parsed = JSON.parse(raw);
    const opt = { ...def, ...parsed } as Options;
    opt.musicVol = clamp01(opt.musicVol);
    opt.sfxVol = clamp01(opt.sfxVol);
    return opt;
  } catch {
    return def;
  }
}

function saveOptions(next: Partial<Options>) {
  const cur = loadOptions();
  const merged: Options = { ...cur, ...next };
  merged.musicVol = clamp01(merged.musicVol);
  merged.sfxVol = clamp01(merged.sfxVol);
  try { localStorage.setItem(LS_KEY, JSON.stringify(merged)); } catch {}
  return merged;
}

export class OptionScene extends BaseScene {
  private title?: Phaser.GameObjects.Text;

  private musicToggle?: Phaser.GameObjects.Container;
  private sfxToggle?: Phaser.GameObjects.Container;

  private musicSlider?: Phaser.GameObjects.Container;
  private sfxSlider?: Phaser.GameObjects.Container;

  private qualityNormal?: Phaser.GameObjects.Container;
  private qualityLow?: Phaser.GameObjects.Container;

  private langText?: Phaser.GameObjects.Text;

  private vibrateToggle?: Phaser.GameObjects.Container;

  private resetBtn?: Phaser.GameObjects.Container;
  private confirmBox?: Phaser.GameObjects.Container;

  private versionText?: Phaser.GameObjects.Text;

  private opts: Options = loadOptions();

  constructor() {
    super('OptionScene');
  }

  public override create() {
    super.create();
    super.createCommonButtons('MainMenuScene');
    this.applyOptions(this.opts);

    // Title
    this.title = this.add.text(this.centerX, 90, 'Options', {
      fontFamily: 'Nunito', fontSize: '36px', color: '#000'
    }).setOrigin(0.5);
    this.sceneContentGroup.add(this.title);

    let y = 150;

    // MUSIC toggle
    this.musicToggle = this.createToggle(y, `Music: ${this.opts.musicOn ? 'On' : 'Off'}`, this.opts.musicOn, (v) => {
      this.opts = saveOptions({ musicOn: v });
      this.updateToggleLabel(this.musicToggle!, `Music: ${v ? 'On' : 'Off'}`);
      this.applyOptions(this.opts);
    });
    if (this.musicToggle) this.sceneContentGroup.add(this.musicToggle);
    y += 60;

    // SFX toggle
    this.sfxToggle = this.createToggle(y, `SFX: ${this.opts.sfxOn ? 'On' : 'Off'}`, this.opts.sfxOn, (v) => {
      this.opts = saveOptions({ sfxOn: v });
      this.updateToggleLabel(this.sfxToggle!, `SFX: ${v ? 'On' : 'Off'}`);
    });
    if (this.sfxToggle) this.sceneContentGroup.add(this.sfxToggle);
    y += 70;

    // Music volume slider
    this.musicSlider = this.createSlider(y, 'Music Volume', this.opts.musicVol, (val) => {
      this.opts = saveOptions({ musicVol: val });
      this.applyOptions(this.opts);
    });
    if (this.musicSlider) this.sceneContentGroup.add(this.musicSlider);
    y += 70;

    // SFX volume slider
    this.sfxSlider = this.createSlider(y, 'SFX Volume', this.opts.sfxVol, (val) => {
      this.opts = saveOptions({ sfxVol: val });
    });
    if (this.sfxSlider) this.sceneContentGroup.add(this.sfxSlider);
    y += 80;

    // Graphics Quality
    const qLabel = this.add.text(this.centerX, y, 'Graphics Quality', {
      fontFamily: 'Nunito', fontSize: '22px', color: '#000'
    }).setOrigin(0.5);
    this.sceneContentGroup.add(qLabel);
    y += 48;

    this.qualityNormal = this.createSmallButton(y, 'Normal', () => {
      this.opts = saveOptions({ graphics: 'normal' });
      this.applyOptions(this.opts);
      this.refreshQualityButtons();
    });
    this.qualityLow = this.createSmallButton(y, 'Low', () => {
      this.opts = saveOptions({ graphics: 'low' });
      this.applyOptions(this.opts);
      this.refreshQualityButtons();
    });
    if (this.qualityNormal) this.sceneContentGroup.add(this.qualityNormal);
    if (this.qualityLow) this.sceneContentGroup.add(this.qualityLow);
    this.refreshQualityButtons();
    y += 60;

    // Language (EN)
    this.langText = this.add.text(this.centerX, y, 'Language: EN', {
      fontFamily: 'Nunito', fontSize: '20px', color: '#555'
    }).setOrigin(0.5);
    this.sceneContentGroup.add(this.langText);
    y += 50;

    // Vibration
    this.vibrateToggle = this.createToggle(y, `Vibration: ${this.opts.vibration ? 'On' : 'Off'}`, this.opts.vibration, (v) => {
      this.opts = saveOptions({ vibration: v });
      this.updateToggleLabel(this.vibrateToggle!, `Vibration: ${v ? 'On' : 'Off'}`);
      try { if (v && navigator.vibrate) navigator.vibrate(40); } catch {}
    });
    if (this.vibrateToggle) this.sceneContentGroup.add(this.vibrateToggle);
    y += 70;

    // Version (Global)
    this.versionText = this.add.text(this.centerX, y, 'Version: Global', {
      fontFamily: 'Nunito', fontSize: '20px', color: '#000'
    }).setOrigin(0.5);
    this.sceneContentGroup.add(this.versionText);
    y += 50;

    // Reset Progress (Local)
    this.resetBtn = this.createButton(y, 'Reset Progress (Local)', () => this.openConfirm());
    if (this.resetBtn) this.sceneContentGroup.add(this.resetBtn);

    // Pointer cursor util atas
    this.input.off(Phaser.Input.Events.POINTER_MOVE);
    this.input.on(Phaser.Input.Events.POINTER_MOVE, (pointer: Phaser.Input.Pointer) => {
      let over = false;
      if (this.musicButton && this.isPointerOver(pointer, this.musicButton)) over = true;
      if (this.backButton && this.isPointerOver(pointer, this.backButton)) over = true;
      this.input.setDefaultCursor(over ? 'pointer' : 'default');
    });
    this.input.on(Phaser.Input.Events.GAME_OUT, () => this.input.setDefaultCursor('default'));
  }

  // PENTING: jangan panggil super.draw() di sini, supaya UI yang dibuat di create() tidak dihapus.
  public override draw() {
    // Reposisi responsif
    this.title?.setPosition(this.centerX, 90);

    const colX = this.centerX;
    const lineH = Math.max(52, Math.round(this.scale.height * 0.06));
    let y = 150;

    this.musicToggle?.setPosition(colX, y); y += lineH + 10;
    this.sfxToggle?.setPosition(colX, y); y += lineH + 18;
    this.musicSlider?.setPosition(colX, y); y += lineH + 18;
    this.sfxSlider?.setPosition(colX, y); y += lineH + 24;

    const qY = y;
    const gap = 90;
    this.qualityNormal?.setPosition(colX - gap / 2, qY);
    this.qualityLow?.setPosition(colX + gap / 2, qY);
    y += lineH + 18;

    this.langText?.setPosition(colX, y); y += lineH - 10;
    this.vibrateToggle?.setPosition(colX, y); y += lineH + 10;
    this.versionText?.setPosition(colX, y); y += lineH - 10;
    this.resetBtn?.setPosition(colX, y);
  }

  // ===== Helpers UI & Apply =====

  private createToggle(y: number, label: string, init: boolean, onChange: (v: boolean) => void) {
    let state = init;
    const c = this.createButton(y, label, () => {
      state = !state;
      onChange(state);
    });
    return c;
  }

  private updateToggleLabel(btn: Phaser.GameObjects.Container, text: string) {
    const t = btn.getAt(1) as Phaser.GameObjects.Text | undefined;
    if (t) t.setText(text);
  }

  private createSlider(y: number, label: string, initVal: number, onChange: (val: number) => void) {
    const trackW = Math.min(420, Math.round(this.scale.width * 0.8));
    const c = this.add.container(this.centerX, y);

    const lbl = this.add.text(0, -24, `${label}: ${Math.round(initVal * 100)}%`, {
      fontFamily: 'Nunito', fontSize: '18px', color: '#000'
    }).setOrigin(0.5);
    c.add(lbl);

    const track = this.add.rectangle(0, 10, trackW, 6, 0xcccccc).setOrigin(0.5);
    c.add(track);

    const knob = this.add.circle(-trackW / 2 + trackW * initVal, 10, 10, 0x111111).setInteractive({ useHandCursor: true });
    c.add(knob);

    const updateFromPointer = (px: number) => {
      const left = c.x - trackW / 2;
      let v = (px - left) / trackW;
      v = clamp01(v);
      knob.x = -trackW / 2 + trackW * v;
      lbl.setText(`${label}: ${Math.round(v * 100)}%`);
      onChange(v);
      try { this.playSound('sfx_click', { volume: 0.2 }); } catch {}
    };

    knob.on('pointerdown', (p: Phaser.Input.Pointer) => {
      updateFromPointer(p.x);
      this.input.on(Phaser.Input.Events.POINTER_MOVE, (pp: Phaser.Input.Pointer) => updateFromPointer(pp.x));
      this.input.once(Phaser.Input.Events.POINTER_UP, () => this.input.off(Phaser.Input.Events.POINTER_MOVE));
      this.input.once(Phaser.Input.Events.GAME_OUT, () => this.input.off(Phaser.Input.Events.POINTER_MOVE));
    });
    track.setInteractive().on('pointerdown', (p: Phaser.Input.Pointer) => updateFromPointer(p.x));

    return c;
  }

  private createSmallButton(y: number, label: string, onClick: () => void) {
    const width = Math.round(Math.min(220, this.scale.width * 0.4));
    const height = Math.max(40, Math.round(this.scale.height * 0.06));
    const radius = Math.min(16, Math.floor(height * 0.35));

    const c = this.add.container(this.centerX, y);
    (c as any).width = width; (c as any).height = height;

    const g = this.add.graphics();
    this.updateButtonGraphics(g, width, height, 0xffffff, 0x000000, 2, radius);
    const t = this.add.text(0, 0, label, { fontFamily: 'Nunito', fontSize: `${Math.max(14, Math.floor(height * 0.38))}px`, color: '#000' }).setOrigin(0.5);
    const z = this.add.zone(0, 0, width, height).setOrigin(0.5).setInteractive({ useHandCursor: true });
    z.on('pointerup', () => { this.playSound('sfx_click', { volume: 0.7 }); onClick(); });

    c.add([g, t, z]);
    return c;
  }

  private refreshQualityButtons() {
    const mark = (btn: Phaser.GameObjects.Container | undefined, active: boolean) => {
      if (!btn) return;
      const w = (btn as any).width ?? 220;
      const h = (btn as any).height ?? 40;
      const g = btn.getAt(0) as Phaser.GameObjects.Graphics | undefined;
      if (g) this.updateButtonGraphics(g, w, h, active ? 0xd4edda : 0xffffff, active ? 0x28a745 : 0x000000, 2);
    };
    const o = this.opts;
    mark(this.qualityNormal, o.graphics === 'normal');
    mark(this.qualityLow, o.graphics === 'low');
  }

  private openConfirm() {
    if (this.confirmBox) { try { this.confirmBox.destroy(true); } catch {} }

    const w = Math.min(420, Math.round(this.scale.width * 0.9));
    const h = 170;
    const bg = this.add.rectangle(this.centerX, this.centerY, w, h, 0xffffff).setStrokeStyle(2, 0x000000);
    const tx = this.add.text(this.centerX, this.centerY - 40, 'Reset local progress?\nThis cannot be undone.', {
      fontFamily: 'Nunito', fontSize: '18px', color: '#000', align: 'center'
    }).setOrigin(0.5);

    const yes = this.createSmallButton(this.centerY + 35, 'Yes', () => {
      try { localStorage.removeItem('rk:best'); } catch {}
      try { localStorage.removeItem('rk:lastSubmission'); } catch {}
      try { localStorage.removeItem(LS_KEY); } catch {}
      this.playSound('sfx_click', { volume: 0.7 });
      try { this.confirmBox?.destroy(true); } catch {}
      this.scene.start('MainMenuScene');
    });
    const no = this.createSmallButton(this.centerY + 35, 'No', () => {
      this.playSound('sfx_click', { volume: 0.7 });
      try { this.confirmBox?.destroy(true); } catch {}
    });
    yes.setPosition(this.centerX - 80, this.centerY + 35);
    no.setPosition(this.centerX + 80, this.centerY + 35);

    const c = this.add.container(0, 0);
    c.add([bg, tx, yes, no]);
    this.confirmBox = c;
    this.sceneContentGroup.add(c);
  }

  private applyOptions(o: Options) {
    // Music on/off + volume
    try {
      if (!o.musicOn) {
        if (BaseScene.backgroundMusic?.isPlaying) BaseScene.backgroundMusic.pause();
      } else {
        if (BaseScene.backgroundMusic && !BaseScene.backgroundMusic.isPlaying) {
          try { BaseScene.backgroundMusic.resume(); } catch { try { BaseScene.backgroundMusic.play(); } catch {} }
        }
      }
      try { (BaseScene.backgroundMusic as any)?.setVolume?.(o.musicVol); } catch {}
    } catch {}

    // Graphics
    try {
      if (o.graphics === 'low') {
        (this.textures as any).setDefaultFilter?.(Phaser.Textures.FilterMode.NEAREST);
      } else {
        (this.textures as any).setDefaultFilter?.(Phaser.Textures.FilterMode.LINEAR);
      }
    } catch {}
  }
}
