import { BaseScene } from './BaseScene';
import { SettingsManager } from '../lib/Settings';
import { t, getLang, setLang, emitLanguageChanged } from '../lib/i18n';
import { formatVersionLabel, VersionCode } from '../version';

export class OptionScene extends BaseScene {
  private rows: Phaser.GameObjects.Container[] = [];
  private unsub?: () => void;

  constructor() {
    super('OptionScene');
  }

  public override create() {
    super.create();

    this.ensureBackIcon(true);
    this.setTitle(t('optionsTitle') ?? 'Opsi');

    // Bersihkan baris lama kalau ada
    try { this.rows.forEach(r => r.destroy()); } catch {}
    this.rows = [];

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
        label: `${t('language') ?? 'Bahasa'}: ${getLang()}`,
        onTap: () => this.openLanguageModal(),
      },
      {
        label: `${t('version') ?? 'Versi'}: ${formatVersionLabel(s.version)}`,
        onTap: () => this.openVersionModal(),
      },
      {
        label: 'Remove Account',
        onTap: () => {
          try { localStorage.clear(); } catch {}
        },
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

    // subscribe ke perubahan settings
    try { this.unsub?.(); } catch {}
    this.unsub = SettingsManager.subscribe(() => this.refreshLabels());

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      try { this.unsub?.(); } catch {}
      this.unsub = undefined;
    });
  }

  private refreshLabels() {
    const s = SettingsManager.get();
    const labels = [
      `${t('music') ?? 'Music'}: ${s.musicOn ? 'on' : 'off'}`,
      `${t('sfx') ?? 'SFX'}: ${s.sfxOn ? 'on' : 'off'}`,
      `${t('language') ?? 'Bahasa'}: ${getLang()}`,
      `${t('version') ?? 'Versi'}: ${formatVersionLabel(s.version)}`,
      'Remove Account',
    ];
    this.rows.forEach((row, i) => {
      const text = row.getAt(1) as Phaser.GameObjects.Text | undefined;
      if (text && labels[i]) text.setText(labels[i]!);
    });
  }

  private openLanguageModal() {
    // sementara: ganti bahasa langsung (tanpa modal kompleks)
    const current = getLang();
    const next = current === 'id' ? 'en' : 'id';
    setLang(next);
    emitLanguageChanged(this);
    this.refreshLabels();
  }

  private openVersionModal() {
    // sementara: siklus versi untuk testing
    const order: VersionCode[] = ['global', 'id', 'de', 'jp'];
    const cur = SettingsManager.get().version;
    const idx = order.indexOf(cur);
    const next = order[(idx + 1) % order.length];
    SettingsManager.save({ version: next });
    this.refreshLabels();
  }

  public override draw() {
    if (!this.rows || this.rows.length === 0) return;

    this.ensureBackIcon(true);
    this.setTitle(t('optionsTitle') ?? 'Opsi');

    const heightPx = Math.max(
      48,
      Math.round(Math.min(this.scale.width, this.scale.height) * 0.06),
    );
    this.layoutPillsCentered(
      this.rows,
      heightPx,
      Math.round(heightPx * 0.22),
    );
  }
}
