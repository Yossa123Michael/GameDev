// File: src/client/main.ts
import Phaser from 'phaser';
// Import scene LAINNYA
// import { BootScene } from './scenes/BootScene'; // <-- HAPUS BARIS INI
import { MainMenuScene } from './scenes/MainMenuScene';
import { PilihModeScene } from './scenes/PilihModeScene';
import { PilihKesulitanScene } from './scenes/PilihKesulitanScene';
import { Game } from './scenes/GameScene';
import { ResultsScene } from './scenes/ResultsScene';
import { LeaderboardScene } from './scenes/LeaderboardScene';
import { AchievementScene } from './scenes/AchievementScene';
import { OptionScene } from './scenes/OptionScene';
import { CreditScene } from './scenes/CreditScene';

// --- Scene Boot untuk Font (Definisi ada di sini) ---
class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');
  }

  create() {
    (window as any).WebFont.load({
      google: {
        families: ['Nunito:700'] // Muat Nunito bold
      },
      active: () => {
        console.log('Font Nunito loaded, starting MainMenuScene...');
        this.scene.start('MainMenuScene');
      },
      inactive: () => {
         console.warn('Gagal memuat font Nunito, menggunakan font default.');
         this.scene.start('MainMenuScene');
      }
    });
  }
}
// --- Akhir Scene Boot ---


const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.CANVAS, // Paksa Canvas
  parent: 'game',
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  audio: {
    disableWebAudio: false
  },
  scene: [
    BootScene, // Mulai dari BootScene yang didefinisikan di atas
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

new Phaser.Game(config);
