import { BaseScene } from './BaseScene';
import { SettingsManager, clamp01 } from '../lib/Settings';
import { formatVersionLabel, versionsOrder } from '../version';
import { showVersionPicker } from '../ui/VersionPicker';
import { t, getLang, setLang, emitLanguageChanged } from '../lib/i18n';
export class OptionScene extends BaseScene {
    constructor() {
        super('OptionScene');
        this.scrollY = 0;
        this.contentHeight = 0;
        this.pendingRebuild = false;
        this.pendingDrag = false;
        this.dragging = false;
        this.dragStartY = 0;
        this.dragBase = 0;
        this.DRAG_THRESHOLD = 10;
        this.TITLE_Y = 90;
        this.STROKE_W = 3;
        this.ROW_GAP = 24;
        this.GAP_AFTER_MUSIC_TOGGLE = 96;
        this.GAP_AFTER_SFX_TOGGLE = 108;
        this.LIST_TOP_PAD = 28;
        this.LANG_GAP = 170;
        this.VERSION_GAP = 140;
        this.buttonWidth = 0;
        this.buttonLeft = 0;
        this.scrollTopY = 0;
        this.scrollHeight = 0;
        this.opts = SettingsManager.get();
    }
    create() {
        super.create();
        super.createCommonButtons('MainMenuScene');
        this.optsUnsub = SettingsManager.subscribe((s) => {
            this.opts = s;
            try {
                this.updateToggleLabel(this.musicToggle, `${t('music')}: ${s.musicOn ? t('on') : t('off')}`);
            }
            catch { }
            try {
                this.updateToggleLabel(this.sfxToggle, `${t('sfx')}: ${s.sfxOn ? t('on') : t('off')}`);
            }
            catch { }
            try {
                this.updateToggleLabel(this.vibrateToggle, `${t('vibration')}: ${s.vibration ? t('on') : t('off')}`);
            }
            catch { }
            try {
                this.updateToggleLabel(this.animationToggle, `${t('animation')}: ${(s.animation !== false) ? t('on') : t('off')}`);
            }
            catch { }
            try {
                this.versionRowLabel?.setText(`${t('version')}: ${formatVersionLabel(s.version)}`);
            }
            catch { }
        });
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            try {
                this.optsUnsub?.();
            }
            catch { }
            this.detachScrollHandlers();
        });
        this.buildTitle();
        this.computeMetrics();
        this.fullRebuild();
        this.attachScrollHandlers();
    }
    draw() {
        if (this.pendingRebuild)
            return;
        this.pendingRebuild = true;
        const ratio = this.getScrollRatio();
        this.time.delayedCall(0, () => {
            this.pendingRebuild = false;
            this.computeMetrics();
            this.fullRebuild(ratio);
        });
    }
    buildTitle() {
        try {
            this.title?.destroy();
        }
        catch { }
        this.title = this.add.text(Math.floor(this.scale.width / 2), this.TITLE_Y, t('optionsTitle'), {
            fontFamily: 'Nunito', fontSize: '36px', color: '#000'
        }).setOrigin(0.5).setDepth(50);
    }
    computeMetrics() {
        const cx = Math.floor(this.scale.width / 2);
        this.title?.setPosition(cx, this.TITLE_Y);
        this.buttonWidth = Math.round(this.scale.width * 0.86);
        this.buttonLeft = Math.round((this.scale.width - this.buttonWidth) / 2);
        this.scrollTopY = this.TITLE_Y + 60;
        const reservedBottom = 24;
        const available = Math.max(240, this.scale.height - this.scrollTopY - reservedBottom);
        this.scrollHeight = available;
        const sMin = Math.min(this.scale.width, this.scale.height);
        const compact = sMin < 600;
        this.ROW_GAP = compact ? 22 : 24;
        this.GAP_AFTER_MUSIC_TOGGLE = compact ? 88 : 96;
        this.GAP_AFTER_SFX_TOGGLE = compact ? 100 : 108;
        this.LIST_TOP_PAD = compact ? 26 : 28;
        this.LANG_GAP = compact ? 150 : 170;
        this.VERSION_GAP = compact ? 120 : 140;
    }
    getScrollRatio() {
        if (this.contentHeight <= this.scrollHeight)
            return 0;
        return this.scrollY / Math.max(1, this.contentHeight - this.scrollHeight);
    }
    restoreScrollFromRatio(r) {
        this.scrollY = r * Math.max(0, this.contentHeight - this.scrollHeight);
        this.clampScroll();
    }
    fullRebuild(preserveRatio) {
        try {
            this.listContainer?.destroy(true);
        }
        catch { }
        try {
            this.maskGraphics?.destroy();
        }
        catch { }
        this.listContainer = this.add.container(0, this.scrollTopY).setDepth(30);
        this.maskGraphics = this.add.graphics().setDepth(29);
        this.drawMask();
        const mask = this.maskGraphics.createGeometryMask();
        this.listContainer.setMask(mask);
        this.renderList();
        if (preserveRatio !== undefined)
            this.restoreScrollFromRatio(preserveRatio);
        this.layoutAll();
    }
    drawMask() {
        if (!this.maskGraphics)
            return;
        this.maskGraphics.clear();
        this.maskGraphics.fillStyle(0xffffff, 1);
        this.maskGraphics.fillRect(this.buttonLeft - this.STROKE_W, this.scrollTopY - this.STROKE_W, this.buttonWidth + this.STROKE_W * 2, this.scrollHeight + this.STROKE_W * 2);
    }
    layoutAll() {
        this.drawMask();
        this.layoutScroll();
    }
    layoutScroll() {
        if (this.listContainer) {
            this.listContainer.setPosition(0, this.scrollTopY - this.scrollY);
        }
    }
    applyScroll(dy) {
        this.scrollY += dy;
        this.clampScroll();
        this.layoutScroll();
    }
    clampScroll() {
        const maxScroll = Math.max(0, this.contentHeight - this.scrollHeight);
        if (this.scrollY < 0)
            this.scrollY = 0;
        if (this.scrollY > maxScroll)
            this.scrollY = maxScroll;
    }
    attachScrollHandlers() {
        this.detachScrollHandlers();
        this.input.on(Phaser.Input.Events.POINTER_DOWN, (p) => {
            if (!this.isInScrollArea(p))
                return;
            if (this.isOverAnyInteractive(p))
                return;
            this.pendingDrag = true;
            this.dragging = false;
            this.dragStartY = p.y;
            this.dragBase = this.scrollY;
        });
        this.input.on(Phaser.Input.Events.POINTER_MOVE, (p) => {
            if (!this.pendingDrag && !this.dragging)
                return;
            const deltaY = p.y - this.dragStartY;
            if (!this.dragging && Math.abs(deltaY) >= this.DRAG_THRESHOLD) {
                this.dragging = true;
            }
            if (this.dragging) {
                this.scrollY = this.dragBase - deltaY;
                this.clampScroll();
                this.layoutScroll();
            }
        });
        const stop = () => { this.pendingDrag = false; this.dragging = false; };
        this.input.on(Phaser.Input.Events.POINTER_UP, stop);
        this.input.on(Phaser.Input.Events.GAME_OUT, stop);
        this.input.on('wheel', (p, _gos, _dx, dy) => {
            if (!this.isInScrollArea(p))
                return;
            this.applyScroll(dy * 0.6);
        });
    }
    detachScrollHandlers() {
        try {
            this.input.off(Phaser.Input.Events.POINTER_DOWN);
        }
        catch { }
        try {
            this.input.off(Phaser.Input.Events.POINTER_MOVE);
        }
        catch { }
        try {
            this.input.off(Phaser.Input.Events.POINTER_UP);
        }
        catch { }
        try {
            this.input.off(Phaser.Input.Events.GAME_OUT);
        }
        catch { }
        try {
            this.input.off('wheel');
        }
        catch { }
        this.pendingDrag = false;
        this.dragging = false;
    }
    isInScrollArea(p) {
        const x = p.x, y = p.y;
        const left = this.buttonLeft - this.STROKE_W;
        const top = this.scrollTopY - this.STROKE_W;
        const right = left + this.buttonWidth + this.STROKE_W * 2;
        const bottom = top + this.scrollHeight + this.STROKE_W * 2;
        return x >= left && x <= right && y >= top && y <= bottom;
    }
    isOverAnyInteractive(p) {
        const candidates = [
            this.musicToggle, this.sfxToggle,
            this.musicSlider, this.sfxSlider,
            this.animationToggle,
            this.langIdBtn, this.langEnBtn,
            this.vibrateToggle,
            this.versionPrevBtn, this.versionPickBtn, this.versionNextBtn,
            this.resetBtn
        ];
        for (const go of candidates) {
            if (!go)
                continue;
            const b = go.getBounds?.();
            if (b && b.contains(p.x, p.y))
                return true;
            const list = go.list || [];
            for (const child of list) {
                const cb = child?.getBounds?.();
                if (cb && cb.contains(p.x, p.y))
                    return true;
            }
        }
        return false;
    }
    renderList() {
        if (!this.listContainer)
            return;
        this.listContainer.removeAll(true);
        const cx = Math.floor(this.scale.width / 2);
        let y = this.LIST_TOP_PAD;
        this.musicToggle = this.createToggle(0, `${t('music')}: ${this.opts.musicOn ? t('on') : t('off')}`, this.opts.musicOn, (v) => {
            SettingsManager.save({ musicOn: v });
            this.updateToggleLabel(this.musicToggle, `${t('music')}: ${v ? t('on') : t('off')}`);
        });
        this.place(this.musicToggle, cx, y);
        y += this.GAP_AFTER_MUSIC_TOGGLE;
        this.sfxToggle = this.createToggle(0, `${t('sfx')}: ${this.opts.sfxOn ? t('on') : t('off')}`, this.opts.sfxOn, (v) => {
            SettingsManager.save({ sfxOn: v });
            this.updateToggleLabel(this.sfxToggle, `${t('sfx')}: ${v ? t('on') : t('off')}`);
        });
        this.place(this.sfxToggle, cx, y);
        y += this.GAP_AFTER_SFX_TOGGLE;
        this.musicSlider = this.createSlider(0, t('musicVolume'), this.opts.musicVol, (val) => {
            SettingsManager.save({ musicVol: clamp01(val) });
        });
        this.place(this.musicSlider, cx, y);
        y += 72;
        this.sfxSlider = this.createSlider(0, t('sfxVolume'), this.opts.sfxVol, (val) => {
            SettingsManager.save({ sfxVol: clamp01(val) });
        });
        this.place(this.sfxSlider, cx, y);
        y += 88;
        this.animationToggle = this.createToggle(0, `${t('animation')}: ${(this.opts.animation !== false) ? t('on') : t('off')}`, (this.opts.animation !== false), (v) => {
            SettingsManager.save({ animation: v });
            this.updateToggleLabel(this.animationToggle, `${t('animation')}: ${v ? t('on') : t('off')}`);
        });
        this.place(this.animationToggle, cx, y);
        y += 88;
        this.langRowLabel = this.add.text(0, 0, t('language'), {
            fontFamily: 'Nunito', fontSize: '20px', color: '#555'
        }).setOrigin(0.5);
        this.place(this.langRowLabel, cx, y);
        y += 42;
        this.langIdBtn = this.createSmallButton(0, t('indonesian'), () => {
            setLang('id');
            emitLanguageChanged(this);
            this.playSound('sfx_click', { volume: 0.7 });
            this.relabelAll();
            this.markSegmented(this.langIdBtn, true);
            this.markSegmented(this.langEnBtn, false);
        });
        this.langEnBtn = this.createSmallButton(0, t('english'), () => {
            setLang('en');
            emitLanguageChanged(this);
            this.playSound('sfx_click', { volume: 0.7 });
            this.relabelAll();
            this.markSegmented(this.langIdBtn, false);
            this.markSegmented(this.langEnBtn, true);
        });
        this.place(this.langIdBtn, cx - this.LANG_GAP / 2, y);
        this.place(this.langEnBtn, cx + this.LANG_GAP / 2, y);
        const isId = getLang() === 'id';
        this.markSegmented(this.langIdBtn, isId);
        this.markSegmented(this.langEnBtn, !isId);
        y += 88;
        this.vibrateToggle = this.createToggle(0, `${t('vibration')}: ${this.opts.vibration ? t('on') : t('off')}`, this.opts.vibration, (v) => {
            SettingsManager.save({ vibration: v });
            this.updateToggleLabel(this.vibrateToggle, `${t('vibration')}: ${v ? t('on') : t('off')}`);
            try {
                if (v && navigator.vibrate)
                    navigator.vibrate(40);
            }
            catch { }
        });
        this.place(this.vibrateToggle, cx, y);
        y += 88;
        this.versionRowLabel = this.add.text(0, 0, `${t('version')}: ${formatVersionLabel(this.opts.version)}`, {
            fontFamily: 'Nunito', fontSize: '20px', color: '#000'
        }).setOrigin(0.5);
        this.place(this.versionRowLabel, cx, y);
        y += 42;
        this.versionPrevBtn = this.createSmallButton(0, t('prev'), () => {
            const next = this.cycleVersion(-1);
            SettingsManager.save({ version: next });
            this.versionRowLabel?.setText(`${t('version')}: ${formatVersionLabel(this.opts.version)}`);
            this.playSound('sfx_click', { volume: 0.7 });
        });
        this.versionPickBtn = this.createSmallButton(0, t('change'), () => this.openVersionPicker());
        this.versionNextBtn = this.createSmallButton(0, t('next'), () => {
            const next = this.cycleVersion(1);
            SettingsManager.save({ version: next });
            this.versionRowLabel?.setText(`${t('version')}: ${formatVersionLabel(this.opts.version)}`);
            this.playSound('sfx_click', { volume: 0.7 });
        });
        this.place(this.versionPrevBtn, cx - this.VERSION_GAP, y);
        this.place(this.versionPickBtn, cx, y);
        this.place(this.versionNextBtn, cx + this.VERSION_GAP, y);
        y += 88;
        this.resetBtn = this.createButton(0, t('resetLocal'), () => this.openConfirm());
        this.place(this.resetBtn, cx, y);
        y += 72;
        this.contentHeight = y + this.LIST_TOP_PAD;
        this.clampScroll();
    }
    relabelAll() {
        try {
            this.title?.setText(t('optionsTitle'));
        }
        catch { }
        try {
            this.updateToggleLabel(this.musicToggle, `${t('music')}: ${this.opts.musicOn ? t('on') : t('off')}`);
        }
        catch { }
        try {
            this.updateToggleLabel(this.sfxToggle, `${t('sfx')}: ${this.opts.sfxOn ? t('on') : t('off')}`);
        }
        catch { }
        try {
            const mLbl = this.musicSlider?.getAt(0);
            const sLbl = this.sfxSlider?.getAt(0);
            mLbl?.setText(`${t('musicVolume')}: ${Math.round((this.opts.musicVol ?? 1) * 100)}%`);
            sLbl?.setText(`${t('sfxVolume')}: ${Math.round((this.opts.sfxVol ?? 1) * 100)}%`);
        }
        catch { }
        try {
            this.updateToggleLabel(this.animationToggle, `${t('animation')}: ${(this.opts.animation !== false) ? t('on') : t('off')}`);
        }
        catch { }
        try {
            this.langRowLabel?.setText(t('language'));
        }
        catch { }
        try {
            const idText = this.langIdBtn?.getAt(1);
            const enText = this.langEnBtn?.getAt(1);
            idText?.setText(t('indonesian'));
            enText?.setText(t('english'));
        }
        catch { }
        try {
            this.updateToggleLabel(this.vibrateToggle, `${t('vibration')}: ${this.opts.vibration ? t('on') : t('off')}`);
        }
        catch { }
        try {
            const prevText = this.versionPrevBtn?.getAt(1);
            const chgText = this.versionPickBtn?.getAt(1);
            const nextText = this.versionNextBtn?.getAt(1);
            prevText?.setText(t('prev'));
            chgText?.setText(t('change'));
            nextText?.setText(t('next'));
            this.versionRowLabel?.setText(`${t('version')}: ${formatVersionLabel(this.opts.version)}`);
        }
        catch { }
        try {
            const resetText = this.resetBtn?.getAt(1);
            resetText?.setText(t('resetLocal'));
        }
        catch { }
    }
    place(obj, xWorld, yLocal) {
        if (!obj || !this.listContainer)
            return;
        const go = obj;
        if (typeof go.setPosition === 'function')
            go.setPosition(xWorld, yLocal);
        else {
            go.x = xWorld;
            go.y = yLocal;
        }
        this.listContainer.add(go);
    }
    markSegmented(btn, active) {
        const w = btn.width ?? 220;
        const h = btn.height ?? 40;
        const g = btn.getAt(0);
        if (g)
            this.updateButtonGraphics(g, w, h, active ? 0xd4edda : 0xffffff, active ? 0x28a745 : 0x000000, 2);
    }
    openVersionPicker() {
        this.playSound('sfx_click', { volume: 0.9 });
        showVersionPicker(this, (picked) => {
            SettingsManager.save({ version: picked });
            this.versionRowLabel?.setText(`${t('version')}: ${formatVersionLabel(this.opts.version)}`);
        });
    }
    cycleVersion(dir) {
        const order = versionsOrder;
        const current = this.opts.version;
        const idx = Math.max(0, order.indexOf(current));
        const nextIdx = (idx + (dir === 1 ? 1 : order.length - 1)) % order.length;
        return order[nextIdx];
    }
    createToggle(_y, label, init, onChange) {
        let state = init;
        const c = this.createButton(0, label, () => { state = !state; onChange(state); });
        return c;
    }
    updateToggleLabel(btn, text) {
        const tObj = btn.getAt(1);
        if (tObj)
            tObj.setText(text);
    }
    createSlider(_y, label, initVal, onChange) {
        const trackW = Math.min(420, Math.round(this.scale.width * 0.8));
        const c = this.add.container(0, 0);
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
        c.width = Math.max(trackW, 280);
        c.height = 50;
        return c;
    }
    createSmallButton(_y, label, onClick) {
        const width = Math.round(Math.min(220, this.scale.width * 0.4));
        const height = Math.max(40, Math.round(this.scale.height * 0.06));
        const radius = Math.min(16, Math.floor(height * 0.35));
        const c = this.add.container(0, 0);
        c.width = width;
        c.height = height;
        const g = this.add.graphics();
        this.updateButtonGraphics(g, width, height, 0xffffff, 0x000000, 2, radius);
        const tObj = this.add.text(0, 0, label, { fontFamily: 'Nunito', fontSize: `${Math.max(14, Math.floor(height * 0.38))}px`, color: '#000' }).setOrigin(0.5);
        const z = this.add.zone(0, 0, width, height).setOrigin(0.5).setInteractive({ useHandCursor: true });
        z.on('pointerup', () => { this.playSound('sfx_click', { volume: 0.7 }); onClick(); });
        c.add([g, tObj, z]);
        return c;
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
        const yes = this.createSmallButton(0, 'Yes', () => {
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
        const no = this.createSmallButton(0, 'No', () => {
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
    }
}
