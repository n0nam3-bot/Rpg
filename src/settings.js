import { normalizeState, saveState, loadState, freshState } from './util.js';

export class SettingsScene extends Phaser.Scene {
  constructor() { super({ key: 'SettingsScene' }); }

  init(data = {}) {
    this.state     = normalizeState(data.state);
    this._returnTo = data.returnTo || 'WorldScene';
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    // Backdrop
    this.add.rectangle(W / 2, H / 2, W, H, 0x04020c);
    this.add.rectangle(W / 2, H / 2, W, H, 0x220044, 0.08);

    // Header
    this.add.rectangle(W / 2, 34, W, 68, 0x08030f, 0.95).setStrokeStyle(1, 0x5522aa, 0.5);
    this.add.text(24, 14, 'SETTINGS', { fontSize: '26px', color: '#cc44ff', fontStyle: 'bold' });

    const closeBtn = this.add.text(W - 24, 14, '✕  CLOSE', { fontSize: '18px', color: '#cc88ff', fontStyle: 'bold' }).setOrigin(1, 0);
    closeBtn.setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this._close());

    this.input.keyboard.on('keydown-ESC', () => this._close());

    // Toggles
    const toggleDefs = [
      { key: 'shake',          label: 'Screen Shake',          desc: 'Camera shakes on heavy impacts.' },
      { key: 'music',          label: 'Music',                 desc: 'Background music (where available).' },
      { key: 'mobileControls', label: 'Mobile Touch Buttons',  desc: 'On-screen buttons for touchscreens.' },
    ];

    let y = 140;
    this._toggleBtns = {};

    toggleDefs.forEach(({ key, label, desc }) => {
      const val = this.state.settings[key] ?? true;

      // Card
      this.add.rectangle(W / 2, y + 32, 860, 64, 0x0c0820, 0.9).setStrokeStyle(1, 0x4422aa, 0.5);

      this.add.text(80, y + 10, label, { fontSize: '18px', color: '#ddd', fontStyle: 'bold' });
      this.add.text(80, y + 36, desc,  { fontSize: '13px', color: '#776688' });

      // Toggle button
      const togBg  = this.add.rectangle(W - 110, y + 32, 140, 42, val ? 0x330044 : 0x1a001a, 0.9)
        .setStrokeStyle(2, val ? 0xcc44ff : 0x443355, 0.8);
      const togTxt = this.add.text(W - 110, y + 32, val ? 'ON' : 'OFF', {
        fontSize: '18px', color: val ? '#cc44ff' : '#443355', fontStyle: 'bold',
      }).setOrigin(0.5);

      togBg.setInteractive(new Phaser.Geom.Rectangle(-70,-21,140,42), Phaser.Geom.Rectangle.Contains, { useHandCursor: true });
      togBg.on('pointerdown', () => {
        this.state.settings[key] = !this.state.settings[key];
        const newVal = this.state.settings[key];
        togBg.setFillStyle(newVal ? 0x330044 : 0x1a001a, 0.9);
        togBg.setStrokeStyle(2, newVal ? 0xcc44ff : 0x443355, 0.8);
        togTxt.setText(newVal ? 'ON' : 'OFF');
        togTxt.setColor(newVal ? '#cc44ff' : '#443355');
        saveState(this.state);
      });

      this._toggleBtns[key] = { togBg, togTxt };
      y += 80;
    });

    y += 30;

    // Save / Clear Data section
    this.add.text(80, y, 'SAVE DATA', { fontSize: '16px', color: '#7733cc', fontStyle: 'bold' });
    this.add.rectangle(80, y + 14, 200, 2, 0x7733cc, 0.4).setOrigin(0, 0.5);
    y += 30;

    const saved = loadState();
    const saveInfo = saved
      ? `Day ${saved.day}  •  Kills: ${saved.kills}  •  Gold: ${saved.gold}g`
      : 'No save data found.';
    this.add.text(80, y, saveInfo, { fontSize: '14px', color: '#886699' });
    y += 32;

    // Manual save button
    const saveBg = this.add.rectangle(180, y + 22, 200, 44, 0x1a0035, 0.9).setStrokeStyle(2, 0x8833cc, 0.8);
    const saveTxt = this.add.text(180, y + 22, 'Save Now', { fontSize: '16px', color: '#cc88ff', fontStyle: 'bold' }).setOrigin(0.5);
    saveBg.setInteractive(new Phaser.Geom.Rectangle(-100,-22,200,44), Phaser.Geom.Rectangle.Contains, { useHandCursor: true });
    saveBg.on('pointerover', () => saveBg.setFillStyle(0x330055, 0.9));
    saveBg.on('pointerout',  () => saveBg.setFillStyle(0x1a0035, 0.9));
    saveBg.on('pointerdown', () => {
      saveState(this.state);
      this._showFeedback('Game saved.');
    });

    // Clear data button
    const clearBg  = this.add.rectangle(420, y + 22, 200, 44, 0x200006, 0.9).setStrokeStyle(2, 0x882233, 0.8);
    const clearTxt = this.add.text(420, y + 22, 'Clear Save', { fontSize: '16px', color: '#cc4455', fontStyle: 'bold' }).setOrigin(0.5);
    clearBg.setInteractive(new Phaser.Geom.Rectangle(-100,-22,200,44), Phaser.Geom.Rectangle.Contains, { useHandCursor: true });
    clearBg.on('pointerover', () => clearBg.setFillStyle(0x3a0010, 0.9));
    clearBg.on('pointerout',  () => clearBg.setFillStyle(0x200006, 0.9));
    clearBg.on('pointerdown', () => this._confirmClear());

    y += 80;

    // Controls reference
    this.add.text(80, y, 'CONTROLS', { fontSize: '16px', color: '#7733cc', fontStyle: 'bold' });
    this.add.rectangle(80, y + 14, 160, 2, 0x7733cc, 0.4).setOrigin(0, 0.5);
    y += 28;

    const controls = [
      'A / ◀  —  Move left',
      'D / ▶  —  Move right',
      'W / Space / ↑  —  Jump',
      'E / Enter  —  Interact',
      'I  —  Inventory',
      'ESC  —  Settings',
      '1–6  —  Battle actions',
    ];
    controls.forEach((c, i) => {
      this.add.text(80 + (i >= 4 ? 340 : 0), y + (i % 4) * 24, c, { fontSize: '13px', color: '#886699' });
    });

    // Hint
    this.add.text(W / 2, H - 22, 'ESC — Return', { fontSize: '12px', color: '#554466' }).setOrigin(0.5);

    this.cameras.main.fadeIn(220, 4, 2, 10);
  }

  _confirmClear() {
    const W = this.scale.width;
    const H = this.scale.height;
    const panel = this.add.container(W / 2, H / 2).setDepth(9999);
    const bg   = this.add.rectangle(0, 0, 500, 200, 0x0e030a, 0.98).setStrokeStyle(2, 0xff3355, 0.8);
    const tTxt = this.add.text(0, -64, 'Clear all save data?', { fontSize: '22px', color: '#ff4455', fontStyle: 'bold' }).setOrigin(0.5);
    const bTxt = this.add.text(0, -20, 'This cannot be undone.', { fontSize: '15px', color: '#cc8899' }).setOrigin(0.5);

    const yes = this.add.rectangle(-80, 60, 140, 44, 0x2a0008, 0.9).setStrokeStyle(2, 0xff3344, 0.8);
    const yesTxt = this.add.text(-80, 60, 'Yes, Clear', { fontSize: '15px', color: '#ff4455', fontStyle: 'bold' }).setOrigin(0.5);
    const no  = this.add.rectangle(80,  60, 140, 44, 0x0a001a, 0.9).setStrokeStyle(2, 0x7733cc, 0.8);
    const noTxt  = this.add.text(80,  60, 'Cancel', { fontSize: '15px', color: '#cc88ff', fontStyle: 'bold' }).setOrigin(0.5);
    panel.add([bg, tTxt, bTxt, yes, yesTxt, no, noTxt]);

    yes.setInteractive(new Phaser.Geom.Rectangle(-70,-22,140,44), Phaser.Geom.Rectangle.Contains, { useHandCursor: true });
    yes.on('pointerdown', () => {
      try { localStorage.removeItem('veiled_apostasy_v1'); } catch (e) { /* */ }
      this.state = freshState();
      panel.destroy();
      this._showFeedback('Save data cleared.');
    });

    no.setInteractive(new Phaser.Geom.Rectangle(-70,-22,140,44), Phaser.Geom.Rectangle.Contains, { useHandCursor: true });
    no.on('pointerdown', () => panel.destroy());
  }

  _showFeedback(msg) {
    const W = this.scale.width;
    const t = this.add.text(W / 2, 680, msg, {
      fontSize: '16px', color: '#88ff88', backgroundColor: '#00000088', padding: { x: 12, y: 6 },
    }).setOrigin(0.5).setDepth(9000);
    this.tweens.add({ targets: t, y: 640, alpha: 0, duration: 1600, ease: 'Quad.easeOut', onComplete: () => t.destroy() });
  }

  _close() {
    saveState(this.state);
    this.cameras.main.fade(220, 4, 2, 10, false, (cam, p) => {
      if (p >= 1) {
        this.scene.stop();
        this.scene.resume(this._returnTo, { dialogueClosed: true, state: this.state });
      }
    });
  }
}
