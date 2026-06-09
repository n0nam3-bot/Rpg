import { createBackdrop, createTextButton, makeMeter, sceneToNext, saveState, describeCorruption, normalizeState } from './util.js';

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

    createBackdrop(this, {
      mode: 'room',
      title: 'STATUS / ROUTE SHEET',
      subtitle: 'Track the route, corruption, and the choices you carry.'
    });

    this.add.rectangle(82, 124, 1120, 510, 0x120812, 0.86).setOrigin(0, 0).setStrokeStyle(2, 0xf3c7ff, 0.35);
    this.add.text(100, 148, `Day ${this.state.day}  •  ${describeCorruption(this.state.corruption)}`, {
      fontSize: '18px',
      color: '#f3dff0',
      fontStyle: 'bold'
    });
    this.add.text(100, 184, `Gold ${this.state.gold}  •  Relics ${this.state.relics}  •  Apples ${this.state.apples}  •  Kills ${this.state.kills}  •  Defeats ${this.state.defeats}`, {
      fontSize: '14px',
      color: '#d8c7dd'
    });

    this.hp = makeMeter(this, 120, 266, 360, 'HP', 0xf27da8);
    this.sta = makeMeter(this, 120, 298, 360, 'STA', 0x7fcdfc);
    this.wil = makeMeter(this, 120, 330, 360, 'WIL', 0xc5f07b);
    this.cor = makeMeter(this, 120, 362, 360, 'CORRUPTION', 0xd871cc);
    this.hp.set(this.state.hp, this.state.maxHp);
    this.sta.set(this.state.sta, this.state.maxSta);
    this.wil.set(this.state.wil, this.state.maxWil);
    this.cor.set(this.state.corruption, this.state.maxCorruption);

    const detail = [
      `Objective: ${this.state.objective}`,
      `Mercy: ${this.state.mercy}`,
      `Vows: ${this.state.vows}`,
      `Accepted blessing: ${this.state.flags.acceptedBlessing ? 'yes' : 'no'}`,
      `Purified: ${this.state.flags.purified ? 'yes' : 'no'}`,
      `Corridor cleared: ${this.state.flags.corridorCleared ? 'yes' : 'no'}`
    ].join('\n');

    this.add.text(570, 250, detail, {
      fontSize: '17px',
      color: '#f6ebf7',
      lineSpacing: 10,
      wordWrap: { width: 540 }
    });

    this.add.rectangle(718, 338, 420, 210, 0x1d1022, 0.94).setStrokeStyle(2, 0xf3c7ff, 0.28);
    this.add.text(624, 270, 'Corruption Notes', { fontSize: '18px', color: '#fff', fontStyle: 'bold' });
    this.add.text(624, 302, [
      'Low corruption keeps the route clean and defensive.',
      'Mid corruption unlocks stronger attacks and darker choices.',
      'High corruption boosts damage, but the fall is harder to control.'
    ].join('\n\n'), {
      fontSize: '14px',
      color: '#dbcde0',
      lineSpacing: 6,
      wordWrap: { width: 380 }
    });

    this.backBtn = createTextButton(this, 188, 662, 250, 54, `RETURN TO ${this.returnTo.replace('Scene', '').toUpperCase()}`, () => {
      saveState(this.state);
      sceneToNext(this, this.returnTo || 'BedroomScene', { state: this.state, ...(this.returnData || {}) });
    }, { fill: 0x32213b, stroke: 0xf1c6ff, fontSize: '16px' });

    this.input.keyboard.on('keydown-ESC', () => this.backBtn.fire());
    this.input.keyboard.on('keydown-ENTER', () => this.backBtn.fire());
    this.state.flags.statusSeen = true;
    saveState(this.state);
  }
}
