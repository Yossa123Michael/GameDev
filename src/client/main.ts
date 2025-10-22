// File: src/client/main.ts
import Phaser from 'phaser';

// Import semua scene
import { BaseScene } from './scenes/BaseScene'; // Pastikan BaseScene diimpor jika diperlukan (meskipun tidak ada di array scene)
import { MainMenuScene } from './scenes/MainMenuScene';
import { PilihModeScene } from './scenes/PilihModeScene';
import { PilihKesulitanScene } from './scenes/PilihKesulitanScene';
import { Game } from './scenes/GameScene';
import { ResultsScene } from './scenes/ResultsScene';
import { LeaderboardScene } from './scenes/LeaderboardScene';
import { AchievementScene } from './scenes/AchievementScene';
import { OptionScene } from './scenes/OptionScene';
import { CreditScene } from './scenes/CreditScene';

// Konfigurasi game
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  // backgroundColor: '#ffffff', // Tidak perlu jika BaseScene punya background

  scale: {
    mode: Phaser.Scale.RESIZE, // Mode resize agar menyesuaikan layar
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },

  // Daftarkan semua scene
  scene: [
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

// Buat instance game baru
new Phaser.Game(config);
