import { jsx as _jsx } from "react/jsx-runtime";
import { BaseScene } from './BaseScene';
import { createRoot } from 'react-dom/client';
import CreditView from '../ui/CreditView';
export default class CreditScene extends BaseScene {
    constructor() {
        super('CreditScene');
    }
    create() {
        // PENTING: panggil BaseScene.create() agar background + tombol umum terpasang
        super.create();
        // Mount React overlay (konten kredit)
        this.container = document.createElement('div');
        this.container.id = 'credit-react-root';
        Object.assign(this.container.style, {
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            // Biarkan event ke Phaser lewat, kecuali untuk link <a> yang kita set pointer-events: auto
            pointerEvents: 'none',
            zIndex: '1000'
        });
        document.body.appendChild(this.container);
        this.root = createRoot(this.container);
        this.root.render(_jsx(CreditView, {}));
        // ESC = back (ikuti perilaku tombol back di BaseScene)
        this.input.keyboard?.once('keydown-ESC', () => {
            try {
                this.playSound('sfx_click', { volume: 0.7 });
            }
            catch { }
            this.scene.start('MainMenuScene');
        });
        // Jaga kebersihan saat tutup/hancur
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanup, this);
        this.events.once(Phaser.Scenes.Events.DESTROY, this.cleanup, this);
    }
    cleanup() {
        try {
            this.root?.unmount();
        }
        catch { }
        try {
            this.container?.remove();
        }
        catch { }
        this.root = undefined;
        this.container = undefined;
    }
}
