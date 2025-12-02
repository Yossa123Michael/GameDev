import { BaseScene } from './BaseScene';
import { SettingsManager, clamp01 } from '../lib/Settings';
import type { Settings } from '../lib/Settings';
import { formatVersionLabel, versionsOrder, type VersionCode } from '../version';
import { showVersionPicker } from '../ui/VersionPicker';
import { t, getLang, setLang, emitLanguageChanged } from '../lib/i18n';

export class OptionScene extends BaseScene {
  private title?: Phaser.GameObjects.Text;

  private listContainer?: Phaser.GameObjects.Container;
  private maskGraphics?: Phaser.GameObjects.Graphics;

  private scrollY = 0;
  private contentHeight = 0;
  private pendingRebuild = false;

  // Drag state with threshold
  private pendingDrag = false;
  private dragging = false;
  private dragStartY = 0;
  private dragBase = 0;
  private readonly DRAG_THRESHOLD = 10;

  // Controls
  private musicToggle?: Phaser.GameObjects.Container;
  private sfxToggle?: Phaser.GameObjects.Container;
  private musicSlider?: Phaser.GameObjects.Container;
  private sfxSlider?: Phaser.GameObjects.Container;

  // Animation toggle (menggantikan Graphics Quality)
  private animationToggle?: Phaser.GameObjects.Container;

  private langRowLabel?: Phaser.GameObjects.Text;
  private langIdBtn?: Phaser.GameObjects.Container;
  private langEnBtn?: Phaser.GameObjects.Container;

  private vibrateToggle?: Phaser.GameObjects.Container;

  private versionRowLabel?: Phaser.GameObjects.Text;
  private versionPrevBtn?: Phaser.GameObjects.Container;
  private versionPickBtn?: Phaser.GameObjects.Container;
  private versionNextBtn?: Phaser.GameObjects.Container;

  private resetBtn?: Phaser.GameObjects.Container;
  private confirmBox?: Phaser.GameObjects.Container;

  // Metrics
  private TITLE_Y = 90;
  private STROKE_W = 3;

  private ROW_GAP = 24;
  private GAP_AFTER_MUSIC_TOGGLE = 96;
  private GAP_AFTER_SFX_TOGGLE = 108;
  private LIST_TOP_PAD = 28;

  private LANG_GAP = 170;   // jarak tombol bahasa
  private VERSION_GAP = 140; // jarak tombol versi

  private buttonWidth = 0;
  private buttonLeft = 0;
  private scrollTopY = 0;
  private scrollHeight = 0;

  private opts: Settings = SettingsManager.get();
  private optsUnsub?: () => void;

  constructor() { super('OptionScene'); }

  public override create() {
    super.create();
    super.createCommonButtons('MainMenuScene');

    this.optsUnsub = SettingsManager.subscribe((s) => {
      this.opts = s;
      try { this.updateToggleLabel(this.musicToggle!, `${t('music')}: ${s.musicOn ? t('on') : t('off')}`); } catch {}
      try { this.updateToggleLabel(this.sfxToggle!,   `${t('sfx')}: ${s.sfxOn   ? t('on') : t('off')}`); } catch {}
      try { this.updateToggleLabel(this.vibrateToggle!, `${t('vibration')}: ${s.vibration ? t('on') : t('off')}`); } catch {}
      try { this.updateToggleLabel(this.animationToggle!, `${t('animation')}: ${((s as any).animation !== false) ? t('on') : t('off')}`); } catch {}
      try { this.versionRowLabel?.setText(`${t('version')}: ${formatVersionLabel(s.version)}`); } catch {}
    });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      try { this.optsUnsub?.(); } catch {}
      this.detachScrollHandlers();
    });

    this.buildTitle();
    this.computeMetrics();
    this.fullRebuild();
    this.attachScrollHandlers();
  }

  public override draw() {
    if (this.pendingRebuild) return;
    this.pendingRebuild = true;
    const ratio = this.getScrollRatio();
    this.time.delayedCall(0, () => {
      this.pendingRebuild = false;
      this.computeMetrics();
      this.fullRebuild(ratio);
    });
  }

  private buildTitle() {
    try { this.title?.destroy(); } catch {}
    this.title = this.add.text(Math.floor(this.scale.width / 2), this.TITLE_Y, t('optionsTitle'), {
      fontFamily: 'Nunito', fontSize: '36px', color: '#000'
    }).setOrigin(0.5).setDepth(50);
  }

  private computeMetrics() {
    const cx = Math.floor(this.scale.width / 2);
    this.title?.setPosition(cx, this.TITLE_Y);

    this.buttonWidth = Math.round(this.scale.width * 0.86);
    this.buttonLeft = Math.round((this.scale.width - this.buttonWidth) / 2);

    this.scrollTopY = this.TITLE_Y + 60;
    const reservedBottom = 24;
    const available = Math.max(240, this.scale.height - this.scrollTopY - reservedBottom);
    this.scrollHeight = available;

    const sMin = Math.min(this.scale.width, this.scale.height);
    const compact = sMin < 600;
    this.ROW_GAP = compact ? 22 : 24;
    this.GAP_AFTER_MUSIC_TOGGLE = compact ? 88 : 96;
    this.GAP_AFTER_SFX_TOGGLE = compact ? 100 : 108;
    this.LIST_TOP_PAD = compact ? 26 : 28;
    this.LANG_GAP = compact ? 150 : 170;
    this.VERSION_GAP = compact ? 120 : 140;
  }

  private getScrollRatio(): number {
    if (this.contentHeight <= this.scrollHeight) return 0;
    return this.scrollY / Math.max(1, this.contentHeight - this.scrollHeight);
  }
  private restoreScrollFromRatio(r: number) {
    this.scrollY = r * Math.max(0, this.contentHeight - this.scrollHeight);
    this.clampScroll();
  }

  private fullRebuild(preserveRatio?: number) {
    try { this.listContainer?.destroy(true); } catch {}
    try { this.maskGraphics?.destroy(); } catch {}

    this.listContainer = this.add.container(0, this.scrollTopY).setDepth(30);

    this.maskGraphics = this.add.graphics().setDepth(29);
    this.drawMask();
    const mask = this.maskGraphics.createGeometryMask();
    this.listContainer.setMask(mask);

    this.renderList();

    if (preserveRatio !== undefined) this.restoreScrollFromRatio(preserveRatio);
    this.layoutAll();
  }

  private drawMask() {
    if (!this.maskGraphics) return;
    this.maskGraphics.clear();
    this.maskGraphics.fillStyle(0xffffff, 1);
    this.maskGraphics.fillRect(
      this.buttonLeft - this.STROKE_W,
      this.scrollTopY - this.STROKE_W,
      this.buttonWidth + this.STROKE_W * 2,
      this.scrollHeight + this.STROKE_W * 2
    );
  }

  private layoutAll() {
    this.drawMask();
    this.layoutScroll();
  }

  private layoutScroll() {
    if (this.listContainer) {
      this.listContainer.setPosition(0, this.scrollTopY - this.scrollY);
    }
  }

  private applyScroll(dy: number) {
    this.scrollY += dy;
    this.clampScroll();
    this.layoutScroll();
  }
  private clampScroll() {
    const maxScroll = Math.max(0, this.contentHeight - this.scrollHeight);
    if (this.scrollY < 0) this.scrollY = 0;
    if (this.scrollY > maxScroll) this.scrollY = maxScroll;
  }

  // ---------- Scroll handlers ----------
  private attachScrollHandlers() {
    this.detachScrollHandlers();

    this.input.on(Phaser.Input.Events.POINTER_DOWN, (p: Phaser.Input.Pointer) => {
      if (!this.isInScrollArea(p)) return;
      if (this.isOverAnyInteractive(p)) return; // biarkan klik ke tombol
      this.pendingDrag = true;
      this.dragging = false;
      this.dragStartY = p.y;
      this.dragBase = this.scrollY;
    });

    this.input.on(Phaser.Input.Events.POINTER_MOVE, (p: Phaser.Input.Pointer) => {
      if (!this.pendingDrag && !this.dragging) return;
      const deltaY = p.y - this.dragStartY;
      if (!this.dragging && Math.abs(deltaY) >= this.DRAG_THRESHOLD) {
        this.dragging = true;
      }
      if (this.dragging) {
        this.scrollY = this.dragBase - deltaY;
        this.clampScroll(); this.layoutScroll();
      }
    });

    const stop = () => { this.pendingDrag = false; this.dragging = false; };
    this.input.on(Phaser.Input.Events.POINTER_UP, stop);
    this.input.on(Phaser.Input.Events.GAME_OUT, stop);

    this.input.on('wheel', (p: Phaser.Input.Pointer, _gos: Phaser.GameObjects.GameObject[], _dx: number, dy: number) => {
      if (!this.isInScrollArea(p)) return;
      this.applyScroll(dy * 0.6);
    });
  }

  private detachScrollHandlers() {
    try { this.input.off(Phaser.Input.Events.POINTER_DOWN); } catch {}
    try { this.input.off(Phaser.Input.Events.POINTER_MOVE); } catch {}
    try { this.input.off(Phaser.Input.Events.POINTER_UP); } catch {}
    try { this.input.off(Phaser.Input.Events.GAME_OUT); } catch {}
    try { this.input.off('wheel'); } catch {}
    this.pendingDrag = false; this.dragging = false;
  }

  private isInScrollArea(p: Phaser.Input.Pointer): boolean {
    const x = p.x, y = p.y;
    const left = this.buttonLeft - this.STROKE_W;
    const top = this.scrollTopY - this.STROKE_W;
    const right = left + this.buttonWidth + this.STROKE_W * 2;
    const bottom = top + this.scrollHeight + this.STROKE_W * 2;
    return x >= left && x <= right && y >= top && y <= bottom;
  }

  private isOverAnyInteractive(p: Phaser.Input.Pointer): boolean {
    const candidates: (Phaser.GameObjects.GameObject | undefined)[] = [
      this.musicToggle, this.sfxToggle,
      this.musicSlider, this.sfxSlider,
      this.animationToggle,
      this.langIdBtn, this.langEnBtn,
      this.vibrateToggle,
      this.versionPrevBtn, this.versionPickBtn, this.versionNextBtn,
      this.resetBtn
    ];
    for (const go of candidates) {
      if (!go) continue;
      const b = (go as any).getBounds?.();
      if (b && b.contains(p.x, p.y)) return true;
      const list: any[] = (go as any).list || [];
      for (const child of list) {
        const cb = child?.getBounds?.();
        if (cb && cb.contains(p.x, p.y)) return true;
      }
    }
    return false;
  }

  // ---------- Content ----------
  private renderList() {
    if (!this.listContainer) return;
    this.listContainer.removeAll(true);

    const cx = Math.floor(this.scale.width / 2);
    let y = this.LIST_TOP_PAD;

    // Music toggle
    this.musicToggle = this.createToggle(0, `${t('music')}: ${this.opts.musicOn ? t('on') : t('off')}`, this.opts.musicOn, (v) => {
      SettingsManager.save({ musicOn: v });
      this.updateToggleLabel(this.musicToggle!, `${t('music')}: ${v ? t('on') : t('off')}`);
    });
    this.place(this.musicToggle, cx, y); y += this.GAP_AFTER_MUSIC_TOGGLE;

    // SFX toggle
    this.sfxToggle = this.createToggle(0, `${t('sfx')}: ${this.opts.sfxOn ? t('on') : t('off')}`, this.opts.sfxOn, (v) => {
      SettingsManager.save({ sfxOn: v });
      this.updateToggleLabel(this.sfxToggle!, `${t('sfx')}: ${v ? t('on') : t('off')}`);
    });
    this.place(this.sfxToggle, cx, y); y += this.GAP_AFTER_SFX_TOGGLE;

    // Music slider
    this.musicSlider = this.createSlider(0, t('musicVolume'), this.opts.musicVol, (val) => {
      SettingsManager.save({ musicVol: clamp01(val) });
    });
    this.place(this.musicSlider, cx, y); y += 72;

    // SFX slider
    this.sfxSlider = this.createSlider(0, t('sfxVolume'), this.opts.sfxVol, (val) => {
      SettingsManager.save({ sfxVol: clamp01(val) });
    });
    this.place(this.sfxSlider, cx, y); y += 88;

    // Animation toggle (mengganti Graphics Quality)
    this.animationToggle = this.createToggle(
      0,
      `${t('animation')}: ${((this.opts as any).animation !== false) ? t('on') : t('off')}`,
      ((this.opts as any).animation !== false),
      (v) => {
        SettingsManager.save({ animation: v });
        this.updateToggleLabel(this.animationToggle!, `${t('animation')}: ${v ? t('on') : t('off')}`);
      }
    );
    this.place(this.animationToggle, cx, y); y += 88;

    // Language
    this.langRowLabel = this.add.text(0, 0, t('language'), {
      fontFamily: 'Nunito', fontSize: '20px', color: '#555'
    }).setOrigin(0.5);
    this.place(this.langRowLabel, cx, y); y += 42;

    this.langIdBtn = this.createSmallButton(0, t('indonesian'), () => {
  setLang('id');
  emitLanguageChanged(this);
  this.playSound('sfx_click', { volume: 0.7 });
  this.relabelAll();
  this.scene.get('LeaderboardScene')?.events.emit('redraw-request');
  this.markSegmented(this.langIdBtn!, true); this.markSegmented(this.langEnBtn!, false);
});
this.langEnBtn = this.createSmallButton(0, t('english'), () => {
  setLang('en');
  emitLanguageChanged(this);
  this.playSound('sfx_click', { volume: 0.7 });
  this.relabelAll();
  this.scene.get('LeaderboardScene')?.events.emit('redraw-request');
  this.markSegmented(this.langIdBtn!, false); this.markSegmented(this.langEnBtn!, true);
});

    this.place(this.langIdBtn, cx - this.LANG_GAP / 2, y);
    this.place(this.langEnBtn, cx + this.LANG_GAP / 2, y);
    const isId = getLang() === 'id';
    this.markSegmented(this.langIdBtn!, isId);
    this.markSegmented(this.langEnBtn!, !isId);
    y += 88;

    // Vibration
    this.vibrateToggle = this.createToggle(0, `${t('vibration')}: ${this.opts.vibration ? t('on') : t('off')}`, this.opts.vibration, (v) => {
      SettingsManager.save({ vibration: v });
      this.updateToggleLabel(this.vibrateToggle!, `${t('vibration')}: ${v ? t('on') : t('off')}`);
      try { if (v && navigator.vibrate) navigator.vibrate(40); } catch {}
    });
    this.place(this.vibrateToggle, cx, y); y += 88;

    // Version
    this.versionRowLabel = this.add.text(0, 0, `${t('version')}: ${formatVersionLabel(this.opts.version)}`, {
      fontFamily: 'Nunito', fontSize: '20px', color: '#000'
    }).setOrigin(0.5);
    this.place(this.versionRowLabel, cx, y); y += 42;

    this.versionPrevBtn = this.createSmallButton(0, t('prev'), () => {
      const next = this.cycleVersion(-1);
      SettingsManager.save({ version: next });
      this.versionRowLabel?.setText(`${t('version')}: ${formatVersionLabel(this.opts.version)}`);
      this.playSound('sfx_click', { volume: 0.7 });
    });
    this.versionPickBtn = this.createSmallButton(0, t('change'), () => this.openVersionPicker());
    this.versionNextBtn = this.createSmallButton(0, t('next'), () => {
      const next = this.cycleVersion(1);
      SettingsManager.save({ version: next });
      this.versionRowLabel?.setText(`${t('version')}: ${formatVersionLabel(this.opts.version)}`);
      this.playSound('sfx_click', { volume: 0.7 });
    });
    this.place(this.versionPrevBtn, cx - this.VERSION_GAP, y);
    this.place(this.versionPickBtn, cx, y);
    this.place(this.versionNextBtn, cx + this.VERSION_GAP, y);
    y += 88;

    // Reset
    this.resetBtn = this.createButton(0, t('resetLocal'), () => this.openConfirm());
    this.place(this.resetBtn, cx, y);
    y += 72;

    this.contentHeight = y + this.LIST_TOP_PAD;
    this.clampScroll();
  }

  private relabelAll() {
    // Update semua label berdasarkan bahasa baru
    try { this.title?.setText(t('optionsTitle')); } catch {}
    try { this.updateToggleLabel(this.musicToggle!, `${t('music')}: ${this.opts.musicOn ? t('on') : t('off')}`); } catch {}
    try { this.updateToggleLabel(this.sfxToggle!,   `${t('sfx')}: ${this.opts.sfxOn   ? t('on') : t('off')}`); } catch {}
    try {
      const mLbl = (this.musicSlider?.getAt(0) as Phaser.GameObjects.Text | undefined);
      const sLbl = (this.sfxSlider?.getAt(0)  as Phaser.GameObjects.Text | undefined);
      mLbl?.setText(`${t('musicVolume')}: ${Math.round((this.opts.musicVol ?? 1) * 100)}%`);
      sLbl?.setText(`${t('sfxVolume')}: ${Math.round((this.opts.sfxVol ?? 1) * 100)}%`);
    } catch {}
    try { this.updateToggleLabel(this.animationToggle!, `${t('animation')}: ${((this.opts as any).animation !== false) ? t('on') : t('off')}`); } catch {}
    try { this.langRowLabel?.setText(t('language')); } catch {}
    try {
      const idText = this.langIdBtn?.getAt(1) as Phaser.GameObjects.Text | undefined;
      const enText = this.langEnBtn?.getAt(1) as Phaser.GameObjects.Text | undefined;
      idText?.setText(t('indonesian'));
      enText?.setText(t('english'));
    } catch {}
    try { this.updateToggleLabel(this.vibrateToggle!, `${t('vibration')}: ${this.opts.vibration ? t('on') : t('off')}`); } catch {}
    try {
      const prevText = this.versionPrevBtn?.getAt(1) as Phaser.GameObjects.Text | undefined;
      const chgText  = this.versionPickBtn?.getAt(1) as Phaser.GameObjects.Text | undefined;
      const nextText = this.versionNextBtn?.getAt(1) as Phaser.GameObjects.Text | undefined;
      prevText?.setText(t('prev'));
      chgText?.setText(t('change'));
      nextText?.setText(t('next'));
      this.versionRowLabel?.setText(`${t('version')}: ${formatVersionLabel(this.opts.version)}`);
    } catch {}
    try {
      const resetText = this.resetBtn?.getAt(1) as Phaser.GameObjects.Text | undefined;
      resetText?.setText(t('resetLocal'));
    } catch {}
  }

  private place(obj: Phaser.GameObjects.GameObject | undefined, xWorld: number, yLocal: number) {
    if (!obj || !this.listContainer) return;
    const go = obj as any;
    if (typeof go.setPosition === 'function') go.setPosition(xWorld, yLocal);
    else { (go as any).x = xWorld; (go as any).y = yLocal; }
    this.listContainer.add(go);
  }

  private markSegmented(btn: Phaser.GameObjects.Container, active: boolean) {
    const w = (btn as any).width ?? 220;
    const h = (btn as any).height ?? 40;
    const g = btn.getAt(0) as Phaser.GameObjects.Graphics | undefined;
    if (g) this.updateButtonGraphics(g, w, h, active ? 0xd4edda : 0xffffff, active ? 0x28a745 : 0x000000, 2);
  }

  private openVersionPicker() {
    this.playSound('sfx_click', { volume: 0.9 });
    showVersionPicker(this, (picked) => {
      SettingsManager.save({ version: picked });
      this.versionRowLabel?.setText(`${t('version')}: ${formatVersionLabel(this.opts.version)}`);
    });
  }

  private cycleVersion(dir: -1 | 1): VersionCode {
    const order = versionsOrder;
    const current = this.opts.version;
    const idx = Math.max(0, order.indexOf(current));
    const nextIdx = (idx + (dir === 1 ? 1 : order.length - 1)) % order.length;
    return order[nextIdx];
  }

  private createToggle(_y: number, label: string, init: boolean, onChange: (v: boolean) => void) {
    let state = init;
    const c = this.createButton(0, label, () => { state = !state; onChange(state); });
    return c;
  }
  private updateToggleLabel(btn: Phaser.GameObjects.Container, text: string) {
    const tObj = btn.getAt(1) as Phaser.GameObjects.Text | undefined;
    if (tObj) tObj.setText(text);
  }

  private createSlider(_y: number, label: string, initVal: number, onChange: (val: number) => void) {
    const trackW = Math.min(420, Math.round(this.scale.width * 0.8));
    const c = this.add.container(0, 0);

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
      v = Math.max(0, Math.min(1, v));
      (knob as any).x = -trackW / 2 + trackW * v;
      lbl.setText(`${label}: ${Math.round(v * 100)}%`);
      onChange(v);
    };

    knob.on('pointerdown', (p: Phaser.Input.Pointer) => {
      updateFromPointer(p.x);
      this.input.on(Phaser.Input.Events.POINTER_MOVE, (pp: Phaser.Input.Pointer) => updateFromPointer(pp.x));
      this.input.once(Phaser.Input.Events.POINTER_UP, () => this.input.off(Phaser.Input.Events.POINTER_MOVE));
      this.input.once(Phaser.Input.Events.GAME_OUT, () => this.input.off(Phaser.Input.Events.POINTER_MOVE));
    });
    track.setInteractive().on('pointerdown', (p: Phaser.Input.Pointer) => updateFromPointer(p.x));

    (c as any).width = Math.max(trackW, 280);
    (c as any).height = 50;
    return c;
  }

  private createSmallButton(_y: number, label: string, onClick: () => void) {
    const width = Math.round(Math.min(220, this.scale.width * 0.4));
    const height = Math.max(40, Math.round(this.scale.height * 0.06));
    const radius = Math.min(16, Math.floor(height * 0.35));

    const c = this.add.container(0, 0);
    (c as any).width = width; (c as any).height = height;

    const g = this.add.graphics();
    this.updateButtonGraphics(g, width, height, 0xffffff, 0x000000, 2, radius);
    const tObj = this.add.text(0, 0, label, { fontFamily: 'Nunito', fontSize: `${Math.max(14, Math.floor(height * 0.38))}px`, color: '#000' }).setOrigin(0.5);
    const z = this.add.zone(0, 0, width, height).setOrigin(0.5).setInteractive({ useHandCursor: true });
    z.on('pointerup', () => { this.playSound('sfx_click', { volume: 0.7 }); onClick(); });

    c.add([g, tObj, z]);
    return c;
  }

  private refreshQualityButtons() {
    // Dihapus: tidak ada lagi graphics quality, diganti animasi
  }

  private openConfirm() {
    if (this.confirmBox) { try { this.confirmBox.destroy(true); } catch {} }

    const w = Math.min(420, Math.round(this.scale.width * 0.9));
    const h = 170;
    const bg = this.add.rectangle(this.centerX, this.centerY, w, h, 0xffffff).setStrokeStyle(2, 0x000000);
    const tx = this.add.text(this.centerX, this.centerY - 40, 'Reset local progress?\nThis cannot be undone.', {
      fontFamily: 'Nunito', fontSize: '18px', color: '#000', align: 'center'
    }).setOrigin(0.5);

    const yes = this.createSmallButton(0, 'Yes', () => {
      try { localStorage.removeItem('rk:best'); } catch {}
      try { localStorage.removeItem('rk:lastSubmission'); } catch {}
      try { localStorage.removeItem('rk:settings'); } catch {}
      SettingsManager.reset();
      this.playSound('sfx_click', { volume: 0.7 });
      try { this.confirmBox?.destroy(true); } catch {}
      this.scene.start('MainMenuScene');
    });
    const no = this.createSmallButton(0, 'No', () => {
      this.playSound('sfx_click', { volume: 0.7 });
      try { this.confirmBox?.destroy(true); } catch {}
    });
    yes.setPosition(this.centerX - 80, this.centerY + 35);
    no.setPosition(this.centerX + 80, this.centerY + 35);

    const c = this.add.container(0, 0);
    c.add([bg, tx, yes, no]);
    this.confirmBox = c;
  }
}
