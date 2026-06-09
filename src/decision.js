import { addGothicBackdrop, createTextButton, getLayout, normalizeState, saveState, sceneToNext, applyCorruption, applyDamage } from './util.js';

export class DecisionScene extends Phaser.Scene {
  constructor() {
    super({ key: 'DecisionScene' });
  }

  init(data = {}) {
    this.state = normalizeState(data.state);
    this.state.sceneKey = 'DecisionScene';
    this.returnTo = data.returnTo || 'BedroomScene';
    this.returnData = data.returnData || {};
    this.title = data.title || 'Veiled Offer';
    this.body = data.body || 'A stranger offers a blessing in exchange for something precious.';
    this.choices = Array.isArray(data.choices) && data.choices.length ? data.choices : [
      {
        label: 'Accept the blessing',
        desc: 'Corruption rises, but your body steadies.',
        corruption: 12,
        pressure: -10,
        wil: 8
      },
      {
        label: 'Refuse the whisper',
        desc: 'You resist, but the corridor stays cold.',
        corruption: -4,
        pressure: -4,
        hp: 4
      }
    ];
  }

  create() {
    const layout = getLayout(this);
    const { W, H, compact, pad, panelW, panelH } = layout;

    addGothicBackdrop(this, { variant: 'title', depth: -2000, fogCount: 6 });
    this.add.rectangle(W / 2, H / 2, W, H, 0x09060d, 0.36);

    const shell = this.add.rectangle(W / 2, H / 2, panelW + 120, panelH + 40, 0x130b17, 0.92);
    shell.setStrokeStyle(4, 0xf0c6ff, 0.75);
    const inner = this.add.rectangle(W / 2, H / 2, panelW + 96, panelH + 16, 0x1b1020, 0.94);
    inner.setStrokeStyle(1, 0xffffff, 0.06);

    this.add.text(W / 2 - (panelW + 70) / 2, H / 2 - (panelH + 10) / 2 + 18, this.title, {
      fontSize: compact ? '28px' : '34px',
      color: '#fff0fb',
      fontStyle: 'bold'
    });
    this.add.text(W / 2 - (panelW + 70) / 2, H / 2 - (panelH + 10) / 2 + 64, this.body, {
      fontSize: compact ? '14px' : '16px',
      color: '#ddcedf',
      wordWrap: { width: panelW + 10 }
    });

    this.add.text(W / 2 - (panelW + 70) / 2, H / 2 - (panelH + 10) / 2 + 116, `Corruption ${Math.round(this.state.corruption || 0)} • Pressure ${Math.round(this.state.pressure)} • Day ${this.state.day}`, {
      fontSize: '13px',
      color: '#d6bfd8'
    });

    this.choiceButtons = [];
    const btnW = Math.min(panelW + 14, compact ? panelW + 8 : 520);
    const btnH = compact ? 66 : 72;
    const startY = H / 2 - 10;
    const gap = btnH + 18;

    this.choices.forEach((choice, idx) => {
      const y = startY + idx * gap;
      const btn = createTextButton(this, W / 2, y, btnW, btnH, choice.label, () => this._choose(choice), {
        fill: choice.fill || (idx === 0 ? 0x5e2d66 : 0x2b2334),
        stroke: choice.stroke || 0xf0c6ff,
        fontSize: compact ? '14px' : '16px',
        depth: 8200
      });
      this.add.text(W / 2 - btnW / 2 + 18, y + 26, choice.desc || '', {
        fontSize: compact ? '12px' : '13px',
        color: '#d9cdd7',
        wordWrap: { width: btnW - 36 }
      }).setDepth(8201);
      this.choiceButtons.push(btn);
    });

    this.footer = this.add.text(W / 2, H / 2 + panelH / 2 - 18, 'Tap a choice to continue', {
      fontSize: '13px',
      color: '#c9b3d0'
    }).setOrigin(0.5).setDepth(8201);

    this.input.keyboard.on('keydown-ESC', () => this._choose(this.choices[this.choices.length - 1]));
    saveState(this.state);
  }

  _choose(choice) {
    if (!choice || this._resolved) return;
    this._resolved = true;

    const state = this.state;
    if (typeof choice.corruption === 'number') applyCorruption(state, choice.corruption);
    if (typeof choice.pressure === 'number') state.pressure = Phaser.Math.Clamp(state.pressure + choice.pressure, 0, 100);
    if (typeof choice.hp === 'number') state.hp = Phaser.Math.Clamp(state.hp + choice.hp, 0, state.maxHp);
    if (typeof choice.sta === 'number') state.sta = Phaser.Math.Clamp(state.sta + choice.sta, 0, state.maxSta);
    if (typeof choice.wil === 'number') state.wil = Phaser.Math.Clamp(state.wil + choice.wil, 0, state.maxWil);
    if (typeof choice.defeats === 'number') state.defeats = Math.max(0, state.defeats + choice.defeats);
    if (typeof choice.gold === 'number') state.gold = Math.max(0, state.gold + choice.gold);
    if (choice.advanceDay) state.day += 1;
    if (choice.message) state.objective = choice.message;
    saveState(state);

    const next = choice.next || this.returnTo || 'BedroomScene';
    sceneToNext(this, next, { state, ...(choice.returnData || this.returnData || {}) });
  }
}
