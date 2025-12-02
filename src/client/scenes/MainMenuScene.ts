import { BaseScene } from './BaseScene';
import { t } from '../lib/i18n';

export class MainMenuScene extends BaseScene {
  private titleText?: Phaser.GameObjects.Text;
  private playBtn?: Phaser.GameObjects.Container;
  private optionsBtn?: Phaser.GameObjects.Container;
  private leaderboardBtn?: Phaser.GameObjects.Container;
  private achievementBtn?: Phaser.GameObjects.Container;
  private quitBtn?: Phaser.GameObjects.Container;

  constructor() { super('MainMenuScene'); }

  public override create() {
    super.create();
    // Back button is hidden in BaseScene for MainMenuScene

    this.titleText = this.add.text(this.centerX, 100, t('mainPlay'), {
      fontFamily: 'Nunito', fontSize: '36px', color: '#000'
    }).setOrigin(0.5);

    let y = 180;
    this.playBtn = this.createButton(y, t('mainPlay'), () => this.scene.start('PilihModeScene'));
    this.sceneContentGroup.add(this.playBtn);
    y += 70;

    this.optionsBtn = this.createButton(y, t('mainOptions'), () => this.scene.start('OptionScene'));
    this.sceneContentGroup.add(this.optionsBtn);
    y += 70;

    this.leaderboardBtn = this.createButton(y, t('mainLeaderboard'), () => this.scene.start('LeaderboardScene'));
    this.sceneContentGroup.add(this.leaderboardBtn);
    y += 70;

    this.achievementBtn = this.createButton(y, t('mainAchievement'), () => this.scene.start('AchievementScene'));
    this.sceneContentGroup.add(this.achievementBtn);
    y += 70;

    this.quitBtn = this.createButton(y, t('mainQuit'), () => {
      // optional: window.close or navigate
    });
    this.sceneContentGroup.add(this.quitBtn);

    this.game.events.on('lang:changed', this.relabel, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.game.events.off('lang:changed', this.relabel, this);
    });
  }

  private relabel = () => {
    this.titleText?.setText(t('mainPlay'));
    (this.playBtn?.getAt(1) as Phaser.GameObjects.Text | undefined)?.setText(t('mainPlay'));
    (this.optionsBtn?.getAt(1) as Phaser.GameObjects.Text | undefined)?.setText(t('mainOptions'));
    (this.leaderboardBtn?.getAt(1) as Phaser.GameObjects.Text | undefined)?.setText(t('mainLeaderboard'));
    (this.achievementBtn?.getAt(1) as Phaser.GameObjects.Text | undefined)?.setText(t('mainAchievement'));
    (this.quitBtn?.getAt(1) as Phaser.GameObjects.Text | undefined)?.setText(t('mainQuit'));
  };

  public override draw() {
    this.titleText?.setPosition(this.centerX, 100);
    let y = 180;
    this.playBtn?.setPosition(this.centerX, y); y += 70;
    this.optionsBtn?.setPosition(this.centerX, y); y += 70;
    this.leaderboardBtn?.setPosition(this.centerX, y); y += 70;
    this.achievementBtn?.setPosition(this.centerX, y); y += 70;
    this.quitBtn?.setPosition(this.centerX, y);
  }
}
