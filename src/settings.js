import { addGothicBackdrop, createTextButton, getLayout, normalizeState, saveState, sceneToNext } from './util.js';

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
    const layout = getLayout(this);
    const { W, H, compact, pad, panelW, panelH } = layout;

    addGothicBackdrop(this, { variant: 'title', depth: -2500, fogCount: 4 });

    const panel = this.add.rectangle(W / 2, H / 2, panelW, panelH, 0x150d1a, 0.95);
    panel.setStrokeStyle(3, 0xf1c6ff, 0.72);
    this.add.text(W / 2 - panelW / 2 + 24, H / 2 - panelH / 2 + 18, 'SETTINGS', {
      fontSize: compact ? '30px' : '34px',
      color: '#fff',
      fontStyle: 'bold'
    });

    this.add.text(W / 2 - panelW / 2 + 24, H / 2 - panelH / 2 + 58, 'Tune the route for desktop, phone, or tablet.', {
      fontSize: compact ? '13px' : '15px',
      color: '#dfd6ea'
    });

    const opts = [
      { key: 'shake', label: 'Screen Shake', desc: 'Camera shake on hits and impacts.' },
      { key: 'mobileControls', label: 'Mobile Controls', desc: 'Show the touch pad on mobile devices.' },
      { key: 'largeButtons', label: 'Large Buttons', desc: 'Increase the touch button size.' },
      { key: 'music', label: 'Music', desc: 'Placeholder toggle for future audio.' },
    ];

    const startY = H / 2 - panelH / 2 + 118;
    const rowGap = compact ? 78 : 86;
    this.rows = [];

    opts.forEach((opt, idx) => {
      const y = startY + idx * rowGap;
      const row = this.add.rectangle(W / 2, y, panelW - 36, 64, 0x1d1224, 0.95).setStrokeStyle(2, 0xf1c6ff, 0.52);
      this.add.text(W / 2 - panelW / 2 + 38, y - 14, opt.label, { fontSize: '18px', color: '#fff', fontStyle: 'bold' });
      this.add.text(W / 2 - panelW / 2 + 38, y + 6, opt.desc, { fontSize: '13px', color: '#d1c6d8' });

      const toggle = createTextButton(this, W / 2 + panelW / 2 - 92, y, 130, 42, this.state.settings[opt.key] ? 'ON' : 'OFF', () => {
        this.state.settings[opt.key] = !this.state.settings[opt.key];
        toggle.text.setText(this.state.settings[opt.key] ? 'ON' : 'OFF');
        saveState(this.state);
      }, { fill: 0x3b2748, stroke: 0xf6d2ff, fontSize: '14px' });
      this.rows.push({ opt, row, toggle });
    });

    this.saveBtn = createTextButton(this, W / 2 - 140, H / 2 + panelH / 2 - 52, 240, 56, 'SAVE & RETURN', () => {
      saveState(this.state);
      sceneToNext(this, this.returnTo || 'TitleScene', { state: this.state, ...(this.returnData || {}) });
    }, { fill: 0x2b5c45, stroke: 0xb0ffd0, fontSize: '16px' });

    this.resetBtn = createTextButton(this, W / 2 + 140, H / 2 + panelH / 2 - 52, 240, 56, 'RESET SAVE', () => {
      localStorage.removeItem('shaia_sr_state_v3');
      this.state = null;
      this.add.text(W / 2, H / 2 + panelH / 2 - 94, 'Save cleared.', {
        fontSize: '14px',
        color: '#ffd7d7'
      }).setOrigin(0.5);
    }, { fill: 0x5c2b45, stroke: 0xffa6c8, fontSize: '16px' });

    this.input.keyboard.on('keydown-ESC', () => this.saveBtn.fire());
    this.input.keyboard.on('keydown-ENTER', () => this.saveBtn.fire());
  }
}
