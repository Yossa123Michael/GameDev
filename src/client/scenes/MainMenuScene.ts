import { BaseScene } from './BaseScene';
import { t } from '../lib/i18n';

export class MainMenuScene extends BaseScene {
  private buttons: Phaser.GameObjects.Container[] = [];

  constructor() {
    super('MainMenuScene');
  }

  public override create() {
    super.create();

    this.ensureBackIcon(false);

    // Pakai area header dengan logo besar
    this.createCenteredLogoTitleArea();
    // Title pakai i18n kalau tersedia, kalau tidak pakai string langsung
    const titleText = (t && t('appTitle')) || 'Road Knowledge';
    this.setTitle(titleText);

    // Bersihkan button lama jika ada
    try {
      this.buttons.forEach(b => b.destroy());
    } catch {}
    this.buttons = [];

    const base = Math.min(this.scale.width, this.scale.height);
    const heightPx = Math.max(48, Math.round(base * 0.06));

    const items = [
      {
        label: (t && t('menuStart')) || 'Mulai',
        onTap: () => this.scene.start('PilihModeScene'),
      },
      {
        label: (t && t('menuLeaderboard')) || 'Leaderboard',
        onTap: () => this.scene.start('LeaderboardModeScene'),
      },
      {
        label: (t && t('menuOptions')) || 'Pengaturan',
        onTap: () => this.scene.start('OptionScene'),
      },
      {
        label: (t && t('menuCredits')) || 'Credit',
        onTap: () => this.scene.start('CreditScene'),
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
      Math.round(heightPx * 0.24),
    );
  }

  public override draw() {
    if (!this.buttons || this.buttons.length === 0) return;

    this.ensureBackIcon(false);

    const titleText = (t && t('appTitle')) || 'Road Knowledge';
    this.setTitle(titleText);

    const base = Math.min(this.scale.width, this.scale.height);
    const heightPx = Math.max(48, Math.round(base * 0.06));

    this.layoutPillsCentered(
      this.buttons,
      heightPx,
      Math.round(heightPx * 0.24),
    );
  }
}
