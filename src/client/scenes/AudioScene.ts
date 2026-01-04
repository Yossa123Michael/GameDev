import Phaser from 'phaser';
import { SettingsManager } from '../lib/Settings';

const EVENT_UPDATE_AUDIO = 'rk:updateAudio';

export class AudioScene extends Phaser.Scene {
  private bgm?: Phaser.Sound.BaseSound;

  constructor() {
    super('AudioScene');
  }

  preload() {
    // Kalau kamu tetap mau preload di BaseScene, bagian ini boleh dikosongkan.
    this.load.audio('bgm', 'assets/Sounds/Backsound.wav');
  }

  create() {
    const s = SettingsManager.get();

    this.bgm = this.sound.add('bgm', {
      loop: true,
      volume: s.musicVol ?? 0.8,
    });

    if (s.musicOn) {
      this.bgm.play();
    }

    this.applySettings();

    // Dengarkan event global dari window
    window.addEventListener(EVENT_UPDATE_AUDIO, this.onUpdateFromGlobal);
  }

  private applySettings() {
    const s = SettingsManager.get();
    if (!this.bgm) return;

    (this.bgm as any).setVolume?.(s.musicVol ?? 0.8);
    (this.bgm as any).setMute?.(!s.musicOn);
  }

  // Handler untuk event global
  private onUpdateFromGlobal = () => {
    const s = SettingsManager.get();

    if (!this.bgm || !(this.bgm as any).scene) {
      // Kalau belum ada BGM dan musik di-On-kan, buat sekali
      this.bgm = this.sound.add('bgm', {
        loop: true,
        volume: s.musicVol ?? 0.8,
      });
      if (s.musicOn) {
        this.bgm.play();
      }
    }

    this.applySettings();
  };

  shutdown() {
    window.removeEventListener(EVENT_UPDATE_AUDIO, this.onUpdateFromGlobal);
  }
}

// helper supaya scene lain bisa minta update audio
export function emitGlobalAudioUpdate() {
  window.dispatchEvent(new Event(EVENT_UPDATE_AUDIO));
}
