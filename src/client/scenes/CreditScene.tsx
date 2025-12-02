import Phaser from 'phaser';
import { t } from '../lib/i18n';

export default class CreditScene extends Phaser.Scene {
  constructor() {
    // Pastikan key unik dan sesuai dengan yang terdaftar di main.ts
    super('CreditScene');
  }

  preload() {
    // muat asset jika perlu
  }

  create() {
    // konten scene
    const title = this.add.text(this.scale.width / 2, 90, t('creditTitle'), {
      fontFamily: 'Nunito',
      fontSize: '48px',
      color: '#000',
    }).setOrigin(0.5);

    // listen bahasa agar relabel
    this.game.events.on('lang:changed', () => {
      title.setText(t('creditTitle'));
      // relabel teks lain juga di sini jika ada
    });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.game.events.off('lang:changed', () => {});
    });
  }
}
