import { BaseScene } from './BaseScene';
import { SettingsManager } from '../lib/Settings';
import { t, getLang, setLang, emitLanguageChanged } from '../lib/i18n';
import { formatVersionLabel, VersionCode } from '../version';

export class OptionScene extends BaseScene {
  constructor() {
    super('OptionScene');
  }

  public override create() {
    super.create();

    this.ensureBackIcon(true);
    this.setTitle(t('difficultyTitle') ?? 'Pilih Kesulitan');

    try { this.buttons.forEach(b => b.destroy()); } catch {}
    this.buttons = [];

    const heightPx = Math.max(
      48,
      Math.round(Math.min(this.scale.width, this.scale.height) * 0.06),
    );

    const items = [
      {
        label: t('difficultyEasy') ?? 'Mudah',
        onTap: () => this.scene.start('PilihModeScene', { difficulty: 'easy' }),
      },
      {
        label: t('difficultyMedium') ?? 'Sedang',
        onTap: () => this.scene.start('PilihModeScene', { difficulty: 'medium' }),
      },
      {
        label: t('difficultyHard') ?? 'Susah',
        onTap: () => this.scene.start('PilihModeScene', { difficulty: 'hard' }),
      },
    ];

    this.buttons = items.map(it =>
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
      this.buttons,
      heightPx,
      Math.round(heightPx * 0.22),
    );
  }

  public override draw() {
    if (!this.buttons || this.buttons.length === 0) return;

    this.ensureBackIcon(true);
    this.setTitle(t('difficultyTitle') ?? 'Pilih Kesulitan');

    const heightPx = Math.max(
      48,
      Math.round(Math.min(this.scale.width, this.scale.height) * 0.06),
    );
    this.layoutPillsCentered(
      this.buttons,
      heightPx,
      Math.round(heightPx * 0.22),
    );
  }
}
