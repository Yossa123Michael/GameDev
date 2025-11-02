import { BaseScene } from './BaseScene';

export class MainMenuScene extends BaseScene {
  constructor() {
    super('MainMenuScene');
  }

  public override create() {
    super.create();
    this.draw();
  }

  public override draw() {
    super.draw();
    if (!this.sceneContentGroup) return;

    this.input.setDefaultCursor('default');

    // Layout
    const topSectionHeightRatio = 0.3125;
    const bottomSectionHeightRatio = 1 - topSectionHeightRatio;
    const topSectionHeight = this.scale.height * topSectionHeightRatio;
    const bottomSectionStartY = topSectionHeight;
    const logoY = topSectionHeight * 0.55;

    const logo = this.add.image(this.centerX, logoY, 'logo');
    const targetWidth = this.scale.width * 0.8;
    const scale = targetWidth / logo.width;
    logo.setScale(scale);
    this.sceneContentGroup.add(logo);

    // Tombol
    const buttonCount = 5;
    const buttonSlotCount = buttonCount + 1;
    const buttonAreaHeight = this.scale.height * bottomSectionHeightRatio;
    const buttonSpacing = buttonAreaHeight / buttonSlotCount;
    let currentButtonY = bottomSectionStartY + buttonSpacing;

    const startButton = this.createButton(currentButtonY, 'Start Test', () => this.scene.start('PilihModeScene')); currentButtonY += buttonSpacing;
    const leaderboardButton = this.createButton(currentButtonY, 'Leaderboard', () => this.scene.start('LeaderboardScene')); currentButtonY += buttonSpacing;
    const achievementButton = this.createButton(currentButtonY, 'Achievment', () => this.scene.start('AchievementScene')); currentButtonY += buttonSpacing;
    const optionButton = this.createButton(currentButtonY, 'Option', () => this.scene.start('OptionScene')); currentButtonY += buttonSpacing;
    const creditButton = this.createButton(currentButtonY, 'Credit', () => this.scene.start('CreditScene'));

    this.sceneContentGroup.addMultiple([startButton, leaderboardButton, achievementButton, optionButton, creditButton]);
  }
}
