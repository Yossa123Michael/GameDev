import Phaser from 'phaser';

// Import semua scene
import { MainMenuScene } from './scenes/MainMenuScene';
import { PilihModeScene } from './scenes/PilihModeScene';
import { PilihKesulitanScene } from './scenes/PilihKesulitanScene';
import { Game } from './scenes/GameScene';
import { ResultsScene } from './scenes/ResultsScene';

// Import scene placeholder
import { LeaderboardScene } from './scenes/LeaderboardScene';
import { AchievementScene } from './scenes/AchievementScene';
import { OptionScene } from './scenes/OptionScene';
import { CreditScene } from './scenes/CreditScene';

// Konfigurasi game
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#ffffff',

  // --- INI BAGIAN PERBAIKANNYA ---
  scale: {
    mode: Phaser.Scale.FIT, // Otomatis sesuaikan ukuran (fit)
    autoCenter: Phaser.Scale.CENTER_BOTH, // Posisikan di tengah
    width: 800,  // Ini jadi ukuran 'logis' game Anda
    height: 600, // Ini jadi ukuran 'logis' game Anda
  },
  // --- AKHIR PERBAIKAN ---

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
