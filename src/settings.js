import { createBackdrop, createTextButton, normalizeState, saveState, clearSave, sceneToNext } from './util.js';

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

    createBackdrop(this, {
      mode: 'title',
      title: 'SETTINGS',
      subtitle: 'Tune the route presentation and accessibility options.'
    });

    this.add.rectangle(84, 138, 1112, 420, 0x120812, 0.86).setOrigin(0, 0).setStrokeStyle(2, 0xf3c7ff, 0.3);

    const options = [
      { key: 'shake', label: 'Screen Shake', desc: 'Camera shake on hits and impacts.' },
      { key: 'mobileControls', label: 'Mobile Controls', desc: 'Show the touch pad on touch devices.' },
      { key: 'largeButtons', label: 'Large Buttons', desc: 'Make touch buttons easier to hit.' },
      { key: 'vignette', label: 'Vignette', desc: 'Keep the dark edge framing on screen.' }
    ];

    this.rows = [];
    let y = 200;
    options.forEach((opt) => {
      const row = this.add.rectangle(120, y, 460, 68, 0x211225, 0.96).setOrigin(0, 0.5).setStrokeStyle(2, 0xf3c7ff, 0.25);
      const label = this.add.text(140, y - 18, opt.label, { fontSize: '18px', color: '#fff', fontStyle: 'bold' });
      const desc = this.add.text(140, y + 3, opt.desc, { fontSize: '13px', color: '#dccade' });
      const toggle = createTextButton(this, 438, y, 120, 42, this.state.settings[opt.key] ? 'ON' : 'OFF', () => {
        this.state.settings[opt.key] = !this.state.settings[opt.key];
        toggle.setLabel(this.state.settings[opt.key] ? 'ON' : 'OFF');
        saveState(this.state);
      }, { fill: 0x3b2748, stroke: 0xf6d2ff, fontSize: '14px' });
      this.rows.push({ opt, row, label, desc, toggle });
      y += 78;
    });

    this.saveBtn = createTextButton(this, 190, 612, 230, 54, 'SAVE & RETURN', () => {
      saveState(this.state);
      sceneToNext(this, this.returnTo || 'TitleScene', { state: this.state, ...(this.returnData || {}) });
    }, { fill: 0x255042, stroke: 0xb9ffd0, fontSize: '16px' });

    this.resetBtn = createTextButton(this, 450, 612, 230, 54, 'RESET SAVE', () => {
      clearSave();
      this.state = normalizeState();
      this.add.text(708, 620, 'Save cleared.', { fontSize: '14px', color: '#ffd6d6' });
    }, { fill: 0x54243b, stroke: 0xffaac9, fontSize: '16px' });

    this.backBtn = createTextButton(this, 710, 612, 230, 54, `RETURN TO ${this.returnTo.replace('Scene', '').toUpperCase()}`, () => {
      saveState(this.state);
      sceneToNext(this, this.returnTo || 'TitleScene', { state: this.state, ...(this.returnData || {}) });
    }, { fill: 0x33213c, stroke: 0xf1c6ff, fontSize: '16px' });

    this.input.keyboard.on('keydown-ESC', () => this.saveBtn.fire());
    this.input.keyboard.on('keydown-ENTER', () => this.saveBtn.fire());
  }
}
