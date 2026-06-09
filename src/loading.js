import { loadManifest, registerAnimations } from './util.js';

export class LoadingScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LoadingScene' });
  }

  preload() {
    const W = this.scale.width;
    const H = this.scale.height;

    this.add.rectangle(W / 2, H / 2, W, H, 0x090611).setScrollFactor(0);
    this.add.text(W / 2, H * 0.35, 'Loading Shaia route...', {
      fontSize: '30px',
      color: '#f6d5ff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setScrollFactor(0);
    this.progressBg = this.add.rectangle(W / 2, H * 0.52, Math.min(520, W * 0.72), 20, 0x1a1022, 0.95).setScrollFactor(0);
    this.progressFill = this.add.rectangle(W / 2 - this.progressBg.width / 2 + 2, H * 0.52, 4, 16, 0xed86d6, 1).setOrigin(0, 0.5).setScrollFactor(0);
    this.pct = this.add.text(W / 2, H * 0.58, '0%', {
      fontSize: '14px',
      color: '#cbb9df'
    }).setOrigin(0.5).setScrollFactor(0);

    this.load.on('progress', (value) => {
      this.progressFill.width = Math.max(4, (this.progressBg.width - 4) * value);
      this.pct.setText(`${Math.round(value * 100)}%`);
    });

    loadManifest(this);
  }

  create() {
    registerAnimations(this.game);
    this.time.delayedCall(150, () => this.scene.start('TitleScene'));
  }
}
