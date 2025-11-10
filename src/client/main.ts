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

//Scene Boot untuk Font
class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');
  }

  create() {
    (window as any).WebFont.load({
      google: { families: ['Nunito:700'] },
      active: async () => {
        await ensureAnonAuth();
        this.scene.start('MainMenuScene');
      },
      inactive: async () => {
        await ensureAnonAuth();
        this.scene.start('MainMenuScene');
      }
    });
  }
}//Scene Boot

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.CANVAS,
  parent: 'game',
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  audio: {
    disableWebAudio: false
  },
  scene: [
    BootScene,
    MainMenuScene,
    PilihModeScene,
    // Pastikan scene ini ada, sesuai error “Scene key not found”
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
