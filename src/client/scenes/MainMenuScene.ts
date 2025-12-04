import { BaseScene } from './BaseScene';
import { t } from '../lib/i18n';

export class MainMenuScene extends BaseScene {
  private buttons: Phaser.GameObjects.Container[] = [];
  private baselineY = 0;

  constructor() { super('MainMenuScene'); }

  public override create() {
    super.create();
    this.ensureBackIcon(false);

    // Logo besar, lalu daftar tombol
    this.baselineY = this.drawBigLogoCentered(160, 24);

    const heightPx = 56;
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

    let y = this.baselineY + Math.max(10, Math.round(this.scale.height * 0.02));
    for (let i = 0; i < labels.length; i++) {
      const btn = this.createWidePill(labels[i]!, actions[i]!, 0.86, heightPx);
      btn.setPosition(this.centerX, y);
      this.buttons.push(btn);
      y += 72;
    }
  }

  public override draw() {
    this.ensureBackIcon(false);
    this.baselineY = this.drawBigLogoCentered(160, 24);
    const heightPx = 56; const widthPx = Math.round(this.panelWidth * 0.86);
    let y = this.baselineY + Math.max(10, Math.round(this.scale.height * 0.02));
    const radius = Math.min(24, Math.floor(heightPx * 0.45));

    this.buttons.forEach((c) => {
      c.setPosition(this.centerX, y);
      (c as any).height = heightPx; (c as any).width = widthPx;
      this.ensureGraphicsInContainer(c, widthPx, heightPx, radius, 0xffffff, 0x000000, 2);
      const zone = c.getAt(2) as Phaser.GameObjects.Zone | undefined;
      zone?.setSize(widthPx, heightPx);
      y += 72;
    });
  }
}
