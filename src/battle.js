import {
  normalizeState, saveState, clamp, keyFor,
  makeMeter, createButton, makePanel,
  corruptionTier, applyCorruption, applyDamage, applyArousal,
  isHBound, totalClothingDef, damageClothingLayer, stripFirstIntactLayer,
  applyVictoryReward, applyDefeatConsequences, intactCount,
} from './util.js';
import { SKILLS, ITEMS } from './data.js';

const HERO_IDLE  = keyFor('ruin_runners_shaia/sprites/shaia/sprites_common/common_00_idle_stand_A01.png');
const HERO_ATK1  = keyFor('ruin_runners_shaia/sprites/shaia/sprites_attack/attack_01_cobination0101.png');
const HERO_HURT  = keyFor('ruin_runners_shaia/sprites/shaia/sprites_damage/damage_01_damage_head.png');
const HERO_GUARD = keyFor('ruin_runners_shaia/sprites/shaia/sprites_common/common_31_guard_stand01.png');
const SK_IDLE    = keyFor('ruin_runners_shaia/sprites/skeleton/common_01_idle01.png');
const BG_C       = keyFor('ruin_runners_shaia/sprites/background/sprites_dungeon/02_dungeon_center.png');

// ─── INTENT DEFINITIONS ───────────────────────────────────────────────────────
const INTENT_INFO = {
  strike:     { label: 'STRIKE',     color: '#ff8888', desc: 'Physical attack' },
  heavyStrike:{ label: 'HEAVY',      color: '#ff4444', desc: 'Powerful blow' },
  guard:      { label: 'GUARD',      color: '#88ccff', desc: 'Defending itself' },
  feint:      { label: 'FEINT',      color: '#ffcc44', desc: 'Tricky maneuver' },
  arouse:     { label: 'AROUSE',     color: '#ff44cc', desc: 'Targets willpower' },
  heavyStrip: { label: 'STRIP!',     color: '#ff0088', desc: 'Targets clothing' },
  bind:       { label: 'BIND',       color: '#cc44ff', desc: 'H-Bind attempt' },
  voidPulse:  { label: 'VOID PULSE', color: '#8800ff', desc: 'Dark energy burst' },
};

export class BattleScene extends Phaser.Scene {
  constructor() { super({ key: 'BattleScene' }); }

  init(data = {}) {
    this.state      = normalizeState(data.state);
    this.encounter  = data.encounter;
    this._returnTo  = data.returnTo || 'WorldScene';
    this._ended     = false;
    this._busy      = false;
    this._turn      = 'player';

    // Battle-local enemy object
    this.enemy = {
      hp:          this.encounter.hp,
      maxHp:       this.encounter.hp,
      pressure:    100,
      focus:       40,
      intent:      'strike',
      stunned:     0,
      weakened:    0,
    };

    // Battle-local player buffs
    this.playerBuff = {
      guard:       false,
      veilActive:  false,
      focusBonus:  0,
      bindTurns:   0,   // H-Bind duration (can't attack normally)
    };

    this._log = [];
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    // ── BACKGROUND ─────────────────────────────────────────────────────────
    if (this.textures.exists(BG_C)) {
      this.add.image(W / 2, H / 2, BG_C).setDisplaySize(W, H).setTint(0x0e0518);
    } else {
      this.add.rectangle(W / 2, H / 2, W, H, 0x0a0316);
    }

    // Corruption atmosphere overlay
    const tier = corruptionTier(this.state.corruption);
    this.add.rectangle(W / 2, H / 2, W, H, tier.color, 0.06);
    this.add.rectangle(W / 2, H / 2, W, H, 0x06020c, 0.45);

    // Battle arena frame
    this.add.rectangle(W / 2, 520, W, 260, 0x08030e, 0.88);
    this.add.rectangle(W / 2, 388, W, 4,   0xcc44ff, 0.3);

    // ── TITLE BAR ──────────────────────────────────────────────────────────
    this.add.rectangle(W / 2, 28, W, 56, 0x06020e, 0.92);
    this._turnBanner = this.add.text(W / 2, 15, 'YOUR TURN', {
      fontSize: '22px', color: '#ffd0ff', fontStyle: 'bold',
    }).setOrigin(0.5);
    this._subBanner = this.add.text(W / 2, 40, `${this.encounter.label}  •  Day ${this.state.day}`, {
      fontSize: '13px', color: '#aa88bb',
    }).setOrigin(0.5);

    // ── SPRITES ────────────────────────────────────────────────────────────
    const heroKey = this.textures.exists(HERO_IDLE) ? HERO_IDLE : null;
    if (heroKey) {
      this._heroSprite = this.add.sprite(280, 430, HERO_IDLE).setScale(0.88).setOrigin(0.5, 0.96);
      this._heroSprite.play('hero-idle');
    } else {
      this._heroSprite = this._makeProceduralHero(280, 430);
    }

    const enemyKey = this.textures.exists(this.encounter.spriteKey) ? this.encounter.spriteKey : null;
    this._enemySprite = this.add.image(1000, 420, enemyKey || 'enemy-guard').setScale(0.92).setOrigin(0.5, 0.96);
    this._enemySprite.setFlipX(true);

    // Corruption tint on enemy
    if (this.encounter.id === 'cultistSeducer') this._enemySprite.setTint(0xff88cc);
    if (this.encounter.id === 'shadowBeast')    this._enemySprite.setTint(0x8844ff);
    if (this.encounter.id === 'patronBoss')     this._enemySprite.setTint(0xffaaff);

    // ── STATUS BARS ────────────────────────────────────────────────────────
    this._buildStatusBars(W);

    // ── LOG PANEL ──────────────────────────────────────────────────────────
    this.add.rectangle(W / 2, 615, W - 40, 96, 0x06020e, 0.92).setStrokeStyle(1, 0x7700cc, 0.4);
    this._logText = this.add.text(30, 572, '', {
      fontSize: '14px', color: '#ddd0ee', wordWrap: { width: W - 70 }, lineSpacing: 2,
    });

    // ── CLOTHING STATUS (right side of log) ────────────────────────────────
    this._buildClothingPanel(W, H);

    // ── ACTION BUTTONS ─────────────────────────────────────────────────────
    this._buildActionButtons(W, H);

    // ── INTENT DISPLAY ─────────────────────────────────────────────────────
    this._intentText = this.add.text(870, 200, 'INTENT: ???', {
      fontSize: '14px', color: '#ff88cc', fontStyle: 'bold',
      backgroundColor: '#0a020e99', padding: { x: 6, y: 3 },
    }).setOrigin(0.5);

    // ── KEYBOARD SHORTCUTS ─────────────────────────────────────────────────
    const keys = this.input.keyboard.addKeys('ONE,TWO,THREE,FOUR,FIVE,SIX,ESC');
    keys.ONE.on('down', () => this._chooseAction(0));
    keys.TWO.on('down', () => this._chooseAction(1));
    keys.THREE.on('down', () => this._chooseAction(2));
    keys.FOUR.on('down', () => this._chooseAction(3));
    keys.FIVE.on('down', () => this._chooseAction(4));
    keys.SIX.on('down',  () => this._chooseAction(5));

    // ── BOSS INTRO ─────────────────────────────────────────────────────────
    if (this.encounter.isBoss) {
      this._showBossIntro();
    } else {
      this._logPush(`A ${this.encounter.label} bars your path.`);
      this._logPush(this.encounter.lore);
      this.time.delayedCall(60, () => this._resolveEnemyIntent());
    }

    this._refreshAll();
    this.cameras.main.fadeIn(400, 4, 2, 10);
  }

  // ─── STATUS BARS ───────────────────────────────────────────────────────────
  _buildStatusBars(W) {
    // Player side
    this.add.text(60, 192, 'VERITY', { fontSize: '18px', color: '#fff', fontStyle: 'bold' });
    this._pHp   = makeMeter(this, 60, 218, 280, 'HP',   0xff6688);
    this._pSta  = makeMeter(this, 60, 242, 280, 'STA',  0x44aaff);
    this._pWil  = makeMeter(this, 60, 266, 280, 'WIL',  0xaaffaa);
    this._pCorr = makeMeter(this, 60, 290, 280, 'CORR', 0xcc00ff);
    this._pArou = makeMeter(this, 60, 314, 280, 'AROU', 0xff44bb);

    // Enemy side
    this.add.text(780, 192, this.encounter.label.toUpperCase(), { fontSize: '16px', color: '#fff', fontStyle: 'bold' });
    this._eHp   = makeMeter(this, 780, 218, 280, 'HP',   0xff4444);
    this._ePres = makeMeter(this, 780, 242, 280, 'PRSS', 0xffaa44);
  }

  // ─── CLOTHING PANEL ────────────────────────────────────────────────────────
  _buildClothingPanel(W, H) {
    const cx = W - 190;
    const cy = 570;
    this.add.text(cx, cy - 48, 'CLOTHING', { fontSize: '12px', color: '#aa88bb', fontStyle: 'bold' }).setOrigin(0.5);
    this._clothingTexts = {};
    const slots = ['outer','upper','lower','inner','shoes'];
    const slotLabels = { outer:'CLOAK', upper:'VEST', lower:'SKIRT', inner:'INNER', shoes:'SHOES' };
    slots.forEach((slot, i) => {
      const c = this.state.clothing[slot];
      const col = c.stripped ? '#ff3333' : (c.dur < 40 ? '#ffaa33' : '#88ff88');
      const t = this.add.text(cx, cy - 30 + i * 18, `${slotLabels[slot]}: ${c.stripped ? 'STRIPPED' : Math.round(c.dur) + '%'}`, {
        fontSize: '11px', color: col,
      }).setOrigin(0.5);
      this._clothingTexts[slot] = t;
    });
  }

  _refreshClothingPanel() {
    const slots = ['outer','upper','lower','inner','shoes'];
    const slotLabels = { outer:'CLOAK', upper:'VEST', lower:'SKIRT', inner:'INNER', shoes:'SHOES' };
    slots.forEach(slot => {
      const c = this.state.clothing[slot];
      const col = c.stripped ? '#ff3333' : (c.dur < 40 ? '#ffaa33' : '#88ff88');
      const t = this._clothingTexts[slot];
      if (t) {
        t.setText(`${slotLabels[slot]}: ${c.stripped ? 'STRIPPED' : Math.round(c.dur) + '%'}`);
        t.setColor(col);
      }
    });
  }

  // ─── ACTION BUTTONS ────────────────────────────────────────────────────────
  _buildActionButtons(W, H) {
    const actions = this._getActions();
    this._actionBtns = [];
    const btnW = 172, btnH = 50;
    const startX = 86;
    const y = H - 50;
    const gap = 184;

    actions.forEach((act, i) => {
      const x = startX + i * gap;
      const available = !act.disabled;
      const fill   = available ? (act.corruption ? 0x330044 : 0x1c1030) : 0x0e0814;
      const stroke  = available ? (act.corruption ? 0xcc00ff : 0xaa66cc) : 0x443355;
      const btn = createButton(this, x, y, btnW, btnH, `${i + 1}. ${act.label}`, () => {
        if (!act.disabled) this._chooseAction(i);
      }, { fill, stroke, fontSize: '14px', hoverFill: 0x4a2068 });
      if (!available) btn.t.setAlpha(0.45);
      if (act.corruption) btn.t.setColor('#ff44ff');
      this._actionBtns.push({ btn, act });
    });

    // Hint bar
    this.add.text(W / 2, H - 22, '1–6 Keys / Click to act', {
      fontSize: '12px', color: '#554466',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(6000);
  }

  _getActions() {
    const s = this.state;
    const bound = this.playerBuff.bindTurns > 0;
    const hb    = isHBound(s);

    // Build available skills
    const availableSkills = SKILLS.filter(sk => s.corruption >= sk.minCorruption && s.sta >= sk.staCost);
    const skill = availableSkills[0] || SKILLS.find(sk => s.corruption >= sk.minCorruption);

    const acts = [
      { label: 'Attack',     disabled: bound || hb,        corruption: false },
      { label: 'Heavy',      disabled: bound || hb || s.sta < 14, corruption: false },
      { label: 'Guard',      disabled: bound,               corruption: false },
      { label: 'Focus',      disabled: false,               corruption: false },
      { label: skill ? skill.label : 'Skill',
        disabled: !skill || s.corruption < (skill?.minCorruption||99) || s.sta < (skill?.staCost||99),
        corruption: !!skill  },
      { label: 'Item',       disabled: Object.values(s.items).every(v => v <= 0), corruption: false },
      { label: 'Flee',       disabled: false,               corruption: false },
    ];

    // If H-Bound: limited options
    if (hb) {
      acts[0].label    = 'Struggle';
      acts[0].disabled = false;
      acts[1].disabled = true;
    }

    // If Flash Flask available, show it prominently when bound
    if (bound && s.items.flashFlask > 0) {
      acts[5].label    = 'Flash Flask!';
      acts[5].disabled = false;
    }

    return acts.slice(0, 6);
  }

  _rebuildButtons() {
    this._actionBtns.forEach(b => b.btn.g.destroy());
    this._actionBtns = [];
    const W = this.scale.width;
    const H = this.scale.height;
    this._buildActionButtons(W, H);
  }

  // ─── REFRESH ALL DISPLAYS ──────────────────────────────────────────────────
  _refreshAll(msg = '') {
    const s = this.state;
    this._pHp.set(s.hp,   s.maxHp);
    this._pSta.set(s.sta, s.maxSta);
    this._pWil.set(s.wil, s.maxWil);
    this._pCorr.set(s.corruption, 100);
    this._pArou.set(s.arousal,    100);
    this._eHp.set(this.enemy.hp,       this.enemy.maxHp);
    this._ePres.set(this.enemy.pressure, 100);
    this._refreshClothingPanel();
    this._refreshIntent();
    if (msg) this._logPush(msg);
    this._updateSubBanner();
  }

  _updateSubBanner() {
    const tier = corruptionTier(this.state.corruption);
    const hb   = isHBound(this.state) ? '  ⚠ H-BOUND' : '';
    const bound = this.playerBuff.bindTurns > 0 ? '  ⛓ BOUND' : '';
    this._subBanner.setText(`${this.encounter.label}  •  ${tier.label}${hb}${bound}`);
  }

  _refreshIntent() {
    const info = INTENT_INFO[this.enemy.intent] || INTENT_INFO.strike;
    this._intentText.setText(`INTENT: ${info.label}\n${info.desc}`);
    this._intentText.setColor(info.color);
  }

  _logPush(msg) {
    if (!msg) return;
    this._log.push(msg);
    if (this._log.length > 5) this._log.shift();
    if (this._logText) this._logText.setText(this._log.slice(-4).join('\n'));
  }

  // ─── PLAYER ACTIONS ────────────────────────────────────────────────────────
  _chooseAction(index) {
    if (this._ended || this._busy || this._turn !== 'player') return;
    const acts = this._getActions();
    const act  = acts[index];
    if (!act || act.disabled) return;
    this._busy = true;

    switch (index) {
      case 0: return isHBound(this.state) ? this._playerStruggle() : this._playerAttack(false);
      case 1: return this._playerAttack(true);   // Heavy
      case 2: return this._playerGuard();
      case 3: return this._playerFocus();
      case 4: return this._playerSkill();
      case 5: return this._playerItem();
      case 6: return this._playerFlee();
      default: this._busy = false;
    }
  }

  _playerAttack(heavy = false) {
    const s = this.state;
    const attackKey = heavy ? 'hero-atk2' : 'hero-atk1';
    if (this._heroSprite?.anims) this._heroSprite.play(attackKey, true);

    this.time.delayedCall(180, () => {
      const base = heavy ? 18 : 11;
      const focBonus = Math.floor(this.playerBuff.focusBonus / 2.5);
      const tier = corruptionTier(s.corruption);
      const corrBonus = tier.tier;
      let dmg = base + focBonus + corrBonus + Math.floor(s.day * 0.8);

      // Enemy guard reduces damage
      if (this.enemy.intent === 'guard') dmg = Math.round(dmg * 0.55);
      if (this.enemy.weakened > 0)        dmg = Math.round(dmg * 1.25);
      dmg = Math.max(1, dmg);

      this.enemy.hp = clamp(this.enemy.hp - dmg, 0, this.enemy.maxHp);
      if (heavy) s.sta = clamp(s.sta - 14, 0, s.maxSta);
      else       s.sta = clamp(s.sta - 5,  0, s.maxSta);

      this.playerBuff.focusBonus = 0;
      this.playerBuff.guard = false;

      // Shake enemy on hit
      if (s.settings.shake) this.cameras.main.shake(40, 0.004);
      this._tweenHit(this._enemySprite);
      if (this._heroSprite?.anims) {
        this.time.delayedCall(220, () => { if (!this._ended) this._heroSprite.play('hero-idle', true); });
      }

      this._logPush(`Verity ${heavy ? 'heavy strikes' : 'attacks'} for ${dmg} damage.`);
      this._refreshAll();
      this._finishPlayerTurn();
    });
  }

  _playerStruggle() {
    // H-Bound struggle: chance to break free
    const s = this.state;
    const breakChance = 0.35 + (s.wil / s.maxWil) * 0.3;
    if (Math.random() < breakChance) {
      this.playerBuff.bindTurns = 0;
      s.arousal = clamp(s.arousal - 20, 0, 100);
      this._logPush('You struggle free from the H-Bind!');
    } else {
      applyArousal(s, 8);
      this._logPush('You struggle but remain bound... arousal rises.');
    }
    this._refreshAll();
    this._finishPlayerTurn();
  }

  _playerGuard() {
    this.playerBuff.guard = true;
    this.state.sta = clamp(this.state.sta + 8, 0, this.state.maxSta);
    this.state.wil = clamp(this.state.wil + 3, 0, this.state.maxWil);
    if (this._heroSprite?.anims) this._heroSprite.play('hero-guard', true);
    this._logPush('Guard raised — incoming damage halved, stamina recovered.');
    this._refreshAll();
    this._finishPlayerTurn();
  }

  _playerFocus() {
    this.playerBuff.focusBonus = clamp(this.playerBuff.focusBonus + 22, 0, 80);
    this.state.sta = clamp(this.state.sta + 12, 0, this.state.maxSta);
    this.state.wil = clamp(this.state.wil + 5,  0, this.state.maxWil);
    this.state.arousal = clamp(this.state.arousal - 10, 0, 100); // Redirect arousal into focus
    this._logPush('Focus sharpens. Arousal redirected. Next attack empowered.');
    this._refreshAll();
    this._finishPlayerTurn();
  }

  _playerSkill() {
    const s = this.state;
    const tier = corruptionTier(s.corruption);
    const available = SKILLS.filter(sk => s.corruption >= sk.minCorruption && s.sta >= sk.staCost);
    if (!available.length) {
      this._logPush('No skills available at current corruption level.');
      this._busy = false;
      return;
    }
    const skill = available[available.length - 1]; // highest tier unlocked
    s.sta = clamp(s.sta - skill.staCost, 0, s.maxSta);
    const msg = skill.effect(s, this);
    this._logPush(`[${tier.label}] ${msg}`);
    this._refreshAll();
    this._finishPlayerTurn();
  }

  _playerItem() {
    const s = this.state;
    // Priority: flash flask if bound, else healing potion, else holy water
    let used = false;
    let msg = '';

    if (this.playerBuff.bindTurns > 0 && s.items.flashFlask > 0) {
      s.items.flashFlask -= 1;
      const effect = ITEMS.flashFlask.effect(s, this);
      this.enemy.stunned = Math.max(this.enemy.stunned, 1);
      this.playerBuff.bindTurns = 0;
      msg = effect;
      used = true;
    } else if (s.items.healingPotion > 0) {
      s.items.healingPotion -= 1;
      msg = ITEMS.healingPotion.effect(s);
      used = true;
    } else if (s.items.flashFlask > 0) {
      s.items.flashFlask -= 1;
      msg = ITEMS.flashFlask.effect(s, this);
      this.enemy.stunned = Math.max(this.enemy.stunned, 1);
      used = true;
    } else if (s.items.holyWater > 0 && !this.encounter.isBoss) {
      s.items.holyWater -= 1;
      msg = ITEMS.holyWater.effect(s);
      used = true;
    } else if (s.items.holyWater > 0 && this.encounter.isBoss) {
      // Holy Water deals bonus damage to Patron
      s.items.holyWater -= 1;
      const bonusDmg = 30;
      this.enemy.hp = clamp(this.enemy.hp - bonusDmg, 0, this.enemy.maxHp);
      msg = ITEMS.holyWater.effect(s) + ` Holy Water scalds the Patron for ${bonusDmg} extra damage!`;
      used = true;
    }

    if (!used) {
      this._logPush('No usable items available.');
      this._busy = false;
      return;
    }

    this._logPush(msg);
    this._refreshAll();
    this._finishPlayerTurn();
  }

  _playerFlee() {
    const s = this.state;
    const chance = 0.40 + (s.sta / s.maxSta) * 0.25 - (s.pressure / 100) * 0.1;
    if (Math.random() < chance) {
      s.pressure = clamp(s.pressure + 4, 0, 100);
      s.arousal  = 0;
      this._logPush('You retreat from the fight.');
      saveState(s);
      this._ended = true;
      this._showOutcome('Retreat', 'You escape — but the encounter lingers.', 0x182038);
      this.time.delayedCall(1200, () => this._returnToWorld({ outcome: 'flee' }));
    } else {
      s.pressure = clamp(s.pressure + 6, 0, 100);
      this._logPush('Escape failed — enemy retaliates!');
      this._refreshAll();
      this._busy = false;
      this._turn = 'enemy';
      this.time.delayedCall(300, () => this._resolveEnemyTurn(true));
    }
  }

  _finishPlayerTurn() {
    if (this._checkEnd()) return;
    this._turn = 'enemy';
    this.time.delayedCall(360, () => this._resolveEnemyIntent());
  }

  // ─── ENEMY AI ──────────────────────────────────────────────────────────────
  _resolveEnemyIntent() {
    if (this._ended) return;
    const intents = [...this.encounter.intents];

    // Pressure-based escalation
    if (this.state.pressure > 60) intents.push('heavyStrike');
    if (this.state.corruption > 40 && this.encounter.arousalAttack) intents.push('arouse');
    if (intactCount(this.state.clothing) > 0 && this.encounter.stripChance > 0.3) intents.push('heavyStrip');

    // Stunned: can't act
    if (this.enemy.stunned > 0) {
      this.enemy.intent = 'guard';
      this.enemy.stunned -= 1;
    } else {
      this.enemy.intent = Phaser.Math.RND.pick(intents);
    }

    this._turnBanner.setText('ENEMY TURN');
    this._refreshAll();
    this.time.delayedCall(500, () => this._resolveEnemyTurn(false));
  }

  _resolveEnemyTurn(punishFlee = false) {
    if (this._ended) return;
    const s = this.state;
    const intent = this.enemy.intent;
    const guard  = this.playerBuff.guard ? 0.45 : 1.0;
    const veil   = this.playerBuff.veilActive ? 0.2 : 1.0;
    const weakMod = this.enemy.weakened > 0 ? 0.75 : 1.0;

    if (this.enemy.weakened > 0) this.enemy.weakened--;
    this.playerBuff.guard = false;
    this.playerBuff.veilActive = false;

    let strippedLayer = null;

    switch (intent) {
      case 'guard':
        this.enemy.pressure = clamp(this.enemy.pressure + 8, 0, 100);
        this._logPush(`${this.encounter.label} guards and regains pressure.`);
        break;

      case 'feint': {
        const dmg = Math.max(1, Math.round(this.encounter.atk * 0.55 * guard * veil * weakMod));
        applyDamage(s, dmg, 3, 2, 2);
        this._tweenHit(this._heroSprite);
        this._logPush(`${this.encounter.label} feints — deals ${dmg} damage.`);
        break;
      }

      case 'heavyStrike': {
        const dmg = Math.max(2, Math.round((this.encounter.atk + 8) * guard * veil * weakMod));
        applyDamage(s, dmg, 6, 4, 5);
        this._tweenHit(this._heroSprite);
        if (s.settings.shake) this.cameras.main.shake(80, 0.006);
        this._logPush(`${this.encounter.label} heavy strikes for ${dmg} damage!`);
        // Chance to also strip clothing on heavy hit
        if (Math.random() < this.encounter.stripChance * 0.6) {
          strippedLayer = this._doStripAttack(s);
        }
        break;
      }

      case 'arouse':
        if (this.encounter.arousalAttack) {
          const aroAmount = 18 + Math.floor(s.sensitivity / 5);
          applyArousal(s, aroAmount);
          s.wil = clamp(s.wil - 6, 0, s.maxWil);
          this._logPush(`${this.encounter.label}'s touch inflicts arousal (+${aroAmount}). WIL weakened.`);
          if (isHBound(s)) this._logPush('⚠ H-BOUND — Arousal maxed. Normal attacks are disabled for 2 turns!');
        }
        break;

      case 'heavyStrip': {
        const dmg = Math.max(1, Math.round(this.encounter.atk * 0.7 * veil * weakMod));
        applyDamage(s, dmg, 4, 3, 3);
        strippedLayer = this._doStripAttack(s);
        this._tweenHit(this._heroSprite);
        this._logPush(`${this.encounter.label} tears at your clothing!`);
        break;
      }

      case 'bind':
        if (this.encounter.bindAttack) {
          this.playerBuff.bindTurns = 2;
          applyArousal(s, 25 + Math.floor(s.sensitivity / 4));
          this._logPush(`⛓ ${this.encounter.label} binds you! Use Flash Flask or Struggle to break free.`);
        }
        break;

      case 'voidPulse': {
        const dmg = Math.max(3, Math.round((this.encounter.atk + 14) * veil * weakMod));
        applyDamage(s, dmg, 8, 8, 8);
        applyCorruption(s, 6);
        this._tweenHit(this._heroSprite);
        if (s.settings.shake) this.cameras.main.shake(100, 0.008);
        this._logPush(`Void Pulse hits for ${dmg} damage! Corruption seeps in (+6).`);
        break;
      }

      default: {
        // Standard strike
        const dmg = Math.max(1, Math.round(this.encounter.atk * guard * veil * weakMod * (punishFlee ? 1.2 : 1)));
        applyDamage(s, dmg, 4, 2, 3);
        this._tweenHit(this._heroSprite);
        this._logPush(punishFlee ? `Punished for fleeing: ${dmg} damage.` : `${this.encounter.label} strikes for ${dmg} damage.`);
        break;
      }
    }

    // Random strip chance on any offensive move
    if (!strippedLayer && ['strike','heavyStrike','voidPulse'].includes(intent) && Math.random() < this.encounter.stripChance * 0.3) {
      strippedLayer = this._doStripAttack(s);
    }

    if (strippedLayer) {
      this._logPush(`★ ${strippedLayer} was torn away! Vulnerability increases.`);
      if (s.settings.shake) this.cameras.main.shake(60, 0.005);
    }

    // Bind countdown
    if (this.playerBuff.bindTurns > 0) this.playerBuff.bindTurns--;

    this._refreshAll();
    saveState(s);

    if (this._checkEnd()) return;

    this._turn = 'player';
    this._turnBanner.setText('YOUR TURN');
    this.time.delayedCall(260, () => {
      this._rebuildButtons();
      this._busy = false;
    });
  }

  _doStripAttack(s) {
    // Target the outermost intact layer
    for (const slot of ['outer','upper','lower','inner','shoes']) {
      if (!s.clothing[slot].stripped) {
        const dmg = Phaser.Math.Between(25, 55);
        const stripped = damageClothingLayer(s, slot, dmg);
        return stripped; // name if stripped, null if only damaged
      }
    }
    return null;
  }

  // ─── END CHECK ─────────────────────────────────────────────────────────────
  _checkEnd() {
    if (this.enemy.hp <= 0) { this._victory(); return true; }
    if (this.state.hp <= 0) { this._defeat();  return true; }
    return false;
  }

  // ─── VICTORY ───────────────────────────────────────────────────────────────
  _victory() {
    if (this._ended) return;
    this._ended = true;

    const reward = { ...this.encounter.reward, gold: Math.round(this.encounter.reward.gold * (1 + this.state.day * 0.1)) };
    applyVictoryReward(this.state, reward);

    // Boss-specific consequence
    if (this.encounter.isBoss) {
      this.state.flags.patronDefeated = true;
      this.state.objective = 'The Patron is vanquished. Return to the Elder.';
    } else {
      if (this.state.questStage === 0) this.state.questStage = 1;
    }

    const goldMsg  = `+${reward.gold}g`;
    const itemMsg  = reward.item ? ` + 1x ${reward.item}` : '';
    const corrMsg  = reward.corruptionDrop ? ` Corruption −${reward.corruptionDrop}` : '';

    this._logPush(`Victory! ${goldMsg}${itemMsg}${corrMsg}`);
    this._showOutcome('VICTORY', `${this.encounter.label} is defeated.\n${goldMsg}${itemMsg}`, 0x112210);
    saveState(this.state);

    this.time.delayedCall(1600, () => this._returnToWorld({ outcome: 'victory', encounterId: this.encounter.id }));
  }

  // ─── DEFEAT ────────────────────────────────────────────────────────────────
  _defeat() {
    if (this._ended) return;
    this._ended = true;

    const strippedInfo = applyDefeatConsequences(this.state, this.encounter);
    this.state.objective = 'Recover — rest in the Sanctuary Hall.';

    let msg = `Defeated. Pressure +25. Max STA/WIL permanently reduced.`;
    if (strippedInfo) msg += ` ${strippedInfo.name} stripped!`;

    // Faction consequences
    if (this.encounter.id === 'cultistSeducer' || this.encounter.id === 'patronBoss') {
      this.state.factions.cult = clamp(this.state.factions.cult + 5, 0, 100);
    }

    this._logPush(msg);
    this._showOutcome('DEFEAT', 'You have fallen.\nReturn to the Sanctuary Hall to recover.', 0x1e0608);
    saveState(this.state);

    this.time.delayedCall(1800, () => this._returnToWorld({
      outcome: 'defeat',
      strippedLayer: strippedInfo ? strippedInfo.name : null,
    }));
  }

  // ─── RETURN TO WORLD ───────────────────────────────────────────────────────
  _returnToWorld(extra = {}) {
    this.cameras.main.fade(500, 4, 2, 10, false, (cam, p) => {
      if (p >= 1) {
        this.scene.stop();
        const parentScene = this.scene.manager.getScene(this._returnTo);
        if (parentScene) {
          this.scene.resume(this._returnTo, { battleDone: true, state: this.state, ...extra });
        } else {
          this.scene.start(this._returnTo, { state: this.state, spawnX: extra.outcome === 'defeat' ? 200 : undefined });
        }
      }
    });
  }

  // ─── OUTCOME PANEL ─────────────────────────────────────────────────────────
  _showOutcome(title, body, color) {
    const W = this.scale.width;
    const H = this.scale.height;
    const panel = this.add.container(W / 2, H / 2).setDepth(9000).setScrollFactor(0);
    const bg   = this.add.rectangle(0, 0, 560, 220, color, 0.96).setStrokeStyle(3, 0xcc88ff, 0.7);
    const tTxt = this.add.text(0, -70, title, { fontSize: '34px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
    const bTxt = this.add.text(0, 20, body, { fontSize: '16px', color: '#e8d0f0', align: 'center', wordWrap: { width: 500 } }).setOrigin(0.5);
    panel.add([bg, tTxt, bTxt]);

    this.tweens.add({ targets: panel, scaleX: { from: 0.6, to: 1 }, scaleY: { from: 0.6, to: 1 }, alpha: { from: 0, to: 1 }, duration: 300, ease: 'Back.easeOut' });
  }

  // ─── BOSS INTRO ────────────────────────────────────────────────────────────
  _showBossIntro() {
    const W = this.scale.width;
    const H = this.scale.height;
    const panel = this.add.container(W / 2, H / 2).setDepth(9500).setScrollFactor(0);
    const bg   = this.add.rectangle(0, 0, 720, 320, 0x06010c, 0.98).setStrokeStyle(3, 0xcc00ff, 0.9);
    const tTxt = this.add.text(0, -110, 'THE PATRON', { fontSize: '42px', color: '#ff44ff', fontStyle: 'bold', stroke: '#220044', strokeThickness: 4 }).setOrigin(0.5);
    const bTxt = this.add.text(0, -20, this.encounter.lore, { fontSize: '16px', color: '#ccbbdd', align: 'center', wordWrap: { width: 660 }, lineSpacing: 4 }).setOrigin(0.5);
    const btn  = this.add.rectangle(0, 120, 240, 50, 0x330044, 0.9).setStrokeStyle(2, 0xff44ff, 0.8);
    btn.setInteractive(new Phaser.Geom.Rectangle(-120,-25,240,50), Phaser.Geom.Rectangle.Contains, { useHandCursor: true });
    const bLbl = this.add.text(0, 120, 'FACE IT', { fontSize: '20px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
    panel.add([bg, tTxt, bTxt, btn, bLbl]);

    this.tweens.add({ targets: panel, alpha: { from: 0, to: 1 }, duration: 600 });

    btn.on('pointerdown', () => {
      panel.destroy();
      this._logPush('The Patron stirs... it has been waiting for you.');
      this._logPush(this.encounter.lore);
      this.time.delayedCall(60, () => this._resolveEnemyIntent());
    });
  }

  // ─── UTIL ──────────────────────────────────────────────────────────────────
  _tweenHit(sprite) {
    if (!sprite) return;
    this.tweens.add({ targets: sprite, alpha: { from: 0.4, to: 1 }, duration: 120 });
    this.tweens.add({ targets: sprite, x: sprite.x + (sprite === this._enemySprite ? -12 : 12), yoyo: true, duration: 80, ease: 'Quad.easeOut' });
  }

  _makeProceduralHero(x, y) {
    // Fallback graphic player representation
    const g = this.add.graphics();
    g.fillStyle(0xcc88ff, 1);
    g.fillCircle(x, y - 60, 18); // head
    g.fillRect(x - 14, y - 42, 28, 44); // body
    g.fillRect(x - 24, y - 42, 10, 36); // L arm
    g.fillRect(x + 14, y - 42, 10, 36); // R arm
    g.fillRect(x - 14, y + 2, 12, 30);  // L leg
    g.fillRect(x + 2, y + 2, 12, 30);   // R leg
    return g;
  }

  // ─── HELPER: intactCount ────────────────────────────────────────────────────
}
