import { BaseScene } from './BaseScene';
import { SettingsManager, clamp01 } from '../lib/Settings';
import { formatVersionLabel } from '../version';
import { showVersionPicker } from '../ui/VersionPicker';
export class OptionScene extends BaseScene {
    constructor() {
        super('OptionScene');
        this.opts = SettingsManager.get();
    }
    create() {
        super.create();
        super.createCommonButtons('MainMenuScene');
        // subscribe perubahan settings
        this.optsUnsub = SettingsManager.subscribe((s) => {
            this.opts = s;
            try {
                this.updateToggleLabel(this.musicToggle, `Music: ${this.opts.musicOn ? 'On' : 'Off'}`);
            }
            catch { }
            try {
                this.updateToggleLabel(this.sfxToggle, `SFX: ${this.opts.sfxOn ? 'On' : 'Off'}`);
            }
            catch { }
            try {
                this.versionText?.setText(`Version: ${formatVersionLabel(this.opts.version)}`);
            }
            catch { }
            try {
                this.applyOptions(this.opts);
            }
            catch { }
        });
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            try {
                this.optsUnsub?.();
            }
            catch { }
        });
        this.applyOptions(this.opts);
        // Title
        this.title = this.add.text(this.centerX, 90, 'Options', {
            fontFamily: 'Nunito', fontSize: '36px', color: '#000'
        }).setOrigin(0.5);
        this.sceneContentGroup.add(this.title);
        let y = 150;
        // MUSIC toggle
        this.musicToggle = this.createToggle(y, `Music: ${this.opts.musicOn ? 'On' : 'Off'}`, this.opts.musicOn, (v) => {
            SettingsManager.save({ musicOn: v });
            this.opts = SettingsManager.get();
            this.updateToggleLabel(this.musicToggle, `Music: ${v ? 'On' : 'Off'}`);
            this.applyOptions(this.opts);
        });
        if (this.musicToggle)
            this.sceneContentGroup.add(this.musicToggle);
        y += 60;
        // SFX toggle
        this.sfxToggle = this.createToggle(y, `SFX: ${this.opts.sfxOn ? 'On' : 'Off'}`, this.opts.sfxOn, (v) => {
            SettingsManager.save({ sfxOn: v });
            this.opts = SettingsManager.get();
            this.updateToggleLabel(this.sfxToggle, `SFX: ${v ? 'On' : 'Off'}`);
        });
        if (this.sfxToggle)
            this.sceneContentGroup.add(this.sfxToggle);
        y += 70;
        // Music volume
        this.musicSlider = this.createSlider(y, 'Music Volume', this.opts.musicVol, (val) => {
            SettingsManager.save({ musicVol: clamp01(val) });
            this.opts = SettingsManager.get();
            this.applyOptions(this.opts);
        });
        if (this.musicSlider)
            this.sceneContentGroup.add(this.musicSlider);
        y += 70;
        // SFX volume
        this.sfxSlider = this.createSlider(y, 'SFX Volume', this.opts.sfxVol, (val) => {
            SettingsManager.save({ sfxVol: clamp01(val) });
            this.opts = SettingsManager.get();
        });
        if (this.sfxSlider)
            this.sceneContentGroup.add(this.sfxSlider);
        y += 80;
        // Graphics Quality
        const qLabel = this.add.text(this.centerX, y, 'Graphics Quality', {
            fontFamily: 'Nunito', fontSize: '22px', color: '#000'
        }).setOrigin(0.5);
        this.sceneContentGroup.add(qLabel);
        y += 48;
        this.qualityNormal = this.createSmallButton(y, 'Normal', () => {
            SettingsManager.save({ graphics: 'normal' });
            this.opts = SettingsManager.get();
            this.applyOptions(this.opts);
            this.refreshQualityButtons();
        });
        this.qualityLow = this.createSmallButton(y, 'Low', () => {
            SettingsManager.save({ graphics: 'low' });
            this.opts = SettingsManager.get();
            this.applyOptions(this.opts);
            this.refreshQualityButtons();
        });
        if (this.qualityNormal)
            this.sceneContentGroup.add(this.qualityNormal);
        if (this.qualityLow)
            this.sceneContentGroup.add(this.qualityLow);
        this.refreshQualityButtons();
        y += 60;
        // Language (EN) — placeholder
        this.langText = this.add.text(this.centerX, y, 'Language: EN', {
            fontFamily: 'Nunito', fontSize: '20px', color: '#555'
        }).setOrigin(0.5);
        this.sceneContentGroup.add(this.langText);
        y += 50;
        // Vibration
        this.vibrateToggle = this.createToggle(y, `Vibration: ${this.opts.vibration ? 'On' : 'Off'}`, this.opts.vibration, (v) => {
            SettingsManager.save({ vibration: v });
            this.opts = SettingsManager.get();
            this.updateToggleLabel(this.vibrateToggle, `Vibration: ${v ? 'On' : 'Off'}`);
            try {
                if (v && navigator.vibrate)
                    navigator.vibrate(40);
            }
            catch { }
        });
        if (this.vibrateToggle)
            this.sceneContentGroup.add(this.vibrateToggle);
        y += 70;
        // Version row — teks + zona interaktif selebar baris (agar pasti bisa diklik)
        this.versionText = this.add.text(this.centerX, y, `Version: ${formatVersionLabel(this.opts.version)}`, {
            fontFamily: 'Nunito', fontSize: '20px', color: '#000'
        }).setOrigin(0.5).setDepth(10);
        this.sceneContentGroup.add(this.versionText);
        const rowW = Math.round(this.scale.width * 0.86);
        const rowH = Math.max(48, Math.round(this.scale.height * 0.08));
        this.versionZone = this.add.zone(this.centerX, y, rowW, rowH)
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .setDepth(9);
        this.versionZone.on('pointerup', () => {
            this.playSound('sfx_click', { volume: 0.9 });
            showVersionPicker(this, (picked) => {
                SettingsManager.save({ version: picked });
                this.opts = SettingsManager.get();
                this.versionText?.setText(`Version: ${formatVersionLabel(this.opts.version)}`);
            });
        });
        this.sceneContentGroup.add(this.versionZone);
        y += 50;
        // Reset Progress (Local)
        this.resetBtn = this.createButton(y, 'Reset Progress (Local)', () => this.openConfirm());
        if (this.resetBtn)
            this.sceneContentGroup.add(this.resetBtn);
        // Pointer cursor util atas
        this.input.off(Phaser.Input.Events.POINTER_MOVE);
        this.input.on(Phaser.Input.Events.POINTER_MOVE, (_pointer) => {
            let over = false;
            this.input.setDefaultCursor(over ? 'pointer' : 'default');
        });
        this.input.on(Phaser.Input.Events.GAME_OUT, () => this.input.setDefaultCursor('default'));
    }
    draw() {
        // Header & kontrol
        this.title?.setPosition(this.centerX, 90);
        const colX = this.centerX;
        const lineH = Math.max(52, Math.round(this.scale.height * 0.06));
        let y = 150;
        this.musicToggle?.setPosition(colX, y);
        y += lineH + 10;
        this.sfxToggle?.setPosition(colX, y);
        y += lineH + 18;
        this.musicSlider?.setPosition(colX, y);
        this.updateSliderLayout(this.musicSlider, 'Music Volume', (this.opts?.musicVol ?? 1));
        y += lineH + 18;
        this.sfxSlider?.setPosition(colX, y);
        this.updateSliderLayout(this.sfxSlider, 'SFX Volume', (this.opts?.sfxVol ?? 1));
        y += lineH + 24;
        const qY = y;
        const gap = 90;
        this.qualityNormal?.setPosition(colX - gap / 2, qY);
        this.qualityLow?.setPosition(colX + gap / 2, qY);
        y += lineH + 18;
        this.langText?.setPosition(colX, y);
        y += lineH - 10;
        this.vibrateToggle?.setPosition(colX, y);
        y += lineH + 10;
        // Version row layout
        const rowW = Math.round(this.scale.width * 0.86);
        const rowH = Math.max(48, Math.round(this.scale.height * 0.08));
        this.versionText?.setPosition(colX, y).setDepth(10);
        this.versionZone?.setPosition(colX, y).setSize(rowW, rowH).setDepth(9);
        y += lineH - 10;
        this.resetBtn?.setPosition(colX, y);
    }
    // ===== Helpers UI & Apply =====
    createToggle(y, label, init, onChange) {
        let state = init;
        const c = this.createButton(y, label, () => {
            state = !state;
            onChange(state);
        });
        return c;
    }
    updateToggleLabel(btn, text) {
        const t = btn.getAt(1);
        if (t)
            t.setText(text);
    }
    createSlider(y, label, initVal, onChange) {
        const trackW = Math.min(420, Math.round(this.scale.width * 0.8));
        const c = this.add.container(this.centerX, y);
        const lbl = this.add.text(0, -24, `${label}: ${Math.round(initVal * 100)}%`, {
            fontFamily: 'Nunito', fontSize: '18px', color: '#000'
        }).setOrigin(0.5);
        c.add(lbl);
        const track = this.add.rectangle(0, 10, trackW, 6, 0xcccccc).setOrigin(0.5);
        c.add(track);
        const knob = this.add.circle(-trackW / 2 + trackW * initVal, 10, 10, 0x111111).setInteractive({ useHandCursor: true });
        c.add(knob);
        const updateFromPointer = (px) => {
            const left = c.x - trackW / 2;
            let v = (px - left) / trackW;
            v = Math.max(0, Math.min(1, v));
            knob.x = -trackW / 2 + trackW * v;
            lbl.setText(`${label}: ${Math.round(v * 100)}%`);
            onChange(v);
        };
        knob.on('pointerdown', (p) => {
            updateFromPointer(p.x);
            this.input.on(Phaser.Input.Events.POINTER_MOVE, (pp) => updateFromPointer(pp.x));
            this.input.once(Phaser.Input.Events.POINTER_UP, () => this.input.off(Phaser.Input.Events.POINTER_MOVE));
            this.input.once(Phaser.Input.Events.GAME_OUT, () => this.input.off(Phaser.Input.Events.POINTER_MOVE));
        });
        track.setInteractive().on('pointerdown', (p) => updateFromPointer(p.x));
        return c;
    }
    createSmallButton(y, label, onClick) {
        const width = Math.round(Math.min(220, this.scale.width * 0.4));
        const height = Math.max(40, Math.round(this.scale.height * 0.06));
        const radius = Math.min(16, Math.floor(height * 0.35));
        const c = this.add.container(this.centerX, y);
        c.width = width;
        c.height = height;
        const g = this.add.graphics();
        this.updateButtonGraphics(g, width, height, 0xffffff, 0x000000, 2, radius);
        const t = this.add.text(0, 0, label, { fontFamily: 'Nunito', fontSize: `${Math.max(14, Math.floor(height * 0.38))}px`, color: '#000' }).setOrigin(0.5);
        const z = this.add.zone(0, 0, width, height).setOrigin(0.5).setInteractive({ useHandCursor: true });
        z.on('pointerup', () => { this.playSound('sfx_click', { volume: 0.7 }); onClick(); });
        c.add([g, t, z]);
        return c;
    }
    refreshQualityButtons() {
        const mark = (btn, active) => {
            if (!btn)
                return;
            const w = btn.width ?? 220;
            const h = btn.height ?? 40;
            const g = btn.getAt(0);
            if (g)
                this.updateButtonGraphics(g, w, h, active ? 0xd4edda : 0xffffff, active ? 0x28a745 : 0x000000, 2);
        };
        const o = this.opts;
        mark(this.qualityNormal, o.graphics === 'normal');
        mark(this.qualityLow, o.graphics === 'low');
    }
    openConfirm() {
        if (this.confirmBox) {
            try {
                this.confirmBox.destroy(true);
            }
            catch { }
        }
        const w = Math.min(420, Math.round(this.scale.width * 0.9));
        const h = 170;
        const bg = this.add.rectangle(this.centerX, this.centerY, w, h, 0xffffff).setStrokeStyle(2, 0x000000);
        const tx = this.add.text(this.centerX, this.centerY - 40, 'Reset local progress?\nThis cannot be undone.', {
            fontFamily: 'Nunito', fontSize: '18px', color: '#000', align: 'center'
        }).setOrigin(0.5);
        const yes = this.createSmallButton(this.centerY + 35, 'Yes', () => {
            try {
                localStorage.removeItem('rk:best');
            }
            catch { }
            try {
                localStorage.removeItem('rk:lastSubmission');
            }
            catch { }
            try {
                localStorage.removeItem('rk:settings');
            }
            catch { }
            SettingsManager.reset();
            this.playSound('sfx_click', { volume: 0.7 });
            try {
                this.confirmBox?.destroy(true);
            }
            catch { }
            this.scene.start('MainMenuScene');
        });
        const no = this.createSmallButton(this.centerY + 35, 'No', () => {
            this.playSound('sfx_click', { volume: 0.7 });
            try {
                this.confirmBox?.destroy(true);
            }
            catch { }
        });
        yes.setPosition(this.centerX - 80, this.centerY + 35);
        no.setPosition(this.centerX + 80, this.centerY + 35);
        const c = this.add.container(0, 0);
        c.add([bg, tx, yes, no]);
        this.confirmBox = c;
        this.sceneContentGroup.add(c);
    }
    applyOptions(o) {
        // Music on/off + volume
        try {
            if (!o.musicOn) {
                if (BaseScene.backgroundMusic?.isPlaying)
                    BaseScene.backgroundMusic.pause();
            }
            else {
                if (BaseScene.backgroundMusic && !BaseScene.backgroundMusic.isPlaying) {
                    try {
                        BaseScene.backgroundMusic.resume();
                    }
                    catch {
                        try {
                            BaseScene.backgroundMusic.play();
                        }
                        catch { }
                    }
                }
            }
            try {
                BaseScene.backgroundMusic?.setVolume?.(o.musicVol);
            }
            catch { }
        }
        catch { }
        // Graphics
        try {
            if (o.graphics === 'low') {
                this.textures.setDefaultFilter?.(Phaser.Textures.FilterMode.NEAREST);
            }
            else {
                this.textures.setDefaultFilter?.(Phaser.Textures.FilterMode.LINEAR);
            }
        }
        catch { }
    }
    // Perbarui ukuran track/knob saat resize
    updateSliderLayout(cont, label, value01) {
        if (!cont)
            return;
        const trackW = Math.min(420, Math.round(this.scale.width * 0.8));
        const lbl = cont.getAt(0);
        const track = cont.getAt(1);
        const knob = cont.getAt(2);
        lbl?.setText(`${label}: ${Math.round(value01 * 100)}%`).setOrigin(0.5).setPosition(0, -24);
        if (track) {
            track.setPosition(0, 10);
            track.width = trackW;
            track.displayWidth = trackW;
        }
        if (knob) {
            knob.x = -trackW / 2 + trackW * value01;
            knob.y = 10;
        }
    }
}
