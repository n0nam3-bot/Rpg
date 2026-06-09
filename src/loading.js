import { loadManifest, registerAnimations, createBackdrop, spawnAmbient } from './util.js';

export class LoadingScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LoadingScene' });
  }

  preload() {
    const W = this.scale.width;
    const H = this.scale.height;

    createBackdrop(this, {
      mode: 'title',
      title: 'LOADING',
      subtitle: 'Forging the route and readying the sprites...'
    });
    spawnAmbient(this, { count: 6, mode: 'room' });

    this.add.text(W / 2, H * 0.36, 'Loading Verity route...', {
      fontSize: '30px',
      color: '#f8d8fb',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.progressBg = this.add.rectangle(W / 2, H * 0.52, Math.min(620, W * 0.72), 22, 0x150b19, 0.96);
    this.progressBg.setStrokeStyle(2, 0xf1c6ff, 0.35);
    this.progressFill = this.add.rectangle(W / 2 - this.progressBg.width / 2 + 2, H * 0.52, 4, 18, 0xd26aa9, 1).setOrigin(0, 0.5);
    this.pct = this.add.text(W / 2, H * 0.58, '0%', {
      fontSize: '14px',
      color: '#d4c0da'
    }).setOrigin(0.5);

    this.load.on('progress', (value) => {
      this.progressFill.width = Math.max(4, (this.progressBg.width - 4) * value);
      this.pct.setText(`${Math.round(value * 100)}%`);
    });

    loadManifest(this);
  }

  create() {
    registerAnimations(this.game);
    this.time.delayedCall(120, () => this.scene.start('TitleScene'));
  }
}
