import { createTextButton, normalizeState, saveState, sceneToNext, keyFor } from './util.js';

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
    const W = this.scale.width;
    const H = this.scale.height;

    this.add.image(W / 2, H / 2, BG).setDisplaySize(W, H).setAlpha(0.35);
    this.add.rectangle(W / 2, H / 2, W, H, 0x100813, 0.68);

    this.add.image(W * 0.72, H * 0.55, PORTRAIT).setScale(0.95);
    this.add.image(W * 0.82, H * 0.29, WALK).setScale(0.45).setAlpha(0.10);

    this.add.text(48, 46, 'STATUS / ROUTE SHEET', { fontSize: '34px', color: '#fff', fontStyle: 'bold' });
    this.add.text(48, 90, `Day ${this.state.day} • Pressure ${Math.round(this.state.pressure)} • Gold ${this.state.gold}`, { fontSize: '15px', color: '#dccfe1' });

    const box = this.add.rectangle(250, 360, 420, 420, 0x1b1020, 0.92).setStrokeStyle(3, 0xf6d2ff, 0.75);
    const statLines = [
      `HP      ${Math.round(this.state.hp)} / ${Math.round(this.state.maxHp)}`,
      `STA     ${Math.round(this.state.sta)} / ${Math.round(this.state.maxSta)}`,
      `WIL     ${Math.round(this.state.wil)} / ${Math.round(this.state.maxWil)}`,
      `PRESS   ${Math.round(this.state.pressure)} / 100`,
      '',
      `Apples  ${this.state.apples}`,
      `Kills   ${this.state.kills}`,
      `Quest   ${this.state.objective}`
    ];
    this.add.text(78, 190, statLines.join('\n'), {
      fontSize: '20px',
      color: '#f5edf7',
      lineSpacing: 12,
      fontFamily: 'monospace'
    });

    this.add.text(48, 612, 'This sheet updates from the bedroom, corridor, and combat screen.', { fontSize: '14px', color: '#c9c1cc' });

    this.backBtn = createTextButton(this, 170, 682, 240, 56, `RETURN TO ${this.returnTo.replace('Scene','').toUpperCase()}`, () => {
      sceneToNext(this, this.returnTo || 'BedroomScene', { state: this.state, ...(this.returnData || {}) });
    }, { fill: 0x33223d, stroke: 0xf3c6ff, fontSize: '17px' });

    this.input.keyboard.on('keydown-ESC', () => this.backBtn.fire());
    this.input.keyboard.on('keydown-ENTER', () => this.backBtn.fire());
    this.state.flags.statusSeen = true;
    saveState(this.state);
  }
}
