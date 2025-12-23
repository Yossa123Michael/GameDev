import { BaseScene } from './BaseScene';
import { t } from '../lib/i18n';

export class PilihModeScene extends BaseScene {
  private buttons: Phaser.GameObjects.Container[] = [];
  constructor() { super('PilihModeScene'); }

  public override create() {
    super.create();
    this.ensureBackIcon(true);
    this.setTitle(t('chooseModeTitle') ?? 'Pilih Mode');

    const heightPx = Math.max(52, Math.round(Math.min(this.scale.width, this.scale.height) * 0.07));
    this.buttons = [
      this.createWidePill(t('modeLearn') ?? 'Belajar', () => { this.playSound('sfx_click'); this.scene.start('PilihKesulitanScene', { mode: 'belajar' }); }, 0.86, heightPx),
      this.createWidePill(t('modeSurvive') ?? 'Survive', () => { this.playSound('sfx_click'); this.scene.start('PilihKesulitanScene', { mode: 'survive' }); }, 0.86, heightPx),
    ];
    this.layoutPillsCentered(this.buttons, heightPx, Math.round(heightPx * 0.25));
  }

  public override draw() {
    this.ensureBackIcon(true);
    this.setTitle(t('chooseModeTitle') ?? 'Pilih Mode');
    const heightPx = Math.max(52, Math.round(Math.min(this.scale.width, this.scale.height) * 0.07));
    this.layoutPillsCentered(this.buttons, heightPx, Math.round(heightPx * 0.25));
  }
}
