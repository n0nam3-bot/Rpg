import {
  ALL_ASSET_PATHS, ASSET_ROOT, K,
  generateProceduralTextures,
  registerEnemyAnims,
} from './util.js';

// ─── SPRITE SHEETS (uniform frame grid) ─────────────────────────────────────
// Each entry: [url, key, frameWidth, frameHeight]
const SPRITE_SHEETS = [
  // ── Minotaur ──
  ['enemies/minotaur/Idle.png',    'en-minotaur-idle',  128, 128],
  ['enemies/minotaur/Walk.png',    'en-minotaur-walk',  128, 128],
  ['enemies/minotaur/Attack.png',  'en-minotaur-atk',   128, 128],
  ['enemies/minotaur/Hurt.png',    'en-minotaur-hurt',  128, 128],
  ['enemies/minotaur/Dead.png',    'en-minotaur-dead',  128, 128],
  // ── Vampire ──
  ['enemies/vampire/Idle.png',     'en-vampire-idle',   128, 128],
  ['enemies/vampire/Walk.png',     'en-vampire-walk',   128, 128],
  ['enemies/vampire/Attack_1.png', 'en-vampire-atk1',   128, 128],
  ['enemies/vampire/Attack_2.png', 'en-vampire-atk2',   128, 128],
  ['enemies/vampire/Hurt.png',     'en-vampire-hurt',   128, 128],
  ['enemies/vampire/Protect.png',  'en-vampire-block',  128, 128],
  ['enemies/vampire/Run.png',      'en-vampire-run',    128, 128],
  // ── Golem Boss ──
  ['enemies/bosses/golem/gollux_idle.png',       'en-golem-idle', 128, 128],
  ['enemies/bosses/golem/gollux_attack_A.png',   'en-golem-atk',  128, 128],
  ['enemies/bosses/golem/gollux_hit.png',        'en-golem-hurt', 128, 128],
  ['enemies/bosses/golem/gollux_move.png',       'en-golem-walk', 128, 128],
  ['enemies/bosses/golem/gollux_healing.png',    'en-golem-heal', 128, 128],
  ['enemies/bosses/golem/gollux_attack_B.png',   'en-golem-atkb', 128, 128],
  // ── Boss Minotaur sheet ──
  ['enemies/bosses/minotaur/minotaur_288x160_SpriteSheet.png', 'en-boss-minotaur', 288, 160],
  // ── Merchant ──
  ['merchant/Idle.png',      'npc-merchant-s',    128, 128],
  ['merchant/Idle_2.png',    'npc-merchant-s2',   128, 128],
  ['merchant/Dialogue.png',  'npc-merchant-talk', 128, 128],
  // ── Witch / Mage ──
  ['neutral/mage/Idle.png',      'npc-witch-s',    128, 128],
  ['neutral/mage/Attack_1.png',  'npc-witch-atk',  128, 128],
  ['neutral/mage/Walk.png',      'npc-witch-walk', 128, 128],
  ['neutral/mage/Hurt.png',      'npc-witch-hurt', 128, 128],
  ['neutral/mage/Run.png',       'npc-witch-run',  128, 128],
  // ── Town folk (gray = guard replacement, red = cultist NPCs) ──
  ['neutral/town/gray/Idle.png', 'npc-guard-s',    128, 128],
  ['neutral/town/gray/Walk.png', 'npc-guard-walk', 128, 128],
  ['neutral/town/red/Idle.png',  'npc-cult-s',     128, 128],
  ['neutral/town/red/Walk.png',  'npc-cult-walk',  128, 128],

  // ── Visual aliases used by the rebuilt world/dialogue flow ──
  ['neutral/mage/Idle.png',      'npc-mage-idle',     128, 128],
  ['neutral/mage/Attack_1.png',  'npc-mage-atk',      128, 128],
  ['neutral/mage/Walk.png',      'npc-mage-walk',     128, 128],
  ['neutral/mage/Run.png',       'npc-mage-run',      128, 128],
  ['merchant/Idle.png',          'npc-merchant-idle', 128, 128],
  ['merchant/Idle_2.png',        'npc-merchant-idle2',128, 128],
  ['merchant/Dialogue.png',      'npc-merchant-talk2',128, 128],
  ['neutral/town/gray/Idle.png', 'npc-town-gray-idle',128, 128],
  ['neutral/town/gray/Walk.png', 'npc-town-gray-walk',128, 128],
  ['neutral/town/red/Idle.png',  'npc-town-red-idle', 128, 128],
  ['neutral/town/red/Walk.png',  'npc-town-red-walk', 128, 128],
  // ── Knight (guard NPC / enemy) ──
  ['neutral/knight/Idle.png',    'npc-knight-idle', 256, 256],
  ['neutral/knight/Run.png',     'npc-knight-run',  256, 256],
  ['neutral/knight/Hurt.png',    'npc-knight-hurt', 256, 128],
  ['neutral/knight/Attacks.png', 'npc-knight-atk',  256, 320],
  ['neutral/knight/Death.png',   'npc-knight-dead', 256, 128],
];

// ─── SINGLE IMAGES (large sprites / no clean frame grid) ────────────────────
const SINGLE_IMAGES = [
  // ── Goblin ──
  ['enemies/goblin/idle.png',    'en-goblin-idle'],
  ['enemies/goblin/walk.png',    'en-goblin-walk'],
  ['enemies/goblin/attack2.png', 'en-goblin-atk'],
  ['enemies/goblin/hurt.png',    'en-goblin-hurt'],
  ['enemies/goblin/die.png',     'en-goblin-die'],
  // ── Orc ──
  ['enemies/orc/idle.png',  'en-orc-idle'],
  ['enemies/orc/walk.png',  'en-orc-walk'],
  ['enemies/orc/smash.png', 'en-orc-atk'],
  ['enemies/orc/hurt.png',  'en-orc-hurt'],
  ['enemies/orc/die.png',   'en-orc-die'],
  // ── Boss Goblin ──
  ['enemies/bosses/goblin/idle.png',    'en-bgoblin-idle'],
  ['enemies/bosses/goblin/attack1.png', 'en-bgoblin-atk'],
  ['enemies/bosses/goblin/walk1.png',   'en-bgoblin-walk'],
  ['enemies/bosses/goblin/die.png',     'en-bgoblin-die'],
  // ── Merchant approval ──
  ['merchant/Approval.png',      'npc-merchant-ok'],
];

export class LoadingScene extends Phaser.Scene {
  constructor() { super({ key:'LoadingScene' }); }

  preload() {
    const W = this.scale.width, H = this.scale.height;
    this.cameras.main.setBackgroundColor('#04020a');
    this.add.rectangle(W/2, H/2, W, H, 0x04020a);

    this.add.text(W/2, H/2-100, 'VEILED APOSTASY', {
      fontSize:'52px', color:'#cc44ff', fontStyle:'bold',
      stroke:'#330044', strokeThickness:6,
    }).setOrigin(0.5);
    this.add.text(W/2, H/2-44, 'A Dark Fantasy of Corruption & Consequence', {
      fontSize:'18px', color:'#9966bb', fontStyle:'italic',
    }).setOrigin(0.5);

    const bx = W/2, by = H/2+50;
    this.add.rectangle(bx, by, 620, 30, 0x0c0520, 1).setStrokeStyle(2, 0x6600cc, 0.7);
    this._barFill = this.add.rectangle(bx-306, by, 2, 26, 0xcc00ff, 1).setOrigin(0,0.5);
    this._pctTxt  = this.add.text(bx, by+24, '0%', { fontSize:'13px', color:'#aa66cc' }).setOrigin(0.5);
    this._fileTxt = this.add.text(bx, by+44, 'Loading…', { fontSize:'12px', color:'#664488' }).setOrigin(0.5);

    // ── Shaia + Skeleton individual frames ─────────────────────────────
    ALL_ASSET_PATHS.forEach(p => this.load.image(K(p), ASSET_ROOT + p));

    // ── New sprite sheets ───────────────────────────────────────────────
    SPRITE_SHEETS.forEach(([url, key, fw, fh]) => {
      this.load.spritesheet(key, 'assets/' + url, { frameWidth:fw, frameHeight:fh });
    });

    // ── New single images ───────────────────────────────────────────────
    SINGLE_IMAGES.forEach(([url, key]) => {
      this.load.image(key, 'assets/' + url);
    });

    // ── Background sheets (optional, silent fail) ───────────────────────
    this.load.on('loaderror', () => { /* silently skip missing optional assets */ });

    this.load.on('progress', pct => {
      this._barFill.displayWidth = 612 * pct;
      this._pctTxt.setText(Math.round(pct*100) + '%');
    });
    this.load.on('fileprogress', file => this._fileTxt.setText(file.key));
  }

  create() {
    // Register all Phaser sprite-sheet animations
    registerEnemyAnims(this);
    this._registerTownAnimations();

    // Generate procedural textures for remaining enemies/props
    generateProceduralTextures(this);

    for (let i=0;i<22;i++) this.time.delayedCall(i*80, ()=>this._mote());

    this.time.delayedCall(500, () => {
      this.cameras.main.fade(500, 4, 2, 10, false, (cam, p) => {
        if (p >= 1) this.scene.start('TitleScene');
      });
    });
  }

  _registerTownAnimations() {
    const mk = (key, sheetKey, start, end, rate, repeat=-1) => {
      if (this.anims.exists(key)) return;
      if (!this.textures.exists(sheetKey)) return;
      this.anims.create({
        key,
        frames: this.anims.generateFrameNumbers(sheetKey, { start, end }),
        frameRate: rate,
        repeat,
      });
    };

    // Mage / town / merchant sprite-sheet aliases
    mk('mage-idle', 'npc-mage-idle', 0, 7, 8, -1);
    mk('mage-walk', 'npc-mage-walk', 0, 6, 10, -1);
    mk('mage-run',  'npc-mage-run',  0, 7, 12, -1);
    mk('mage-atk',  'npc-mage-atk',  0, 6, 12, 0);

    mk('merchant-idle',    'npc-merchant-idle',    0, 5, 7, -1);
    mk('merchant-idle2',   'npc-merchant-idle2',   0, 10, 7, -1);
    mk('merchant-talk',    'npc-merchant-talk',    0, 15, 10, -1);
    mk('merchant-talk2',   'npc-merchant-talk2',   0, 15, 10, -1);

    mk('town-gray-idle', 'npc-town-gray-idle', 0, 6, 8, -1);
    mk('town-gray-walk', 'npc-town-gray-walk', 0, 7, 10, -1);
    mk('town-red-idle',  'npc-town-red-idle',  0, 5, 8, -1);
    mk('town-red-walk',  'npc-town-red-walk',  0, 7, 10, -1);
  }

  _mote() {
    const W = this.scale.width, H = this.scale.height;
    const x = Phaser.Math.Between(0, W), y = Phaser.Math.Between(H*0.4, H);
    const c = this.add.circle(x, y, Phaser.Math.Between(2,6),
      Phaser.Math.RND.pick([0x8800ff,0xcc44ff,0x440088,0xff44aa]), Phaser.Math.FloatBetween(0.1,0.4));
    this.tweens.add({ targets:c, y:y-Phaser.Math.Between(60,200), x:x+Phaser.Math.Between(-50,50),
      alpha:0, duration:Phaser.Math.Between(1500,3500), ease:'Quad.easeOut', onComplete:()=>c.destroy() });
  }
}
