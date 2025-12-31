import { BaseScene } from './BaseScene';
import { t } from '../lib/i18n';

export class LeaderboardModeScene extends BaseScene {
  private buttons: Phaser.GameObjects.Container[] = [];

  constructor() {
    super('LeaderboardModeScene');
  }

  public override create() {
    super.create();

    this.ensureBackIcon(true);
    this.setTitle(t('leaderboardTitle') ?? 'Leaderboard');

    try {
      this.buttons.forEach(b => b.destroy());
    } catch {}
    this.buttons = [];

    const heightPx = Math.max(
      48,
      Math.round(Math.min(this.scale.width, this.scale.height) * 0.06),
    );

    const items = [
      {
        label: t('leaderboardModeClassic') ?? 'Mode Klasik',
        onTap: () =>
          this.scene.start('LeaderboardCategoryScene', { mode: 'classic' }),
      },
      {
        label: t('leaderboardModeSurvive') ?? 'Mode Survive',
        // LANGSUNG ke leaderboard, tanpa pilih tingkat kesulitan
        onTap: () =>
          this.scene.start('LeaderboardScene', {
            mode: 'survive',
            difficulty: null,
          }),
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

    this.ensureBackIcon(true);
    this.setTitle(t('leaderboardTitle') ?? 'Leaderboard');

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
