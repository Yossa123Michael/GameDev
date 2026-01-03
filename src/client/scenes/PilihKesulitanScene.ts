import { BaseScene } from './BaseScene';
import { t, getLang } from '../lib/i18n';

function currentLangIsId() {
  return getLang() === 'id';
}

export class PilihKesulitanScene extends BaseScene {
  private mode: 'belajar' | 'survive' = 'belajar';
  private buttons: Phaser.GameObjects.Container[] = [];

  constructor() {
    super('PilihKesulitanScene');
  }

  init(data: { mode?: 'belajar' | 'survive' }) {
    if (data?.mode) this.mode = data.mode;
  }

  public override create() {
    super.create();

    this.ensureBackIcon(true);
    this.setTitle(t('chooseDifficultyTitle') ?? 'Pilih tingkat Kesulitan');

    this.buttons = [];

    const heightPx = Math.max(
      52,
      Math.round(Math.min(this.scale.width, this.scale.height) * 0.07),
    );

    const items = [
  {
    label: currentLangIsId() ? 'Mudah' : 'Easy',
    go: () =>
      this.scene.start('Game', {
        mode: this.mode,
        difficulty: 'mudah',
      }),
  },
  {
    label: currentLangIsId() ? 'Menengah' : 'Medium',
    go: () =>
      this.scene.start('Game', {
        mode: this.mode,
        difficulty: 'menengah',
      }),
  },
  {
    label: currentLangIsId() ? 'Sulit' : 'Hard',
    go: () =>
      this.scene.start('Game', {
        mode: this.mode,
        difficulty: 'sulit',
      }),
  },
  {
    label: 'Pro',
    go: () =>
      this.scene.start('Game', {
        mode: this.mode,
        difficulty: 'pro',
      }),
  },
];

    this.buttons = items.map(it =>
      this.createWidePill(
        it.label,
        () => {
          this.playSound('sfx_click');
          it.go();
        },
        0.86,
        heightPx,
      ),
    );

    this.layoutPillsCentered(
      this.buttons,
      heightPx,
      Math.round(heightPx * 0.2),
    );
  }

  public override draw() {
    this.ensureBackIcon(true);

    this.layoutTitleArea();
    this.setTitle(t('Choose Difficulty') ?? 'Pilih tingkat Kesulitan');

    if (!this.buttons || this.buttons.length === 0) return;

    const heightPx = Math.max(
      52,
      Math.round(Math.min(this.scale.width, this.scale.height) * 0.07),
    );
    this.layoutPillsCentered(
      this.buttons,
      heightPx,
      Math.round(heightPx * 0.2),
    );
  }
}
