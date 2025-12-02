import { BaseScene } from './BaseScene';
import { t } from '../lib/i18n';

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

    // Safe margins yang responsif supaya logo tidak menabrak atas/tombol
    const sMin = Math.min(this.scale.width, this.scale.height);
    const topMargin = Math.max(16, Math.round(sMin * 0.06));    // jarak dari tepi atas
    const bottomMargin = Math.max(16, Math.round(sMin * 0.04)); // jarak sebelum area tombol

    // Area atas untuk logo
    const topSectionHeight = Math.max(this.scale.height * 0.28, sMin * 0.28);

    // Logo: skala agar muat di lebar 70% dan tinggi 22% layar, ambil skala terkecil
    const logoMaxW = this.scale.width * 0.7;
    const logoMaxH = this.scale.height * 0.22;
    const logo = this.add.image(this.centerX, 0, 'logo');
    const scale = Math.min(logoMaxW / logo.width, logoMaxH / logo.height);
    logo.setScale(scale);

    // Posisi logo: ada ruang topMargin di atas, dan ruang bottomMargin di bawah sebelum tombol
    const logoH = logo.height * scale;
    const logoY = topMargin + logoH / 2 + Math.max(0, topSectionHeight - topMargin - logoH - bottomMargin) * 0.5;
    logo.setPosition(this.centerX, logoY);
    this.sceneContentGroup.add(logo);

    // Area tombol di bawah logo
    const buttonCount = 5;
    const buttonAreaTop = logoY + logoH / 2 + bottomMargin;
    const buttonAreaBottom = this.scale.height * 0.96;
    const buttonAreaHeight = Math.max(120, buttonAreaBottom - buttonAreaTop);
    const buttonSlotCount = buttonCount + 1;
    const buttonSpacing = buttonAreaHeight / buttonSlotCount;
    let currentButtonY = buttonAreaTop + buttonSpacing;

    const startButton = this.createButton(currentButtonY, 'Start Test', () => this.scene.start('PilihModeScene')); currentButtonY += buttonSpacing;
    const leaderboardButton = this.createButton(currentButtonY, 'Leaderboard', () => this.scene.start('LeaderboardScene')); currentButtonY += buttonSpacing;
    const achievementButton = this.createButton(currentButtonY, 'Achievment', () => this.scene.start('AchievementScene')); currentButtonY += buttonSpacing;
    const optionButton = this.createButton(currentButtonY, 'Option', () => this.scene.start('OptionScene')); currentButtonY += buttonSpacing;
    const creditButton = this.createButton(currentButtonY, 'Credit', () => this.scene.start('CreditScene'));

    this.sceneContentGroup.addMultiple([startButton, leaderboardButton, achievementButton, optionButton, creditButton]);
  }

private relabel() {
    this.titleText?.setText(t('MainMenuTitle'));
    for (const g of this.groups) {
      g.label.setText(t(g.key as any));
    }
  }

  public override create() {
  super.create();
  // build UI
  this.relabel();
  this.game.events.on('lang:changed', this.relabel, this);
  this.events.once('shutdown', () => {
    this.game.events.off('lang:changed', this.relabel, this);
  });
}
}
