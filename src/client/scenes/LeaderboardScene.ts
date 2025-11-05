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

  // index baris yang akan dihijaukan di Top 100
  private inTop100Index: number | null = null;

  // UI / scroll
  private listContainer?: Phaser.GameObjects.Container;
  private maskGraphics?: Phaser.GameObjects.Graphics;
  private scrollArea?: Phaser.GameObjects.Rectangle;
  private scrollY = 0;
  private scrollDrag = { active: false, startY: 0, baseScroll: 0 };
  private contentHeight = 0;

  private statusText?: Phaser.GameObjects.Text;

  private wheelBound = false;
  private wheelHandler = (_pointer: any, _gos: any, _dx: number, dy: number) => {
    if (!this.scene.isActive()) return;
    this.applyScroll(dy * 0.6);
  };

  private alive = true;

  constructor() { super('LeaderboardScene'); }

  public override async create() {
    super.create();
    this.createCommonButtons('MainMenuScene');

    this.alive = true;
    this.showStatus('Loading leaderboard...');
    this.scrollY = 0;
    this.inTop100Index = null;

    await this.loadDataFast(); // cepat: 1 query top100 + auth

    if (!this.alive) return;

    this.setupScrollArea();

    // Render cepat (tanpa clear penuh)
    this.safeDraw();

    // Jadwalkan re-render kecil untuk berjaga
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
      }).setOrigin(0.5);
      title.setName('leaderboard_title');
      try { this.sceneContentGroup?.add(title); } catch { this.add.existing(title); }

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
      }).setOrigin(0.5);
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

    // 1) Coba cari index by user_id (akurat)
    if (uid) {
      const idx = this.entries.findIndex(en => en.user_id === uid);
      if (idx >= 0) {
        this.inTop100Index = idx;
        const en = this.entries[idx]!;
        this.myBest = { name: en.name, score: en.score, created_at: en.created_at, rank: idx + 1 };
      }
    }

    // 2) Jika belum ketemu baris user di Top 100, fallback highlight ke baris pertama yang skornya == deviceBest
    if (this.inTop100Index == null && this.deviceBest != null) {
      const idx2 = this.entries.findIndex(en => en.score === this.deviceBest!);
      if (idx2 >= 0) {
        this.inTop100Index = idx2;
        const en = this.entries[idx2]!;
        // myBest ditampilkan minimal (tanpa rank dulu, supaya cepat)
        this.myBest = { name: en.name || this.lastSub?.name || 'You', score: en.score, created_at: en.created_at };
      }
    }

    // 3) Jika tetap tidak ketemu Top 100, namun ada deviceBest → tampilkan fixed-row saja (tanpa rank dulu)
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
    // Jika sudah ada di Top100, rank sudah diketahui.
    if (this.inTop100Index != null) return;
    if (!this.myBest?.score) return;

    try {
      const q = await supabase.from('scores').select('id', { count: 'exact', head: true }).gt('score', this.myBest.score);
      const higher = q.count || 0;
      // Update rank dan perbarui fixed row (tanpa rebuild list)
      this.myBest.rank = higher + 1;
      if (this.alive) this.renderFixedMyRow();
    } catch (e) {
      // abaikan jika gagal; UI tetap jalan
    }
  }

  private setupScrollArea() {
    try { this.listContainer?.destroy(true); } catch {}
    try { this.maskGraphics?.destroy(); } catch {}
    try { this.scrollArea?.destroy(); } catch {}

    const top = 120;
    const left = Math.round(this.scale.width * 0.06);
    const width = Math.round(this.scale.width * 0.88);
    const height = Math.max(160, Math.round(this.scale.height * 0.74));

    this.listContainer = this.add.container(0, top);

    this.maskGraphics = this.add.graphics();
    this.maskGraphics.fillStyle(0xffffff, 1);
    this.maskGraphics.fillRect(left, top, width, height);
    this.maskGraphics.setVisible(false);
    const mask = this.maskGraphics.createGeometryMask();
    this.listContainer.setMask(mask);

    this.scrollArea = this.add.rectangle(left + width / 2, top + height / 2, width, height, 0x000000, 0);
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
    const height = Math.max(160, Math.round(this.scale.height * 0.74));
    const maxScroll = Math.max(0, this.contentHeight - height);
    if (this.scrollY < 0) this.scrollY = 0;
    if (this.scrollY > maxScroll) this.scrollY = maxScroll;
  }

  // draw() dikosongkan; gunakan safeDraw
  public override draw() {}

  private buildList() {
    if (!this.listContainer) return;

    const left = Math.round(this.scale.width * 0.06);
    const width = Math.round(this.scale.width * 0.88);

    const rowH = Math.max(48, Math.round(this.scale.height * 0.065));
    const gap = Math.max(8, Math.round(this.scale.height * 0.02));

    // Header
    let y = 0;
    const header = this.createRow(left, y, width, { rank: 'Rank', name: 'Nama', score: 'High Score' }, true);
    this.listContainer.add(header);

    if (!this.entries || this.entries.length === 0) {
      y = rowH + gap;
      const noData = this.createRow(left, y, width, { rank: '-', name: 'No data', score: '-' }, false, false);
      this.listContainer.add(noData);
      this.contentHeight = rowH + (rowH + gap);
      this.clampScroll();
      return;
    }

    y = rowH + gap;

    this.entries.forEach((en, i) => {
      const isMe = (this.inTop100Index != null && i === this.inTop100Index);
      const row = this.createRow(left, y, width, {
        rank: `${i + 1}.`,
        name: en.name || 'Player',
        score: `${en.score}`
      }, false, isMe);
      this.listContainer.add(row);
      y += rowH + gap;
    });

    this.contentHeight = rowH + this.entries.length * (rowH + gap);
    this.clampScroll();
  }

  private renderFixedMyRow() {
    const ex = this.children.getByName?.('fixed_my_row');
    if (ex) { try { ex.destroy(); } catch {} }

    const left = Math.round(this.scale.width * 0.06);
    const width = Math.round(this.scale.width * 0.88);
    const top = 120;
    const heightArea = Math.max(160, Math.round(this.scale.height * 0.74));
    const yFixed = top + heightArea + Math.round(this.scale.height * 0.02);

    let rankText = '-';
    let nameText = 'You';
    let scoreText = '-';

    if (this.inTop100Index !== null && this.inTop100Index >= 0 && this.inTop100Index < this.entries.length) {
      const en = this.entries[this.inTop100Index]!;
      rankText = `${this.inTop100Index + 1}.`;
      nameText = en.name || 'You';
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
    try { this.sceneContentGroup?.add(myRow); } catch { this.add.existing(myRow); }
  }

  private createRow(xLeft: number, yTop: number, width: number, data: { rank: string; name: string; score: string }, isHeader = false, isMe = false) {
    const height = Math.max(48, Math.round(this.scale.height * 0.065));
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
    const top = 120;
    const left = Math.round(this.scale.width * 0.06);
    const width = Math.round(this.scale.width * 0.88);
    const height = Math.max(160, Math.round(this.scale.height * 0.74));

    const lc = this.listContainer;
    if (lc) lc.setPosition(0, top - this.scrollY);

    const mg = this.maskGraphics;
    if (mg) { mg.clear(); mg.fillStyle(0xffffff, 1); mg.fillRect(left, top, width, height); }

    const sa = this.scrollArea;
    if (sa && (sa as any).scene) {
      try {
        sa.setPosition(left + width / 2, top + height / 2);
        sa.setSize(width, height);
      } catch {}
    }
  }

  private cleanupListeners() {
    try { if (this.wheelBound) { this.input.off('wheel', this.wheelHandler); this.wheelBound = false; } } catch {}
    try { this.input.off(Phaser.Input.Events.POINTER_MOVE); } catch {}
    try { this.input.off(Phaser.Input.Events.POINTER_UP); } catch {}
    try { this.input.off(Phaser.Input.Events.GAME_OUT); } catch {}
  }
}
