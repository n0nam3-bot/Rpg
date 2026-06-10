import {
  normalizeState, saveState, clamp,
  FramePlayer, KbdFocus, K, FRAMES,
  makeMeter, corruptionTier,
  applyCorruption, applyDamage, applyArousal, isHBound,
  totalClothingDef, damageClothingLayer, stripFirstIntactLayer,
  applyVictoryReward, applyDefeatConsequences, intactCount, SLOT_ORDER,
} from './util.js';
import { SKILLS, ITEMS } from './data.js';

// ─── INTENT TABLE ─────────────────────────────────────────────────────────
const INTENT_INFO = {
  strike:      { icon:'⚔',  label:'STRIKE',     col:'#ff8888' },
  heavyStrike: { icon:'💢', label:'HEAVY',       col:'#ff4444' },
  guard:       { icon:'🛡',  label:'GUARD',       col:'#88aaff' },
  feint:       { icon:'🌀', label:'FEINT',        col:'#ffcc44' },
  arouse:      { icon:'💜', label:'AROUSE',       col:'#ff44cc' },
  heavyStrip:  { icon:'💔', label:'STRIP!',       col:'#ff0088' },
  bind:        { icon:'⛓',  label:'BIND',         col:'#cc44ff' },
  voidPulse:   { icon:'🌑', label:'VOID PULSE',   col:'#8800ff' },
};

// ─── BATTLE SCENE ─────────────────────────────────────────────────────────
export class BattleScene extends Phaser.Scene {
  constructor() { super({ key:'BattleScene' }); }

  init(data = {}) {
    this.state     = normalizeState(data.state);
    this.encounter = data.encounter;
    this._return   = data.returnTo || 'WorldScene';
    this._ended    = false;
    this._busy     = false;
    this._turn     = 'player';
    this._kbd      = null;

    this.enemy = { hp: this.encounter.hp, maxHp: this.encounter.hp, stunned: 0, weakened: 0 };

    this.pbuff = { guard: false, veil: false, focusBonus: 0, bindTurns: 0 };
    this._log = [];
    // Home X positions for sprites
    this._heroHomeX   = 200;
    this._enemyHomeX  = 1060;
  }

  create() {
    const W = this.scale.width, H = this.scale.height;
    this.input.addPointer(4);

    // ── BACKGROUND ─────────────────────────────────────────────────────────
    this._buildBackground(W, H);

    // Corruption-tinted atmosphere overlay
    const tier = corruptionTier(this.state.corruption);
    this.add.rectangle(W/2, H/2, W, H, tier.color, 0.06 + tier.tier * 0.02);

    // ── SPRITES ────────────────────────────────────────────────────────────
    const heroKey = K(FRAMES.S_IDLE[0]);
    const heroTex = this.textures.exists(heroKey) ? heroKey : 'npc-elder';
    this._heroObj  = this.add.sprite(this._heroHomeX, 360, heroTex).setScale(1.2).setOrigin(0.5, 1).setDepth(200);
    this._heroFP   = new FramePlayer(this, this._heroObj);
    this._heroFP.loop(FRAMES.S_IDLE, 9);

    // Clothing visual tint on hero: stripped layers cause colour shift
    this._updateHeroTint();

    const enemyTex = this._resolveEnemyTex();
    this._enemyObj = this.add.sprite(this._enemyHomeX, 360, enemyTex).setScale(1.15).setOrigin(0.5, 1).setFlipX(true).setDepth(200);
    this._enemyFP  = new FramePlayer(this, this._enemyObj);
    this._enemyFP.loop(this._enemyIdleFrames(), 8);

    // Boss: larger scale + aura
    if (this.encounter.isBoss) {
      this._heroObj.setScale(1.1);
      this._enemyObj.setScale(1.4);
      this._bossAura();
    }

    // ── STATUS BARS ────────────────────────────────────────────────────────
    this._buildStatusBars(W, H);

    // ── VN-STYLE LOG BOX ───────────────────────────────────────────────────
    this.add.rectangle(W/2, H-68, W-20, 118, 0x06020d, 0.92).setStrokeStyle(1, 0x6622aa, 0.5).setDepth(400);
    this._logText = this.add.text(26, H-120, '', {
      fontSize:'15px', color:'#ddd0ee', wordWrap:{ width: W-60 }, lineSpacing:3,
    }).setDepth(401);

    // ── INTENT BADGE ───────────────────────────────────────────────────────
    this.add.rectangle(this._enemyHomeX, 80, 230, 46, 0x08020e, 0.88).setStrokeStyle(2, 0x6622aa, 0.6).setDepth(350);
    this._intentTxt = this.add.text(this._enemyHomeX, 80, '? INTENT', {
      fontSize:'16px', color:'#ff88cc', fontStyle:'bold',
    }).setOrigin(0.5).setDepth(351);

    // ── CLOTHING STRIP DISPLAY ─────────────────────────────────────────────
    this._buildClothingDisplay(W, H);

    // ── TURN BANNER ────────────────────────────────────────────────────────
    this.add.rectangle(W/2, H-150, W, 28, 0x0c0422, 0.9).setDepth(399);
    this._turnBanner = this.add.text(W/2, H-150, '— YOUR TURN —', {
      fontSize:'17px', color:'#ddbbff', fontStyle:'bold',
    }).setOrigin(0.5).setDepth(400);

    // ── ACTION BUTTONS ─────────────────────────────────────────────────────
    this._buildActionButtons(W, H);

    // Number key shortcuts
    const nkeys = this.input.keyboard.addKeys('ONE,TWO,THREE,FOUR,FIVE,SIX,SEVEN');
    [1,2,3,4,5,6,7].forEach((n,i) => nkeys[['ONE','TWO','THREE','FOUR','FIVE','SIX','SEVEN'][i]].on('down', () => this._chooseAction(i)));

    // ── BATTLE START ───────────────────────────────────────────────────────
    if (this.encounter.isBoss) {
      this._showBossIntro();
    } else {
      this._pushLog(`${this.encounter.label} blocks your path!`);
      this._pushLog(this.encounter.lore);
      this.time.delayedCall(100, () => this._pickEnemyIntent());
    }

    this.cameras.main.fadeIn(300, 4, 2, 10);
    this._refreshAll();
  }

  // ─── BACKGROUND ─────────────────────────────────────────────────────────
  _buildBackground(W, H) {
    const bgKey = this.textures.exists('bg-corridor') ? 'bg-corridor' :
                  this.textures.exists(K(FRAMES.S_IDLE[0])) ? null : null;
    if (bgKey) {
      this.add.image(W/2, H/2, bgKey).setDisplaySize(W, H).setTint(0x0e0518);
    } else {
      // Procedural dark dungeon
      const g = this.add.graphics();
      g.fillGradientStyle(0x06020e, 0x06020e, 0x10041a, 0x10041a, 1);
      g.fillRect(0, 0, W, H);
      // Floor
      g.fillStyle(0x0c0420, 1); g.fillRect(0, H*0.62, W, H*0.38);
      g.lineStyle(2, 0x440066, 0.6); g.lineBetween(0, H*0.62, W, H*0.62);
      // Stone blocks on floor
      for (let bx=0; bx<W; bx+=160) {
        g.lineStyle(1, 0x220033, 0.3);
        g.lineBetween(bx, H*0.62, bx, H);
      }
      // Pillars
      [180, 500, 780, 1100].forEach(px => {
        g.fillStyle(0x18082e, 1); g.fillRect(px-18, 0, 36, H*0.62);
        g.lineStyle(1, 0x440066, 0.4); g.strokeRect(px-18, 0, 36, H*0.62);
      });
      // Atmospheric glow
      g.fillStyle(0xcc00ff, 0.03); g.fillCircle(W/2, H*0.4, 300);
    }
  }

  // ─── RESOLVE ENEMY TEXTURE ──────────────────────────────────────────────
  _resolveEnemyTex() {
    // Check for external downloaded sprite first
    const extMap = {
      minotaur: 'enemy-minotaur', goblin: 'enemy-goblin',
      gorgon: 'enemy-gorgon', vampire: 'enemy-vampire',
      knight: 'enemy-knight', wizard: 'enemy-wizard',
    };
    if (extMap[this.encounter.spriteFamily] && this.textures.exists(extMap[this.encounter.spriteFamily]))
      return extMap[this.encounter.spriteFamily];

    // Skeleton sprite pack for undead enemies
    if (this.encounter.useSkeleton) {
      const skKey = K(FRAMES.SK_IDLE[0]);
      if (this.textures.exists(skKey)) return skKey;
    }

    // Procedural fallback
    return this.textures.exists(this.encounter.spriteKey || 'enemy-guard')
      ? (this.encounter.spriteKey || 'enemy-guard') : 'enemy-guard';
  }

  _enemyIdleFrames() {
    if (this.encounter.useSkeleton && this.textures.exists(K(FRAMES.SK_IDLE[0])))
      return FRAMES.SK_IDLE;
    return null; // single frame from setTexture
  }

  // ─── BOSS AURA ──────────────────────────────────────────────────────────
  _bossAura() {
    const aura = this.add.graphics().setDepth(190);
    let t = 0;
    this.time.addEvent({ delay: 60, repeat: -1, callback: () => {
      aura.clear();
      const pulse = 0.06 + Math.sin(t) * 0.03;
      t += 0.1;
      aura.fillStyle(0xcc00ff, pulse);
      aura.fillCircle(this._enemyHomeX, 300, 120);
    }});
  }

  // ─── STATUS BARS ────────────────────────────────────────────────────────
  _buildStatusBars(W, H) {
    const d = 300;
    // Player side (left top)
    this.add.rectangle(150, 68, 308, 132, 0x06010c, 0.88).setStrokeStyle(1,0x4422aa,0.5).setDepth(d);
    this.add.text(14, 14, 'VERITY', {fontSize:'18px',color:'#ddd',fontStyle:'bold'}).setDepth(d+1);
    this._pHp   = makeMeter(this, 12, 38, 284, 'HP',   0xff6688, d+1);
    this._pSta  = makeMeter(this, 12, 58, 284, 'STA',  0x44aaff, d+1);
    this._pWil  = makeMeter(this, 12, 78, 284, 'WIL',  0xaaffaa, d+1);
    this._pCorr = makeMeter(this, 12, 98, 284, 'CORR', 0xcc00ff, d+1);
    this._pArou = makeMeter(this, 12,118, 284, 'AROU', 0xff44bb, d+1);

    // Enemy side (right top)
    this.add.rectangle(W-148, 52, 296, 92, 0x06010c, 0.88).setStrokeStyle(1,0x4422aa,0.5).setDepth(d);
    this.add.text(W-290, 14, this.encounter.label.toUpperCase(), {fontSize:'15px',color:'#ffcccc',fontStyle:'bold'}).setDepth(d+1);
    this._eHp   = makeMeter(this, W-292, 38, 280, 'HP',   0xff4444, d+1);
    this._ePres = makeMeter(this, W-292, 60, 280, 'PRSS', 0xff8833, d+1);
    this._eStun = this.add.text(W-148, 86, '', {fontSize:'12px',color:'#ffcc44',fontStyle:'bold'}).setOrigin(0.5).setDepth(d+1);
  }

  // ─── CLOTHING DISPLAY ───────────────────────────────────────────────────
  _buildClothingDisplay(W, H) {
    const cx = 150, cy = H-150;
    this.add.rectangle(cx, cy, 300, 24, 0x06010c, 0.8).setStrokeStyle(1,0x4422aa,0.4).setDepth(395);
    this._clothTxt = this.add.text(cx, cy, '', {fontSize:'12px',color:'#aaa',fontStyle:'bold'}).setOrigin(0.5).setDepth(396);
    this._refreshClothing();
  }

  _refreshClothing() {
    const c = this.state.clothing;
    const icons = { outer:'🧥', upper:'👔', lower:'👗', inner:'🩳', shoes:'👟' };
    const strip = { outer:'💔', upper:'💔', lower:'💔', inner:'❌', shoes:'💔' };
    const str = SLOT_ORDER.map(s => c[s].stripped ? strip[s] : icons[s]).join('');
    const intact = intactCount(c);
    const col = intact === 5 ? '#88ff88' : intact >= 3 ? '#ffcc44' : '#ff4444';
    this._clothTxt?.setColor(col).setText(`${str}  DEF+${totalClothingDef(c)}`);
  }

  _updateHeroTint() {
    const intact = intactCount(this.state.clothing);
    const corr   = this.state.corruption;
    if (intact <= 1)      { this._heroObj.setTint(0xff8888); }
    else if (intact <= 3) { this._heroObj.setTint(0xffccdd); }
    else if (corr >= 75)  { this._heroObj.setTint(0xdd88ff); }
    else if (corr >= 50)  { this._heroObj.setTint(0xeeccff); }
    else                  { this._heroObj.clearTint(); }
  }

  // ─── ACTION BUTTONS ─────────────────────────────────────────────────────
  _buildActionButtons(W, H) {
    this._kbdFocus?.destroy();
    this._btns?.forEach(b => { b.bg?.destroy(); b.txt?.destroy(); });
    this._btns = [];

    const actions = this._getActions();
    const COLS = 4, btnW = 280, btnH = 62, padX = 24, gapX = 8, y0 = H - 56;

    const totalRowW = COLS * btnW + (COLS-1)*gapX;
    const startX = (W - totalRowW) / 2 + btnW/2;

    actions.forEach((act, i) => {
      const col    = i % COLS;
      const row    = Math.floor(i / COLS);
      const x      = startX + col*(btnW+gapX);
      const y      = y0 - row*(btnH+gapX);

      const fillCol   = act.disabled ? 0x0a0612 : act.corruption ? 0x1e0030 : 0x100820;
      const strokeCol = act.disabled ? 0x221133 : act.corruption ? 0xcc00ff : 0x7744aa;

      const bg = this.add.rectangle(x, y, btnW, btnH, fillCol, act.disabled ? 0.6 : 0.94)
        .setStrokeStyle(2, strokeCol, act.disabled ? 0.3 : 0.8).setScrollFactor(0).setDepth(500);

      const labelColor = act.disabled ? '#443355' : act.corruption ? '#ff44ff' : '#ddccee';
      const txt = this.add.text(x, y-4, `${i+1}. ${act.label}`, {
        fontSize:'15px', color:labelColor, fontStyle:act.corruption ? 'bold' : 'normal',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(501);

      if (act.desc) {
        this.add.text(x, y+16, act.desc, { fontSize:'11px', color:'#776688' }).setOrigin(0.5).setScrollFactor(0).setDepth(501);
      }

      if (!act.disabled) {
        bg.setInteractive({ useHandCursor: true });
        bg.on('pointerdown', () => this._chooseAction(i));
        bg.on('pointerover', () => bg.setFillStyle(act.corruption ? 0x380060 : 0x1e1040, 0.95));
        bg.on('pointerout',  () => bg.setFillStyle(fillCol, 0.94));
      }

      this._btns.push({ bg, txt, disabled: act.disabled, onConfirm: () => this._chooseAction(i), corruptionSkill: act.corruption });
    });

    // Keyboard focus navigator (non-disabled buttons only)
    this._kbdFocus = new KbdFocus(this, this._btns, COLS);
  }

  _getActions() {
    const s = this.state;
    const hb    = isHBound(s);
    const bound = this.pbuff.bindTurns > 0;
    const availSkills = SKILLS.filter(sk => s.corruption >= sk.minCorruption && s.sta >= sk.staCost);
    const topSkill    = availSkills[availSkills.length - 1] || null;
    const hasItem     = Object.values(s.items).some(v => v > 0);

    return [
      {
        label:    hb ? 'Struggle' : 'Attack',
        desc:     hb ? 'Break free from binding' : 'Quick combo strike',
        disabled: false,
        corruption: false,
      },
      {
        label:    'Heavy',
        desc:     'Powerful blow (+STA)',
        disabled: bound || hb || s.sta < 14,
        corruption: false,
      },
      {
        label:    'Guard',
        desc:     'Halve damage, recover',
        disabled: bound,
        corruption: false,
      },
      {
        label:    'Focus',
        desc:     'Redirect, empower next',
        disabled: false,
        corruption: false,
      },
      {
        label:    topSkill ? topSkill.label : 'Skill',
        desc:     topSkill ? `CORR${topSkill.minCorruption}+` : `Need CORR 25+`,
        disabled: !topSkill,
        corruption: !!topSkill,
      },
      {
        label:    bound && s.items.flashFlask > 0 ? 'Flash Flask!' : 'Item',
        desc:     !hasItem ? 'No items' : '',
        disabled: !hasItem,
        corruption: false,
      },
      {
        label:    'Flee',
        desc:     'Attempt escape',
        disabled: false,
        corruption: false,
      },
    ];
  }

  // ─── REFRESH ALL ────────────────────────────────────────────────────────
  _refreshAll() {
    const s = this.state;
    this._pHp.set(s.hp,  s.maxHp);
    this._pSta.set(s.sta, s.maxSta);
    this._pWil.set(s.wil, s.maxWil);
    this._pCorr.set(s.corruption, 100);
    this._pArou.set(s.arousal,    100);
    this._eHp.set(this.enemy.hp, this.enemy.maxHp);
    this._ePres.set(this.enemy.hp, this.enemy.maxHp); // enemy pressure proxy
    this._eStun.setText(this.enemy.stunned > 0 ? `STUNNED ${this.enemy.stunned}T` : '');
    this._refreshClothing();
    this._updateHeroTint();
    this._refreshIntent();

    // H-Bound visual
    if (isHBound(s)) {
      this._turnBanner.setText('⛓ H-BOUND — Struggle or use Flash Flask! ⛓').setColor('#ff44cc');
    } else if (this.pbuff.bindTurns > 0) {
      this._turnBanner.setText(`⛓ BOUND (${this.pbuff.bindTurns} turns) — Struggle or Flash Flask`).setColor('#cc44ff');
    } else if (this._turn === 'player') {
      this._turnBanner.setText('— YOUR TURN —').setColor('#ddbbff');
    } else {
      this._turnBanner.setText('— ENEMY TURN —').setColor('#ff8888');
    }
  }

  _refreshIntent() {
    const info = INTENT_INFO[this.enemy.intent] || INTENT_INFO.strike;
    this._intentTxt?.setText(`${info.icon} ${info.label}`).setColor(info.col);
  }

  _pushLog(msg) {
    if (!msg) return;
    this._log.push(msg);
    if (this._log.length > 4) this._log.shift();
    this._logText?.setText(this._log.slice(-3).join('\n'));
  }

  // ─── PICK ENEMY INTENT ──────────────────────────────────────────────────
  _pickEnemyIntent() {
    if (this._ended) return;
    const intents = [...this.encounter.intents];
    if (this.state.pressure  > 55 && this.encounter.arousalAttack) intents.push('arouse');
    if (this.state.corruption > 40 && this.encounter.stripChance > 0.2) intents.push('heavyStrip');
    this.enemy.intent = this.enemy.stunned > 0 ? 'guard' : Phaser.Math.RND.pick(intents);
    this._refreshIntent();
  }

  // ─── CHOOSE ACTION ──────────────────────────────────────────────────────
  _chooseAction(i) {
    if (this._ended || this._busy || this._turn !== 'player') return;
    const acts = this._getActions();
    if (i >= acts.length || acts[i].disabled) return;
    this._kbdFocus?.destroy(); this._kbdFocus = null;
    this._busy = true;
    switch(i) {
      case 0: return isHBound(this.state) ? this._doStruggle() : this._doAttack(false);
      case 1: return this._doAttack(true);
      case 2: return this._doGuard();
      case 3: return this._doFocus();
      case 4: return this._doSkill();
      case 5: return this._doItem();
      case 6: return this._doFlee();
      default: this._busy = false;
    }
  }

  // ─── PLAYER ACTIONS ─────────────────────────────────────────────────────
  _doAttack(heavy) {
    const s  = this.state;
    const atkFrames = heavy ? FRAMES.S_ATK2 : Phaser.Math.RND.pick([FRAMES.S_ATK1, FRAMES.S_ATK3]);

    // Step toward enemy
    this.tweens.add({ targets: this._heroObj, x: this._heroHomeX + 280, duration: 200, ease:'Quad.easeIn',
      onComplete: () => {
        // Play attack anim
        this._heroFP.once(atkFrames, 16, () => {
          const base = heavy ? 20 : 12;
          const bonus = Math.floor(this.pbuff.focusBonus / 2.5) + corruptionTier(s.corruption).tier;
          let dmg = Math.max(1, base + bonus + Math.floor(s.day * 0.7));
          if (this.enemy.intent === 'guard') dmg = Math.round(dmg * 0.5);
          if (this.enemy.weakened > 0) { dmg = Math.round(dmg * 1.25); this.enemy.weakened--; }
          if (heavy) s.sta = clamp(s.sta - 14, 0, s.maxSta);
          else       s.sta = clamp(s.sta - 5,  0, s.maxSta);
          this.pbuff.focusBonus = 0; this.pbuff.guard = false;

          this.enemy.hp = clamp(this.enemy.hp - dmg, 0, this.enemy.maxHp);
          this._pushLog(`${heavy ? 'Heavy strike' : 'Attack'} — ${dmg} damage!`);
          this._hitEffect(this._enemyObj, dmg, '#ff4444');
          if (s.settings.shake) this.cameras.main.shake(35, 0.004);

          // Enemy react
          this._enemyFP.once(this.encounter.useSkeleton ? FRAMES.SK_HURT : FRAMES.SK_HURT, 12, () => {
            this._enemyFP.loop(this._enemyIdleFrames() || FRAMES.SK_IDLE, 8);
          });

          // Step back
          this.tweens.add({ targets: this._heroObj, x: this._heroHomeX, duration: 180, ease:'Quad.easeOut',
            onComplete: () => {
              this._heroFP.loop(FRAMES.S_IDLE, 9);
              this._refreshAll();
              this._finishPlayerTurn();
            }
          });
        });
      }
    });
  }

  _doStruggle() {
    const s = this.state;
    const chance = 0.35 + (s.wil / s.maxWil) * 0.35;
    this._heroFP.once(FRAMES.S_HURT, 12, () => {
      if (Math.random() < chance) {
        this.pbuff.bindTurns = 0;
        s.arousal = clamp(s.arousal - 22, 0, 100);
        this._pushLog('You break free from the binding!');
        this._hitEffect(this._heroObj, 0, '#88ff88', '+Freed');
      } else {
        applyArousal(s, 10);
        this._pushLog('You struggle… but remain bound. Arousal rises.');
      }
      this._heroFP.loop(FRAMES.S_IDLE, 9);
      this._refreshAll();
      this._finishPlayerTurn();
    });
  }

  _doGuard() {
    this.pbuff.guard = true;
    this.state.sta = clamp(this.state.sta + 10, 0, this.state.maxSta);
    this.state.wil = clamp(this.state.wil + 4,  0, this.state.maxWil);
    this._heroFP.loop(FRAMES.S_GUARD, 8);
    this._pushLog('Guard stance — incoming damage halved. STA/WIL restored.');
    this._refreshAll();
    this._finishPlayerTurn();
  }

  _doFocus() {
    this.pbuff.focusBonus = clamp(this.pbuff.focusBonus + 24, 0, 80);
    this.state.sta    = clamp(this.state.sta  + 14, 0, this.state.maxSta);
    this.state.wil    = clamp(this.state.wil  + 6,  0, this.state.maxWil);
    this.state.arousal = clamp(this.state.arousal - 12, 0, 100);
    this._pushLog(`Focus deepens. Arousal redirected. Next attack +${this.pbuff.focusBonus} power.`);
    // Brief golden flash on hero
    this._heroObj.setTint(0xffeeaa);
    this.time.delayedCall(300, () => this._updateHeroTint());
    this._refreshAll();
    this._finishPlayerTurn();
  }

  _doSkill() {
    const s = this.state;
    const avail = SKILLS.filter(sk => s.corruption >= sk.minCorruption && s.sta >= sk.staCost);
    if (!avail.length) { this._pushLog('No skill available.'); this._busy = false; return; }
    const skill = avail[avail.length - 1];
    s.sta = clamp(s.sta - skill.staCost, 0, s.maxSta);

    // Dramatic corruption visual
    this._corruptionFlash(skill.id);
    this.time.delayedCall(200, () => {
      const msg = skill.effect(s, this);
      this._pushLog(`[${corruptionTier(s.corruption).label}] ${msg}`);
      this._refreshAll();
      this._finishPlayerTurn();
    });
  }

  _corruptionFlash(skillId) {
    const W = this.scale.width, H = this.scale.height;
    const colors = { darkVeil:0x220044, soulDrain:0x440066, voidBurst:0x8800ff };
    const col = colors[skillId] || 0x330044;
    const overlay = this.add.rectangle(W/2, H/2, W, H, col, 0).setDepth(600);
    this.tweens.add({ targets: overlay, alpha:{ from:0, to:0.5 }, duration:200, yoyo:true, onComplete: () => overlay.destroy() });
    this._heroObj.setTint(0xcc44ff);
    this.time.delayedCall(450, () => this._updateHeroTint());
  }

  _doItem() {
    const s = this.state;
    let msg = '', used = false;

    if (this.pbuff.bindTurns > 0 && s.items.flashFlask > 0) {
      s.items.flashFlask--;
      this.enemy.stunned = Math.max(this.enemy.stunned, 1);
      this.pbuff.bindTurns = 0;
      s.arousal = clamp(s.arousal - 30, 0, 100);
      msg = 'Flash Flask detonates — binding broken, enemy stunned, arousal −30!';
      used = true;
    } else if (s.items.healingPotion > 0) {
      s.items.healingPotion--;
      s.hp  = clamp(s.hp  + 35, 0, s.maxHp);
      s.sta = clamp(s.sta + 10, 0, s.maxSta);
      msg   = 'Healing Potion — +35 HP, +10 STA.';
      used  = true;
      this._heroObj.setTint(0x88ff88); this.time.delayedCall(400, () => this._updateHeroTint());
    } else if (s.items.flashFlask > 0) {
      s.items.flashFlask--;
      this.enemy.stunned = Math.max(this.enemy.stunned, 1);
      s.arousal = clamp(s.arousal - 28, 0, 100);
      msg   = 'Flash Flask — enemy stunned, arousal −28.';
      used  = true;
    } else if (s.items.holyWater > 0) {
      s.items.holyWater--;
      s.corruption = clamp(s.corruption - 10, 0, 100);
      s.wil        = clamp(s.wil + 12, 0, s.maxWil);
      const bonusDmg = this.encounter.isBoss ? 30 : 0;
      if (bonusDmg) this.enemy.hp = clamp(this.enemy.hp - bonusDmg, 0, this.enemy.maxHp);
      msg = `Holy Water — Corruption −10, WIL +12.${bonusDmg ? ' Scalds Patron for '+bonusDmg+'!':''}`;
      used = true;
      this._heroObj.setTint(0xaaddff); this.time.delayedCall(400, () => this._updateHeroTint());
    }

    if (!used) { this._pushLog('No usable items.'); this._busy = false; return; }
    this._pushLog(msg);
    this._refreshAll();
    this._finishPlayerTurn();
  }

  _doFlee() {
    const s = this.state;
    const chance = 0.38 + (s.sta / s.maxSta) * 0.28 - (s.pressure / 100) * 0.12;
    if (Math.random() < chance) {
      s.pressure = clamp(s.pressure + 4, 0, 100);
      s.arousal  = 0;
      this._pushLog('You retreat from the fight.');
      this._ended = true;
      saveState(s);
      this.time.delayedCall(800, () => this._returnToWorld({ outcome:'flee' }));
    } else {
      s.pressure = clamp(s.pressure + 8, 0, 100);
      this._pushLog('Escape failed — enemy retaliates!');
      this._refreshAll();
      this._busy = false;
      this._turn = 'enemy';
      this.time.delayedCall(300, () => this._enemyTurn(true));
    }
  }

  _finishPlayerTurn() {
    if (this._checkEnd()) return;
    this._turn = 'enemy';
    this._refreshAll();
    // Brief pause then enemy turn
    this.time.delayedCall(400, () => {
      this._pickEnemyIntent();
      this.time.delayedCall(500, () => this._enemyTurn(false));
    });
  }

  // ─── ENEMY TURN ─────────────────────────────────────────────────────────
  _enemyTurn(punishFlee = false) {
    if (this._ended) return;
    const s      = this.state;
    const intent = this.enemy.intent;
    const gm     = this.pbuff.guard ? 0.44 : 1.0;
    const vm     = this.pbuff.veil  ? 0.18 : 1.0;
    const wm     = this.enemy.weakened > 0 ? 0.75 : 1.0;
    this.pbuff.guard = false; this.pbuff.veil = false;
    if (this.enemy.weakened > 0) this.enemy.weakened--;
    let strippedLayer = null;

    // Step toward player
    this.tweens.add({ targets: this._enemyObj, x: this._enemyHomeX - 300, duration: 200, ease:'Quad.easeIn',
      onComplete: () => {
        const atkF = this.encounter.useSkeleton ? FRAMES.SK_ATK : [this._resolveEnemyTex()];
        this._enemyFP.once(this.encounter.useSkeleton ? FRAMES.SK_ATK : FRAMES.SK_ATK, 14, () => {
          // Calculate effect
          strippedLayer = this._applyEnemyIntent(intent, s, gm, vm, wm, punishFlee);

          this._refreshAll();
          saveState(s);

          // Step back
          this.tweens.add({ targets: this._enemyObj, x: this._enemyHomeX, duration: 200, ease:'Quad.easeOut',
            onComplete: () => {
              this._enemyFP.loop(this._enemyIdleFrames() || FRAMES.SK_IDLE, 8);

              if (strippedLayer) {
                this._showStripEvent(strippedLayer);
              }

              if (this._checkEnd()) return;

              this._turn = 'player';
              if (this.pbuff.bindTurns > 0) this.pbuff.bindTurns--;

              // Show H-Bound state on hero sprite
              if (isHBound(s)) {
                this._heroFP.loop(FRAMES.S_BIND, 6);
              } else if (!this.pbuff.guard) {
                this._heroFP.loop(FRAMES.S_IDLE, 9);
              }

              this._refreshAll();
              this.time.delayedCall(200, () => {
                this._buildActionButtons(this.scale.width, this.scale.height);
                this._busy = false;
              });
            }
          });
        });
      }
    });
  }

  _applyEnemyIntent(intent, s, gm, vm, wm, punishFlee) {
    let strippedLayer = null;

    switch (intent) {
      case 'guard':
        this._pushLog(`${this.encounter.label} steadies itself.`);
        break;

      case 'feint': {
        const dmg = Math.max(1, Math.round(this.encounter.atk * 0.55 * gm * vm * wm));
        applyDamage(s, dmg, 3, 2, 2);
        this._hitEffect(this._heroObj, dmg, '#ff6644');
        this._pushLog(`${this.encounter.label} feints — ${dmg} dmg!`);
        break;
      }

      case 'heavyStrike': {
        const dmg = Math.max(2, Math.round((this.encounter.atk + 9) * gm * vm * wm));
        applyDamage(s, dmg, 6, 5, 5);
        if (s.settings.shake) this.cameras.main.shake(70, 0.006);
        this._hitEffect(this._heroObj, dmg, '#ff3333');
        this._pushLog(`${this.encounter.label} HEAVY STRIKE — ${dmg} dmg!`);
        if (Math.random() < this.encounter.stripChance * 0.5)
          strippedLayer = this._doStripAttack(s);
        break;
      }

      case 'arouse':
        if (this.encounter.arousalAttack) {
          const aro = 18 + Math.floor(s.sensitivity / 5);
          applyArousal(s, aro);
          s.wil = clamp(s.wil - 6, 0, s.maxWil);
          this._pushLog(`${this.encounter.label}'s corrupting touch: Arousal +${aro}, WIL −6`);
          if (isHBound(s)) this._pushLog('⚠ H-BOUND! Normal attacks disabled. Struggle or Flash Flask.');
          // Magenta tint flash on hero
          this._heroObj.setTint(0xff88cc);
          this.time.delayedCall(500, () => this._updateHeroTint());
        }
        break;

      case 'heavyStrip': {
        const dmg = Math.max(1, Math.round(this.encounter.atk * 0.7 * vm * wm));
        applyDamage(s, dmg, 4, 3, 4);
        strippedLayer = this._doStripAttack(s);
        this._hitEffect(this._heroObj, dmg, '#ff0088');
        this._pushLog(`${this.encounter.label} TEARS at your clothing!`);
        break;
      }

      case 'bind':
        if (this.encounter.bindAttack) {
          this.pbuff.bindTurns = 2;
          applyArousal(s, 28 + Math.floor(s.sensitivity / 4));
          this._pushLog(`⛓ ${this.encounter.label} BINDS you! Struggle or Flash Flask to break free.`);
          this._heroFP.loop(FRAMES.S_BIND, 6);
        }
        break;

      case 'voidPulse': {
        const dmg = Math.max(3, Math.round((this.encounter.atk + 16) * vm * wm));
        applyDamage(s, dmg, 9, 9, 9);
        applyCorruption(s, 7);
        if (s.settings.shake) this.cameras.main.shake(90, 0.008);
        this._hitEffect(this._heroObj, dmg, '#8800ff');
        const W = this.scale.width, H = this.scale.height;
        const flash = this.add.rectangle(W/2, H/2, W, H, 0x4400aa, 0).setDepth(600);
        this.tweens.add({ targets:flash, alpha:{from:0,to:0.4}, duration:120, yoyo:true, onComplete:()=>flash.destroy() });
        this._pushLog(`VOID PULSE — ${dmg} dmg! Corruption +7!`);
        break;
      }

      default: {
        const dmg = Math.max(1, Math.round(this.encounter.atk * gm * vm * wm * (punishFlee?1.2:1)));
        applyDamage(s, dmg, 4, 2, 3);
        this._hitEffect(this._heroObj, dmg, '#ff6644');
        this._pushLog(punishFlee ? `Punished for fleeing — ${dmg} dmg!` : `${this.encounter.label} strikes — ${dmg} dmg!`);
        if (Math.random() < this.encounter.stripChance * 0.25)
          strippedLayer = this._doStripAttack(s);
        break;
      }
    }
    return strippedLayer;
  }

  _doStripAttack(s) {
    for (const slot of SLOT_ORDER) {
      if (!s.clothing[slot].stripped) {
        const dmg = Phaser.Math.Between(28, 60);
        return damageClothingLayer(s, slot, dmg);
      }
    }
    return null;
  }

  _showStripEvent(name) {
    const W = this.scale.width, H = this.scale.height;
    const panel = this.add.container(W/2, H/2).setDepth(700);
    const bg  = this.add.rectangle(0, 0, 540, 130, 0x1a0010, 0.95).setStrokeStyle(3, 0xff0088, 0.9);
    const t1  = this.add.text(0, -36, '⚠ CLOTHING STRIPPED ⚠', {fontSize:'22px',color:'#ff0088',fontStyle:'bold'}).setOrigin(0.5);
    const t2  = this.add.text(0, 10, `${name} has been torn away!`, {fontSize:'16px',color:'#ffbbdd'}).setOrigin(0.5);
    const t3  = this.add.text(0, 36, 'Vulnerability increases.', {fontSize:'13px',color:'#cc6688'}).setOrigin(0.5);
    panel.add([bg, t1, t2, t3]);
    if (this.state.settings.shake) this.cameras.main.shake(80, 0.007);
    this.tweens.add({ targets: panel, scaleX:{from:0.7,to:1}, scaleY:{from:0.7,to:1}, alpha:{from:0,to:1}, duration:220, ease:'Back.easeOut' });
    this.time.delayedCall(1800, () => { this.tweens.add({ targets:panel, alpha:0, duration:300, onComplete:()=>panel.destroy() }); });
    this._pushLog(`★ ${name} STRIPPED! DEF reduced, vulnerability up.`);
  }

  // ─── END CHECK ──────────────────────────────────────────────────────────
  _checkEnd() {
    if (this.enemy.hp <= 0) { this._victory(); return true; }
    if (this.state.hp <= 0) { this._defeat();  return true; }
    return false;
  }

  // ─── VICTORY ─────────────────────────────────────────────────────────────
  _victory() {
    if (this._ended) return;
    this._ended = true;
    const s = this.state;
    const reward = { ...this.encounter.reward, gold: Math.round(this.encounter.reward.gold * (1 + s.day*0.1)) };
    applyVictoryReward(s, reward);

    if (this.encounter.isBoss) {
      s.flags.patronDefeated = true;
      s.objective = 'The Patron is destroyed. Return to Elder Thane.';
    } else if (!s.flags.firstBattle) {
      s.flags.firstBattle = true;
    }
    if (s.questStage === 0) s.questStage = 1;

    const goldStr = `+${reward.gold}g`;
    const itemStr = reward.item ? ` + ${reward.item}` : '';
    this._pushLog(`VICTORY! ${goldStr}${itemStr}`);
    this._showOutcome('VICTORY', `${this.encounter.label} is defeated!\n${goldStr}${itemStr}`, 0x081408);
    saveState(s);
    this.time.delayedCall(1800, () => this._returnToWorld({ outcome:'victory', encounterId:this.encounter.id }));
  }

  // ─── DEFEAT ──────────────────────────────────────────────────────────────
  _defeat() {
    if (this._ended) return;
    this._ended = true;
    const s = this.state;
    const strippedInfo = applyDefeatConsequences(s, this.encounter);
    s.objective = 'Recover — rest in the Sanctuary Hall.';

    // Defeat animation: hero falls
    this._heroFP.once(FRAMES.S_BLOW, 10, () => {
      if (this.textures.exists(K(FRAMES.S_BIND[0]))) this._heroFP.loop(FRAMES.S_BIND, 5);
    });

    let msg = 'DEFEAT. Pressure +25. Max STA/WIL reduced permanently.';
    if (strippedInfo) msg += ` — ${strippedInfo.name} stripped!`;
    this._pushLog(msg);
    this._showOutcome('DEFEAT', 'You have been overwhelmed.\nReturn to the Sanctuary Hall.', 0x1a0608);
    saveState(s);
    this.time.delayedCall(2000, () => this._returnToWorld({
      outcome: 'defeat',
      strippedLayer: strippedInfo?.name || null,
    }));
  }

  _returnToWorld(extra = {}) {
    this._kbdFocus?.destroy();
    this.cameras.main.fade(500, 4, 2, 10, false, (cam, p) => {
      if (p >= 1) {
        this._heroFP.stop(); this._enemyFP.stop();
        this.scene.stop();
        const parent = this.scene.manager.getScene(this._return);
        if (parent) {
          this.scene.resume(this._return, { battleDone:true, state:this.state, ...extra });
        } else {
          this.scene.start(this._return, { state:this.state });
        }
      }
    });
  }

  // ─── OUTCOME PANEL ───────────────────────────────────────────────────────
  _showOutcome(title, body, bgColor) {
    const W = this.scale.width, H = this.scale.height;
    const c = this.add.container(W/2, H/2).setDepth(900);
    const bg  = this.add.rectangle(0,0, 580, 200, bgColor, 0.97).setStrokeStyle(3,0xcc88ff,0.8);
    const t1  = this.add.text(0,-68, title, {fontSize:'38px',color:'#fff',fontStyle:'bold'}).setOrigin(0.5);
    const t2  = this.add.text(0,20, body, {fontSize:'16px',color:'#e8d0f0',align:'center',wordWrap:{width:520}}).setOrigin(0.5);
    c.add([bg, t1, t2]);
    this.tweens.add({ targets:c, scaleX:{from:0.5,to:1}, scaleY:{from:0.5,to:1}, alpha:{from:0,to:1}, duration:280, ease:'Back.easeOut' });
  }

  // ─── BOSS INTRO ─────────────────────────────────────────────────────────
  _showBossIntro() {
    const W = this.scale.width, H = this.scale.height;
    const c = this.add.container(W/2, H/2).setDepth(950);
    const bg  = this.add.rectangle(0,0, 740, 340, 0x05010c, 0.98).setStrokeStyle(3,0xcc00ff,0.9);
    const t1  = this.add.text(0,-116, 'THE PATRON', {fontSize:'46px',color:'#ff44ff',fontStyle:'bold',stroke:'#220044',strokeThickness:5}).setOrigin(0.5);
    const t2  = this.add.text(0,-30, this.encounter.lore, {fontSize:'16px',color:'#ccbbdd',align:'center',wordWrap:{width:680},lineSpacing:5}).setOrigin(0.5);
    const btn = this.add.rectangle(0,126, 260,54, 0x330044, 0.9).setStrokeStyle(2,0xff44ff,0.9);
    const bt  = this.add.text(0,126,'FACE THE PATRON',{fontSize:'20px',color:'#fff',fontStyle:'bold'}).setOrigin(0.5);
    c.add([bg, t1, t2, btn, bt]);
    btn.setInteractive({ useHandCursor:true });
    btn.on('pointerdown', () => {
      c.destroy();
      this._pushLog('The Patron stirs from its prison. It has been waiting for you.');
      this.time.delayedCall(60, () => this._pickEnemyIntent());
    });
    this.tweens.add({ targets:c, alpha:{from:0,to:1}, duration:700 });
  }

  // ─── HIT EFFECT ─────────────────────────────────────────────────────────
  _hitEffect(targetSprite, dmg, color, customMsg = null) {
    // Flash sprite
    this.tweens.add({ targets: targetSprite, alpha:{from:0.3,to:1}, duration:100, yoyo:false });
    this.tweens.add({ targets: targetSprite, x: targetSprite.x + (targetSprite === this._heroObj ? 10 : -10), yoyo:true, duration:70 });

    // Floating damage number
    const W = this.scale.width, H = this.scale.height;
    const nx = targetSprite === this._heroObj ? 220 : W-220;
    const ny = targetSprite.y - 80;
    const numTxt = this.add.text(nx, ny, customMsg || `-${dmg}`, {
      fontSize: dmg > 20 ? '32px' : '24px',
      color, fontStyle:'bold', stroke:'#000', strokeThickness:3,
    }).setOrigin(0.5).setDepth(800);
    this.tweens.add({ targets:numTxt, y:ny-80, alpha:0, duration:1200, ease:'Quad.easeOut', onComplete:()=>numTxt.destroy() });
  }
}
