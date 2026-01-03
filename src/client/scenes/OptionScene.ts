import { BaseScene } from './BaseScene';
import { SettingsManager } from '../lib/Settings';
import { t, getLang, setLang, emitLanguageChanged } from '../lib/i18n';
import { formatVersionLabel, VersionCode, versionsOrder } from '../version';

export class OptionScene extends BaseScene {
  private rows: Phaser.GameObjects.Container[] = [];

  // elemen modal
  private overlay: Phaser.GameObjects.Rectangle | null = null;
  private modal: Phaser.GameObjects.Container | null = null;

  constructor() {
    super('OptionScene');
  }

  public override create() {
    super.create();

    this.ensureBackIcon(true);
    this.setTitle(t('optionsTitle') ?? 'Options');

    try { this.rows.forEach(r => r.destroy()); } catch {}
    this.rows = [];
    this.closeModal();

    const s = SettingsManager.get();

    const heightPx = Math.max(
      48,
      Math.round(Math.min(this.scale.width, this.scale.height) * 0.06),
    );

    const items = [
      {
        label: `${t('music') ?? 'Music'}: ${s.musicOn ? 'on' : 'off'}`,
        onTap: () => {
          SettingsManager.save({ musicOn: !SettingsManager.get().musicOn });
          this.updateAudioSettings();
          this.refreshLabels();
        },
      },
      {
        label: `${t('sfx') ?? 'SFX'}: ${s.sfxOn ? 'on' : 'off'}`,
        onTap: () => {
          SettingsManager.save({ sfxOn: !SettingsManager.get().sfxOn });
          this.refreshLabels();
        },
      },
      {
        label: `${t('language') ?? 'Language'}: ${getLang()}`,
        onTap: () => this.openLanguageModal(),
      },
      {
        label: `${t('version') ?? 'Version'}: ${formatVersionLabel(s.version)}`,
        onTap: () => this.openVersionModal(),
      },
      {
        label: 'Remove Account',
        onTap: () => { try { localStorage.clear(); } catch {} },
      },
    ];

    this.rows = items.map(it =>
      this.createWidePill(
        it.label,
        () => {
          this.playSound('sfx_click');
          it.onTap();
        },
        0.86,
        heightPx,
      ),
    );

    this.layoutPillsCentered(
      this.rows,
      heightPx,
      Math.round(heightPx * 0.22),
    );

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.closeModal();
    });
  }

  private refreshLabels() {
    const s = SettingsManager.get();
    const labels = [
      `${t('music') ?? 'Music'}: ${s.musicOn ? 'on' : 'off'}`,
      `${t('sfx') ?? 'SFX'}: ${s.sfxOn ? 'on' : 'off'}`,
      `${t('language') ?? 'Language'}: ${getLang()}`,
      `${t('version') ?? 'Version'}: ${formatVersionLabel(s.version)}`,
      'Remove Account',
    ];
    this.rows.forEach((row, i) => {
      const text = row.getAt(1) as Phaser.GameObjects.Text | undefined;
      if (text && labels[i]) text.setText(labels[i]!);
    });
  }

  // ===== Modal utilities =====

  private closeModal() {
    try { this.modal?.destroy(true); } catch {}
    try { this.overlay?.destroy(true); } catch {}
    this.modal = null;
    this.overlay = null;
  }

private buildSimpleModal(
  title: string,
  options: { label: string; action: () => void }[],
) {
  this.closeModal();

  const w = Math.min(520, Math.round(this.panelWidth * 0.9));
  const base = Math.min(this.scale.width, this.scale.height);

  const buttonH = Math.max(40, Math.round(base * 0.055));
  const gap = Math.round(buttonH * 0.25);

  const titleSize = Math.max(18, Math.round(base * 0.055));

  // padding vertikal antara konten dan tepi kotak
  const paddingTop = Math.round(buttonH * 0.8);    // dari garis atas → atas judul
  const paddingBottom = Math.round(buttonH * 0.7); // dari tombol terakhir → garis bawah

  // jarak judul → tombol pertama
  const titleToButtonsMargin = Math.round(buttonH * 0.9);

  // Hitung tinggi KONTEN dulu, lalu turunkan ke tinggi kotak
  // 1) tinggi judul
  const titleBlockH = Math.round(titleSize * 1.4);

  // 2) tinggi semua tombol + gap
  const totalButtonsH =
    options.length * buttonH +
    (options.length > 0 ? (options.length - 1) * gap : 0);

  const contentHeight =
    titleBlockH +                // area judul
    titleToButtonsMargin +       // judul → tombol pertama
    totalButtonsH;               // semua tombol

  const boxH = paddingTop + contentHeight + paddingBottom;

  this.overlay = this.add
    .rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.35)
    .setOrigin(0, 0)
    .setDepth(2000)
    .setInteractive();

  this.modal = this.add.container(0, 0).setDepth(2100);

  const box = this.add.graphics();
  const radius = Math.round(buttonH * 0.4);
  const boxX = this.centerX - w / 2;
  const boxY = this.centerY - boxH / 2;

  // Kotak putih pas mengelilingi konten
  box.lineStyle(2, 0x000000, 1).fillStyle(0xffffff, 1);
  box.fillRoundedRect(boxX, boxY, w, boxH, radius);
  box.strokeRoundedRect(boxX, boxY, w, boxH, radius);
  this.modal.add(box);

  // Posisi judul: ada jarak dari garis atas
  const titleY = boxY + paddingTop + titleBlockH / 2;
  const titleText = this.add
    .text(this.centerX, titleY, title, {
      fontFamily: 'Nunito',
      fontSize: `${titleSize}px`,
      color: '#000000',
    })
    .setOrigin(0.5);
  this.modal.add(titleText);

  // Titik mulai tombol pertama = bawah blok judul + margin
  let y = titleY + titleBlockH / 2 + titleToButtonsMargin;

  options.forEach(opt => {
    const c = this.add.container(this.centerX, y);

    const innerW = w * 0.8;
    const g = this.add.graphics();
    g.lineStyle(2, 0x000000, 1).fillStyle(0xffffff, 1);
    g.fillRoundedRect(-innerW / 2, -buttonH / 2, innerW, buttonH, radius);
    g.strokeRoundedRect(-innerW / 2, -buttonH / 2, innerW, buttonH, radius);

    const txt = this.add
      .text(0, 0, opt.label, {
        fontFamily: 'Nunito',
        fontSize: `${Math.max(14, Math.round(buttonH * 0.4))}px`,
        color: '#000000',
      })
      .setOrigin(0.5);

    const zone = this.add
      .zone(0, 0, innerW, buttonH)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    zone.on('pointerup', () => {
      this.playSound('sfx_click');
      opt.action();
      this.closeModal();
    });

    c.add([g, txt, zone]);
    this.modal!.add(c);

    // tombol berikutnya turun dengan jarak tetap
    y += buttonH + gap;
  });

  this.overlay.on('pointerup', () => this.closeModal());
}

  private openLanguageModal() {
    this.buildSimpleModal(t('language') ?? 'Language', [
      {
        label: 'Indonesia',
        action: () => {
          setLang('id');
          emitLanguageChanged(this);
          this.refreshLabels();
        },
      },
      {
        label: 'English',
        action: () => {
          setLang('en');
          emitLanguageChanged(this);
          this.refreshLabels();
        },
      },
    ]);
  }

  private openVersionModal() {
    const s = SettingsManager.get();
    this.buildSimpleModal(t('version') ?? 'Version', [
      ...versionsOrder.map(v => ({
        label: formatVersionLabel(v),
        action: () => {
          SettingsManager.save({ version: v });
          this.refreshLabels();
        },
      })),
    ]);
  }

public override draw() {
  if (!this.rows || this.rows.length === 0) return;

  this.ensureBackIcon(true);
  this.layoutTitleArea();
  this.setTitle(t('Options') ?? 'Pengaturan');

  const heightPx = Math.max(
    48,
    Math.round(Math.min(this.scale.width, this.scale.height) * 0.06),
  );
  this.layoutPillsCentered(
    this.rows,
    heightPx,
    Math.round(heightPx * 0.22),
  );

  // kalau modal lagi terbuka, rebuild biar tetap di tengah
  if (this.modal) {
    // Kita tidak tahu modal apa (bahasa/versi), jadi simpan info terakhir waktu dibuka
    // Untuk praktis: cukup set ukuran overlay saja, biarkan posisi box relatif terhadap center
    this.overlay?.setSize(this.scale.width, this.scale.height);
  } else {
    this.overlay?.setSize(this.scale.width, this.scale.height);
  }
}
}
