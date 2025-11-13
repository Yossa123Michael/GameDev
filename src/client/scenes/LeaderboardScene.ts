import { BaseScene } from './BaseScene';
import { supabase } from '../lib/supabaseClient';
import { getLastSubmission } from '../lib/submitScore';

type Entry = { id?: number; name: string; score: number; created_at: string; user_id?: string };
type UserBest = { name: string; score: number; created_at: string; rank?: number };
type LastSub = { user_id: string | null; name: string; score: number; created_at: string };

function getDeviceBest(): number | null {
  try { const raw = localStorage.getItem('rk:best'); return raw ? Number(raw) : null; } catch { return null; }
}

export class LeaderboardScene extends BaseScene {
  private entries: Entry[] = [];
  private myBest: UserBest | null = null;
  private currentUserId: string | null = null;
  private lastSub: LastSub | null = null;
  private deviceBest: number | null = null;

  // index baris user di Top 100 (jika ada)
  private inTop100Index: number | null = null;

  // UI / scroll
  private listContainer?: Phaser.GameObjects.Container;
  private maskGraphics?: Phaser.GameObjects.Graphics;
  private scrollArea?: Phaser.GameObjects.Rectangle;
  private scrollY = 0;
  private scrollDrag = { active: false, startY: 0, baseScroll: 0 };
  private contentHeight = 0;

  // cache ukuran area list
  private area = { left: 0, top: 120, width: 0, height: 0 };

  // metrics baris
  private rowH = 60;
  private rowGap = 14;

  private statusText?: Phaser.GameObjects.Text;

  private wheelBound = false;
  private wheelHandler = (_pointer: any, _gos: any, _dx: number, dy: number) => {
    if (!this.scene.isActive()) return;
    this.applyScroll(dy * 0.6);
  };

  private alive = true;

  constructor() { super('LeaderboardScene'); }

  public async create() {
    super.create();
    this.createCommonButtons('MainMenuScene');

    this.alive = true;
    this.showStatus('Loading leaderboard...');
    this.scrollY = 0;
    this.inTop100Index = null;

    await this.loadDataFast(); // cepat: 1 query top100 + auth
    if (!this.alive) return;

    this.setupScrollArea();
    this.safeDraw();

    // Jadwalkan re-render kecil untuk berjaga saat resize/fit pertama
    this.time.delayedCall(50, () => this.safeDraw());
    this.time.delayedCall(150, () => this.safeDraw());

    // Rank global dihitung “belakangan” agar UI cepat
    this.computeRankInBackground();

    this.events.once('shutdown', () => { this.alive = false; this.cleanupListeners(); });
    this.events.once('destroy',  () => { this.alive = false; this.cleanupListeners(); });
  }

  // Render tanpa super.draw() supaya tidak blank jika ada error di tengah
  private safeDraw() {
    if (!this.alive) return;

    if (!this.listContainer || !this.maskGraphics || !this.scrollArea) {
      this.setupScrollArea();
      this.time.delayedCall(0, () => { if (this.alive) this.safeDraw(); });
      return;
    }

    try {
      // Hapus judul lama
      const prevTitle = this.children.getByName?.('leaderboard_title');
      if (prevTitle) { try { prevTitle.destroy(); } catch {} }

      // Bersihkan isi listContainer (tanpa menghapus containernya)
      const copy = this.listContainer.list.slice();
      copy.forEach(c => { try { c.destroy(true); } catch {} });

      // Hapus fixed row lama
      const ex = this.children.getByName?.('fixed_my_row');
      if (ex) { try { ex.destroy(); } catch {} }

      // Judul
      const title = this.add.text(this.centerX, 80, 'Leaderboard', {
        fontFamily: 'Nunito', fontSize: '36px', color: '#000'
      }).setOrigin(0.5).setDepth(5);
      title.setName('leaderboard_title');
      try { this.sceneContentGroup?.add(title); } catch { this.add.existing(title); }

      // Update metrics berdasar kanvas saat ini (Scale.FIT)
      this.computeMetrics();

      // Build list + layout + fixed row
      this.buildList();
      this.layoutList();
      this.renderFixedMyRow();

      this.showStatus(null);
    } catch (e) {
      console.warn('safeDraw failed, scheduling retry:', e);
      this.showStatus('Rendering...');
      this.time.delayedCall(80, () => { if (this.alive) this.safeDraw(); });
    }
  }

  private showStatus(message: string | null) {
    if (!this.alive) return;
    if (!this.statusText && message) {
      this.statusText = this.add.text(this.centerX, this.scale.height * 0.5, message, {
        fontFamily: 'Nunito', fontSize: '20px', color: '#666'
      }).setOrigin(0.5).setDepth(1002);
      try { this.sceneContentGroup?.add(this.statusText); } catch {}
    } else if (this.statusText) {
      if (message) this.statusText.setText(message).setVisible(true);
      else this.statusText.setVisible(false);
    }
  }

  // Muat data cepat: top100 + auth secara paralel. Tanpa hitung rank dulu.
  private async loadDataFast() {
    this.entries = [];
    this.myBest = null;
    this.currentUserId = null;
    this.inTop100Index = null;
    this.lastSub = getLastSubmission();
    this.deviceBest = getDeviceBest();

    // Jalankan paralel: top100 dan auth
    const [topRes, authRes] = await Promise.all([
      supabase
        .from('scores')
        .select('id,name,score,created_at,user_id')
        .order('score', { ascending: false })
        .order('created_at', { ascending: true })
        .limit(600),
      supabase.auth.getUser()
    ]);

    if (topRes.error) throw topRes.error;

    // Dedup per user_id agar 1 user hanya 1 baris
    const seen = new Set<string>();
    const unique: Entry[] = [];
    for (const e of (topRes.data || []) as Entry[]) {
      if (e.user_id) {
        if (seen.has(e.user_id)) continue;
        seen.add(e.user_id);
        unique.push(e);
      } else {
        unique.push(e);
      }
      if (unique.length >= 100) break;
    }
    this.entries = unique;

    const uid = (authRes.data as any)?.user?.id ?? null;
    this.currentUserId = uid;

    // Cari index by user_id (akurat)
    if (uid) {
      const idx = this.entries.findIndex(en => en.user_id === uid);
      if (idx >= 0) {
        this.inTop100Index = idx;
        const en = this.entries[idx]!;
        this.myBest = { name: en.name, score: en.score, created_at: en.created_at, rank: idx + 1 };
      }
    }

    // Jika belum ketemu di Top 100, fallback highlight ke skor deviceBest
    if (this.inTop100Index == null && this.deviceBest != null) {
      const idx2 = this.entries.findIndex(en => en.score === this.deviceBest!);
      if (idx2 >= 0) {
        this.inTop100Index = idx2;
        const en = this.entries[idx2]!;
        this.myBest = { name: en.name || this.lastSub?.name || 'You', score: en.score, created_at: en.created_at };
      }
    }

    // Jika tetap tidak ada di Top 100 tapi ada deviceBest → fixed row minimal
    if (!this.myBest && this.deviceBest != null) {
      this.myBest = { name: this.lastSub?.name || 'You', score: this.deviceBest, created_at: '' };
    }

    this.showStatus(null);

    console.log('Leaderboard loaded:', {
      count: this.entries.length,
      myBest: this.myBest,
      inTop100Index: this.inTop100Index,
      uid: this.currentUserId,
      deviceBest: this.deviceBest,
      lastSub: this.lastSub
    });
  }

  // Hitung rank di latar belakang (tidak memblokir render cepat)
  private async computeRankInBackground() {
    if (!this.alive) return;
    if (this.inTop100Index != null) return;
    if (!this.myBest?.score) return;

    try {
      const q = await supabase.from('scores').select('id', { count: 'exact', head: true }).gt('score', this.myBest.score);
      const higher = q.count || 0;
      this.myBest.rank = higher + 1;
      if (this.alive) this.renderFixedMyRow();
    } catch {
      // abaikan
    }
  }

  private computeMetrics() {
    // Area list
    const top = 120;
    const left = Math.round(this.scale.width * 0.06);
    const width = Math.round(this.scale.width * 0.88);
    const height = Math.max(160, Math.round(this.scale.height * 0.74));
    this.area = { left, top, width, height };

    // Tinggi baris dan gap responsif (berbasis tinggi virtual)
    this.rowH = Math.max(48, Math.round(this.scale.height * 0.065));
    this.rowGap = Math.max(8, Math.round(this.scale.height * 0.02));
  }

  private setupScrollArea() {
    try { this.listContainer?.destroy(true); } catch {}
    try { this.maskGraphics?.destroy(); } catch {}
    try { this.scrollArea?.destroy(); } catch {}

    this.computeMetrics();

    this.listContainer = this.add.container(0, this.area.top).setDepth(1000);

    this.maskGraphics = this.add.graphics().setDepth(999);
    this.maskGraphics.fillStyle(0xffffff, 1);
    this.maskGraphics.fillRect(this.area.left, this.area.top, this.area.width, this.area.height);
    this.maskGraphics.setVisible(false);
    const mask = this.maskGraphics.createGeometryMask();
    this.listContainer.setMask(mask);

    this.scrollArea = this.add.rectangle(
      this.area.left + this.area.width / 2,
      this.area.top + this.area.height / 2,
      this.area.width,
      this.area.height,
      0x000000,
      0
    ).setDepth(998);
    this.scrollArea.setInteractive({ useHandCursor: true });

    if (!this.wheelBound) { this.input.on('wheel', this.wheelHandler); this.wheelBound = true; }

    this.input.off(Phaser.Input.Events.POINTER_MOVE);
    this.input.off(Phaser.Input.Events.POINTER_UP);
    this.input.off(Phaser.Input.Events.GAME_OUT);

    this.scrollArea.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.scrollDrag.active = true;
      this.scrollDrag.startY = pointer.y;
      this.scrollDrag.baseScroll = this.scrollY;
    });
    this.input.on(Phaser.Input.Events.POINTER_MOVE, (pointer: Phaser.Input.Pointer) => {
      if (!this.scrollDrag.active || !this.alive) return;
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
    const maxScroll = Math.max(0, this.contentHeight - this.area.height);
    if (this.scrollY < 0) this.scrollY = 0;
    if (this.scrollY > maxScroll) this.scrollY = maxScroll;
  }

  // draw() dikosongkan; gunakan safeDraw
    public override draw() {
    this.safeDraw();
  }

  private buildList() {
    if (!this.listContainer) return;

    const left = this.area.left;
    const width = this.area.width;

    // Header
    let y = 0;
    const header = this.createRow(left, y, width, { rank: 'Rank', name: 'Nama', score: 'High Score' }, true, false);
    this.listContainer.add(header);

    if (!this.entries || this.entries.length === 0) {
      y = this.rowH + this.rowGap;
      const noData = this.createRow(left, y, width, { rank: '-', name: 'No data', score: '-' }, false, false);
      this.listContainer.add(noData);
      this.contentHeight = this.rowH + (this.rowH + this.rowGap);
      this.clampScroll();
      return;
    }

    y = this.rowH + this.rowGap;

    this.entries.forEach((en, i) => {
      // Penting: jangan highlight baris di list agar tidak dobel dengan fixed row
      const row = this.createRow(left, y, width, {
        rank: `${i + 1}.`,
        name: en.name || 'Player',
        score: `${en.score}`
      }, false, false);
      this.listContainer!.add(row);
      y += this.rowH + this.rowGap;
    });

    this.contentHeight = this.rowH + this.entries.length * (this.rowH + this.rowGap);
    this.clampScroll();
  }

  // Cek apakah index baris (0-based) terlihat di viewport scroll
  private isIndexInView(idx: number) {
    // posisi Y relatif list (tanpa scroll): y = rowH + rowGap + idx*(rowH+rowGap)
    const yRel = this.rowH + this.rowGap + idx * (this.rowH + this.rowGap);
    const yTopOnScreen = (this.area.top - this.scrollY) + yRel;
    const yBottomOnScreen = yTopOnScreen + this.rowH;
    const viewTop = this.area.top;
    const viewBottom = this.area.top + this.area.height;
    return yBottomOnScreen > viewTop && yTopOnScreen < viewBottom;
  }

  private renderFixedMyRow() {
    const ex = this.children.getByName?.('fixed_my_row');
    if (ex) { try { ex.destroy(); } catch {} }

    // Jika baris user ada di Top 100 dan sedang terlihat, jangan render fixed row (hindari dobel)
    if (this.inTop100Index != null && this.isIndexInView(this.inTop100Index)) return;

    const left = this.area.left;
    const width = this.area.width;

    // tempel di bawah viewport, beri margin kecil
    const margin = Math.round(this.scale.height * 0.02);
    const yFixed = this.scale.height - margin - this.rowH;

    let rankText = '-';
    let nameText = 'You';
    let scoreText = '-';

    if (this.inTop100Index !== null && this.inTop100Index >= 0 && this.inTop100Index < this.entries.length) {
      const en = this.entries[this.inTop100Index]!;
      rankText = `${this.inTop100Index + 1}.`;
      nameText = en.name || 'You'; // Jika Anda ingin pakai “Reddit display name” dari auth, kita bisa inject di sini.
      scoreText = `${en.score}`;
    } else if (this.myBest) {
      rankText = (this.myBest.rank && this.myBest.rank <= 1000) ? `${this.myBest.rank}.` : '-';
      nameText = this.myBest.name || 'You';
      scoreText = `${this.myBest.score}`;
    }

    const myRow = this.createRow(left, yFixed, width, {
      rank: rankText, name: nameText, score: scoreText
    }, false, true);
    myRow.setName('fixed_my_row');
    myRow.setDepth(1001); // pastikan di atas list yang di-depth 1000
    try { this.sceneContentGroup?.add(myRow); } catch { this.add.existing(myRow); }
  }

  private createRow(xLeft: number, yTop: number, width: number, data: { rank: string; name: string; score: string }, isHeader = false, isMe = false) {
    const height = this.rowH;
    const radius = Math.min(20, Math.round(height * 0.35));

    const c = this.add.container(xLeft, yTop);
    c.setSize(width, height);

    const g = this.add.graphics();
    const fill = isHeader ? 0xf2f2f2 : (isMe ? 0xd4edda : 0xffffff);
    const stroke = isHeader ? 0x999999 : (isMe ? 0x28a745 : 0x000000);
    g.lineStyle(2, stroke, 1).fillStyle(fill, 1);
    g.fillRoundedRect(0, 0, width, height, radius);
    g.strokeRoundedRect(0, 0, width, height, radius);
    c.add(g);

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
    if (!this.listContainer) return;

    // update area (jaga-jaga jika dipanggil setelah resize)
    this.computeMetrics();

    this.listContainer.setPosition(0, this.area.top - this.scrollY);

    if (this.maskGraphics) {
      try {
        this.maskGraphics.clear();
        this.maskGraphics.fillStyle(0xffffff, 1);
        this.maskGraphics.fillRect(this.area.left, this.area.top, this.area.width, this.area.height);
      } catch {}
    }

    const sa = this.scrollArea as Phaser.GameObjects.Rectangle | undefined;
    if (sa && (sa as any).scene) {
      try {
        sa.setPosition(this.area.left + this.area.width / 2, this.area.top + this.area.height / 2);
        sa.setSize(this.area.width, this.area.height);
      } catch {}
    }

    // Setelah layout, decide apakah fixed row perlu ditampilkan/dihilangkan
    const fixed = this.children.getByName?.('fixed_my_row') as Phaser.GameObjects.Container | undefined;
    const needFixed = !(this.inTop100Index != null && this.isIndexInView(this.inTop100Index));
    if (fixed) {
      if (needFixed) {
        // reposisi fixed row di bawah
        const margin = Math.round(this.scale.height * 0.02);
        fixed.setPosition(this.area.left, this.scale.height - margin - this.rowH);
        fixed.setDepth(1001);
        fixed.setVisible(true);
      } else {
        fixed.setVisible(false);
      }
    } else if (needFixed) {
      this.renderFixedMyRow();
    }
  }

  private cleanupListeners() {
    try { if (this.wheelBound) { this.input.off('wheel', this.wheelHandler); this.wheelBound = false; } } catch {}
    try { this.input.off(Phaser.Input.Events.POINTER_MOVE); } catch {}
    try { this.input.off(Phaser.Input.Events.POINTER_UP); } catch {}
    try { this.input.off(Phaser.Input.Events.GAME_OUT); } catch {}
  }
}
