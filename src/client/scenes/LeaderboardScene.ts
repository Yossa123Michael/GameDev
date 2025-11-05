import { BaseScene } from './BaseScene';
import { supabase } from '../lib/supabaseClient';

type Entry = { name: string; score: number; created_at: string; user_id?: string };
type UserBest = { name: string; score: number; created_at: string; rank: number };

export class LeaderboardScene extends BaseScene {
  private entries: Entry[] = [];
  private myBest: UserBest | null = null;

  // UI scroll
  private listContainer!: Phaser.GameObjects.Container;
  private maskGraphics!: Phaser.GameObjects.Graphics;
  private scrollArea!: Phaser.GameObjects.Rectangle;
  private scrollY = 0;
  private scrollDrag = { active: false, startY: 0, baseScroll: 0 };
  private contentHeight = 0;

  constructor() { super('LeaderboardScene'); }

  public override async create() {
    super.create();
    this.createCommonButtons('MainMenuScene');

    // Muat data
    await this.loadData();

    // Siapkan komponen scroll sebelum render pertama
    this.setupScrollArea();

    // Render pertama
    try {
      this.draw();
    } catch (e) {
      console.warn('initial draw() failed:', e);
    }
  }

  private async loadData() {
    try {
      // Top 100
      const { data: top, error: e1 } = await supabase
        .from('scores')
        .select('name,score,created_at,user_id')
        .order('score', { ascending: false })
        .order('created_at', { ascending: true })
        .limit(100);

      if (e1) console.error('Failed to load leaderboard', e1);
      this.entries = (top || []) as Entry[];

      // User saat ini (untuk baris personal)
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;

      if (uid) {
        // Best score user (tie-break created_at)
        const { data: best, error: e2 } = await supabase
          .from('scores')
          .select('name,score,created_at')
          .eq('user_id', uid)
          .order('score', { ascending: false })
          .order('created_at', { ascending: true })
          .limit(1)
          .maybeSingle();

        if (!e2 && best) {
          const myScore = best.score;
          const myCreated = best.created_at;

          // Hitung rank: lebih besar + sama tapi created_at lebih awal
          const q1 = await supabase
            .from('scores')
            .select('id', { count: 'exact', head: true })
            .gt('score', myScore);
          const higher = q1.count || 0;

          const q2 = await supabase
            .from('scores')
            .select('id', { count: 'exact', head: true })
            .eq('score', myScore)
            .lt('created_at', myCreated);
          const earlier = q2.count || 0;

          this.myBest = { name: best.name, score: myScore, created_at: myCreated, rank: higher + earlier + 1 };
        } else {
          this.myBest = null;
        }
      } else {
        this.myBest = null;
      }
    } catch (e) {
      console.error('loadData error', e);
      this.entries = [];
      this.myBest = null;
    }
  }

  // Buat area scrollable (mask + container + wheel/drag)
  private setupScrollArea() {
    // Bersihkan instansi lama (jika ada)
    if (this.listContainer) this.listContainer.destroy(true);
    if (this.maskGraphics) this.maskGraphics.destroy();
    if (this.scrollArea) this.scrollArea.destroy();

    // Area daftar mulai dari di bawah judul
    const top = 120;
    const left = Math.round(this.scale.width * 0.06);
    const width = Math.round(this.scale.width * 0.88);
    const height = Math.max(160, Math.round(this.scale.height * 0.74)); // area besar untuk scroll

    // Container berisi semua baris (posisi akan digeser sesuai scroll)
    this.listContainer = this.add.container(0, top);

    // Mask (geometry) untuk clipping
    this.maskGraphics = this.add.graphics().fillStyle(0xffffff).fillRect(left, top, width, height).setVisible(false);
    const mask = this.maskGraphics.createGeometryMask();
    this.listContainer.setMask(mask);

    // Area interaktif untuk drag/scroll
    this.scrollArea = this.add.rectangle(left + width / 2, top + height / 2, width, height, 0x000000, 0)
      .setInteractive({ useHandCursor: true });

    // Wheel (gunakan input global agar tetap jalan di atas elemen list)
    this.input.on('wheel', (_pointer: any, _go: any, _dx: number, dy: number) => {
      // scroll hanya saat scene aktif
      if (!this.scene.isActive()) return;
      this.applyScroll(dy * 0.5);
    });

    // Drag to scroll
    this.scrollArea.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.scrollDrag.active = true;
      this.scrollDrag.startY = pointer.y;
      this.scrollDrag.baseScroll = this.scrollY;
    });
    this.input.on(Phaser.Input.Events.POINTER_MOVE, (pointer: Phaser.Input.Pointer) => {
      if (!this.scrollDrag.active) return;
      const delta = pointer.y - this.scrollDrag.startY;
      this.scrollY = this.scrollDrag.baseScroll - delta;
      this.clampScroll();
      this.layoutList();
    });
    this.input.on(Phaser.Input.Events.POINTER_UP, () => { this.scrollDrag.active = false; });
    this.input.on(Phaser.Input.Events.GAME_OUT, () => { this.scrollDrag.active = false; });
  }

  private applyScroll(delta: number) {
    this.scrollY += delta;
    this.clampScroll();
    this.layoutList();
  }

  private clampScroll() {
    const height = Math.max(160, Math.round(this.scale.height * 0.74));
    const maxScroll = Math.max(0, this.contentHeight - height);
    if (this.scrollY < 0) this.scrollY = 0;
    if (this.scrollY > maxScroll) this.scrollY = maxScroll;
  }

  public override draw() {
    super.draw();

    // Pastikan komponen scroll sudah ada (lazy init jika BaseScene memanggil draw terlalu cepat)
    if (!this.listContainer || !this.maskGraphics || !this.scrollArea) {
      this.setupScrollArea();
    }

    // Judul
    const title = this.add.text(this.centerX, 80, 'Leaderboard', {
      fontFamily: 'Nunito', fontSize: '36px', color: '#000'
    }).setOrigin(0.5);
    this.sceneContentGroup.add(title);

    // Header tetap di area scroll agar “terpotong” rapi oleh mask bagian atas
    this.buildList();
    this.layoutList();
  }

  private buildList() {
    // Bersihkan isi sebelumnya
    if (this.listContainer && (this.listContainer as any).removeAll) {
      (this.listContainer as any).removeAll(true);
    }

    const left = Math.round(this.scale.width * 0.06);
    const width = Math.round(this.scale.width * 0.88);

    // Header kolom
    let y = 0;
    const rowH = Math.max(40, Math.round(this.scale.height * 0.065));
    const header = this.createRow(left, y, width, { rank: '#', name: 'Nama', score: 'Skor' }, true);
    this.listContainer.add(header);

    // Top 100
    this.entries.forEach((e, i) => {
      y += rowH;
      const row = this.createRow(left, y, width, {
        rank: `${i + 1}.`,
        name: e.name || 'Player',
        score: `${e.score}`
      });
      this.listContainer.add(row);
    });

    // Baris personal jika di luar top 100
    if (this.myBest && this.myBest.rank > 100) {
      // Spacer
      y += Math.round(rowH * 0.6);
      const spacer = this.add.text(left + width / 2, y + rowH * 0.5, '— Di luar 100 besar —', {
        fontFamily: 'Nunito', fontSize: '16px', color: '#666'
      }).setOrigin(0.5);
      this.listContainer.add(spacer);

      y += rowH;
      const myRow = this.createRow(left, y, width, {
        rank: `${this.myBest.rank}.`,
        name: this.myBest.name || 'You',
        score: `${this.myBest.score}`
      }, false, true); // isMe = true → hijau
      this.listContainer.add(myRow);
    }

    this.contentHeight = y + rowH + 8;
    this.clampScroll();
  }

  // Buat "baris seperti tombol" (rounded rect) dengan koordinat LOKAL (0..width, 0..height) dalam container
  private createRow(xLeft: number, yTop: number, width: number, data: { rank: string; name: string; score: string }, isHeader = false, isMe = false) {
    const height = Math.max(40, Math.round(this.scale.height * 0.065));
    const radius = Math.min(16, Math.round(height * 0.35));

    // Container baris di posisi (xLeft, yTop)
    const c = this.add.container(xLeft, yTop);
    c.setSize(width, height);

    // Background (digambar pada koordinat lokal 0,0)
    const g = this.add.graphics();
    const fill = isHeader ? 0xf2f2f2 : (isMe ? 0xd4edda : 0xffffff);
    const stroke = isHeader ? 0x999999 : (isMe ? 0x28a745 : 0x000000);
    g.lineStyle(2, stroke, 1).fillStyle(fill, 1);
    g.fillRoundedRect(0, 0, width, height, radius);
    g.strokeRoundedRect(0, 0, width, height, radius);
    c.add(g);

    // Teks lokal relatif ke container
    const padX = Math.round(width * 0.04);

    const rankT = this.add.text(padX, height / 2, data.rank, {
      fontFamily: 'Nunito', fontSize: `${Math.max(14, Math.round(height * 0.42))}px`, color: '#000'
    }).setOrigin(0, 0.5);
    c.add(rankT);

    const nameT = this.add.text(width / 2, height / 2, data.name, {
      fontFamily: 'Nunito', fontSize: `${Math.max(14, Math.round(height * 0.42))}px`, color: '#000'
    }).setOrigin(0.5);
    c.add(nameT);

    const scoreT = this.add.text(width - padX, height / 2, data.score, {
      fontFamily: 'Nunito', fontSize: `${Math.max(14, Math.round(height * 0.42))}px`, color: '#000'
    }).setOrigin(1, 0.5);
    c.add(scoreT);

    return c;
  }

  private layoutList() {
    // Geser container utama sesuai scroll (mask tetap pada posisi layar)
    const top = 120;
    const left = Math.round(this.scale.width * 0.06);
    const width = Math.round(this.scale.width * 0.88);
    const height = Math.max(160, Math.round(this.scale.height * 0.74));

    // Posisi listContainer relatif terhadap layar (top) dikurangi scroll
    this.listContainer.setPosition(0, top - this.scrollY);

    // Update mask area saat resize
    if (this.maskGraphics) {
      this.maskGraphics.clear().fillStyle(0xffffff).fillRect(left, top, width, height);
    }
    if (this.scrollArea) {
      this.scrollArea.setPosition(left + width / 2, top + height / 2).setSize(width, height);
    }
  }
}
