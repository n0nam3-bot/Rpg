// ─── CONSTANTS ───────────────────────────────────────────────────────────────
export const SAVE_KEY   = 'veiled_apostasy_v1';
export const ASSET_ROOT = 'assets/';

// ─── ASSET MANIFEST (from ruin_runners_shaia sprite pack) ────────────────────
export const ASSET_FILES = [
  'ruin_runners_shaia/sprites/background/sprites_dungeon/01_dungeon_left.png',
  'ruin_runners_shaia/sprites/background/sprites_dungeon/02_dungeon_center.png',
  'ruin_runners_shaia/sprites/background/sprites_dungeon/03_dungeon_right.png',
  'ruin_runners_shaia/sprites/prop/apple.png',
  'ruin_runners_shaia/sprites/prop/barrel_001.png',
  'ruin_runners_shaia/sprites/prop/chest_open01.png',
  'ruin_runners_shaia/sprites/shaia/sprites_common/common_00_idle_stand_A01.png',
  'ruin_runners_shaia/sprites/shaia/sprites_common/common_00_idle_stand_A02.png',
  'ruin_runners_shaia/sprites/shaia/sprites_common/common_00_idle_stand_A03.png',
  'ruin_runners_shaia/sprites/shaia/sprites_common/common_00_idle_stand_A04.png',
  'ruin_runners_shaia/sprites/shaia/sprites_common/common_00_idle_stand_A05.png',
  'ruin_runners_shaia/sprites/shaia/sprites_common/common_00_idle_stand_A06.png',
  'ruin_runners_shaia/sprites/shaia/sprites_common/common_00_idle_stand_A07.png',
  'ruin_runners_shaia/sprites/shaia/sprites_common/common_00_idle_stand_A08.png',
  'ruin_runners_shaia/sprites/shaia/sprites_common/common_11_walk01.png',
  'ruin_runners_shaia/sprites/shaia/sprites_common/common_11_walk02.png',
  'ruin_runners_shaia/sprites/shaia/sprites_common/common_11_walk03.png',
  'ruin_runners_shaia/sprites/shaia/sprites_common/common_11_walk04.png',
  'ruin_runners_shaia/sprites/shaia/sprites_common/common_11_walk05.png',
  'ruin_runners_shaia/sprites/shaia/sprites_common/common_11_walk06.png',
  'ruin_runners_shaia/sprites/shaia/sprites_common/common_12_run01.png',
  'ruin_runners_shaia/sprites/shaia/sprites_common/common_12_run02.png',
  'ruin_runners_shaia/sprites/shaia/sprites_common/common_12_run03.png',
  'ruin_runners_shaia/sprites/shaia/sprites_common/common_31_guard_stand01.png',
  'ruin_runners_shaia/sprites/shaia/sprites_common/common_31_guard_stand02.png',
  'ruin_runners_shaia/sprites/shaia/sprites_common/common_21_jump_begin01.png',
  'ruin_runners_shaia/sprites/shaia/sprites_common/common_21_jump01.png',
  'ruin_runners_shaia/sprites/shaia/sprites_common/common_22_landing01.png',
  'ruin_runners_shaia/sprites/shaia/sprites_attack/attack_01_cobination0101.png',
  'ruin_runners_shaia/sprites/shaia/sprites_attack/attack_01_cobination0102.png',
  'ruin_runners_shaia/sprites/shaia/sprites_attack/attack_01_cobination0103.png',
  'ruin_runners_shaia/sprites/shaia/sprites_attack/attack_01_cobination0104.png',
  'ruin_runners_shaia/sprites/shaia/sprites_attack/attack_02_cobination0201.png',
  'ruin_runners_shaia/sprites/shaia/sprites_attack/attack_02_cobination0202.png',
  'ruin_runners_shaia/sprites/shaia/sprites_attack/attack_02_cobination0203.png',
  'ruin_runners_shaia/sprites/shaia/sprites_attack/attack_03_cobination0301.png',
  'ruin_runners_shaia/sprites/shaia/sprites_attack/attack_03_cobination0302.png',
  'ruin_runners_shaia/sprites/shaia/sprites_attack/attack_03_cobination0303.png',
  'ruin_runners_shaia/sprites/shaia/sprites_damage/damage_01_damage_head.png',
  'ruin_runners_shaia/sprites/shaia/sprites_damage/damage_02_damage_body.png',
  'ruin_runners_shaia/sprites/shaia/sprites_damage/damage_11_blow_begin01.png',
  'ruin_runners_shaia/sprites/shaia/sprites_damage/damage_21_stun.png',
  'ruin_runners_shaia/sprites/skeleton/common_01_idle01.png',
  'ruin_runners_shaia/sprites/skeleton/attack_01_sword01.png',
  'ruin_runners_shaia/sprites/skeleton/attack_01_sword02.png',
  'ruin_runners_shaia/sprites/skeleton/attack_01_sword03.png',
  'ruin_runners_shaia/sprites/skeleton/attack_01_sword04.png',
  'ruin_runners_shaia/sprites/skeleton/damage_01_damage_head.png',
  'ruin_runners_shaia/sprites/skeleton/damage_02_damage_body.png',
  'ruin_runners_shaia/sprites/skeleton/common_11_walk02.png',
  'ruin_runners_shaia/sprites/skeleton/common_11_walk03.png',
  'ruin_runners_shaia/sprites/skeleton/common_11_walk04.png',
  'ruin_runners_shaia/sprites/skeleton/common_11_walk05.png',
];

export function keyFor(path) {
  return String(path).replace(/\.(png|jpg|jpeg)$/i, '').replace(/[^a-z0-9]+/gi, '_').replace(/^_+|_+$/g, '');
}

export function assetUrl(path) { return `${ASSET_ROOT}${path}`; }

export function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

export function lerp(a, b, t) { return a + (b - a) * t; }

export function rng(lo, hi) { return Phaser.Math.Between(lo, hi); }

// ─── ANIMATION REGISTRY ──────────────────────────────────────────────────────
function mkAnim(game, key, paths, rate = 12, repeat = -1) {
  if (game.anims.exists(key)) return;
  const frames = paths.map(p => ({ key: keyFor(p) })).filter(f => game.textures.exists(f.key));
  if (!frames.length) return;
  game.anims.create({ key, frames, frameRate: rate, repeat, skipMissedFrames: true });
}

export function registerAnimations(game) {
  const S = 'ruin_runners_shaia/sprites/shaia/sprites_common/';
  const A = 'ruin_runners_shaia/sprites/shaia/sprites_attack/';
  const D = 'ruin_runners_shaia/sprites/shaia/sprites_damage/';
  const SK = 'ruin_runners_shaia/sprites/skeleton/';

  mkAnim(game, 'hero-idle',    [`${S}common_00_idle_stand_A01.png`,`${S}common_00_idle_stand_A02.png`,`${S}common_00_idle_stand_A03.png`,`${S}common_00_idle_stand_A04.png`,`${S}common_00_idle_stand_A05.png`,`${S}common_00_idle_stand_A06.png`,`${S}common_00_idle_stand_A07.png`,`${S}common_00_idle_stand_A08.png`], 10);
  mkAnim(game, 'hero-walk',    [`${S}common_11_walk01.png`,`${S}common_11_walk02.png`,`${S}common_11_walk03.png`,`${S}common_11_walk04.png`,`${S}common_11_walk05.png`,`${S}common_11_walk06.png`], 12);
  mkAnim(game, 'hero-run',     [`${S}common_12_run01.png`,`${S}common_12_run02.png`,`${S}common_12_run03.png`], 16);
  mkAnim(game, 'hero-guard',   [`${S}common_31_guard_stand01.png`,`${S}common_31_guard_stand02.png`], 10);
  mkAnim(game, 'hero-jump',    [`${S}common_21_jump_begin01.png`,`${S}common_21_jump01.png`,`${S}common_22_landing01.png`], 14, 0);
  mkAnim(game, 'hero-atk1',   [`${A}attack_01_cobination0101.png`,`${A}attack_01_cobination0102.png`,`${A}attack_01_cobination0103.png`,`${A}attack_01_cobination0104.png`], 20, 0);
  mkAnim(game, 'hero-atk2',   [`${A}attack_02_cobination0201.png`,`${A}attack_02_cobination0202.png`,`${A}attack_02_cobination0203.png`], 20, 0);
  mkAnim(game, 'hero-atk3',   [`${A}attack_03_cobination0301.png`,`${A}attack_03_cobination0302.png`,`${A}attack_03_cobination0303.png`], 20, 0);
  mkAnim(game, 'hero-hurt',   [`${D}damage_01_damage_head.png`,`${D}damage_02_damage_body.png`,`${D}damage_11_blow_begin01.png`], 14, 0);
  mkAnim(game, 'hero-stun',   [`${D}damage_21_stun.png`], 6);
  mkAnim(game, 'sk-idle',     [`${SK}common_01_idle01.png`], 6);
  mkAnim(game, 'sk-walk',     [`${SK}common_11_walk02.png`,`${SK}common_11_walk03.png`,`${SK}common_11_walk04.png`,`${SK}common_11_walk05.png`], 12);
  mkAnim(game, 'sk-atk',      [`${SK}attack_01_sword01.png`,`${SK}attack_01_sword02.png`,`${SK}attack_01_sword03.png`,`${SK}attack_01_sword04.png`], 14, 0);
  mkAnim(game, 'sk-hurt',     [`${SK}damage_01_damage_head.png`,`${SK}damage_02_damage_body.png`], 12, 0);
}

export function loadManifest(scene) {
  ASSET_FILES.forEach(path => scene.load.image(keyFor(path), assetUrl(path)));
}

// ─── PROCEDURAL TEXTURES ─────────────────────────────────────────────────────
export function generateProceduralTextures(scene) {
  const make = (key, w, h, fn) => {
    if (scene.textures.exists(key)) return;
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    fn(g);
    g.generateTexture(key, w, h);
    g.destroy();
  };

  // Cultist enemy (hooded figure)
  make('enemy-cultist', 80, 120, g => {
    g.fillStyle(0x2a0a3a, 1);
    g.fillCircle(40, 22, 18);          // head
    g.fillStyle(0x3d0d52, 1);
    g.fillTriangle(40,4, 10,26, 70,26); // hood
    g.fillStyle(0x1c0630, 1);
    g.fillRect(22, 40, 36, 50);        // robe body
    g.fillRect(14, 90, 16, 28);        // left leg
    g.fillRect(50, 90, 16, 28);        // right leg
    g.fillRect(8, 40, 14, 40);         // left arm
    g.fillRect(58, 40, 14, 40);        // right arm
    g.fillStyle(0xff3366, 0.8);
    g.fillCircle(40, 22, 6);           // glowing face
    g.fillStyle(0x9900cc, 0.5);
    g.fillCircle(40, 58, 12);          // aura orb on chest
  });

  // Shadow Beast enemy (four-legged creature)
  make('enemy-shadow', 100, 80, g => {
    g.fillStyle(0x0a0015, 1);
    g.fillEllipse(50, 44, 70, 40);     // body
    g.fillCircle(78, 32, 22);          // head
    g.fillStyle(0x220033, 1);
    g.fillRect(10, 60, 18, 30);        // FL leg
    g.fillRect(34, 60, 18, 30);        // FR leg
    g.fillRect(56, 60, 18, 30);        // BL leg
    g.fillRect(74, 60, 18, 30);        // BR leg
    g.fillStyle(0xcc00ff, 0.9);
    g.fillCircle(82, 28, 6);           // eye 1
    g.fillCircle(72, 30, 6);           // eye 2
    g.fillStyle(0x660099, 0.3);
    g.fillEllipse(50, 44, 80, 50);     // shadow aura
  });

  // Possessed Guard enemy
  make('enemy-guard', 80, 120, g => {
    g.fillStyle(0x2a3040, 1);
    g.fillCircle(40, 20, 18);          // head
    g.fillStyle(0x3a4050, 1);
    g.fillRect(24, 38, 32, 52);        // body/armor
    g.fillRect(16, 36, 10, 36);        // left pauldron
    g.fillRect(54, 36, 10, 36);        // right pauldron
    g.fillRect(14, 90, 22, 30);        // left leg
    g.fillRect(44, 90, 22, 30);        // right leg
    g.fillStyle(0x8888aa, 1);
    g.fillRect(2, 38, 14, 50);         // shield arm
    g.fillRect(62, 38, 14, 50);        // sword arm
    g.fillStyle(0xff2200, 0.8);
    g.fillCircle(40, 20, 7);           // corrupted eyes glow
    // Sword
    g.fillStyle(0xaaaacc, 1);
    g.fillRect(62, 30, 8, 60);
  });

  // Patron (Boss)
  make('enemy-patron', 120, 160, g => {
    g.fillStyle(0x100020, 1);
    g.fillCircle(60, 28, 26);          // head
    g.fillStyle(0x1a0035, 1);
    g.fillRect(32, 54, 56, 70);        // body
    g.fillRect(12, 50, 22, 60);        // left arm
    g.fillRect(86, 50, 22, 60);        // right arm
    g.fillRect(28, 124, 28, 40);       // left leg
    g.fillRect(64, 124, 28, 40);       // right leg
    // Corruption aura
    g.fillStyle(0x8800cc, 0.25);
    g.fillCircle(60, 80, 70);
    g.fillStyle(0xffaaff, 0.8);
    g.fillCircle(52, 24, 8);           // eye L
    g.fillCircle(68, 24, 8);           // eye R
    g.fillStyle(0xcc44ff, 0.6);
    g.fillCircle(60, 80, 16);          // chest sigil
    // Crown horns
    g.fillStyle(0x220044, 1);
    g.fillTriangle(38, 16, 44, -4, 50, 16);
    g.fillTriangle(70, 16, 76, -4, 82, 16);
  });

  // Portal/door texture
  make('portal', 64, 96, g => {
    g.lineStyle(3, 0x8800ff, 0.9);
    g.strokeRect(6, 6, 52, 84);
    g.fillStyle(0x220044, 0.7);
    g.fillRect(6, 6, 52, 84);
    g.fillStyle(0xcc44ff, 0.4);
    g.fillCircle(32, 48, 22);
    g.fillStyle(0xffffff, 0.6);
    g.fillCircle(32, 48, 8);
  });

  // NPC silhouette templates
  make('npc-elder', 60, 110, g => {
    g.fillStyle(0x4a3020, 1); g.fillCircle(30, 18, 16);
    g.fillStyle(0x6a4a2a, 1); g.fillRect(18, 34, 24, 46);
    g.fillStyle(0x8a6a3a, 1);
    g.fillRect(10, 34, 10, 36); g.fillRect(40, 34, 10, 36);
    g.fillRect(14, 80, 18, 28); g.fillRect(28, 80, 18, 28);
    // Staff
    g.fillStyle(0x8a6020, 1); g.fillRect(4, 24, 6, 80);
    g.fillStyle(0xffcc00, 0.8); g.fillCircle(7, 24, 8);
  });

  make('npc-merchant', 60, 100, g => {
    g.fillStyle(0x5a3a28, 1); g.fillCircle(30, 18, 16);
    g.fillStyle(0x7a5020, 1); g.fillRect(18, 34, 24, 40);
    g.fillRect(10, 34, 10, 32); g.fillRect(40, 34, 10, 32);
    g.fillStyle(0x4a3010, 1);
    g.fillRect(14, 74, 18, 24); g.fillRect(28, 74, 18, 24);
    // Bag
    g.fillStyle(0x8a6030, 0.9); g.fillEllipse(46, 62, 22, 28);
  });

  make('npc-guard', 60, 110, g => {
    g.fillStyle(0x364050, 1); g.fillCircle(30, 18, 16);
    g.fillStyle(0x445060, 1); g.fillRect(16, 34, 28, 48);
    g.fillRect(8, 34, 10, 38); g.fillRect(42, 34, 10, 38);
    g.fillStyle(0x556070, 1);
    g.fillRect(12, 82, 20, 28); g.fillRect(28, 82, 20, 28);
    g.fillStyle(0x8899aa, 1);
    g.fillRect(4, 36, 8, 44); // shield
    g.fillRect(46, 32, 8, 54); // spear
  });

  make('npc-witch', 60, 110, g => {
    g.fillStyle(0x2a1530, 1); g.fillCircle(30, 18, 16);
    g.fillStyle(0x3a1a42, 1); g.fillTriangle(30, -2, 8, 22, 52, 22); // hat
    g.fillRect(18, 34, 24, 46);
    g.fillRect(10, 34, 10, 36); g.fillRect(40, 34, 10, 36);
    g.fillStyle(0x1a0a24, 1);
    g.fillRect(14, 80, 18, 28); g.fillRect(28, 80, 18, 28);
    g.fillStyle(0x9900cc, 0.7); g.fillCircle(30, 18, 7); // glowing eyes
    // Wand
    g.fillStyle(0x660099, 1); g.fillRect(44, 28, 4, 60);
    g.fillStyle(0xcc44ff, 0.9); g.fillCircle(46, 26, 6);
  });

  // Bed prop
  make('bed', 160, 80, g => {
    g.fillStyle(0x4a2030, 1); g.fillRect(0, 20, 160, 60);
    g.fillStyle(0x6a3a50, 1); g.fillRect(0, 10, 160, 16);
    g.fillStyle(0xc8a0b0, 1); g.fillRect(8, 14, 50, 12);   // pillow
    g.fillStyle(0x7a4060, 0.9); g.fillRect(60, 20, 96, 56); // blanket
    g.lineStyle(2, 0xf0c0d0, 0.4); g.strokeRect(0, 10, 160, 70);
  });

  // Mirror prop
  make('mirror', 60, 100, g => {
    g.fillStyle(0x1a0a24, 1); g.fillRect(6, 0, 48, 86);
    g.fillStyle(0x110820, 0.8); g.fillRect(10, 4, 40, 78);
    g.lineStyle(3, 0xcc88ff, 0.7); g.strokeRect(6, 0, 48, 86);
    g.fillStyle(0x8844cc, 0.3); g.fillRect(10, 4, 40, 78);
    // Stand
    g.fillStyle(0x2a1040, 1);
    g.fillRect(14, 84, 32, 8);
    g.fillRect(4, 92, 52, 8);
  });
}

// ─── FRESH STATE ─────────────────────────────────────────────────────────────
export function freshState() {
  return {
    version: 1,
    sceneKey: 'WorldScene',
    area: 'sanctuary',
    spawnX: 200, spawnY: 500,
    day: 1,

    // Core vitals
    hp: 100,  maxHp: 100,
    sta: 100, maxSta: 100,
    wil: 100, maxWil: 100,

    // Dark mechanics (0–100)
    corruption:  0,
    sensitivity: 0,
    arousal:     0,   // resets after each battle
    pressure:    0,

    // Clothing layers
    clothing: {
      outer: { name: 'Apostle Cloak',   dur: 100, max: 100, stripped: false, def: 8  },
      upper: { name: 'Ritual Vestment', dur: 100, max: 100, stripped: false, def: 6  },
      lower: { name: 'Battle Skirt',    dur: 100, max: 100, stripped: false, def: 5  },
      inner: { name: 'Sacred Bindings', dur: 100, max: 100, stripped: false, def: 3  },
      shoes: { name: 'Shadow Treads',   dur: 100, max: 100, stripped: false, def: 2  },
    },

    // Inventory
    items: { healingPotion: 2, flashFlask: 1, holyWater: 0 },

    // Economy / meta
    gold:    10,
    kills:   0,
    defeats: 0,

    // Faction relations (0–100)
    factions: { order: 55, cult: 10, wilds: 60 },

    // NPC disposition (permanent state)
    npcs: {
      elder:    { met: false, trust: 50, hostile: false, stage: 0 },
      merchant: { met: false, trust: 50, suspicious: false, stage: 0 },
      guard:    { met: false, trust: 40, hostile: false, bribed: false, stage: 0 },
      witch:    { met: false, trust: 30, pact: false, stage: 0 },
    },

    // Story flags
    flags: {
      prologueRead:  false,
      firstBattle:   false,
      dungeon1Clear: false,
      sanctumOpen:   false,
      witchPact:     false,
      betrayedOrder: false,
      cultInitiate:  false,
      strippedPublic:false,
      elderReveal:   false,
    },

    questStage: 0,
    objective: 'Find the Elder in the Sanctuary Hall.',

    settings: { shake: true, music: true, mobileControls: true },
  };
}

// ─── STATE NORMALIZATION ─────────────────────────────────────────────────────
export function normalizeState(raw) {
  const base = freshState();
  if (!raw || typeof raw !== 'object') return base;

  const s = {
    ...base, ...raw,
    clothing:  { ...base.clothing,  ...(raw.clothing || {}) },
    items:     { ...base.items,     ...(raw.items    || {}) },
    factions:  { ...base.factions,  ...(raw.factions || {}) },
    flags:     { ...base.flags,     ...(raw.flags    || {}) },
    settings:  { ...base.settings,  ...(raw.settings || {}) },
    npcs: {
      elder:    { ...base.npcs.elder,    ...(raw.npcs?.elder    || {}) },
      merchant: { ...base.npcs.merchant, ...(raw.npcs?.merchant || {}) },
      guard:    { ...base.npcs.guard,    ...(raw.npcs?.guard    || {}) },
      witch:    { ...base.npcs.witch,    ...(raw.npcs?.witch    || {}) },
    },
  };

  // Re-normalize per-clothing-slot objects
  for (const slot of ['outer','upper','lower','inner','shoes']) {
    s.clothing[slot] = { ...base.clothing[slot], ...(raw.clothing?.[slot] || {}) };
  }

  s.hp          = clamp(Number(s.hp          || 100), 0, Number(s.maxHp  || 100));
  s.sta         = clamp(Number(s.sta         || 100), 0, Number(s.maxSta || 100));
  s.wil         = clamp(Number(s.wil         || 100), 0, Number(s.maxWil || 100));
  s.corruption  = clamp(Number(s.corruption  || 0),   0, 100);
  s.sensitivity = clamp(Number(s.sensitivity || 0),   0, 100);
  s.arousal     = clamp(Number(s.arousal     || 0),   0, 100);
  s.pressure    = clamp(Number(s.pressure    || 0),   0, 100);
  s.gold        = Math.max(0, Number(s.gold        || 0));
  s.kills       = Math.max(0, Number(s.kills       || 0));
  s.defeats     = Math.max(0, Number(s.defeats     || 0));
  s.day         = Math.max(1, Number(s.day         || 1));
  s.questStage  = Math.max(0, Number(s.questStage  || 0));

  return s;
}

export function saveState(state) {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
}

export function loadState() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? normalizeState(JSON.parse(raw)) : null;
  } catch { return null; }
}

// ─── CORRUPTION SYSTEM ────────────────────────────────────────────────────────
export function corruptionTier(corruption) {
  if (corruption >= 75) return { tier: 3, label: 'Consumed',  color: 0xcc00ff };
  if (corruption >= 50) return { tier: 2, label: 'Defiled',   color: 0x8800cc };
  if (corruption >= 25) return { tier: 1, label: 'Tainted',   color: 0x550088 };
  return                       { tier: 0, label: 'Pure',      color: 0x4488ff };
}

export function applyCorruption(state, amount) {
  state.corruption  = clamp(state.corruption  + amount,           0, 100);
  state.wil         = clamp(state.wil         - Math.ceil(amount * 0.3), 0, state.maxWil);
  state.sensitivity = clamp(state.sensitivity + Math.ceil(amount * 0.4), 0, 100);
}

// ─── CLOTHING SYSTEM ─────────────────────────────────────────────────────────
export const SLOT_ORDER = ['outer','upper','lower','inner','shoes'];

export function totalClothingDef(clothing) {
  return SLOT_ORDER.reduce((sum, slot) => sum + (clothing[slot].stripped ? 0 : clothing[slot].def), 0);
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
    // Consequences of stripping
    if (slot === 'inner') {
      state.sensitivity = clamp(state.sensitivity + 18, 0, 100);
      state.pressure    = clamp(state.pressure    + 12, 0, 100);
    } else {
      state.pressure = clamp(state.pressure + 6, 0, 100);
    }
    if (slot === 'outer') { state.maxHp  = clamp(state.maxHp  - 5, 30, 100); }
    if (slot === 'upper') { state.maxSta = clamp(state.maxSta - 5, 30, 100); }
    if (slot === 'lower') { state.maxWil = clamp(state.maxWil - 5, 30, 100); }
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
    l.dur = Math.round(l.max * pct);
  }
}

// ─── COMBAT HELPERS ──────────────────────────────────────────────────────────
export function applyDamage(state, hp, sta = 0, wil = 0, pressureAdd = 0) {
  const clothDef = totalClothingDef(state.clothing);
  const reduction = 1 - (clothDef / 100) * 0.6;
  const finalHp = Math.max(1, Math.round(hp * reduction));
  state.hp       = clamp(state.hp       - finalHp, 0, state.maxHp);
  state.sta      = clamp(state.sta      - sta,      0, state.maxSta);
  state.wil      = clamp(state.wil      - wil,      0, state.maxWil);
  state.pressure = clamp(state.pressure + pressureAdd, 0, 100);
  return finalHp;
}

export function applyArousal(state, amount) {
  const sensitivityMod = 1 + state.sensitivity / 100;
  state.arousal = clamp(state.arousal + Math.round(amount * sensitivityMod), 0, 100);
  if (state.arousal >= 60) { state.wil = clamp(state.wil - 4, 0, state.maxWil); }
}

export function isHBound(state) { return state.arousal >= 100; }

// ─── POST-BATTLE OUTCOMES ────────────────────────────────────────────────────
export function applyVictoryReward(state, reward) {
  state.gold   = Math.max(0, state.gold + (reward.gold || 0));
  state.kills  = Math.max(0, state.kills + 1);
  state.hp     = clamp(state.hp  + (reward.hp  || 0), 0, state.maxHp);
  state.sta    = clamp(state.sta + (reward.sta || 0), 0, state.maxSta);
  state.wil    = clamp(state.wil + (reward.wil || 0), 0, state.maxWil);
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
  state.hp        = clamp(Math.floor(state.maxHp * 0.5), 1, state.maxHp);
  state.sta       = clamp(Math.floor(state.maxSta * 0.5), 1, state.maxSta);
  state.wil       = clamp(Math.floor(state.maxWil * 0.5), 1, state.maxWil);
  state.arousal   = 0;
  // Apply clothing damage from defeat
  if (encounter.stripsOnDefeat) {
    const stripped = stripFirstIntactLayer(state);
    return stripped;
  }
  return null;
}

// ─── NPC/FACTION HELPERS ─────────────────────────────────────────────────────
export function adjustTrust(state, npcKey, delta) {
  if (!state.npcs[npcKey]) return;
  state.npcs[npcKey].trust = clamp((state.npcs[npcKey].trust || 50) + delta, 0, 100);
}

export function adjustFaction(state, factionKey, delta) {
  if (state.factions[factionKey] === undefined) return;
  state.factions[factionKey] = clamp(state.factions[factionKey] + delta, 0, 100);
}

// ─── NAVIGATION ──────────────────────────────────────────────────────────────
export function sceneToNext(scene, key, extra = {}) {
  const state = scene.state;
  state.sceneKey = key;
  saveState(state);
  scene.scene.start(key, { state, ...extra });
}

// ─── UI FACTORIES ────────────────────────────────────────────────────────────
export function makeMeter(scene, x, y, w, label, fillColor) {
  const bg   = scene.add.rectangle(x, y, w, 18, 0x0e0a16, 0.9).setOrigin(0, 0.5).setScrollFactor(0).setDepth(5100);
  const fill = scene.add.rectangle(x, y, w, 18, fillColor, 1).setOrigin(0, 0.5).setScrollFactor(0).setDepth(5101);
  const txt  = scene.add.text(x + 6, y, label, { fontSize: '12px', color: '#fff', fontStyle: 'bold' }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(5102);
  return {
    bg, fill, txt, w,
    set(val, max) {
      const pct = clamp(max > 0 ? val / max : 0, 0, 1);
      fill.displayWidth = w * pct;
      txt.setText(`${label}  ${Math.round(val)}/${Math.round(max)}`);
    }
  };
}

export function createButton(scene, x, y, w, h, label, onClick, opts = {}) {
  const fill   = opts.fill   || 0x2c1f38;
  const stroke = opts.stroke || 0xf0c6ff;
  const sz     = opts.fontSize || '16px';
  const depth  = opts.depth  || 6000;
  const g = scene.add.container(x, y).setScrollFactor(0).setDepth(depth);
  const r = scene.add.rectangle(0, 0, w, h, fill, 0.95).setOrigin(0.5).setStrokeStyle(2, stroke, 0.85);
  r.setInteractive(new Phaser.Geom.Rectangle(-w/2, -h/2, w, h), Phaser.Geom.Rectangle.Contains, { useHandCursor: true });
  const t = scene.add.text(0, 0, label, { fontSize: sz, color: opts.textColor || '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
  g.add([r, t]);
  let fired = false;
  const fire = () => {
    if (fired) return;
    fired = true;
    if (onClick) onClick();
  };
  r.on('pointerover',  () => r.setFillStyle(opts.hoverFill || 0x4a2060, 0.95));
  r.on('pointerout',   () => { r.setFillStyle(fill, 0.95); fired = false; });
  r.on('pointerdown',  fire);
  r.on('pointerup',    fire);
  r.on('pointerupoutside', () => { fired = false; });
  return { g, r, t, fire };
}

export function makePanel(scene, x, y, w, h, opts = {}) {
  const depth = opts.depth || 6000;
  const bg  = scene.add.rectangle(x, y, w, h, opts.fill || 0x0f0818, opts.alpha ?? 0.94).setScrollFactor(0).setDepth(depth);
  bg.setStrokeStyle(2, opts.stroke || 0xcc88ff, 0.6);
  return bg;
}

// ─── VIRTUAL CONTROLS ────────────────────────────────────────────────────────
export function makeVirtualControls(scene) {
  const touch = !!(scene.sys.game.device.input.touch || window.matchMedia?.('(pointer:coarse)').matches);
  const vis   = touch && scene.state?.settings?.mobileControls !== false;
  const W = scene.scale.width;
  const H = scene.scale.height;
  const state = { left:false, right:false, jump:false, interact:false, attack:false };

  const ctr = scene.add.container(0, 0).setScrollFactor(0).setDepth(9000).setVisible(vis);
  const btns = {};

  const defs = [
    ['left',     88, H-112, 92, 92, '◀'],
    ['right',   192, H-112, 92, 92, '▶'],
    ['jump',    W-310, H-112, 92, 92, 'JUMP'],
    ['attack',  W-198, H-112, 92, 92, 'ATK'],
    ['interact', W-86, H-112, 92, 92, 'USE'],
  ];

  defs.forEach(([key, bx, by, bw, bh, lbl]) => {
    const r = scene.add.rectangle(bx, by, bw, bh, 0x200c2c, 0.5).setScrollFactor(0).setDepth(9001);
    r.setStrokeStyle(2, 0xf0c0ff, 0.5);
    const t = scene.add.text(bx, by, lbl, { fontSize:'13px', color:'#fff', fontStyle:'bold' }).setOrigin(0.5).setScrollFactor(0).setDepth(9002);
    ctr.add([r, t]);
    r.setInteractive(new Phaser.Geom.Rectangle(-bw/2,-bh/2,bw,bh), Phaser.Geom.Rectangle.Contains, { useHandCursor:true });
    r.on('pointerdown',  () => { state[key] = true; });
    r.on('pointerup',    () => { state[key] = false; });
    r.on('pointerupoutside', () => { state[key] = false; });
    r.on('pointerout',   () => { state[key] = false; });
    btns[key] = { r, t };
  });

  return { state, ctr, btns, visible: vis };
}

export function readControls(scene, virtual) {
  const k = scene.keys || {};
  const v = virtual?.state || {};
  return {
    left:     !!(k.LEFT?.isDown  || k.A?.isDown     || v.left),
    right:    !!(k.RIGHT?.isDown || k.D?.isDown     || v.right),
    jump:     !!(k.UP?.isDown    || k.W?.isDown     || k.SPACE?.isDown || v.jump),
    interact: !!(k.E?.isDown     || k.ENTER?.isDown || v.interact),
    attack:   !!(k.X?.isDown     || k.J?.isDown     || v.attack),
    guard:    !!(k.SHIFT?.isDown || k.C?.isDown),
    run:      !!(k.SHIFT?.isDown),
    esc:      !!(k.ESC?.isDown),
  };
}

export function makeStaticRect(scene, x, y, w, h) {
  const r = scene.add.rectangle(x, y, w, h, 0x000000, 0).setOrigin(0.5);
  scene.physics.add.existing(r, true);
  return r;
}

// ─── HUD HELPER ──────────────────────────────────────────────────────────────
export function addTopBar(scene, title) {
  const W = scene.scale.width;
  scene.add.rectangle(W/2, 34, W, 68, 0x0a0612, 0.88).setScrollFactor(0).setDepth(5000);
  scene.add.text(24, 16, title, { fontSize:'24px', color:'#fff', fontStyle:'bold' }).setScrollFactor(0).setDepth(5001);
}
