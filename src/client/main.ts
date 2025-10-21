// File: src/client/main.ts
// (Tidak perlu import Phaser jika tidak dipakai langsung di sini)

// Import semua scene
import { MainMenuScene } from './scenes/MainMenuScene';
import { PilihModeScene } from './scenes/PilihModeScene';
import { PilihKesulitanScene } from './scenes/PilihKesulitanScene';
import { Game } from './scenes/GameScene';
import { ResultsScene } from './scenes/ResultsScene';

// Ganti import scene placeholder ke nama kelas yang benar
import { LeaderboardScene } from './scenes/LeaderboardScene';
import { AchievementScene } from './scenes/AchievementScene'; // Ganti nama kelas
import { OptionScene } from './scenes/OptionScene';          // Ganti nama kelas
import { CreditScene } from './scenes/CreditScene';          // Ganti nama kelas

// Pastikan Phaser diimpor jika config membutuhkannya
import Phaser from 'phaser';

// Konfigurasi game
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  // backgroundColor: '#ffffff', // Dihapus karena BaseScene menambahkan background image

  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },

  // Pastikan semua scene terdaftar dengan nama kelas yang benar
  scene: [
    MainMenuScene,
    PilihModeScene,
    PilihKesulitanScene,
    Game,
    ResultsScene,
    LeaderboardScene,
    AchievementScene, // Nama kelas sudah diganti
    OptionScene,      // Nama kelas sudah diganti
    CreditScene,      // Nama kelas sudah diganti
  ],
};

// Buat instance game baru
new Phaser.Game(config);
