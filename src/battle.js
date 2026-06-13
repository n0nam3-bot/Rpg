import {
  normalizeState, saveState, clamp,
  FramePlayer, EnemyAnimator, K, FRAMES, KbdFocus,
  makeMeter, corruptionTier,
  applyCorruption, applyDamage, applyArousal, isHBound,
  damageClothingLayer, stripFirstIntactLayer, applyVictoryReward, applyDefeatConsequences,
  totalClothingDef, intactCount, SLOT_ORDER,
} from './util.js';
import { SKILLS, ITEMS, ENCOUNTERS } from './data.js';

const INTENT_INFO = {
  strike:      { icon:'⚔',  label:'Strike',       col:'#ff8888' },
  heavyStrike: { icon:'💢',  label:'Heavy',        col:'#ff4444' },
  guard:       { icon:'🛡',  label:'Guard',        col:'#88aaff' },
  feint:       { icon:'🌀',  label:'Feint',        col:'#ffcc44' },
  arouse:      { icon:'💜',  label:'Arouse',       col:'#ff44cc' },
  heavyStrip:  { icon:'💔',  label:'Strip',        col:'#ff0088' },
  bind:        { icon:'⛓',  label:'Bind',         col:'#cc44ff' },
  voidPulse:   { icon:'🌑',  label:'Void Pulse',   col:'#8800ff' },
};

const REACTION_PATTERNS = {
  strike:      ['LEFT', 'RIGHT'],
  heavyStrike: ['UP', 'DOWN', 'UP'],
  feint:       ['LEFT', 'UP'],
  guard:       ['DOWN', 'DOWN'],
  arouse:      ['UP', 'RIGHT', 'UP'],
  heavyStrip:  ['LEFT', 'LEFT', 'RIGHT', 'UP'],
  bind:        ['UP', 'LEFT', 'RIGHT'],
  voidPulse:   ['LEFT', 'RIGHT', 'DOWN', 'UP'],
};

function tokenToGlyph(token) {
  return token === 'LEFT' ? '←' : token === 'RIGHT' ? '→' : token === 'UP' ? '↑' : token === 'DOWN' ? '↓' : token === 'SPACE' ? '␣' : token;
}

export class BattleScene extends Phaser.Scene {
  constructor() {
    super({ key:'BattleScene' });
  }

  init(data = {}) {
    this.state = normalizeState(data.state);
    this.encounter = data.encounter || ENCOUNTERS.goblin || {
      id:'goblin', label:'Goblin Marauder', hp:24, maxHp:24, atk:6, def:0,
      spriteKey:'en-goblin-idle', animPrefix:null, useSkeleton:false, scale:1,
      reward:{ gold:10 }, intents:['strike','feint'], stripsOnDefeat:false,
    };
    this._return = data.returnTo || 'WorldScene';
    this._battleDone = false;
    this._busy = false;
    this._enemyTimer = 1200;
    this._enemyTelegraph = 0;
    this._enemyIntent = null;
    this._enemyIntentIndex = 0;
    this._reaction = null;
    this._modal = null;
    this._playerGuardUntil = 0;
    this._playerVeilUntil = 0;
    this._playerFocusUntil = 0;
    this._playerActionCD = 0;
    this._playerMoved = false;
    this._log = [];
    this.enemy = {
      hp: this.encounter.hp || 20,
      maxHp: this.encounter.maxHp || this.encounter.hp || 20,
      stunned: 0,
      weakened: 0,
      intent: '',
    };
    this.pbuff = {
      guard: false,
      veil: false,
      focusBonus: 0,
      bindTurns: 0,
    };
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;
    this.input.addPointer(4);

    this._buildBackdrop(W, H);
    this._buildPanels(W, H);

    const heroKey = this.textures.exists(K(FRAMES.S_IDLE[0])) ? K(FRAMES.S_IDLE[0]) : 'npc-elder';
    const enemyKey = this._resolveEnemyTexture();

    this._heroHome = { x: 280, y: 486 };
    this._enemyHome = { x: 1000, y: 486 };
    this._hero = this.add.sprite(this._heroHome.x, this._heroHome.y, heroKey)
      .setOrigin(0.5, 1)
      .setScale(1.02)
      .setDepth(200);

    this._enemy = this.add.sprite(this._enemyHome.x, this._enemyHome.y, enemyKey)
      .setOrigin(0.5, 1)
      .setScale(this.encounter.scale || 1.1)
      .setFlipX(true)
      .setDepth(200);

    this._heroAnim = new FramePlayer(this, this._hero);
    this._heroAnim.loop(FRAMES.S_IDLE, 9);

    this._enemyAnim = new EnemyAnimator(this, this._enemy, this.encounter.animPrefix, this._buildEnemySets());
    this._enemyAnim.idle();

    if (this.encounter.isBoss) {
      this._enemy.setScale((this.encounter.scale || 1.25) * 1.06);
      this._hero.setScale(0.98);
    }

    this._keys = this.input.keyboard.addKeys('LEFT,RIGHT,UP,DOWN,A,D,W,S,SPACE,SHIFT,ENTER,ESC,ONE,TWO,THREE,FOUR,FIVE,SIX');
    this._keys.ESC.on('down', () => this._attemptFlee(true));

    this._buildActionButtons(W, H);
    this._refreshMeters();
    this._pushLog(`A ${this.encounter.label} approaches.`);
    if (this.encounter.lore) this._pushLog(this.encounter.lore);

    this.time.delayedCall(420, () => this._beginEnemyCycle(true));
    this.cameras.main.fadeIn(240, 4, 2, 10);
  }

  update(_time, delta) {
    if (this._battleDone) return;

    this._updateFacing();
    this._handlePlayerMovement(delta);
    this._handleCooldowns(delta);
    this._handleReactionInput(delta);
    this._handleEnemyCycle(delta);
    this._refreshMeters();
    this._refreshClothing();

    if (Phaser.Input.Keyboard.JustDown(this._keys.ONE)) this._playerAttack();
    if (Phaser.Input.Keyboard.JustDown(this._keys.TWO)) this._playerGuard();
    if (Phaser.Input.Keyboard.JustDown(this._keys.THREE)) this._startReactionAssist();
    if (Phaser.Input.Keyboard.JustDown(this._keys.FOUR)) this._openSkillMenu();
    if (Phaser.Input.Keyboard.JustDown(this._keys.FIVE)) this._openItemMenu();
    if (Phaser.Input.Keyboard.JustDown(this._keys.SIX)) this._attemptFlee();

    if (this._keys.SHIFT?.isDown && this._playerFocusUntil <= 0) {
      this._playerFocusUntil = 0;
    }
  }

  _buildBackdrop(W, H) {
    const g = this.add.graphics();
    g.fillGradientStyle(0x04010a, 0x04010a, 0x12051a, 0x12051a, 1);
    g.fillRect(0, 0, W, H);
    g.fillStyle(0x170825, 1);
    g.fillRect(0, H * 0.55, W, H * 0.45);
    g.lineStyle(2, 0xcc44ff, 0.2);
    g.lineBetween(0, H * 0.55, W, H * 0.55);
    for (let x = 120; x < W; x += 260) {
      g.fillStyle(0x241035, 0.9);
      g.fillRect(x - 16, 0, 32, H * 0.55);
    }
    this.add.rectangle(W / 2, H * 0.58, W, H * 0.26, 0x09020f, 0.72);
    this.add.text(36, 24, 'REALTIME DUEL', { fontSize:'28px', color:'#ffccff', fontStyle:'bold' });
    this.add.text(36, 60, 'React to the telegraph, keep your footing, and control the pace.', { fontSize:'13px', color:'#aa88bb' });
  }

  _buildPanels(W, H) {
    this._playerFrame = this.add.rectangle(160, 110, 298, 118, 0x06010c, 0.92).setStrokeStyle(1, 0x6622aa, 0.65);
    this._enemyFrame = this.add.rectangle(W - 160, 110, 298, 118, 0x06010c, 0.92).setStrokeStyle(1, 0x6622aa, 0.65);

    this._playerLabel = this.add.text(18, 14, 'VERITY', { fontSize:'18px', color:'#fff', fontStyle:'bold' });
    this._enemyLabel = this.add.text(W - 306, 14, this.encounter.label.toUpperCase(), { fontSize:'18px', color:'#ffcccc', fontStyle:'bold' });

    this._pHp = makeMeter(this, 12, 40,  286, 'HP',   0xff6688);
    this._pSta= makeMeter(this, 12, 62,  286, 'STA',  0x44aaff);
    this._pWil= makeMeter(this, 12, 84,  286, 'WIL',  0xaaffaa);
    this._pCorr=makeMeter(this, 12, 106, 286, 'CORR', 0xcc00ff);

    this._eHp = makeMeter(this, W - 298, 40,  286, 'HP',   0xff4444);
    this._ePrs= makeMeter(this, W - 298, 62,  286, 'PRSS', 0xff8833);
    this._eStn= this.add.text(W - 154, 86, '', { fontSize:'12px', color:'#ffcc44', fontStyle:'bold' }).setOrigin(0.5);

    this._intentFrame = this.add.rectangle(W / 2, 148, 420, 52, 0x10031a, 0.94).setStrokeStyle(2, 0xcc44ff, 0.8);
    this._intentTxt = this.add.text(W / 2, 148, 'WAITING…', { fontSize:'18px', color:'#ffccff', fontStyle:'bold' }).setOrigin(0.5);
    this._patternTxt = this.add.text(W / 2, 182, '', { fontSize:'16px', color:'#fff' }).setOrigin(0.5);

    this._logBg = this.add.rectangle(W / 2, H - 82, W - 24, 132, 0x06010c, 0.92).setStrokeStyle(1, 0x6622aa, 0.5);
    this._logTxt = this.add.text(26, H - 128, '', {
      fontSize:'14px', color:'#e6d5ee', wordWrap:{ width: W - 52 }, lineSpacing:4,
    });

    this._statusTxt = this.add.text(W / 2, H - 154, '', { fontSize:'13px', color:'#ccbbdd', align:'center' }).setOrigin(0.5);

    this._buildActionGrid(W, H);
    this._buildReactionPad(W, H);
  }

  _buildActionGrid(W, H) {
    const defs = [
      { key:'attack', label:'Attack', desc:'Strike into close range', onPick:()=>this._playerAttack() },
      { key:'guard',  label:'Guard',  desc:'Reduce the next hit', onPick:()=>this._playerGuard() },
      { key:'react',  label:'React',  desc:'Extend the reaction window', onPick:()=>this._startReactionAssist() },
      { key:'skill',  label:'Skill',  desc:'Open skills', onPick:()=>this._openSkillMenu() },
      { key:'item',   label:'Item',   desc:'Open items', onPick:()=>this._openItemMenu() },
      { key:'flee',   label:'Flee',   desc:'Attempt escape', onPick:()=>this._attemptFlee() },
    ];

    this._actionBtns = [];
    const cols = 3, btnW = 258, btnH = 58, gapX = 12, gapY = 10;
    const totalW = cols * btnW + (cols - 1) * gapX;
    const startX = (W - totalW) / 2 + btnW / 2;
    const baseY = H - 48;

    defs.forEach((d, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * (btnW + gapX);
      const y = baseY - row * (btnH + gapY);

      const bg = this.add.rectangle(x, y, btnW, btnH, 0x12051b, 0.95).setStrokeStyle(2, 0x7744aa, 0.8);
      const tx = this.add.text(x, y - 6, d.label, { fontSize:'16px', color:'#fff', fontStyle:'bold' }).setOrigin(0.5);
      const sub = this.add.text(x, y + 14, d.desc, { fontSize:'11px', color:'#ccb4dd' }).setOrigin(0.5);

      bg.setInteractive({ useHandCursor:true });
      bg.on('pointerdown', d.onPick);

      this._actionBtns.push({ rect:bg, text:tx, sub, onConfirm:d.onPick, disabled:false });
    });

    this._mainFocus = new KbdFocus(this, this._actionBtns, cols);
  }

  _buildReactionPad(W, H) {
    const cx = W / 2, cy = H / 2 + 26;
    this._reactionLayer = this.add.container(0, 0).setDepth(9000).setVisible(false);

    const bg = this.add.rectangle(cx, cy, 560, 180, 0x09030f, 0.96).setStrokeStyle(2, 0xff44cc, 0.85);
    const title = this.add.text(cx, cy - 58, 'REACTION WINDOW', { fontSize:'18px', color:'#ffccff', fontStyle:'bold' }).setOrigin(0.5);
    this._reactionPrompt = this.add.text(cx, cy - 20, '', { fontSize:'14px', color:'#ddbbff' }).setOrigin(0.5);
    this._reactionPattern = this.add.text(cx, cy + 18, '', { fontSize:'26px', color:'#fff', fontStyle:'bold' }).setOrigin(0.5);
    this._reactionStatus = this.add.text(cx, cy + 58, '', { fontSize:'13px', color:'#ccbbee' }).setOrigin(0.5);

    this._reactionLayer.add([bg, title, this._reactionPrompt, this._reactionPattern, this._reactionStatus]);

    const defs = [
      { t:'LEFT',  x:cx-172, y:cy+112 },
      { t:'RIGHT', x:cx-56,  y:cy+112 },
      { t:'UP',    x:cx+60,  y:cy+112 },
      { t:'DOWN',  x:cx+176, y:cy+112 },
    ];
    this._reactionBtns = [];
    defs.forEach(d => {
      const rect = this.add.rectangle(d.x, d.y, 104, 42, 0x1b0a2a, 0.96).setStrokeStyle(2, 0xcc88ff, 0.7);
      const txt = this.add.text(d.x, d.y, tokenToGlyph(d.t), { fontSize:'20px', color:'#fff', fontStyle:'bold' }).setOrigin(0.5);
      rect.setInteractive({ useHandCursor:true });
      rect.on('pointerdown', () => this._feedReaction(d.t));
      this._reactionLayer.add([rect, txt]);
      this._reactionBtns.push({ rect, txt, token:d.t });
    });
  }

  _refreshMeters() {
    const s = this.state;
    this._pHp.set(s.hp, s.maxHp);
    this._pSta.set(s.sta, s.maxSta);
    this._pWil.set(s.wil, s.maxWil);
    this._pCorr.set(s.corruption, 100);
    this._eHp.set(this.enemy.hp, this.enemy.maxHp);
    this._ePrs.set(this.enemy.hp, this.enemy.maxHp);
    this._eStn.setText(this.enemy.stunned > 0 ? `STUN ${this.enemy.stunned}` : '');
    this._playerLabel.setText('VERITY');
    this._enemyLabel.setText(this.encounter.label.toUpperCase());
    const tier = corruptionTier(s.corruption);
    const stripped = 5 - intactCount(s.clothing);
    const agg = s.harassment?.knightAggression || 0;
    this._statusTxt.setText(`Day ${s.day}  •  ${tier.label}${stripped > 0 ? `  •  ${stripped} stripped` : ''}  •  Aggro ${agg}`);
    this._logTxt.setText(this._log.slice(-4).join('\n'));
    if (this._reaction) {
      this._reactionPrompt.setText(this._reaction.prompt || 'React now');
      this._reactionPattern.setText(this._reaction.pattern.map(tokenToGlyph).join('   '));
      this._reactionStatus.setText(`Input: ${this._reaction.pattern[this._reaction.index] ? tokenToGlyph(this._reaction.pattern[this._reaction.index]) : 'done'}   Time: ${Math.ceil(this._reaction.timeLeft / 100)}0ms`);
      this._reactionLayer.setVisible(true);
    } else {
      this._reactionLayer.setVisible(false);
    }
    this._actionBtns.forEach(btn => {
      btn.rect.setAlpha(this._modal ? 0.45 : 1);
      btn.text.setAlpha(this._modal ? 0.45 : 1);
      btn.sub.setAlpha(this._modal ? 0.45 : 1);
    });
  }

  _refreshClothing() {
    const icons = { outer:'🧥', upper:'👔', lower:'👗', inner:'🩳', shoes:'👟' };
    const stripped = SLOT_ORDER.map(s => this.state.clothing[s].stripped ? '💔' : icons[s]).join('');
    this._statusTxt.setText(`${this._statusTxt.text}  •  ${stripped}`);
  }

  _resolveEnemyTexture() {
    if (this.encounter.useSkeleton) {
      const k = K(FRAMES.SK_IDLE[0]);
      if (this.textures.exists(k)) return k;
    }
    if (this.encounter.spriteKey && this.textures.exists(this.encounter.spriteKey)) return this.encounter.spriteKey;
    return this.textures.exists('enemy-guard') ? 'enemy-guard' : K(FRAMES.SK_IDLE[0]);
  }

  _buildEnemySets() {
    const enc = this.encounter;
    if (enc.useSkeleton) {
      return {
        idle: FRAMES.SK_IDLE,
        walk: FRAMES.SK_WALK,
        atk: FRAMES.SK_ATK,
        hurt: FRAMES.SK_HURT,
        dead: FRAMES.SK_BLOW,
      };
    }
    return {
      idle: enc.spriteKey ? [enc.spriteKey] : FRAMES.SK_IDLE,
      walk: enc.spriteKey ? [enc.spriteKey] : FRAMES.SK_WALK,
      atk:  enc.atkKey ? [enc.atkKey] : (enc.spriteKey ? [enc.spriteKey] : FRAMES.SK_ATK),
      hurt: enc.hurtKey ? [enc.hurtKey] : (enc.spriteKey ? [enc.spriteKey] : FRAMES.SK_HURT),
      dead: enc.spriteKey ? [enc.spriteKey] : FRAMES.SK_BLOW,
    };
  }

  _pushLog(msg) {
    if (!msg) return;
    this._log.push(msg);
    if (this._log.length > 8) this._log.shift();
  }

  _updateFacing() {
    this._hero.setFlipX(this._hero.x > this._enemy.x);
    this._enemy.setFlipX(this._enemy.x > this._hero.x ? true : false);
  }

  _handlePlayerMovement(delta) {
    if (this._modal || this._reaction) return;
    const left = this._keys.LEFT.isDown || this._keys.A.isDown;
    const right = this._keys.RIGHT.isDown || this._keys.D.isDown;
    const speed = this._keys.SHIFT?.isDown ? 220 : 140;
    let vx = 0;
    if (left) vx -= speed;
    if (right) vx += speed;
    this._hero.x = clamp(this._hero.x + (vx * delta / 1000), this._heroHome.x - 60, this._enemyHome.x - 60);
    if (Math.abs(vx) > 0) {
      if (this._heroAnim.sprite.anims?.currentAnim?.key !== FRAMES.S_WALK?.[0]) {
        this._heroAnim.loop(FRAMES.S_WALK, this._keys.SHIFT?.isDown ? 18 : 14);
      }
    } else if (!this._busy) {
      this._heroAnim.loop(FRAMES.S_IDLE, 9);
    }
  }

  _handleCooldowns(delta) {
    if (this._playerActionCD > 0) this._playerActionCD -= delta;
    if (this._playerGuardUntil > 0) this._playerGuardUntil -= delta;
    if (this._playerVeilUntil > 0) this._playerVeilUntil -= delta;
    if (this._playerFocusUntil > 0) this._playerFocusUntil -= delta;
    if (this.pbuff.bindTurns > 0 && this._playerActionCD <= 0 && this.enemy.stunned <= 0) {
      this.pbuff.bindTurns--;
    }
    if (this.pbuff.veil && this._playerVeilUntil <= 0) this.pbuff.veil = false;
  }

  _handleEnemyCycle(delta) {
    if (this._busy || this._modal) return;

    if (this.enemy.stunned > 0) {
      this.enemy.stunned--;
      this._pushLog(`${this.encounter.label} is stunned.`);
      this._enemyTimer = 1100;
      this._busy = false;
      return;
    }

    if (this._reaction) {
      this._reaction.timeLeft -= delta;
      if (this._reaction.timeLeft <= 0) {
        this._resolveReaction(false);
      }
      return;
    }

    this._enemyTimer -= delta;
    if (this._enemyTimer > 0) return;

    this._beginEnemyTelegraph();
  }

  _beginEnemyTelegraph() {
    if (this._reaction || this._modal) return;
    const intents = this.encounter.intents || ['strike'];
    const intent = intents[this._enemyIntentIndex % intents.length];
    this._enemyIntentIndex++;
    this._enemyIntent = intent;
    const info = INTENT_INFO[intent] || INTENT_INFO.strike;
    this.enemy.intent = intent;
    this._intentTxt.setText(`${info.icon} ${info.label}`);
    this._intentTxt.setColor(info.col);
    this._pushLog(`${this.encounter.label} prepares ${info.label}.`);

    const pattern = REACTION_PATTERNS[intent] || ['LEFT', 'RIGHT'];
    const telegraph = Math.max(950, 1250 - Math.floor((this.state.corruption || 0) * 2));
    this._reaction = {
      prompt: `React to ${info.label}:`,
      pattern,
      index: 0,
      timeLeft: telegraph,
      success: null,
    };
    this._busy = true;
    this._enemyAnim.idle();
    this.tweens.add({
      targets: this._enemy,
      x: this._enemyHome.x - 42,
      duration: telegraph,
      ease: 'Sine.easeOut',
      yoyo: true,
    });
  }

  _handleReactionInput(delta) {
    if (!this._reaction || this._modal) return;
    const tok = this._readReactionToken();
    if (!tok) return;
    this._feedReaction(tok);
  }

  _readReactionToken() {
    if (Phaser.Input.Keyboard.JustDown(this._keys.LEFT) || Phaser.Input.Keyboard.JustDown(this._keys.A)) return 'LEFT';
    if (Phaser.Input.Keyboard.JustDown(this._keys.RIGHT) || Phaser.Input.Keyboard.JustDown(this._keys.D)) return 'RIGHT';
    if (Phaser.Input.Keyboard.JustDown(this._keys.UP) || Phaser.Input.Keyboard.JustDown(this._keys.W)) return 'UP';
    if (Phaser.Input.Keyboard.JustDown(this._keys.DOWN) || Phaser.Input.Keyboard.JustDown(this._keys.S)) return 'DOWN';
    if (Phaser.Input.Keyboard.JustDown(this._keys.SPACE) || Phaser.Input.Keyboard.JustDown(this._keys.ENTER)) return 'SPACE';
    return null;
  }

  _feedReaction(token) {
    if (!this._reaction) return;
    const expected = this._reaction.pattern[this._reaction.index];
    if (token === expected) {
      this._reaction.index++;
      this._reactionStatus?.setText(`Good. Next: ${this._reaction.pattern[this._reaction.index] ? tokenToGlyph(this._reaction.pattern[this._reaction.index]) : 'done'}`);
      if (this._reaction.index >= this._reaction.pattern.length) {
        this._resolveReaction(true);
      }
    } else {
      this._resolveReaction(false);
    }
  }

  _resolveReaction(success) {
    if (!this._reaction) return;
    const intent = this._reaction.intent || this._enemyIntent;
    const info = INTENT_INFO[intent] || INTENT_INFO.strike;
    if (success) {
      this._pushLog(`You break ${info.label.toLowerCase()} and open a gap.`);
      this.enemy.stunned = Math.max(this.enemy.stunned, 1);
      this.enemy.weakened = Math.max(this.enemy.weakened, 1);
      this._enemyAnim.hurt();
      this._heroAnim.loop(FRAMES.S_IDLE, 9);
    } else {
      this._pushLog(`${info.label} lands through the opening.`);
      this._resolveEnemyAttack(intent);
    }
    this._reaction = null;
    this._busy = false;
    this._enemyTimer = 1200;
  }

  _resolveEnemyAttack(intent) {
    const base = this.encounter.atk || 8;
    let dmg = 0, sta = 0, wil = 0, pressure = 0;
    let strip = false, arouse = 0, corrupt = 0, bind = 0;

    switch(intent) {
      case 'strike':
        dmg = base;
        sta = 5;
        pressure = 4;
        break;
      case 'heavyStrike':
        dmg = Math.round(base * 1.5);
        sta = 8;
        pressure = 7;
        break;
      case 'feint':
        dmg = Math.max(1, Math.round(base * 0.35));
        pressure = 2;
        break;
      case 'guard':
        this.enemy.weakened = Math.max(this.enemy.weakened, 1);
        this._pushLog(`${this.encounter.label} braces defensively.`);
        return;
      case 'arouse':
        arouse = 16;
        pressure = 5;
        break;
      case 'heavyStrip':
        strip = true;
        dmg = Math.max(2, Math.round(base * 0.6));
        pressure = 8;
        break;
      case 'bind':
        bind = 1;
        dmg = Math.max(2, Math.round(base * 0.45));
        pressure = 6;
        break;
      case 'voidPulse':
        corrupt = 8;
        dmg = Math.round(base * 0.9);
        wil = 10;
        pressure = 8;
        break;
      default:
        dmg = base;
        pressure = 4;
        break;
    }

    if (this.pbuff.guard || (this._playerGuardUntil > 0)) {
      dmg = Math.ceil(dmg * 0.5);
      sta = Math.ceil(sta * 0.5);
      pressure = Math.ceil(pressure * 0.7);
    }
    if (this.pbuff.veil) {
      dmg = Math.ceil(dmg * 0.35);
      pressure = Math.ceil(pressure * 0.6);
      this.pbuff.veil = false;
      this._playerVeilUntil = 0;
    }
    if (this.pbuff.focusBonus > 0) {
      dmg = Math.max(1, dmg - this.pbuff.focusBonus);
    }

    if (dmg > 0) applyDamage(this.state, dmg, sta, wil, pressure);
    if (arouse > 0) applyArousal(this.state, arouse);
    if (corrupt > 0) applyCorruption(this.state, corrupt);
    if (bind > 0) this.pbuff.bindTurns = Math.max(this.pbuff.bindTurns, bind);
    if (strip) {
      const stripped = damageClothingLayer(this.state, this._pickRandomLayer(), 999);
      if (stripped) this._pushLog(`${stripped} stripped away!`);
    }

    this._enemyAnim.attack(() => {
      if (this.enemy.hp <= 0) return;
      this._enemyAnim.idle();
    });
    this.tweens.add({
      targets: this._enemy,
      x: this._enemyHome.x - 120,
      duration: 170,
      ease: 'Quad.easeOut',
      yoyo: true,
      onComplete: () => {
        this._pushLog(`${this.encounter.label} strikes.`);
        if (this.state.hp <= 0 || this.state.wil <= 0) {
          this._loseBattle();
        }
      }
    });
    this._hero.flash?.(80);
  }

  _pickRandomLayer() {
    const intact = SLOT_ORDER.filter(slot => !this.state.clothing[slot].stripped);
    if (!intact.length) return 'outer';
    return intact[Phaser.Math.Between(0, intact.length - 1)];
  }

  _playerAttack() {
    if (this._busy || this._modal) return;
    if (this._playerActionCD > 0) return;
    if (this.state.sta <= 0) return;

    this._busy = true;
    this._playerActionCD = 520;
    const bound = isHBound(this.state);
    const base = bound ? 4 : 12 + Math.floor((100 - this.state.corruption) / 18);
    const bonus = this.pbuff.focusBonus || 0;
    const dmg = Math.max(1, base + bonus - Math.floor(this.enemy.weakened || 0));
    this.enemy.hp = Math.max(0, this.enemy.hp - dmg);
    this.state.sta = Math.max(0, this.state.sta - 5);
    this._pushLog(`Verity hits for ${dmg}.`);

    this._heroAnim.once(FRAMES.S_ATK1, 13, () => {
      this._heroAnim.loop(FRAMES.S_IDLE, 9);
      this._busy = false;
      this.pbuff.focusBonus = 0;
      this.tweens.add({
        targets: this._hero,
        x: this._heroHome.x + 86,
        duration: 110,
        ease: 'Quad.easeOut',
        yoyo: true,
      });
    });

    this.tweens.add({
      targets: this._enemy,
      x: this._enemyHome.x - 56,
      duration: 120,
      ease: 'Quad.easeOut',
      yoyo: true,
    });
    this._enemyAnim.hurt(() => this._enemyAnim.idle());

    if (this.enemy.hp <= 0) {
      this.time.delayedCall(180, () => this._winBattle());
    }
  }

  _playerGuard() {
    if (this._busy || this._modal) return;
    if (this._playerActionCD > 0) return;
    this._busy = true;
    this._playerActionCD = 300;
    this.pbuff.guard = true;
    this._playerGuardUntil = 1100;
    this._pushLog('You brace yourself.');
    this._heroAnim.loop(FRAMES.S_GUARD || FRAMES.S_IDLE, 10);
    this.time.delayedCall(260, () => {
      this._busy = false;
      this._heroAnim.loop(FRAMES.S_IDLE, 9);
    });
  }

  _startReactionAssist() {
    if (!this._reaction) {
      this._pushLog('No attack is charging yet.');
      return;
    }
    this._reaction.timeLeft += 220;
    this._pushLog('You steady your footing.');
  }

  _openSkillMenu() {
    if (this._busy || this._modal) return;
    const available = SKILLS.filter(sk => this.state.corruption >= sk.minCorruption && this.state.sta >= sk.staCost);
    if (!available.length) {
      this._pushLog('No usable skills right now.');
      return;
    }
    this._openChoiceMenu('Skills', available.map(sk => ({
      label: `${sk.label}  (${sk.staCost} STA)`,
      desc: sk.desc,
      disabled: this.state.sta < sk.staCost,
      onPick: () => {
        this._closeModal();
        this.state.sta = Math.max(0, this.state.sta - sk.staCost);
        const msg = sk.effect(this.state, this);
        if (msg) this._pushLog(msg);
        this._heroAnim.loop(FRAMES.S_ATK2 || FRAMES.S_ATK1, 12);
        this._busy = true;
        this.time.delayedCall(280, () => {
          this._busy = false;
          this._heroAnim.loop(FRAMES.S_IDLE, 9);
          if (this.enemy.hp <= 0) this._winBattle();
        });
      }
    })), 1);
  }

  _openItemMenu() {
    if (this._busy || this._modal) return;
    const usable = Object.entries(ITEMS).filter(([k, item]) => (this.state.items[k] || 0) > 0 && item.usableInBattle);
    if (!usable.length) {
      this._pushLog('No usable items.');
      return;
    }
    this._openChoiceMenu('Items', usable.map(([key, item]) => ({
      label: `${item.label} ×${this.state.items[key] || 0}`,
      desc: item.desc,
      onPick: () => {
        this._closeModal();
        const msg = item.effect(this.state, this);
        this.state.items[key] = Math.max(0, (this.state.items[key] || 0) - 1);
        if (msg) this._pushLog(msg);
        if (key === 'flashFlask' && this.enemy.stunned <= 0) this.enemy.stunned = 1;
      }
    })), 1);
  }

  _attemptFlee(force = false) {
    if (this._busy && !force) return;
    const chance = this.encounter.isBoss ? 0.18 : 0.52;
    const roll = Math.random();
    if (roll < chance || force === true && this._battleDone) {
      this._pushLog('You retreat from the fight.');
      this._finishBattle('fled');
    } else {
      this._pushLog('You fail to break away.');
      this._enemyTimer = 350;
    }
  }

  _openChoiceMenu(title, entries, cols = 1) {
    this._closeModal();
    const W = this.scale.width;
    const H = this.scale.height;
    const cx = W / 2;
    const cy = H / 2;
    const w = Math.min(720, W - 80);
    const h = Math.min(90 + entries.length * 72, H - 120);
    const overlay = this.add.container(0, 0).setDepth(9500);
    overlay.add(this.add.rectangle(W/2, H/2, W, H, 0x000000, 0.58));
    overlay.add(this.add.rectangle(cx, cy, w, h, 0x09030f, 0.97).setStrokeStyle(2, 0xcc44ff, 0.75));
    overlay.add(this.add.text(cx, cy - h/2 + 32, title.toUpperCase(), { fontSize:'22px', color:'#ffddff', fontStyle:'bold' }).setOrigin(0.5));
    const buttons = [];
    const startY = cy - h/2 + 78;
    entries.forEach((ent, idx) => {
      const y = startY + idx * 64;
      const rect = this.add.rectangle(cx, y, w - 40, 52, ent.disabled ? 0x1a1022 : 0x160720, 0.96).setStrokeStyle(2, 0x7744aa, ent.disabled ? 0.3 : 0.75);
      const text = this.add.text(cx, y - 8, ent.label, { fontSize:'15px', color: ent.disabled ? '#665577' : '#fff', fontStyle:'bold' }).setOrigin(0.5);
      const sub = this.add.text(cx, y + 12, ent.desc || '', { fontSize:'11px', color:'#ccbbee' }).setOrigin(0.5);
      rect.setInteractive({ useHandCursor: !ent.disabled });
      if (!ent.disabled) rect.on('pointerdown', ent.onPick);
      overlay.add([rect, text, sub]);
      buttons.push({ rect, text, sub, disabled: !!ent.disabled, onConfirm: ent.onPick });
    });
    const focus = new KbdFocus(this, buttons, cols);
    const closeKey = this.input.keyboard.addKey('ESC');
    closeKey.once('down', () => {
      focus.destroy();
      this._closeModal();
    });
    this._modal = { overlay, focus };
  }

  _closeModal() {
    if (!this._modal) return;
    this._modal.focus?.destroy();
    this._modal.overlay?.destroy(true);
    this._modal = null;
  }

  _winBattle() {
    if (this._battleDone) return;
    this._battleDone = true;
    applyVictoryReward(this.state, this.encounter.reward || {});
    saveState(this.state);
    this.cameras.main.fadeOut(220, 0, 0, 0, false, () => {
      this.scene.stop();
      this.scene.resume(this._return, {
        battleDone: true,
        outcome: 'victory',
        encounterId: this.encounter.id,
        state: this.state,
      });
    });
  }

  _loseBattle() {
    if (this._battleDone) return;
    this._battleDone = true;
    const strippedLayer = applyDefeatConsequences(this.state, this.encounter);
    saveState(this.state);
    this.cameras.main.fadeOut(220, 0, 0, 0, false, () => {
      this.scene.stop();
      this.scene.resume(this._return, {
        battleDone: true,
        outcome: 'defeat',
        encounterId: this.encounter.id,
        strippedLayer,
        state: this.state,
      });
    });
  }
}
