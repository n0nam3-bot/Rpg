import {
  loadManifest,
  registerAnimations,
  generateProceduralTextures,
  loadState, freshState,
} from './util.js';

export class LoadingScene extends Phaser.Scene {
  constructor() { super({ key: 'LoadingScene' }); }

  preload() {
    const W = this.scale.width;
    const H = this.scale.height;

    // Dark background
    this.add.rectangle(W / 2, H / 2, W, H, 0x04020a);

    // Title text
    this.add.text(W / 2, H / 2 - 80, 'VEILED APOSTASY', {
      fontSize: '42px', color: '#cc44ff', fontStyle: 'bold',
      stroke: '#440066', strokeThickness: 4,
    }).setOrigin(0.5);

    this.add.text(W / 2, H / 2 - 30, 'A Dark Fantasy', {
      fontSize: '18px', color: '#aa88cc',
    }).setOrigin(0.5);

    // Progress bar frame
    const barX = W / 2 - 300;
    const barY = H / 2 + 60;
    this.add.rectangle(barX + 300, barY, 606, 28, 0x1a0830, 1).setOrigin(0.5);
    this.add.rectangle(barX + 300, barY, 600, 22, 0x0a0518, 1).setOrigin(0.5).setStrokeStyle(2, 0x7700cc, 0.7);
    this.barFill = this.add.rectangle(barX, barY, 0, 22, 0xbb00ff, 1).setOrigin(0, 0.5);
    this.pctText = this.add.text(W / 2, barY + 26, '0%', { fontSize: '13px', color: '#cc88ff' }).setOrigin(0.5);
    this.statusText = this.add.text(W / 2, barY + 46, 'Initialising...', { fontSize: '13px', color: '#886699' }).setOrigin(0.5);

    // Load all image assets
    loadManifest(this);

    this.load.on('progress', pct => {
      this.barFill.displayWidth = 600 * pct;
      this.pctText.setText(Math.round(pct * 100) + '%');
    });
    this.load.on('fileprogress', file => {
      this.statusText.setText(file.key);
    });
    this.load.on('loaderror', file => {
      console.warn('Asset failed to load:', file.key, file.src);
    });
  }

  create() {
    // Register sprite animations
    registerAnimations(this.game);

    // Generate procedural enemy & prop textures
    generateProceduralTextures(this);

    // Subtle corruption particle effect while loading
    this._addParticles();

    // Delayed start to let particles show briefly
    this.time.delayedCall(400, () => {
      this.cameras.main.fade(600, 4, 2, 10, false, (cam, progress) => {
        if (progress >= 1) this.scene.start('TitleScene');
      });
    });
  }

  _addParticles() {
    const W = this.scale.width;
    const H = this.scale.height;
    for (let i = 0; i < 18; i++) {
      const x = Phaser.Math.Between(0, W);
      const y = Phaser.Math.Between(0, H);
      const size = Phaser.Math.Between(2, 6);
      const alpha = Phaser.Math.FloatBetween(0.1, 0.4);
      const p = this.add.circle(x, y, size, 0x8800ff, alpha);
      this.tweens.add({
        targets: p,
        y: y - Phaser.Math.Between(40, 120),
        alpha: 0,
        duration: Phaser.Math.Between(1200, 2800),
        ease: 'Quad.easeOut',
        delay: Phaser.Math.Between(0, 600),
      });
    }
  }
}
