import Phaser from 'phaser';
import { MainMenuScene } from './scenes/MainMenuScene';
import { PilihModeScene } from './scenes/PilihModeScene';
import { PilihKesulitanScene } from './scenes/PilihKesulitanScene';
import { Game } from './scenes/GameScene';
import { ResultsScene } from './scenes/ResultsScene';
import { LeaderboardScene } from './scenes/LeaderboardScene';
import { AchievementScene } from './scenes/AchievementScene';
import { OptionScene } from './scenes/OptionScene';
import CreditScene from './scenes/CreditScene';
import { ensureAnonAuth } from './lib/supabaseClient';

// Scene Boot untuk Font
class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }

  preload() {
    this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');
  }

  async create() {
    (window as any).WebFont.load({
      google: { families: ['Nunito:700'] },
      active: async () => {
        await ensureAnonAuth();

        // DEBUG: Tampilkan daftar scene keys yang terdaftar sebelum mulai
        const mgr: any = this.game.scene;
        const keys = mgr?.keys ? Object.keys(mgr.keys) : [];
        console.log('Scene keys terdaftar (active):', keys);

        this.scene.start('MainMenuScene');
      },
      inactive: async () => {
        await ensureAnonAuth();

        const mgr: any = this.game.scene;
        const keys = mgr?.keys ? Object.keys(mgr.keys) : [];
        console.log('Scene keys terdaftar (inactive):', keys);

        this.scene.start('MainMenuScene');
      }
    });
  }
}

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.CANVAS,
  parent: 'game',
  // KEMBALI ke RESIZE agar memenuhi kontainer tanpa letterbox.
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  audio: { disableWebAudio: false },
  render: {
    // Tetap rapikan garis saat resize
    roundPixels: true,
    antialias: true,
    pixelArt: false,
  },
  scene: [
    BootScene,
    MainMenuScene,
    PilihModeScene,
    PilihKesulitanScene,
    Game,
    ResultsScene,
    LeaderboardScene,
    AchievementScene,
    OptionScene,
    CreditScene,
  ],
};

// HMR-safe singleton game instance
declare global {
  interface Window { __RK_GAME?: Phaser.Game }
}
if (!window.__RK_GAME) {
  window.__RK_GAME = new Phaser.Game(config);
}
