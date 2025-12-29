import { BaseScene } from './BaseScene';

export class AchievementScene extends BaseScene {
  private rows: Phaser.GameObjects.Container[] = [];

  constructor() { super('AchievementScene'); }

  public override create() {
    super.create();

    this.ensureBackIcon(true);
    this.setTitle(t('achievementTitle') ?? 'Achievement');

    // PENTING: bersihkan sebelum bikin lagi
    try { this.rows.forEach(r => r.destroy()); } catch {}
    this.rows = [];

    const heightPx = Math.max(
      48,
      Math.round(Math.min(this.scale.width, this.scale.height) * 0.06),
    );

    // bangun ulang rows
    const items = [
      /* kategori A, B, dll, masing2 createWidePill atau container */
    ];

    this.rows = items.map(/* ...buat container... */);

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
