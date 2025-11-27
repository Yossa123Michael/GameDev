import { BaseScene } from './BaseScene';

interface Achievement {
  id: string;
  title: string;
  unlocked: boolean;
  iconKey?: string;
}
interface AchievementCategory {
  name: string;
  items: Achievement[];
}

// Contoh data (ubah sesuai kebutuhan Anda)
const achievementCategories: AchievementCategory[] = [
  { name: 'Memulai', items: [
    { id: 'start_1', title: 'Main 1x', unlocked: true },
    { id: 'start_5', title: 'Main 5x', unlocked: false },
    { id: 'start_10', title: 'Main 10x', unlocked: false },
    { id: 'start_25', title: 'Main 25x', unlocked: false },
    { id: 'start_50', title: 'Main 50x', unlocked: false },
  ]},
  { name: 'Skor', items: [
    { id: 'score_50', title: 'Skor 50', unlocked: true },
    { id: 'score_100', title: 'Skor 100', unlocked: true },
    { id: 'score_200', title: 'Skor 200', unlocked: false },
    { id: 'score_300', title: 'Skor 300', unlocked: false },
    { id: 'score_500', title: 'Skor 500', unlocked: false },
  ]},
  { name: 'Combo', items: [
    { id: 'combo_3', title: '3 Benar Beruntun', unlocked: true },
    { id: 'combo_5', title: '5 Benar Beruntun', unlocked: false },
    { id: 'combo_7', title: '7 Benar Beruntun', unlocked: false },
    { id: 'combo_10', title: '10 Benar Beruntun', unlocked: false },
  ]},
  { name: 'Koleksi', items: [
    { id: 'collect_1', title: 'Kumpul 1 Medal', unlocked: true },
    { id: 'collect_3', title: 'Kumpul 3 Medal', unlocked: false },
    { id: 'collect_5', title: 'Kumpul 5 Medal', unlocked: false },
    { id: 'collect_8', title: 'Kumpul 8 Medal', unlocked: false },
  ]},
];

export class AchievementScene extends BaseScene {
  private titleText?: Phaser.GameObjects.Text;

  // Nullable properties (untuk menghindari TS2412 & aman saat cleanup)
  private listContainer: Phaser.GameObjects.Container | null = null;
  private maskGraphics: Phaser.GameObjects.Graphics | null = null;
  private scrollSurface: Phaser.GameObjects.Rectangle | null = null;
  private debugFrame: Phaser.GameObjects.Graphics | null = null;

  private alive = true;

  private scrollY = 0;
  private contentHeight = 0;
  private dragActive = false;
  private dragStartY = 0;
  private dragBaseScroll = 0;

  // Area (viewport) untuk scroll
  private areaLeft = 0;
  private areaTop = 0;
  private areaWidth = 0;
  private areaHeight = 0;

  // Konstanta layout
  private readonly TITLE_Y = 90;
  private readonly GAP_TITLE_TO_CONTENT = 40;
  private readonly CAT_TITLE_FONT = 22;
  private readonly CAT_TITLE_GAP_BOTTOM = 12;
  private readonly GRID_GAP_X = 18;
  private readonly GRID_GAP_Y = 26;
  private readonly ICON_MIN = 72;
  private readonly ICON_MAX = 110;
  private readonly BORDER_STROKE = 3;
  private readonly INITIAL_TOP_PADDING = 16; // offset konten dari atas viewport
  private readonly ROW_GAP = 28;             // jarak antar kategori
  private readonly SHOW_DEBUG_FRAME = false;  // set true untuk lihat bingkai area

  constructor() { super('AchievementScene'); }

  public override create() {
    super.create();
    this.createCommonButtons('MainMenuScene');
    this.alive = true;

    this.buildTitle();
    this.computeArea();
    this.setupScrollArea();
    this.buildGrid();
    this.layoutScroll();

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.cleanup());
    this.events.once(Phaser.Scenes.Events.DESTROY,  () => this.cleanup());
  }

  public override draw() {
    if (!this.alive) return;

    // Simpan ratio scroll
    const ratio = this.contentHeight > this.areaHeight
      ? this.scrollY / Math.max(1, this.contentHeight - this.areaHeight)
      : 0;

    this.computeArea();

    // Perbarui posisi & ukuran scrollSurface di sini (bukan di refreshMask)
    if (this.scrollSurface) {
      this.scrollSurface.setPosition(
        this.areaLeft + this.areaWidth / 2,
        this.areaTop + this.areaHeight / 2
      );
      this.scrollSurface.setSize(this.areaWidth, this.areaHeight);
    }

    this.refreshMask(); // hanya menggambar mask, tidak menyentuh scrollSurface
    this.buildGrid();

    this.scrollY = ratio * Math.max(0, this.contentHeight - this.areaHeight);
    this.clampScroll();
    this.layoutScroll();

    this.titleText?.setPosition(this.centerX, this.TITLE_Y);
  }

  private buildTitle() {
    try { this.titleText?.destroy(); } catch {}
    this.titleText = this.add.text(this.centerX, this.TITLE_Y, 'Achievement', {
      fontFamily: 'Nunito',
      fontSize: '36px',
      color: '#000'
    }).setOrigin(0.5).setDepth(50);
    try { this.sceneContentGroup?.add(this.titleText); } catch {}
  }

  private computeArea() {
    this.areaWidth = Math.round(this.scale.width * 0.92);
    this.areaLeft = Math.round((this.scale.width - this.areaWidth) / 2);
    this.areaTop = this.TITLE_Y + this.GAP_TITLE_TO_CONTENT;
    this.areaHeight = Math.max(240, Math.round(this.scale.height - this.areaTop - 40));
  }

  private setupScrollArea() {
    // Hancurkan apapun yang ada (kalau scene ini dibuka ulang)
    try { this.listContainer?.destroy(true); } catch {}
    try { this.maskGraphics?.destroy(); } catch {}
    try { this.scrollSurface?.destroy(); } catch {}
    try { this.debugFrame?.destroy(); } catch {}

    // Container diletakkan di kiri-atas viewport (areaLeft, areaTop)
    this.listContainer = this.add.container(this.areaLeft, this.areaTop).setDepth(10);

    // Optional debug frame
    this.debugFrame = this.add.graphics().setDepth(9);
    if (this.SHOW_DEBUG_FRAME) {
      this.debugFrame.lineStyle(1, 0x00aaff, 1);
      this.debugFrame.strokeRect(this.areaLeft, this.areaTop, this.areaWidth, this.areaHeight);
    } else {
      this.debugFrame.clear();
    }

    // Graphics untuk mask (geometry mask)
    this.maskGraphics = this.add.graphics().setDepth(9);
    this.refreshMask(); // gambar mask (aman, tidak menyentuh scrollSurface)

    // Surface interaksi — dibuat setelah area & mask siap
    this.scrollSurface = this.add.rectangle(
      this.areaLeft + this.areaWidth / 2,
      this.areaTop + this.areaHeight / 2,
      this.areaWidth,
      this.areaHeight,
      0x000000,
      0
    ).setDepth(8).setInteractive({ useHandCursor: true });

    // Pasang mask ke container (bukan ke surface)
    const isCanvas = (this.game.renderer as any)?.type === Phaser.CANVAS;
    if (!isCanvas && this.maskGraphics) {
      const mask = this.maskGraphics.createGeometryMask();
      this.listContainer!.setMask(mask);
    } else {
      this.listContainer!.clearMask(); // fallback tanpa mask di Canvas
    }

    // Drag
    this.scrollSurface.on('pointerdown', (p: Phaser.Input.Pointer) => {
      this.dragActive = true;
      this.dragStartY = p.y;
      this.dragBaseScroll = this.scrollY;
    });
    this.input.on(Phaser.Input.Events.POINTER_MOVE, (p: Phaser.Input.Pointer) => {
      if (!this.dragActive || !this.alive || !this.scene.isActive()) return;
      const delta = p.y - this.dragStartY;
      this.scrollY = this.dragBaseScroll - delta;
      this.clampScroll();
      this.layoutScroll();
    });
    this.input.on(Phaser.Input.Events.POINTER_UP,   () => { this.dragActive = false; });
    this.input.on(Phaser.Input.Events.GAME_OUT,     () => { this.dragActive = false; });

    // Wheel
    this.input.on('wheel',
      (_pointer: Phaser.Input.Pointer, _gos: Phaser.GameObjects.GameObject[], _dx: number, dy: number) => {
        if (!this.alive || !this.scene.isActive()) return;
        this.applyScroll(dy * 0.6);
      }
    );
  }

  private refreshMask() {
    if (!this.maskGraphics) return;

    // Hanya menggambar mask; TIDAK menyentuh scrollSurface (no setSize / setPosition)
    this.maskGraphics.clear();
    this.maskGraphics.fillStyle(0xffffff, 1);
    this.maskGraphics.fillRect(
      this.areaLeft - this.BORDER_STROKE,
      this.areaTop - this.BORDER_STROKE,
      this.areaWidth + this.BORDER_STROKE * 2,
      this.areaHeight + this.BORDER_STROKE * 2
    );

    // Debug frame (opsional)
    if (this.SHOW_DEBUG_FRAME && this.debugFrame) {
      this.debugFrame.clear();
      this.debugFrame.lineStyle(1, 0x00aaff, 1);
      this.debugFrame.strokeRect(this.areaLeft, this.areaTop, this.areaWidth, this.areaHeight);
    }
  }

  private buildGrid() {
    if (!this.listContainer || !this.alive) return;

    // Bersihkan isi container
    const prev = this.listContainer.list.slice();
    prev.forEach(o => { try { o.destroy(true); } catch {} });

    // Hitung ukuran ikon & kolom
    const desiredIcon = Math.round(this.areaWidth / 8);
    const iconSize = Phaser.Math.Clamp(desiredIcon, this.ICON_MIN, this.ICON_MAX);
    const totalUnit = iconSize + this.GRID_GAP_X;
    let cols = Math.max(2, Math.floor((this.areaWidth + this.GRID_GAP_X) / totalUnit));
    cols = Math.min(cols, 6);

    const usedWidth = cols * iconSize + (cols - 1) * this.GRID_GAP_X;
    const startLocalX = (this.areaWidth - usedWidth) / 2; // lokal terhadap container

    let yLocal = this.INITIAL_TOP_PADDING; // lokal terhadap container

    achievementCategories.forEach(cat => {
      // Judul kategori (buat world, lalu set local agar tepat di tengah container)
      const catTitle = this.add.text(this.areaLeft + this.areaWidth / 2, this.areaTop + yLocal, cat.name, {
        fontFamily: 'Nunito',
        fontSize: `${this.CAT_TITLE_FONT}px`,
        color: '#000'
      }).setOrigin(0.5);
      this.listContainer!.add(catTitle);
      catTitle.setPosition(this.areaWidth / 2, yLocal); // local

      yLocal += this.CAT_TITLE_FONT + this.CAT_TITLE_GAP_BOTTOM;

      // Grid items
      let col = 0;
      cat.items.forEach(ach => {
        const xLocal = startLocalX + col * (iconSize + this.GRID_GAP_X) + iconSize / 2;
        const yLocalCenter = yLocal + iconSize / 2;

        const icon = this.buildIconBoxLocal(xLocal, yLocalCenter, iconSize, ach);
        this.listContainer!.add(icon);

        col++;
        if (col >= cols) {
          col = 0;
          yLocal += iconSize + this.GRID_GAP_Y;
        }
      });

      if (col !== 0) yLocal += iconSize + this.GRID_GAP_Y;

      yLocal += this.ROW_GAP; // jarak antar kategori
    });

    this.contentHeight = yLocal;
    this.clampScroll();
  }

  private buildIconBoxLocal(xLocal: number, yLocal: number, size: number, ach: Achievement) {
    const c = this.add.container(0, 0);
    (c as any).width = size;
    (c as any).height = size;

    const radius = Math.min(18, Math.floor(size * 0.28));
    const stroke = ach.unlocked ? 0x28a745 : 0x000000;
    const fill = ach.unlocked ? 0xe8f7e8 : 0xffffff;

    const g = this.add.graphics();
    g.lineStyle(this.BORDER_STROKE, stroke, 1).fillStyle(fill, 1);
    g.fillRoundedRect(-size / 2, -size / 2, size, size, radius);
    g.strokeRoundedRect(-size / 2, -size / 2, size, size, radius);
    c.add(g);

    if (ach.iconKey && this.textures.exists(ach.iconKey)) {
      const img = this.add.image(0, -4, ach.iconKey).setDisplaySize(size * 0.6, size * 0.6).setOrigin(0.5);
      c.add(img);
    } else {
      const txt = this.add.text(0, -4, 'Icon', {
        fontFamily: 'Nunito',
        fontSize: `${Math.max(14, Math.round(size * 0.28))}px`,
        color: '#000'
      }).setOrigin(0.5);
      c.add(txt);
    }

    const label = this.add.text(0, size * 0.28, ach.title, {
      fontFamily: 'Nunito',
      fontSize: `${Math.max(12, Math.round(size * 0.18))}px`,
      color: '#000',
      align: 'center',
      wordWrap: { width: Math.round(size * 0.9) }
    }).setOrigin(0.5, 0);
    c.add(label);

    c.setPosition(xLocal, yLocal).setSize(size, size).setInteractive({ useHandCursor: true });
    c.on('pointerover', () => this.redrawIcon(g, size, ach.unlocked ? 0xd4edda : 0xf5f5f5, stroke, radius));
    c.on('pointerout',  () => this.redrawIcon(g, size, fill, stroke, radius));
    c.on('pointerup',   () => this.playSound('sfx_click', { volume: 0.6 }));

    return c;
  }

  private redrawIcon(g: Phaser.GameObjects.Graphics, size: number, fillColor: number, strokeColor: number, radius: number) {
    g.clear();
    g.lineStyle(this.BORDER_STROKE, strokeColor, 1).fillStyle(fillColor, 1);
    g.fillRoundedRect(-size / 2, -size / 2, size, size, radius);
    g.strokeRoundedRect(-size / 2, -size / 2, size, size, radius);
  }

  private layoutScroll() {
    if (!this.listContainer) return;
    this.listContainer.setPosition(this.areaLeft, this.areaTop - this.scrollY);
  }

  private applyScroll(delta: number) {
    this.scrollY += delta;
    this.clampScroll();
    this.layoutScroll();
  }

  private clampScroll() {
    const maxScroll = Math.max(0, this.contentHeight - this.areaHeight);
    if (this.scrollY < 0) this.scrollY = 0;
    if (this.scrollY > maxScroll) this.scrollY = maxScroll;
  }

  private cleanup() {
    this.alive = false;

    // Hapus listener input
    try { this.input.off('wheel'); } catch {}
    try { this.input.off(Phaser.Input.Events.POINTER_MOVE); } catch {}
    try { this.input.off(Phaser.Input.Events.POINTER_UP); } catch {}
    try { this.input.off(Phaser.Input.Events.GAME_OUT); } catch {}

    // Hancurkan objek grafik/containers
    try { this.listContainer?.destroy(true); } catch {}
    try { this.maskGraphics?.destroy(); } catch {}
    try { this.scrollSurface?.destroy(); } catch {}
    try { this.debugFrame?.destroy(); } catch {}

    // Null-assignment untuk mematuhi exactOptionalPropertyTypes
    this.listContainer = null;
    this.maskGraphics = null;
    this.scrollSurface = null;
    this.debugFrame = null;
  }
}
