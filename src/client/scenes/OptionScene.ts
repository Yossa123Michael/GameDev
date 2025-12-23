import { BaseScene } from './BaseScene';
import { SettingsManager } from '../lib/Settings';
import { t, getLang, setLang, emitLanguageChanged } from '../lib/i18n';
import { formatVersionLabel, normalizeVersion } from '../version';

export class OptionScene extends BaseScene {
  private rows: Phaser.GameObjects.Container[] = [];
  private unsub?: () => void;

  private overlay: Phaser.GameObjects.Rectangle | null = null;
  private modal: Phaser.GameObjects.Container | null = null;

  constructor() { super('OptionScene'); }

  public override create() {
    super.create();
    this.ensureBackIcon(true);
    this.setTitle(t('optionsTitle') ?? 'Option');

    // Stabilkan ukuran, jangan terlalu besar supaya tidak "meledak"
    const heightPx = Math.max(48, Math.round(Math.min(this.scale.width, this.scale.height) * 0.06));
    const s = SettingsManager.get();

    const items = [
      { label: `${t('music') ?? 'Music'}: ${s.musicOn ? 'on' : 'off'}`, onTap: () => { SettingsManager.save({ musicOn: !SettingsManager.get().musicOn }); this.updateAudioSettings(); this.refreshLabels(); } },
      { label: `${t('sfx') ?? 'SFX'}: ${s.sfxOn ? 'on' : 'off'}`, onTap: () => { SettingsManager.save({ sfxOn: !SettingsManager.get().sfxOn }); this.refreshLabels(); } },
      { label: `${t('language') ?? 'Bahasa'}: ${getLang()}`, onTap: () => this.openLanguageModal() },
      { label: `${t('version') ?? 'Versi'}: ${formatVersionLabel(s.version)}`, onTap: () => this.openVersionModal() },
      { label: `Remove Account`, onTap: () => { try { localStorage.clear(); } catch {} } },
    ];

    this.rows = items.map(it => this.createWidePill(it.label, () => { this.playSound('sfx_click'); it.onTap(); }, 0.86, heightPx));
    this.layoutPillsCentered(this.rows, heightPx, Math.round(heightPx * 0.22));

    this.unsub = SettingsManager.subscribe(() => this.refreshLabels());
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => { try { this.unsub?.(); } catch {} this.closeModal(); });
  }

  private refreshLabels() {
    const s = SettingsManager.get();
    const labels = [
      `${t('music') ?? 'Music'}: ${s.musicOn ? 'on' : 'off'}`,
      `${t('sfx') ?? 'SFX'}: ${s.sfxOn ? 'on' : 'off'}`,
      `${t('language') ?? 'Bahasa'}: ${getLang()}`,
      `${t('version') ?? 'Versi'}: ${formatVersionLabel(s.version)}`
    ];
    this.rows.slice(0, 4).forEach((row, i) => {
      const text = row.getAt(1) as Phaser.GameObjects.Text | undefined;
      text?.setText(labels[i]!);
    });
  }

  // Tombol dalam modal: ukuran dikontrol agar tidak melebihi lebar kotak
  private createModalItem(label: string, onTap: () => void, widthPx: number, heightPx: number, depth: number) {
    const c = this.add.container(0, 0).setDepth(depth);
    const radius = Math.min(14, Math.floor(heightPx * 0.4));
    const g = this.add.graphics();
    g.lineStyle(2, 0x000000, 1).fillStyle(0xffffff, 1);
    g.fillRoundedRect(-widthPx / 2, -heightPx / 2, widthPx, heightPx, radius);
    g.strokeRoundedRect(-widthPx / 2, -heightPx / 2, widthPx, heightPx, radius);

    const txtSize = Math.max(14, Math.floor(heightPx * 0.42));
    const txt = this.add.text(0, 0, label, {
      fontFamily: 'Nunito', fontSize: `${txtSize}px`, color: '#000', align: 'center', wordWrap: { width: Math.floor(widthPx * 0.92) }
    }).setOrigin(0.5).setDepth(depth + 1);

    const zone = this.add.zone(0, 0, widthPx, heightPx).setOrigin(0.5).setInteractive({ useHandCursor: true });
    zone.on('pointerup', () => { this.playSound('sfx_click'); onTap(); });

    c.add([g, txt, zone]);
    return c;
  }

  // Modal box: memastikan konten tidak melampaui kotak — gunakan innerWidth (box width dikurangi padding)
  private buildModalBox(titleText: string, headerLines: string[] = [], innerButtons: { label: string; onTap: () => void; }[] = []) {
    this.overlay = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.35)
      .setOrigin(0, 0).setDepth(2500).setInteractive();

    this.modal = this.add.container(0, 0).setDepth(2600);

    const buttonH = Math.max(40, Math.round(Math.min(this.scale.width, this.scale.height) * 0.05));
    const gap = Math.round(buttonH * 0.18);
    const padding = Math.max(18, Math.round(Math.min(this.scale.width, this.scale.height) * 0.028));
    const titleSize = Math.max(20, Math.round(Math.min(this.scale.width, this.scale.height) * 0.038));

    const totalButtonsHeight = innerButtons.length * buttonH + (innerButtons.length > 0 ? (innerButtons.length - 1) * gap : 0);
    const headerBlockHeight = headerLines.length ? (headerLines.length * Math.round(titleSize * 0.9) + Math.round(titleSize * 0.5)) : 0;
    const boxContentHeight = padding + Math.round(titleSize * 1.2) + headerBlockHeight + totalButtonsHeight + padding;

    const boxWidth = Math.min(520, Math.round(this.panelWidth * 0.9));
    const boxHeight = Math.min(boxContentHeight, Math.round(this.scale.height * 0.75));
    const innerWidth = boxWidth - padding * 2;

    const box = this.add.graphics().setDepth(2601);
    const radius = Math.max(12, Math.round(buttonH * 0.25));
    box.lineStyle(2, 0x000000, 1).fillStyle(0xffffff, 1);
    box.fillRoundedRect(this.centerX - boxWidth / 2, this.centerY - boxHeight / 2, boxWidth, boxHeight, radius);
    box.strokeRoundedRect(this.centerX - boxWidth / 2, this.centerY - boxHeight / 2, boxWidth, boxHeight, radius);
    this.modal.add(box);

    const title = this.add.text(this.centerX, this.centerY - boxHeight / 2 + padding, titleText, { fontFamily: 'Nunito', fontSize: `${titleSize}px`, color: '#000' })
      .setOrigin(0.5).setDepth(2602);
    this.modal.add(title);

    let cursorY = title.y + Math.round(titleSize * 1.15);

    headerLines.forEach(line => {
      const hdr = this.add.text(this.centerX, cursorY, line, { fontFamily: 'Nunito', fontSize: `${Math.max(14, Math.round(titleSize * 0.88))}px`, color: '#000' }).setOrigin(0.5).setDepth(2602);
      this.modal!.add(hdr);
      cursorY += Math.round(titleSize * 0.95);
    });

    if (headerLines.length) cursorY += Math.round(titleSize * 0.5);

    // Bangun tombol dengan lebar innerWidth agar tidak melebihi kotak
    innerButtons.forEach(btn => {
      const pill = this.createModalItem(btn.label, btn.onTap, innerWidth, buttonH, 2603);
      pill.setPosition(this.centerX, cursorY + buttonH / 2);
      this.modal!.add(pill);
      cursorY += buttonH + gap;
    });

    this.overlay.on('pointerup', () => this.closeModal());
    this.ensureBackIcon(true);
  }

  private openLanguageModal() {
    this.closeModal();
    const langs = [
      { label: 'Indonesia', code: 'id' },
      { label: 'English', code: 'en' },
    ];
    this.buildModalBox(t('language') ?? 'Bahasa', [], langs.map(l => ({
      label: l.label,
      onTap: () => { setLang(l.code); emitLanguageChanged(this); this.refreshLabels(); this.closeModal(); }
    })));
  }

  private openVersionModal() {
    this.closeModal();
    const versions = ['Global', 'Jerman', 'Jepang', 'Indonesia'];
    const cur = formatVersionLabel(SettingsManager.get().version);
    this.buildModalBox('Pilih Versi', [`Current: ${cur}`], versions.map(v => ({
      label: v,
      onTap: () => { SettingsManager.save({ version: normalizeVersion(v) }); this.refreshLabels(); this.closeModal(); }
    })));
  }

  private closeModal() {
    try { this.modal?.destroy(true); } catch {}
    try { this.overlay?.destroy(true); } catch {}
    this.modal = null;
    this.overlay = null;
  }

  public override draw() {
    this.ensureBackIcon(true);
    this.setTitle(t('optionsTitle') ?? 'Option');
    const heightPx = Math.max(48, Math.round(Math.min(this.scale.width, this.scale.height) * 0.06));
    this.layoutPillsCentered(this.rows, heightPx, Math.round(heightPx * 0.22));
    this.overlay?.setSize(this.scale.width, this.scale.height);
  }
}
