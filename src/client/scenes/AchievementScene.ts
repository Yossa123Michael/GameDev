import { BaseScene } from './BaseScene';
import { t } from '../lib/i18n';

export class AchievementScene extends BaseScene {
  private titlePanel?: Phaser.GameObjects.Graphics;
  private titleText?: Phaser.GameObjects.Text;
  private groups: { key: string; label: Phaser.GameObjects.Text; panel: Phaser.GameObjects.Graphics; }[] = [];
  private sectionDefs = [
    { key: 'achievementSectionStart' },
    { key: 'achievementSectionScore' },
    { key: 'achievementSectionCombo' },
    { key: 'achievementSectionCollect' },
  ];

  public override create() {
    super.create();
    this.createCommonButtons('MainMenuScene');

    // Panel latar untuk header (judul) supaya tidak tembus
    const panelWidth = Math.round(this.scale.width * 0.92);
    const panelHeight = 80;
    this.titlePanel = this.add.graphics();
    this.titlePanel.lineStyle(2, 0x000000, 1).fillStyle(0xffffff, 1);
    this.titlePanel.fillRoundedRect(this.centerX - panelWidth / 2, 60, panelWidth, panelHeight, 20);
    this.titlePanel.strokeRoundedRect(this.centerX - panelWidth / 2, 60, panelWidth, panelHeight, 20);

    this.titleText = this.add.text(this.centerX, 100, t('achievementTitle'), {
      fontFamily: 'Nunito', fontSize: '36px', color: '#000'
    }).setOrigin(0.5).setDepth(5);

    let y = 180;
    for (const def of this.sectionDefs) {
      const label = this.add.text(this.centerX, y, t(def.key as any), {
        fontFamily: 'Nunito', fontSize: '24px', color: '#000'
      }).setOrigin(0.5);

      const catPanelW = Math.round(this.scale.width * 0.92);
      const catPanelH = 140;
      const panel = this.add.graphics();
      panel.lineStyle(2, 0x000000, 1).fillStyle(0xffffff, 1);
      panel.fillRoundedRect(this.centerX - catPanelW / 2, y - 40, catPanelW, catPanelH, 20);
      panel.strokeRoundedRect(this.centerX - catPanelW / 2, y - 40, catPanelW, catPanelH, 20);
      panel.setDepth(-1);

      this.groups.push({ key: def.key, label, panel });

      // TODO: Render icon/pencapaian Anda di sini (posisi relatif y)
      // Contoh:
      // this.add.text(this.centerX - 300, y + 10, 'Icon', { fontFamily: 'Nunito', fontSize: '20px', color: '#000' }).setOrigin(0.5);

      y += catPanelH + 40;
    }

    this.game.events.on('lang:changed', this.relabel, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.game.events.off('lang:changed', this.relabel, this);
    });
  }

  private relabel() {
    this.titleText?.setText(t('achievementTitle'));
    for (const g of this.groups) {
      g.label.setText(t(g.key as any));
    }
  }

  public override draw() {
    const panelWidth = Math.round(this.scale.width * 0.92);
    this.titlePanel?.clear();
    this.titlePanel?.lineStyle(2, 0x000000, 1).fillStyle(0xffffff, 1);
    this.titlePanel?.fillRoundedRect(this.centerX - panelWidth / 2, 60, panelWidth, 80, 20);
    this.titlePanel?.strokeRoundedRect(this.centerX - panelWidth / 2, 60, panelWidth, 80, 20);

    this.titleText?.setPosition(this.centerX, 100);

    let y = 180;
    for (const g of this.groups) {
      g.label.setPosition(this.centerX, y);
      const catPanelW = Math.round(this.scale.width * 0.92);
      const catPanelH = 140;
      g.panel.clear();
      g.panel.lineStyle(2, 0x000000, 1).fillStyle(0xffffff, 1);
      g.panel.fillRoundedRect(this.centerX - catPanelW / 2, y - 40, catPanelW, catPanelH, 20);
      g.panel.strokeRoundedRect(this.centerX - catPanelW / 2, y - 40, catPanelW, catPanelH, 20);
      y += catPanelH + 40;
    }
  }
}
