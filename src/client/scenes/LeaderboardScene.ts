import { BaseScene } from './BaseScene';
import { supabase } from '../lib/supabaseClient';
import { getLastSubmission } from '../lib/submitScore';

type Entry = { id?: number; name: string; score: number; created_at: string; user_id?: string };
type UserBest = { name: string; score: number; created_at: string; rank: number };
type LastSub = { user_id: string | null; name: string; score: number; created_at: string };

export class LeaderboardScene extends BaseScene {
  private entries: Entry[] = [];
  private myBest: UserBest | null = null;
  private currentUserId: string | null = null;
  private lastSub: LastSub | null = null;
  // index user self di tampilan Top 100 (untuk sinkronisasi baris bawah)
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

  constructor() { super('LeaderboardScene'); }

  public override async create() {
    super.create();
    this.createCommonButtons('MainMenuScene');

    this.showStatus('Loading leaderboard...');
    this.scrollY = 0;
    this.inTop100Index = null;

    await this.loadData().catch(err => {
      console.error('loadData threw', err);
      this.showStatus('Failed to load leaderboard');
    });

    this.setupScrollArea();

    try { this.draw(); } catch (e) {
      console.warn('initial draw() failed:', e);
      this.showStatus('Rendering failed');
    }

    this.events.once('shutdown', this.cleanupListeners, this);
    this.events.once('destroy', this.cleanupListeners, this);
  }

  private showStatus(message: string | null) {
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

  private async loadData() {
    this.entries = [];
    this.myBest = null;
    this.currentUserId = null;
    this.lastSub = getLastSubmission();
    this.inTop100Index = null;

    // Ambil lebih banyak lalu dedup per user_id supaya tidak dobel
    const fetchLimit = 400;
    const { data: raw, error: e1 } = await supabase
      .from('scores')
      .select('id,name,score,created_at,user_id')
      .order('score', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(fetchLimit);

    if (e1) throw e1;

    const seenUids = new Set<string>();
    const unique: Entry[] = [];
    for (const e of (raw || []) as Entry[]) {
      if (e.user_id) {
        if (seenUids.has(e.user_id)) continue;
        seenUids.add(e.user_id);
        unique.push(e);
      } else {
        unique.push(e);
      }
      if (unique.length >= 100) break;
    }
    this.entries = unique;

    const { data: userData } = await supabase.auth.getUser();
    const uid = (userData as any)?.user?.id ?? null;
    this.currentUserId = uid;

    if (uid) {
      const idx = this.entries.findIndex(en => en.user_id === uid);
      if (idx >= 0) {
        const en = this.entries[idx]!;
        this.inTop100Index = idx; // simpan index untuk sinkron fixed row
        this.myBest = { name: en.name, score: en.score, created_at: en.created_at, rank: idx + 1 };
      } else {
        // Tidak ada di Top 100 → hitung rank global dari skor terbaik user
        const { data: best, error: e2 } = await supabase
          .from('scores')
          .select('name,score,created_at')
          .eq('user_id', uid)
          .order('score', { ascending: false })
          .order('created_at', { ascending: true })
          .limit(1)
          .maybeSingle();

        if (!e2 && best) {
          const myScore = (best as any).score as number;
          const myCreated = (best as any).created_at as string;
          const q1 = await supabase.from('scores').select('id', { count: 'exact', head: true }).gt('score', myScore);
          const higher = q1.count || 0;
          const q2 = await supabase.from('scores').select('id', { count: 'exact', head: true }).eq('score', myScore).lt('created_at', myCreated);
          const earlier = q2.count || 0;
          this.myBest = { name: (best as any).name, score: myScore, created_at: myCreated, rank: higher + earlier + 1 };
        } else if (this.lastSub && this.lastSub.user_id === uid) {
          // fallback lokal bila record lama belum attach user_id
          const myScore = this.lastSub.score;
          const myCreated = this.lastSub.created_at;
          const q1 = await supabase.from('scores').select('id', { count: 'exact', head: true }).gt('score', myScore);
          const higher = q1.count || 0;
          const q2 = await supabase.from('scores').select('id', { count: 'exact', head: true }).eq('score', myScore).lt('created_at', myCreated);
          const earlier = q2.count || 0;
          this.myBest = { name: this.lastSub.name, score: myScore, created_at: myCreated, rank: higher + earlier + 1 };
        }
      }
    }

    this.showStatus(null);
    this.scrollY = 0;
    console.log('Leaderboard loaded:', {
      count: this.entries.length,
      myBest: this.myBest,
      inTop100Index: this.inTop100Index,
      uid: this.currentUserId,
      lastSub: this.lastSub
    });
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

    // Reset drag listeners
    this.input.off(Phaser.Input.Events.POINTER_MOVE);
    this.input.off(Phaser.Input.Events.POINTER_UP);
    this.input.off(Phaser.Input.Events.GAME_OUT);

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

    if (!this.listContainer || !this.maskGraphics || !this.scrollArea) this.setupScrollArea();

    const prevTitle = this.children.getByName?.('leaderboard_title');
    if (prevTitle) { try { prevTitle.destroy(); } catch {} }

    const title = this.add.text(this.centerX, 80, 'Leaderboard', {
      fontFamily: 'Nunito', fontSize: '36px', color: '#000'
    }).setOrigin(0.5);
    title.setName('leaderboard_title');
    try { this.sceneContentGroup?.add(title); } catch { this.add.existing(title); }

    this.buildList();
    this.layoutList();
    this.renderFixedMyRow();
  }

  private buildList() {
    if (!this.listContainer) return;

    const copy = this.listContainer.list.slice();
    copy.forEach(c => { try { c.destroy(true); } catch {} });

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

    // Baris pertama tepat di bawah header
    y = rowH + gap;

    // Jika sudah ada match via user_id, kita tidak akan melakukan fallback highlight
    const hasIdMatch = this.inTop100Index !== null;
    // Agar fallback tidak menandai lebih dari satu baris
    let usedFallbackHighlight = false;

    this.entries.forEach((en, i) => {
      let isMe = false;

      // Prioritas 1: user_id cocok (pasti hanya satu karena entries sudah didedup per user_id)
      if (this.currentUserId && en.user_id === this.currentUserId) {
        isMe = true;
      } else if (!hasIdMatch && !usedFallbackHighlight && this.lastSub) {
        // Prioritas 2: fallback sekali untuk record tanpa user_id yang cocok nama+skor
        if (!en.user_id && en.name === this.lastSub.name && en.score === this.lastSub.score) {
          isMe = true;
          usedFallbackHighlight = true;
          // Set index agar fixed row bawah sinkron dengan daftar
          this.inTop100Index = i;
          // Jika belum ada myBest, set berdasarkan tampilan daftar (agar sinkron)
          if (!this.myBest) {
            this.myBest = { name: en.name, score: en.score, created_at: en.created_at, rank: i + 1 };
          }
        }
      }

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

    // Baris fixed BAWAH selalu ditampilkan, dan harus SINKRON:
    // - Jika inTop100Index ada -> ambil rank/score dari entries[inTop100Index]
    // - Jika tidak ada, tapi myBest ada -> pakai rank global (<=1000)
    // - Kalau masih tidak ada, tampilkan placeholder "You - -"
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
      rankText = this.myBest.rank <= 1000 ? `${this.myBest.rank}.` : '-';
      nameText = this.myBest.name || 'You';
      scoreText = `${this.myBest.score}`;
    } else if (this.lastSub) {
      rankText = '-';
      nameText = 'You';
      scoreText = '-';
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
    if (sa) { sa.setPosition(left + width / 2, top + height / 2); sa.setSize(width, height); }
  }

  private cleanupListeners() {
    try { if (this.wheelBound) { this.input.off('wheel', this.wheelHandler); this.wheelBound = false; } } catch {}
    try { this.input.off(Phaser.Input.Events.POINTER_MOVE); } catch {}
    try { this.input.off(Phaser.Input.Events.POINTER_UP); } catch {}
    try { this.input.off(Phaser.Input.Events.GAME_OUT); } catch {}
  }
}
