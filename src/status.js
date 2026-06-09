import { addGothicBackdrop, createTextButton, getLayout, normalizeState, saveState, sceneToNext, keyFor } from './util.js';

const BG = keyFor('ruin_runners_shaia/sprites/background/sprites_dungeon/02_dungeon_center.png');
const PORTRAIT = keyFor('ruin_runners_shaia/sprites/shaia/sprites_common/common_00_idle_stand_B01.png');
const WALK = keyFor('ruin_runners_shaia/sprites/shaia/sprites_common/common_11_walk01.png');

export class StatusScene extends Phaser.Scene {
  constructor() {
    super({ key: 'StatusScene' });
  }

  init(data = {}) {
    this.state = normalizeState(data.state);
    this.state.sceneKey = 'StatusScene';
    this.returnTo = data.returnTo || this.state.sceneData?.returnTo || 'BedroomScene';
    this.returnData = data.returnData || this.state.sceneData || {};
  }

  create() {
    const layout = getLayout(this);
    const { W, H, compact, pad, panelW, panelH } = layout;

    addGothicBackdrop(this, { variant: 'hall', depth: -2600, fogCount: 5 });
    this.add.image(W / 2, H / 2, BG).setDisplaySize(W, H).setAlpha(0.16).setTint(0x7f4c72);
    this.add.rectangle(W / 2, H / 2, W, H, 0x100813, 0.72);

    const panel = this.add.rectangle(W / 2, H / 2, panelW, panelH, 0x170d1d, 0.95);
    panel.setStrokeStyle(3, 0xf6d2ff, 0.75);

    this.add.text(W / 2 - panelW / 2 + 24, H / 2 - panelH / 2 + 18, 'STATUS / ROUTE SHEET', {
      fontSize: compact ? '28px' : '34px',
      color: '#fff',
      fontStyle: 'bold'
    });
    this.add.text(W / 2 - panelW / 2 + 24, H / 2 - panelH / 2 + 58, `Day ${this.state.day} • Pressure ${Math.round(this.state.pressure)} • Corruption ${Math.round(this.state.corruption || 0)} • Gold ${this.state.gold}`, {
      fontSize: compact ? '12px' : '15px',
      color: '#dccfe1'
    });

    this.add.image(W / 2 + panelW * 0.27, H / 2 - 10, PORTRAIT).setScale(compact ? 0.75 : 0.92).setAlpha(0.92);
    this.add.image(W / 2 + panelW * 0.36, H / 2 - 110, WALK).setScale(0.38).setAlpha(0.10);

    const statLines = [
      `HP      ${Math.round(this.state.hp)} / ${Math.round(this.state.maxHp)}`,
      `STA     ${Math.round(this.state.sta)} / ${Math.round(this.state.maxSta)}`,
      `WIL     ${Math.round(this.state.wil)} / ${Math.round(this.state.maxWil)}`,
      `PRESS   ${Math.round(this.state.pressure)} / 100`,
      `CORR    ${Math.round(this.state.corruption || 0)} / 100`,
      '',
      `Apples  ${this.state.apples}`,
      `Kills   ${this.state.kills}`,
      `Quest   ${this.state.objective}`
    ];

    this.add.text(W / 2 - panelW / 2 + 24, H / 2 - 16, statLines.join('
'), {
      fontSize: compact ? '17px' : '20px',
      color: '#f5edf7',
      lineSpacing: 12,
      fontFamily: 'monospace'
    });

    this.add.text(W / 2 - panelW / 2 + 24, H / 2 + panelH / 2 - 86, 'This sheet updates from the bedroom, corridor, and combat screen.', {
      fontSize: '13px',
      color: '#c9c1cc'
    });

    this.backBtn = createTextButton(this, W / 2, H / 2 + panelH / 2 - 40, Math.min(panelW - 48, 340), 58, `RETURN TO ${this.returnTo.replace('Scene','').toUpperCase()}`, () => {
      sceneToNext(this, this.returnTo || 'BedroomScene', { state: this.state, ...(this.returnData || {}) });
    }, { fill: 0x33223d, stroke: 0xf3c6ff, fontSize: '16px' });

    this.input.keyboard.on('keydown-ESC', () => this.backBtn.fire());
    this.input.keyboard.on('keydown-ENTER', () => this.backBtn.fire());
    this.state.flags.statusSeen = true;
    saveState(this.state);
  }
}
