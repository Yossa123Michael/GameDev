import { BaseScene } from './BaseScene';
import { t } from '../lib/i18n';

export class MainMenuScene extends BaseScene {
  private buttons: Phaser.GameObjects.Container[] = [];

  constructor() {
    super('MainMenuScene');
  }

  public override create() {
    super.create();

    // Ganti header default dengan logo besar
    this.titleText?.destroy();
    this.titleUnderline?.destroy();

    this.createCenteredLogoTitleArea();
    this.ensureBackIcon(false); // main menu TIDAK punya back

    try {
      this.buttons.forEach(b => b.destroy());
    } catch {}
    this.buttons = [];

    const base = Math.min(this.scale.width, this.scale.height);
    const heightPx = Math.max(48, Math.round(base * 0.06));

const items = [
  {
    label: (t && t('Start')) || 'Mulai',
    onTap: () => this.scene.start('PilihModeScene'),
  },
  {
    label: (t && t('Leaderboard')) || 'Leaderboard',
    onTap: () => this.scene.start('LeaderboardModeScene'),
  },
  {
    label: (t && t('Achievement')) || 'Achievement',
    onTap: () => this.scene.start('AchievementScene'),
  },
  {
    label: (t && t('Options')) || 'Pengaturan',
    onTap: () => this.scene.start('OptionScene'),
  },
  {
    label: (t && t('Credits')) || 'Credit',
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
  if (!this.buttons || this.buttons.length === 0) {
    this.ensureBackIcon(false);
    return;
  }

  this.ensureBackIcon(false);

  // Relayout logo + title saat resize
  this.layoutCenteredLogoTitleArea();

  const base = Math.min(this.scale.width, this.scale.height);
  const heightPx = Math.max(48, Math.round(base * 0.06));

  this.layoutPillsCentered(
    this.buttons,
    heightPx,
    Math.round(heightPx * 0.24),
  );
}
}
