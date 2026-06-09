import {
  clamp,
  normalizeState,
  makeVirtualControls,
  readControls,
  makeMeter,
  makeStaticRect,
  sceneToNext,
  saveState,
  keyFor
} from './util.js';

const BG_L = keyFor('ruin_runners_shaia/sprites/background/sprites_dungeon/01_dungeon_left.png');
const BG_C = keyFor('ruin_runners_shaia/sprites/background/sprites_dungeon/02_dungeon_center.png');
const BG_R = keyFor('ruin_runners_shaia/sprites/background/sprites_dungeon/03_dungeon_right.png');
const FENCE_F = keyFor('ruin_runners_shaia/sprites/background/sprites_dungeon/fence_front01.png');
const FENCE_S = keyFor('ruin_runners_shaia/sprites/background/sprites_dungeon/fence_side01.png');
const BARREL = keyFor('ruin_runners_shaia/sprites/prop/barrel_001.png');
const APPLE = keyFor('ruin_runners_shaia/sprites/prop/apple.png');
const CHEST = keyFor('ruin_runners_shaia/sprites/prop/chest_open01.png');
const HERO_IDLE = keyFor('ruin_runners_shaia/sprites/shaia/sprites_common/common_00_idle_stand_A01.png');
const HERO_WALK = keyFor('ruin_runners_shaia/sprites/shaia/sprites_common/common_11_walk01.png');
const HERO_RUN = keyFor('ruin_runners_shaia/sprites/shaia/sprites_common/common_12_run01.png');
const HERO_JUMP = keyFor('ruin_runners_shaia/sprites/shaia/sprites_common/common_21_jump_begin01.png');
const HERO_LAND = keyFor('ruin_runners_shaia/sprites/shaia/sprites_common/common_22_landing01.png');

function pick(arr, fallback) {
  return arr.length ? arr : fallback;
}

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
    this.worldW = 5600;
    this.worldH = 720;
    const groundY = 610;

    this.input.addPointer(3);
    this.physics.world.setBounds(0, 0, this.worldW, this.worldH);
    this.cameras.main.setBounds(0, 0, this.worldW, this.worldH);

    for (let i = 0; i < 10; i++) {
      this.add.image(512 * i, 0, BG_C).setOrigin(0, 0).setDisplaySize(512, 384).setTint(0x10203a + (i % 3) * 0x030301).setScrollFactor(0.25);
    }
    this.add.image(0, 0, BG_L).setOrigin(0, 0).setDisplaySize(512, 384).setTint(0x1c2d52).setScrollFactor(0.2);
    this.add.image(this.worldW - 512, 0, BG_R).setOrigin(0, 0).setDisplaySize(512, 384).setTint(0x1c2d52).setScrollFactor(0.2);
    for (let i = 0; i < 8; i++) {
      this.add.image(i * 640 + 240, 80, FENCE_F).setScale(1.7).setAlpha(0.5).setScrollFactor(0.35);
    }
    for (let i = 0; i < 12; i++) {
      this.add.image(i * 480 + 120, 170, FENCE_S).setScale(0.8).setAlpha(0.35).setScrollFactor(0.15);
    }
    this.add.rectangle(this.worldW / 2, this.worldH / 2, this.worldW, this.worldH, 0x080d14, 0.46);

    this.groundRects = [
      makeStaticRect(this, this.worldW / 2, groundY + 24, this.worldW, 48),
      makeStaticRect(this, 820, 510, 220, 18),
      makeStaticRect(this, 1760, 470, 240, 18),
      makeStaticRect(this, 3040, 500, 260, 18),
      makeStaticRect(this, 4300, 450, 280, 18)
    ];

    this.player = this.physics.add.sprite(this.spawnX, 540, HERO_IDLE).setScale(0.78).setCollideWorldBounds(true);
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

    this.pickups = [];
    this.breakables = [];
    this.patrols = [];

    this._spawnProps();
    this._spawnPatrols();
    this._spawnDoors();

    this._refreshHUD();
    this._setAnim(this.player, 'shaia-idle');
  }

  _spawnDoors() {
    this.doors = [
      { x: 160, y: 530, label: 'Bedroom', prompt: 'Return to the bedroom and rest.', action: () => sceneToNext(this, 'BedroomScene', { state: this.state, spawnX: 2060 }) },
      { x: 1400, y: 510, label: 'Status', prompt: 'Check your route status.', action: () => sceneToNext(this, 'StatusScene', { state: this.state, returnTo: 'CorridorScene' }) },
      { x: 2900, y: 470, label: 'Battle Gate', prompt: 'Step into the combat screen.', action: () => this._startBattle('gate', 1.0) },
      { x: 4720, y: 450, label: 'Bedlift', prompt: 'Return to the bedroom route.', action: () => sceneToNext(this, 'BedroomScene', { state: this.state, spawnX: 220 }) }
    ];
    this.doorGfx = this.doors.map((d) => {
      const rect = this.add.rectangle(d.x, d.y - 58, 94, 96, 0x25172c, 0.35).setStrokeStyle(2, 0xffd1f6, 0.3);
      const text = this.add.text(d.x, d.y - 100, d.label, { fontSize: '15px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
      const note = this.add.text(d.x, d.y + 36, 'Press E', { fontSize: '12px', color: '#eadcf2' }).setOrigin(0.5);
      return { rect, text, note, ...d };
    });
  }

  _spawnPatrols() {
    const points = [
      { x: 920, min: 700, max: 1180, speed: 44 },
      { x: 2140, min: 1840, max: 2460, speed: 54 },
      { x: 3560, min: 3240, max: 3920, speed: 60 }
    ];
    points.forEach((cfg, idx) => {
      const p = this.physics.add.sprite(cfg.x, 540, keyFor('ruin_runners_shaia/sprites/skeleton/common_01_idle01.png')).setScale(0.78);
      p.body.setSize(72, 88, true);
      p.setCollideWorldBounds(true);
      p.setData('cfg', cfg);
      p.setData('hp', 30 + this.state.day * 4);
      p.setData('active', true);
      this.groundRects.forEach((r) => this.physics.add.collider(p, r));
      this.patrols.push(p);
    });
  }

  _spawnProps() {
    const apples = [620, 980, 1740, 2780, 3380, 4280, 5040];
    apples.forEach((x) => {
      const a = this.physics.add.staticImage(x, 548, APPLE).setScale(0.44);
      a.setData('type', 'apple');
      this.pickups.push(a);
    });

    const barrels = [1120, 1600, 2340, 3120, 3860, 4540];
    barrels.forEach((x, i) => {
      const b = this.physics.add.staticImage(x, 548, BARREL).setScale(0.68);
      b.setData('hp', 3);
      b.setData('broken', false);
      this.breakables.push(b);
    });

    const chest = this.physics.add.staticImage(5350, 548, CHEST).setScale(0.56);
    chest.setData('type', 'save');
    this.pickups.push(chest);
  }

  _refreshHUD(msg = '') {
    this.dayText.setText(`Day ${this.state.day} • Objective: ${this.state.objective}`);
    this.hpMeter.set(this.state.hp, this.state.maxHp);
    this.staMeter.set(this.state.sta, this.state.maxSta);
    this.wilMeter.set(this.state.wil, this.state.maxWil);
    this.prsMeter.set(this.state.pressure, 100);
    this.promptText.setText(msg || this._prompt || 'Walk with A/D or buttons. E opens doors, X breaks barrels or starts battle.');
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

  _startBattle(kind = 'patrol', scale = 1.0, patrol = null) {
    const enemy = patrol || this._nearThing(this.patrols, 110);
    const enemyHp = Math.round((34 + this.state.day * 5) * scale);
    const enemyDmg = Math.round((9 + this.state.day * 2) * scale);
    const enemySpeed = Math.round((64 + this.state.day * 3) * scale);
    sceneToNext(this, 'BattleScene', {
      state: this.state,
      encounter: {
        kind,
        hp: enemyHp,
        dmg: enemyDmg,
        speed: enemySpeed,
        label: kind === 'gate' ? 'Gate Skeleton' : 'Patrol Skeleton'
      },
      returnX: this.player.x
    });
  }

  _breakNearby() {
    const near = this._nearThing(this.breakables, 112);
    if (!near || near.getData('broken')) return false;
    near.setData('hp', (near.getData('hp') || 3) - 1);
    near.setTint(0xffc2dc);
    this.cameras.main.shake(60, 0.004);
    if (near.getData('hp') <= 0) {
      near.setData('broken', true);
      near.destroy();
      const apple = this.physics.add.staticImage(near.x, near.y - 20, APPLE).setScale(0.5);
      this.pickups.push(apple);
    }
    return true;
  }

  update() {
    const input = readControls(this, this.controls);
    const onGround = this.player.body.blocked.down || this.player.body.touching.down;
    const speed = input.guard ? 130 : (input.left && input.right ? 0 : (input.attack ? 190 : (input.jump ? 170 : 220)));

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
    else if (Math.abs(vx) > 180) this._setAnim(this.player, input.guard ? 'shaia-guard' : 'shaia-run');
    else if (Math.abs(vx) > 0) this._setAnim(this.player, 'shaia-walk');
    else this._setAnim(this.player, input.guard ? 'shaia-guard' : 'shaia-idle');

    this.pickups = this.pickups.filter((p) => p.active !== false);
    this.breakables = this.breakables.filter((b) => b.active !== false);
    this.patrols = this.patrols.filter((p) => p.active !== false);

    let prompt = 'Corridor: move, break crates, collect apples, or enter a door.';
    const door = this.doors.reduce((best, d) => {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, d.x, d.y);
      if (!best || dist < best.dist) return { d, dist };
      return best;
    }, null);

    if (door && door.dist < 130) prompt = `${door.d.label}: ${door.d.prompt}`;
    const pickup = this.pickups.find((p) => Phaser.Math.Distance.Between(this.player.x, this.player.y, p.x, p.y) < 95);
    if (pickup) {
      if (pickup.getData('type') === 'save') {
        prompt = 'Save chest: press E to save.';
      } else {
        prompt = 'Apple: walk through to collect.';
      }
    }
    const patrol = this.patrols.find((p) => Phaser.Math.Distance.Between(this.player.x, this.player.y, p.x, p.y) < 130);
    if (patrol) prompt = 'Patrol nearby: press E to start combat.';
    if (this.state.pressure >= 55) prompt = 'Pressure is high. Combat patrols feel more aggressive.';
    this._prompt = prompt;
    this._refreshHUD();

    if (input.interact && !this._lastInteract) {
      if (door && door.dist < 130) {
        door.d.action();
        this._lastInteract = input.interact;
        return;
      }
      if (pickup && pickup.getData('type') === 'save') {
        saveState(this.state);
        this._prompt = 'Saved.';
        this._refreshHUD('Saved.');
        this._lastInteract = input.interact;
        return;
      }
      if (patrol) {
        this._startBattle('patrol', this.state.pressure > 60 ? 1.25 : 1.0, patrol);
        this._lastInteract = input.interact;
        return;
      }
    }
    this._lastInteract = input.interact;

    if (input.attack && !this._lastAttack && this._breakNearby()) {
      this.state.pressure = clamp(this.state.pressure - 1, 0, 100);
      saveState(this.state);
    }

    this.pickups.forEach((p) => {
      if (!p.active) return;
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, p.x, p.y);
      if (d < 54) {
        if (p.getData('type') === 'apple') {
          this.state.hp = clamp(this.state.hp + 12, 0, this.state.maxHp);
          this.state.sta = clamp(this.state.sta + 14, 0, this.state.maxSta);
          this.state.pressure = clamp(this.state.pressure - 3, 0, 100);
          p.destroy();
          saveState(this.state);
        }
      }
    });

    this.patrols.forEach((p) => {
      if (!p.active) return;
      const cfg = p.getData('cfg');
      if (!cfg) return;
      p.setVelocityX(cfg.speed * (p.flipX ? -1 : 1));
      if (p.x < cfg.min) p.setFlipX(false);
      if (p.x > cfg.max) p.setFlipX(true);
      if (this.state.pressure > 50) p.setVelocityX((cfg.speed + 20) * (p.flipX ? -1 : 1));
      this._setAnim(p, Math.abs(p.body.velocity.x) > 4 ? 'skeleton-walk' : 'skeleton-idle');
    });

    if (input.menu && !this._lastMenu) {
      sceneToNext(this, 'SettingsScene', { state: this.state, returnTo: 'CorridorScene' });
      this._lastMenu = input.menu;
      return;
    }
    this._lastMenu = input.menu;
    this._lastAttack = input.attack;
  }
}
