import { BaseScene } from './BaseScene';
import { t } from '../lib/i18n';

export class PilihModeScene extends BaseScene {
  private titleText?: Phaser.GameObjects.Text;
  private learnBtn?: Phaser.GameObjects.Container;
  private surviveBtn?: Phaser.GameObjects.Container;

  public override create() {
    super.create();
    this.createCommonButtons('MainMenuScene');

    this.titleText = this.add.text(this.centerX, 90, t('chooseModeTitle'), {
      fontFamily: 'Nunito', fontSize: '36px', color: '#000'
    }).setOrigin(0.5);

    let y = 170;
    this.learnBtn = this.createButton(y, t('modeLearn'), () => {
      this.playSound('sfx_click', { volume: 0.7 });
      this.scene.start('PilihKesulitanScene', { mode: 'learn' });
    });
    this.sceneContentGroup.add(this.learnBtn);
    y += Math.max(60, Math.round(this.scale.height * 0.12));

    this.surviveBtn = this.createButton(y, t('modeSurvive'), () => {
      this.playSound('sfx_click', { volume: 0.7 });
      this.scene.start('PilihKesulitanScene', { mode: 'survive' });
    });
    this.sceneContentGroup.add(this.surviveBtn);

    // Relabel saat bahasa berubah
    this.game.events.on('lang:changed', this.relabel, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.game.events.off('lang:changed', this.relabel, this);
    });
  }

  private relabel = () => {
    this.titleText?.setText(t('chooseModeTitle'));
    const learnTxt = this.learnBtn?.getAt(1) as Phaser.GameObjects.Text | undefined;
    const surviveTxt = this.surviveBtn?.getAt(1) as Phaser.GameObjects.Text | undefined;
    learnTxt?.setText(t('modeLearn'));
    surviveTxt?.setText(t('modeSurvive'));
  };

  public override draw() {
    this.titleText?.setPosition(this.centerX, 90);
    let y = 170;
    this.learnBtn?.setPosition(this.centerX, y);
    y += Math.max(60, Math.round(this.scale.height * 0.12));
    this.surviveBtn?.setPosition(this.centerX, y);
  }
}
