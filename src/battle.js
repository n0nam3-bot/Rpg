import {
  normalizeState, saveState, clamp, keyFor,
  makeMeter, createButton, makePanel,
  corruptionTier, applyCorruption, applyDamage, applyArousal,
  isHBound, totalClothingDef, damageClothingLayer, stripFirstIntactLayer,
  applyVictoryReward, applyDefeatConsequences, intactCount,
} from './util.js';
import { SKILLS, ITEMS } from './data.js';

const HERO_IDLE  = keyFor('ruin_runners_shaia/sprites/shaia/sprites_common/common_00_idle_stand_A01.png');
const HERO_WALK  = keyFor('ruin_runners_shaia/sprites/shaia/sprites_common/common_11_walk01.png');
const HERO_ATK1  = keyFor('ruin_runners_shaia/sprites/shaia/sprites_attack/attack_01_cobination0101.png');
const HERO_HURT  = keyFor('ruin_runners_shaia/sprites/shaia/sprites_damage/damage_01_damage_head.png');
const HERO_GUARD = keyFor('ruin_runners_shaia/sprites/shaia/sprites_common/common_31_guard_stand01.png');

const BG_C = keyFor('ruin_runners_shaia/sprites/background/sprites_dungeon/02_dungeon_center.png');

const INTENT_INFO = {
  strike:      { label: 'STRIKE',      color: '#ff8c8c', desc: 'Physical hit' },
  heavyStrike: { label: 'HEAVY',       color: '#ff5555', desc: 'Heavy blow' },
  guard:       { label: 'GUARD',       color: '#88ccff', desc: 'Defensive stance' },
  feint:       { label: 'FEINT',       color: '#ffd166', desc: 'Sets up a harder hit' },
  arouse:      { label: 'AROUSE',      color: '#ff66cc', desc: 'Raises pressure' },
  heavyStrip:  { label: 'STRIP',       color: '#ff3399', desc: 'Damages clothing' },
  bind:        { label: 'BIND',        color: '#cc66ff', desc: 'Locks movement' },
  voidPulse:   { label: 'VOID PULSE',  color: '#aa66ff', desc: 'Corrupting burst' },
  stunned:     { label: 'STUNNED',      color: '#dddddd', desc: 'Cannot act' },
};

const ACTIONS = [
  { key: 'attack', label: 'Attack',   hotkey: '1' },
  { key: 'heavy',  label: 'Heavy',    hotkey: '2' },
  { key: 'guard',  label: 'Guard',    hotkey: '3' },
  { key: 'skill',  label: 'Skill',    hotkey: '4' },
  { key: 'item',   label: 'Item',     hotkey: '5' },
  { key: 'flee',   label: 'Flee',     hotkey: '6' },
];

const SKILL_ORDER = ['darkVeil', 'soulDrain', 'voidBurst'];
const ITEM_ORDER = ['healingPotion', 'flashFlask'];

export class BattleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BattleScene' });
  }

  init(data = {}) {
    this.state = normalizeState(data.state);
    this.encounter = data.encounter || data.enc || null;
    this._returnTo = data.returnTo || 'WorldScene';
    this._ended = false;
    this._busy = false;
    this._turn = 'player';
    this._menuMode = 'main';
    this._choiceButtons = [];
    this._actionButtons = [];
    this._log = [];

    this.playerGuardTurns = 0;
    this.playerVeilTurns = 0;
    this.playerBoundTurns = 0;
    this.playerFocused = false;

    this.enemyGuardTurns = 0;
    this.enemyStunnedTurns = 0;
    this.enemyWeakTurns = 0;
    this.intentIndex = 0;
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;
    const encounter = this._resolveEncounter();

    this.physics.world.setBounds(0, 0, W, H);

    this._drawBackground(W, H);

    this.enemy = {
      hp: encounter.hp,
      maxHp: encounter.maxHp || encounter.hp,
      atk: encounter.atk || 10,
      def: encounter.def || 0,
      intents: Array.isArray(encounter.intents) && encounter.intents.length ? encounter.intents.slice() : ['strike'],
      pressure: 100,
      isBoss: !!encounter.isBoss,
      label: encounter.label,
    };

    this._stageFloorY = 468;
    this._playerHomeX = 286;
    this._enemyHomeX = 994;
    this._playerTargetX = this._playerHomeX;
    this._enemyTargetX = this._enemyHomeX;

    this._buildHeader(W);
    this._buildActors();
    this._buildPanels(W, H);
    this._buildMeters(W);
    this._buildActionPanel(W, H);

    this._turnBanner.setText('YOUR TURN');
    this._setIntent(this.enemy.intents[0], true);

    this._logPush(`${encounter.label} blocks the path.`);
    this._logPush(encounter.lore || 'A dark presence closes in.');

    this.input.keyboard.on('keydown-ONE', () => this._mainAction(0));
    this.input.keyboard.on('keydown-TWO', () => this._mainAction(1));
    this.input.keyboard.on('keydown-THREE', () => this._mainAction(2));
    this.input.keyboard.on('keydown-FOUR', () => this._mainAction(3));
    this.input.keyboard.on('keydown-FIVE', () => this._mainAction(4));
    this.input.keyboard.on('keydown-SIX', () => this._mainAction(5));
    this.input.keyboard.on('keydown-ESC', () => {
      if (this._menuMode !== 'main') {
        this._closeSubMenu();
        return;
      }
      // simple pause overlay / flee fallback for desktop
      this._tryFlee();
    });

    this._rebuildMainActions();
    this._refreshMeters();
    this.cameras.main.fadeIn(240, 6, 3, 10);
    saveState(this.state);
  }

  _resolveEncounter() {
    if (this.encounter) return this.encounter;
    return {
      id: 'possessedGuard',
      label: 'Possessed Guard',
      spriteKey: 'enemy-guard',
      hp: 60,
      maxHp: 60,
      atk: 12,
      def: 4,
      corruptionOnDefeat: 4,
      stripsOnDefeat: true,
      reward: { gold: 18, hp: 8, sta: 12, pressureDrop: 10 },
      intents: ['strike','strike','guard','heavyStrike','strike'],
      stripChance: 0.22,
      arousalAttack: false,
      bindAttack: false,
      lore: 'Once a faithful sentinel, now driven mad by dark influence.',
    };
  }

  _drawBackground(W, H) {
    if (this.textures.exists(BG_C)) {
      this.add.image(W / 2, H / 2, BG_C).setDisplaySize(W, H).setTint(0x110814);
    } else {
      this.add.rectangle(W / 2, H / 2, W, H, 0x07040d);
    }
    this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.32);
    this.add.rectangle(W / 2, 34, W, 68, 0x09050f, 0.92).setStrokeStyle(1, 0x7b2ca3, 0.45);
    this.add.rectangle(W / 2, 506, W, 214, 0x08040d, 0.95).setStrokeStyle(1, 0x7733cc, 0.28);

    const arena = this.add.graphics();
    arena.lineStyle(4, 0xc79cff, 0.18);
    arena.lineBetween(80, this._stageFloorY, W - 80, this._stageFloorY);
    arena.lineStyle(1, 0xffffff, 0.08);
    arena.lineBetween(90, this._stageFloorY + 1, W - 90, this._stageFloorY + 1);

    for (let i = 0; i < 7; i++) {
      const x = 120 + i * 170;
      const pillar = this.add.graphics();
      pillar.fillStyle(0x14091f, 1);
      pillar.fillRect(x, 120, 18, 250);
      pillar.lineStyle(2, 0xc88cff, 0.18);
      pillar.strokeRect(x, 120, 18, 250);
    }

    this._turnBanner = this.add.text(W / 2, 18, 'YOUR TURN', {
      fontSize: '22px',
      color: '#ffe3ff',
      fontStyle: 'bold',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(5001);

    this._subBanner = this.add.text(W / 2, 45, `Day ${this.state.day}  •  ${this.state.objective}`, {
      fontSize: '13px',
      color: '#b992c9',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(5001);
  }

  _buildHeader(W) {
    this._playerName = this.add.text(36, 98, 'VEILED', { fontSize: '18px', color: '#ffffff', fontStyle: 'bold' }).setDepth(5002);
    this._enemyName = this.add.text(W - 290, 98, this._resolveEncounter().label.toUpperCase(), { fontSize: '18px', color: '#ffffff', fontStyle: 'bold' }).setDepth(5002);
    this._playerPortrait = this.add.rectangle(84, 152, 96, 108, 0x24112d, 0.96).setStrokeStyle(2, 0xc88cff, 0.5);
    this._enemyPortrait = this.add.rectangle(W - 84, 152, 96, 108, 0x24112d, 0.96).setStrokeStyle(2, 0xc88cff, 0.5);
    this._intentCard = makePanel(this, W - 184, 234, 292, 162, { fill: 0x0d0714, alpha: 0.94, stroke: 0x9f4cff, depth: 5000 });
    this._intentTitle = this.add.text(W - 184, 160, 'ENEMY INTENT', { fontSize: '13px', color: '#d4b4ff', fontStyle: 'bold' }).setOrigin(0.5).setDepth(5001);
    this._intentText = this.add.text(W - 184, 226, '???', { fontSize: '26px', color: '#ff88cc', fontStyle: 'bold' }).setOrigin(0.5).setDepth(5001);
    this._intentDesc = this.add.text(W - 184, 274, '', { fontSize: '13px', color: '#cbb9df', align: 'center', wordWrap: { width: 250 } }).setOrigin(0.5).setDepth(5001);
  }

  _buildActors() {
    const enemyKey = this._resolveEncounter().spriteKey || 'enemy-guard';
    this.hero = this._makeHero(this._playerHomeX, this._stageFloorY);
    this.enemySprite = this._makeEnemy(this._enemyHomeX, this._stageFloorY, enemyKey);
    this.hero.setScale(0.92);
    this.enemySprite.setScale(0.96);

    this.hero.setFlipX(false);
    this.enemySprite.setFlipX(true);
  }

  _makeHero(x, y) {
    const sprite = this.add.sprite(x, y, HERO_IDLE).setOrigin(0.5, 1);
    if (this.anims.exists('hero-idle')) {
      sprite.play('hero-idle');
    }
    return sprite;
  }

  _makeEnemy(x, y, key) {
    const sprite = this.add.sprite(x, y, key).setOrigin(0.5, 1);
    if (key === 'sk-idle' && this.anims.exists('sk-idle')) {
      sprite.play('sk-idle');
    } else if (key === 'enemy-patron') {
      sprite.setScale(1.08);
    }
    return sprite;
  }

  _buildMeters(W) {
    this._pHp = makeMeter(this, 230, 106, 290, 'HP', 0xff6688);
    this._pSta = makeMeter(this, 230, 130, 290, 'STA', 0x44aaff);
    this._pWil = makeMeter(this, 230, 154, 290, 'WIL', 0xaaffaa);
    this._pCorr = makeMeter(this, 230, 178, 290, 'CORR', 0xcc00ff);
    this._pAr  = makeMeter(this, 230, 202, 290, 'AROU', 0xff44bb);

    this._eHp = makeMeter(this, W - 520, 106, 290, 'HP', 0xff5555);
    this._ePres = makeMeter(this, W - 520, 130, 290, 'PRES', 0xffaa44);
    this._eDef = makeMeter(this, W - 520, 154, 290, 'GUARD', 0x88ccff);

    this._hpNum = this.add.text(540, 106, '', { fontSize: '12px', color: '#e4d7ef' }).setDepth(5002);
    this._enemyStatus = this.add.text(W - 520, 178, '', { fontSize: '12px', color: '#e4d7ef' }).setDepth(5002);
  }

  _buildPanels(W, H) {
    this._logPanel = makePanel(this, W / 2, 566, W - 44, 108, { fill: 0x08040f, alpha: 0.95, stroke: 0x8f4df0, depth: 4995 });
    this._logText = this.add.text(38, 516, '', {
      fontSize: '14px',
      color: '#e5d4ff',
      wordWrap: { width: W - 60 },
      lineSpacing: 4,
    }).setDepth(5001);

    this._actionPanel = makePanel(this, W / 2, 666, W - 40, 118, { fill: 0x0c0711, alpha: 0.96, stroke: 0x6d3f9c, depth: 4994 });
    this._hintText = this.add.text(38, 604, '1–6 or tap a button.  ESC backs out of submenus or tries to flee.', {
      fontSize: '12px',
      color: '#9988bb',
    }).setDepth(5002);

    this._turnInfo = this.add.text(W / 2, 604, '', {
      fontSize: '13px',
      color: '#ffd0ff',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(5002);
  }

  _buildActionPanel(W, H) {
    this._clearButtons();
    this._actionButtons = [];

    const centers = [
      W * 0.20,
      W * 0.50,
      W * 0.80,
    ];
    const rows = [640, 692];

    this._actionSlots = {};
    const defs = this._mainActions();

    defs.forEach((def, index) => {
      const col = index % 3;
      const row = Math.floor(index / 3);
      const x = centers[col];
      const y = rows[row];
      const btn = createButton(this, x, y, 226, 46, `${def.hotkey}. ${def.label}`, () => {
        if (!def.disabled) this._mainAction(index);
      }, {
        fill: def.disabled ? 0x1a1022 : (def.corruption ? 0x32103d : 0x211026),
        stroke: def.disabled ? 0x4b3c5c : (def.corruption ? 0xff66ff : 0xcc88ff),
        textColor: def.disabled ? '#6f6480' : '#ffffff',
        fontSize: '15px',
        depth: 5010,
        hoverFill: 0x4a2162,
      });
      if (def.disabled) btn.t.setAlpha(0.45);
      this._actionButtons.push(btn);
    });
  }

  _mainActions() {
    const s = this.state;
    const hBound = isHBound(s) || this.playerBoundTurns > 0;
    const skill = this._bestSkill();
    const itemQty = this._usableItemCount();
    return [
      { label: hBound ? 'Struggle' : 'Attack', hotkey: '1', disabled: false, corruption: false },
      { label: 'Heavy', hotkey: '2', disabled: hBound || s.sta < 10, corruption: false },
      { label: 'Guard', hotkey: '3', disabled: hBound, corruption: false },
      { label: skill ? 'Skill' : 'Skill --', hotkey: '4', disabled: hBound || !skill, corruption: !!skill },
      { label: itemQty > 0 ? 'Item' : 'Item --', hotkey: '5', disabled: itemQty <= 0, corruption: false },
      { label: 'Flee', hotkey: '6', disabled: false, corruption: false },
    ];
  }

  _bestSkill() {
    return SKILL_ORDER.map(id => SKILLS.find(sk => sk.id === id))
      .find(sk => sk && this.state.corruption >= sk.minCorruption && this.state.sta >= sk.staCost) || null;
  }

  _usableItemCount() {
    return ITEM_ORDER.reduce((sum, key) => {
      const item = ITEMS[key];
      const qty = this.state.items[key] || 0;
      return sum + (item && item.usableInBattle ? qty : 0);
    }, 0);
  }

  _clearButtons() {
    if (!this._actionButtons) return;
    this._actionButtons.forEach(btn => {
      if (btn?.g?.destroy) btn.g.destroy(true);
    });
    this._actionButtons = [];
    if (this._choiceButtons && this._choiceButtons.length) {
      this._choiceButtons.forEach(btn => {
        if (btn?.g?.destroy) btn.g.destroy(true);
      });
    }
    this._choiceButtons = [];
  }

  _rebuildMainActions() {
    this._menuMode = 'main';
    this._clearSubmenu();
    this._buildActionPanel(this.scale.width, this.scale.height);
  }

  _clearSubmenu() {
    if (this._choiceButtons && this._choiceButtons.length) {
      this._choiceButtons.forEach(btn => btn.g.destroy(true));
    }
    this._choiceButtons = [];
    this._submenuPanel?.destroy(true);
    this._submenuPanel = null;
    this._submenuTitle?.destroy();
    this._submenuTitle = null;
    this._submenuBack?.destroy(true);
    this._submenuBack = null;
  }

  _closeSubMenu() {
    this._clearSubmenu();
    this._rebuildMainActions();
  }

  _openSubmenu(type) {
    this._menuMode = type;
    this._clearSubmenu();

    const W = this.scale.width;
    const title = type === 'skill' ? 'Select a Skill' : 'Select an Item';
    this._submenuPanel = makePanel(this, W / 2, 366, 640, 250, { fill: 0x100816, alpha: 0.98, stroke: 0x9f4cff, depth: 5200 });
    this._submenuTitle = this.add.text(W / 2, 238, title, {
      fontSize: '18px',
      color: '#ffe3ff',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(5201);

    const entries = type === 'skill' ? this._skillEntries() : this._itemEntries();
    const list = entries.length ? entries : [{ label: 'None available', disabled: true }];
    const x = W / 2;
    const y0 = 285;
    const gap = 42;

    list.slice(0, 5).forEach((entry, idx) => {
      const y = y0 + idx * gap;
      const b = createButton(this, x, y, 520, 34, entry.label, () => {
        if (!entry.disabled) entry.action();
      }, {
        fill: entry.disabled ? 0x1b1323 : 0x251431,
        stroke: entry.disabled ? 0x5a4e6a : 0xc88cff,
        textColor: entry.disabled ? '#675f75' : '#ffffff',
        fontSize: '13px',
        depth: 5202,
        hoverFill: 0x41204a,
      });
      if (entry.disabled) b.t.setAlpha(0.5);
      this._choiceButtons.push(b);
    });

    this._submenuBack = createButton(this, W / 2, 516, 220, 36, 'Back', () => this._rebuildMainActions(), {
      fill: 0x1a1022,
      stroke: 0x8f4df0,
      fontSize: '13px',
      depth: 5202,
      hoverFill: 0x41204a,
    });
    this._choiceButtons.push(this._submenuBack);
  }

  _skillEntries() {
    return SKILL_ORDER.map(id => SKILLS.find(sk => sk.id === id)).filter(Boolean).map(skill => {
      const can = this.state.corruption >= skill.minCorruption && this.state.sta >= skill.staCost;
      return {
        label: `${skill.label}  (${skill.staCost} STA | Corruption ${skill.minCorruption}+ )`,
        disabled: !can,
        action: () => this._useSkill(skill),
      };
    });
  }

  _itemEntries() {
    return ITEM_ORDER.map(id => ITEMS[id] && { id, item: ITEMS[id] }).filter(Boolean).map(({ id, item }) => {
      const qty = this.state.items[id] || 0;
      const can = qty > 0 && item.usableInBattle;
      return {
        label: `${item.label}  ×${qty} — ${item.desc}`,
        disabled: !can,
        action: () => this._useItem(id, item),
      };
    });
  }

  _updateFacing(heroFaceRight = true) {
    if (this.hero) this.hero.setFlipX(!heroFaceRight);
    if (this.enemySprite) this.enemySprite.setFlipX(heroFaceRight);
  }

  _mainAction(index) {
    if (this._busy || this._ended) return;
    if (this._menuMode !== 'main') return;

    const hBound = isHBound(this.state);
    switch (index) {
      case 0:
        if (hBound) return this._struggle();
        return this._attack(false);
      case 1:
        return this._attack(true);
      case 2:
        return this._guard();
      case 3:
        return this._openSubmenu('skill');
      case 4:
        return this._openSubmenu('item');
      case 5:
        return this._tryFlee();
      default:
        return;
    }
  }

  _struggle() {
    if (this._busy || this._ended) return;
    this._busy = true;
    this._logPush('You struggle against the pressure and force space back into your stance.');
    this.state.arousal = Math.max(0, this.state.arousal - 18);
    this.state.wil = Math.max(0, this.state.wil - 2);
    this._playerBoundTurns = Math.max(0, this._playerBoundTurns - 1);
    saveState(this.state);
    this._heroAnim('hero-guard');
    this._heroStep(26, () => this._finishPlayerTurn());
  }

  _attack(heavy) {
    if (this._busy || this._ended) return;
    if (this._menuMode !== 'main') return;
    if (this._playerBoundTurns > 0 || isHBound(this.state)) {
      this._logPush('You are too overwhelmed to attack. Struggle first.');
      return;
    }
    this._busy = true;
    const cost = heavy ? 10 : 4;
    this.state.sta = Math.max(0, this.state.sta - cost);
    const base = heavy ? 20 : 13;
    this._logPush(heavy ? 'Heavy strike!' : 'You lash out.');
    this._heroAnim('hero-atk1');
    this._heroStep(heavy ? 54 : 34, () => {
      let dmg = base + Math.floor(this.state.lvl * 1.5) + Math.floor(this.state.corruption * 0.12);
      if (heavy) dmg += 8;
      if (this.enemyWeakTurns > 0) dmg += 4;
      if (this.enemyGuardTurns > 0) dmg = Math.max(1, Math.round(dmg * 0.65));
      this._damageEnemy(dmg);
      if (heavy) this.state.pressure = clamp(this.state.pressure + 2, 0, 100);
      saveState(this.state);
      this._finishPlayerTurn();
    });
  }

  _guard() {
    if (this._busy || this._ended) return;
    if (this._menuMode !== 'main') return;
    this._busy = true;
    this.playerGuardTurns = 1;
    this.state.sta = Math.max(0, this.state.sta - 2);
    this.state.pressure = Math.max(0, this.state.pressure - 2);
    this._logPush('You brace and guard.');
    this._heroAnim('hero-guard');
    this._heroStep(12, () => this._finishPlayerTurn());
    saveState(this.state);
  }

  _useSkill(skill) {
    if (this._busy || this._ended) return;
    if (this.state.corruption < skill.minCorruption || this.state.sta < skill.staCost) {
      this._logPush('Not enough corruption or stamina for that skill.');
      return;
    }
    this._busy = true;
    this._menuMode = 'main';
    this.state.sta = Math.max(0, this.state.sta - skill.staCost);
    const msg = skill.effect(this.state, this);
    this.playerVeilTurns = Math.max(this.playerVeilTurns, this.playerVeilActive ? 1 : 0);
    this.enemyWeakTurns = Math.max(this.enemyWeakTurns, this.enemyWeakened || 0);
    this.enemyStunnedTurns = Math.max(this.enemyStunnedTurns, this.enemyStunned || 0);
    this.playerVeilActive = false;
    this.enemyWeakened = 0;
    this.enemyStunned = 0;
    this._logPush(msg);
    this._heroAnim('hero-atk1');
    this._heroStep(36, () => {
      saveState(this.state);
      this._refreshMeters();
      this._endIfNeeded(() => this._finishPlayerTurn());
    });
  }

  _useItem(itemId, item) {
    if (this._busy || this._ended) return;
    const qty = this.state.items[itemId] || 0;
    if (qty <= 0 || !item.usableInBattle) {
      this._logPush('That item cannot be used right now.');
      return;
    }
    this._busy = true;
    this.state.items[itemId] = qty - 1;
    const msg = item.effect(this.state, this);
    this.playerVeilTurns = Math.max(this.playerVeilTurns, this.playerVeilActive ? 1 : 0);
    this.enemyWeakTurns = Math.max(this.enemyWeakTurns, this.enemyWeakened || 0);
    this.enemyStunnedTurns = Math.max(this.enemyStunnedTurns, this.enemyStunned || 0);
    this.playerVeilActive = false;
    this.enemyWeakened = 0;
    this.enemyStunned = 0;
    this._logPush(msg);
    this._heroAnim('hero-guard');
    this._heroStep(10, () => {
      saveState(this.state);
      this._refreshMeters();
      this._endIfNeeded(() => this._finishPlayerTurn());
    });
  }

  _tryFlee() {
    if (this._busy || this._ended) return;
    if (this._menuMode !== 'main') {
      this._rebuildMainActions();
      return;
    }
    this._busy = true;
    const chance = 0.55 + Math.min(0.25, this.state.wil / 500);
    const roll = Math.random();
    if (roll < chance) {
      this._logPush('You escape into the corridor.');
      this.state.pressure = clamp(this.state.pressure + 4, 0, 100);
      this._endBattle('flee');
    } else {
      this._logPush('Escape failed!');
      this.state.pressure = clamp(this.state.pressure + 6, 0, 100);
      this._heroStep(-10, () => this._enemyTurn());
    }
    saveState(this.state);
  }

  _finishPlayerTurn() {
    if (this._ended) return;
    this._refreshMeters();
    this._endIfNeeded(() => {
      this._turn = 'enemy';
      this._turnBanner.setText('ENEMY TURN');
      this.time.delayedCall(240, () => this._enemyTurn());
    });
  }

  _enemyTurn() {
    if (this._ended) return;
    if (this.enemyStunnedTurns > 0) {
      this.enemyStunnedTurns -= 1;
      this._logPush(`${this.enemy.label} is stunned and loses the turn.`);
      this._turnBackToPlayer();
      return;
    }

    const intent = this._nextIntent();
    this._setIntent(intent);
    const info = INTENT_INFO[intent] || INTENT_INFO.strike;
    this._logPush(`${this.enemy.label} prepares ${info.label}.`);
    this._enemyAnim(intent, () => {
      this._resolveEnemyIntent(intent);
      this._refreshMeters();
      this._endIfNeeded(() => this._turnBackToPlayer());
    });
  }

  _nextIntent() {
    const intents = this.enemy.intents.length ? this.enemy.intents : ['strike'];
    const intent = intents[this.intentIndex % intents.length];
    this.intentIndex += 1;
    return intent;
  }

  _resolveEnemyIntent(intent) {
    const s = this.state;
    const enemy = this.enemy;
    let dmg = enemy.atk;
    let staDrain = 0;
    let wilDrain = 0;
    let pressureAdd = 0;
    let log = '';

    switch (intent) {
      case 'strike':
        dmg += 0;
        staDrain = 2;
        log = `${enemy.label} strikes.`;
        break;
      case 'heavyStrike':
        dmg += 8;
        staDrain = 4;
        wilDrain = 1;
        pressureAdd = 3;
        log = `${enemy.label} lands a heavy blow.`;
        break;
      case 'guard':
        this.enemyGuardTurns = 2;
        this._logPush(`${enemy.label} guards and braces.`);
        this._setEnemyStatus('Guarding', '#88ccff');
        return;
      case 'feint':
        this.enemyWeakTurns = 1;
        dmg = Math.max(1, Math.round(dmg * 0.7));
        log = `${enemy.label} feints to throw you off.`;
        break;
      case 'arouse':
        applyArousal(s, 14);
        pressureAdd = 4;
        log = `${enemy.label} floods the room with pressure.`;
        break;
      case 'heavyStrip':
        dmg += 5;
        pressureAdd = 6;
        const stripped = this._stripRandomLayer(18);
        if (stripped) log = `${enemy.label} tears away your ${stripped}.`;
        else log = `${enemy.label} targets your clothing.`;
        break;
      case 'bind':
        this.playerBoundTurns = Math.min(3, this.playerBoundTurns + 2);
        dmg = Math.round(dmg * 0.55);
        pressureAdd = 4;
        log = `${enemy.label} tries to bind your movement.`;
        break;
      case 'voidPulse':
        dmg += 12;
        staDrain = 4;
        wilDrain = 3;
        pressureAdd = 8;
        applyCorruption(s, 4);
        log = `${enemy.label} unleashes a void pulse.`;
        break;
      default:
        log = `${enemy.label} attacks.`;
        break;
    }

    if (this.enemyWeakTurns > 0 && intent !== 'feint') {
      dmg = Math.max(1, Math.round(dmg * 0.8));
    }

    if (this.playerGuardTurns > 0) {
      dmg = Math.max(1, Math.round(dmg * 0.55));
      this.playerGuardTurns -= 1;
    }

    if (this.playerVeilTurns > 0) {
      dmg = Math.max(1, Math.round(dmg * 0.2));
      this.playerVeilTurns -= 1;
    }

    const finalDmg = applyDamage(s, dmg, staDrain, wilDrain, pressureAdd);

    this._logPush(log + `  (-${finalDmg} HP)`);
    this._heroAnim('hero-hurt');
    this._heroFlash(0xff6677);

    if (this.enemyWeakTurns > 0 && intent !== 'feint') this.enemyWeakTurns -= 1;
    if (this.playerBoundTurns > 0 && intent !== 'bind') this.playerBoundTurns -= 1;

    if (intent === 'arouse' || intent === 'voidPulse') {
      s.corruption = clamp(s.corruption + (intent === 'voidPulse' ? 2 : 1), 0, 100);
    }
    saveState(s);
  }

  _turnBackToPlayer() {
    if (this._ended) return;
    if (this.playerBoundTurns > 0) this.playerBoundTurns -= 1;
    this._turn = 'player';
    this._turnBanner.setText('YOUR TURN');
    this._setIntent(this.enemy.intents[this.intentIndex % this.enemy.intents.length], true);
    this._rebuildMainActions();
    this._busy = false;
    this._refreshMeters();
  }

  _setIntent(intent, silent = false) {
    const info = INTENT_INFO[intent] || INTENT_INFO.strike;
    this._intentText.setText(info.label);
    this._intentText.setColor(info.color);
    this._intentDesc.setText(info.desc);
    this._enemyStatusText = this._enemyStatusText || this.add.text(this.scale.width - 520, 202, '', { fontSize: '12px', color: '#e4d7ef' }).setDepth(5002);
    this._enemyStatusText.setText(`Intent: ${info.desc}`);
    if (!silent) {
      this.tweens.add({ targets: this._intentCard, scale: { from: 1.0, to: 1.02 }, yoyo: true, duration: 180 });
    }
  }

  _setEnemyStatus(text, color) {
    if (!this._enemyStatusText) {
      this._enemyStatusText = this.add.text(this.scale.width - 520, 202, '', { fontSize: '12px', color: '#e4d7ef' }).setDepth(5002);
    }
    this._enemyStatusText.setText(text).setColor(color || '#e4d7ef');
  }

  _heroStep(dx, cb) {
    this.hero.setFlipX(false);
    this.tweens.add({
      targets: this.hero,
      x: this._playerHomeX + dx,
      duration: 140,
      yoyo: true,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        this.hero.x = this._playerHomeX;
        if (this.anims.exists('hero-idle')) this.hero.play('hero-idle', true);
        if (cb) cb();
      },
    });
  }

  _enemyAnim(intent, cb) {
    const move = intent === 'heavyStrike' || intent === 'voidPulse' ? -58 : -34;
    if (this.enemySprite.anims && this.anims.exists('sk-atk') && this.enemySprite.texture.key === 'sk-idle') {
      this.enemySprite.play('sk-atk', true);
    }
    this.enemySprite.setFlipX(true);
    this.tweens.add({
      targets: this.enemySprite,
      x: this._enemyHomeX + move,
      duration: 160,
      yoyo: true,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        this.enemySprite.x = this._enemyHomeX;
        if (this.enemySprite.texture.key === 'sk-idle' && this.anims.exists('sk-idle')) {
          this.enemySprite.play('sk-idle', true);
        }
        if (cb) cb();
      },
    });
  }

  _heroAnim(anim) {
    if (anim && this.anims.exists(anim) && this.hero.texture.key !== anim) {
      try { this.hero.play(anim, true); } catch (e) {}
    }
    if (anim === 'hero-atk1' && this.anims.exists('hero-atk1')) {
      this.hero.play('hero-atk1', true);
      this.time.delayedCall(180, () => { if (!this._ended) this.hero.play('hero-idle', true); });
    } else if (anim === 'hero-guard' && this.anims.exists('hero-guard')) {
      this.hero.play('hero-guard', true);
      this.time.delayedCall(120, () => { if (!this._ended) this.hero.play('hero-idle', true); });
    } else if (anim === 'hero-hurt' && this.anims.exists('hero-hurt')) {
      this.hero.play('hero-hurt', true);
      this.time.delayedCall(160, () => { if (!this._ended) this.hero.play('hero-idle', true); });
    }
  }

  _heroFlash(color) {
    this.tweens.add({ targets: this.hero, tint: color, duration: 80, yoyo: true, repeat: 1 });
    this.cameras.main.shake(70, 0.004);
  }

  _damageEnemy(dmg) {
    this.enemy.hp = clamp(this.enemy.hp - dmg, 0, this.enemy.maxHp);
    this.enemy.pressure = clamp((this.enemy.pressure || 100) - Math.max(2, Math.round(dmg / 2)), 0, 100);
    this._setEnemyStatus(`HP -${dmg}`, '#ff88aa');
    this._enemyFlash();
    this._logPush(`${this.enemy.label} takes ${dmg} damage.`);
    if (this.enemyGuardTurns > 0) this.enemyGuardTurns = Math.max(0, this.enemyGuardTurns - 1);
  }

  _enemyFlash() {
    this.tweens.add({ targets: this.enemySprite, tint: 0xff88aa, duration: 70, yoyo: true, repeat: 1 });
    this.tweens.add({ targets: this.enemySprite, x: this._enemyHomeX - 10, duration: 60, yoyo: true, ease: 'Quad.easeOut' });
  }

  _stripRandomLayer(amount = 16) {
    const slots = ['outer','upper','lower','inner','shoes'];
    for (const slot of slots) {
      if (!this.state.clothing[slot].stripped) {
        const stripped = damageClothingLayer(this.state, slot, amount);
        if (stripped) {
          this.state.pressure = clamp(this.state.pressure + 4, 0, 100);
          this._logPush(`${stripped} is stripped away!`);
          return stripped;
        }
      }
    }
    return null;
  }

  _endIfNeeded(cb) {
    if (this._ended) return true;
    if (this.enemy.hp <= 0) {
      this._victory();
      return true;
    }
    if (this.state.hp <= 0 || this.state.wil <= 0) {
      this._defeat();
      return true;
    }
    if (cb) cb();
    return false;
  }

  _victory() {
    if (this._ended) return;
    this._ended = true;

    applyVictoryReward(this.state, this._resolveEncounter().reward || {});
    this.state.flags.firstBattle = true;
    this.state.objective = this.encounter.isBoss ? 'The Patron has been defeated.' : 'Return to the corridor and keep moving.';
    saveState(this.state);

    this._logPush(`Victory! ${this._resolveEncounter().label} is defeated.`);
    this._showOutcome('VICTORY', `${this._resolveEncounter().label} falls.\nRewards secured.`, 0x102012);
    this._returnAfterDelay('victory');
  }

  _defeat() {
    if (this._ended) return;
    this._ended = true;

    const stripped = applyDefeatConsequences(this.state, this._resolveEncounter());
    this.state.objective = 'Recover in the bedroom. You need time to stand back up.';
    this.state.corruption = clamp(this.state.corruption + 2, 0, 100);
    saveState(this.state);

    this._logPush('You are overwhelmed.');
    if (stripped) this._logPush(`${stripped.name} is torn away.`);
    this._showOutcome('DEFEAT', 'You collapse.\nReturn to the bedroom and recover.', 0x24060b);
    this._returnAfterDelay('defeat', stripped ? stripped.name : null);
  }

  _endBattle(outcome = 'flee', strippedLayer = null) {
    if (this._ended) return;
    this._ended = true;

    if (outcome === 'flee') {
      this.state.pressure = clamp(this.state.pressure + 5, 0, 100);
      this.state.corruption = clamp(this.state.corruption + 1, 0, 100);
      this.state.objective = 'You escaped. Catch your breath and try again.';
      saveState(this.state);
      this._showOutcome('ESCAPE', 'You flee the encounter.', 0x101018);
    }

    this._returnAfterDelay(outcome, strippedLayer);
  }

  _returnAfterDelay(outcome, strippedLayer = null) {
    this.time.delayedCall(1200, () => {
      const payload = {
        battleDone: true,
        state: this.state,
        outcome,
        encounterId: this._resolveEncounter().id,
        strippedLayer,
      };
      this.scene.stop();
      this.scene.resume(this._returnTo, payload);
    });
  }

  _showOutcome(title, body, color) {
    const W = this.scale.width;
    const panel = this.add.container(W / 2, 350).setDepth(9000).setScrollFactor(0);
    const bg = this.add.rectangle(0, 0, 560, 200, color, 0.96).setStrokeStyle(3, 0xdd99ff, 0.75);
    const t = this.add.text(0, -66, title, { fontSize: '36px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
    const b = this.add.text(0, 8, body, { fontSize: '16px', color: '#eed9ff', align: 'center', wordWrap: { width: 500 }, lineSpacing: 4 }).setOrigin(0.5);
    panel.add([bg, t, b]);
    this.tweens.add({ targets: panel, alpha: { from: 0, to: 1 }, scale: { from: 0.92, to: 1 }, duration: 220, ease: 'Back.easeOut' });
  }

  _logPush(msg) {
    if (!msg) return;
    this._log.push(msg);
    if (this._log.length > 4) this._log.shift();
    this._logText.setText(this._log.join('\n'));
  }

  _refreshMeters() {
    const s = this.state;
    this._pHp.set(s.hp, s.maxHp);
    this._pSta.set(s.sta, s.maxSta);
    this._pWil.set(s.wil, s.maxWil);
    this._pCorr.set(s.corruption, 100);
    this._pAr.set(s.arousal, 100);

    this._eHp.set(this.enemy.hp, this.enemy.maxHp);
    this._ePres.set(this.enemy.pressure, 100);
    this._eDef.set(this.enemyGuardTurns > 0 ? 100 : 0, 100);

    this._hpNum.setText(`Clothing DEF ${totalClothingDef(s.clothing)}  ·  Layers ${intactCount(s.clothing)}/5`);
    this._enemyStatus.setText(
      `${this.enemy.label}  ·  ${this.enemy.hp}/${this.enemy.maxHp} HP` +
      (this.enemyGuardTurns > 0 ? '  ·  Guarding' : '') +
      (this.enemyStunnedTurns > 0 ? '  ·  Stunned' : '') +
      (this.enemyWeakTurns > 0 ? '  ·  Weakened' : '')
    );
    this._turnInfo.setText(`Press 1-6 or tap.  ${this.playerGuardTurns > 0 ? 'Guard active.' : ''}`);
  }

  _heroLunge(dx, cb) {
    const startX = this._playerHomeX;
    this.hero.setFlipX(false);
    this.tweens.add({
      targets: this.hero,
      x: startX + dx,
      duration: 130,
      yoyo: true,
      ease: 'Quad.easeOut',
      onComplete: () => {
        this.hero.x = startX;
        if (cb) cb();
      },
    });
  }

  _enemyLunge(dx, cb) {
    const startX = this._enemyHomeX;
    this.enemySprite.setFlipX(true);
    this.tweens.add({
      targets: this.enemySprite,
      x: startX + dx,
      duration: 130,
      yoyo: true,
      ease: 'Quad.easeOut',
      onComplete: () => {
        this.enemySprite.x = startX;
        if (cb) cb();
      },
    });
  }

  _openPauseHelp() {
    // no-op for now; ESC is reserved for flee/back out of menus
  }
}
