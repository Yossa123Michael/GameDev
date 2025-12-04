import { BaseScene } from './BaseScene';
import { SettingsManager } from '../lib/Settings';
import { t, getLang, setLang, emitLanguageChanged } from '../lib/i18n';
import { showVersionPicker } from '../ui/VersionPicker';
import { formatVersionLabel, normalizeVersion } from '../version';

export class OptionScene extends BaseScene {
  private rows: Phaser.GameObjects.Container[] = [];
  private unsub?: () => void;

  private overlay?: Phaser.GameObjects.Rectangle;
  private modalContainer?: Phaser.GameObjects.Container;

  constructor() { super('OptionScene'); }

  public override create() {
    super.create();
    this.ensureBackIcon(true);
    this.setTitle('Option');

    const heightPx = 48;
    const widthPx = Math.round(this.panelWidth * 0.86);

    let y = this.panelTop + Math.round(this.panelHeight * 0.3125) + 24;

    const s = SettingsManager.get();

    const musicRow = this.createWidePill(`${t('music') ?? 'Music'}: ${s.musicOn ? 'on' : 'off'}`, () => {
      const cur = SettingsManager.get().musicOn;
      SettingsManager.save({ musicOn: !cur });
      this.updateAudioSettings();
      this.refreshLabels();
    }, 0.86, heightPx);
    musicRow.setPosition(this.centerX, y); this.rows.push(musicRow); y += 60;

    const sfxRow = this.createWidePill(`${t('sfx') ?? 'SFX'}: ${s.sfxOn ? 'on' : 'off'}`, () => {
      const cur = SettingsManager.get().sfxOn;
      SettingsManager.save({ sfxOn: !cur });
      this.refreshLabels();
    }, 0.86, heightPx);
    sfxRow.setPosition(this.centerX, y); this.rows.push(sfxRow); y += 60;

    const langRow = this.createWidePill(`${t('language') ?? 'Language'}: ${getLang()}`, () => this.openLangModal(), 0.86, heightPx);
    langRow.setPosition(this.centerX, y); this.rows.push(langRow); y += 60;

    const verRow = this.createWidePill(`${t('version') ?? 'Version'}: ${formatVersionLabel(s.version)}`, () => this.openVersionModal(), 0.86, heightPx);
    verRow.setPosition(this.centerX, y); this.rows.push(verRow); y += 60;

    const rmRow = this.createWidePill(`Remove Account`, () => { try { localStorage.clear(); } catch {} }, 0.86, heightPx);
    rmRow.setPosition(this.centerX, y); this.rows.push(rmRow);

    this.unsub = SettingsManager.subscribe(() => this.refreshLabels());
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => { try { this.unsub?.(); } catch {} this.closeModal(); });
  }

  private refreshLabels() {
    const s = SettingsManager.get();
    const labels = [
      `${t('music') ?? 'Music'}: ${s.musicOn ? 'on' : 'off'}`,
      `${t('sfx') ?? 'SFX'}: ${s.sfxOn ? 'on' : 'off'}`,
      `${t('language') ?? 'Language'}: ${getLang()}`,
      `${t('version') ?? 'Version'}: ${formatVersionLabel(s.version)}`
    ];
    this.rows.slice(0, 4).forEach((row, i) => {
      const text = row.getAt(1) as Phaser.GameObjects.Text | undefined;
      text?.setText(labels[i]!);
    });
  }

  private openLangModal() {
    this.closeModal();
    // overlay 100% gelap + sedikit transparan
    this.overlay = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.35)
      .setOrigin(0, 0).setDepth(998).setInteractive();
    // modal container di tengah
    this.modalContainer = this.add.container(0, 0).setDepth(999);
    const w = Math.min(480, Math.round(this.panelWidth * 0.92));
    const h = Math.min(this.panelHeight * 0.6, 240);
    const bg = this.add.rectangle(this.centerX, this.centerY, w, h, 0xffffff).setStrokeStyle(2, 0x000000).setOrigin(0.5);
    const title = this.add.text(this.centerX, this.centerY - h / 2 + 24, 'Language', { fontFamily: 'Nunito', fontSize: '18px', color: '#000' }).setOrigin(0.5);

    const idBtn = this.createWidePill('Indonesia', () => { setLang('id'); emitLanguageChanged(this); this.refreshLabels(); this.closeModal(); }, 0.6, 44);
    const enBtn = this.createWidePill('English', () => { setLang('en'); emitLanguageChanged(this); this.refreshLabels(); this.closeModal(); }, 0.6, 44);
    idBtn.setPosition(this.centerX, this.centerY - 20);
    enBtn.setPosition(this.centerX, this.centerY + 30);

    this.modalContainer.add([bg, title, idBtn, enBtn]);
    this.overlay.on('pointerup', () => this.closeModal());
    this.ensureBackIcon(true); // tetap terlihat
  }

  private openVersionModal() {
    this.closeModal();
    this.overlay = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.35)
      .setOrigin(0, 0).setDepth(998).setInteractive();
    this.modalContainer = this.add.container(0, 0).setDepth(999);

    const s = SettingsManager.get();
    const w = Math.min(520, Math.round(this.panelWidth * 0.92));
    const h = Math.min(this.panelHeight * 0.7, 300);
    const bg = this.add.rectangle(this.centerX, this.centerY, w, h, 0xffffff).setStrokeStyle(2, 0x000000).setOrigin(0.5);
    const title = this.add.text(this.centerX, this.centerY - h / 2 + 24, 'Pilih Versi', { fontFamily: 'Nunito', fontSize: '18px', color: '#000' }).setOrigin(0.5);
    const cur = this.add.text(this.centerX, this.centerY - h / 2 + 54, `Current: ${formatVersionLabel(s.version)}`, { fontFamily: 'Nunito', fontSize: '14px', color: '#000' }).setOrigin(0.5);

    // daftar versi (contoh)
    const versions = ['Global', 'Jerman', 'Jepang', 'Indonesia'];
    let y = this.centerY - 10;
    versions.forEach((v) => {
      const btn = this.createWidePill(v, () => { SettingsManager.save({ version: normalizeVersion(v) }); this.refreshLabels(); this.closeModal(); }, 0.6, 44);
      btn.setPosition(this.centerX, y);
      this.modalContainer!.add(btn);
      y += 54;
    });

    this.modalContainer.add([bg, title, cur]);
    this.overlay.on('pointerup', () => this.closeModal());
    this.ensureBackIcon(true);
  }

  private closeModal() {
    try { this.modalContainer?.destroy(true); } catch {}
    try { this.overlay?.destroy(true); } catch {}
    this.modalContainer = undefined; this.overlay = undefined;
  }

  public override draw() {
    this.ensureBackIcon(true);
    this.setTitle('Option');

    const heightPx = 48; const widthPx = Math.round(this.panelWidth * 0.86);
    const radius = Math.min(24, Math.floor(heightPx * 0.45));
    let y = this.panelTop + Math.round(this.panelHeight * 0.3125) + 24;
    this.rows.forEach((c) => {
      c.setPosition(this.centerX, y);
      (c as any).height = heightPx; (c as any).width = widthPx;
      this.ensureGraphicsInContainer(c, widthPx, heightPx, radius, 0xffffff, 0x000000, 2);
      (c.getAt(2) as Phaser.GameObjects.Zone | undefined)?.setSize(widthPx, heightPx);
      y += 60;
    });
    // Pastikan overlay dan modal tetap di atas saat resize
    this.overlay?.setSize(this.scale.width, this.scale.height);
  }
}
