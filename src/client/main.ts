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

console.log('main.ts loaded');

(function patchPhaserScene() {
  try {
    const originalAdd = (Phaser as any).Scenes.SceneManager.prototype.add;
    (Phaser as any).Scenes.SceneManager.prototype.add = function (key: string, scene: any, autoStart: boolean) {
      if (!key || key === 'default') {
        console.error('MENDETEKSI PENDAFTARAN SCENE DENGAN KEY "default":', scene?.constructor?.name, scene);
      }
      return originalAdd.call(this, key, scene, autoStart);
    };
  } catch (e) {
    console.warn('Patch SceneManager.add gagal:', e);
  }
})();

// OPTIONAL DEBUG PATCH: log jika ada pendaftaran scene key "default"
(function patchPhaserScene() {
  try {
    const originalAdd = (Phaser as any).Scenes.SceneManager.prototype.add;
    (Phaser as any).Scenes.SceneManager.prototype.add = function (key: string, scene: any, autoStart: boolean) {
      if (!key || key === 'default') {
        console.error('MENDETEKSI PENDAFTARAN SCENE DENGAN KEY "default":', scene?.constructor?.name, scene);
      }
      return originalAdd.call(this, key, scene, autoStart);
    };
  } catch (e) {
    console.warn('Patch SceneManager.add gagal:', e);
  }
})();

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
        // Expose instance game ke window
        try {
          (window as any).__RK_GAME = this.game;
          console.log('Expose __RK_GAME dari BootScene', this.game);
        } catch (e) {
          console.warn('Gagal expose __RK_GAME:', e);
        }
        logSceneKeysOnce(this, 'active');
        this.scene.start('MainMenuScene');
      },
      inactive: async () => {
        await ensureAnonAuth();
        try {
          (window as any).__RK_GAME = this.game;
          console.log('Expose __RK_GAME dari BootScene', this.game);
        } catch (e) {
          console.warn('Gagal expose __RK_GAME:', e);
        }
        logSceneKeysOnce(this, 'inactive');
        this.scene.start('MainMenuScene');
      }
    });
  }
}

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.CANVAS,
  parent: 'game',
  scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH },
  audio: { disableWebAudio: false },
  render: { roundPixels: true, antialias: true, pixelArt: false },
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

// HMR-safe singleton
declare global { interface Window { __RK_GAME?: Phaser.Game } }
if (!window.__RK_GAME) {
  window.__RK_GAME = new Phaser.Game(config);
} else {
  console.log('Phaser Game sudah ada, tidak membuat ulang.');
}
