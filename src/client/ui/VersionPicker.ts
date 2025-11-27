import type Phaser from 'phaser';
import type { VersionCode } from '../versions';
import { versionsOrder, versionLabels } from '../versions';

// Popup sederhana untuk memilih versi. Independen dari helper OptionScene.
export function showVersionPicker(
  scene: Phaser.Scene,
  onPick: (version: VersionCode) => void
) {
  const { width, height } = scene.scale;

  // Background semi-transparan
  const backdrop = scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.35).setDepth(800);
  backdrop.setInteractive({ useHandCursor: false });

  // Panel
  const panelW = Math.min(520, Math.floor(width * 0.9));
  const rowH = 54;
  const gap = 12;
  const totalH = versionsOrder.length * (rowH + gap) + 40;
  const panel = scene.add.container(width / 2, height / 2).setDepth(801);

  const g = scene.add.graphics();
  g.lineStyle(3, 0x000000, 1).fillStyle(0xffffff, 1);
  g.fillRoundedRect(-panelW / 2, -totalH / 2, panelW, totalH, 16);
  g.strokeRoundedRect(-panelW / 2, -totalH / 2, panelW, totalH, 16);
  panel.add(g);

  const title = scene.add.text(0, -totalH / 2 + 18, 'Pilih Versi', {
    fontFamily: 'Nunito',
    fontSize: '22px',
    color: '#000',
  }).setOrigin(0.5, 0);
  panel.add(title);

  let y = -totalH / 2 + 60;
  versionsOrder.forEach((ver) => {
    const btn = makeButton(scene, panelW - 40, rowH, versionLabels[ver], () => {
      try { onPick(ver); } catch {}
      destroyPopup();
    });
    btn.setPosition(0, y + rowH / 2);
    panel.add(btn);
    y += rowH + gap;
  });

  // Close ketika klik backdrop
  backdrop.once('pointerup', destroyPopup);

  function destroyPopup() {
    try { backdrop.destroy(); } catch {}
    try { panel.destroy(true); } catch {}
  }
}

function makeButton(
  scene: Phaser.Scene,
  width: number,
  height: number,
  label: string,
  onClick: () => void
) {
  const container = scene.add.container(0, 0);
  const radius = Math.min(20, Math.floor(height * 0.35));
  const g = scene.add.graphics();
  g.lineStyle(3, 0x000000, 1).fillStyle(0xf5f5f5, 1);
  g.fillRoundedRect(-width / 2, -height / 2, width, height, radius);
  g.strokeRoundedRect(-width / 2, -height / 2, width, height, radius);
  container.add(g);

  const txt = scene.add.text(0, 0, label, {
    fontFamily: 'Nunito',
    fontSize: `${Math.max(16, Math.floor(height * 0.42))}px`,
    color: '#000',
    align: 'center',
  }).setOrigin(0.5);
  container.add(txt);

  const zone = scene.add.zone(0, 0, width, height).setOrigin(0.5);
  zone.setInteractive({ useHandCursor: true });
  container.add(zone);

  zone.on('pointerover', () => {
    g.clear();
    g.lineStyle(3, 0x000000, 1).fillStyle(0xeeeeee, 1);
    g.fillRoundedRect(-width / 2, -height / 2, width, height, radius);
    g.strokeRoundedRect(-width / 2, -height / 2, width, height, radius);
  });
  zone.on('pointerout', () => {
    g.clear();
    g.lineStyle(3, 0x000000, 1).fillStyle(0xf5f5f5, 1);
    g.fillRoundedRect(-width / 2, -height / 2, width, height, radius);
    g.strokeRoundedRect(-width / 2, -height / 2, width, height, radius);
  });
  zone.on('pointerup', onClick);

  return container;
}
