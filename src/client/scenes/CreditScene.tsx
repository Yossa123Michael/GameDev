import Phaser from 'phaser';
import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import CreditView from '../ui/CreditView';

export default class CreditScene extends Phaser.Scene {
  private root: Root | undefined;
  private container: HTMLDivElement | undefined;

  constructor() {
    super('CreditScene');
  }

  create() {
    this.container = document.createElement('div');
    this.container.id = 'credit-react-root';
    Object.assign(this.container.style, {
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      pointerEvents: 'auto',
      zIndex: '1000',
    } as CSSStyleDeclaration);
    document.body.appendChild(this.container);

    this.root = createRoot(this.container);
    this.root.render(<CreditView />);

    this.input.keyboard?.once('keydown-ESC', () => this.exitCredit());
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.cleanup, this);
    this.events.once(Phaser.Scenes.Events.DESTROY, this.cleanup, this);
  }

  private exitCredit() {
    this.scene.start('MainMenuScene');
  }

  private cleanup() {
    this.root?.unmount();
    this.container?.remove();
    this.root = undefined;
    this.container = undefined;
  }
}
