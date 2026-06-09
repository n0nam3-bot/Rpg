import { addGothicBackdrop, createTextButton, freshState, getLayout, loadState, sceneToNext, keyFor } from './util.js';

const BG = keyFor('ruin_runners_shaia/sprites/background/sprites_dungeon/02_dungeon_center.png');
const HERO = keyFor('ruin_runners_shaia/sprites/shaia/sprites_common/common_00_idle_stand_A01.png');
const ALT  = keyFor('ruin_runners_shaia/sprites/shaia/sprites_common/common_11_walk01.png');

export class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TitleScene' });
  }

  create() {
    const layout = getLayout(this);
    const { W, H, compact, pad } = layout;

    addGothicBackdrop(this, { variant: 'title', depth: -3000, fogCount: 6 });
    this.add.image(W / 2, H / 2, BG).setDisplaySize(W, H).setAlpha(0.10).setTint(0x8b4b77);
    this.add.rectangle(W / 2, H / 2, W, H, 0x0b0711, 0.48);

    this.add.image(W * (compact ? 0.78 : 0.79), H * 0.56, HERO).setScale(compact ? 0.82 : 0.95).setAlpha(0.88);
    this.add.image(W * (compact ? 0.80 : 0.81), H * 0.29, ALT).setScale(compact ? 0.46 : 0.55).setAlpha(0.12);

    const leftX = compact ? W / 2 : 58;
    const titleY = compact ? H * 0.15 : 74;
    const align = compact ? 'center' : 'left';

    this.add.text(leftX, titleY, 'UNHOLY MAIDEN', {
      fontSize: compact ? '38px' : '50px',
      color: '#ffe8fb',
      fontStyle: 'bold',
      align
    }).setOrigin(compact ? 0.5 : 0, 0);

    this.add.text(leftX, titleY + (compact ? 48 : 58), 'A gothic route prototype with corruption, choices, and combat.', {
      fontSize: compact ? '15px' : '18px',
      color: '#dac9df',
      align
    }).setOrigin(compact ? 0.5 : 0, 0);

    this.add.text(leftX, titleY + (compact ? 74 : 88), 'Optimized for desktop and touch, with larger buttons and stronger contrast.', {
      fontSize: compact ? '12px' : '13px',
      color: '#aa9ab2',
      align
    }).setOrigin(compact ? 0.5 : 0, 0);

    this.save = loadState();

    const btnX = compact ? W / 2 : 110;
    const btnW = compact ? Math.min(W - pad * 2, 320) : 280;
    const btnH = compact ? 62 : 58;
    const baseY = compact ? H * 0.50 : H * 0.56;
    const gap = compact ? 76 : 78;

    this.newBtn = createTextButton(this, btnX, baseY, btnW, btnH, 'NEW GAME', () => {
      const state = freshState();
      state.sceneKey = 'BedroomScene';
      state.objective = 'Wake in the bedroom.';
      sceneToNext(this, 'BedroomScene', { state });
    }, { fill: 0x5e2d66, stroke: 0xffbde7, fontSize: compact ? '18px' : '18px' });

    this.contBtn = createTextButton(this, btnX, baseY + gap, btnW, btnH, this.save ? 'CONTINUE' : 'NO SAVE', () => {
      if (!this.save) return;
      const state = this.save;
      const next = state.sceneKey || 'BedroomScene';
      this.scene.start(next, { state, ...(state.sceneData || {}) });
    }, { fill: this.save ? 0x24354a : 0x2a2a34, stroke: this.save ? 0x8cc8ff : 0x666, fontSize: compact ? '18px' : '18px' });
    if (!this.save) this.contBtn.group.setAlpha(0.45);

    this.settingsBtn = createTextButton(this, btnX, baseY + gap * 2, btnW, btnH - 4, 'SETTINGS', () => {
      this.scene.start('SettingsScene', { state: this.save || freshState(), returnTo: 'TitleScene' });
    }, { fill: 0x33223d, stroke: 0xf2c6ff, fontSize: compact ? '16px' : '16px' });

    this.add.text(compact ? W / 2 : 64, H - (compact ? 44 : 72), 'ENTER / TAP: Start • ESC: Settings • Local save only', {
      fontSize: compact ? '12px' : '14px',
      color: '#c8bdd0',
      align: compact ? 'center' : 'left'
    }).setOrigin(compact ? 0.5 : 0, 0);

    this.input.keyboard.on('keydown-ENTER', () => this.newBtn.fire());
    this.input.keyboard.on('keydown-ESC', () => this.settingsBtn.fire());
  }
}
