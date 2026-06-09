import {
  clamp,
  freshState,
  normalizeState,
  makeVirtualControls,
  readControls,
  makeMeter,
  makeStaticRect,
  sceneToNext,
  restAtBedroom,
  saveState,
  keyFor,
  addGothicBackdrop
} from './util.js';

const BG_L = keyFor('ruin_runners_shaia/sprites/background/sprites_dungeon/01_dungeon_left.png');
const BG_C = keyFor('ruin_runners_shaia/sprites/background/sprites_dungeon/02_dungeon_center.png');
const BG_R = keyFor('ruin_runners_shaia/sprites/background/sprites_dungeon/03_dungeon_right.png');
const HERO = keyFor('ruin_runners_shaia/sprites/shaia/sprites_common/common_00_idle_stand_A01.png');
const WALK = keyFor('ruin_runners_shaia/sprites/shaia/sprites_common/common_11_walk01.png');
const RUN = keyFor('ruin_runners_shaia/sprites/shaia/sprites_common/common_12_run01.png');
const JUMP = keyFor('ruin_runners_shaia/sprites/shaia/sprites_common/common_21_jump_begin01.png');
const LAND = keyFor('ruin_runners_shaia/sprites/shaia/sprites_common/common_22_landing01.png');

export class BedroomScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BedroomScene' });
  }

  init(data = {}) {
    this.state = normalizeState(data.state || freshState());
    this.state.sceneKey = 'BedroomScene';
    this.state.room = 'Bedroom';
    this.returnHint = data.returnHint || '';
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;
    const worldW = 2240;
    const groundY = 576;

    this.input.addPointer(3);
    this.physics.world.setBounds(0, 0, worldW, H);

    addGothicBackdrop(this, { variant: 'title', depth: -3000, fogCount: 5 });

    this.add.image(0, 0, BG_L).setOrigin(0, 0).setDisplaySize(512, 384).setTint(0x2e1737).setScrollFactor(0.3).setAlpha(0.08);
    this.add.image(512, 0, BG_C).setOrigin(0, 0).setDisplaySize(512, 384).setTint(0x3b1d3f).setScrollFactor(0.35).setAlpha(0.06);
    this.add.image(1024, 0, BG_C).setOrigin(0, 0).setDisplaySize(512, 384).setTint(0x3b1d3f).setScrollFactor(0.35).setAlpha(0.06);
    this.add.image(1536, 0, BG_R).setOrigin(0, 0).setDisplaySize(512, 384).setTint(0x2f1830).setScrollFactor(0.3).setAlpha(0.08);
    this.add.rectangle(worldW / 2, H / 2, worldW, H, 0x120915, 0.42);

    this.floorRects = [
      makeStaticRect(this, worldW / 2, groundY + 24, worldW, 48),
      makeStaticRect(this, 780, 492, 240, 18),
      makeStaticRect(this, 1340, 446, 200, 18)
    ];

    this.player = this.physics.add.sprite(220, 500, HERO).setScale(0.84).setCollideWorldBounds(true);
    this.player.body.setSize(70, 88, true);
    this.player.setBounce(0.02);
    this.floorRects.forEach((r) => this.physics.add.collider(this.player, r));

    this.controls = makeVirtualControls(this, 'explore');
    this.keys = this.input.keyboard.addKeys('A,D,W,S,SPACE,SHIFT,E,ESC,ENTER');
    this.cameras.main.setBounds(0, 0, worldW, H);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);

    this.interactables = [
      { x: 620, y: 494, label: 'Bed', action: () => this.sleep(), prompt: 'Rest to lower pressure and advance the day.' },
      { x: 1020, y: 442, label: 'Mirror', action: () => sceneToNext(this, 'StatusScene', { state: this.state, returnTo: 'BedroomScene' }), prompt: 'Check your route status.' },
      { x: 1540, y: 442, label: 'Ward Altar', action: () => this.saveHere(), prompt: 'Save your progress.' },
      { x: 2060, y: 494, label: 'Door', action: () => sceneToNext(this, 'CorridorScene', { state: this.state, spawnX: 180 }), prompt: 'Step into the corridor.' }
    ];

    this.interactGfx = this.add.group();
    this.interactables.forEach((obj) => {
      const marker = this.add.rectangle(obj.x, obj.y - 58, 98, 96, 0x261627, 0.42).setStrokeStyle(2, 0xf5c7ff, 0.35);
      const text = this.add.text(obj.x, obj.y - 100, obj.label, { fontSize: '15px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
      const note = this.add.text(obj.x, obj.y + 38, 'Press E / USE', { fontSize: '12px', color: '#e4d2ec' }).setOrigin(0.5);
      this.interactGfx.addMultiple([marker, text, note]);
      obj.marker = marker;
      obj.text = text;
      obj.note = note;
    });

    // Replace random clutter with bedroom-specific shapes.
    this.bedBase = this.add.rectangle(620, 504, 220, 56, 0x5f3a4d, 1).setStrokeStyle(3, 0xf8c6ff, 0.45);
    this.bedPillow = this.add.rectangle(568, 484, 74, 22, 0xf2d7e6, 1).setStrokeStyle(2, 0xffdff1, 0.4);
    this.bedBlanket = this.add.rectangle(642, 494, 126, 34, 0x7d4a62, 0.95).setStrokeStyle(2, 0xf2c6ff, 0.25);
    this.saveAltar = this.add.rectangle(1540, 508, 110, 68, 0x211220, 1).setStrokeStyle(3, 0xf5c7ff, 0.35);
    this.saveOrb = this.add.circle(1540, 476, 16, 0xf2c6ff, 0.22).setStrokeStyle(2, 0xf2c6ff, 0.28);
    this.saveCandles = [
      this.add.rectangle(1512, 530, 6, 26, 0xf4e8ff, 0.9),
      this.add.rectangle(1568, 530, 6, 26, 0xf4e8ff, 0.9)
    ];

    this.title = this.add.text(24, 18, 'BEDROOM', { fontSize: '28px', color: '#fff', fontStyle: 'bold' }).setScrollFactor(0).setDepth(5000);
    this.dayText = this.add.text(24, 50, '', { fontSize: '14px', color: '#d7c7dc' }).setScrollFactor(0).setDepth(5000);
    this.promptText = this.add.text(24, H - 40, '', { fontSize: '14px', color: '#fff' }).setScrollFactor(0).setDepth(5000);

    this.hpMeter = makeMeter(this, 24, 88, 250, 'HP', 0xff8ab3);
    this.staMeter = makeMeter(this, 24, 116, 250, 'STA', 0x89d6ff);
    this.wilMeter = makeMeter(this, 24, 144, 250, 'WIL', 0xb7f08a);
    this.prsMeter = makeMeter(this, 24, 172, 250, 'PRESS', 0xffc76d);
    this.corMeter = makeMeter(this, 24, 200, 250, 'CORR', 0xcf7bff);

    this._refreshHUD();
    this._setAnim(this.player, 'shaia-idle');
  }

  _refreshHUD(msg = '') {
    this.dayText.setText(`Day ${this.state.day} • Pressure ${Math.round(this.state.pressure)} • Gold ${this.state.gold}`);
    this.hpMeter.set(this.state.hp, this.state.maxHp);
    this.staMeter.set(this.state.sta, this.state.maxSta);
    this.wilMeter.set(this.state.wil, this.state.maxWil);
    this.prsMeter.set(this.state.pressure, 100);
    if (this.corMeter) this.corMeter.set(this.state.corruption || 0, 100);
    this.promptText.setText(msg || this._prompt || 'Use A/D or the buttons to move. E interacts.');
  }

  _setAnim(sprite, anim) {
    if (!sprite || !sprite.anims) return;
    if (sprite.anims.currentAnim && sprite.anims.currentAnim.key === anim) return;
    sprite.anims.play(anim, true);
  }

  _nearInteractable() {
    let best = null;
    let bestDist = 9999;
    for (const obj of this.interactables) {
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, obj.x, obj.y);
      if (d < bestDist) {
        bestDist = d;
        best = obj;
      }
    }
    return bestDist < 120 ? best : null;
  }

  saveHere() {
    this.state.flags.savedOnce = true;
    saveState(this.state);
    this._refreshHUD('Saved locally.');
  }

  sleep() {
    restAtBedroom(this.state);
    saveState(this.state);
    this._refreshHUD('You rested and the day advanced.');
    this.cameras.main.flash(120, 255, 255, 255);
  }

  update() {
    const input = readControls(this, this.controls);
    const onGround = this.player.body.blocked.down || this.player.body.touching.down;
    const speed = input.guard ? 120 : (this.keys.SHIFT.isDown ? 250 : 170);

    let vx = 0;
    if (input.left) vx -= speed;
    if (input.right) vx += speed;
    this.player.setVelocityX(vx);

    if (input.jump && onGround) {
      this.player.setVelocityY(-460);
      this._setAnim(this.player, 'shaia-jump');
    }

    if (vx !== 0) this.player.setFlipX(vx < 0);
    if (!onGround) this._setAnim(this.player, 'shaia-jump');
    else if (Math.abs(vx) > 180) this._setAnim(this.player, 'shaia-run');
    else if (Math.abs(vx) > 0) this._setAnim(this.player, 'shaia-walk');
    else this._setAnim(this.player, 'shaia-idle');

    const near = this._nearInteractable();
    this._prompt = near ? `${near.label}: ${near.prompt}` : 'Bedroom: rest, save, or go to the corridor.';
    this._refreshHUD();

    if (input.interact && !this._lastInteract) {
      if (near) near.action();
    }
    this._lastInteract = input.interact;

    if (input.menu && !this._lastMenu) {
      sceneToNext(this, 'SettingsScene', { state: this.state, returnTo: 'BedroomScene' });
      this._lastMenu = input.menu;
      return;
    }
    this._lastMenu = input.menu;
  }
}
