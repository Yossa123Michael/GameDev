import { BaseScene } from './BaseScene';
import { t, getLang } from '../lib/i18n';

export class PilihModeScene extends BaseScene {
  private buttons: Phaser.GameObjects.Container[] = [];

  constructor() {
    super('PilihModeScene');
  }

  public override create() {
    super.create();

    this.ensureBackIcon(true);
    this.setTitle(t('chooseModeTitle') ?? 'Choose Mode');

    try { this.buttons.forEach(b => b.destroy()); } catch {}
    this.buttons = [];

    const heightPx = Math.max(
      52,
      Math.round(Math.min(this.scale.width, this.scale.height) * 0.07),
    );

    const isId = getLang() === 'id';

    const items = [
      {
        // tanpa kata "mode"
        label: isId ? 'Belajar' : 'Learn',
        go: () =>
          this.goToScene('PilihKesulitanScene', {
            mode: 'belajar',
          }),
      },
      {
        label: isId ? 'Survive' : 'Survive',
        go: () =>
          this.goToScene('Game', {
            mode: 'survive',
            // langsung main; kamu bisa pakai difficulty default, mis. 'menengah'
            difficulty: 'menengah',
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
      Math.round(heightPx * 0.24),
    );
  }

  public override draw() {
    if (!this.buttons || this.buttons.length === 0) return;

    this.ensureBackIcon(true);

    this.layoutTitleArea();
    this.setTitle(t('Choose Mode') ?? 'Pilih Mode');

    const heightPx = Math.max(
      52,
      Math.round(Math.min(this.scale.width, this.scale.height) * 0.07),
    );
    this.layoutPillsCentered(
      this.buttons,
      heightPx,
      Math.round(heightPx * 0.24),
    );
  }
}
