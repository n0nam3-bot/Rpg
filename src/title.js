import { loadState, freshState, saveState, corruptionTier } from './util.js';

export class TitleScene extends Phaser.Scene {
  constructor() { super({ key: 'TitleScene' }); }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;
    this._particles = [];
    this._time = 0;

    // Dark gradient background
    const grad = this.add.graphics();
    grad.fillGradientStyle(0x04020a, 0x04020a, 0x120030, 0x120030, 1);
    grad.fillRect(0, 0, W, H);

    // Atmospheric particle emitter (floating corruption motes)
    this._spawnParticles(W, H);

    // Glowing title
    const titleGlow = this.add.text(W / 2, 160, 'VEILED APOSTASY', {
      fontSize: '62px', color: '#cc44ff', fontStyle: 'bold',
      stroke: '#330044', strokeThickness: 6,
    }).setOrigin(0.5).setAlpha(0.0);

    const subtitle = this.add.text(W / 2, 228, 'A Dark Fantasy of Corruption & Consequence', {
      fontSize: '20px', color: '#886699', fontStyle: 'italic',
    }).setOrigin(0.5).setAlpha(0.0);

    // Fade in title
    this.tweens.add({ targets: [titleGlow, subtitle], alpha: 1, duration: 1200, ease: 'Quad.easeIn' });

    // Pulse title glow
    this.tweens.add({
      targets: titleGlow, alpha: { from: 1, to: 0.7 },
      yoyo: true, repeat: -1, duration: 1800, ease: 'Sine.easeInOut', delay: 1400,
    });

    // Version / lore line
    this.add.text(W / 2, H - 28, 'Adult Themes  •  Mature Content  •  v1.0', {
      fontSize: '13px', color: '#554466',
    }).setOrigin(0.5);

    // Check for save
    const saved = loadState();
    const btnY = 400;
    const btnW = 280, btnH = 58;
    const gap = 76;

    this._mkButton(W / 2, btnY,        btnW, btnH, '▶  NEW GAME',   0x220035, 0xcc44ff, () => this._newGame());
    if (saved) {
      this._mkButton(W / 2, btnY + gap,   btnW, btnH, '◎  CONTINUE',   0x1a002a, 0xaa33dd, () => this._continue(saved));
    }
    this._mkButton(W / 2, btnY + gap * (saved ? 2 : 1), btnW, btnH, '⚙  SETTINGS', 0x14001e, 0x883399, () => this._settings());

    // Save summary if exists
    if (saved) {
      const tier = corruptionTier(saved.corruption);
      const stripped = Object.values(saved.clothing).filter(c => c.stripped).length;
      const summaryText = [
        `Day ${saved.day}  •  ${tier.label} [Corruption ${saved.corruption}]`,
        `Kills: ${saved.kills}  Defeats: ${saved.defeats}  Gold: ${saved.gold}`,
        stripped > 0 ? `⚠ ${stripped} clothing layer(s) stripped` : 'All clothing intact',
      ].join('\n');

      this.add.text(W / 2, H - 90, summaryText, {
        fontSize: '13px', color: '#886699', align: 'center',
      }).setOrigin(0.5);
    }

    this.cameras.main.fadeIn(700, 4, 2, 10);
  }

  _mkButton(x, y, w, h, label, fill, stroke, cb) {
    const btn = this.add.container(x, y).setDepth(100);
    const r = this.add.rectangle(0, 0, w, h, fill, 0.9).setStrokeStyle(2, stroke, 0.8);
    r.setInteractive(new Phaser.Geom.Rectangle(-w/2,-h/2,w,h), Phaser.Geom.Rectangle.Contains, { useHandCursor: true });
    const t = this.add.text(0, 0, label, { fontSize: '20px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
    btn.add([r, t]);
    r.on('pointerover',  () => { r.setFillStyle(stroke, 0.25); t.setColor('#ffddff'); });
    r.on('pointerout',   () => { r.setFillStyle(fill,   0.9);  t.setColor('#ffffff'); });
    r.on('pointerdown',  cb);
    return btn;
  }

  _newGame() {
    const state = freshState();
    saveState(state);
    this.cameras.main.fade(500, 4, 2, 10, false, (cam, progress) => {
      if (progress >= 1) {
        // Show brief prologue before world
        this.scene.start('WorldScene', { state, showPrologue: true });
      }
    });
  }

  _continue(state) {
    this.cameras.main.fade(500, 4, 2, 10, false, (cam, progress) => {
      if (progress >= 1) this.scene.start('WorldScene', { state });
    });
  }

  _settings() {
    this.scene.start('SettingsScene', { returnTo: 'TitleScene', state: freshState() });
  }

  _spawnParticles(W, H) {
    for (let i = 0; i < 30; i++) {
      this.time.delayedCall(Phaser.Math.Between(0, 3000), () => this._addMote(W, H));
    }
    this.time.addEvent({ delay: 400, repeat: -1, callback: () => this._addMote(W, H) });
  }

  _addMote(W, H) {
    const x = Phaser.Math.Between(0, W);
    const y = Phaser.Math.Between(H * 0.3, H);
    const size = Phaser.Math.FloatBetween(1.5, 5);
    const color = Phaser.Math.RND.pick([0x8800ff, 0xcc44ff, 0x440088, 0xff44aa, 0x6600cc]);
    const c = this.add.circle(x, y, size, color, Phaser.Math.FloatBetween(0.05, 0.35));
    this._particles.push(c);
    this.tweens.add({
      targets: c,
      y: y - Phaser.Math.Between(80, 300),
      x: x + Phaser.Math.Between(-60, 60),
      alpha: 0,
      scale: Phaser.Math.FloatBetween(0.5, 1.8),
      duration: Phaser.Math.Between(2000, 5000),
      ease: 'Quad.easeOut',
      onComplete: () => { c.destroy(); },
    });
  }
}
