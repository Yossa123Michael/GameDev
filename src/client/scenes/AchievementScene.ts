import { BaseScene } from './BaseScene';
import { t } from '../lib/i18n';

export class AchievementScene extends BaseScene {
  private titleText?: Phaser.GameObjects.Text;
  private groups: { key: string; label: Phaser.GameObjects.Text; panel: Phaser.GameObjects.Graphics; }[] = [];
  private sectionDefs = [
    { key: 'achievementSectionStart', original: 'Memulai' },
    { key: 'achievementSectionScore', original: 'Skor' },
    { key: 'achievementSectionCombo', original: 'Combo' },
    { key: 'achievementSectionCollect', original: 'Koleksi' },
  ];

  public override create() {
    super.create();
    this.createCommonButtons('MainMenuScene');

    this.titleText = this.add.text(this.centerX, 90, t('achievementTitle'), {
      fontFamily: 'Nunito', fontSize: '36px', color: '#000'
    }).setOrigin(0.5);

    let y = 170;
    for (const def of this.sectionDefs) {
      const label = this.add.text(this.centerX, y, t(def.key as any), {
        fontFamily: 'Nunito', fontSize: '24px', color: '#000'
      }).setOrigin(0.5);

      // Panel latar (agar tidak “tembus”)
      const panelWidth = Math.round(this.scale.width * 0.92);
      const panelHeight = 120; // tinggi kategori (sesuaikan bila dinamis)
      const panel = this.add.graphics();
      panel.lineStyle(2, 0x000000, 1).fillStyle(0xffffff, 1);
      panel.fillRoundedRect(this.centerX - panelWidth / 2, y - 40, panelWidth, panelHeight, 20);
      panel.strokeRoundedRect(this.centerX - panelWidth / 2, y - 40, panelWidth, panelHeight, 20);
      panel.setDepth(-1); // di belakang label + ikon

      // Simpan referensi untuk relabel
      this.groups.push({ key: def.key, label, panel });

      // Di sini letakkan ikon/pencapaian (posisi relatif y)
      // Contoh placeholder:
      // this.add.text(this.centerX - 300, y + 10, 'Icon', {...});
      // … (pasang ikon sesuai data Anda)

      y += panelHeight + 40;
    }

    // Listener bahasa
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
    // Re-layout panel agar responsif
    const panelWidth = Math.round(this.scale.width * 0.92);
    let y = 170;
    for (const g of this.groups) {
      g.label.setPosition(this.centerX, y);
      const panelHeight = 120;
      g.panel.clear();
      g.panel.lineStyle(2, 0x000000, 1).fillStyle(0xffffff, 1);
      g.panel.fillRoundedRect(this.centerX - panelWidth / 2, y - 40, panelWidth, panelHeight, 20);
      g.panel.strokeRoundedRect(this.centerX - panelWidth / 2, y - 40, panelWidth, panelHeight, 20);
      y += panelHeight + 40;
    }
    this.titleText?.setPosition(this.centerX, 90);
  }
}
