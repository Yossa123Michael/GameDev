import { BaseScene } from './BaseScene';
import { supabase } from '../lib/supabaseClient';

type Entry = { name: string; score: number; created_at: string; user_id?: string };
type UserBest = { name: string; score: number; created_at: string; rank: number };

export class LeaderboardScene extends BaseScene {
  private entries: Entry[] = [];
  private myBest: UserBest | null = null;
  private currentUserId: string | null = null;

  // UI / scroll
  private listContainer!: Phaser.GameObjects.Container;
  private maskGraphics!: Phaser.GameObjects.Graphics;
  private scrollArea!: Phaser.GameObjects.Rectangle;
  private scrollY = 0;
  private scrollDrag = { active: false, startY: 0, baseScroll: 0 };
  private contentHeight = 0;

  // status text for loading/error
  private statusText?: Phaser.GameObjects.Text;

  constructor() { super('LeaderboardScene'); }

  public override async create() {
    super.create();
    this.createCommonButtons('MainMenuScene');

    // Show loading status immediately so user never sees blank
    this.showStatus('Loading leaderboard...');

    try {
      await this.loadData();
    } catch (e) {
      console.error('loadData threw', e);
      this.showStatus('Failed to load leaderboard');
    }

    // Ensure scroll area exists before first draw
    try {
      this.setupScrollArea();
    } catch (e) {
      console.warn('setupScrollArea failed', e);
      this.showStatus('UI init failed');
    }

    // draw initial view (safe)
    try {
      this.draw();
    } catch (e) {
      console.warn('initial draw() failed:', e);
      this.showStatus('Rendering failed');
    }
  }

  // helper to set status text (loading / error)
  private showStatus(message: string | null) {
    try {
      if (!this.statusText && message) {
        this.statusText = this.add.text(this.centerX, this.scale.height * 0.5, message, {
          fontFamily: 'Nunito',
          fontSize: '20px',
          color: '#666'
        }).setOrigin(0.5);
        // place in sceneContentGroup so it will be cleared with other content
        try { this.sceneContentGroup?.add(this.statusText); } catch {}
      } else if (this.statusText) {
        if (message) {
          this.statusText.setText(message).setVisible(true);
        } else {
          this.statusText.setVisible(false);
        }
      }
    } catch (e) {
      console.warn('showStatus failed', e);
    }
  }

  private async loadData() {
  // Clear previous state
  this.entries = [];
  this.myBest = null;
  this.currentUserId = null;
  this.showStatus('Loading leaderboard...');

  try {
    // Top 100
    const { data: top, error: e1 } = await supabase
      .from('scores')
      .select('name,score,created_at,user_id')
      .order('score', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(100);

    if (e1) {
      console.error('Failed to load leaderboard', e1);
      throw e1;
    }
    this.entries = (top || []) as Entry[];

    // get user
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user?.id ?? null;
    this.currentUserId = uid;

    // If user exists and is present in top100 entries, derive myBest from that
    if (uid) {
      const idx = this.entries.findIndex(e => e.user_id === uid);
      if (idx !== -1) {
        const e = this.entries[idx];
        this.myBest = { name: e.name, score: e.score, created_at: e.created_at, rank: idx + 1 };
      } else {
        // not in top100 — fallback: query best score for user to compute rank
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
      }
    }

    // loading finished
    this.showStatus(null);
    console.log('Leaderboard loaded:', { count: this.entries.length, myBest: this.myBest, uid: this.currentUserId });
  } catch (err) {
    this.showStatus('Failed to load leaderboard');
    console.error('loadData error', err);
    throw err;
  }
}

  private setupScrollArea() {
    // destroy existing UI elements (safe)
    try { if (this.listContainer) this.listContainer.destroy(true); } catch {}
    try { if (this.maskGraphics) this.maskGraphics.destroy(); } catch {}
    try { if (this.scrollArea) this.scrollArea.destroy(); } catch {}

    const top = 120;
    const left = Math.round(this.scale.width * 0.06);
    const width = Math.round(this.scale.width * 0.88);
    const height = Math.max(160, Math.round(this.scale.height * 0.74));

    this.listContainer = this.add.container(0, top);

    // mask
    this.maskGraphics = this.add.graphics().fillStyle(0xffffff).fillRect(left, top, width, height).setVisible(false);
    const mask = this.maskGraphics.createGeometryMask();
    this.listContainer.setMask(mask);

    // interactive scroll area
    this.scrollArea = this.add.rectangle(left + width / 2, top + height / 2, width, height, 0x000000, 0)
      .setInteractive({ useHandCursor: true });

    // wheel (global)
    this.input.on('wheel', (_p: any, _go: any, _dx: number, dy: number) => {
      if (!this.scene.isActive()) return;
      this.applyScroll(dy * 0.6);
    });

    // drag
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

    // ensure scroll area exists
    if (!this.listContainer || !this.maskGraphics || !this.scrollArea) {
      this.setupScrollArea();
    }

    // remove previous title (avoid duplicates on resize)
    const prevTitle = this.children.getByName?.('leaderboard_title');
    if (prevTitle) try { prevTitle.destroy(); } catch {}

    const title = this.add.text(this.centerX, 80, 'Leaderboard', {
      fontFamily: 'Nunito', fontSize: '36px', color: '#000'
    }).setOrigin(0.5);
    title.setName('leaderboard_title');
    // add title to sceneContentGroup (so it gets cleared by BaseScene.draw)
    try { this.sceneContentGroup?.add(title); } catch { this.add.existing(title); }

    // Build list defensively
    try {
      this.buildList();
      this.layoutList();
    } catch (e) {
      console.error('buildList/layout failed', e);
      this.showStatus('Rendering failed');
    }

    // render fixed bottom row if needed
    try {
      this.renderFixedMyRow();
    } catch (e) {
      console.warn('renderFixedMyRow failed', e);
    }
  }

  private buildList() {
  // clear container safely
  if (!this.listContainer) return;
  const children = this.listContainer.list.slice();
  children.forEach(c => { try { c.destroy(true); } catch {} });

  const left = Math.round(this.scale.width * 0.06);
  const width = Math.round(this.scale.width * 0.88);

  // layout metrics
  const rowH = Math.max(48, Math.round(this.scale.height * 0.065));
  const gap = Math.max(8, Math.round(this.scale.height * 0.02));

  let y = 0;

  // Header
  const header = this.createRow(left, y, width, { rank: 'Rank', name: 'Nama', score: 'High Score' }, true);
  this.listContainer.add(header);

  // If no entries, show message inside scroll area
  if (!this.entries || this.entries.length === 0) {
    y += rowH + gap;
    const noData = this.createRow(left, y, width, { rank: '-', name: 'No data', score: '-' }, false, false);
    this.listContainer.add(noData);
    // total content height = header + single row
    this.contentHeight = rowH + (rowH + gap);
    this.clampScroll();
    return;
  }

  // Top 100: compute y positions deterministically: header at 0, first item at headerHeight + gap
  y = rowH + gap; // start first row below header

  this.entries.forEach((e, i) => {
    const isMe = !!(this.currentUserId && e.user_id === this.currentUserId);
    const row = this.createRow(left, y, width, {
      rank: `${i + 1}.`,
      name: e.name || 'Player',
      score: `${e.score}`
    }, false, isMe);
    this.listContainer.add(row);
    y += rowH + gap;
  });

  // contentHeight = headerHeight + n * (rowH + gap)
  this.contentHeight = rowH + this.entries.length * (rowH + gap);
  this.clampScroll();
}

  private renderFixedMyRow() {
    // remove existing
    const existing = this.children.getByName?.('fixed_my_row');
    if (existing) try { existing.destroy(); } catch {}

    if (!this.myBest) return;
    if (this.myBest.rank <= 100) return; // already visible in top100

    const left = Math.round(this.scale.width * 0.06);
    const width = Math.round(this.scale.width * 0.88);
    const rowH = Math.max(48, Math.round(this.scale.height * 0.065));
    const top = 120;
    const heightArea = Math.max(160, Math.round(this.scale.height * 0.74));
    const yFixed = top + heightArea + Math.round(this.scale.height * 0.02);

    const rankDisplay = (this.myBest.rank <= 1000) ? `${this.myBest.rank}.` : '-';

    const myRow = this.createRow(left, yFixed, width, {
      rank: rankDisplay,
      name: this.myBest.name || 'You',
      score: `${this.myBest.score}`
    }, false, true);

    myRow.setName('fixed_my_row');
    // add to sceneContentGroup so it stays fixed and is cleared properly
    try { this.sceneContentGroup?.add(myRow); } catch { this.add.existing(myRow); }
  }

  private createRow(xLeft: number, yTop: number, width: number, data: { rank: string; name: string; score: string }, isHeader = false, isMe = false) {
    const height = Math.max(48, Math.round(this.scale.height * 0.065));
    const radius = Math.min(20, Math.round(height * 0.35));

    // create container positioned at xLeft,yTop
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

    if (this.listContainer) {
      this.listContainer.setPosition(0, top - this.scrollY);
    }
    if (this.maskGraphics) {
      this.maskGraphics.clear().fillStyle(0xffffff).fillRect(left, top, width, height);
    }
    if (this.scrollArea) {
      this.scrollArea.setPosition(left + width / 2, top + height / 2).setSize(width, height);
    }
  }
}
