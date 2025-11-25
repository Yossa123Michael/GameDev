import { BaseScene } from './BaseScene';
// Contoh data (ganti sesuai kebutuhan)
const achievementCategories = [
    {
        name: 'Memulai',
        items: [
            { id: 'start_1', title: 'Main 1x', unlocked: true },
            { id: 'start_5', title: 'Main 5x', unlocked: false },
            { id: 'start_10', title: 'Main 10x', unlocked: false },
            { id: 'start_25', title: 'Main 25x', unlocked: false },
            { id: 'start_50', title: 'Main 50x', unlocked: false },
        ],
    },
    {
        name: 'Skor',
        items: [
            { id: 'score_50', title: 'Skor 50', unlocked: true },
            { id: 'score_100', title: 'Skor 100', unlocked: true },
            { id: 'score_200', title: 'Skor 200', unlocked: false },
            { id: 'score_300', title: 'Skor 300', unlocked: false },
            { id: 'score_500', title: 'Skor 500', unlocked: false },
        ],
    },
    {
        name: 'Combo',
        items: [
            { id: 'combo_3', title: '3 Benar Beruntun', unlocked: true },
            { id: 'combo_5', title: '5 Benar Beruntun', unlocked: false },
            { id: 'combo_7', title: '7 Benar Beruntun', unlocked: false },
            { id: 'combo_10', title: '10 Benar Beruntun', unlocked: false },
        ],
    },
    {
        name: 'Koleksi',
        items: [
            { id: 'collect_1', title: 'Kumpul 1 Medal', unlocked: true },
            { id: 'collect_3', title: 'Kumpul 3 Medal', unlocked: false },
            { id: 'collect_5', title: 'Kumpul 5 Medal', unlocked: false },
            { id: 'collect_8', title: 'Kumpul 8 Medal', unlocked: false },
        ],
    }
];
export class AchievementScene extends BaseScene {
    constructor() {
        super('AchievementScene');
        this.scrollY = 0;
        this.contentHeight = 0;
        this.dragActive = false;
        this.dragStartY = 0;
        this.dragBaseScroll = 0;
        // Area metrics
        this.areaLeft = 0;
        this.areaTop = 0;
        this.areaWidth = 0;
        this.areaHeight = 0;
        // Layout constants
        this.TITLE_Y = 90;
        this.GAP_TITLE_TO_CONTENT = 40;
        this.CAT_TITLE_FONT = 22;
        this.CAT_TITLE_GAP_BOTTOM = 12;
        this.GRID_GAP_X = 18;
        this.GRID_GAP_Y = 26;
        this.ICON_MIN = 72;
        this.ICON_MAX = 110;
        this.BORDER_STROKE = 3;
        this.INITIAL_TOP_PADDING = 16; // offset konten bagian atas
        this.ROW_GAP = 28; // JARAK ANTAR KATEGORI (perbaikan error TS)
    }
    create() {
        super.create();
        this.createCommonButtons('MainMenuScene');
        this.buildTitle();
        this.computeArea();
        this.setupScrollArea();
        this.buildGrid();
        this.layoutScroll();
        // Rebuild cepat setelah 1 frame
        this.time.delayedCall(50, () => {
            this.computeArea();
            this.refreshMask();
            this.buildGrid();
            this.layoutScroll();
        });
    }
    draw() {
        // Dipanggil saat resize
        this.computeArea();
        this.refreshMask();
        // Simpan ratio scroll
        const ratio = this.contentHeight > this.areaHeight
            ? this.scrollY / Math.max(1, this.contentHeight - this.areaHeight)
            : 0;
        this.buildGrid();
        this.scrollY = ratio * Math.max(0, this.contentHeight - this.areaHeight);
        this.clampScroll();
        this.layoutScroll();
        this.titleText?.setPosition(this.centerX, this.TITLE_Y);
    }
    // ---------- Basic building ----------
    buildTitle() {
        try {
            this.titleText?.destroy();
        }
        catch { }
        this.titleText = this.add.text(this.centerX, this.TITLE_Y, 'Achievement', {
            fontFamily: 'Nunito',
            fontSize: '36px',
            color: '#000'
        }).setOrigin(0.5).setDepth(50);
        try {
            this.sceneContentGroup?.add(this.titleText);
        }
        catch { }
    }
    computeArea() {
        this.areaWidth = Math.round(this.scale.width * 0.92);
        this.areaLeft = Math.round((this.scale.width - this.areaWidth) / 2);
        this.areaTop = this.TITLE_Y + this.GAP_TITLE_TO_CONTENT;
        this.areaHeight = Math.max(240, Math.round(this.scale.height - this.areaTop - 40));
    }
    setupScrollArea() {
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
        this.listContainer = this.add.container(0, this.areaTop).setDepth(10);
        this.maskGraphics = this.add.graphics().setDepth(9);
        this.refreshMask();
        this.maskGraphics.setVisible(false);
        const mask = this.maskGraphics.createGeometryMask();
        this.listContainer.setMask(mask);
        this.scrollSurface = this.add.rectangle(this.areaLeft + this.areaWidth / 2, this.areaTop + this.areaHeight / 2, this.areaWidth, this.areaHeight, 0x000000, 0).setDepth(8);
        this.scrollSurface.setInteractive({ useHandCursor: true });
        // Drag
        this.scrollSurface.on('pointerdown', (p) => {
            this.dragActive = true;
            this.dragStartY = p.y;
            this.dragBaseScroll = this.scrollY;
        });
        this.input.on(Phaser.Input.Events.POINTER_MOVE, (p) => {
            if (!this.dragActive)
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
    refreshMask() {
        if (!this.maskGraphics)
            return;
        this.maskGraphics.clear();
        this.maskGraphics.fillStyle(0xffffff, 1);
        this.maskGraphics.fillRect(this.areaLeft - this.BORDER_STROKE, this.areaTop - this.BORDER_STROKE, this.areaWidth + this.BORDER_STROKE * 2, this.areaHeight + this.BORDER_STROKE * 2);
        this.scrollSurface?.setPosition(this.areaLeft + this.areaWidth / 2, this.areaTop + this.areaHeight / 2).setSize(this.areaWidth, this.areaHeight);
    }
    // ---------- Build grid ----------
    buildGrid() {
        if (!this.listContainer)
            return;
        const prev = this.listContainer.list.slice();
        prev.forEach(o => { try {
            o.destroy(true);
        }
        catch { } });
        // Hitung ukuran ikon & kolom
        const desiredIcon = Math.round(this.areaWidth / 8);
        const iconSize = Phaser.Math.Clamp(desiredIcon, this.ICON_MIN, this.ICON_MAX);
        const totalUnit = iconSize + this.GRID_GAP_X;
        let cols = Math.max(2, Math.floor((this.areaWidth + this.GRID_GAP_X) / totalUnit));
        cols = Math.min(cols, 6);
        const usedWidth = cols * iconSize + (cols - 1) * this.GRID_GAP_X;
        const startWorldX = this.areaLeft + (this.areaWidth - usedWidth) / 2;
        let yCursorLocal = this.INITIAL_TOP_PADDING; // local dalam container
        achievementCategories.forEach(cat => {
            // Title kategori (gunakan worldY = areaTop + localY)
            const catWorldY = this.areaTop + yCursorLocal;
            const catTitle = this.add.text(this.areaLeft + this.areaWidth / 2, catWorldY, cat.name, {
                fontFamily: 'Nunito',
                fontSize: `${this.CAT_TITLE_FONT}px`,
                color: '#000'
            }).setOrigin(0.5);
            this.listContainer.add(catTitle);
            yCursorLocal += this.CAT_TITLE_FONT + this.CAT_TITLE_GAP_BOTTOM;
            // Grid items
            let colIndex = 0;
            cat.items.forEach((ach) => {
                const worldX = startWorldX + colIndex * (iconSize + this.GRID_GAP_X) + iconSize / 2;
                const worldY = this.areaTop + yCursorLocal + iconSize / 2;
                const box = this.buildIconBox(worldX, worldY, iconSize, ach);
                this.listContainer.add(box);
                colIndex++;
                if (colIndex >= cols) {
                    colIndex = 0;
                    yCursorLocal += iconSize + this.GRID_GAP_Y;
                }
            });
            if (colIndex !== 0) {
                yCursorLocal += iconSize + this.GRID_GAP_Y;
            }
            // Jarak antar kategori
            yCursorLocal += this.ROW_GAP;
        });
        this.contentHeight = yCursorLocal;
        this.clampScroll();
    }
    buildIconBox(worldX, worldY, size, ach) {
        const container = this.add.container(worldX, worldY);
        container.width = size;
        container.height = size;
        const radius = Math.min(18, Math.floor(size * 0.28));
        const stroke = ach.unlocked ? 0x28a745 : 0x000000;
        const fill = ach.unlocked ? 0xe8f7e8 : 0xffffff;
        const g = this.add.graphics();
        g.lineStyle(this.BORDER_STROKE, stroke, 1).fillStyle(fill, 1);
        g.fillRoundedRect(-size / 2, -size / 2, size, size, radius);
        g.strokeRoundedRect(-size / 2, -size / 2, size, size, radius);
        container.add(g);
        if (ach.iconKey && this.textures.exists(ach.iconKey)) {
            const img = this.add.image(0, -4, ach.iconKey)
                .setDisplaySize(size * 0.6, size * 0.6)
                .setOrigin(0.5);
            container.add(img);
        }
        else {
            const txt = this.add.text(0, -4, 'Icon', {
                fontFamily: 'Nunito',
                fontSize: `${Math.max(14, Math.round(size * 0.28))}px`,
                color: '#000'
            }).setOrigin(0.5);
            container.add(txt);
        }
        const label = this.add.text(0, size * 0.28, ach.title, {
            fontFamily: 'Nunito',
            fontSize: `${Math.max(12, Math.round(size * 0.18))}px`,
            color: '#000',
            align: 'center',
            wordWrap: { width: Math.round(size * 0.9) }
        }).setOrigin(0.5, 0);
        container.add(label);
        container.setSize(size, size).setInteractive({ useHandCursor: true });
        container.on('pointerover', () => this.redrawIcon(g, size, ach.unlocked ? 0xd4edda : 0xf5f5f5, stroke, radius));
        container.on('pointerout', () => this.redrawIcon(g, size, fill, stroke, radius));
        container.on('pointerup', () => { this.playSound('sfx_click', { volume: 0.6 }); });
        return container;
    }
    redrawIcon(g, size, fillColor, strokeColor, radius) {
        g.clear();
        g.lineStyle(this.BORDER_STROKE, strokeColor, 1).fillStyle(fillColor, 1);
        g.fillRoundedRect(-size / 2, -size / 2, size, size, radius);
        g.strokeRoundedRect(-size / 2, -size / 2, size, size, radius);
    }
    // ---------- Scroll ----------
    layoutScroll() {
        if (!this.listContainer)
            return;
        this.listContainer.setPosition(0, this.areaTop - this.scrollY);
    }
    applyScroll(delta) {
        this.scrollY += delta;
        this.clampScroll();
        this.layoutScroll();
    }
    clampScroll() {
        const maxScroll = Math.max(0, this.contentHeight - this.areaHeight);
        if (this.scrollY < 0)
            this.scrollY = 0;
        if (this.scrollY > maxScroll)
            this.scrollY = maxScroll;
    }
}
