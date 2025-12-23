import { BaseScene } from './BaseScene';
import { t } from '../lib/i18n';

export class LeaderboardModeScene extends BaseScene {
  private buttons: Phaser.GameObjects.Container[] = [];
  constructor() { super('LeaderboardModeScene'); }

  public override create() {
    super.create();
    this.ensureBackIcon(true);
    this.setTitle(t('leaderboard') ?? 'LeaderBoard');

    const heightPx = Math.max(48, Math.round(Math.min(this.scale.width, this.scale.height) * 0.06));
    const items = [
      { label: t('modeLearn') ?? 'Belajar', go: () => this.scene.start('LeaderboardCategoryScene', { type: 'belajar' }) },
      { label: t('modeSurvive') ?? 'Survive', go: () => this.scene.start('LeaderboardCategoryScene', { type: 'survive' }) },
    ];
    items.forEach(it => this.buttons.push(this.createWidePill(it.label, () => { this.playSound('sfx_click'); it.go(); }, 0.86, heightPx)));
    this.layoutPillsCentered(this.buttons, heightPx, Math.round(heightPx * 0.2));
  }

  public override draw() {
    this.ensureBackIcon(true);
    this.setTitle(t('leaderboard') ?? 'LeaderBoard');
    const heightPx = Math.max(48, Math.round(Math.min(this.scale.width, this.scale.height) * 0.06));
    this.layoutPillsCentered(this.buttons, heightPx, Math.round(heightPx * 0.2));
  }
}
