import {
  clamp,
  normalizeState,
  sceneToNext,
  rewardBattle,
  applyDamage,
  saveState,
  createTextButton,
  keyFor
} from './util.js';

const BG_L = keyFor('ruin_runners_shaia/sprites/background/sprites_dungeon/01_dungeon_left.png');
const BG_C = keyFor('ruin_runners_shaia/sprites/background/sprites_dungeon/02_dungeon_center.png');
const BG_R = keyFor('ruin_runners_shaia/sprites/background/sprites_dungeon/03_dungeon_right.png');
const HERO_IDLE = keyFor('ruin_runners_shaia/sprites/shaia/sprites_common/common_00_idle_stand_A01.png');
const HERO_WALK = keyFor('ruin_runners_shaia/sprites/shaia/sprites_common/common_11_walk01.png');
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

const SK_IDLE = keyFor('ruin_runners_shaia/sprites/skeleton/common_01_idle01.png');
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
    const W = this.scale.width;
    const H = this.scale.height;

    this._ended = false;
    this._state = 'player';
    this._playerBusy = false;
    this._enemyBusy = false;
    this._menuIndex = 0;
    this._playerGuard = false;
    this._playerFocus = 0;
    this._enemyIntent = 'strike';
    this._log = [];
    this._turnText = 'YOUR TURN';
    this._player = { focus: 0, guard: false };
    this._enemy = { hp: this.encounter.hp, maxHp: this.encounter.hp, pressure: 100, focus: 50, dmg: this.encounter.dmg, intent: 'strike' };

    this.physics.world.setBounds(0, 0, W, H);
    this.input.addPointer(3);

    this.add.image(W / 2, H / 2, BG_L).setDisplaySize(W / 2, H).setTint(0x22111a).setAlpha(0.6);
    this.add.image(W / 2, H / 2, BG_C).setDisplaySize(W, H).setTint(0x2e1622).setAlpha(0.55);
    this.add.image(W / 2 + 340, H / 2, BG_R).setDisplaySize(W / 2, H).setTint(0x29131d).setAlpha(0.6);
    this.add.rectangle(W / 2, H / 2, W, H, 0x12070c, 0.52);
    this.add.rectangle(W / 2, 520, W, 260, 0x0f0811, 0.76);
    this.add.rectangle(W / 2, 516, W, 6, 0xf2c6ff, 0.24);

    this.add.text(24, 16, 'TURN BATTLE', { fontSize: '30px', color: '#fff', fontStyle: 'bold' }).setScrollFactor(0);
    this.subtitle = this.add.text(24, 52, `${this.encounter.label} • Day ${this.state.day} • Losses carry consequences`, { fontSize: '14px', color: '#ead7ef' }).setScrollFactor(0);
    this.turnBanner = this.add.text(W / 2, 28, this._turnText, { fontSize: '22px', color: '#ffdaef', fontStyle: 'bold' }).setOrigin(0.5).setScrollFactor(0);

    this.player = this.add.image(260, 435, HERO_IDLE).setScale(0.88).setOrigin(0.5, 0.96);
    this.enemy = this.add.image(1020, 438, SK_IDLE).setScale(0.88).setOrigin(0.5, 0.96);

    this.playerName = this.add.text(140, 218, 'SHAIA', { fontSize: '20px', color: '#fff', fontStyle: 'bold' });
    this.enemyName = this.add.text(922, 218, this.encounter.label.toUpperCase(), { fontSize: '20px', color: '#fff', fontStyle: 'bold' });
    this.enemyIntentText = this.add.text(922, 218, 'INTENT: ---', { fontSize: '13px', color: '#ead7ef' });
    this.enemyIntentText.setY(242);

    this.playerHp = this._makeBar(140, 252, 280, 'HP', 0xff7db0);
    this.playerSta = this._makeBar(140, 280, 280, 'STA', 0x8ddaff);
    this.playerWil = this._makeBar(140, 308, 280, 'WIL', 0xc4ff96);
    this.enemyHp = this._makeBar(922, 252, 280, 'HP', 0xff7a68);
    this.enemySta = this._makeBar(922, 280, 280, 'PRESS', 0xf6c46d);
    this.enemyWil = this._makeBar(922, 308, 280, 'FOCUS', 0xc4b2ff);

    this.logPanel = this.add.rectangle(W / 2, 610, 1200, 92, 0x160b16, 0.92).setStrokeStyle(2, 0xf4c7ff, 0.45);
    this.logText = this.add.text(60, 570, '', { fontSize: '15px', color: '#fff', wordWrap: { width: 1160 } });

    this.actions = ['Attack', 'Guard', 'Focus', 'Item', 'Flee'];
    this.cmdButtons = [];
    const x0 = 232;
    const y0 = 676;
    const gap = 166;
    this.actions.forEach((label, i) => {
      const btn = createTextButton(this, x0 + i * gap, y0, 146, 52, `${i + 1}. ${label}`, () => this._chooseAction(i), {
        fill: i === 0 ? 0x5a2f58 : 0x2b243a,
        stroke: 0xf0c6ff,
        fontSize: '15px'
      });
      this.cmdButtons.push(btn);
    });

    this.menuHint = this.add.text(W - 24, 18, '1-5 / Click / Tap • Guard lowers damage • Losses reduce future max STA/WIL', { fontSize: '13px', color: '#e7d6ea' }).setOrigin(1, 0);
    this.input.keyboard.on('keydown-ONE', () => this._chooseAction(0));
    this.input.keyboard.on('keydown-TWO', () => this._chooseAction(1));
    this.input.keyboard.on('keydown-THREE', () => this._chooseAction(2));
    this.input.keyboard.on('keydown-FOUR', () => this._chooseAction(3));
    this.input.keyboard.on('keydown-FIVE', () => this._chooseAction(4));
    this.input.keyboard.on('keydown-ESC', () => this._chooseAction(4));

    this._logPush(`A ${this.encounter.label} blocks the route.`);
    this._refreshAll();
    saveState(this.state);
    this.time.delayedCall(80, () => this._startEnemyIntent());
  }

  _makeBar(x, y, width, label, color) {
    const container = this.add.container(x, y);
    const bg = this.add.rectangle(0, 0, width, 18, 0x100b16, 0.92).setOrigin(0, 0.5);
    const fill = this.add.rectangle(0, 0, width, 18, color, 1).setOrigin(0, 0.5);
    const txt = this.add.text(8, 0, label, { fontSize: '12px', color: '#fff', fontStyle: 'bold' }).setOrigin(0, 0.5);
    container.add([bg, fill, txt]);
    return { container, bg, fill, txt, width };
  }

  _setBar(bar, value, max) {
    const pct = clamp(max > 0 ? value / max : 0, 0, 1);
    bar.fill.displayWidth = bar.width * pct;
    bar.txt.setText(`${bar.txt.text.split('  ')[0]}  ${Math.round(value)} / ${Math.round(max)}`);
  }

  _refreshAll(extraMsg = '') {
    this._setBar(this.playerHp, this.state.hp, this.state.maxHp);
    this._setBar(this.playerSta, this.state.sta, this.state.maxSta);
    this._setBar(this.playerWil, this.state.wil, this.state.maxWil);
    this._setBar(this.enemyHp, this._enemy.hp, this._enemy.maxHp);
    this._setBar(this.enemySta, this._enemy.pressure, 100);
    this._setBar(this.enemyWil, this._enemy.focus, 100);
    this.subtitle.setText(`${this.encounter.label} • Day ${this.state.day} • Defeats ${this.state.defeats || 0} • Pressure ${Math.round(this.state.pressure)}`);
    this.turnBanner.setText(this._turnText);
    if (this.enemyIntentText) this.enemyIntentText.setText(`INTENT: ${(this._enemy && this._enemy.intent || '---').toUpperCase()}`);
    const lines = this._log.slice(-4);
    if (extraMsg) lines.push(extraMsg);
    this.logText.setText(lines.join('\n'));
  }

  _logPush(msg) {
    if (!msg) return;
    this._log.push(msg);
    if (this._log.length > 8) this._log.shift();
    this._refreshAll();
  }

  _playHit(sprite, key, dx = 0, dy = 0) {
    if (!sprite) return;
    if (dx || dy) sprite.x += dx, sprite.y += dy;
    if (key && sprite.anims && this.anims.exists(key)) sprite.anims.play(key, true);
    this.tweens.add({ targets: sprite, x: sprite.x - dx, y: sprite.y - dy, duration: 120, ease: 'Quad.easeOut' });
  }

  _startEnemyIntent() {
    if (this._ended) return;
    this._turnText = 'ENEMY TURN';
    this._refreshAll('Enemy planning...');
    const intents = ['strike', 'strike', 'guard', 'feint', 'strike'];
    if ((this.state.pressure || 0) > 60) intents.push('heavy');
    if ((this.state.defeats || 0) > 0) intents.push('heavy');
    this._enemy.intent = intents[Phaser.Math.Between(0, intents.length - 1)];
    this.time.delayedCall(600, () => this._resolveEnemyTurn());
  }

  _chooseAction(index) {
    if (this._ended || this._state !== 'player' || this._busy) return;
    this._busy = true;
    const act = this.actions[index] || 'Attack';
    if (act === 'Attack') return this._playerAttack();
    if (act === 'Guard') return this._playerGuard();
    if (act === 'Focus') return this._playerFocus();
    if (act === 'Item') return this._playerItem();
    if (act === 'Flee') return this._playerFlee();
  }

  _playerAttack() {
    this._turnText = 'YOUR TURN — ATTACK';
    this._refreshAll('Shaia attacks.');
    this.player.anims.play('shaia-attack-1', true);
    this.tweens.add({ targets: this.player, x: this.player.x + 18, y: this.player.y - 6, yoyo: true, duration: 120 });
    this.time.delayedCall(220, () => {
      const focusBonus = Math.floor(this._player.focus / 3);
      const damage = 9 + Math.floor(this.state.day * 1.4) + focusBonus + (this.state.battleDebt ? 1 : 0);
      const guard = this._enemy.intent === 'guard' ? 0.7 : 1.0;
      const dealt = Math.max(2, Math.round(damage * guard));
      this._enemy.hp = clamp(this._enemy.hp - dealt, 0, this._enemy.maxHp);
      this._player.focus = clamp(this._player.focus + 6, 0, 100);
      this.state.sta = clamp(this.state.sta - 5, 0, this.state.maxSta);
      this.state.pressure = clamp(this.state.pressure + 1, 0, 100);
      this._enemy.hurt = 220;
      this.enemy.anims.play('skeleton-hurt', true);
      this._playHit(this.enemy, 'skeleton-hurt', 12, -6);
      this._logPush(`Attack deals ${dealt} damage.`);
      if (this.state.settings.shake) this.cameras.main.shake(50, 0.0035);
      this.time.delayedCall(150, () => this.player.anims.play('shaia-idle', true));
      this._finishPlayerTurn();
    });
  }

  _playerGuard() {
    this._turnText = 'YOUR TURN — GUARD';
    this._player.guard = true;
    this.state.sta = clamp(this.state.sta + 6, 0, this.state.maxSta);
    this.state.wil = clamp(this.state.wil + 2, 0, this.state.maxWil);
    this.player.anims.play('shaia-guard', true);
    this._logPush('Guard up. Damage will be reduced.');
    this._finishPlayerTurn();
  }

  _playerFocus() {
    this._turnText = 'YOUR TURN — FOCUS';
    this._player.focus = clamp(this._player.focus + 18, 0, 100);
    this.state.sta = clamp(this.state.sta + 10, 0, this.state.maxSta);
    this.state.wil = clamp(this.state.wil + 4, 0, this.state.maxWil);
    this.player.anims.play('shaia-idle', true);
    this._logPush('Focus sharpens the next strike.');
    this._finishPlayerTurn();
  }

  _playerItem() {
    this._turnText = 'YOUR TURN — ITEM';
    if (this.state.apples > 0) {
      this.state.apples -= 1;
      this.state.hp = clamp(this.state.hp + 24, 0, this.state.maxHp);
      this.state.sta = clamp(this.state.sta + 16, 0, this.state.maxSta);
      this.state.pressure = clamp(this.state.pressure - 4, 0, 100);
      this._logPush('Ate an apple and recovered.');
    } else {
      this._logPush('No apples left.');
    }
    this._finishPlayerTurn();
  }

  _playerFlee() {
    this._turnText = 'YOUR TURN — FLEE';
    const chance = 0.45 + ((this.state.sta || 0) / (this.state.maxSta || 100)) * 0.2 - (this._enemy.intent === 'heavy' ? 0.12 : 0);
    if (Math.random() < chance) {
      this._logPush('You escaped the fight.');
      this.state.pressure = clamp(this.state.pressure + 4, 0, 100);
      saveState(this.state);
      this._ended = true;
      this._showResult('Escape', 'You retreat to the corridor.', 0x18243a);
      this.time.delayedCall(1100, () => sceneToNext(this, 'CorridorScene', { state: this.state, spawnX: this.returnX || 180 }));
    } else {
      this._logPush('Escape failed.');
      this.state.pressure = clamp(this.state.pressure + 3, 0, 100);
      this.time.delayedCall(180, () => this._resolveEnemyTurn(true));
    }
  }

  _finishPlayerTurn() {
    this.state.sta = clamp(this.state.sta, 0, this.state.maxSta);
    this.state.wil = clamp(this.state.wil, 0, this.state.maxWil);
    this._refreshAll();
    saveState(this.state);
    this._busy = false;
    if (this._checkEnd()) return;
    this._state = 'enemy';
    this.time.delayedCall(380, () => this._startEnemyIntent());
  }

  _resolveEnemyTurn(fromMissedFlee = false) {
    if (this._ended) return;
    this._state = 'enemy';
    const guard = this._player.guard ? 0.55 : 1.0;
    let dmg = this._enemy.dmg;
    if (this._enemy.intent === 'heavy') dmg += 5;
    if (this._enemy.intent === 'feint') dmg = Math.max(2, Math.floor(dmg * 0.55));
    if (this._enemy.intent === 'guard') {
      this._enemy.focus = clamp(this._enemy.focus + 8, 0, 100);
      this._enemy.pressure = clamp(this._enemy.pressure - 4, 0, 100);
      this._logPush('Enemy guarded and recovered.');
    } else {
      const dealt = Math.max(1, Math.round(dmg * guard));
      this._logPush(fromMissedFlee ? `Enemy punished the failed escape for ${dealt}.` : `Enemy strikes for ${dealt}.`);
      applyDamage(this.state, dealt, Math.ceil(dealt * 0.35), Math.ceil(dealt * 0.18), 4 + Math.ceil(dealt * 0.2));
      this.player.anims.play('shaia-hurt', true);
      this._playHit(this.player, 'shaia-hurt', -10, -4);
      if (this.state.settings.shake) this.cameras.main.shake(60, 0.004);
      this.time.delayedCall(120, () => this.player.anims.play('shaia-idle', true));
    }

    this._player.guard = false;
    this.state.pressure = clamp(this.state.pressure + (this._enemy.intent === 'heavy' ? 4 : 2), 0, 100);
    this.state.battleDebt = Math.max(0, Number(this.state.battleDebt || 0) + (fromMissedFlee ? 1 : 0));
    this._refreshAll();
    saveState(this.state);
    if (this._checkEnd()) return;

    this._state = 'player';
    this._turnText = 'YOUR TURN';
    this.time.delayedCall(260, () => {
      this._busy = false;
      this._refreshAll();
    });
  }

  _checkEnd() {
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
    this._showResult('Victory', 'The route is clear. Returning to the corridor...', 0x13301a);
    saveState(this.state);
    this.time.delayedCall(1300, () => sceneToNext(this, 'CorridorScene', { state: this.state, spawnX: this.returnX || 180 }));
  }

  _finishDefeat() {
    if (this._ended) return;
    this._ended = true;
    this.state.defeats = Math.max(0, Number(this.state.defeats || 0) + 1);
    this.state.battleDebt = Math.max(0, Number(this.state.battleDebt || 0) + 1);
    this.state.pressure = clamp(this.state.pressure + 22, 0, 100);
    this.state.maxSta = clamp(this.state.maxSta - 8, 40, 100);
    this.state.maxWil = clamp(this.state.maxWil - 5, 40, 100);
    this.state.hp = clamp(Math.max(1, Math.floor(this.state.maxHp * 0.62)), 1, this.state.maxHp);
    this.state.sta = clamp(Math.max(1, Math.floor(this.state.maxSta * 0.55)), 1, this.state.maxSta);
    this.state.wil = clamp(Math.max(1, Math.floor(this.state.maxWil * 0.55)), 1, this.state.maxWil);
    this.state.objective = 'Recover in the bedroom and rebuild your route.';
    this._showResult('Defeat', 'You were forced back to the bedroom.', 0x30141a);
    saveState(this.state);
    this.time.delayedCall(1500, () => sceneToNext(this, 'BedroomScene', { state: this.state, spawnX: 220 }));
  }

  _showResult(title, hint, color = 0x180c14) {
    if (!this.resultPanel) {
      this.resultPanel = this.add.container(this.scale.width / 2, this.scale.height / 2).setScrollFactor(0).setDepth(9000);
      this.resultPanelBg = this.add.rectangle(0, 0, 540, 210, color, 0.95).setStrokeStyle(3, 0xffd2f1, 0.6);
      this.resultTitle = this.add.text(0, -24, title, { fontSize: '28px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
      this.resultHint = this.add.text(0, 26, hint, { fontSize: '15px', color: '#f0e6f0', align: 'center', wordWrap: { width: 470 } }).setOrigin(0.5);
      this.resultPanel.add([this.resultPanelBg, this.resultTitle, this.resultHint]);
    } else {
      this.resultPanelBg.fillColor = color;
      this.resultTitle.setText(title);
      this.resultHint.setText(hint);
    }
  }
}
