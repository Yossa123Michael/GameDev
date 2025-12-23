import { BaseScene } from './BaseScene';
import { t } from '../lib/i18n';

export class MainMenuScene extends BaseScene {
  private buttons: Phaser.GameObjects.Container[] = [];

  constructor() { super('MainMenuScene'); }

  public override create() {
    super.create();

    // FIX drift: bersihkan jika scene dibuat ulang
    try { this.buttons.forEach(b => b.destroy()); } catch {}
    this.buttons = [];

    this.ensureBackIcon(false);
    this.drawLogoInHeader(160, 12);

    const labels = [
      t('mainPlay') ?? 'Play',
      t('mainLeaderboard') ?? 'Leaderboard',
      t('mainAchievement') ?? 'Achievement',
      t('mainOptions') ?? 'Options',
      t('credits') ?? 'credits',
    ];
    const actions: Array<() => void> = [
      () => this.scene.start('PilihModeScene'),
      () => this.scene.start('LeaderboardModeScene'),
      () => this.scene.start('AchievementScene'),
      () => this.scene.start('OptionScene'),
      () => this.scene.start('CreditScene'),
    ];

    const heightPx = Math.max(56, Math.round(Math.min(this.scale.width, this.scale.height) * 0.07));
    labels.forEach((label, i) => {
      const btn = this.createWidePill(label, () => { this.playSound('sfx_click'); actions[i]!(); }, 0.86, heightPx);
      this.buttons.push(btn);
    });
    this.layoutPillsCentered(this.buttons, heightPx, Math.round(heightPx * 0.25));
  }

  public override draw() {
    this.ensureBackIcon(false);
    this.drawLogoInHeader(160, 12);
    const heightPx = Math.max(56, Math.round(Math.min(this.scale.width, this.scale.height) * 0.07));
    this.layoutPillsCentered(this.buttons, heightPx, Math.round(heightPx * 0.25));
  }
}
