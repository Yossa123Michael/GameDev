// File: src/client/main.ts
import Phaser from 'phaser';
// Import semua scene Anda
import { MainMenuScene } from './scenes/MainMenuScene';
import { PilihModeScene } from './scenes/PilihModeScene';
import { PilihKesulitanScene } from './scenes/PilihKesulitanScene';
import { Game } from './scenes/GameScene';
import { ResultsScene } from './scenes/ResultsScene';
import { LeaderboardScene } from './scenes/LeaderboardScene';
import { AchievementScene } from './scenes/AchievementScene';
import { OptionScene } from './scenes/OptionScene';
import { CreditScene } from './scenes/CreditScene';

// --- Scene Boot untuk Font ---
class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    // Muat script WebFont loader
    this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');
  }

  create() {
    // Muat font Nunito
    (window as any).WebFont.load({
      google: {
        families: ['Nunito:700'] // Muat Nunito bold (700) - bisa ganti ke 'Nunito' jika ingin regular
      },
      active: () => {
        // Setelah font aktif, mulai MainMenuScene
        console.log('Font Nunito loaded, starting MainMenuScene...');
        this.scene.start('MainMenuScene');
      },
      inactive: () => {
         // Jika gagal, tetap mulai (akan pakai font default)
         console.warn('Gagal memuat font Nunito, menggunakan font default.');
         this.scene.start('MainMenuScene');
      }
    });
  }
}
// --- Akhir Scene Boot ---


const config: Phaser.Types.Core.GameConfig = {
  // Paksa Canvas untuk kompatibilitas mobile yang lebih baik
  type: Phaser.CANVAS,
  parent: 'game',
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  // Setting audio (opsional tapi bagus untuk mobile)
  audio: {
    disableWebAudio: false // Coba true jika ada masalah audio di mobile
  },
  scene: [
    BootScene, // <-- Mulai dari BootScene
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
