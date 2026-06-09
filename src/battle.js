import {
  applyDamage,
  clamp,
  createBackdrop,
  createTextButton,
  makeMeter,
  modifyCorruption,
  playEffect,
  rewardBattle,
  sceneToNext,
  saveState,
  spawnAmbient,
  spawnFloatingText,
  keyFor, normalizeState
} from './util.js';

const HERO = keyFor('ruin_runners_shaia/sprites/shaia/sprites_common/common_00_idle_stand_A01.png');
const HERO_GUARD = keyFor('ruin_runners_shaia/sprites/shaia/sprites_common/common_31_guard_stand01.png');
const HERO_HURT = keyFor('ruin_runners_shaia/sprites/shaia/sprites_damage/damage_01_damage_head.png');
const HERO_ATTACK = keyFor('ruin_runners_shaia/sprites/shaia/sprites_attack/attack_01_cobination0101.png');
const SKELETON = keyFor('ruin_runners_shaia/sprites/skeleton/common_01_idle01.png');
const SKELETON_ATTACK = keyFor('ruin_runners_shaia/sprites/skeleton/attack_01_sword01.png');
const SKELETON_HURT = keyFor('ruin_runners_shaia/sprites/skeleton/damage_01_damage_head.png');

export class BattleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BattleScene' });
  }

  init(data = {}) {
    this.state = normalizeState(data.state);
    this.state.sceneKey = 'BattleScene';
    this.state.room = 'Battle';
    this.encounter = data.encounter || { kind: 'patrol', label: 'Skeleton Sentinel', hp: 66, dmg: 10, speed: 60 };
    this.returnX = Number(data.returnX || 220);
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    createBackdrop(this, {
      mode: 'battle',
      title: 'DUEL',
      subtitle: `${this.encounter.label} blocks the route.`,
      corruption: this.state.corruption
    });
    spawnAmbient(this, { count: 12, mode: 'battle' });

    this.input.addPointer(3);
    this.physics.world.setBounds(0, 0, W, H);

    this._ended = false;
    this._phase = 'player';
    this._busy = false;
    this._playerGuard = false;
    this._playerCharge = 0;
    this._playerGrace = 0;
    this._enemyGuard = false;
    this._enemy = {
      hp: this.encounter.hp,
      maxHp: this.encounter.hp,
      dmg: this.encounter.dmg,
      intent: 'strike',
      pressure: 0
    };
    this._log = [];

    this.player = this.add.image(270, 448, HERO).setScale(1.08).setOrigin(0.5, 0.96).setTint(0xffd7ef);
    this.playerAura = this.add.ellipse(270, 468, 240, 410, 0xcd68b0, 0.12);
    this.enemy = this.add.image(1015, 446, SKELETON).setScale(1.08).setOrigin(0.5, 0.96).setTint(0xd2d0ff);
    this.enemyAura = this.add.ellipse(1015, 468, 220, 390, 0x8a5cab, 0.12);

    this.add.rectangle(W / 2, 510, W, 250, 0x0c0810, 0.70);
    this.add.rectangle(W / 2, 510, W, 8, 0xf1c7ff, 0.16);

    this.title = this.add.text(24, 18, 'DUEL', { fontSize: '28px', color: '#fff', fontStyle: 'bold' }).setScrollFactor(0);
    this.sub = this.add.text(24, 50, '', { fontSize: '14px', color: '#dfd3e3' }).setScrollFactor(0);
    this.turnText = this.add.text(W / 2, 26, 'YOUR TURN', { fontSize: '22px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5).setScrollFactor(0);

    this.hpMeter = makeMeter(this, 24, 88, 260, 'HP', 0xf27da8);
    this.staMeter = makeMeter(this, 24, 116, 260, 'STA', 0x7fcdfc);
    this.wilMeter = makeMeter(this, 24, 144, 260, 'WIL', 0xc5f07b);
    this.corMeter = makeMeter(this, 24, 172, 260, 'CORR', 0xd871cc);

    this.enemyHp = makeMeter(this, 945, 88, 260, 'ENEMY HP', 0xee847a);
    this.enemySta = makeMeter(this, 945, 116, 260, 'ENEMY FURY', 0xf0b86f);
    this.enemyMind = makeMeter(this, 945, 144, 260, 'ENEMY WARD', 0xb89df3);

    this.logPanel = this.add.rectangle(W / 2, 612, 1200, 92, 0x130813, 0.90).setStrokeStyle(2, 0xf3c7ff, 0.34);
    this.logText = this.add.text(60, 572, '', {
      fontSize: '15px',
      color: '#fff',
      wordWrap: { width: 1160 },
      lineSpacing: 4
    });

    this.actions = ['Slash', 'Guard', 'Focus', 'Rite', 'Embrace', 'Item'];
    this.buttons = [];
    const startX = 150;
    const gap = 165;
    this.actions.forEach((label, i) => {
      const btn = createTextButton(this, startX + i * gap, 684, 148, 52, `${i + 1}. ${label}`, () => this.chooseAction(i), {
        fill: i === 0 ? 0x5c294f : 0x281b33,
        stroke: 0xf3c7ff,
        fontSize: '15px'
      });
      this.buttons.push(btn);
    });

    this.input.keyboard.on('keydown-ONE', () => this.chooseAction(0));
    this.input.keyboard.on('keydown-TWO', () => this.chooseAction(1));
    this.input.keyboard.on('keydown-THREE', () => this.chooseAction(2));
    this.input.keyboard.on('keydown-FOUR', () => this.chooseAction(3));
    this.input.keyboard.on('keydown-FIVE', () => this.chooseAction(4));
    this.input.keyboard.on('keydown-SIX', () => this.chooseAction(5));
    this.input.keyboard.on('keydown-ESC', () => this.chooseAction(1));

    this._pushLog(`A ${this.encounter.label} bars the route.`);
    this._refreshUI();
    saveState(this.state);
    this.time.delayedCall(280, () => this.chooseEnemyIntent());
  }

  _pushLog(text) {
    if (!text) return;
    this._log.push(text);
    if (this._log.length > 7) this._log.shift();
    this._refreshUI();
  }

  _refreshUI(extra = '') {
    this.sub.setText(`Day ${this.state.day} • Corruption ${Math.round(this.state.corruption)} • Gold ${this.state.gold} • Relics ${this.state.relics}`);
    this.turnText.setText(this._phase === 'player' ? 'YOUR TURN' : 'ENEMY TURN');
    this.hpMeter.set(this.state.hp, this.state.maxHp);
    this.staMeter.set(this.state.sta, this.state.maxSta);
    this.wilMeter.set(this.state.wil, this.state.maxWil);
    this.corMeter.set(this.state.corruption, this.state.maxCorruption);

    this.enemyHp.set(this._enemy.hp, this._enemy.maxHp);
    this.enemySta.set(this._enemy.pressure, 100);
    this.enemyMind.set(this._enemyGuard ? 100 : 0, 100);

    const lines = this._log.slice(-4);
    if (extra) lines.push(extra);
    this.logText.setText(lines.join('\n'));
  }

  chooseAction(index) {
    if (this._ended || this._phase !== 'player' || this._busy) return;
    this._busy = true;

    const actions = [
      () => this.attack(),
      () => this.guard(),
      () => this.focus(),
      () => this.rite(),
      () => this.embrace(),
      () => this.useItem()
    ];
    const fn = actions[index] || actions[0];
    fn();
  }

  attack() {
    this._phase = 'player';
    this.turnText.setText('YOUR TURN — SLASH');
    this.player.anims.play('shaia-attack-1', true);
    playEffect(this, 'fx-hit', this.player.x + 98, this.player.y - 16, { scale: 0.9, life: 520 });
    this.time.delayedCall(200, () => {
      const corruptionBonus = Math.floor(this.state.corruption / 22);
      const focusBonus = Math.floor(this._playerCharge / 2);
      const emoteBonus = this._playerGrace > 0 ? 5 : 0;
      let damage = 10 + corruptionBonus + focusBonus + emoteBonus;
      if (this._playerCharge > 0) damage += 4;
      if (this._enemyGuard) damage = Math.max(2, Math.floor(damage * 0.72));
      this._enemy.hp = clamp(this._enemy.hp - damage, 0, this._enemy.maxHp);
      this.state.sta = clamp(this.state.sta - 6, 0, this.state.maxSta);
      this.state.wil = clamp(this.state.wil - 1, 0, this.state.maxWil);
      this._playerCharge = Math.max(0, this._playerCharge - 1);
      this._playerGrace = Math.max(0, this._playerGrace - 1);
      this._enemyGuard = false;
      this._pushLog(`Slash deals ${damage} damage.`);
      if (this.state.settings.shake) this.cameras.main.shake(40, 0.0025);
      this.player.anims.play('shaia-idle', true);
      this._finishPlayerTurn();
    });
  }

  guard() {
    this._phase = 'player';
    this.turnText.setText('YOUR TURN — GUARD');
    this.player.anims.play('shaia-guard', true);
    this._playerGuard = true;
    this.state.wil = clamp(this.state.wil + 4, 0, this.state.maxWil);
    this.state.sta = clamp(this.state.sta + 5, 0, this.state.maxSta);
    this._pushLog('Guard up. The next hit will land softer.');
    playEffect(this, 'fx-guard', this.player.x + 22, this.player.y - 36, { scale: 0.8, life: 500 });
    this._finishPlayerTurn();
  }

  focus() {
    this._phase = 'player';
    this.turnText.setText('YOUR TURN — FOCUS');
    this.state.sta = clamp(this.state.sta + 18, 0, this.state.maxSta);
    this.state.wil = clamp(this.state.wil + 10, 0, this.state.maxWil);
    this._playerCharge = Math.min(3, this._playerCharge + 1);
    this._playerGrace = Math.min(3, this._playerGrace + 1);
    this._pushLog('Focus sharpens the next strike.');
    spawnFloatingText(this, 260, 382, '+FOCUS', { color: '#d0e8ff' });
    this._finishPlayerTurn();
  }

  rite() {
    this._phase = 'player';
    this.turnText.setText('YOUR TURN — RITE');
    const cleanse = this.state.corruption >= 16;
    if (cleanse) {
      const removed = modifyCorruption(this.state, -16);
      this.state.wil = clamp(this.state.wil + 10, 0, this.state.maxWil);
      this.state.hp = clamp(this.state.hp + 6, 0, this.state.maxHp);
      this._pushLog('The rite cuts away corruption.');
      spawnFloatingText(this, 260, 382, `${removed < 0 ? '' : ''}-CORRUPTION`, { color: '#c9ffd9' });
      playEffect(this, 'fx-fire-banish', this.player.x + 40, this.player.y - 18, { scale: 0.86, life: 620 });
    } else {
      this.state.wil = clamp(this.state.wil + 14, 0, this.state.maxWil);
      this._pushLog('A small rite steadies the hand.');
      playEffect(this, 'fx-twinkle', this.player.x + 28, this.player.y - 24, { scale: 0.7, life: 420 });
    }
    this._finishPlayerTurn();
  }

  embrace() {
    this._phase = 'player';
    this.turnText.setText('YOUR TURN — EMBRACE');
    modifyCorruption(this.state, 12);
    this.state.wil = clamp(this.state.wil - 4, 0, this.state.maxWil);
    this._playerCharge = Math.min(4, this._playerCharge + 2);
    this._playerGrace = Math.min(4, this._playerGrace + 1);
    this._pushLog('The fall fuels your next attack.');
    spawnFloatingText(this, 260, 382, '+CORRUPTION', { color: '#ffd4ef' });
    playEffect(this, 'fx-fire-loop', this.player.x + 42, this.player.y - 18, { scale: 0.8, life: 500 });
    this._finishPlayerTurn();
  }

  useItem() {
    this._phase = 'player';
    this.turnText.setText('YOUR TURN — ITEM');
    if (this.state.apples > 0) {
      this.state.apples -= 1;
      this.state.hp = clamp(this.state.hp + 24, 0, this.state.maxHp);
      this.state.sta = clamp(this.state.sta + 10, 0, this.state.maxSta);
      this.state.corruption = clamp(this.state.corruption - 4, 0, this.state.maxCorruption);
      this._pushLog('You eat an apple and recover.');
      playEffect(this, 'fx-coin', this.player.x + 32, this.player.y - 30, { scale: 0.55, life: 450 });
    } else {
      this._pushLog('No apples left.');
    }
    this._finishPlayerTurn();
  }

  _finishPlayerTurn() {
    saveState(this.state);
    this._refreshUI();
    if (this._checkEnd()) return;
    this._phase = 'enemy';
    this.time.delayedCall(320, () => this.chooseEnemyIntent());
  }

  chooseEnemyIntent() {
    if (this._ended) return;
    if (this._phase === 'player') {
      this._phase = 'enemy';
    }

    const intents = ['strike', 'strike', 'guard', 'hex', 'bind'];
    if (this.state.corruption > 50) intents.push('hex', 'strike');
    if (this.state.defeats > 0) intents.push('bind');
    this._enemy.intent = intents[Phaser.Math.Between(0, intents.length - 1)];
    this.turnText.setText('ENEMY TURN');
    this._refreshUI(`Enemy intent: ${this._enemy.intent.toUpperCase()}`);
    this.time.delayedCall(520, () => this.resolveEnemyTurn());
  }

  resolveEnemyTurn() {
    if (this._ended) return;

    if (this._enemy.intent === 'guard') {
      this._enemyGuard = true;
      this._enemy.pressure = clamp(this._enemy.pressure - 10, 0, 100);
      this._pushLog('The enemy braces behind its guard.');
      playEffect(this, 'fx-guard', this.enemy.x - 22, this.enemy.y - 26, { scale: 0.8, life: 500 });
    } else {
      let damage = this._enemy.dmg;
      let staLoss = 4;
      let wilLoss = 2;
      let corruptionGain = 2;

      if (this._enemy.intent === 'hex') {
        damage = Math.floor(damage * 0.68);
        wilLoss = 9;
        corruptionGain = 8;
      } else if (this._enemy.intent === 'bind') {
        damage = Math.floor(damage * 0.82);
        staLoss = 12;
        corruptionGain = 4;
      }

      if (this._playerGuard) damage = Math.max(1, Math.floor(damage * 0.55));
      if (this._playerGrace > 0) damage = Math.max(1, damage - 2);

      applyDamage(this.state, damage, staLoss, wilLoss, corruptionGain);
      this._pushLog(`Enemy ${this._enemy.intent} deals ${damage}.`);
      this.enemy.anims.play('skeleton-attack', true);
      this.player.anims.play('shaia-hurt', true);
      playEffect(this, 'fx-hit', this.player.x + 72, this.player.y - 22, { scale: 0.9, life: 520 });
      if (this.state.settings.shake) this.cameras.main.shake(55, 0.0032);
      this.time.delayedCall(180, () => this.player.anims.play('shaia-idle', true));
      this._playerGuard = false;
    }

    this._enemy.pressure = clamp(this._enemy.pressure + 8, 0, 100);
    this._phase = 'player';
    this._enemyGuard = false;
    saveState(this.state);
    this._refreshUI();
    if (this._checkEnd()) return;
    this.turnText.setText('YOUR TURN');
    this._busy = false;
  }

  _checkEnd() {
    if (this._enemy.hp <= 0) {
      this.finishVictory();
      return true;
    }
    if (this.state.hp <= 0) {
      this.finishDefeat();
      return true;
    }
    return false;
  }

  finishVictory() {
    if (this._ended) return;
    this._ended = true;
    this.state.flags.corridorCleared = true;
    rewardBattle(this.state, {
      gold: 34 + Math.floor(this.state.day * 6),
      relics: 1,
      hp: 10,
      sta: 12,
      wil: 8,
      corruption: -10,
      kills: 1
    });
    this.state.objective = 'The corridor opens. Return to the sanctum or push deeper.';
    saveState(this.state);
    this._showEnd('Victory', 'The gate breaks and the route opens.', 0x12301f);
    this.time.delayedCall(1200, () => sceneToNext(this, 'CorridorScene', { state: this.state, spawnX: this.returnX || 220 }));
  }

  finishDefeat() {
    if (this._ended) return;
    this._ended = true;
    this.state.defeats += 1;
    this.state.corruption = clamp(this.state.corruption + 14, 0, this.state.maxCorruption);
    this.state.maxSta = Math.max(40, this.state.maxSta - 5);
    this.state.maxWil = Math.max(40, this.state.maxWil - 4);
    this.state.hp = Math.max(1, Math.floor(this.state.maxHp * 0.62));
    this.state.sta = Math.max(1, Math.floor(this.state.maxSta * 0.56));
    this.state.wil = Math.max(1, Math.floor(this.state.maxWil * 0.56));
    this.state.objective = 'Recover in the sanctum and try again.';
    saveState(this.state);
    this._showEnd('Defeat', 'The route forces you back to the sanctum.', 0x34121a);
    this.time.delayedCall(1400, () => sceneToNext(this, 'BedroomScene', { state: this.state }));
  }

  _showEnd(title, body, color = 0x180c14) {
    const W = this.scale.width;
    const H = this.scale.height;
    this.add.container(0, 0).setDepth(9400);
    const panel = this.add.rectangle(W / 2, H / 2, 560, 200, color, 0.96).setStrokeStyle(3, 0xf3c7ff, 0.52).setDepth(9401);
    const t = this.add.text(W / 2, H / 2 - 28, title, { fontSize: '28px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5).setDepth(9402);
    const b = this.add.text(W / 2, H / 2 + 20, body, { fontSize: '15px', color: '#f2e6f2', wordWrap: { width: 500 }, align: 'center' }).setOrigin(0.5).setDepth(9402);
    this.tweens.add({
      targets: [panel, t, b],
      alpha: { from: 0, to: 1 },
      duration: 220
    });
  }
}
