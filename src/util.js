// ─── CONSTANTS ───────────────────────────────────────────────────────────────
export const SAVE_KEY   = 'veiled_apostasy_v1';
export const ASSET_ROOT = 'assets/ruin_runners_shaia/sprites/';
export const SLOT_ORDER = ['outer','upper','lower','inner','shoes'];

// ─── KEY GENERATION ──────────────────────────────────────────────────────────
// Converts any asset sub-path into a Phaser texture key (alphanumeric + underscore)
export function K(subPath) {
  return subPath.replace(/\.(png|jpg|jpeg)$/i,'').replace(/[^a-z0-9]+/gi,'_').replace(/^_+|_+$/g,'');
}

// ─── FRAME MANIFEST (all Shaia + Skeleton frames used in-game) ──────────────
const SHC = 'shaia/sprites_common/';
const SHA = 'shaia/sprites_attack/';
const SHD = 'shaia/sprites_damage/';
const SHA2 = 'shaia/sprites_append/';
const SKC = 'skeleton/';

export const FRAMES = {
  // SHAIA (hero)
  S_IDLE:   [1,2,3,4,5,6,7,8].map(n => `${SHC}common_00_idle_stand_A0${n}.png`),
  S_IDLE_B: [1,2,3,4,5,6,7,8].map(n => `${SHC}common_00_idle_stand_B0${n}.png`),
  S_WALK:   [1,2,3,4,5,6,7,8,9,10,11,12].map(n => `${SHC}common_11_walk${String(n).padStart(2,'0')}.png`),
  S_ATK1:   [1,2,3,4,5,6].map(n => `${SHA}attack_01_cobination010${n}.png`),
  S_ATK2:   [1,2,3,4,5,6].map(n => `${SHA}attack_02_cobination020${n}.png`),
  S_ATK3:   [1,2,3,4,5,6,7].map(n => `${SHA}attack_03_cobination030${n}.png`),
  S_ATK4:   [1,2,3,4,5,6,7,8,9,10,11].map(n => `${SHA}attack_04_cobination04${String(n).padStart(2,'0')}.png`),
  S_KNEE:   [1,2,3,4,5,6].map(n => `${SHA}attack_05_knee0${n}.png`),
  S_HURT:   [`${SHD}damage_01_damage_head.png`, `${SHD}damage_02_damage_body.png`],
  S_STUN:   [`${SHD}damage_21_stun.png`],
  S_BIND:   [`${SHD}damage_22_bind.png`],   // H-BOUND sprite!
  S_GUARD:  [`${SHA2}common_12_guard_dash01.png`,`${SHA2}common_12_guard_dash02.png`,`${SHA2}common_12_guard_dash03.png`,`${SHA2}common_12_guard_dash04.png`,`${SHA2}common_12_guard_dash05.png`,`${SHA2}common_12_guard_dash06.png`],
  S_BLOW:   [`${SHD}damage_11_blow_begin01.png`,`${SHD}damage_11_blow_begin02.png`,`${SHD}damage_11_blow_begin03.png`,`${SHD}damage_11_blow_air01.png`,`${SHD}damage_11_blow_landing_A01.png`,`${SHD}damage_11_blow_landing_A02.png`],

  // SKELETON (undead enemy)
  SK_IDLE:  [`${SKC}common_01_idle01.png`],
  SK_WALK:  [2,3,4,5,6,7,8].map(n => `${SKC}common_11_walk0${n}.png`),
  SK_ATK:   [1,2,3,4,5,6].map(n => `${SKC}attack_01_sword0${n}.png`),
  SK_HURT:  [`${SKC}damage_01_damage_head.png`, `${SKC}damage_02_damage_body.png`],
  SK_BLOW:  [`${SKC}damage_11_blow_begin01.png`,`${SKC}damage_11_blow_air01.png`],
};

// All paths needed for scene.load.image()
export const ALL_ASSET_PATHS = [...new Set(Object.values(FRAMES).flat())];

// Extra assets (backgrounds / props)
export const EXTRA_PATHS = [
  'background/sprites_dungeon/01_dungeon_left.png',
  'background/sprites_dungeon/02_dungeon_center.png',
  'background/sprites_dungeon/03_dungeon_right.png',
  'prop/apple.png',
  'prop/chest_open01.png',
  // External assets go under assets/backgrounds/ and assets/enemies/ when downloaded
];

// ─── FRAME PLAYER ────────────────────────────────────────────────────────────
// Reliable multi-frame animation using setTexture() – works with individual PNGs
export class FramePlayer {
  constructor(scene, sprite) {
    this._scene  = scene;
    this._sprite = sprite;
    this._timer  = null;
    this._loopTimer = null;
  }

  // One-shot – calls onDone when last frame displayed
  once(paths, fps = 14, onDone = null) {
    this.stop();
    const keys = paths.map(p => K(p)).filter(k => this._scene.textures.exists(k));
    if (!keys.length) { if (onDone) onDone(); return; }
    this._sprite.setTexture(keys[0]);
    let idx = 0;
    this._timer = this._scene.time.addEvent({
      delay: 1000 / fps,
      repeat: keys.length - 1,
      callback: () => {
        idx++;
        if (idx < keys.length) this._sprite.setTexture(keys[idx]);
        if (idx >= keys.length - 1 && onDone) {
          this._scene.time.delayedCall(20, onDone);
        }
      },
    });
  }

  // Loop – calls onLoop each cycle; stops when stop() called
  loop(paths, fps = 10) {
    this.stop();
    if (!paths || !paths.length) return;
    // paths may already be texture keys (not raw paths) when called with [resolvedKey]
    const keys = paths.map(p => {
      const k = K(p);
      return this._scene.textures.exists(k) ? k : (this._scene.textures.exists(p) ? p : null);
    }).filter(Boolean);
    if (!keys.length) return;
    this._sprite.setTexture(keys[0]);
    let idx = 0;
    this._loopTimer = this._scene.time.addEvent({
      delay: 1000 / fps,
      repeat: -1,
      callback: () => {
        idx = (idx + 1) % keys.length;
        this._sprite.setTexture(keys[idx]);
      },
    });
  }

  // Single static frame
  set(path) {
    this.stop();
    const key = K(path);
    if (this._scene.textures.exists(key)) this._sprite.setTexture(key);
  }

  stop() {
    if (this._timer)     { this._timer.destroy();     this._timer = null; }
    if (this._loopTimer) { this._loopTimer.destroy();  this._loopTimer = null; }
  }

  get sprite() { return this._sprite; }
}

// ─── KEYBOARD FOCUS NAVIGATOR ─────────────────────────────────────────────
// Enables arrow-key navigation + Enter/Space confirm for a grid of buttons
export class KbdFocus {
  constructor(scene, buttons, cols = 4) {
    this._scene   = scene;
    this._buttons = buttons; // array of { rect, text, onConfirm, disabled }
    this._cols    = cols;
    this._idx     = 0;
    this._active  = true;
    this._keys    = scene.input.keyboard.addKeys('UP,DOWN,LEFT,RIGHT,ENTER,SPACE');
    this._highlight(this._idx);

    this._keys.LEFT.on('down',  () => this._move(-1));
    this._keys.RIGHT.on('down', () => this._move(1));
    this._keys.UP.on('down',    () => this._move(-this._cols));
    this._keys.DOWN.on('down',  () => this._move(this._cols));
    this._keys.ENTER.on('down', () => this._confirm());
    this._keys.SPACE.on('down', () => this._confirm());
  }

  _move(delta) {
    if (!this._active || !this._buttons.length) return;
    this._unhighlight(this._idx);
    let next = this._idx + delta;
    next = Math.max(0, Math.min(this._buttons.length - 1, next));
    this._idx = next;
    this._highlight(this._idx);
  }

  _confirm() {
    if (!this._active || !this._buttons.length) return;
    const btn = this._buttons[this._idx];
    if (btn && !btn.disabled && btn.onConfirm) btn.onConfirm();
  }

  _highlight(i) {
    const btn = this._buttons[i];
    if (!btn) return;
    if (btn.rect) btn.rect.setStrokeStyle(3, btn.disabled ? 0x443355 : 0xffffff, btn.disabled ? 0.3 : 1);
    if (btn.text && !btn.disabled) btn.text.setColor('#ffffff');
  }

  _unhighlight(i) {
    const btn = this._buttons[i];
    if (!btn) return;
    if (btn.rect) btn.rect.setStrokeStyle(2, btn.disabled ? 0x221133 : 0x7744aa, btn.disabled ? 0.3 : 0.7);
    if (btn.text && !btn.disabled) btn.text.setColor(btn.corruptionSkill ? '#ff44ff' : '#ddccee');
  }

  moveTo(i) {
    if (i < 0 || i >= this._buttons.length) return;
    this._unhighlight(this._idx);
    this._idx = i;
    this._highlight(this._idx);
  }

  destroy() {
    this._active = false;
    this._keys.LEFT.off('down');
    this._keys.RIGHT.off('down');
    this._keys.UP.off('down');
    this._keys.DOWN.off('down');
    this._keys.ENTER.off('down');
    this._keys.SPACE.off('down');
  }
}

// ─── MATH ────────────────────────────────────────────────────────────────────
export function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
export function lerp(a, b, t)    { return a + (b - a) * t; }

// ─── STATE ───────────────────────────────────────────────────────────────────
export function freshState() {
  return {
    version: 1,
    sceneKey: 'WorldScene',
    area: 'sanctuary',
    spawnX: 220, spawnY: 500,
    day: 1,
    hp: 100, maxHp: 100,
    sta: 100, maxSta: 100,
    wil: 100, maxWil: 100,
    corruption:  0,
    sensitivity: 0,
    arousal:     0,
    pressure:    0,
    clothing: {
      outer: { name:'Apostle Cloak',   dur:100, max:100, stripped:false, def:8 },
      upper: { name:'Ritual Vestment', dur:100, max:100, stripped:false, def:6 },
      lower: { name:'Battle Skirt',    dur:100, max:100, stripped:false, def:5 },
      inner: { name:'Sacred Bindings', dur:100, max:100, stripped:false, def:3 },
      shoes: { name:'Shadow Treads',   dur:100, max:100, stripped:false, def:2 },
    },
    items: { healingPotion:2, flashFlask:1, holyWater:0 },
    gold: 10, kills: 0, defeats: 0,
    factions: { order:55, cult:10, wilds:60 },
    npcs: {
      elder:     { met:false, trust:50, hostile:false, stage:0 },
      mage:      { met:false, trust:50, stage:0, guide:false },
      merchant:  { met:false, trust:50, suspicious:false, stage:0 },
      guard:     { met:false, trust:40, hostile:false, bribed:false, stage:0 },
      witch:     { met:false, trust:30, pact:false, stage:0 },
      knight:    { met:false, trust:50, aggression:0, stage:0 },
      townGray:  { met:false, trust:35, flirt:0, stage:0 },
      townRed:   { met:false, trust:35, flirt:0, stage:0 },
    },
    flags: {
      prologueRead:false, firstBattle:false, dungeon1Clear:false,
      sanctumOpen:false, witchPact:false, betrayedOrder:false,
      cultInitiate:false, strippedPublic:false, elderReveal:false,
      mageDefeated:false, knightDefeated:false, golemBossDefeated:false,
      finalBranch:'', finalGateSeen:false,
    },
    // ── Harassment / escalation tracking ─────────────────────────────
    harassment: {
      knightAggression: 0,   // 0-100; high = knight harder + hostile
      lethalCount:      0,   // total kills of townspeople
      chains: {
        patronA: { encounters:0, friendsAlerted:0, active:true  },
        patronB: { encounters:0, friendsAlerted:0, active:true  },
        patronC: { encounters:0, friendsAlerted:0, active:true  },
      },
    },
    questStage: 0,
    objective: 'Find Elder Thane in the Sanctuary Hall.',
    settings: { shake:true, music:true, mobileControls:true },
  };
}

export function normalizeState(raw) {
  const base = freshState();
  if (!raw || typeof raw !== 'object') return base;
  const s = { ...base, ...raw,
    clothing: { ...base.clothing },
    items:    { ...base.items,    ...(raw.items    || {}) },
    factions: { ...base.factions, ...(raw.factions || {}) },
    flags:    { ...base.flags,    ...(raw.flags    || {}) },
    settings: { ...base.settings, ...(raw.settings || {}) },
    npcs: {
      elder:     { ...base.npcs.elder,    ...(raw.npcs?.elder    || {}) },
      mage:      { ...base.npcs.mage,     ...(raw.npcs?.mage     || {}) },
      merchant:  { ...base.npcs.merchant,  ...(raw.npcs?.merchant || {}) },
      guard:     { ...base.npcs.guard,     ...(raw.npcs?.guard    || {}) },
      witch:     { ...base.npcs.witch,     ...(raw.npcs?.witch    || {}) },
      knight:    { ...base.npcs.knight,    ...(raw.npcs?.knight   || {}) },
      townGray:  { ...base.npcs.townGray,  ...(raw.npcs?.townGray || {}) },
      townRed:   { ...base.npcs.townRed,   ...(raw.npcs?.townRed  || {}) },
    },
  };
  for (const slot of SLOT_ORDER) {
    s.clothing[slot] = { ...base.clothing[slot], ...(raw.clothing?.[slot] || {}) };
  }
  ['hp','sta','wil'].forEach(k => s[k] = clamp(Number(s[k]||100), 0, Number(s[`max${k.charAt(0).toUpperCase()+k.slice(1)}`]||100)));
  ['corruption','sensitivity','arousal','pressure'].forEach(k => s[k] = clamp(Number(s[k]||0), 0, 100));
  ['gold','kills','defeats','day','questStage'].forEach(k => s[k] = Math.max(0, Number(s[k]||0)));
  s.day = Math.max(1, s.day);
  return s;
}

export function saveState(s)  { try { localStorage.setItem(SAVE_KEY, JSON.stringify(s)); } catch{} }
export function loadState()   { try { const r=localStorage.getItem(SAVE_KEY); return r ? normalizeState(JSON.parse(r)) : null; } catch { return null; } }

// ─── CORRUPTION ────────────────────────────────────────────────────────────
export function corruptionTier(c) {
  if (c >= 75) return { tier:3, label:'Consumed',  color:0xcc00ff, hex:'#cc00ff' };
  if (c >= 50) return { tier:2, label:'Defiled',   color:0x8800cc, hex:'#8800cc' };
  if (c >= 25) return { tier:1, label:'Tainted',   color:0x6633aa, hex:'#6633aa' };
  return              { tier:0, label:'Pure',      color:0x4488ff, hex:'#4488ff' };
}

export function applyCorruption(state, amount) {
  state.corruption  = clamp(state.corruption  + amount,            0, 100);
  state.wil         = clamp(state.wil         - Math.ceil(amount * 0.3), 0, state.maxWil);
  state.sensitivity = clamp(state.sensitivity + Math.ceil(amount * 0.4), 0, 100);
}

// ─── CLOTHING ──────────────────────────────────────────────────────────────
export function totalClothingDef(clothing) {
  return SLOT_ORDER.reduce((s, slot) => s + (clothing[slot].stripped ? 0 : clothing[slot].def), 0);
}

export function intactCount(clothing) {
  return SLOT_ORDER.filter(s => !clothing[s].stripped).length;
}

export function damageClothingLayer(state, slot, amount) {
  const layer = state.clothing[slot];
  if (layer.stripped) return null;
  layer.dur = Math.max(0, layer.dur - amount);
  if (layer.dur <= 0) {
    layer.stripped = true;
    if (slot === 'inner') { state.sensitivity = clamp(state.sensitivity+18,0,100); state.pressure = clamp(state.pressure+14,0,100); }
    else                  { state.pressure    = clamp(state.pressure+6,0,100); }
    if (slot === 'outer') state.maxHp   = clamp(state.maxHp  -5, 30, 100);
    if (slot === 'upper') state.maxSta  = clamp(state.maxSta -5, 30, 100);
    if (slot === 'lower') state.maxWil  = clamp(state.maxWil -5, 30, 100);
    return layer.name;
  }
  return null;
}

export function stripFirstIntactLayer(state) {
  for (const slot of SLOT_ORDER) {
    const stripped = damageClothingLayer(state, slot, 999);
    if (stripped) return { slot, name: stripped };
  }
  return null;
}

export function repairAllClothing(state, pct = 1.0) {
  for (const slot of SLOT_ORDER) {
    const l = state.clothing[slot];
    l.stripped = false;
    l.dur      = Math.round(l.max * pct);
  }
}

// ─── COMBAT ────────────────────────────────────────────────────────────────
export function applyDamage(state, hp, sta = 0, wil = 0, pressureAdd = 0) {
  const clothDef  = totalClothingDef(state.clothing);
  const reduction = 1 - (clothDef / 100) * 0.55;
  const final     = Math.max(1, Math.round(hp * reduction));
  state.hp       = clamp(state.hp  - final, 0, state.maxHp);
  state.sta      = clamp(state.sta - sta,   0, state.maxSta);
  state.wil      = clamp(state.wil - wil,   0, state.maxWil);
  state.pressure = clamp(state.pressure + pressureAdd, 0, 100);
  return final;
}

export function applyArousal(state, amount) {
  const mod = 1 + state.sensitivity / 100;
  state.arousal = clamp(state.arousal + Math.round(amount * mod), 0, 100);
  if (state.arousal >= 60) state.wil = clamp(state.wil - 3, 0, state.maxWil);
}

export function isHBound(state) { return state.arousal >= 100; }

export function applyVictoryReward(state, reward) {
  state.gold     = Math.max(0, state.gold   + (reward.gold   || 0));
  state.kills   += 1;
  state.hp       = clamp(state.hp  + (reward.hp  || 0), 0, state.maxHp);
  state.sta      = clamp(state.sta + (reward.sta || 0), 0, state.maxSta);
  state.wil      = clamp(state.wil + (reward.wil || 0), 0, state.maxWil);
  state.arousal  = 0;
  state.pressure = clamp(state.pressure - (reward.pressureDrop || 10), 0, 100);
  if (reward.item) state.items[reward.item] = (state.items[reward.item] || 0) + 1;
  if (reward.corruptionDrop) state.corruption = clamp(state.corruption - reward.corruptionDrop, 0, 100);
}

export function applyDefeatConsequences(state, encounter) {
  state.defeats  += 1;
  state.pressure  = clamp(state.pressure  + 25, 0, 100);
  state.corruption= clamp(state.corruption + (encounter.corruptionOnDefeat || 5), 0, 100);
  state.maxSta    = clamp(state.maxSta - 6, 30, 100);
  state.maxWil    = clamp(state.maxWil - 4, 30, 100);
  state.hp        = clamp(Math.floor(state.maxHp  * 0.5), 1, state.maxHp);
  state.sta       = clamp(Math.floor(state.maxSta * 0.5), 1, state.maxSta);
  state.wil       = clamp(Math.floor(state.maxWil * 0.5), 1, state.maxWil);
  state.arousal   = 0;
  if (encounter.stripsOnDefeat) return stripFirstIntactLayer(state);
  return null;
}

// ─── NPC / FACTION ────────────────────────────────────────────────────────
export function adjustTrust(state, npcKey, delta) {
  if (!state.npcs[npcKey]) return;
  state.npcs[npcKey].trust = clamp((state.npcs[npcKey].trust || 50) + delta, 0, 100);
}

export function adjustFaction(state, key, delta) {
  if (state.factions[key] !== undefined)
    state.factions[key] = clamp(state.factions[key] + delta, 0, 100);
}

// ─── VIRTUAL TOUCH CONTROLS (D-pad + action buttons) ─────────────────────
export function makeVirtualControls(scene) {
  const W = scene.scale.width;
  const H = scene.scale.height;
  const state = { left:false, right:false, jump:false, interact:false, attack:false };
  // Track which pointer owns which button (multi-touch)
  const owned = {};

  const ctr = scene.add.container(0, 0).setScrollFactor(0).setDepth(9000);

  const mkBtn = (label, x, y, w, h, key) => {
    const g = scene.add.graphics();
    g.fillStyle(0x1a0030, 0.55);
    g.fillRoundedRect(-w/2, -h/2, w, h, 12);
    g.lineStyle(2, 0xaa55ff, 0.6);
    g.strokeRoundedRect(-w/2, -h/2, w, h, 12);
    g.setPosition(x, y).setScrollFactor(0).setDepth(9001);

    const t = scene.add.text(x, y, label, {
      fontSize:'15px', color:'#ffffffcc', fontStyle:'bold',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(9002);

    ctr.add([g, t]);

    // Hit area zone (Phaser Rectangle)
    const zone = scene.add.zone(x, y, w, h).setScrollFactor(0).setDepth(9003);
    zone.setInteractive({ useHandCursor:false });

    zone.on('pointerdown', (ptr) => {
      owned[ptr.id] = key;
      state[key] = true;
      g.setAlpha(0.95);
    });

    scene.input.on('pointerup', (ptr) => {
      if (owned[ptr.id] === key) {
        state[key] = false;
        delete owned[ptr.id];
        g.setAlpha(0.7);
      }
    });
    scene.input.on('pointerupoutside', (ptr) => {
      if (owned[ptr.id] === key) {
        state[key] = false;
        delete owned[ptr.id];
        g.setAlpha(0.7);
      }
    });
    g.setAlpha(0.7);
  };

  // D-pad: left side
  mkBtn('◀', 80,  H-92, 108, 88, 'left');
  mkBtn('▶', 196, H-92, 108, 88, 'right');
  mkBtn('▲', 138, H-198, 108, 88, 'jump');

  // Action buttons: right side
  mkBtn('E\nINT', W-180, H-80,  100, 80, 'interact');
  mkBtn('X\nATK', W-68,  H-80,  100, 80, 'attack');

  return { state, ctr };
}

export function readControls(scene, virtual) {
  const k = scene.keys || {};
  const v = virtual?.state || {};
  return {
    left:     !!(k.LEFT?.isDown  || k.A?.isDown     || v.left),
    right:    !!(k.RIGHT?.isDown || k.D?.isDown     || v.right),
    jump:     !!(Phaser.Input.Keyboard.JustDown(k.UP)    ||
                  Phaser.Input.Keyboard.JustDown(k.W)    ||
                  Phaser.Input.Keyboard.JustDown(k.SPACE) || v.jump),
    interact: !!(Phaser.Input.Keyboard.JustDown(k.E)     ||
                  Phaser.Input.Keyboard.JustDown(k.ENTER) || v.interact),
    attack:   !!(k.X?.isDown || k.J?.isDown || v.attack),
    run:      !!(k.SHIFT?.isDown),
    esc:      !!(k.ESC?.isDown),
  };
}

// ─── UI FACTORIES ────────────────────────────────────────────────────────────
export function makeMeter(scene, x, y, w, label, fillColor, depth = 5100) {
  const bg   = scene.add.rectangle(x, y, w, 16, 0x0a0614, 0.92).setOrigin(0,0.5).setScrollFactor(0).setDepth(depth);
  const fill = scene.add.rectangle(x, y, w, 16, fillColor, 1).setOrigin(0,0.5).setScrollFactor(0).setDepth(depth+1);
  const txt  = scene.add.text(x+4, y, label, { fontSize:'11px', color:'#fff', fontStyle:'bold' }).setOrigin(0,0.5).setScrollFactor(0).setDepth(depth+2);
  return {
    bg, fill, txt, w,
    set(val, max) {
      const pct = clamp(max > 0 ? val/max : 0, 0, 1);
      fill.displayWidth = Math.max(0, w * pct);
      txt.setText(`${label}  ${Math.round(val)}/${Math.round(max)}`);
    },
    setDepth(d) { bg.setDepth(d); fill.setDepth(d+1); txt.setDepth(d+2); },
  };
}

// ─── PROCEDURAL TEXTURES ─────────────────────────────────────────────────────
export function generateProceduralTextures(scene) {
  const mk = (key, w, h, fn) => {
    if (scene.textures.exists(key)) return;
    const g = scene.make.graphics({ x:0, y:0, add:false });
    fn(g);
    g.generateTexture(key, w, h);
    g.destroy();
  };

  // Cultist
  mk('enemy-cultist', 80,130, g => {
    g.fillStyle(0x2a0a3a,1); g.fillCircle(40,22,18);
    g.fillStyle(0x3d0d52,1); g.fillTriangle(40,4,10,26,70,26);
    g.fillStyle(0x1c0630,1); g.fillRect(22,40,36,50);
    g.fillRect(14,90,16,28); g.fillRect(50,90,16,28);
    g.fillRect(8,40,14,40); g.fillRect(58,40,14,40);
    g.fillStyle(0xff3366,0.9); g.fillCircle(40,22,7);
    g.fillStyle(0x9900cc,0.5); g.fillCircle(40,58,12);
  });

  // Shadow Beast
  mk('enemy-shadow', 100,90, g => {
    g.fillStyle(0x0a0015,1); g.fillEllipse(50,44,70,40);
    g.fillCircle(78,32,22);
    g.fillStyle(0x220033,1);
    [10,34,56,74].forEach(px => g.fillRect(px,60,18,30));
    g.fillStyle(0xcc00ff,0.9); g.fillCircle(82,28,7); g.fillCircle(72,30,7);
    g.fillStyle(0x660099,0.3); g.fillEllipse(50,44,82,52);
  });

  // Possessed Guard
  mk('enemy-guard', 80,130, g => {
    g.fillStyle(0x2a3040,1); g.fillCircle(40,20,18);
    g.fillStyle(0x3a4050,1); g.fillRect(24,38,32,52);
    g.fillRect(16,36,10,36); g.fillRect(54,36,10,36);
    g.fillRect(14,90,22,30); g.fillRect(44,90,22,30);
    g.fillStyle(0x8888aa,1); g.fillRect(2,38,14,50);
    g.fillRect(62,38,14,50); g.fillRect(62,30,8,60);
    g.fillStyle(0xff2200,0.9); g.fillCircle(40,20,8);
  });

  // Patron Boss
  mk('enemy-patron', 120,170, g => {
    g.fillStyle(0x100020,1); g.fillCircle(60,28,26);
    g.fillStyle(0x1a0035,1); g.fillRect(32,54,56,70);
    g.fillRect(12,50,22,60); g.fillRect(86,50,22,60);
    g.fillRect(28,124,28,40); g.fillRect(64,124,28,40);
    g.fillStyle(0x8800cc,0.25); g.fillCircle(60,80,72);
    g.fillStyle(0xffaaff,0.9); g.fillCircle(52,24,8); g.fillCircle(68,24,8);
    g.fillStyle(0x220044,1);
    g.fillTriangle(38,18,44,-4,50,18); g.fillTriangle(70,18,76,-4,82,18);
  });

  // NPC silhouettes
  mk('npc-elder', 64,118, g => {
    g.fillStyle(0x4a3020,1); g.fillCircle(32,18,16);
    g.fillStyle(0x6a4a2a,1); g.fillRect(20,34,24,46);
    g.fillRect(12,34,10,36); g.fillRect(42,34,10,36);
    g.fillRect(16,80,18,28); g.fillRect(30,80,18,28);
    g.fillStyle(0x8a6020,1); g.fillRect(6,24,6,80);
    g.fillStyle(0xffcc00,0.9); g.fillCircle(9,24,8);
  });
  mk('npc-merchant', 64,108, g => {
    g.fillStyle(0x5a3a28,1); g.fillCircle(32,18,16);
    g.fillStyle(0x7a5020,1); g.fillRect(20,34,24,40);
    g.fillRect(12,34,10,32); g.fillRect(42,34,10,32);
    g.fillStyle(0x4a3010,1); g.fillRect(16,74,18,24); g.fillRect(30,74,18,24);
    g.fillStyle(0x8a6030,0.9); g.fillEllipse(48,62,22,28);
  });
  mk('npc-guard', 64,118, g => {
    g.fillStyle(0x364050,1); g.fillCircle(32,18,16);
    g.fillStyle(0x445060,1); g.fillRect(18,34,28,48);
    g.fillRect(10,34,10,38); g.fillRect(44,34,10,38);
    g.fillStyle(0x556070,1); g.fillRect(14,82,20,28); g.fillRect(30,82,20,28);
    g.fillStyle(0x8899aa,1); g.fillRect(6,36,8,44); g.fillRect(48,32,8,54);
  });
  mk('npc-witch', 64,118, g => {
    g.fillStyle(0x2a1530,1); g.fillCircle(32,18,16);
    g.fillStyle(0x3a1a42,1); g.fillTriangle(32,-2,10,22,54,22);
    g.fillRect(20,34,24,46); g.fillRect(12,34,10,36); g.fillRect(42,34,10,36);
    g.fillStyle(0x1a0a24,1); g.fillRect(16,80,18,28); g.fillRect(30,80,18,28);
    g.fillStyle(0x9900cc,0.8); g.fillCircle(32,18,7);
    g.fillStyle(0x660099,1); g.fillRect(46,28,4,60);
    g.fillStyle(0xcc44ff,0.9); g.fillCircle(48,26,6);
  });

  // Props
  mk('bed', 164,84, g => {
    g.fillStyle(0x4a2030,1); g.fillRect(0,20,164,64);
    g.fillStyle(0x6a3a50,1); g.fillRect(0,10,164,14);
    g.fillStyle(0xc8a0b0,1); g.fillRect(8,12,54,12);
    g.fillStyle(0x7a4060,0.9); g.fillRect(64,20,96,58);
    g.lineStyle(2,0xf0c0d0,0.3); g.strokeRect(0,10,164,72);
  });
  mk('mirror', 64,106, g => {
    g.fillStyle(0x1a0a24,1); g.fillRect(8,0,48,90);
    g.fillStyle(0x110820,0.8); g.fillRect(12,4,40,82);
    g.lineStyle(3,0xcc88ff,0.7); g.strokeRect(8,0,48,90);
    g.fillStyle(0x8844cc,0.25); g.fillRect(12,4,40,82);
    g.fillStyle(0x2a1040,1); g.fillRect(16,88,32,8); g.fillRect(6,96,52,8);
  });
  mk('chest', 72,56, g => {
    g.fillStyle(0x4a3010,1); g.fillRect(4,14,64,40);
    g.fillStyle(0x6a4820,1); g.fillRect(4,4,64,14);
    g.lineStyle(2,0xffcc44,0.7); g.strokeRect(4,4,64,50);
    g.fillStyle(0xffcc44,0.9); g.fillCircle(36,30,8);
  });
}

// ─── ENEMY ANIMATOR ────────────────────────────────────────────────────────
// Unified interface for both sprite-sheet enemies (Phaser anims) and
// individual-PNG enemies (FramePlayer). Battle + World use this consistently.
export class EnemyAnimator {
  // customSets: { idle:[keys], walk:[keys], atk:[keys], hurt:[keys], dead:[keys] }
  // Pass FRAMES.SK_* arrays for skeleton, or [singleTexKey] for static sprites.
  constructor(scene, sprite, animPrefix, customSets = null) {
    this._scene   = scene;
    this._sprite  = sprite;
    this._prefix  = animPrefix || '';
    this._hasSS   = !!animPrefix && animPrefix !== 'skeleton'
                    && scene.anims.exists(`${animPrefix}-idle`);
    this._fp      = new FramePlayer(scene, sprite);
    this._sets    = customSets || {};  // fallback frame arrays per action
  }

  idle()           { this._loop('idle', 8);  }
  walk()           { this._loop('walk', 10); }
  block()          { this._loop('idle', 6);  }
  attack(onDone)   { this._once('atk',  14, onDone); }
  hurt(onDone)     { this._once('hurt', 10, onDone); }
  dead(onDone)     { this._once('dead',  8, onDone); }

  _loop(suffix, fps) {
    const key = `${this._prefix}-${suffix}`;
    if (this._hasSS && this._scene.anims.exists(key)) {
      this._fp.stop();
      if (this._sprite.anims?.currentAnim?.key !== key)
        this._sprite.anims.play(key, true);
    } else {
      if (this._sprite.anims) this._sprite.anims.stop();
      const frames = this._sets[suffix] || this._sets['idle'] || FRAMES.SK_IDLE;
      this._fp.loop(frames, fps);
    }
  }

  _once(suffix, fps, onDone) {
    const key = `${this._prefix}-${suffix}`;
    if (this._hasSS && this._scene.anims.exists(key)) {
      this._fp.stop();
      this._sprite.anims.play(key, true);
      this._sprite.once('animationcomplete', () => { if (onDone) onDone(); });
    } else {
      if (this._sprite.anims) this._sprite.anims.stop();
      const frames = this._sets[suffix] || this._sets['idle'] || FRAMES.SK_ATK;
      this._fp.once(frames, fps, onDone);
    }
  }

  stop() {
    this._fp.stop();
    if (this._sprite.anims) this._sprite.anims.stop();
  }
}

// ─── REGISTER ENEMY SPRITE SHEET ANIMATIONS ───────────────────────────────
export function registerEnemyAnims(scene) {
  const mk = (key, sheetKey, start, end, rate, repeat) => {
    if (scene.anims.exists(key)) return;
    if (!scene.textures.exists(sheetKey)) return;
    scene.anims.create({
      key,
      frames: scene.anims.generateFrameNumbers(sheetKey, { start, end }),
      frameRate: rate,
      repeat,
    });
  };

  // ── Minotaur ────────────────────────────────────────────────────────
  mk('minotaur-idle', 'en-minotaur-idle',  0, 9,   8, -1);
  mk('minotaur-walk', 'en-minotaur-walk',  0, 11,  10, -1);
  mk('minotaur-atk',  'en-minotaur-atk',   0, 4,   12, 0);
  mk('minotaur-hurt', 'en-minotaur-hurt',  0, 2,   10, 0);
  mk('minotaur-dead', 'en-minotaur-dead',  0, 4,   8,  0);

  // ── Vampire ────────────────────────────────────────────────────────
  mk('vampire-idle',  'en-vampire-idle',   0, 4,   8,  -1);
  mk('vampire-walk',  'en-vampire-walk',   0, 7,   10, -1);
  mk('vampire-run',   'en-vampire-run',    0, 5,   14, -1);
  mk('vampire-atk',   'en-vampire-atk1',   0, 4,   14, 0);
  mk('vampire-atk2',  'en-vampire-atk2',   0, 2,   12, 0);
  mk('vampire-hurt',  'en-vampire-hurt',   0, 0,   6,  0);
  mk('vampire-block', 'en-vampire-block',  0, 1,   8,  -1);

  // ── Golem (boss) ───────────────────────────────────────────────────
  mk('golem-idle', 'en-golem-idle',  0, 4,   8,  -1);
  mk('golem-walk', 'en-golem-walk',  0, 23,  12, -1);
  mk('golem-atk',  'en-golem-atk',   0, 50,  16, 0);
  mk('golem-atkb', 'en-golem-atkb',  0, 56,  16, 0);
  mk('golem-hurt', 'en-golem-hurt',  0, 11,  12, 0);
  mk('golem-heal', 'en-golem-heal',  0, 74,  10, 0);

  // ── Boss Minotaur (288×160 per frame) ──────────────────────────────
  mk('boss-minotaur-idle', 'en-boss-minotaur', 0, 3,  8, -1);
  mk('boss-minotaur-walk', 'en-boss-minotaur', 4, 7,  10, -1);
  mk('boss-minotaur-atk',  'en-boss-minotaur', 8, 15, 14, 0);
  mk('boss-minotaur-hurt', 'en-boss-minotaur', 16,19, 10, 0);

  // ── Merchant ───────────────────────────────────────────────────────
  mk('merchant-idle',  'npc-merchant-s',    0, 5,   6,  -1);
  mk('merchant-idle2', 'npc-merchant-s2',   0, 10,  8,  -1);
  mk('merchant-talk',  'npc-merchant-talk', 0, 15,  10, -1);

  // ── Witch / Mage ───────────────────────────────────────────────────
  mk('witch-idle', 'npc-witch-s',    0, 7,  8,  -1);
  mk('witch-atk',  'npc-witch-atk',  0, 6,  12, 0);
  mk('witch-walk', 'npc-witch-walk', 0, 6,  10, -1);
  mk('witch-hurt', 'npc-witch-hurt', 0, 3,  10, 0);

  // ── Town guard (gray) ──────────────────────────────────────────────
  mk('guard-idle', 'npc-guard-s',    0, 6,  7,  -1);
  mk('guard-walk', 'npc-guard-walk', 0, 7,  9,  -1);

  // ── Knight (order / final path) ─────────────────────────────────────
  mk('knight-idle', 'npc-knight-idle', 0, 0, 1, -1);
  mk('knight-run',  'npc-knight-run',  0, 0, 1, -1);
  mk('knight-hurt', 'npc-knight-hurt', 0, 0, 1, 0);
  mk('knight-dead', 'npc-knight-dead', 0, 0, 1, 0);
  mk('knight-atk',  'npc-knight-atk',  0, 3, 10, 0);
}
