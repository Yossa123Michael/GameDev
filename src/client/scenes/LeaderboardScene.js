import { BaseScene } from './BaseScene';
import { supabase } from '../lib/supabaseClient';
import { getLastSubmission } from '../lib/submitScore';
function getDeviceBest() {
    try {
        const raw = localStorage.getItem('rk:best');
        return raw ? Number(raw) : null;
    }
    catch {
        return null;
    }
}
// Warna medal
const GOLD_FILL = 0xFFD700;
const GOLD_STROKE = 0xB8860B;
const SILVER_FILL = 0xC0C0C0;
const SILVER_STROKE = 0x808080;
const BRONZE_FILL = 0xCD7F32;
const BRONZE_STROKE = 0x8B4513;
export class LeaderboardScene extends BaseScene {
    constructor() {
        super('LeaderboardScene');
        // Data
        this.entries = [];
        this.myBest = null;
        this._currentUserId = null;
        this.lastSub = null;
        this.deviceBest = null;
        this.inTop100Index = null;
        // State
        this.alive = true;
        this.scrollY = 0;
        this.contentHeight = 0;
        // Drag
        this.dragActive = false;
        this.dragStartY = 0;
        this.dragBaseScroll = 0;
        // Debounce rebuild
        this.pendingRebuild = false;
        // Layout constants (bisa Anda ubah)
        this.TITLE_Y = 80;
        this.ROW_HEIGHT = 60; // Fix untuk stabilitas
        this.ROW_GAP = 20; // Gap antar baris
        this.GAP_TITLE_HEADER = 54; // Jarak judul ke header
        this.GAP_HEADER_LIST = 30; // Jarak header ke area list
        this.GAP_LIST_START = 30; // Offset ekstra sebelum baris pertama supaya tidak memotong
        this.USER_BOTTOM_MARGIN = 30; // Margin bawah untuk user box
        this.STROKE_W = 3;
        // Computed metrics
        this.buttonWidth = 0;
        this.buttonLeft = 0;
        this.headerCenterY = 0;
        this.scrollTopY = 0;
        this.scrollHeight = 0;
        this.userBottomCenterY = 0;
        this.radius = 20;
    }
    // ---------- Lifecycle ----------
    async create() {
        super.create();
        this.createCommonButtons('MainMenuScene');
        this.showStatus('Loading leaderboard...');
        await this.loadDataFast();
        if (!this.scene.isActive())
            return;
        this.computeMetrics();
        this.fullRebuild(); // initial build
        this.time.delayedCall(50, () => { if (this.alive)
            this.fullRebuild(); });
        this.computeRankInBackground();
        this.events.once('shutdown', () => { this.alive = false; this.cleanup(); });
        this.events.once('destroy', () => { this.alive = false; this.cleanup(); });
    }
    draw() {
        // Dipanggil saat resize → debounce
        if (!this.alive)
            return;
        if (this.pendingRebuild)
            return;
        this.pendingRebuild = true;
        const ratio = this.getScrollRatio();
        this.time.delayedCall(0, () => {
            if (!this.alive)
                return;
            this.pendingRebuild = false;
            this.computeMetrics();
            this.fullRebuild(ratio);
        });
    }
    // ---------- Metrics ----------
    computeMetrics() {
        this.buttonWidth = Math.round(this.scale.width * 0.86);
        this.buttonLeft = Math.round((this.scale.width - this.buttonWidth) / 2);
        this.radius = Math.min(24, Math.floor(this.ROW_HEIGHT * 0.35));
        this.headerCenterY = this.TITLE_Y + this.GAP_TITLE_HEADER + this.ROW_HEIGHT / 2;
        this.scrollTopY = this.headerCenterY + this.ROW_HEIGHT / 2 + this.GAP_HEADER_LIST;
        this.userBottomCenterY = this.scale.height - this.USER_BOTTOM_MARGIN - this.ROW_HEIGHT / 2;
        const reservedBottom = (this.scale.height - this.userBottomCenterY) + this.ROW_HEIGHT / 2 + 16;
        const available = this.scale.height - this.scrollTopY - reservedBottom;
        this.scrollHeight = Math.max(this.ROW_HEIGHT * 4, available);
    }
    // ---------- Data load ----------
    async loadDataFast() {
        this.entries = [];
        this.myBest = null;
        this._currentUserId = null;
        this.inTop100Index = null;
        this.lastSub = getLastSubmission();
        this.deviceBest = getDeviceBest();
        const [topRes, authRes] = await Promise.all([
            supabase
                .from('scores')
                .select('id,name,score,created_at,user_id')
                .order('score', { ascending: false })
                .order('created_at', { ascending: true })
                .limit(600),
            supabase.auth.getUser()
        ]);
        if (topRes.error)
            throw topRes.error;
        const seen = new Set();
        const unique = [];
        for (const e of (topRes.data || [])) {
            if (e.user_id) {
                if (seen.has(e.user_id))
                    continue;
                seen.add(e.user_id);
            }
            unique.push(e);
            if (unique.length >= 100)
                break;
        }
        this.entries = unique;
        const uid = authRes.data?.user?.id ?? null;
        this._currentUserId = uid;
        if (uid) {
            const idx = this.entries.findIndex(en => en.user_id === uid);
            if (idx >= 0) {
                this.inTop100Index = idx;
                const en = this.entries[idx];
                this.myBest = { name: en.name, score: en.score, created_at: en.created_at, rank: idx + 1 };
            }
        }
        if (this.inTop100Index == null && this.deviceBest != null) {
            const idx2 = this.entries.findIndex(en => en.score === this.deviceBest);
            if (idx2 >= 0) {
                this.inTop100Index = idx2;
                const en = this.entries[idx2];
                this.myBest = { name: en.name || this.lastSub?.name || 'You', score: en.score, created_at: en.created_at };
            }
        }
        if (!this.myBest && this.deviceBest != null) {
            this.myBest = { name: this.lastSub?.name || 'You', score: this.deviceBest, created_at: '' };
        }
        this.showStatus(null);
    }
    async computeRankInBackground() {
        if (!this.alive)
            return;
        if (this.inTop100Index != null)
            return;
        if (!this.myBest?.score)
            return;
        try {
            const q = await supabase.from('scores').select('id', { count: 'exact', head: true }).gt('score', this.myBest.score);
            const higher = q.count || 0;
            this.myBest.rank = higher + 1;
            this.rebuildUserRow();
        }
        catch { }
    }
    // ---------- Scroll ratio ----------
    getScrollRatio() {
        if (this.contentHeight <= this.scrollHeight)
            return 0;
        return this.scrollY / Math.max(1, this.contentHeight - this.scrollHeight);
    }
    restoreScrollFromRatio(r) {
        this.scrollY = r * Math.max(0, this.contentHeight - this.scrollHeight);
        this.clampScroll();
    }
    // ---------- Full rebuild ----------
    fullRebuild(preserveRatio) {
        // Destroy old
        try {
            this.titleText?.destroy();
        }
        catch { }
        try {
            this.headerRow?.destroy();
        }
        catch { }
        try {
            this.userFixedRow?.destroy();
        }
        catch { }
        try {
            this.listContainer?.destroy(true);
        }
        catch { }
        try {
            this.maskGraphics?.destroy();
        }
        catch { }
        try {
            this.scrollSurface?.destroy();
        }
        catch { }
        // Build fixed
        this.buildTitle();
        this.buildHeader();
        this.rebuildUserRow();
        this.buildScrollArea();
        this.renderList();
        if (preserveRatio !== undefined)
            this.restoreScrollFromRatio(preserveRatio);
        this.layoutAll();
    }
    buildTitle() {
        this.titleText = this.add.text(this.centerX, this.TITLE_Y, 'Leaderboard', {
            fontFamily: 'Nunito',
            fontSize: '36px',
            color: '#000'
        }).setOrigin(0.5).setDepth(50);
    }
    buildHeader() {
        this.headerRow = this.buildBox(this.headerCenterY, { rank: 'Rank', name: 'Nama', score: 'High Score' }, true, false);
        this.headerRow.setDepth(45);
    }
    rebuildUserRow() {
        const y = this.userBottomCenterY;
        let rankText = '-';
        let nameText = 'You';
        let scoreText = '-';
        if (this.myBest) {
            rankText = this.myBest.rank && this.myBest.rank <= 10000 ? `${this.myBest.rank}.` : '-';
            nameText = this.myBest.name || 'You';
            scoreText = `${this.myBest.score}`;
        }
        this.userFixedRow = this.buildBox(y, { rank: rankText, name: nameText, score: scoreText }, false, true);
        this.userFixedRow.setDepth(45);
    }
    buildScrollArea() {
        this.listContainer = this.add.container(0, this.scrollTopY).setDepth(30);
        this.maskGraphics = this.add.graphics().setDepth(29);
        this.drawMask();
        this.maskGraphics.setVisible(false);
        const mask = this.maskGraphics.createGeometryMask();
        this.listContainer.setMask(mask);
        this.scrollSurface = this.add.rectangle(this.buttonLeft + this.buttonWidth / 2, this.scrollTopY + this.scrollHeight / 2, this.buttonWidth, this.scrollHeight, 0x000000, 0).setDepth(28);
        this.scrollSurface.setInteractive({ useHandCursor: true });
        // Drag events
        this.scrollSurface.on('pointerdown', (p) => {
            this.dragActive = true;
            this.dragStartY = p.y;
            this.dragBaseScroll = this.scrollY;
        });
        this.input.on(Phaser.Input.Events.POINTER_MOVE, (p) => {
            if (!this.dragActive || !this.alive)
                return;
            const delta = p.y - this.dragStartY;
            this.scrollY = this.dragBaseScroll - delta;
            this.clampScroll();
            this.layoutScroll();
        });
        this.input.on(Phaser.Input.Events.POINTER_UP, () => { this.dragActive = false; });
        this.input.on(Phaser.Input.Events.GAME_OUT, () => { this.dragActive = false; });
        // Wheel
        this.input.on('wheel', (pointer, _gos, _dx, dy) => {
            this.applyScroll(dy * 0.6);
        });
    }
    drawMask() {
        if (!this.maskGraphics)
            return;
        this.maskGraphics.clear();
        this.maskGraphics.fillStyle(0xffffff, 1);
        this.maskGraphics.fillRect(this.buttonLeft - this.STROKE_W, this.scrollTopY - this.STROKE_W, this.buttonWidth + this.STROKE_W * 2, this.scrollHeight + this.STROKE_W * 2);
    }
    // ---------- Render list ----------
    renderList() {
        if (!this.listContainer)
            return;
        const prev = this.listContainer.list.slice();
        prev.forEach(o => { try {
            o.destroy(true);
        }
        catch { } });
        let yLocal = this.ROW_HEIGHT / 2 + this.GAP_LIST_START;
        if (!this.entries.length) {
            const noData = this.buildBoxLocal(yLocal, { rank: '-', name: 'No data', score: '-' }, false, false);
            this.listContainer.add(noData);
            this.contentHeight = this.ROW_HEIGHT + this.GAP_LIST_START;
            this.clampScroll();
            return;
        }
        this.entries.forEach((en, i) => {
            const row = this.buildBoxLocal(yLocal, {
                rank: `${i + 1}.`,
                name: en.name || 'Player',
                score: `${en.score}`
            }, false, false);
            this.listContainer.add(row);
            yLocal += this.ROW_HEIGHT + this.ROW_GAP;
        });
        this.contentHeight = yLocal - this.ROW_GAP + this.ROW_HEIGHT / 2;
        this.clampScroll();
    }
    // ---------- Box builders ----------
    buildBox(yCenterWorld, data, isHeader, isUser) {
        const c = this.add.container(this.centerX, yCenterWorld);
        return this.initBoxGraphics(c, data, isHeader, isUser);
    }
    buildBoxLocal(yCenterLocal, data, isHeader, isUser) {
        const c = this.add.container(this.centerX, yCenterLocal);
        return this.initBoxGraphics(c, data, isHeader, isUser);
    }
    initBoxGraphics(c, data, isHeader, isUser) {
        const width = this.buttonWidth;
        const height = this.ROW_HEIGHT;
        const radius = this.radius;
        const fontSize = Math.max(16, Math.round(height * 0.40));
        const padX = Math.round(width * 0.05);
        c.width = width;
        c.height = height;
        let fill = 0xffffff;
        let stroke = 0x000000;
        if (isHeader) {
            fill = 0xf2f2f2;
            stroke = 0x999999;
        }
        else if (isUser) {
            fill = 0xd4edda;
            stroke = 0x28a745;
        }
        else {
            const rankNum = parseInt(data.rank);
            if (rankNum === 1) {
                fill = GOLD_FILL;
                stroke = GOLD_STROKE;
            }
            else if (rankNum === 2) {
                fill = SILVER_FILL;
                stroke = SILVER_STROKE;
            }
            else if (rankNum === 3) {
                fill = BRONZE_FILL;
                stroke = BRONZE_STROKE;
            }
        }
        const g = this.add.graphics();
        g.lineStyle(this.STROKE_W, stroke, 1).fillStyle(fill, 1);
        g.fillRoundedRect(-width / 2, -height / 2, width, height, radius);
        g.strokeRoundedRect(-width / 2, -height / 2, width, height, radius);
        c.add(g);
        const rankT = this.add.text(-width / 2 + padX, 0, data.rank, {
            fontFamily: 'Nunito', fontSize: `${fontSize}px`, color: '#000'
        }).setOrigin(0, 0.5);
        c.add(rankT);
        const nameT = this.add.text(0, 0, data.name, {
            fontFamily: 'Nunito', fontSize: `${fontSize}px`, color: '#000'
        }).setOrigin(0.5);
        c.add(nameT);
        const scoreT = this.add.text(width / 2 - padX, 0, data.score, {
            fontFamily: 'Nunito', fontSize: `${fontSize}px`, color: '#000'
        }).setOrigin(1, 0.5);
        c.add(scoreT);
        return c;
    }
    // ---------- Layout ----------
    layoutAll() {
        this.titleText?.setPosition(this.centerX, this.TITLE_Y);
        this.headerRow?.setPosition(this.centerX, this.headerCenterY);
        this.userFixedRow?.setPosition(this.centerX, this.userBottomCenterY);
        this.drawMask();
        this.scrollSurface?.setPosition(this.buttonLeft + this.buttonWidth / 2, this.scrollTopY + this.scrollHeight / 2).setSize(this.buttonWidth, this.scrollHeight);
        this.layoutScroll();
    }
    layoutScroll() {
        if (this.listContainer) {
            this.listContainer.setPosition(0, this.scrollTopY - this.scrollY);
        }
    }
    // ---------- Scroll helpers ----------
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
    // ---------- Status ----------
    showStatus(message) {
        if (!message) {
            this.statusText?.setVisible(false);
            return;
        }
        if (!this.statusText) {
            this.statusText = this.add.text(this.centerX, this.scale.height * 0.5, message, {
                fontFamily: 'Nunito',
                fontSize: '20px',
                color: '#666'
            }).setOrigin(0.5).setDepth(1002);
        }
        else {
            this.statusText.setText(message).setVisible(true);
        }
    }
    // ---------- Cleanup ----------
    cleanup() {
        try {
            this.input.off('wheel');
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
    }
}
