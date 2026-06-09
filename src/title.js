import { createBackdrop, createTextButton, freshState, loadState, sceneToNext, spawnAmbient, describeCorruption, keyFor } from './util.js';

const HERO = keyFor('ruin_runners_shaia/sprites/shaia/sprites_common/common_00_idle_stand_A01.png');
const HERO_ALT = keyFor('ruin_runners_shaia/sprites/shaia/sprites_common/common_11_walk01.png');
const SKULL = keyFor('ruin_runners_shaia/sprites/skeleton/common_01_idle01.png');

export class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TitleScene' });
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    const save = loadState();
    this.save = save;

    createBackdrop(this, {
      mode: 'title',
      title: 'UNHOLY MAIDEN: VERITY ROUTE',
      subtitle: 'A dark fantasy combat prototype with corruption-driven decisions.'
    });
    spawnAmbient(this, { count: 10, mode: 'room' });

    this.add.ellipse(W * 0.72, H * 0.76, 420, 96, 0x000000, 0.45);
    this.hero = this.add.image(W * 0.76, H * 0.56, HERO).setScale(1.38).setTint(0xffd9ee);
    this.heroGlow = this.add.ellipse(W * 0.76, H * 0.58, 280, 420, 0xa83277, 0.14);
    this.heroAlt = this.add.image(W * 0.80, H * 0.46, HERO_ALT).setScale(0.7).setAlpha(0.14).setTint(0xdca7ff);
    this.enemy = this.add.image(W * 0.61, H * 0.60, SKULL).setScale(1.2).setAlpha(0.18).setTint(0xb6a4ff);

    this.add.rectangle(44, 208, 560, 332, 0x120812, 0.78).setOrigin(0, 0).setStrokeStyle(2, 0xf1c6ff, 0.28);
    this.add.text(70, 230, 'Apostate Verity inspired base, rebuilt as a tighter route game.', {
      fontSize: '18px',
      color: '#f2dff2',
      wordWrap: { width: 500 },
      lineSpacing: 6
    });
    this.add.text(70, 270, 'Choices raise or cleanse corruption. Battles hit harder as the fall deepens.', {
      fontSize: '15px',
      color: '#ddd1e1',
      wordWrap: { width: 490 }
    });

    this.saveLabel = this.add.text(70, 332, save ? `Save found • Day ${save.day} • Corruption ${Math.round(save.corruption)}` : 'No save found yet.', {
      fontSize: '14px',
      color: '#cfbfd4'
    });
    this.saveTone = this.add.text(70, 358, save ? describeCorruption(save.corruption) : 'Start fresh and shape the route.', {
      fontSize: '14px',
      color: '#b7acc0'
    });

    this.playBtn = createTextButton(this, 166, 462, 250, 58, save ? 'CONTINUE' : 'NEW GAME', () => {
      const state = save || freshState();
      state.sceneKey = 'BedroomScene';
      state.room = 'Bedroom';
      if (!save) {
        state.objective = 'Wake in the sanctum and find the corridor.';
      }
      sceneToNext(this, 'BedroomScene', { state });
    }, { fill: 0x5a294e, stroke: 0xffc5ea, fontSize: '18px' });

    this.newBtn = createTextButton(this, 166, 530, 250, 52, 'NEW ROUTE', () => {
      const state = freshState();
      state.sceneKey = 'BedroomScene';
      state.room = 'Bedroom';
      state.objective = 'Wake in the sanctum and find the corridor.';
      sceneToNext(this, 'BedroomScene', { state });
    }, { fill: 0x301d3b, stroke: 0xf3c7ff, fontSize: '16px' });

    this.settingsBtn = createTextButton(this, 166, 596, 250, 52, 'SETTINGS', () => {
      const state = save || freshState();
      sceneToNext(this, 'SettingsScene', { state, returnTo: 'TitleScene' });
    }, { fill: 0x241d33, stroke: 0x8cc8ff, fontSize: '16px' });

    this.resetBtn = createTextButton(this, 166, 662, 250, 48, 'RESET SAVE', () => {
      if (typeof localStorage !== 'undefined') localStorage.removeItem('rpg_unholy_maiden_state_v1');
      this.save = null;
      this.saveLabel.setText('No save found yet.');
      this.saveTone.setText('Start fresh and shape the route.');
      this.playBtn.setLabel('NEW GAME');
      this.playBtn.rect.setFillStyle(0x5a294e, 0.96);
      this.playBtn.rect.setStrokeStyle(2, 0xffc5ea, 0.82);
    }, { fill: 0x55243d, stroke: 0xffb0cb, fontSize: '15px' });

    this.add.text(58, H - 46, 'ENTER: Start • ESC: Settings • Progress saves locally', {
      fontSize: '13px',
      color: '#cdbbd4'
    });

    this.input.keyboard.on('keydown-ENTER', () => this.playBtn.fire());
    this.input.keyboard.on('keydown-ESC', () => this.settingsBtn.fire());

    this.tweens.add({
      targets: [this.hero, this.heroAlt],
      y: '+=8',
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }
}
