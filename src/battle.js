import {
  clamp,
  normalizeState,
  sceneToNext,
  rewardBattle,
  applyDamage,
  saveState,
  createTextButton,
  keyFor,
  addGothicBackdrop,
  getLayout,
  applyCorruption,
  makeVirtualControls,
  readControls,
  makeMeter,
  makeStaticRect
} from './util.js';

const BG_L = keyFor('ruin_runners_shaia/sprites/background/sprites_dungeon/01_dungeon_left.png');
const BG_C = keyFor('ruin_runners_shaia/sprites/background/sprites_dungeon/02_dungeon_center.png');
const BG_R = keyFor('ruin_runners_shaia/sprites/background/sprites_dungeon/03_dungeon_right.png');
const HERO_IDLE = keyFor('ruin_runners_shaia/sprites/shaia/sprites_common/common_00_idle_stand_A01.png');
const HERO_WALK = keyFor('ruin_runners_shaia/sprites/shaia/sprites_common/common_11_walk01.png');
const HERO_RUN = keyFor('ruin_runners_shaia/sprites/shaia/sprites_common/common_12_run01.png');
const HERO_ATTACKS = [
  keyFor('ruin_runners_shaia/sprites/shaia/sprites_attack/attack_01_cobination0101.png'),
  keyFor('ruin_runners_shaia/sprites/shaia/sprites_attack/attack_02_cobination0201.png'),
  keyFor('ruin_runners_shaia/sprites/shaia/sprites_attack/attack_03_cobination0301.png'),
  keyFor('ruin_runners_shaia/sprites/shaia/sprites_attack/attack_04_cobination0401.png'),
  keyFor('ruin_runners_shaia/sprites/shaia/sprites_attack/attack_05_knee01.png'),
  keyFor('ruin_runners_shaia/sprites/shaia/sprites_attack/attack_06_run_kick_begin01.png')
];
const HERO_GUARD = keyFor('ruin_runners_shaia/sprites/shaia/sprites_common/common_31_guard_stand01.png');
const HERO_HURT = keyFor('ruin_runners_shaia/sprites/shaia/sprites_damage/damage_01_damage_head.png');
const HERO_JUMP = keyFor('ruin_runners_shaia/sprites/shaia/sprites_common/common_21_jump_begin01.png');

const SK_IDLE = keyFor('ruin_runners_shaia/sprites/skeleton/common_01_idle01.png');
const SK_WALK = keyFor('ruin_runners_shaia/sprites/skeleton/common_11_walk02.png');
const SK_ATTACK = keyFor('ruin_runners_shaia/sprites/skeleton/attack_01_sword01.png');
const SK_HURT = keyFor('ruin_runners_shaia/sprites/skeleton/damage_01_damage_head.png');

export class BattleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BattleScene' });
  }

  init(data = {}) {
    this.state = normalizeState(data.state);
    this.state.sceneKey = 'BattleScene';
    this.state.room = 'Battle';
    this.encounter = data.encounter || { kind: 'patrol', hp: 48, dmg: 10, speed: 60, label: 'Patrol Skeleton' };
    this.returnX = Number(data.returnX || 200);
  }

  create() {
    const layout = getLayout(this);
    const { W, H, compact } = layout;

    this._ended = false;
    this._battleActive = false;
    this._introTimer = 900;
    this._log = [];
    this._attackIndex = 0;
    this._playerCooldown = 0;
    this._enemyCooldown = 1200;
    this._enemyHurt = 0;
    this._playerHurt = 0;
    this._playerGuard = false;
    this._retreatLock = false;
    this._dir = 1;

    this.physics.world.setBounds(0, 0, W, H);
    this.input.addPointer(3);

    addGothicBackdrop(this, { variant: 'battle', depth: -3000, fogCount: 8 });
    this.add.image(W / 2, H / 2 - 40, BG_C).setDisplaySize(W, H).setTint(0x301524).setAlpha(0.18);
    this.add.image(W * 0.08, H / 2 - 30, BG_L).setDisplaySize(W * 0.48, H).setTint(0x22111a).setAlpha(0.12);
    this.add.image(W * 0.92, H / 2 - 30, BG_R).setDisplaySize(W * 0.48, H).setTint(0x22111a).setAlpha(0.12);
    this.add.rectangle(W / 2, H / 2, W, H, 0x14090f, 0.46);
    this.add.rectangle(W / 2, 560, W, 180, 0x0c0710, 0.88);
    this.add.rectangle(W / 2, 548, W, 6, 0xeec8ff, 0.22);

    this.ground = makeStaticRect(this, W / 2, 592, W, 56);

    this.player = this.physics.add.sprite(260, 492, HERO_IDLE).setScale(0.9).setCollideWorldBounds(true);
    this.player.body.setSize(70, 88, true);
    this.player.setMaxVelocity(260, 700);
    this.player.setDragX(120);
    this.physics.add.collider(this.player, this.ground);

    this.enemy = this.physics.add.sprite(W - 270, 492, SK_IDLE).setScale(0.9).setCollideWorldBounds(true);
    this.enemy.body.setSize(72, 88, true);
    this.enemy.setMaxVelocity(240, 700);
    this.enemy.setDragX(100);
    this.physics.add.collider(this.enemy, this.ground);

    this.controls = makeVirtualControls(this, 'battle');
    this.keys = this.input.keyboard.addKeys('A,D,W,S,SPACE,SHIFT,E,ESC,ENTER,X');

    this.title = this.add.text(24, 16, 'REALTIME BATTLE', { fontSize: '30px', color: '#fff', fontStyle: 'bold' }).setScrollFactor(0).setDepth(5000);
    this.subtitle = this.add.text(24, 52, `${this.encounter.label} • Day ${this.state.day} • Stay close and keep moving`, { fontSize: '14px', color: '#ead7ef' }).setScrollFactor(0).setDepth(5000);
    this.banner = this.add.text(W / 2, 32, 'ENTER THE CHAMBER', { fontSize: '22px', color: '#ffdaef', fontStyle: 'bold' }).setOrigin(0.5).setScrollFactor(0).setDepth(5000);

    this.playerName = this.add.text(120, 214, 'SHAIA', { fontSize: '20px', color: '#fff', fontStyle: 'bold' });
    this.enemyName = this.add.text(W - 360, 214, this.encounter.label.toUpperCase(), { fontSize: '20px', color: '#fff', fontStyle: 'bold' });
    this.playerHp = makeMeter(this, 120, 252, 280, 'HP', 0xff7db0);
    this.playerSta = makeMeter(this, 120, 280, 280, 'STA', 0x8ddaff);
    this.playerWil = makeMeter(this, 120, 308, 280, 'WIL', 0xc4ff96);
    this.enemyHp = makeMeter(this, W - 360, 252, 280, 'HP', 0xff7a68);
    this.enemySta = makeMeter(this, W - 360, 280, 280, 'PRESS', 0xf6c46d);
    this.enemyWil = makeMeter(this, W - 360, 308, 280, 'FOCUS', 0xc4b2ff);
    this.enemyCor = makeMeter(this, W - 360, 336, 280, 'CORR', 0xcf7bff);

    this.logPanel = this.add.rectangle(W / 2, H - 52, Math.min(W - 40, 1200), 84, 0x160b16, 0.92).setStrokeStyle(2, 0xf4c7ff, 0.45).setScrollFactor(0).setDepth(5000);
    this.logText = this.add.text(60, H - 92, '', { fontSize: '14px', color: '#fff', wordWrap: { width: W - 120 } }).setScrollFactor(0).setDepth(5001);

    this.retreatBtn = createTextButton(this, W - 84, 54, 128, 50, 'RETREAT', () => this._retreat(), {
      fill: 0x492337,
      stroke: 0xffb8d6,
      fontSize: compact ? '14px' : '15px',
      depth: 6000
    });

    this._player = {
      hp: this.state.hp,
      maxHp: this.state.maxHp,
      sta: this.state.sta,
      maxSta: this.state.maxSta,
      wil: this.state.wil,
      maxWil: this.state.maxWil,
      guard: false,
      facing: 1,
      attacking: 0,
      hurt: 0
    };
    this._enemy = {
      hp: Math.max(20, this.encounter.hp),
      maxHp: Math.max(20, this.encounter.hp),
      dmg: Math.max(4, this.encounter.dmg),
      speed: Math.max(45, this.encounter.speed || 60),
      state: 'approach',
      intent: 'strike',
      guard: false,
      attacking: 0,
      hurt: 0,
      xBias: 0
    };

    this._logPush(`A ${this.encounter.label} emerges from the gate.`);
    this._refreshUI();
    saveState(this.state);
    this.time.delayedCall(160, () => {
      this._battleActive = true;
      this._logPush('Fight now. Keep moving.');
      this._refreshUI();
    });
  }

  _refreshUI(extraMsg = '') {
    this.playerHp.set(this.state.hp, this.state.maxHp);
    this.playerSta.set(this.state.sta, this.state.maxSta);
    this.playerWil.set(this.state.wil, this.state.maxWil);
    this.enemyHp.set(this._enemy.hp, this._enemy.maxHp);
    this.enemySta.set(this.state.pressure, 100);
    this.enemyWil.set(Math.max(0, 100 - Math.round(this._enemy.hurt / 4)), 100);
    this.enemyCor.set(this.state.corruption || 0, 100);
    this.subtitle.setText(`${this.encounter.label} • Day ${this.state.day} • Pressure ${Math.round(this.state.pressure)} • Corruption ${Math.round(this.state.corruption || 0)}`);
    this.banner.setText(this._battleActive ? 'MOVE • ATTACK • GUARD' : 'ENTER THE CHAMBER');
    const lines = this._log.slice(-4);
    if (extraMsg) lines.push(extraMsg);
    this.logText.setText(lines.join('\n'));
  }

  _logPush(msg) {
    if (!msg) return;
    this._log.push(msg);
    if (this._log.length > 8) this._log.shift();
    this._refreshUI();
  }

  _facePlayer(sprite, targetX) {
    if (!sprite) return;
    sprite.setFlipX(targetX < sprite.x);
  }

  _playerAttack() {
    if (this._player.attacking > 0 || this._player.hurt > 0 || this._playerCooldown > 0 || this._ended) return;
    this._playerCooldown = 280;
    this._player.attacking = 220;
    this._attackIndex = (this._attackIndex + 1) % HERO_ATTACKS.length;
    const attackKey = ['shaia-attack-1', 'shaia-attack-2', 'shaia-attack-3', 'shaia-attack-4', 'shaia-attack-5', 'shaia-attack-6'][this._attackIndex];
    if (this.anims.exists(attackKey)) this.player.anims.play(attackKey, true);
    this.player.setVelocityX(this.player.flipX ? -140 : 140);
    this.time.delayedCall(120, () => {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.enemy.x, this.enemy.y);
      const closeEnough = dist < 150 && Math.abs(this.player.y - this.enemy.y) < 72;
      if (closeEnough) {
        const base = 8 + Math.floor(this.state.day * 1.35) + Math.floor((this.state.pressure || 0) / 18);
        const dealt = Math.max(2, Math.round(base * (this._player.guard ? 0.85 : 1)));
        this._enemy.hp = clamp(this._enemy.hp - dealt, 0, this._enemy.maxHp);
        this._enemy.hurt = 220;
        this._enemy.attacking = 0;
        this.enemy.setVelocityX(this.player.flipX ? 170 : -170);
        if (this.anims.exists('skeleton-hurt')) this.enemy.anims.play('skeleton-hurt', true);
        this.tweens.add({ targets: this.enemy, x: this.enemy.x + (this.player.flipX ? 40 : -40), duration: 90, yoyo: true });
        applyCorruption(this.state, Math.max(0, Math.ceil(dealt / 16) - 1));
        this.state.sta = clamp(this.state.sta - 6, 0, this.state.maxSta);
        this.state.pressure = clamp(this.state.pressure + 1, 0, 100);
        this._logPush(`Hit for ${dealt}.`);
      } else {
        this.state.sta = clamp(this.state.sta - 4, 0, this.state.maxSta);
        this.state.pressure = clamp(this.state.pressure + 1, 0, 100);
        this._logPush('Attack missed the opening.');
      }
      if (this.anims.exists('shaia-idle')) this.player.anims.play('shaia-idle', true);
      this.player.setVelocityX(0);
      saveState(this.state);
      this._checkEnd();
    });
  }

  _enemyAttack() {
    if (this._ended || this._enemy.attacking > 0 || this._enemy.hurt > 0 || !this._battleActive) return;
    this._enemy.attacking = 320;
    this._enemy.intent = this.state.pressure > 60 ? 'heavy' : 'strike';
    if (this.anims.exists('skeleton-attack')) this.enemy.anims.play('skeleton-attack', true);
    this._logPush(`${this.encounter.label} attacks.`);
    this.time.delayedCall(140, () => {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.enemy.x, this.enemy.y);
      if (dist > 170) return;
      let dmg = this._enemy.dmg + (this._enemy.intent === 'heavy' ? 5 : 0);
      if (this._player.guard) dmg = Math.max(1, Math.round(dmg * 0.55));
      applyDamage(this.state, dmg, Math.ceil(dmg * 0.35), Math.ceil(dmg * 0.18), this._enemy.intent === 'heavy' ? 4 : 2);
      applyCorruption(this.state, this._enemy.intent === 'heavy' ? 4 : 2);
      this._player.hurt = 220;
      if (this.anims.exists('shaia-hurt')) this.player.anims.play('shaia-hurt', true);
      this.tweens.add({ targets: this.player, x: this.player.x + (this.enemy.x > this.player.x ? -20 : 20), duration: 90, yoyo: true });
      if (this.state.settings.shake) this.cameras.main.shake(40, 0.0035);
      this._logPush(`You take ${dmg}.`);
      saveState(this.state);
      this._checkEnd();
    });
  }

  _retreat() {
    if (this._ended || this._retreatLock) return;
    this._retreatLock = true;
    this.state.pressure = clamp(this.state.pressure + 8, 0, 100);
    this.state.battleDebt = Math.max(0, Number(this.state.battleDebt || 0) + 1);
    applyCorruption(this.state, 2);
    this._logPush('Retreating to the corridor.');
    saveState(this.state);
    this.time.delayedCall(220, () => sceneToNext(this, 'CorridorScene', { state: this.state, spawnX: this.returnX || 200 }));
  }

  _checkEnd() {
    if (this._ended) return true;
    if (this._enemy.hp <= 0) {
      this._finishVictory();
      return true;
    }
    if (this.state.hp <= 0) {
      this._finishDefeat();
      return true;
    }
    return false;
  }

  _finishVictory() {
    if (this._ended) return;
    this._ended = true;
    rewardBattle(this.state, { gold: 25 + this.state.day * 5, pressureDrop: 14, hp: 5, sta: 10, wil: 6, kills: 1 });
    this.state.flags.corridorCleared = true;
    this.state.objective = 'The route is clearer. Return to the corridor.';
    this._logPush('The chamber falls silent.');
    saveState(this.state);
    this.time.delayedCall(900, () => sceneToNext(this, 'CorridorScene', { state: this.state, spawnX: this.returnX || 200 }));
  }

  _finishDefeat() {
    if (this._ended) return;
    this._ended = true;
    this.state.defeats = Math.max(0, Number(this.state.defeats || 0) + 1);
    applyCorruption(this.state, 8);
    this.state.battleDebt = Math.max(0, Number(this.state.battleDebt || 0) + 1);
    this.state.pressure = clamp(this.state.pressure + 22, 0, 100);
    this.state.maxSta = clamp(this.state.maxSta - 8, 40, 100);
    this.state.maxWil = clamp(this.state.maxWil - 5, 40, 100);
    this.state.hp = clamp(Math.max(1, Math.floor(this.state.maxHp * 0.62)), 1, this.state.maxHp);
    this.state.sta = clamp(Math.max(1, Math.floor(this.state.maxSta * 0.55)), 1, this.state.maxSta);
    this.state.wil = clamp(Math.max(1, Math.floor(this.state.maxWil * 0.55)), 1, this.state.maxWil);
    this.state.objective = 'Recover in the bedroom and rebuild your route.';
    this._logPush('You are forced back to the bedroom.');
    saveState(this.state);
    this.time.delayedCall(1100, () => sceneToNext(this, 'BedroomScene', { state: this.state, spawnX: 220 }));
  }

  _applyMovement(input, dt) {
    if (!this._battleActive || this._ended) {
      this.player.setVelocityX(0);
      this.enemy.setVelocityX(0);
      return;
    }

    const accel = input.guard ? 130 : input.attack ? 170 : 220;
    let vx = 0;
    if (input.left) vx -= accel;
    if (input.right) vx += accel;
    this.player.setVelocityX(vx);
    if (vx !== 0) this._dir = Math.sign(vx);
    this.player.setFlipX(this._dir < 0);
    this._player.guard = !!input.guard;

    if (input.jump && (this.player.body.blocked.down || this.player.body.touching.down)) {
      this.player.setVelocityY(-470);
      if (this.anims.exists('shaia-jump')) this.player.anims.play('shaia-jump', true);
    }

    if (input.attack && this._playerCooldown <= 0) this._playerAttack();
    if (input.menu && !this._retreatLock) this._retreat();
  }

  _applyAnimations() {
    if (this._player.hurt > 0) {
      if (this.anims.exists('shaia-hurt')) this.player.anims.play('shaia-hurt', true);
      return;
    }
    if (this._player.attacking > 0) return;
    const onGround = this.player.body.blocked.down || this.player.body.touching.down;
    const moving = Math.abs(this.player.body.velocity.x) > 25;
    if (!onGround) {
      if (this.anims.exists('shaia-jump')) this.player.anims.play('shaia-jump', true);
    } else if (moving) {
      if (this.anims.exists('shaia-run') && Math.abs(this.player.body.velocity.x) > 170) this.player.anims.play('shaia-run', true);
      else if (this.anims.exists('shaia-walk')) this.player.anims.play('shaia-walk', true);
    } else if (this._player.guard && this.anims.exists('shaia-guard')) {
      this.player.anims.play('shaia-guard', true);
    } else if (this.anims.exists('shaia-idle')) {
      this.player.anims.play('shaia-idle', true);
    }
  }

  _enemyThink(dt) {
    if (!this._battleActive || this._ended) return;
    if (this._enemy.hurt > 0 || this._enemy.attacking > 0) return;

    const dx = this.player.x - this.enemy.x;
    const absDx = Math.abs(dx);
    this.enemy.setFlipX(dx < 0);

    if (absDx > 115) {
      const dir = Phaser.Math.Clamp(dx, -1, 1);
      const chase = this._enemy.speed + (this.state.pressure > 55 ? 18 : 0);
      this.enemy.setVelocityX(dir * chase);
      if (this.anims.exists('skeleton-walk')) this.enemy.anims.play('skeleton-walk', true);
      return;
    }

    this.enemy.setVelocityX(0);
    if (this._enemyCooldown <= 0) {
      this._enemyAttack();
      this._enemyCooldown = this.state.pressure > 55 ? 1150 : 1450;
    } else if (this.anims.exists('skeleton-idle')) {
      this.enemy.anims.play('skeleton-idle', true);
    }
  }

  update(time, delta) {
    const dt = delta || 16;
    const input = readControls(this, this.controls);

    if (this._introTimer > 0) {
      this._introTimer -= dt;
      if (this._introTimer <= 0) {
        this._battleActive = true;
        this._logPush('The fight begins.');
      }
    }

    if (this._playerCooldown > 0) this._playerCooldown -= dt;
    if (this._enemyCooldown > 0) this._enemyCooldown -= dt;
    if (this._player.attacking > 0) this._player.attacking -= dt;
    if (this._player.hurt > 0) this._player.hurt -= dt;
    if (this._enemy.attacking > 0) this._enemy.attacking -= dt;
    if (this._enemy.hurt > 0) this._enemy.hurt -= dt;

    this._applyMovement(input, dt);
    this._applyAnimations();
    this._enemyThink(dt);

    if (this._player.hurt <= 0 && this._enemy.hurt <= 0) {
      const near = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.enemy.x, this.enemy.y);
      if (near < 145 && input.attack && this._playerCooldown <= 0) this._playerAttack();
    }

    this._refreshUI();
  }
}
