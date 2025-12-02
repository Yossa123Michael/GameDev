// Tambahkan toggle bahasa di OptionScene (atau buat scene terpisah)
// Jika Anda sudah punya OptionScene, gabungkan bagian setLang berikut.
import { BaseScene } from './BaseScene';
import { t, getLang, nextLang, setLang } from '../lib/i18n';

export class OptionScene extends BaseScene {
  public override create() {
    super.create();
    this.createCommonButtons('MainMenuScene');

    const label = this.add.text(this.centerX, 120, t('language'), {
      fontFamily: 'Nunito', fontSize: '28px', color: '#000'
    }).setOrigin(0.5);

    const btn = this.buildButton(this.centerX, 180, `${getLang() === 'id' ? t('indonesian') : t('english')}`);
    btn.setInteractive({ useHandCursor: true }).on('pointerup', () => {
      const lang = nextLang();
      setLang(lang);
      // Perbarui label tombol
      btn.getAt(1)?.destroy?.(); // text lama
      const text = this.add.text(0, 0, `${lang === 'id' ? t('indonesian') : t('english')}`, {
        fontFamily: 'Nunito', fontSize: '22px', color: '#000'
      }).setOrigin(0.5);
      btn.add(text);

      // Minta redraw scene yang menggunakan i18n (misal Leaderboard)
      this.scene.get('LeaderboardScene')?.events.emit('redraw-request');
    });
  }

  // Utility sederhana buat tombol bundar
  private buildButton(x: number, y: number, label: string) {
    const width = Math.round(this.scale.width * 0.5);
    const height = 50;
    const c = this.add.container(x, y);
    const g = this.add.graphics();
    g.lineStyle(2, 0x000000, 1).fillStyle(0xffffff, 1);
    g.fillRoundedRect(-width / 2, -height / 2, width, height, 16);
    g.strokeRoundedRect(-width / 2, -height / 2, width, height, 16);
    const text = this.add.text(0, 0, label, { fontFamily: 'Nunito', fontSize: '22px', color: '#000' }).setOrigin(0.5);
    c.add([g, text]);
    return c;
  }
}
