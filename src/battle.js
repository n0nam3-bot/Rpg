import {
  clamp,
  normalizeState,
  makeVirtualControls,
  readControls,
  makeMeter,
  makeStaticRect,
  sceneToNext,
  rewardBattle,
  applyDamage,
  saveState,
  keyFor
} from './util.js';

const BG_C = keyFor('ruin_runners_shaia/sprites/background/sprites_dungeon/02_dungeon_center.png');
const BG_L = keyFor('ruin_runners_shaia/sprites/background/sprites_dungeon/01_dungeon_left.png');
const BG_R = keyFor('ruin_runners_shaia/sprites/background/sprites_dungeon/03_dungeon_right.png');
const HERO_IDLE = keyFor('ruin_runners_shaia/sprites/shaia/sprites_common/common_00_idle_stand_A01.png');
const HERO_WALK = keyFor('ruin_runners_shaia/sprites/shaia/sprites_common/common_11_walk01.png');
const HERO_RUN = keyFor('ruin_runners_shaia/sprites/shaia/sprites_common/common_12_run01.png');
const HERO_JUMP = keyFor('ruin_runners_shaia/sprites/shaia/sprites_common/common_21_jump_begin01.png');
const HERO_ATTACKS = [
  keyFor('ruin_runners_shaia/sprites/shaia/sprites_attack/attack_01_cobination0101.png'),
  keyFor('ruin_runners_shaia/sprites/shaia/sprites_attack/attack_02_cobination0201.png'),
  keyFor('ruin_runners_shaia/sprites/shaia/sprites_attack/attack_03_cobination0301.png'),
  keyFor('ruin_runners_shaia/sprites/shaia/sprites_attack/attack_04_cobination0401.png'),
  keyFor('ruin_runners_shaia/sprites/shaia/sprites_attack/attack_05_knee01.png'),
  keyFor('ruin_runners_shaia/sprites/shaia/sprites_attack/attack_06_run_kick_begin01.png'),
  keyFor('ruin_runners_shaia/sprites/shaia/sprites_attack/attack_11_crounch_attack0201.png')
];
const HERO_GUARD = keyFor('ruin_runners_shaia/sprites/shaia/sprites_common/common_31_guard_stand01.png');
const HERO_HURT = keyFor('ruin_runners_shaia/sprites/shaia/sprites_damage/damage_01_damage_head.png');

const SK_IDLE = keyFor('ruin_runners_shaia/sprites/skeleton/common_01_idle01.png');
const SK_WALK = keyFor('ruin_runners_shaia/sprites/skeleton/common_11_walk02.png');
const SK_ATTACK = keyFor('ruin_runners_shaia/sprites/skeleton/attack_01_sword01.png');
const SK_HURT = keyFor('ruin_runners_shaia/sprites/skeleton/damage_01_damage_head.png');
const SK_JUMP = keyFor('ruin_runners_shaia/sprites/skeleton/common_21_jump_begin01.png');
const SK_LAND = keyFor('ruin_runners_shaia/sprites/skeleton/common_22_landing01.png');

export class BattleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BattleScene' });
  }

  init(data = {}) {
    this.state = normalizeState(data.state);
    this.state.sceneKey = 'BattleScene';
    this.state.room = 'Battle';
    this.encounter = data.encounter || { kind: 'patrol', hp: 40, dmg: 10, speed: 60, label: 'Patrol Skeleton' };
    this.returnX = Number(data.returnX || 200);
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;
    this.worldW = 1800;
    this.worldH = 720;
    this.groundY = 590;

    this.input.addPointer(3);
    this.physics.world.setBounds(0, 0, this.worldW, this.worldH);
    this.cameras.main.setBounds(0, 0, this.worldW, this.worldH);

    this.add.image(0, 0, BG_L).setOrigin(0, 0).setDisplaySize(512, 384).setTint(0x3c1e20).setScrollFactor(0.32);
    this.add.image(512, 0, BG_C).setOrigin(0, 0).setDisplaySize(512, 384).setTint(0x42202a).setScrollFactor(0.32);
    this.add.image(1024, 0, BG_R).setOrigin(0, 0).setDisplaySize(512, 384).setTint(0x401f28).setScrollFactor(0.32);
    this.add.rectangle(this.worldW / 2, this.worldH / 2, this.worldW, this.worldH, 0x13070d, 0.54);

    this.groundRects = [
      makeStaticRect(this, this.worldW / 2, this.groundY + 24, this.worldW, 48),
      makeStaticRect(this, 900, 470, 260, 18),
      makeStaticRect(this, 1280, 430, 220, 18)
    ];

    this.player = this.physics.add.sprite(220, 520, HERO_IDLE).setScale(0.80).setCollideWorldBounds(true);
    this.player.body.setSize(74, 92, true);
    this.groundRects.forEach((r) => this.physics.add.collider(this.player, r));

    this.enemy = this.physics.add.sprite(1180, 520, SK_IDLE).setScale(0.80).setCollideWorldBounds(true);
    this.enemy.body.setSize(74, 92, true);
    this.groundRects.forEach((r) => this.physics.add.collider(this.enemy, r));

    this.controls = makeVirtualControls(this, 'battle');
    this.keys = this.input.keyboard.addKeys('A,D,W,S,SPACE,SHIFT,X,C,ESC,ENTER');
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);

    this.playerFacing = 1;
    this.combo = 0;
    this.attackTimer = 0;
    this.attackCooldown = 0;
    this.attackFrame = 0;
    this.attackHit = false;
    this.playerState = 'idle';
    this.enemyState = 'idle';
    this.enemyHp = this.encounter.hp;
    this.enemyDmg = this.encounter.dmg;
    this.enemySpeed = this.encounter.speed;
    this.enemyCooldown = 700;
    this.enemyWindup = 0;
    this.enemyFacing = -1;
    this.hurtTimer = 0;
    this.resultTimer = 0;
    this.resultText = '';
    this._ended = false;

    this.title = this.add.text(24, 18, 'COMBAT SCREEN', { fontSize: '28px', color: '#fff', fontStyle: 'bold' }).setScrollFactor(0).setDepth(5000);
    this.sub = this.add.text(24, 50, `${this.encounter.label} • Use movement, jump, guard, and attack to win`, { fontSize: '14px', color: '#f0d3d7' }).setScrollFactor(0).setDepth(5000);
    this.promptText = this.add.text(24, H - 40, 'Attack with X. Guard with Shift. Use the on-screen buttons on mobile.', { fontSize: '14px', color: '#fff' }).setScrollFactor(0).setDepth(5000);

    this.playerHpBar = makeMeter(this, 24, 90, 250, 'HP', 0xff8ab3);
    this.playerStaBar = makeMeter(this, 24, 118, 250, 'STA', 0x89d6ff);
    this.playerWilBar = makeMeter(this, 24, 146, 250, 'WIL', 0xb7f08a);
    this.pressBar = makeMeter(this, 24, 174, 250, 'PRESS', 0xffc76d);
    this.enemyBar = makeMeter(this, 24, 208, 250, 'ENEMY', 0xff6c6c);

    this.resultOverlay = this.add.container(W / 2, H / 2).setScrollFactor(0).setDepth(8000).setAlpha(0);
    const panel = this.add.rectangle(0, 0, 560, 240, 0x180c14, 0.94).setStrokeStyle(3, 0xf0c6ff, 0.9);
    this.resultText = this.add.text(0, -36, '', { fontSize: '24px', color: '#fff', fontStyle: 'bold', align: 'center' }).setOrigin(0.5);
    this.resultHint = this.add.text(0, 20, '', { fontSize: '14px', color: '#ddd', align: 'center' }).setOrigin(0.5);
    this.resultOverlay.add([panel, this.resultText, this.resultHint]);

    this._refreshHUD();
    this._setAnim(this.player, 'shaia-idle');
    this._setAnim(this.enemy, 'skeleton-idle');
    this.state.pressure = clamp(this.state.pressure + 5, 0, 100);
    saveState(this.state);
  }

  _setAnim(sprite, anim) {
    if (!sprite || !sprite.anims) return;
    if (sprite.anims.currentAnim && sprite.anims.currentAnim.key === anim) return;
    if (this.anims.exists(anim)) sprite.anims.play(anim, true);
  }

  _refreshHUD(msg = '') {
    this.playerHpBar.set(this.state.hp, this.state.maxHp);
    this.playerStaBar.set(this.state.sta, this.state.maxSta);
    this.playerWilBar.set(this.state.wil, this.state.maxWil);
    this.pressBar.set(this.state.pressure, 100);
    this.enemyBar.set(this.enemyHp, this.encounter.hp);
    this.sub.setText(`${this.encounter.label} • Combo x${this.combo || 0} • Day ${this.state.day}`);
    this.promptText.setText(msg || this._prompt || 'Attack the enemy and keep pressure under control.');
  }

  _showResult(title, hint, color = 0x180c14) {
    this.resultText.setText(title);
    this.resultHint.setText(hint);
    this.resultOverlay.setAlpha(1);
    this.resultOverlay.list[0].fillColor = color;
  }

  _hideResult() {
    this.resultOverlay.setAlpha(0);
  }

  _attackAnimForCombo(n) {
    if (n === 1) return 'shaia-attack-1';
    if (n === 2) return 'shaia-attack-2';
    if (n === 3) return 'shaia-attack-3';
    if (n === 4) return 'shaia-attack-4';
    if (n === 5) return 'shaia-attack-5';
    if (n === 6) return 'shaia-attack-6';
    return 'shaia-attack-crouch';
  }

  _playerAttack() {
    if (this.attackCooldown > 0 || this._ended) return;
    this.combo = this.combo >= 3 ? 1 : this.combo + 1;
    this.attackTimer = 160;
    this.attackCooldown = 320;
    this.attackHit = false;
    this.attackFrame = this.combo;
    this.playerState = 'attack';
    this._setAnim(this.player, this._attackAnimForCombo(this.combo));
  }

  _enemyAttack() {
    if (this.enemyWindup > 0 || this._ended) return;
    this.enemyWindup = 180;
    this.enemyCooldown = 900;
    this.enemyState = 'attack';
    this._setAnim(this.enemy, 'skeleton-attack');
  }

  _applyEnemyHit() {
    if (this.attackHit || this._ended) return;
    const dist = Math.abs(this.enemy.x - this.player.x);
    const ydist = Math.abs(this.enemy.y - this.player.y);
    if (dist < 116 && ydist < 88) {
      this.attackHit = true;
      const damage = 10 + (this.combo * 4) + Math.floor(this.state.gold / 60);
      this.enemyHp = clamp(this.enemyHp - damage, 0, this.encounter.hp);
      this.enemy.setVelocityX((this.playerFacing > 0 ? 1 : -1) * 120);
      this.enemy.setVelocityY(-120);
      this.enemyState = 'hurt';
      this._setAnim(this.enemy, 'skeleton-hurt');
      this.state.pressure = clamp(this.state.pressure + 2, 0, 100);
      this.state.sta = clamp(this.state.sta - 4, 0, this.state.maxSta);
      if (this.state.settings.shake) this.cameras.main.shake(55, 0.004);
      this._refreshHUD('Hit!');
    }
  }

  _applyPlayerHit(dmg) {
    const guard = this._input.guard || false;
    const final = guard ? Math.max(1, Math.floor(dmg * 0.3)) : dmg;
    applyDamage(this.state, final, guard ? 2 : 4, guard ? 1 : 2, guard ? 1 : 4);
    this.playerState = 'hurt';
    this._setAnim(this.player, 'shaia-hurt');
    if (this.state.settings.shake) this.cameras.main.shake(70, 0.005);
    this.player.setVelocityX((this.enemyFacing > 0 ? 1 : -1) * -220);
    this.player.setVelocityY(-120);
    this._refreshHUD(guard ? 'Guarded!' : 'Ouch!');
  }

  _finishVictory() {
    if (this._ended) return;
    this._ended = true;
    rewardBattle(this.state, { gold: 25 + this.state.day * 4, pressureDrop: 14, hp: 4, sta: 8, wil: 6, kills: 1 });
    this.state.objective = 'The route is clearer. Return to the corridor or bedroom.';
    saveState(this.state);
    this._showResult('Victory', 'The route is clear. Returning to the corridor...', 0x14301d);
    this.time.delayedCall(1400, () => sceneToNext(this, 'CorridorScene', { state: this.state, spawnX: this.returnX || 180 }));
  }

  _finishDefeat() {
    if (this._ended) return;
    this._ended = true;
    this.state.pressure = clamp(this.state.pressure + 12, 0, 100);
    this.state.hp = Math.max(1, Math.floor(this.state.maxHp * 0.7));
    this.state.sta = Math.max(1, Math.floor(this.state.maxSta * 0.6));
    this.state.wil = Math.max(1, Math.floor(this.state.maxWil * 0.6));
    this.state.objective = 'You were forced back to the bedroom.';
    saveState(this.state);
    this._showResult('Defeat', 'You retreat to the bedroom and recover.', 0x30141a);
    this.time.delayedCall(1600, () => sceneToNext(this, 'BedroomScene', { state: this.state, spawnX: 220 }));
  }

  update(time, delta) {
    if (this._ended) return;

    const input = readControls(this, this.controls);
    this._input = input;

    this.attackCooldown = Math.max(0, this.attackCooldown - delta);
    this.attackTimer = Math.max(0, this.attackTimer - delta);
    this.enemyCooldown = Math.max(0, this.enemyCooldown - delta);
    this.enemyWindup = Math.max(0, this.enemyWindup - delta);
    this.hurtTimer = Math.max(0, this.hurtTimer - delta);

    const onGround = this.player.body.blocked.down || this.player.body.touching.down;
    const speed = input.guard ? 120 : (input.attack ? 160 : 220);
    let vx = 0;
    if (input.left) vx -= speed;
    if (input.right) vx += speed;
    this.player.setVelocityX(vx);

    if (input.jump && onGround && this.hurtTimer <= 0) {
      this.player.setVelocityY(-460);
      this._setAnim(this.player, 'shaia-jump');
    }

    if (vx !== 0) this.playerFacing = vx < 0 ? -1 : 1;
    this.player.setFlipX(this.playerFacing < 0);

    if (!onGround) this._setAnim(this.player, 'shaia-jump');
    else if (input.guard) this._setAnim(this.player, 'shaia-guard');
    else if (Math.abs(vx) > 180) this._setAnim(this.player, 'shaia-run');
    else if (Math.abs(vx) > 0) this._setAnim(this.player, 'shaia-walk');
    else if (this.playerState !== 'attack') this._setAnim(this.player, 'shaia-idle');

    if (input.attack && !this._lastAttack && this.attackCooldown <= 0 && this.attackTimer <= 0) {
      this._playerAttack();
    }

    if (this.attackTimer > 0) {
      this._applyEnemyHit();
    }

    // enemy AI
    const dx = this.player.x - this.enemy.x;
    const absDx = Math.abs(dx);
    this.enemyFacing = dx < 0 ? -1 : 1;
    this.enemy.setFlipX(this.enemyFacing < 0);

    if (this.enemyHp <= 0) {
      this._finishVictory();
      return;
    }
    if (this.state.hp <= 0) {
      this._finishDefeat();
      return;
    }

    if (this.enemyWindup <= 0 && this.enemyCooldown <= 0 && absDx < 130) {
      this._enemyAttack();
    }

    if (this.enemyWindup > 0) {
      if (this.enemyWindup < 80) {
        const dmg = this.encounter.dmg + Math.floor(this.state.day / 2);
        if (absDx < 110 && Math.abs(this.enemy.y - this.player.y) < 88) {
          this._applyPlayerHit(dmg);
          this.enemyWindup = 0;
        }
      }
    } else if (absDx > 82) {
      this.enemy.setVelocityX(this.enemyFacing * this.enemySpeed);
      this._setAnim(this.enemy, 'skeleton-walk');
    } else {
      this.enemy.setVelocityX(0);
      if (this.enemyState !== 'attack') this._setAnim(this.enemy, 'skeleton-idle');
    }

    if (input.guard && this.state.sta < this.state.maxSta * 0.25) {
      this.state.sta = clamp(this.state.sta + 4, 0, this.state.maxSta);
    } else {
      this.state.sta = clamp(this.state.sta + 0.8, 0, this.state.maxSta);
    }

    if (this.attackTimer <= 0 && this.playerState === 'attack') {
      this.playerState = 'idle';
      if (onGround && Math.abs(vx) <= 2) this._setAnim(this.player, 'shaia-idle');
    }

    if (this.enemyWindup <= 0 && this.enemyState === 'attack') {
      this.enemyState = 'idle';
    }

    if (input.menu && !this._lastMenu) {
      sceneToNext(this, 'SettingsScene', { state: this.state, returnTo: 'BattleScene', returnData: { encounter: this.encounter, returnX: this.returnX } });
      this._lastMenu = input.menu;
      return;
    }
    this._lastMenu = input.menu;
    this._lastAttack = input.attack;

    this._refreshHUD();
  }
}
