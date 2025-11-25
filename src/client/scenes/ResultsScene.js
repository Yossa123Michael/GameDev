import { BaseScene } from './BaseScene';
import { submitScoreViaFunction } from '../lib/submitScore';
export class ResultsScene extends BaseScene {
    constructor() {
        super('ResultsScene');
        this.playerName = 'Player';
        this.finalScore = 0;
        this.mode = 'belajar';
        this.isSubmitting = false;
        this.hasAutoStarted = false;
        this.alive = true;
    }
    init(data) {
        if (typeof data?.score === 'number')
            this.finalScore = Math.max(0, Math.round(data.score));
        if (typeof data?.duration === 'number')
            this.duration = Math.max(0, Math.round(data.duration));
        if (typeof data?.mode === 'string')
            this.mode = data.mode;
        if (typeof data?.name === 'string' && data.name.trim())
            this.playerName = data.name.substring(0, 32);
    }
    create() {
        super.create();
        this.alive = true;
        super.createCommonButtons('MainMenuScene');
        this.buildTexts();
        this.buildButton();
        // Auto submit → langsung pindah ke Leaderboard (tanpa delay) setelah sukses/skip
        this.startAutoSubmit();
        this.events.once('shutdown', this.cleanup, this);
        this.events.once('destroy', this.cleanup, this);
    }
    async startAutoSubmit() {
        if (this.hasAutoStarted)
            return;
        this.hasAutoStarted = true;
        this.safeSetStatus('Mengirim skor...');
        if (this.submitBtn)
            this.submitBtn.setVisible(false);
        const ok = await this.safeSubmitOnce();
        if (!this.alive)
            return;
        if (ok) {
            // Pindah segera agar terasa cepat
            this.scene.start('LeaderboardScene');
        }
        else {
            this.safeSetStatus('Gagal mengirim. Coba lagi.');
            if (this.submitBtn)
                this.submitBtn.setVisible(true);
            this.setButtonEnabled(true);
        }
    }
    async safeSubmitOnce() {
        if (this.isSubmitting || !this.alive)
            return false;
        this.isSubmitting = true;
        try {
            const res = await submitScoreViaFunction(this.playerName, this.finalScore, this.mode, this.duration);
            if (!this.alive)
                return false;
            if (!res.ok) {
                this.safeSetStatus('Gagal mengirim skor');
                return false;
            }
            if (res.skipped) {
                // not_higher atau no_user → anggap sukses
                this.safeSetStatus('Leaderboard tetap.');
            }
            return true;
        }
        catch {
            if (this.alive)
                this.safeSetStatus('Gagal mengirim skor');
            return false;
        }
        finally {
            this.isSubmitting = false;
        }
    }
    handleSubmitClick() {
        if (this.isSubmitting || !this.alive)
            return;
        this.setButtonEnabled(false);
        this.safeSetStatus('Mengirim...');
        this.safeSubmitOnce().then(ok => {
            if (!this.alive)
                return;
            if (ok)
                this.scene.start('LeaderboardScene');
            else {
                this.safeSetStatus('Gagal mengirim. Coba lagi.');
                this.setButtonEnabled(true);
            }
        });
    }
    buildTexts() {
        this.titleText?.destroy();
        this.scoreText?.destroy();
        this.modeText?.destroy();
        this.durText?.destroy();
        this.submitStatus?.destroy();
        this.titleText = this.add.text(this.centerX, 90, 'Hasil Permainan', {
            fontFamily: 'Nunito', fontSize: '36px', color: '#000'
        }).setOrigin(0.5);
        this.scoreText = this.add.text(this.centerX, this.scale.height * 0.40, `Skor: ${this.finalScore}`, {
            fontFamily: 'Nunito', fontSize: '28px', color: '#111'
        }).setOrigin(0.5);
        this.modeText = this.add.text(this.centerX, this.scale.height * 0.48, `Mode: ${this.mode}`, {
            fontFamily: 'Nunito', fontSize: '20px', color: '#333'
        }).setOrigin(0.5);
        this.durText = this.add.text(this.centerX, this.scale.height * 0.54, `Durasi: ${this.duration ?? 0}s`, {
            fontFamily: 'Nunito', fontSize: '20px', color: '#333'
        }).setOrigin(0.5);
        this.submitStatus = this.add.text(this.centerX, this.scale.height * 0.76, '', {
            fontFamily: 'Nunito', fontSize: '16px', color: '#444'
        }).setOrigin(0.5);
        this.sceneContentGroup.addMultiple([this.titleText, this.scoreText, this.modeText, this.durText, this.submitStatus]);
    }
    buildButton() {
        if (this.submitBtn) {
            try {
                this.submitBtn.destroy(true);
            }
            catch { }
        }
        const y = this.scale.height * 0.70;
        const btn = this.createButton(y, 'Kirim ke Leaderboard', () => this.handleSubmitClick());
        btn.setName('submit_button_results');
        btn.setDepth(10);
        if (this.sceneContentGroup)
            this.sceneContentGroup.add(btn);
        this.submitBtn = btn;
        this.setButtonEnabled(true);
    }
    setButtonEnabled(enabled) {
        if (!this.submitBtn || !this.alive)
            return;
        const textObj = this.submitBtn.getAt(1);
        const zone = this.submitBtn.getAt(2);
        if (enabled) {
            textObj?.setText('Kirim ke Leaderboard');
            zone?.setInteractive({ useHandCursor: true });
        }
        else {
            zone?.disableInteractive();
        }
    }
    safeSetStatus(msg) {
        if (!this.alive)
            return;
        const t = this.submitStatus;
        if (t && t.scene) {
            try {
                t.setText(msg);
            }
            catch { }
        }
    }
    draw() {
        super.draw();
        this.titleText?.setPosition(this.centerX, 90);
        this.scoreText?.setPosition(this.centerX, this.scale.height * 0.40).setText(`Skor: ${this.finalScore}`);
        this.modeText?.setPosition(this.centerX, this.scale.height * 0.48).setText(`Mode: ${this.mode}`);
        this.durText?.setPosition(this.centerX, this.scale.height * 0.54).setText(`Durasi: ${this.duration ?? 0}s`);
        this.submitStatus?.setPosition(this.centerX, this.scale.height * 0.76);
        if (this.submitBtn) {
            const width = Math.round(this.scale.width * 0.86);
            const height = Math.max(48, Math.round(this.scale.height * 0.08));
            const radius = Math.min(24, Math.floor(height * 0.35));
            this.submitBtn.setPosition(this.centerX, this.scale.height * 0.70);
            this.submitBtn.width = width;
            this.submitBtn.height = height;
            const g = this.submitBtn.getAt(0);
            const txt = this.submitBtn.getAt(1);
            const zone = this.submitBtn.getAt(2);
            if (g)
                this.updateButtonGraphics(g, width, height, 0xffffff, 0x000000, 3, radius);
            if (txt) {
                try {
                    txt.setStyle({
                        fontFamily: 'Nunito',
                        fontSize: `${Math.max(16, Math.floor(height * 0.38))}px`,
                        color: '#000',
                        align: 'center',
                        wordWrap: { width: Math.floor(width * 0.9) }
                    }).setOrigin(0.5);
                }
                catch { }
            }
            if (zone)
                zone.setSize(width, height).setPosition(0, 0);
        }
    }
    cleanup() {
        this.alive = false;
        try {
            this.submitBtn?.destroy(true);
        }
        catch { }
        try {
            this.submitStatus?.destroy();
        }
        catch { }
        this.isSubmitting = false;
        this.hasAutoStarted = false;
    }
}
