import { BaseScene } from './BaseScene';
import { supabase } from '../lib/supabaseClient';

type Entry = { name: string; score: number; created_at: string };

export class LeaderboardScene extends BaseScene {
  private entries: Entry[] = [];

  constructor() { super('LeaderboardScene'); }

  public override async create() {
    super.create();
    super.createCommonButtons('MainMenuScene');
    await this.loadLeaderboard();
    this.draw();
  }

  private async loadLeaderboard(limit = 10) {
    try {
      const { data, error } = await supabase
        .from('scores')
        .select('name,score,created_at')
        .order('score', { ascending: false })
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error) {
        console.error('Failed to load leaderboard', error);
        this.entries = [];
      } else {
        this.entries = (data || []) as any;
      }
    } catch (e) {
      console.error('loadLeaderboard error', e);
      this.entries = [];
    }
  }

  public override draw() {
    super.draw();
    if (!this.sceneContentGroup) return;

    const title = this.add.text(this.centerX, 80, 'Leaderboard', { fontFamily: 'Nunito', fontSize: '36px', color: '#000' }).setOrigin(0.5);
    this.sceneContentGroup.add(title);

    const startY = 140;
    const rowH = 36;
    this.entries.forEach((e, i) => {
      const y = startY + i * rowH;
      const rank = this.add.text(this.scale.width * 0.08, y, `${i + 1}.`, { fontFamily: 'Nunito', fontSize: '20px' }).setOrigin(0, 0.5);
      const name = this.add.text(this.scale.width * 0.18, y, e.name, { fontFamily: 'Nunito', fontSize: '20px' }).setOrigin(0, 0.5);
      const score = this.add.text(this.scale.width * 0.88, y, `${e.score}`, { fontFamily: 'Nunito', fontSize: '20px' }).setOrigin(1, 0.5);
      this.sceneContentGroup.addMultiple([rank, name, score]);
    });

    if (this.entries.length === 0) {
      const info = this.add.text(this.centerX, this.scale.height * 0.5, 'Leaderboard kosong', { fontFamily: 'Nunito', fontSize: '18px', color: '#666' }).setOrigin(0.5);
      this.sceneContentGroup.add(info);
    }
  }
}
