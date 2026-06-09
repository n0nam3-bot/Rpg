import { createTextButton, freshState, loadState, sceneToNext, keyFor } from './util.js';

const BG = keyFor('ruin_runners_shaia/sprites/background/sprites_dungeon/02_dungeon_center.png');
const HERO = keyFor('ruin_runners_shaia/sprites/shaia/sprites_common/common_00_idle_stand_A01.png');
const ALT  = keyFor('ruin_runners_shaia/sprites/shaia/sprites_common/common_11_walk01.png');

export class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TitleScene' });
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    this.add.image(W / 2, H / 2, BG).setDisplaySize(W, H).setAlpha(0.55);
    this.add.rectangle(W / 2, H / 2, W, H, 0x0b0711, 0.62);
    this.add.image(W * 0.76, H * 0.54, HERO).setScale(0.95);
    this.add.image(W * 0.78, H * 0.30, ALT).setScale(0.55).setAlpha(0.16);

    this.add.text(58, 74, 'SHAIA: ROUTE RECLAIMED', {
      fontSize: '42px',
      color: '#ffe2fb',
      fontStyle: 'bold'
    });
    this.add.text(62, 124, 'Bedroom-first side-scroller • combat screen • corridor route • save/load', {
      fontSize: '16px',
      color: '#d6c8df'
    });
    this.add.text(62, 158, 'Built from the uploaded Shaia pack. Use your own repo assets later with the same paths.', {
      fontSize: '13px',
      color: '#a99ab0'
    });

    this.save = loadState();

    this.newBtn = createTextButton(this, 92, H * 0.56, 240, 56, 'NEW GAME', () => {
      const state = freshState();
      state.sceneKey = 'BedroomScene';
      state.objective = 'Wake in the bedroom.';
      sceneToNext(this, 'BedroomScene', { state });
    }, { fill: 0x5e2d66, stroke: 0xffbde7, fontSize: '18px' });

    this.contBtn = createTextButton(this, 92, H * 0.66, 240, 56, this.save ? 'CONTINUE' : 'NO SAVE', () => {
      if (!this.save) return;
      const state = this.save;
      const next = state.sceneKey || 'BedroomScene';
      this.scene.start(next, { state, ...(state.sceneData || {}) });
    }, { fill: this.save ? 0x24354a : 0x2a2a34, stroke: this.save ? 0x8cc8ff : 0x666, fontSize: '18px' });
    if (!this.save) this.contBtn.group.setAlpha(0.45);

    this.settingsBtn = createTextButton(this, 92, H * 0.76, 240, 50, 'SETTINGS', () => {
      this.scene.start('SettingsScene', { state: this.save || freshState(), returnTo: 'TitleScene' });
    }, { fill: 0x33223d, stroke: 0xf2c6ff, fontSize: '16px' });

    this.add.text(64, H - 72, 'ENTER / CLICK: Start • ESC: Settings • All progress saves locally', {
      fontSize: '14px',
      color: '#c8bdd0'
    });

    this.input.keyboard.on('keydown-ENTER', () => this.newBtn.fire());
    this.input.keyboard.on('keydown-ESC', () => this.settingsBtn.fire());
  }
}
