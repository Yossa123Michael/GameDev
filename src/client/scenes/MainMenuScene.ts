import { BaseScene } from './BaseScene';
import { t } from '../lib/i18n';

export class MainMenuScene extends BaseScene {
  private buttons: Phaser.GameObjects.Container[] = [];

  constructor() {
    super('MainMenuScene');
  }

  public override create() {
    super.create();

    // Ganti header default dengan logo besar di tengah
    this.titleText?.destroy();
    this.titleUnderline?.destroy();

    this.createCenteredLogoTitleArea();
    this.ensureBackIcon(false); // main menu tidak punya back

    try { this.buttons.forEach(b => b.destroy()); } catch {}
    this.buttons = [];

    const heightPx = Math.max(
      48,
      Math.round(Math.min(this.scale.width, this.scale.height) * 0.06),
    );

    const items = [
  {
    key: 'mainPlay' as const,
    fallback: 'Start',
    onTap: () => this.scene.start('PilihModeScene'),
  },
  {
    key: 'mainLeaderboard' as const,
    fallback: 'Leaderboard',
    onTap: () => this.scene.start('LeaderboardModeScene'),
  },
  {
    key: 'mainAchievement' as const,
    fallback: 'Achievement',
    onTap: () => this.scene.start('AchievementScene'),
  },
  {
    key: 'mainOptions' as const,
    fallback: 'Options',
    onTap: () => this.scene.start('OptionScene'),
  },
  {
    // Kalau nanti mau Quit beneran, bisa diubah
    key: 'mainQuit' as const,
    fallback: 'Credits',
    onTap: () => this.scene.start('CreditScene'),
  },
];

    this.buttons = items.map(item =>
  this.createWidePill(
    t(item.key) ?? item.fallback,
    () => {
      this.playSound('sfx_click');
      item.onTap();
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
      this.setTitle(t('mainTitle') ?? 'Road Knowledge');
      return;
    }

    this.ensureBackIcon(false);
    this.setTitle(t('mainTitle') ?? 'Road Knowledge');

    const heightPx = Math.max(
      48,
      Math.round(Math.min(this.scale.width, this.scale.height) * 0.06),
    );
    this.layoutPillsCentered(
      this.buttons,
      heightPx,
      Math.round(heightPx * 0.24),
    );
  }
}
