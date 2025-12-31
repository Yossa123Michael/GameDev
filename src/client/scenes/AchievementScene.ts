import { BaseScene } from './BaseScene';
import { t } from '../lib/i18n';

export class AchievementScene extends BaseScene {
  private rows: Phaser.GameObjects.Container[] = [];

  constructor() {
    super('AchievementScene');
  }

  public override create() {
    super.create();

    this.ensureBackIcon(true);
    this.setTitle(t('achievementTitle') ?? 'Achievement');

    try { this.rows.forEach(r => r.destroy()); } catch {}
    this.rows = [];

    const heightPx = Math.max(
      48,
      Math.round(Math.min(this.scale.width, this.scale.height) * 0.06),
    );

    const makeSectionLabel = (key: keyof typeof import('../lib/i18n').dicts['id']) => {
      const text = t(key);
      const lbl = this.add
        .text(this.centerX, 0, text, {
          fontFamily: 'Nunito',
          fontSize: `${Math.max(16, Math.round(heightPx * 0.4))}px`,
          color: '#000000',
        })
        .setOrigin(0.5);
      return this.add.container(0, 0, [lbl]);
    };

    const items: Phaser.GameObjects.Container[] = [];

    items.push(
      makeSectionLabel('achievementSectionStart'),
      this.createWidePill('Icon • Icon • Icon', () => {}, 0.86, heightPx),
      this.createWidePill('Icon • Icon • Icon', () => {}, 0.86, heightPx),
      makeSectionLabel('achievementSectionScore'),
      this.createWidePill('Icon • Icon • Icon', () => {}, 0.86, heightPx),
      makeSectionLabel('achievementSectionCombo'),
      this.createWidePill('Icon • Icon • Icon', () => {}, 0.86, heightPx),
      makeSectionLabel('achievementSectionCollect'),
      this.createWidePill('Icon • Icon • Icon', () => {}, 0.86, heightPx),
    );

    this.rows = items;

    this.layoutPillsCentered(
      this.rows,
      heightPx,
      Math.round(heightPx * 0.22),
    );
  }

  public override draw() {
    if (!this.rows || this.rows.length === 0) return;

    this.ensureBackIcon(true);
    this.setTitle(t('achievementTitle') ?? 'Achievement');

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
