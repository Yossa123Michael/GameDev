import Phaser from 'phaser';
import { SettingsManager } from '../lib/Settings';
const LS_KEY = 'rk:settings';
function readSettingsLS() {
    try {
        const raw = localStorage.getItem(LS_KEY);
        if (!raw)
            return {};
        return JSON.parse(raw);
    }
    catch {
        return {};
    }
}
function writeSettingsLS(patch) {
    try {
        const cur = readSettingsLS();
        const next = { ...cur, ...patch };
        localStorage.setItem(LS_KEY, JSON.stringify(next));
        try {
            SettingsManager.save(patch);
        }
        catch { }
        return next;
    }
    catch {
        return readSettingsLS();
    }
}
export class BaseScene extends Phaser.Scene {
    constructor() {
        super(...arguments);
        this.handleResize = (gameSize) => {
            if (!this.cameras || !this.cameras.main || !this.scale)
                return;
            const { width, height } = gameSize;
            this.cameras.main.setViewport(0, 0, width, height);
            const bg = this.children.getByName?.('background_base');
            if (bg)
                bg.setDisplaySize(width, height).setPosition(width / 2, height / 2);
            this.updateCenter();
            this.layoutCommonButtons();
            if (typeof this.draw === 'function') {
                try {
                    this.draw();
                }
                catch (e) {
                    console.warn('draw() on resize failed:', e);
                }
            }
        };
    }
    preload() {
        this.load.image('background', 'assets/Images/Asset 8.png');
        this.load.image('logo', 'assets/Images/Asset 7.png');
        this.load.image('back_arrow', 'assets/Images/Back.png');
        this.load.audio('bgm', 'assets/Sounds/Backsound.wav');
        this.load.audio('sfx_click', 'assets/Sounds/Click.mp3');
        this.load.audio('sfx_correct', 'assets/Sounds/Right.mp3');
        this.load.audio('sfx_incorrect', 'assets/Sounds/Wrong.mp3');
        console.log('BaseScene preload finished.');
    }
    create() {
        console.log('BaseScene create starting...');
        this.updateCenter();
        if (this.cameras && this.cameras.main) {
            this.cameras.main.setViewport(0, 0, this.scale.width, this.scale.height);
        }
        try {
            this.add
                .image(this.centerX, this.centerY, 'background')
                .setName('background_base')
                .setDisplaySize(this.scale.width, this.scale.height)
                .setDepth(-1);
        }
        catch (e) {
            console.error('Gagal membuat background image:', e);
            this.add
                .rectangle(this.centerX, this.centerY, this.scale.width, this.scale.height, 0x000000)
                .setOrigin(0.5)
                .setDepth(-1);
        }
        this.sceneContentGroup = this.add.group().setName('sceneContentGroup_base');
        this.scale.on('resize', this.handleResize, this);
        this.events.once('shutdown', () => {
            this.scale.off('resize', this.handleResize, this);
            try {
                this.settingsUnsub?.();
            }
            catch { }
        });
        this.renderer.on('contextrestored', () => {
            console.log(`WebGL Context Restored for scene: ${this.scene.key}`);
            this.handleResize(this.scale.gameSize);
        });
        // Terapkan state awal dari localStorage (ground truth)
        const sLS = readSettingsLS();
        const musicOn = sLS.musicOn ?? true;
        if (!BaseScene.backgroundMusic && musicOn) {
            if (this.cache.audio.exists('bgm')) {
                BaseScene.backgroundMusic = this.sound.add('bgm', { loop: true, volume: sLS.musicVol ?? 0.5 });
                try {
                    BaseScene.backgroundMusic.play();
                }
                catch { }
            }
            else {
                console.warn("Audio key 'bgm' not found.");
            }
        }
        else if (BaseScene.backgroundMusic && !musicOn) {
            BaseScene.backgroundMusic.pause();
        }
        else if (BaseScene.backgroundMusic && musicOn && !BaseScene.backgroundMusic.isPlaying) {
            BaseScene.backgroundMusic.resume();
        }
        try {
            BaseScene.backgroundMusic?.setVolume?.(sLS.musicVol ?? 0.5);
        }
        catch { }
        this.createCommonButtons();
        // Unlock audio setelah gesture pertama
        this.input?.once?.('pointerdown', () => {
            try {
                this.sound.unlock();
                if (BaseScene.backgroundMusic && (readSettingsLS().musicOn ?? true) && !BaseScene.backgroundMusic.isPlaying) {
                    BaseScene.backgroundMusic.play();
                }
            }
            catch { }
        });
        // Subscribe agar bila Options mengubah settings, kita update musik
        this.settingsUnsub = SettingsManager.subscribe((ns) => {
            try {
                if (BaseScene.backgroundMusic) {
                    if (ns.musicOn) {
                        try {
                            if (!BaseScene.backgroundMusic.isPlaying)
                                BaseScene.backgroundMusic.resume();
                        }
                        catch { }
                    }
                    else {
                        try {
                            BaseScene.backgroundMusic.pause();
                        }
                        catch { }
                    }
                    try {
                        BaseScene.backgroundMusic?.setVolume?.(ns.musicVol ?? 0.5);
                    }
                    catch { }
                }
                else if (ns.musicOn) {
                    if (this.cache.audio.exists('bgm')) {
                        BaseScene.backgroundMusic = this.sound.add('bgm', { loop: true, volume: ns.musicVol ?? 0.5 });
                        try {
                            BaseScene.backgroundMusic.play();
                        }
                        catch { }
                    }
                }
            }
            catch { }
        });
        console.log('BaseScene create finished.');
        this.time.delayedCall(0, () => {
            if (typeof this.draw === 'function') {
                try {
                    this.draw();
                }
                catch (e) {
                    console.warn('deferred draw() failed:', e);
                }
            }
        });
    }
    updateCenter() {
        this.centerX = Math.floor(this.scale.width / 2);
        this.centerY = Math.floor(this.scale.height / 2);
    }
    getUIIconMetrics() {
        const sMin = Math.min(this.scale.width, this.scale.height);
        const pad = Phaser.Math.Clamp(Math.round(sMin * 0.02), 8, 48);
        const iconSize = Phaser.Math.Clamp(Math.round(sMin * 0.06), 24, 128);
        return { pad, iconSize };
    }
    createCommonButtons(targetBackSceneKey) {
        try {
            if (this.backButton) {
                this.backButton.destroy?.();
                this.backButton = undefined;
            }
        }
        catch { }
        const { pad, iconSize } = this.getUIIconMetrics();
        // HILANGKAN back button khusus di MainMenuScene
        if (this.scene.key === 'MainMenuScene') {
            this.backButton = undefined;
            return;
        }
        // Only create back button (if asset exists)
        if (this.textures.exists('back_arrow')) {
            this.backButton = this.add
                .image(pad, pad, 'back_arrow')
                .setOrigin(0, 0)
                .setInteractive({ useHandCursor: true })
                .setDisplaySize(iconSize, iconSize);
            this.backButton.on('pointerup', () => {
                let target = targetBackSceneKey || 'MainMenuScene';
                if (this.scene.key === 'PilihModeScene')
                    target = 'MainMenuScene';
                else if (this.scene.key === 'PilihKesulitanScene')
                    target = 'PilihModeScene';
                else if (this.scene.key === 'GameScene')
                    target = 'PilihKesulitanScene';
                else if (this.scene.key === 'ResultsScene')
                    target = 'MainMenuScene';
                try {
                    this.playSound('sfx_click', { volume: 0.7 });
                }
                catch { }
                if (target === 'PilihKesulitanScene' && this.mode)
                    this.scene.start(target, { mode: this.mode });
                else
                    this.scene.start(target);
            });
        }
        else {
            const g = this.add.rectangle(pad, pad, iconSize, iconSize, 0x333333).setOrigin(0, 0);
            g.setVisible(false);
            this.backButton = g;
        }
        this.layoutCommonButtons();
    }
    layoutCommonButtons() {
        const { pad, iconSize } = this.getUIIconMetrics();
        try {
            this.backButton?.setPosition(pad, pad).setDisplaySize(iconSize, iconSize);
        }
        catch { }
    }
    // SFX aware settings
    playSound(key, config) {
        const s = readSettingsLS();
        if (s.sfxOn === false)
            return;
        const vol = (config?.volume ?? 1) * (s.sfxVol ?? 1);
        try {
            if (this.cache.audio.exists(key))
                this.sound.play(key, { ...config, volume: vol });
        }
        catch { }
    }
    createButton(y, label, onClick) {
        const width = Math.round(this.scale.width * 0.86);
        const height = Math.max(48, Math.round(this.scale.height * 0.08));
        const radius = Math.min(24, Math.floor(height * 0.35));
        const container = this.add.container(this.centerX, y);
        container.width = width;
        container.height = height;
        const g = this.add.graphics();
        this.updateButtonGraphics(g, width, height, 0xffffff, 0x000000, 3, radius);
        container.add(g);
        const txt = this.add.text(0, 0, label, {
            fontFamily: 'Nunito',
            fontSize: `${Math.max(16, Math.floor(height * 0.38))}px`,
            color: '#000',
            align: 'center',
            wordWrap: { width: Math.floor(width * 0.9) }
        }).setOrigin(0.5);
        container.add(txt);
        const zone = this.add.zone(0, 0, width, height).setOrigin(0.5);
        zone.setInteractive({ useHandCursor: true });
        container.add(zone);
        zone.on('pointerover', () => this.updateButtonGraphics(g, width, height, 0xf5f5f5));
        zone.on('pointerout', () => this.updateButtonGraphics(g, width, height, 0xffffff));
        zone.on('pointerdown', () => this.updateButtonGraphics(g, width, height, 0xdddddd));
        zone.on('pointerup', () => {
            this.updateButtonGraphics(g, width, height, 0xf5f5f5);
            this.playSound('sfx_click', { volume: 0.7 });
            onClick?.();
        });
        container.setSize(width, height);
        return container;
    }
    updateButtonGraphics(graphics, width, height, fillColor, strokeColor = 0x000000, strokeWidth = 3, radius = Math.min(24, Math.floor(height * 0.35))) {
        graphics.clear();
        graphics.lineStyle(strokeWidth, strokeColor, 1);
        graphics.fillStyle(fillColor, 1);
        const x = -width / 2;
        const y = -height / 2;
        graphics.fillRoundedRect(x, y, width, height, radius);
        graphics.strokeRoundedRect(x, y, width, height, radius);
    }
    isPointerOver(pointer, gameObject) {
        const bounds = gameObject.getBounds?.();
        if (!bounds)
            return false;
        return bounds.contains(pointer.x, pointer.y);
    }
    draw() {
        if (this.sceneContentGroup) {
            this.sceneContentGroup.clear(true, true);
        }
        else {
            this.sceneContentGroup = this.add.group().setName('sceneContentGroup_base_fallback');
        }
    }
}
BaseScene.backgroundMusic = null;
