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

// Dummy data contoh (ganti sesuai kebutuhan)
const achievementCategories: AchievementCategory[] = [
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
  private titleText?: Phaser.GameObjects.Text;

  private listContainer?: Phaser.GameObjects.Container;
  private maskGraphics?: Phaser.GameObjects.Graphics;
  private scrollSurface?: Phaser.GameObjects.Rectangle;
  private debugFrame?: Phaser.GameObjects.Graphics;

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
  private readonly SHOW_DEBUG_FRAME = false; // set true untuk lihat bingkai area

  constructor() { super('AchievementScene'); }

  public override create() {
    super.create();
    this.createCommonButtons('MainMenuScene');

    this.buildTitle();
    this.computeArea();
    this.setupScrollArea();
    this.buildGrid();
    this.layoutScroll();

    // Rebuild 1 tick kemudian (jamin ukuran final)
    this.time.delayedCall(50, () => {
      this.computeArea();
      this.refreshMask();
      this.buildGrid();
      this.layoutScroll();
    });
  }

  public override draw() {
    // Dipanggil saat resize
    const ratio = this.contentHeight > this.areaHeight
      ? this.scrollY / Math.max(1, this.contentHeight - this.areaHeight)
      : 0;

    this.computeArea();
    this.refreshMask();
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
    try { this.listContainer?.destroy(true); } catch {}
    try { this.maskGraphics?.destroy(); } catch {}
    try { this.scrollSurface?.destroy(); } catch {}
    try { this.debugFrame?.destroy(); } catch {}

    // Container kita posisikan di KIRI-ATAS viewport (areaLeft, areaTop)
    this.listContainer = this.add.container(this.areaLeft, this.areaTop).setDepth(10);

    // Optional: frame debug
    this.debugFrame = this.add.graphics().setDepth(9);
    if (this.SHOW_DEBUG_FRAME) {
      this.debugFrame.lineStyle(1, 0x00aaff, 1);
      this.debugFrame.strokeRect(this.areaLeft, this.areaTop, this.areaWidth, this.areaHeight);
    } else {
      this.debugFrame.clear();
    }

    // Mask (GeometryMask). Jika renderer Canvas bermasalah, kita fallback TANPA mask.
    this.maskGraphics = this.add.graphics().setDepth(9);
    this.refreshMask();

    const isCanvas = (this.game.renderer as any)?.type === Phaser.CANVAS;
    if (!isCanvas) {
      const mask = this.maskGraphics.createGeometryMask();
      this.listContainer.setMask(mask);
    } else {
      // Canvas fallback: biarkan tanpa mask (konten mungkin overflow, tapi terlihat)
      this.listContainer.clearMask();
    }

    // Surface untuk drag/wheel (pakai world coords)
    this.scrollSurface = this.add.rectangle(
      this.areaLeft + this.areaWidth / 2,
      this.areaTop + this.areaHeight / 2,
      this.areaWidth,
      this.areaHeight,
      0x000000,
      0
    ).setDepth(8).setInteractive({ useHandCursor: true });

    // Drag
    this.scrollSurface.on('pointerdown', (p: Phaser.Input.Pointer) => {
      this.dragActive = true;
      this.dragStartY = p.y;
      this.dragBaseScroll = this.scrollY;
    });
    this.input.on(Phaser.Input.Events.POINTER_MOVE, (p: Phaser.Input.Pointer) => {
      if (!this.dragActive) return;
      const delta = p.y - this.dragStartY;
      this.scrollY = this.dragBaseScroll - delta;
      this.clampScroll();
      this.layoutScroll();
    });
    this.input.on(Phaser.Input.Events.POINTER_UP, () => { this.dragActive = false; });
    this.input.on(Phaser.Input.Events.GAME_OUT, () => { this.dragActive = false; });

    // Wheel
    this.input.on('wheel',
      (pointer: Phaser.Input.Pointer, _gos: Phaser.GameObjects.GameObject[], _dx: number, dy: number) => {
        this.applyScroll(dy * 0.6);
      }
    );
  }

  private refreshMask() {
    if (!this.maskGraphics) return;
    this.maskGraphics.clear();
    this.maskGraphics.fillStyle(0xffffff, 1);
    // padding supaya border tidak tersayat
    this.maskGraphics.fillRect(
      this.areaLeft - this.BORDER_STROKE,
      this.areaTop - this.BORDER_STROKE,
      this.areaWidth + this.BORDER_STROKE * 2,
      this.areaHeight + this.BORDER_STROKE * 2
    );

    // Update frame debug
    if (this.SHOW_DEBUG_FRAME) {
      this.debugFrame?.clear();
      this.debugFrame?.lineStyle(1, 0x00aaff, 1);
      this.debugFrame?.strokeRect(this.areaLeft, this.areaTop, this.areaWidth, this.areaHeight);
    }

    // Update surface
    this.scrollSurface?.setPosition(
      this.areaLeft + this.areaWidth / 2,
      this.areaTop + this.areaHeight / 2
    ).setSize(this.areaWidth, this.areaHeight);
  }

  private buildGrid() {
    if (!this.listContainer) return;

    // Bersihkan isi listContainer
    const prev = this.listContainer.list.slice();
    prev.forEach(o => { try { o.destroy(true); } catch {} });

    // Hitung ukuran ikon & kolom
    const desiredIcon = Math.round(this.areaWidth / 8);
    const iconSize = Phaser.Math.Clamp(desiredIcon, this.ICON_MIN, this.ICON_MAX);
    const totalUnit = iconSize + this.GRID_GAP_X;
    let cols = Math.max(2, Math.floor((this.areaWidth + this.GRID_GAP_X) / totalUnit));
    cols = Math.min(cols, 6);

    const usedWidth = cols * iconSize + (cols - 1) * this.GRID_GAP_X;
    const startLocalX = (this.areaWidth - usedWidth) / 2; // LOCAL ke container (karena container.x=areaLeft)

    let yLocal = this.INITIAL_TOP_PADDING; // LOCAL Y (bukan world)

    achievementCategories.forEach(cat => {
      // Teks kategori (LOCAL)
      const catTitle = this.add.text(
        this.areaLeft + this.areaWidth / 2, // buat di world lalu kita ubah ke local
        this.areaTop + yLocal,
        cat.name,
        { fontFamily: 'Nunito', fontSize: `${this.CAT_TITLE_FONT}px`, color: '#000' }
      ).setOrigin(0.5);

      // Tambahkan ke container dan set ke local koordinat
      this.listContainer!.add(catTitle);
      catTitle.setPosition(this.areaWidth / 2, yLocal); // local (x dalam container, y dalam container)

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
    // Buat container di (0,0), tambah ke listContainer dulu, lalu posisikan LOCAL
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

    // Set posisi LOCAL setelah jadi child listContainer (dipanggil oleh caller)
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
    // Container sudah di (areaLeft, areaTop). Geser hanya secara vertikal dengan scrollY.
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
}
