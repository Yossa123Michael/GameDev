import Phaser from 'phaser';
import { ensureAnonAuth } from './lib/supabaseClient';

import { MainMenuScene } from './scenes/MainMenuScene';
import { PilihModeScene } from './scenes/PilihModeScene';
import { PilihKesulitanScene } from './scenes/PilihKesulitanScene';
import { Game } from './scenes/GameScene';
import { ResultsScene } from './scenes/ResultsScene';
import { LeaderboardModeScene } from './scenes/LeaderboardModeScene';
import { LeaderboardCategoryScene } from './scenes/LeaderboardCategoryScene';
import { LeaderboardScene } from './scenes/LeaderboardScene';
import { AchievementScene } from './scenes/AchievementScene';
import { OptionScene } from './scenes/OptionScene';
import { CreditScene } from './scenes/CreditScene';

console.log('main.ts loaded');

class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    this.load.script(
      'webfont',
      'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js',
    );
  }

  async create() {
    (window as any).WebFont.load({
      google: { families: ['Nunito:700'] },
      active: async () => {
        try {
          await ensureAnonAuth();
        } catch (e) {
          console.error('ensureAnonAuth error (active)', e);
        }
        this.scene.start('MainMenuScene');
      },
      inactive: async () => {
        try {
          await ensureAnonAuth();
        } catch (e) {
          console.error('ensureAnonAuth error (inactive)', e);
        }
        this.scene.start('MainMenuScene');
      },
    });
  }
}

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 360,
  height: 640,
  parent: 'game',
  scale: {
    mode: Phaser.Scale.RESIZE,      // ganti FIT -> RESIZE
    autoCenter: Phaser.Scale.NO_CENTER,
  },
  scene: [
    BootScene,
    MainMenuScene,
    PilihModeScene,
    PilihKesulitanScene,
    Game,
    ResultsScene,
    LeaderboardModeScene,
    LeaderboardCategoryScene,
    LeaderboardScene,
    AchievementScene,
    OptionScene,
    CreditScene,
  ],
  audio: { disableWebAudio: false },
};

const game = new Phaser.Game(config);

declare global {
  interface Window {
    __RK_GAME?: Phaser.Game;
  }
}

if (!window.__RK_GAME) {
  window.__RK_GAME = game;
} else {
  console.log('Phaser Game sudah ada, tidak membuat ulang.');
}
