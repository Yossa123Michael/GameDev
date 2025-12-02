import { BaseScene } from './BaseScene';
import { t } from '../lib/i18n';

export class PilihKesulitanScene extends BaseScene {
  private titleText?: Phaser.GameObjects.Text;
  private easyBtn?: Phaser.GameObjects.Container;
  private mediumBtn?: Phaser.GameObjects.Container;
  private hardBtn?: Phaser.GameObjects.Container;

  public override create() {
    super.create();
    this.createCommonButtons('PilihModeScene');

    this.titleText = this.add.text(this.centerX, 90, t('chooseDifficultyTitle'), {
      fontFamily: 'Nunito', fontSize: '36px', color: '#000'
    }).setOrigin(0.5);

    let y = 170;
    this.easyBtn = this.createButton(y, t('diffEasy'), () => {
      this.playSound('sfx_click', { volume: 0.7 });
      this.scene.start('GameScene', { difficulty: 'easy' });
    });
    this.sceneContentGroup.add(this.easyBtn);
    y += Math.max(55, Math.round(this.scale.height * 0.10));

    this.mediumBtn = this.createButton(y, t('diffMedium'), () => {
      this.playSound('sfx_click', { volume: 0.7 });
      this.scene.start('GameScene', { difficulty: 'medium' });
    });
    this.sceneContentGroup.add(this.mediumBtn);
    y += Math.max(55, Math.round(this.scale.height * 0.10));

    this.hardBtn = this.createButton(y, t('diffHard'), () => {
      this.playSound('sfx_click', { volume: 0.7 });
      this.scene.start('GameScene', { difficulty: 'hard' });
    });
    this.sceneContentGroup.add(this.hardBtn);

    this.game.events.on('lang:changed', this.relabel, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.game.events.off('lang:changed', this.relabel, this);
    });
  }

  private relabel = () => {
    this.titleText?.setText(t('chooseDifficultyTitle'));
    const eTxt = this.easyBtn?.getAt(1) as Phaser.GameObjects.Text | undefined;
    const mTxt = this.mediumBtn?.getAt(1) as Phaser.GameObjects.Text | undefined;
    const hTxt = this.hardBtn?.getAt(1) as Phaser.GameObjects.Text | undefined;
    eTxt?.setText(t('diffEasy'));
    mTxt?.setText(t('diffMedium'));
    hTxt?.setText(t('diffHard'));
  };

  public override draw() {
    this.titleText?.setPosition(this.centerX, 90);
    let y = 170;
    this.easyBtn?.setPosition(this.centerX, y);
    y += Math.max(55, Math.round(this.scale.height * 0.10));
    this.mediumBtn?.setPosition(this.centerX, y);
    y += Math.max(55, Math.round(this.scale.height * 0.10));
    this.hardBtn?.setPosition(this.centerX, y);
  }
}
