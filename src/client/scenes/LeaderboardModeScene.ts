import { BaseScene } from './BaseScene';
import { t } from '../lib/i18n';

export class LeaderboardModeScene extends BaseScene {
  private buttons: Phaser.GameObjects.Container[] = [];
  constructor() { super('LeaderboardModeScene'); }

  public override create() {
    super.create();
    this.ensureBackIcon(true);
    this.setTitle(t('leaderboard') ?? 'LeaderBoard');

    const items = [
      { label: t('modeLearn') ?? 'Belajar', go: () => this.scene.start('LeaderboardCategoryScene', { type: 'belajar' }) },
      { label: t('modeSurvive') ?? 'Survive', go: () => this.scene.start('LeaderboardCategoryScene', { type: 'survive' }) },
    ];
    const heightPx = 48;
    let y = this.panelTop + Math.round(this.panelHeight * 0.3125) + 24;
    for (const it of items) {
      const btn = this.createWidePill(it.label, it.go, 0.86, heightPx);
      btn.setPosition(this.centerX, y);
      this.buttons.push(btn);
      y += 60;
    }
  }

  public override draw() {
    this.ensureBackIcon(true);
    this.setTitle(t('leaderboard') ?? 'LeaderBoard');
    const heightPx = 48; const widthPx = Math.round(this.panelWidth * 0.86);
    let y = this.panelTop + Math.round(this.panelHeight * 0.3125) + 24;
    const radius = Math.min(24, Math.floor(heightPx * 0.45));
    this.buttons.forEach((c) => {
      c.setPosition(this.centerX, y);
      (c as any).height = heightPx; (c as any).width = widthPx;
      this.ensureGraphicsInContainer(c, widthPx, heightPx, radius, 0xffffff, 0x000000, 2);
      (c.getAt(2) as Phaser.GameObjects.Zone | undefined)?.setSize(widthPx, heightPx);
      y += 60;
    });
  }
}
