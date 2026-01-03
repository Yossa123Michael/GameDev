import { BaseScene } from './BaseScene';
import { t } from '../lib/i18n';

type ModeKey = 'classic' | 'survive';

export class LeaderboardScene extends BaseScene {
  private emptyText?: Phaser.GameObjects.Text;
  private mode: ModeKey = 'classic';
  private difficulty: string | null = null;

  constructor() {
    super('LeaderboardScene');
  }

  init(data: { mode?: ModeKey; difficulty?: string | null }) {
    if (data?.mode) this.mode = data.mode;
    this.difficulty =
      typeof data?.difficulty === 'string' || data?.difficulty === null
        ? data.difficulty
        : null;
  }

  public override create() {
    super.create();
    this.ensureBackIcon(true);
    this.setTitle('LeaderBoard');

    const fontSize = Math.max(
      16,
      Math.round(Math.min(this.scale.width, this.scale.height) * 0.03),
    );

    const label =
      this.mode === 'survive'
        ? 'Belum ada leaderboard untuk mode Survive.'
        : 'Belum ada leaderboard.';

    this.emptyText = this.add
      .text(
        this.centerX,
        this.getContentAreaTop() +
          Math.round(this.getContentAreaHeight() / 2),
        label,
        {
          fontFamily: 'Nunito',
          fontSize: `${fontSize}px`,
          color: '#888',
          align: 'center',
        },
      )
      .setOrigin(0.5);
  }

public override draw() {
  // header
  this.ensureBackIcon(true);
  this.layoutTitleArea();
  this.setTitle(t('leaderboardTitle') ?? 'Papan Skor');

  // kalau belum ada baris, tidak perlu apa-apa
  if (!this.rows || this.rows.length === 0) return;

  const base = Math.min(this.scale.width, this.scale.height);
  const rowH = Math.max(40, Math.round(base * 0.05));
  const gap = Math.round(rowH * 0.22);

  this.layoutPillsCentered(
    this.rows,
    rowH,
    gap,
  );
}
}
