import {
  normalizeState, saveState, clamp,
  FramePlayer, EnemyAnimator, K, FRAMES, makeVirtualControls,
  makeMeter, corruptionTier, intactCount, totalClothingDef,
  generateProceduralTextures,
} from './util.js';
import { ENCOUNTERS, CORRIDOR_EVENTS } from './data.js';

const WORLD_W  = 7200;
const GROUND_Y = 572;

export class WorldScene extends Phaser.Scene {
  constructor() { super({ key:'WorldScene' }); }

  init(data = {}) {
    this.state    = normalizeState(data.state);
    this._spawnX  = data.spawnX ?? this.state.spawnX ?? 220;
    this._spawnY  = GROUND_Y - 80;
    this._showPrologue = !!data.showPrologue;
    this._paused   = false;
    this._eventCD  = 0;
    this._jumpNow     = false;
    this._interactNow = false;
    this._heroAnimState = '';
    this._heroFP = null;
  }

  create() {
    const W = this.scale.width, H = this.scale.height;
    this.input.addPointer(4);

    this.physics.world.setBounds(0, 0, WORLD_W, 720);
    this.cameras.main.setBounds(0, 0, WORLD_W, 720);

    this._buildWorld(W, H);
    this._setupPlayer();
    this._setupInput(W, H);
    this._createNPCs();
    this._createPatrols();
    this._createInteractables();
    this._createPickups();
    this._createDoors(W, H);
    this._buildHUD(W, H);

    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    // Prompt text
    this._promptText = this.add.text(W/2, H-44, '', {
      fontSize:'15px', color:'#fff', backgroundColor:'#00000099',
      padding:{ x:10, y:4 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(6100);

    // Resume handler (returning from any sub-scene)
    this.events.on('resume', (_, data) => {
      if (!data) { this._paused = false; return; }
      if (data.state)         this.state = normalizeState(data.state);
      if (data.battleDone)    this._onBattleReturn(data);
      else                    this._paused = false;
      if (data.strippedLayer) this._floatText(this.player.x, this.player.y-60, `${data.strippedLayer} STRIPPED!`, '#ff4444');
      saveState(this.state);
      this._refreshHUD();
    });

    if (this._showPrologue) {
      this._paused = true;
      this.time.delayedCall(400, () => this._showProloguePanel(W, H));
    }

    this.cameras.main.fadeIn(500, 4, 2, 10);
    this._refreshHUD();
  }

  // ─── WORLD BUILD ────────────────────────────────────────────────────────
  _buildWorld(W, H) {
    const bgKey = K(FRAMES.S_IDLE[0]).replace('shaia_sprites_common_common_00_idle_stand_a01','');
    // Procedural dark dungeon background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x07030e, 0x07030e, 0x0f0520, 0x0f0520, 1);
    bg.fillRect(0, 0, WORLD_W, 720);
    // Pillars in sanctuary zone
    for (let px=250; px<2400; px+=400) {
      bg.fillStyle(0x180830, 1); bg.fillRect(px-16, 0, 32, GROUND_Y);
      bg.lineStyle(1, 0x4422aa, 0.35); bg.strokeRect(px-16, 0, 32, GROUND_Y);
    }
    // Catacomb arches
    for (let px=2600; px<5600; px+=320) {
      bg.fillStyle(0x081810, 1); bg.fillRect(px-13, 0, 26, GROUND_Y);
      bg.lineStyle(1, 0x224433, 0.4); bg.strokeRect(px-13, 0, 26, GROUND_Y);
    }
    // Sanctum glow
    bg.fillStyle(0xaa0022, 0.07); bg.fillCircle(6400, 300, 500);

    // Ground
    const gnd = this.add.graphics();
    gnd.fillStyle(0x0c0322, 1); gnd.fillRect(0, GROUND_Y, WORLD_W, 720-GROUND_Y);
    gnd.lineStyle(3, 0x440077, 0.7); gnd.lineBetween(0, GROUND_Y, WORLD_W, GROUND_Y);
    for (let bx=0; bx<WORLD_W; bx+=200) {
      gnd.lineStyle(1, 0x1e0840, 0.4); gnd.lineBetween(bx, GROUND_Y, bx, 720);
    }

    // Corruption world overlay (updates each frame)
    this._corrWorldOverlay = this.add.rectangle(WORLD_W/2, 360, WORLD_W, 720, 0xaa0033, 0).setDepth(49);

    // Zone labels
    [
      ['SANCTUARY HALL', 1200, '#aa66cc'],
      ['CATACOMBS',      4000, '#44aa66'],
      ['INNER SANCTUM',  6400, '#cc4466'],
    ].forEach(([lbl, x, col]) => {
      this.add.text(x, 48, lbl, { fontSize:'13px', color:col, fontStyle:'bold' }).setOrigin(0.5).setAlpha(0.5);
    });

    // Main ground collider
    this._ground = this.add.rectangle(WORLD_W/2, GROUND_Y+24, WORLD_W, 48, 0,0).setOrigin(0.5);
    this.physics.add.existing(this._ground, true);

    // Platforms
    this._platforms = [];
    [[700,488],[1420,448],[2120,488],[2780,458],[3320,478],[3920,458],[4520,488],[5120,460],[5820,488],[6420,450]].forEach(([px,py]) => {
      const p = this.add.rectangle(px, py, 220, 18, 0x1a0a30, 1).setOrigin(0.5).setStrokeStyle(1, 0x5522aa, 0.5);
      this.physics.add.existing(p, true);
      this._platforms.push(p);
    });
  }

  // ─── PLAYER ─────────────────────────────────────────────────────────────
  _setupPlayer() {
    const heroKey = this.textures.exists(K(FRAMES.S_IDLE[0])) ? K(FRAMES.S_IDLE[0]) : 'npc-elder';
    this.player = this.physics.add.sprite(this._spawnX, this._spawnY, heroKey)
      .setScale(0.86).setCollideWorldBounds(true).setDepth(100);
    this.player.body.setSize(60, 88, true);
    this.player.setBounce(0.02);

    this.physics.add.collider(this.player, this._ground);
    this._platforms.forEach(p => this.physics.add.collider(this.player, p));

    this._heroFP = new FramePlayer(this, this.player);
    this._heroFP.loop(FRAMES.S_IDLE, 9);
    this._heroAnimState = 'idle';
    this._applyCorruptionTint();
  }

  _applyCorruptionTint() {
    const intact = intactCount(this.state.clothing);
    const corr   = this.state.corruption;
    if (intact <= 1)      this.player.setTint(0xff9999);
    else if (corr >= 75)  this.player.setTint(0xdd88ff);
    else if (corr >= 50)  this.player.setTint(0xeeccff);
    else                  this.player.clearTint();
  }

  // ─── INPUT ───────────────────────────────────────────────────────────────
  _setupInput(W, H) {
    this.keys = this.input.keyboard.addKeys(
      'LEFT,RIGHT,UP,DOWN,A,D,W,S,SPACE,SHIFT,E,ENTER,ESC,I,M,X'
    );

    // Edge-triggered events (not polled in update)
    ['UP','W','SPACE'].forEach(k => this.keys[k].on('down', () => {
      if (this.player.body.blocked.down) this._jumpNow = true;
    }));
    ['E','ENTER'].forEach(k => this.keys[k].on('down', () => { this._interactNow = true; }));
    this.keys.I.on('down',   () => { if (!this._paused) this._openInventory(); });
    this.keys.ESC.on('down', () => { if (!this._paused) this._openSettings(); });

    // Virtual D-pad (touch)
    if (this.state.settings.mobileControls !== false) {
      this._buildVirtualDpad(W, H);
    }
  }

  _buildVirtualDpad(W, H) {
    const BW = 96, BH = 80, gap = 10;
    const ly = H - 56, ry = H - 56;

    const mkBtn = (label, x, y, onDown, onUp) => {
      const g = this.add.graphics().setScrollFactor(0).setDepth(9001);
      g.fillStyle(0x1a0030, 0.55); g.fillRoundedRect(-BW/2, -BH/2, BW, BH, 10);
      g.lineStyle(2, 0x9944ff, 0.55); g.strokeRoundedRect(-BW/2, -BH/2, BW, BH, 10);
      g.setPosition(x, y);
      const t = this.add.text(x, y, label, { fontSize:'14px', color:'#ffffffbb', fontStyle:'bold' }).setOrigin(0.5).setScrollFactor(0).setDepth(9002);
      const zone = this.add.zone(x, y, BW, BH).setScrollFactor(0).setDepth(9003).setInteractive();
      zone.on('pointerdown', (ptr) => { g.setAlpha(0.95); onDown(ptr); });
      this.input.on('pointerup', (ptr) => onUp(ptr));
    };

    const held = {};
    const makeHeld = (key) => [
      (ptr) => { held[ptr.id] = key; this[`_${key}Held`] = true; },
      (ptr) => { if (held[ptr.id] === key) { this[`_${key}Held`] = false; delete held[ptr.id]; } },
    ];

    const [ldL, luL] = makeHeld('left');
    const [ldR, luR] = makeHeld('right');

    mkBtn('◀', 72,   ly, ldL, luL);
    mkBtn('▶', 180,  ly, ldR, luR);
    mkBtn('▲', 126,  ly-90, (ptr) => {
      if (this.player.body.blocked.down) this._jumpNow = true;
    }, ()=>{});
    mkBtn('E\nINT', W-184, ry, () => { this._interactNow = true; }, ()=>{});
    mkBtn('I\nINV', W-72,  ry, () => { if (!this._paused) this._openInventory(); }, ()=>{});
  }

  // ─── NPCs ────────────────────────────────────────────────────────────────
  _createNPCs() {
    // skey = initial texture key, animKey = sprite-sheet animation to play
    const defs = [
      { key:'elder',    x:600,  label:'Elder Thane',   color:'#ccaaff', skey:'npc-elder',      animKey:null           },
      { key:'merchant', x:1100, label:'Merchant Ida',  color:'#ffcc88', skey:'npc-merchant-s', animKey:'merchant-idle'},
      { key:'guard',    x:2300, label:'Capt. Serrin',  color:'#88aacc', skey:'npc-guard-s',    animKey:'guard-idle'   },
      { key:'witch',    x:5500, label:'Witch Moira',   color:'#cc88ff', skey:'npc-witch-s',    animKey:'witch-idle'   },
    ];

    this._npcs = defs.map(d => {
      // Use sprite (not image) so anims.play() works
      const tex = this.textures.exists(d.skey) ? d.skey : 'npc-elder';
      const spr = this.add.sprite(d.x, GROUND_Y-54, tex).setOrigin(0.5,1).setScale(0.92).setDepth(90);

      // Play sprite-sheet animation if registered
      if (d.animKey && this.anims.exists(d.animKey)) {
        spr.anims.play(d.animKey, true);
      } else if (!d.animKey) {
        // Procedural: gentle bob tween
        this.tweens.add({ targets:spr, y:spr.y-5, yoyo:true, repeat:-1,
          duration:1600+Math.random()*400, ease:'Sine.easeInOut' });
      }

      const lbl = this.add.text(d.x, GROUND_Y-120, d.label, {
        fontSize:'13px', color:d.color, fontStyle:'bold',
        backgroundColor:'#00000077', padding:{x:5,y:2},
      }).setOrigin(0.5);
      const ekey = this.add.text(d.x, GROUND_Y-100, '[E]', {
        fontSize:'12px', color:'#ffffff88',
      }).setOrigin(0.5);

      return { ...d, spr, lbl, ekey };
    });
  }

  // ─── PATROLS ─────────────────────────────────────────────────────────────
  _createPatrols() {
    const skKey = this.textures.exists(K(FRAMES.SK_IDLE[0])) ? K(FRAMES.SK_IDLE[0]) : 'npc-elder';

    const patrolDefs = [
      { x:2800, min:2550, max:3150, enc:ENCOUNTERS.goblin,        color:0xaacc44 },
      { x:3600, min:3250, max:3950, enc:ENCOUNTERS.minotaur,      color:0xcc4422 },
      { x:4400, min:4050, max:4750, enc:ENCOUNTERS.vampire,       color:0xcc22cc },
      { x:5000, min:4750, max:5350, enc:ENCOUNTERS.possessedGuard,color:0x4422cc },
    ];

    this._patrols = patrolDefs.map(d => {
      const enc = d.enc;

      // Resolve initial texture
      let tex;
      if (enc.useSkeleton) {
        tex = skKey;
      } else if (enc.spriteKey && this.textures.exists(enc.spriteKey)) {
        tex = enc.spriteKey;
      } else {
        tex = skKey;
      }

      const sc  = (enc.scale || 1.0) * 0.78; // slightly smaller in world vs battle
      const spr = this.add.sprite(d.x, GROUND_Y-54, tex)
        .setScale(sc).setOrigin(0.5, 1).setDepth(88);

      // Build frame sets mirroring battle.js _buildEnemySets
      let sets;
      if (enc.useSkeleton) {
        sets = { idle:FRAMES.SK_IDLE, walk:FRAMES.SK_WALK, atk:FRAMES.SK_ATK, hurt:FRAMES.SK_HURT };
      } else {
        sets = {
          idle: enc.spriteKey ? [enc.spriteKey] : FRAMES.SK_IDLE,
          walk: enc.spriteKey ? [enc.spriteKey] : FRAMES.SK_WALK,
        };
      }
      const ea = new EnemyAnimator(this, spr, enc.animPrefix, sets);
      ea.idle();   // start in idle, switch to walk in update

      const lbl = this.add.text(d.x, GROUND_Y-112, enc.label, {
        fontSize:'12px', color:'#ffcccc',
        backgroundColor:'#00000077', padding:{x:4,y:2},
      }).setOrigin(0.5);

      const arrow = this.add.triangle(d.x, GROUND_Y-124, -10,0, 10,0, 0,-14, d.color, 0.85).setDepth(89);

      return { ...d, spr, ea, lbl, arrow, dir:1, speed:44+Math.random()*18, alive:true, moving:false };
    });
  }

  // ─── INTERACTABLES ───────────────────────────────────────────────────────
  _createInteractables() {
    this._items = [];
    // Bed
    this.add.image(380, GROUND_Y-18, 'bed').setOrigin(0.5,1).setScale(0.72).setDepth(85);
    this._items.push({ x:380, prompt:'Rest — restores all stats [E]', action:()=>this._rest() });
    // Mirror
    this.add.image(860, GROUND_Y-4, 'mirror').setOrigin(0.5,1).setScale(0.8).setDepth(85);
    this._items.push({ x:860, prompt:'Examine yourself [E]', action:()=>this._openStatus() });
    // Chest 1
    if (this.textures.exists('chest')) {
      this.add.image(1720, GROUND_Y-2, 'chest').setOrigin(0.5,1).setScale(0.85).setDepth(85);
    }
    this._items.push({ x:1720, prompt:'Open chest [E]', opened:false, action:()=>this._openChest('c1', 25, { flashFlask:1 }) });
    // Chest 2
    this._items.push({ x:3820, prompt:'Open chest [E]', opened:false, action:()=>this._openChest('c2', 15, { holyWater:1 }) });
    // Altar
    const ag = this.add.graphics().setDepth(85);
    ag.fillStyle(0x220044,1); ag.fillRect(5985, GROUND_Y-54, 60, 54);
    ag.lineStyle(2, 0xcc44ff, 0.7); ag.strokeRect(5985, GROUND_Y-54, 60, 54);
    ag.fillStyle(0xcc44ff,0.4); ag.fillCircle(6015, GROUND_Y-60, 12);
    this._items.push({ x:6015, prompt:'Examine the dark altar [E]', action:()=>this._examineAltar() });
  }

  _createPickups() {
    this._pickups = [480,900,1320,2050,3240,4020,4840].map((x,i) => {
      const g = this.add.graphics().setDepth(86);
      g.fillStyle(0xffcc44,0.9); g.fillCircle(0,0,9);
      g.lineStyle(2,0xffee88,1); g.strokeCircle(0,0,9);
      g.setPosition(x, GROUND_Y-14);
      this.tweens.add({ targets:g, y:GROUND_Y-22, yoyo:true, repeat:-1, duration:900+i*70 });
      return { x, g, collected:false, type:i%3===0?'potion':'gold', value:i%3===0?1:(8+i*4) };
    });
  }

  _createDoors(W, H) {
    this._doors = [];
    const mkDoor = (x, label, test) => {
      const dg = this.add.graphics().setDepth(87);
      dg.fillStyle(0x180040,0.85); dg.fillRect(x-28, GROUND_Y-90, 56, 90);
      dg.lineStyle(3, 0x8822ff, 0.8); dg.strokeRect(x-28, GROUND_Y-90, 56, 90);
      dg.fillStyle(0x6611cc,0.5); dg.fillCircle(x, GROUND_Y-44, 18);
      this.add.text(x, GROUND_Y-104, label, { fontSize:'12px', color:'#cc88ff', fontStyle:'bold' }).setOrigin(0.5);
      this._doors.push({ x, label, test });
    };

    mkDoor(100,    '← TITLE',    ()=>true,  () => this.scene.start('TitleScene'));
    mkDoor(2375,   'Catacombs ▶',()=>true);
    mkDoor(5575,   'Sanctum ▶',  (s)=>s.questStage>=2||s.flags.sanctumOpen||s.npcs.guard.bribed);
    this._doors[1].target = 2450;
    this._doors[2].target = 5650;
  }

  // ─── HUD ─────────────────────────────────────────────────────────────────
  _buildHUD(W, H) {
    this.add.rectangle(W/2, 33, W, 66, 0x05020c, 0.9).setScrollFactor(0).setDepth(5000);
    this._zoneTxt = this.add.text(22, 12, 'SANCTUARY HALL', { fontSize:'21px', color:'#cc88ff', fontStyle:'bold' }).setScrollFactor(0).setDepth(5001);
    this._dayTxt  = this.add.text(22, 40, '', { fontSize:'13px', color:'#886699' }).setScrollFactor(0).setDepth(5001);

    this._hpM   = makeMeter(this, W-292, 18, 266, 'HP',   0xff6688);
    this._staM  = makeMeter(this, W-292, 40, 266, 'STA',  0x44aaff);
    this._wilM  = makeMeter(this, W-292, 62, 266, 'WIL',  0xaaffaa);

    this.add.rectangle(158, H-20, 320, 28, 0x08030e, 0.82).setScrollFactor(0).setDepth(5000);
    this._corrM = makeMeter(this, 4, H-30, 308, 'CORR', 0xcc00ff);
    this._presM = makeMeter(this, 4, H-52, 308, 'PRSS', 0xff8833);

    this._objTxt = this.add.text(W/2, 14, '', { fontSize:'13px', color:'#ccbbdd', align:'center' }).setOrigin(0.5).setScrollFactor(0).setDepth(5001);
    this.add.text(W-16, 14, 'I=Inv  ESC=Menu', { fontSize:'11px', color:'#443355' }).setOrigin(1,0).setScrollFactor(0).setDepth(5001);
  }

  _refreshHUD() {
    const s = this.state;
    this._hpM.set(s.hp, s.maxHp); this._staM.set(s.sta, s.maxSta); this._wilM.set(s.wil, s.maxWil);
    this._corrM.set(s.corruption, 100); this._presM.set(s.pressure, 100);
    const tier    = corruptionTier(s.corruption);
    const stripped = 5 - intactCount(s.clothing);
    const tStr    = stripped > 0 ? ` | ⚠${stripped} stripped` : '';
    this._dayTxt.setText(`Day ${s.day}  ·  ${tier.label}${tStr}  ·  ${s.gold}g  ·  ${s.kills} kills`);
    this._objTxt.setText(s.objective);
    const px2 = this.player?.x || 0;
    const zone = px2 < 2400 ? 'SANCTUARY HALL' : px2 < 5600 ? 'CATACOMBS' : 'INNER SANCTUM';
    this._zoneTxt.setText(zone);

    // Corruption world tint — intensifies as corruption rises
    if (this._corrWorldOverlay) {
      const corrAlpha = (s.corruption / 100) * 0.16;
      this._corrWorldOverlay.setAlpha(corrAlpha);
    }

    // Stripped-in-public flag — if clothing is visibly stripped while in the sanctuary
    if (!s.flags.strippedPublic && px2 < 2400 && Object.values(s.clothing).filter(c => c.stripped).length >= 2) {
      s.flags.strippedPublic = true;
      saveState(s);
    }
  }

  // ─── UPDATE ──────────────────────────────────────────────────────────────
  update(time, delta) {
    if (this._paused) return;

    const onGround = this.player.body.blocked.down;
    const left  = this.keys.LEFT.isDown  || this.keys.A.isDown   || !!this._leftHeld;
    const right = this.keys.RIGHT.isDown || this.keys.D.isDown   || !!this._rightHeld;
    const shift = this.keys.SHIFT.isDown;
    const speed = shift ? 244 : 170;

    let vx = 0;
    if (left)  { vx = -speed; this.player.setFlipX(true);  }
    if (right) { vx =  speed; this.player.setFlipX(false); }
    this.player.setVelocityX(vx);

    // Jump
    if (this._jumpNow && onGround) {
      this.player.setVelocityY(-464);
    }
    this._jumpNow = false;

    // Interact
    if (this._interactNow) { this._tryInteract(); }
    this._interactNow = false;

    // Animation
    this._tickAnim(vx, onGround, shift);

    // Patrol AI
    this._updatePatrols(delta / 1000);

    // Proximity prompt
    const near = this._findNear();
    this._promptText.setText(near?.prompt || '');

    // Pickups
    this._collectPickups();

    // Random events
    if (this._eventCD > 0) this._eventCD -= delta;
    else if (Math.random() < 0.0003) this._randomEvent();

    // Boss trigger zone (Inner Sanctum, deep area)
    this._checkBossTrigger();

    this._refreshHUD();
  }

  _tickAnim(vx, onGround, shift) {
    let next = 'idle';
    if (!onGround)           next = 'jump';
    else if (Math.abs(vx)>0) next = shift ? 'run' : 'walk';

    if (next === this._heroAnimState) return;
    this._heroAnimState = next;

    switch(next) {
      case 'idle': this._heroFP.loop(FRAMES.S_IDLE,  9); break;
      case 'walk': this._heroFP.loop(FRAMES.S_WALK, 14); break;
      case 'run':  this._heroFP.loop(FRAMES.S_WALK, 20); break;
      case 'jump': this._heroFP.set(FRAMES.S_IDLE[3]); break;
    }
  }

  _updatePatrols(dt) {
    this._patrols.forEach(p => {
      if (!p.alive) return;
      p.spr.x += p.dir * p.speed * dt;
      p.lbl.x   = p.spr.x;
      p.arrow.x  = p.spr.x;

      // Flip + switch anim on turn
      if (p.spr.x >= p.max || p.spr.x <= p.min) {
        p.dir *= -1;
        p.spr.setFlipX(p.dir < 0);
      }

      // Toggle walk / idle based on speed
      const isMoving = Math.abs(p.dir) > 0;
      if (isMoving !== p.moving) {
        p.moving = isMoving;
        if (isMoving) p.ea.walk();
        else          p.ea.idle();
      }

      // Player contact → battle
      if (Math.abs(p.spr.x - this.player.x) < 58 && Math.abs(p.spr.y - this.player.y) < 94) {
        p.alive = false;
        p.spr.setAlpha(0.22);
        p.lbl.setAlpha(0.22);
        p.arrow.setAlpha(0.22);
        p.ea.stop();
        this._startBattle(p.enc);
      }
    });
  }

  _findNear() {
    const px = this.player.x, py = this.player.y;
    for (const n of this._npcs) {
      if (Math.abs(px-n.x)<110 && Math.abs(py-GROUND_Y)<120)
        return { prompt:`Speak with ${n.label} [E / INT]`, action:()=>this._openDialogue(n.key) };
    }
    for (const d of this._doors) {
      if (Math.abs(px-d.x)<80) {
        if (d.x === 100) return { prompt:`Return to Title [E]`, action:()=>this.scene.start('TitleScene') };
        return { prompt:`Enter: ${d.label} [E]`, action:()=>this._useDoor(d) };
      }
    }
    for (const it of this._items) {
      if (Math.abs(px-it.x)<90 && !it.opened) return { prompt:it.prompt, action:it.action };
      if (it.opened && Math.abs(px-it.x)<90) return { prompt:'Already opened', action:()=>{} };
    }
    return null;
  }

  _tryInteract() {
    const near = this._findNear();
    if (near) near.action();
  }

  _collectPickups() {
    this._pickups.forEach(p => {
      if (p.collected || Math.abs(this.player.x-p.x)>38 || Math.abs(this.player.y-p.y)>60) return;
      p.collected = true; p.g.destroy();
      if (p.type==='potion') { this.state.items.healingPotion=(this.state.items.healingPotion||0)+1; this._floatText(p.x,p.y,'+ Potion','#88ff88'); }
      else { this.state.gold+=p.value; this._floatText(p.x,p.y,`+${p.value}g`,'#ffdd44'); }
      saveState(this.state);
    });
  }

  _floatText(wx, wy, msg, color) {
    const cam = this.cameras.main;
    const sx = wx - cam.scrollX, sy = wy - cam.scrollY - 20;
    const t = this.add.text(sx, sy, msg, { fontSize:'17px', color, fontStyle:'bold', stroke:'#000', strokeThickness:2 })
      .setScrollFactor(0).setDepth(8000);
    this.tweens.add({ targets:t, y:sy-70, alpha:0, duration:1300, ease:'Quad.easeOut', onComplete:()=>t.destroy() });
  }

  _randomEvent() {
    const evs = CORRIDOR_EVENTS.filter(e => e.requires(this.state) && Math.random()<e.chance*3);
    if (!evs.length) return;
    const ev = Phaser.Math.RND.pick(evs);
    ev.effect(this.state);
    this._floatText(this.player.x, this.player.y-60, ev.text, '#cc88ff');
    this._eventCD = 9000;
    saveState(this.state);
  }

  // ─── ACTIONS ─────────────────────────────────────────────────────────────
  _rest() {
    this.state.hp  = this.state.maxHp;
    this.state.sta = this.state.maxSta;
    this.state.wil = this.state.maxWil;
    this.state.arousal  = 0;
    this.state.pressure = Math.max(0, this.state.pressure-30);
    this.state.day += 1;
    this.state.objective = `Day ${this.state.day}: Continue deeper.`;
    saveState(this.state);
    this.cameras.main.flash(280, 240, 220, 255);
    this._floatText(this.player.x, this.player.y-60, 'Rested — Day Advances', '#ffddff');
  }

  _openChest(id, gold, items={}) {
    if (this.state.flags[`${id}Opened`]) { this._floatText(this.player.x, this.player.y-40, 'Already opened', '#888'); return; }
    this.state.flags[`${id}Opened`] = true;
    this.state.gold += gold;
    Object.entries(items).forEach(([k,v]) => this.state.items[k]=(this.state.items[k]||0)+v);
    const s = Object.entries(items).map(([k,v])=>`${v}× ${k}`).join(', ');
    this._floatText(this.player.x, this.player.y-50, `${gold}g${s?' + '+s:''}`, '#ffdd44');
    // Mark the interactable as opened
    const targetItem = this._items.find(it => (it.x === 1720 && id === 'c1') || (it.x === 3820 && id === 'c2')); if (targetItem) {   targetItem.opened = true; }
    saveState(this.state);
  }

  _examineAltar() {
    this.state.questStage = Math.max(this.state.questStage, 2);
    this.state.objective  = 'Reach the Patron in the Inner Sanctum.';
    this.state.corruption = Math.min(100, this.state.corruption+2);
    this._floatText(this.player.x, this.player.y-60, 'The altar pulses with hunger...', '#cc44ff');
    saveState(this.state);
  }

  _useDoor(door) {
    if (door.test && !door.test(this.state)) {
      this._floatText(this.player.x, this.player.y-50, 'The way is sealed.', '#ff4444');
      return;
    }
    const tx = door.target || this._spawnX;
    this.cameras.main.fade(350, 4, 2, 10, false, (cam, p) => {
      if (p >= 1) {
        this.player.x = tx;
        this.cameras.main.scrollX = tx - this.scale.width/2;
        this.cameras.main.fadeIn(350, 4, 2, 10);
        this.state.spawnX = tx;
        saveState(this.state);
      }
    });
  }

  _startBattle(encounter) {
    this._paused = true;
    saveState(this.state);
    this.scene.launch('BattleScene', { state:this.state, encounter, returnTo:'WorldScene' });
    this.scene.pause();
  }

  _openDialogue(npcKey) {
    this._paused = true;
    this.state.npcs[npcKey].met = true;
    saveState(this.state);
    this.scene.launch('DialogueScene', { state:this.state, npcKey, returnTo:'WorldScene' });
    this.scene.pause();
  }

  _openStatus() {
    this._paused = true;
    this.scene.launch('StatusScene', { state:this.state, returnTo:'WorldScene' });
    this.scene.pause();
  }

  _openInventory() {
    this._paused = true;
    this.scene.launch('InventoryScene', { state:this.state, returnTo:'WorldScene' });
    this.scene.pause();
  }

  _openSettings() {
    this._paused = true;
    this.scene.launch('SettingsScene', { state:this.state, returnTo:'WorldScene' });
    this.scene.pause();
  }

  _onBattleReturn(data) {
    this._paused = false;
    if (data.outcome === 'defeat') {
      this.player.x = 220;
      this.player.y = GROUND_Y - 80;
      this.cameras.main.fadeIn(500, 4, 2, 10);
    }
    if (data.outcome === 'victory' && data.encounterId) {
      // Patrol already marked alive=false on contact; nothing more needed
      saveState(this.state);
    }
    this._applyCorruptionTint();
    this._refreshHUD();
  }

  // ─── BOSS TRIGGER ─────────────────────────────────────────────────────────
  _checkBossTrigger() {
    if (this._paused || this._bossTriggered) return;
    const px = this.player?.x || 0;
    const s  = this.state;
    // Boss zone: deep Inner Sanctum
    if (px >= 6700 && (s.questStage >= 2 || s.flags.sanctumOpen || s.npcs.guard.bribed)) {
      if (!s.flags.patronDefeated) {
        this._bossTriggered = true;
        this._showBossWarning();
      }
    }
  }

  _showBossWarning() {
    const W = this.scale.width, H = this.scale.height;
    this._paused = true;
    // Dramatic red flash
    const flash = this.add.rectangle(W/2, H/2, W, H, 0xaa0022, 0).setScrollFactor(0).setDepth(8000);
    this.tweens.add({ targets:flash, alpha:{ from:0, to:0.5 }, duration:400, yoyo:true });

    const c = this.add.container(W/2, H/2).setScrollFactor(0).setDepth(8001);
    const bg  = this.add.rectangle(0,0, 760,320, 0x06010c, 0.98).setStrokeStyle(3, 0xff0044, 0.9);
    const t1  = this.add.text(0,-116,'THE PATRON STIRS',{fontSize:'40px',color:'#ff2244',fontStyle:'bold',stroke:'#220000',strokeThickness:5}).setOrigin(0.5);
        const t2  = this.add.text(0,-28,[
      'You have reached the Inner Sanctums heart.',
      'The Patron senses your approach — and your corruption.',
      '',
      'Ensure your willpower is strong and your inventory is prepared.',
      'Holy Water weakens it significantly.',
      '',
      this.state.flags.witchPact ? 'The pact with Moira will serve you here.' : 'If Witch Moira offered a pact, consider returning to her first.',
    ].join(`\n`), {fontSize:'15px',color:'#ccbbdd',align:'center',wordWrap:{width:700},lineSpacing:4}).setOrigin(0.5);

    const fight = this.add.rectangle(-110,128, 200,56, 0x2a0000, 0.92).setStrokeStyle(2,0xff2244,0.85);
    const fTxt  = this.add.text(-110,128,'FACE IT',{fontSize:'20px',color:'#fff',fontStyle:'bold'}).setOrigin(0.5);
    const back  = this.add.rectangle(110,128, 200,56, 0x0a001a, 0.92).setStrokeStyle(2,0x7733cc,0.8);
    const bTxt  = this.add.text(110,128,'RETREAT',{fontSize:'20px',color:'#cc88ff',fontStyle:'bold'}).setOrigin(0.5);
    c.add([bg,t1,t2,fight,fTxt,back,bTxt]);

    fight.setInteractive({useHandCursor:true});
    fight.on('pointerdown',()=>{
      c.destroy(); flash.destroy();
      this._startBattle(ENCOUNTERS.patronBoss || this._getPatronEncounter());
    });
    back.setInteractive({useHandCursor:true});
    back.on('pointerdown',()=>{
      c.destroy(); flash.destroy();
      this._bossTriggered = false;
      this._paused = false;
      // Push player back slightly
      this.player.x = 6500;
    });

    // Keyboard
    const kb = this.input.keyboard.once('keydown-ENTER', ()=>{
      if (!c.active) return;
      c.destroy(); flash.destroy();
      this._startBattle(this._getPatronEncounter());
    });
    this.input.keyboard.once('keydown-ESC', ()=>{
      if (!c.active) return;
      c.destroy(); flash.destroy();
      this._bossTriggered = false;
      this._paused = false;
      this.player.x = 6500;
    });
  }

  _getPatronEncounter() {
    // Import inline to avoid circular dependency issues
    return {
      id:'patronBoss', label:'The Patron',
      spriteKey:'enemy-patron', useSkeleton:false, spriteFamily:null,
      hp:200, maxHp:200, atk:22, def:10, isBoss:true,
      corruptionOnDefeat:15, stripsOnDefeat:true,
      reward:{ gold:120, hp:20, sta:20, wil:20, pressureDrop:40, item:'holyWater', corruptionDrop:12 },
      intents:['heavyStrike','arouse','heavyStrip','bind','voidPulse','heavyStrike','guard','voidPulse'],
      stripChance:0.62, arousalAttack:true, bindAttack:true,
      lore:'The architect of the sanctuary's fall. It does not hate you. It simply wants — your will, your flesh, your becoming.',
    };
  }

  // ─── PROLOGUE ─────────────────────────────────────────────────────────────
  _showProloguePanel(W, H) {
    const c = this.add.container(W/2, H/2).setScrollFactor(0).setDepth(9999);
    const bg  = this.add.rectangle(0,0, 840,460, 0x07030f, 0.97).setStrokeStyle(2, 0x8833cc, 0.8);
    const t1  = this.add.text(0,-185,'VEILED APOSTASY',{fontSize:'34px',color:'#cc44ff',fontStyle:'bold'}).setOrigin(0.5);
    const txt = [
      'You are Verity — an apostate cleric cast out from the Order of Light.',
      '',
      'Drawn by visions you cannot ignore, you have returned to the Sanctuary',
      'of the Sealed Flame. Something ancient and patient has broken free.',
      '',
      'Corruption here is not merely spiritual. It is physical, seductive,',
      'and deeply hungry. It will try to claim you as it has claimed others.',
      '',
      'Clothing stripped in battle leaves you exposed. Trust given and broken',
      'cannot be reclaimed. The Patron watches — and it is learning your shape.',
      '',
      'Whatever you choose to become here, you will not leave unchanged.',
    ].join('\n');
    const t2 = this.add.text(0,-20, txt, {fontSize:'15px',color:'#ccbbdd',align:'center',lineSpacing:5,wordWrap:{width:780}}).setOrigin(0.5);
    const btn = this.add.rectangle(0, 190, 240,52, 0x330044, 0.9).setStrokeStyle(2,0xcc44ff,0.8);
    const bt  = this.add.text(0, 190, 'BEGIN', {fontSize:'20px',color:'#fff',fontStyle:'bold'}).setOrigin(0.5);
    c.add([bg,t1,t2,btn,bt]);
    btn.setInteractive({ useHandCursor:true });
    btn.on('pointerdown', () => {
      c.destroy(); this._paused = false;
      this.state.flags.prologueRead = true;
      saveState(this.state);
    });
  }
}
