import {
  normalizeState,
  makeVirtualControls,
  readControls,
  makeMeter,
  makeStaticRect,
  sceneToNext,
  saveState,
  keyFor,
  addGothicBackdrop
} from './util.js';

const BG_L = keyFor('ruin_runners_shaia/sprites/background/sprites_dungeon/01_dungeon_left.png');
const BG_C = keyFor('ruin_runners_shaia/sprites/background/sprites_dungeon/02_dungeon_center.png');
const BG_R = keyFor('ruin_runners_shaia/sprites/background/sprites_dungeon/03_dungeon_right.png');
const FENCE_F = keyFor('ruin_runners_shaia/sprites/background/sprites_dungeon/fence_front01.png');
const FENCE_S = keyFor('ruin_runners_shaia/sprites/background/sprites_dungeon/fence_side01.png');
const HERO_IDLE = keyFor('ruin_runners_shaia/sprites/shaia/sprites_common/common_00_idle_stand_A01.png');
const HERO_WALK = keyFor('ruin_runners_shaia/sprites/shaia/sprites_common/common_11_walk01.png');
const HERO_RUN = keyFor('ruin_runners_shaia/sprites/shaia/sprites_common/common_12_run01.png');
const HERO_JUMP = keyFor('ruin_runners_shaia/sprites/shaia/sprites_common/common_21_jump_begin01.png');
const HERO_LAND = keyFor('ruin_runners_shaia/sprites/shaia/sprites_common/common_22_landing01.png');

export class CorridorScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CorridorScene' });
  }

  init(data = {}) {
    this.state = normalizeState(data.state);
    this.state.sceneKey = 'CorridorScene';
    this.state.room = 'Corridor';
    this.spawnX = Number(data.spawnX || 180);
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;
    const groundY = 568;
    const worldW = 5600;

    this.input.addPointer(3);
    this.physics.world.setBounds(0, 0, worldW, H);
    this.cameras.main.setBounds(0, 0, worldW, H);

    addGothicBackdrop(this, { variant: 'hall', depth: -3000, fogCount: 7 });

    for (let i = 0; i < 10; i++) {
      this.add.image(512 * i, 0, BG_C).setOrigin(0, 0).setDisplaySize(512, 384).setTint(0x121f34 + (i % 3) * 0x020202).setScrollFactor(0.25);
    }
    this.add.image(0, 0, BG_L).setOrigin(0, 0).setDisplaySize(512, 384).setTint(0x1b2c4e).setScrollFactor(0.18);
    this.add.image(worldW - 512, 0, BG_R).setOrigin(0, 0).setDisplaySize(512, 384).setTint(0x1b2c4e).setScrollFactor(0.18);
    for (let i = 0; i < 8; i++) {
      this.add.image(i * 640 + 240, 84, FENCE_F).setScale(1.7).setAlpha(0.10).setScrollFactor(0.35);
    }
    for (let i = 0; i < 12; i++) {
      this.add.image(i * 480 + 120, 170, FENCE_S).setScale(0.8).setAlpha(0.08).setScrollFactor(0.15);
    }
    this.add.rectangle(worldW / 2, H / 2, worldW, H, 0x080d14, 0.52);

    // Decorative corridor pillars and candles so the route reads as a shrine-hall instead of random junk.
    for (let i = 0; i < 16; i++) {
      const x = 220 + i * 330;
      this.add.rectangle(x, 470, 30, 210, 0x100915, 0.84).setStrokeStyle(2, 0x52314a, 0.45);
      this.add.rectangle(x, 362, 74, 12, 0x2a1321, 0.75);
      this.add.ellipse(x - 18, 536, 28, 42, 0xd19bc4, 0.10);
      this.add.ellipse(x + 18, 536, 28, 42, 0xf0d0ff, 0.08);
    }

    this.groundRects = [
      makeStaticRect(this, worldW / 2, groundY + 24, worldW, 48),
      makeStaticRect(this, 820, 478, 220, 18),
      makeStaticRect(this, 1760, 438, 240, 18),
      makeStaticRect(this, 3040, 468, 260, 18),
      makeStaticRect(this, 4300, 418, 280, 18)
    ];

    this.player = this.physics.add.sprite(this.spawnX, 496, HERO_IDLE).setScale(0.84).setCollideWorldBounds(true);
    this.player.body.setSize(70, 88, true);
    this.groundRects.forEach((r) => this.physics.add.collider(this.player, r));

    this.controls = makeVirtualControls(this, 'explore');
    this.keys = this.input.keyboard.addKeys('A,D,W,S,SPACE,SHIFT,E,ESC,ENTER,X');
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);

    this.title = this.add.text(24, 18, 'CORRIDOR', { fontSize: '28px', color: '#fff', fontStyle: 'bold' }).setScrollFactor(0).setDepth(5000);
    this.dayText = this.add.text(24, 50, '', { fontSize: '14px', color: '#d7e8ff' }).setScrollFactor(0).setDepth(5000);
    this.promptText = this.add.text(24, H - 40, '', { fontSize: '14px', color: '#fff' }).setScrollFactor(0).setDepth(5000);

    this.hpMeter = makeMeter(this, 24, 88, 250, 'HP', 0xff8ab3);
    this.staMeter = makeMeter(this, 24, 116, 250, 'STA', 0x89d6ff);
    this.wilMeter = makeMeter(this, 24, 144, 250, 'WIL', 0xb7f08a);
    this.prsMeter = makeMeter(this, 24, 172, 250, 'PRESS', 0xffc76d);
    this.corMeter = makeMeter(this, 24, 200, 250, 'CORR', 0xcf7bff);

    this.doors = [
      { x: 160, y: 494, label: 'Bedroom', prompt: 'Return to the bedroom and rest.', action: () => sceneToNext(this, 'BedroomScene', { state: this.state, spawnX: 2060 }) },
      { x: 1400, y: 478, label: 'Status', prompt: 'Check your route status.', action: () => sceneToNext(this, 'StatusScene', { state: this.state, returnTo: 'CorridorScene' }) },
      { x: 2140, y: 446, label: 'Shrine', prompt: 'A veiled voice offers a blessing. Decide carefully.', action: () => sceneToNext(this, 'DecisionScene', { state: this.state, returnTo: 'CorridorScene', returnData: { spawnX: this.player.x }, title: 'Veiled Shrine', body: 'The shrine asks for consent. Accept its warmth or refuse the whisper.', choices: [
        { label: 'Accept the blessing', desc: 'Gain resolve, but corruption rises.', corruption: 12, wil: 10, pressure: -8, message: 'The shrine marks you.' },
        { label: 'Refuse the whisper', desc: 'Resist the temptation and keep your distance.', corruption: -5, hp: 6, pressure: -4, message: 'You turn away from the shrine.' }
      ] }) },
      { x: 2900, y: 438, label: 'Battle Gate', prompt: 'Enter the combat chamber.', action: () => sceneToNext(this, 'BattleScene', { state: this.state, encounter: { kind: 'gate', hp: 92, dmg: 16, speed: 70, label: 'Gate Skeleton' }, returnX: this.player.x }) },
      { x: 4720, y: 418, label: 'Bedlift', prompt: 'Return to the bedroom route.', action: () => sceneToNext(this, 'BedroomScene', { state: this.state, spawnX: 220 }) }
    ];

    this.doorGfx = this.doors.map((d) => {
      const frame = this.add.rectangle(d.x, d.y - 58, 118, 110, 0x25172c, 0.30).setStrokeStyle(2, 0xffd1f6, 0.24);
      const light = this.add.ellipse(d.x, d.y - 16, 94, 136, 0xf2c8ff, 0.07);
      const text = this.add.text(d.x, d.y - 106, d.label, { fontSize: '15px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
      const note = this.add.text(d.x, d.y + 48, 'Press E / USE', { fontSize: '12px', color: '#eadcf2' }).setOrigin(0.5);
      return { frame, light, text, note, ...d };
    });

    this._refreshHUD();
    this._setAnim(this.player, 'shaia-idle');
  }

  _refreshHUD(msg = '') {
    this.dayText.setText(`Day ${this.state.day} • Objective: ${this.state.objective}`);
    this.hpMeter.set(this.state.hp, this.state.maxHp);
    this.staMeter.set(this.state.sta, this.state.maxSta);
    this.wilMeter.set(this.state.wil, this.state.maxWil);
    this.prsMeter.set(this.state.pressure, 100);
    if (this.corMeter) this.corMeter.set(this.state.corruption || 0, 100);
    this.promptText.setText(msg || this._prompt || 'Walk with A/D or the buttons. E opens doors.');
  }

  _setAnim(sprite, anim) {
    if (!sprite || !sprite.anims) return;
    if (sprite.anims.currentAnim && sprite.anims.currentAnim.key === anim) return;
    sprite.anims.play(anim, true);
  }

  _nearThing(list, radius = 120) {
    let best = null;
    let bestD = 9999;
    for (const obj of list) {
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, obj.x, obj.y);
      if (d < bestD) {
        bestD = d;
        best = obj;
      }
    }
    return bestD < radius ? best : null;
  }

  update() {
    const input = readControls(this, this.controls);
    const onGround = this.player.body.blocked.down || this.player.body.touching.down;
    const speed = input.guard ? 130 : (input.attack ? 190 : 220);

    let vx = 0;
    if (input.left) vx -= speed;
    if (input.right) vx += speed;
    this.player.setVelocityX(vx);

    if (input.jump && onGround) {
      this.player.setVelocityY(-470);
      this._setAnim(this.player, 'shaia-jump');
    }

    if (vx !== 0) this.player.setFlipX(vx < 0);
    if (!onGround) this._setAnim(this.player, 'shaia-jump');
    else if (Math.abs(vx) > 180) this._setAnim(this.player, 'shaia-run');
    else if (Math.abs(vx) > 0) this._setAnim(this.player, 'shaia-walk');
    else this._setAnim(this.player, 'shaia-idle');

    let prompt = 'Corridor: move, choose a door, or step into the shrine.';
    const door = this.doors.reduce((best, d) => {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, d.x, d.y);
      if (!best || dist < best.dist) return { d, dist };
      return best;
    }, null);

    if (door && door.dist < 130) prompt = `${door.d.label}: ${door.d.prompt}`;
    if (this.state.pressure >= 55) prompt = 'Pressure is high. The corridor feels more hostile.';
    this._prompt = prompt;
    this._refreshHUD();

    if (input.interact && !this._lastInteract) {
      if (door && door.dist < 130) {
        door.d.action();
        this._lastInteract = input.interact;
        return;
      }
    }
    this._lastInteract = input.interact;

    if (input.menu && !this._lastMenu) {
      sceneToNext(this, 'SettingsScene', { state: this.state, returnTo: 'CorridorScene' });
      this._lastMenu = input.menu;
      return;
    }
    this._lastMenu = input.menu;
  }
}
