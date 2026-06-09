import { createTextButton, normalizeState, saveState, sceneToNext } from './util.js';

export class SettingsScene extends Phaser.Scene {
  constructor() {
    super({ key: 'SettingsScene' });
  }

  init(data = {}) {
    this.state = normalizeState(data.state);
    this.state.sceneKey = 'SettingsScene';
    this.returnTo = data.returnTo || this.state.sceneData?.returnTo || 'TitleScene';
    this.returnData = data.returnData || this.state.sceneData || {};
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    this.add.rectangle(W / 2, H / 2, W, H, 0x090611, 0.9);
    this.add.text(48, 42, 'SETTINGS', { fontSize: '34px', color: '#fff', fontStyle: 'bold' });
    this.add.text(48, 86, 'Tune the route feel and the mobile overlay.', { fontSize: '15px', color: '#dfd6ea' });

    const opts = [
      { key: 'shake', label: 'Screen Shake', desc: 'Camera shake on hits and impacts.' },
      { key: 'mobileControls', label: 'Mobile Controls', desc: 'Show the touch pad on mobile devices.' },
      { key: 'largeButtons', label: 'Large Buttons', desc: 'Increase the touch button size.' },
      { key: 'music', label: 'Music', desc: 'Placeholder toggle for future audio.' },
    ];

    this.rows = [];
    let y = 170;
    opts.forEach((opt) => {
      const row = this.add.rectangle(70, y, 520, 64, 0x1c1223, 0.94).setOrigin(0, 0.5).setStrokeStyle(2, 0xf1c6ff, 0.55);
      const label = this.add.text(88, y - 18, opt.label, { fontSize: '18px', color: '#fff', fontStyle: 'bold' });
      const desc = this.add.text(88, y + 2, opt.desc, { fontSize: '13px', color: '#d1c6d8' });
      const toggle = createTextButton(this, 495, y, 130, 42, this.state.settings[opt.key] ? 'ON' : 'OFF', () => {
        this.state.settings[opt.key] = !this.state.settings[opt.key];
        toggle.text.setText(this.state.settings[opt.key] ? 'ON' : 'OFF');
        saveState(this.state);
      }, { fill: 0x3b2748, stroke: 0xf6d2ff, fontSize: '14px' });
      this.rows.push({ opt, row, label, desc, toggle });
      y += 90;
    });

    this.saveBtn = createTextButton(this, 170, 636, 240, 56, 'SAVE & RETURN', () => {
      saveState(this.state);
      sceneToNext(this, this.returnTo || 'TitleScene', { state: this.state, ...(this.returnData || {}) });
    }, { fill: 0x2b5c45, stroke: 0xb0ffd0, fontSize: '16px' });

    this.resetBtn = createTextButton(this, 450, 636, 240, 56, 'RESET SAVE', () => {
      localStorage.removeItem('shaia_sr_state_v3');
      this.add.text(740, 642, 'Save cleared.', { fontSize: '14px', color: '#ffd7d7' }).setScrollFactor(0);
    }, { fill: 0x5c2b45, stroke: 0xffa6c8, fontSize: '16px' });

    this.input.keyboard.on('keydown-ESC', () => this.saveBtn.fire());
    this.input.keyboard.on('keydown-ENTER', () => this.saveBtn.fire());
  }
}
