import { BaseScene } from './BaseScene';

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
    this.ensureBackIcon(true);
    this.setTitle('LeaderBoard');

    if (!this.emptyText) return;

    const fontSize = Math.max(
      16,
      Math.round(Math.min(this.scale.width, this.scale.height) * 0.03),
    );

    this.emptyText
      .setPosition(
        this.centerX,
        this.getContentAreaTop() +
          Math.round(this.getContentAreaHeight() / 2),
      )
      .setStyle({ fontSize: `${fontSize}px` });
  }
}
