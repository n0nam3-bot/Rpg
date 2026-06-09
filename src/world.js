import {
  normalizeState, saveState, clamp, keyFor,
  makeMeter, makeVirtualControls, readControls, makeStaticRect,
  corruptionTier, sceneToNext, totalClothingDef, intactCount,
} from './util.js';
import { ENCOUNTERS, CORRIDOR_EVENTS } from './data.js';

const BG_L = keyFor('ruin_runners_shaia/sprites/background/sprites_dungeon/01_dungeon_left.png');
const BG_C = keyFor('ruin_runners_shaia/sprites/background/sprites_dungeon/02_dungeon_center.png');
const BG_R = keyFor('ruin_runners_shaia/sprites/background/sprites_dungeon/03_dungeon_right.png');
const HERO = keyFor('ruin_runners_shaia/sprites/shaia/sprites_common/common_00_idle_stand_A01.png');

const WORLD_W = 7200;
const WORLD_H = 720;
const GROUND_Y = 570;

// Zone boundaries
const ZONES = {
  sanctuary: { x1: 0,    x2: 2400 },
  catacombs: { x1: 2400, x2: 5600 },
  sanctum:   { x1: 5600, x2: 7200 },
};

export class WorldScene extends Phaser.Scene {
  constructor() { super({ key: 'WorldScene' }); }

  init(data = {}) {
    this.state = normalizeState(data.state);
    this.state.sceneKey = 'WorldScene';
    this._spawnX = Number(data.spawnX || this.state.spawnX || 200);
    this._spawnY = Number(data.spawnY || GROUND_Y - 60);
    this._showPrologue = data.showPrologue || false;
    this._dialogueJustClosed = false;
    this._lastInteract = false;
    this._eventCooldown = 0;
    this._currentZone = 'sanctuary';
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    this.input.addPointer(3);
    this.physics.world.setBounds(0, 0, WORLD_W, WORLD_H);
    this.cameras.main.setBounds(0, 0, WORLD_W, WORLD_H);

    // ── BACKGROUND ─────────────────────────────────────────────────────────
    this._buildBackground(W, H);

    // ── FLOOR COLLIDERS ────────────────────────────────────────────────────
    this._floors = [];
    this._floors.push(makeStaticRect(this, WORLD_W / 2, GROUND_Y + 24, WORLD_W, 48));
    // Platforms
    [[700,490],[1400,450],[2100,490],[2750,460],[3300,480],[3900,460],[4500,490],[5100,460],[5800,490],[6400,450]].forEach(([x,y]) => {
      this._floors.push(makeStaticRect(this, x, y, 220, 18));
    });

    // ── PLAYER ─────────────────────────────────────────────────────────────
    this.player = this.physics.add.sprite(this._spawnX, this._spawnY, HERO).setScale(0.86).setCollideWorldBounds(true);
    this.player.body.setSize(68, 86, true);
    this.player.setBounce(0.02);
    this._floors.forEach(f => this.physics.add.collider(this.player, f));

    // ── CONTROLS ───────────────────────────────────────────────────────────
    this._vCtrl = makeVirtualControls(this);
    this.keys = this.input.keyboard.addKeys('LEFT,RIGHT,UP,DOWN,A,D,W,S,SPACE,SHIFT,E,ENTER,ESC,X,I,M');

    // ── NPCs ───────────────────────────────────────────────────────────────
    this._npcs = this._createNPCs();

    // ── ENEMY PATROLS ──────────────────────────────────────────────────────
    this._patrols = this._createPatrols();

    // ── INTERACTABLES (props) ──────────────────────────────────────────────
    this._interactables = this._createInteractables();

    // ── PICKUPS ────────────────────────────────────────────────────────────
    this._pickups = this._createPickups();

    // ── ZONE DOORS ─────────────────────────────────────────────────────────
    this._doors = this._createDoors(W, H);

    // ── HUD ────────────────────────────────────────────────────────────────
    this._buildHUD(W, H);

    // ── CAMERA ─────────────────────────────────────────────────────────────
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    // ── PROXIMITY PROMPT ───────────────────────────────────────────────────
    this._promptText = this.add.text(W / 2, H - 44, '', {
      fontSize: '15px', color: '#fff', backgroundColor: '#00000088', padding: { x: 10, y: 4 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(6000);

    // ── EVENT LISTENER: DIALOGUE CLOSED ────────────────────────────────────
    this.events.on('resume', (_, data) => {
      if (data?.dialogueClosed) {
        this._dialogueJustClosed = true;
        this._applyDialogueState(data.state);
        this.time.delayedCall(300, () => { this._dialogueJustClosed = false; });
      }
      if (data?.battleDone) {
        this._applyBattleReturn(data);
      }
    });

    // ── PROLOGUE ───────────────────────────────────────────────────────────
    if (this._showPrologue) {
      this.time.delayedCall(500, () => this._showProloguePanel());
    }

    this.cameras.main.fadeIn(600, 4, 2, 10);
    this._refreshHUD();
  }

  // ─── BACKGROUND ──────────────────────────────────────────────────────────
  _buildBackground(W, H) {
    const useProcedural = !this.textures.exists(BG_C);

    if (!useProcedural) {
      for (let i = 0; i < Math.ceil(WORLD_W / 512); i++) {
        const bg = this.add.image(512 * i + 256, H / 2, BG_C)
          .setDisplaySize(512, H)
          .setScrollFactor(0.28 + (i % 3) * 0.01);
        const tints = [0x1a0c2e, 0x220d30, 0x180a28];
        bg.setTint(tints[i % tints.length]);
      }
      if (this.textures.exists(BG_L)) {
        this.add.image(0, 0, BG_L).setOrigin(0, 0).setDisplaySize(600, H).setTint(0x0e0618).setScrollFactor(0.15);
        this.add.image(WORLD_W - 600, 0, BG_R).setOrigin(0, 0).setDisplaySize(600, H).setTint(0x0e0618).setScrollFactor(0.15);
      }
    } else {
      // Procedural background
      const g = this.add.graphics();
      for (let i = 0; i < Math.ceil(WORLD_W / 512); i++) {
        const shade = 0x0f0a1e + (i % 3) * 0x030108;
        g.fillStyle(shade, 1);
        g.fillRect(512 * i, 0, 512, H);
      }
    }

    // Zone tint overlays (semantic colour)
    const zoneOverlay = this.add.graphics();
    // Sanctuary: slight warm purple
    zoneOverlay.fillStyle(0x2a0040, 0.12);
    zoneOverlay.fillRect(0, 0, 2400, H);
    // Catacombs: colder, darker blue-green
    zoneOverlay.fillStyle(0x002018, 0.18);
    zoneOverlay.fillRect(2400, 0, 3200, H);
    // Inner Sanctum: deep crimson corruption
    zoneOverlay.fillStyle(0x1a0008, 0.25);
    zoneOverlay.fillRect(5600, 0, 1600, H);

    // Floor platform visuals
    const floor = this.add.graphics();
    floor.fillStyle(0x1a0830, 1);
    floor.fillRect(0, GROUND_Y, WORLD_W, WORLD_H - GROUND_Y);
    floor.lineStyle(3, 0x440066, 0.6);
    floor.lineBetween(0, GROUND_Y, WORLD_W, GROUND_Y);

    // Zone labels
    [['SANCTUARY HALL', 1200, 60, '#aa66cc'], ['CATACOMBS', 4000, 60, '#44aa88'], ['INNER SANCTUM', 6400, 60, '#dd4466']].forEach(([lbl, x, y, col]) => {
      this.add.text(x, y, lbl, { fontSize: '13px', color: col, alpha: 0.5, fontStyle: 'bold' }).setOrigin(0.5).setAlpha(0.5);
    });

    // Sanctuary structural elements (pillars)
    [300, 700, 1100, 1500, 1900].forEach(px => {
      const pg = this.add.graphics();
      pg.fillStyle(0x2a1040, 1);
      pg.fillRect(px - 16, GROUND_Y - 200, 32, 200);
      pg.lineStyle(2, 0x6622aa, 0.4);
      pg.strokeRect(px - 16, GROUND_Y - 200, 32, 200);
    });

    // Catacomb walls/arches
    [2600, 3000, 3400, 3800, 4200, 4600, 5000, 5400].forEach(px => {
      const ag = this.add.graphics();
      ag.fillStyle(0x0a1a10, 1);
      ag.fillRect(px - 14, GROUND_Y - 180, 28, 180);
      ag.lineStyle(2, 0x224a33, 0.5);
      ag.strokeRect(px - 14, GROUND_Y - 180, 28, 180);
    });

    // Sanctum ominous glow
    const aura = this.add.graphics();
    aura.fillStyle(0xcc0033, 0.08);
    aura.fillCircle(6400, 400, 400);
  }

  // ─── NPCs ──────────────────────────────────────────────────────────────────
  _createNPCs() {
    const defs = [
      { key: 'elder',    x: 600,  y: GROUND_Y, spriteKey: 'npc-elder',    label: 'Elder Thane',     colour: '#ccaaff' },
      { key: 'merchant', x: 1100, y: GROUND_Y, spriteKey: 'npc-merchant', label: 'Merchant Ida',    colour: '#ffcc88' },
      { key: 'guard',    x: 2300, y: GROUND_Y, spriteKey: 'npc-guard',    label: 'Captain Serrin',  colour: '#88aacc' },
      { key: 'witch',    x: 5500, y: GROUND_Y, spriteKey: 'npc-witch',    label: 'Witch Moira',     colour: '#cc88ff' },
    ];
    return defs.map(d => {
      const sprite = this.add.image(d.x, d.y - 50, d.spriteKey).setOrigin(0.5, 1).setScale(0.92);
      const nameTag = this.add.text(d.x, d.y - 110, d.label, {
        fontSize: '14px', color: d.colour, fontStyle: 'bold', backgroundColor: '#00000066', padding: { x: 6, y: 3 },
      }).setOrigin(0.5);
      const eKey = this.add.text(d.x, d.y - 88, '[E]', { fontSize: '12px', color: '#ffffff88' }).setOrigin(0.5);
      // Gentle bob
      this.tweens.add({ targets: sprite, y: sprite.y - 6, yoyo: true, repeat: -1, duration: 1600 + Math.random() * 400, ease: 'Sine.easeInOut' });
      return { ...d, sprite, nameTag, eKey };
    });
  }

  // ─── PATROL ENEMIES ────────────────────────────────────────────────────────
  _createPatrols() {
    const defs = [
      { x: 2800, min: 2550, max: 3100, encounter: ENCOUNTERS.possessedGuard, col: 0xdd4422 },
      { x: 3600, min: 3300, max: 3900, encounter: ENCOUNTERS.cultistSeducer, col: 0xcc22cc },
      { x: 4400, min: 4100, max: 4700, encounter: ENCOUNTERS.shadowBeast,    col: 0x6611cc },
      { x: 5000, min: 4800, max: 5300, encounter: ENCOUNTERS.undeadMinion,   col: 0x33aa55 },
    ];
    return defs.map(d => {
      const g = this.add.graphics();
      g.fillStyle(d.col, 0.85);
      g.fillTriangle(0, -44, -18, 0, 18, 0); // alert arrow above enemy
      const sprite = this.add.image(d.x, GROUND_Y - 50, d.encounter.spriteKey).setOrigin(0.5, 1).setScale(0.9);
      const lbl = this.add.text(d.x, GROUND_Y - 106, d.encounter.label, {
        fontSize: '12px', color: '#ffcccc', backgroundColor: '#00000077', padding: { x: 5, y: 2 },
      }).setOrigin(0.5);
      g.setPosition(d.x, GROUND_Y - 100);
      return { ...d, sprite, lbl, g, dir: 1, speed: 40 + Math.random() * 20, alive: true };
    });
  }

  // ─── INTERACTABLES ─────────────────────────────────────────────────────────
  _createInteractables() {
    const items = [];

    // Bed (sanctuary)
    const bed = this.add.image(400, GROUND_Y - 20, 'bed').setOrigin(0.5, 1).setScale(0.7);
    items.push({ x: 400, y: GROUND_Y, label: 'Bed', prompt: 'Rest — restore all stats and advance day [E]', action: () => this._rest() });

    // Mirror / status
    const mirror = this.add.image(850, GROUND_Y - 4, 'mirror').setOrigin(0.5, 1).setScale(0.8);
    items.push({ x: 850, y: GROUND_Y, label: 'Mirror', prompt: 'Check your full status [E]', action: () => this._openStatus() });

    // Chest (sanctuary)
    const chest1key = this.textures.exists(keyFor('ruin_runners_shaia/sprites/prop/chest_open01.png')) ? keyFor('ruin_runners_shaia/sprites/prop/chest_open01.png') : null;
    if (chest1key) {
      const chest = this.add.image(1700, GROUND_Y - 2, chest1key).setOrigin(0.5, 1).setScale(0.85);
      items.push({ x: 1700, y: GROUND_Y, label: 'Chest', prompt: 'Open chest [E]', opened: false, action: () => this._openChest('chest1', 25, { flashFlask: 1 }) });
    }

    // Chest (catacombs)
    items.push({ x: 3800, y: GROUND_Y, label: 'Chest', prompt: 'Open chest [E]', opened: false, action: () => this._openChest('chest2', 15, { holyWater: 1 }) });

    // Altar (sanctum)
    const altarG = this.add.graphics();
    altarG.fillStyle(0x220044, 1); altarG.fillRect(-30, -50, 60, 50);
    altarG.lineStyle(2, 0xcc44ff, 0.7); altarG.strokeRect(-30, -50, 60, 50);
    altarG.fillStyle(0xcc44ff, 0.4); altarG.fillCircle(0, -56, 12);
    altarG.setPosition(6000, GROUND_Y);
    items.push({ x: 6000, y: GROUND_Y, label: 'Ancient Altar', prompt: 'Examine the altar [E]', action: () => this._examineAltar() });

    return items;
  }

  // ─── PICKUPS ───────────────────────────────────────────────────────────────
  _createPickups() {
    const pickupKey = this.textures.exists(keyFor('ruin_runners_shaia/sprites/prop/apple.png'))
      ? keyFor('ruin_runners_shaia/sprites/prop/apple.png') : null;

    const positions = [500, 900, 1300, 2100, 3200, 4000, 4800];
    return positions.map((x, i) => {
      const g = this.add.graphics();
      g.fillStyle(0xffcc44, 0.9);
      g.fillCircle(0, 0, 10);
      g.lineStyle(2, 0xffee88, 1);
      g.strokeCircle(0, 0, 10);
      g.setPosition(x, GROUND_Y - 14);
      this.tweens.add({ targets: g, y: GROUND_Y - 22, yoyo: true, repeat: -1, duration: 900 + i * 80, ease: 'Sine.easeInOut' });
      return { x, y: GROUND_Y - 14, sprite: g, collected: false, type: i % 3 === 0 ? 'potion' : 'gold', value: i % 3 === 0 ? 1 : (8 + i * 3) };
    });
  }

  // ─── ZONE DOORS ────────────────────────────────────────────────────────────
  _createDoors(W, H) {
    const doors = [];
    const mkDoor = (x, label, targetArea, requirements) => {
      const dg = this.add.graphics();
      dg.fillStyle(0x1a0040, 0.85); dg.fillRect(-28, -88, 56, 88);
      dg.lineStyle(3, 0x9922ff, 0.8); dg.strokeRect(-28, -88, 56, 88);
      dg.fillStyle(0x6611cc, 0.5); dg.fillCircle(0, -44, 20);
      dg.setPosition(x, GROUND_Y);
      const lbl = this.add.text(x, GROUND_Y - 104, label, { fontSize: '13px', color: '#cc88ff', fontStyle: 'bold' }).setOrigin(0.5);
      doors.push({ x, y: GROUND_Y, label, targetArea, requirements, sprite: dg, lbl });
    };

    mkDoor(2380, 'Catacombs >', 'catacombs', null);
    mkDoor(5580, 'Inner Sanctum >', 'sanctum',   s => s.questStage >= 2 || s.flags.sanctumOpen || s.npcs.guard.bribed);
    mkDoor(100,  '< Title',       'title',      null);

    return doors;
  }

  // ─── HUD ───────────────────────────────────────────────────────────────────
  _buildHUD(W, H) {
    this.add.rectangle(W / 2, 34, W, 68, 0x06030e, 0.88).setScrollFactor(0).setDepth(5000);

    this._titleText = this.add.text(24, 16, 'SANCTUARY HALL', {
      fontSize: '22px', color: '#cc88ff', fontStyle: 'bold',
    }).setScrollFactor(0).setDepth(5001);

    this._dayText = this.add.text(24, 44, '', { fontSize: '13px', color: '#886699' }).setScrollFactor(0).setDepth(5001);

    this._hpMeter  = makeMeter(this, W - 290, 20, 260, 'HP',   0xff6688);
    this._staMeter = makeMeter(this, W - 290, 42, 260, 'STA',  0x44aaff);
    this._wilMeter = makeMeter(this, W - 290, 64, 260, 'WIL',  0xaaffaa);

    // Corruption meter (bottom-left HUD strip)
    this.add.rectangle(150, H - 20, 300, 28, 0x0a0614, 0.8).setScrollFactor(0).setDepth(5000);
    this._corrMeter = makeMeter(this, 5, H - 29, 294, 'CORR', 0xcc00ff);
    this._pressMeter = makeMeter(this, 5, H - 51, 294, 'PRSS', 0xff8833);

    // Objective
    this._objText = this.add.text(W / 2, 16, '', { fontSize: '13px', color: '#ccbbdd', align: 'center' }).setOrigin(0.5).setScrollFactor(0).setDepth(5001);

    // Menu hint (top-right)
    this.add.text(W - 18, 16, 'I=Inventory  M=Map  ESC=Settings', { fontSize: '12px', color: '#554466' }).setOrigin(1, 0).setScrollFactor(0).setDepth(5001);
  }

  _refreshHUD() {
    const s = this.state;
    this._hpMeter.set(s.hp, s.maxHp);
    this._staMeter.set(s.sta, s.maxSta);
    this._wilMeter.set(s.wil, s.maxWil);
    this._corrMeter.set(s.corruption, 100);
    this._pressMeter.set(s.pressure, 100);

    const tier = corruptionTier(s.corruption);
    const stripped = 5 - intactCount(s.clothing);
    const tierLabel = stripped > 0 ? `${tier.label} | ⚠ ${stripped} stripped` : tier.label;
    this._dayText.setText(`Day ${s.day}  ·  ${tierLabel}  ·  Gold ${s.gold}  ·  Kills ${s.kills}`);
    this._objText.setText(s.objective);

    const zone = this._getZone(this.player?.x || this._spawnX);
    const zoneName = zone === 'sanctuary' ? 'SANCTUARY HALL' : zone === 'catacombs' ? 'CATACOMBS' : 'INNER SANCTUM';
    this._titleText.setText(zoneName);
  }

  _getZone(x) {
    if (x < 2400) return 'sanctuary';
    if (x < 5600) return 'catacombs';
    return 'sanctum';
  }

  // ─── UPDATE ────────────────────────────────────────────────────────────────
  update(time, delta) {
    if (this._paused) return;

    const input = readControls(this, this._vCtrl);
    const onGround = this.player.body.blocked.down;
    const speed = input.run ? 240 : 170;
    let vx = 0;

    if (input.left)  vx -= speed;
    if (input.right) vx += speed;
    this.player.setVelocityX(vx);

    if (input.jump && onGround) {
      this.player.setVelocityY(-460);
    }

    if (vx !== 0) this.player.setFlipX(vx < 0);

    // Animations
    if (!onGround) {
      this._setAnim('hero-jump');
    } else if (Math.abs(vx) > 200) {
      this._setAnim('hero-run');
    } else if (Math.abs(vx) > 0) {
      this._setAnim('hero-walk');
    } else {
      this._setAnim('hero-idle');
    }

    // ── PATROLS ──────────────────────────────────────────────────────────
    this._updatePatrols(delta);

    // ── PROXIMITY DETECTION ──────────────────────────────────────────────
    const near = this._findNear();
    this._promptText.setText(near ? near.prompt : '');

    // ── INTERACTION ──────────────────────────────────────────────────────
    if (input.interact && !this._lastInteract && !this._dialogueJustClosed) {
      if (near) near.action();
    }
    this._lastInteract = input.interact;

    // ── PICKUP COLLECTION ────────────────────────────────────────────────
    this._checkPickups();

    // ── HUD REFRESH ──────────────────────────────────────────────────────
    this._refreshHUD();
    this._eventCooldown = Math.max(0, this._eventCooldown - delta);

    // ── KEY SHORTCUTS ────────────────────────────────────────────────────
    if (Phaser.Input.Keyboard.JustDown(this.keys.I)) { this._openInventory(); }
    if (Phaser.Input.Keyboard.JustDown(this.keys.ESC)) { this._openSettings(); }

    // ── RANDOM CORRIDOR EVENTS ────────────────────────────────────────────
    if (this._eventCooldown <= 0 && Math.random() < 0.0004) {
      this._triggerRandomEvent();
    }
  }

  _setAnim(key) {
    if (!this.player.anims || this.player.anims.currentAnim?.key === key) return;
    if (this.game.anims.exists(key)) this.player.anims.play(key, true);
  }

  _updatePatrols(delta) {
    const dt = delta / 1000;
    this._patrols.forEach(p => {
      if (!p.alive) return;
      p.sprite.x += p.dir * p.speed * dt;
      p.lbl.x = p.sprite.x;
      p.g.x = p.sprite.x;

      if (p.sprite.x >= p.max || p.sprite.x <= p.min) {
        p.dir *= -1;
        p.sprite.setFlipX(p.dir < 0);
      }

      // Check collision with player → trigger battle
      const dx = Math.abs(p.sprite.x - this.player.x);
      const dy = Math.abs(p.sprite.y - this.player.y);
      if (dx < 55 && dy < 80 && p.alive) {
        p.alive = false;
        p.sprite.setAlpha(0.3);
        p.lbl.setAlpha(0.3);
        p.g.setAlpha(0.3);
        this._startBattle(p.encounter);
      }
    });
  }

  _findNear() {
    const px = this.player.x;
    const py = this.player.y;
    const DIST = 100;

    // NPCs
    for (const npc of this._npcs) {
      if (Math.abs(px - npc.x) < DIST && Math.abs(py - npc.y) < 100) {
        return { prompt: `Speak with ${npc.label} [E]`, action: () => this._openDialogue(npc.key) };
      }
    }

    // Doors
    for (const door of this._doors) {
      if (Math.abs(px - door.x) < 70) {
        return { prompt: `Enter: ${door.label} [E]`, action: () => this._useDoor(door) };
      }
    }

    // Interactables
    for (const item of this._interactables) {
      if (Math.abs(px - item.x) < 90 && Math.abs(py - item.y) < 100) {
        return { prompt: item.prompt, action: item.action };
      }
    }

    return null;
  }

  _checkPickups() {
    this._pickups.forEach(p => {
      if (p.collected) return;
      if (Math.abs(this.player.x - p.x) < 40 && Math.abs(this.player.y - p.y) < 60) {
        p.collected = true;
        p.sprite.destroy();
        if (p.type === 'potion') {
          this.state.items.healingPotion = (this.state.items.healingPotion || 0) + 1;
          this._showFloatText(p.x, p.y, '+ Healing Potion', '#88ff88');
        } else {
          this.state.gold += p.value;
          this._showFloatText(p.x, p.y, `+ ${p.value}g`, '#ffdd44');
        }
        saveState(this.state);
      }
    });
  }

  _showFloatText(x, y, msg, color) {
    const cam = this.cameras.main;
    const sx = x - cam.scrollX;
    const sy = y - cam.scrollY;
    const t = this.add.text(sx, sy - 20, msg, { fontSize: '16px', color, fontStyle: 'bold' }).setScrollFactor(0).setDepth(8000);
    this.tweens.add({ targets: t, y: sy - 80, alpha: 0, duration: 1200, ease: 'Quad.easeOut', onComplete: () => t.destroy() });
  }

  // ─── ACTIONS ─────────────────────────────────────────────────────────────
  _rest() {
    this.state.hp  = this.state.maxHp;
    this.state.sta = this.state.maxSta;
    this.state.wil = this.state.maxWil;
    this.state.arousal  = 0;
    this.state.pressure = Math.max(0, this.state.pressure - 30);
    this.state.day += 1;
    this.state.objective = `Day ${this.state.day}: Continue into the catacombs.`;
    saveState(this.state);
    this.cameras.main.flash(300, 255, 240, 255);
    this._showFloatText(this.player.x, this.player.y - 60, 'Rested — Day Advances', '#ffddff');
  }

  _openStatus() {
    this._paused = true;
    saveState(this.state);
    this.scene.launch('StatusScene', { state: this.state, returnTo: 'WorldScene' });
    this.scene.pause();
  }

  _openInventory() {
    this._paused = true;
    saveState(this.state);
    this.scene.launch('InventoryScene', { state: this.state, returnTo: 'WorldScene' });
    this.scene.pause();
  }

  _openSettings() {
    this._paused = true;
    this.scene.launch('SettingsScene', { state: this.state, returnTo: 'WorldScene' });
    this.scene.pause();
  }

  _openDialogue(npcKey) {
    this._paused = true;
    this.state.npcs[npcKey].met = true;
    saveState(this.state);
    this.scene.launch('DialogueScene', { state: this.state, npcKey, returnTo: 'WorldScene' });
    this.scene.pause();
  }

  _openChest(id, gold, items = {}) {
    if (this.state.flags[`${id}Opened`]) {
      this._showFloatText(this.player.x, this.player.y - 50, 'Already opened', '#888888');
      return;
    }
    this.state.flags[`${id}Opened`] = true;
    this.state.gold += gold;
    Object.entries(items).forEach(([k, v]) => {
      this.state.items[k] = (this.state.items[k] || 0) + v;
    });
    const contents = Object.entries(items).map(([k, v]) => `${v}x ${k}`).join(', ');
    this._showFloatText(this.player.x, this.player.y - 50, `${gold}g${contents ? ' + ' + contents : ''}`, '#ffdd44');
    saveState(this.state);
  }

  _examineAltar() {
    if (this.state.questStage < 2) {
      this.state.questStage = Math.max(this.state.questStage, 2);
      this.state.objective = 'Reach the Patron deep in the Inner Sanctum.';
    }
    this._showFloatText(this.player.x, this.player.y - 60, 'The altar pulses with dark energy...', '#cc44ff');
    if (this.state.corruption < 10) {
      this.state.corruption = Math.min(100, this.state.corruption + 2);
    }
    saveState(this.state);
  }

  _useDoor(door) {
    if (door.targetArea === 'title') {
      this.scene.start('TitleScene');
      return;
    }
    if (door.requirements && !door.requirements(this.state)) {
      this._showFloatText(this.player.x, this.player.y - 50, 'Passage is sealed.', '#ff4444');
      return;
    }
    let spawnX = 200;
    if (door.targetArea === 'catacombs') { spawnX = 2450; }
    if (door.targetArea === 'sanctum')   { spawnX = 5650; }
    this.state.spawnX = spawnX;
    this.state.area   = door.targetArea;
    saveState(this.state);
    this.cameras.main.fade(400, 4, 2, 10, false, (cam, p) => {
      if (p >= 1) {
        this.player.x = spawnX;
        this.cameras.main.fadeIn(400, 4, 2, 10);
      }
    });
  }

  _startBattle(encounter) {
    this._paused = true;
    saveState(this.state);
    this.scene.launch('BattleScene', { state: this.state, encounter, returnTo: 'WorldScene' });
    this.scene.pause();
  }

  _triggerRandomEvent() {
    const eligible = CORRIDOR_EVENTS.filter(e => e.requires(this.state) && Math.random() < e.chance);
    if (!eligible.length) return;
    const ev = Phaser.Math.RND.pick(eligible);
    ev.effect(this.state);
    this._showFloatText(this.player.x, this.player.y - 70, ev.text, '#cc88ff');
    this._eventCooldown = 8000;
    saveState(this.state);
  }

  // ─── RETURN HANDLERS ────────────────────────────────────────────────────────
  _applyDialogueState(updatedState) {
    if (updatedState) this.state = normalizeState(updatedState);
    this._paused = false;
    saveState(this.state);
    this._refreshHUD();
  }

  _applyBattleReturn(data) {
    if (data.state) this.state = normalizeState(data.state);

    if (data.outcome === 'defeat') {
      this.player.x = 200;
      this.player.y = GROUND_Y - 60;
      this.cameras.main.fadeIn(600, 4, 2, 10);
    }

    if (data.strippedLayer) {
      this._showFloatText(this.player.x, this.player.y - 60, `${data.strippedLayer} was stripped!`, '#ff6666');
    }

    this._paused = false;
    saveState(this.state);

    // Re-enable dead patrols that were beaten
    if (data.outcome === 'victory' && data.encounterId) {
      const beaten = this._patrols.find(p => p.encounter.id === data.encounterId && !p.alive);
      if (beaten) {
        beaten.alive = false; // stays dead — permanent consequence
      }
    }

    this._refreshHUD();
  }

  // ─── PROLOGUE PANEL ─────────────────────────────────────────────────────────
  _showProloguePanel() {
    const W = this.scale.width;
    const H = this.scale.height;
    const panel = this.add.container(W / 2, H / 2).setScrollFactor(0).setDepth(9999);
    const bg = this.add.rectangle(0, 0, 820, 440, 0x08030f, 0.97).setStrokeStyle(2, 0x8833cc, 0.8);
    const title = this.add.text(0, -178, 'VEILED APOSTASY', { fontSize: '28px', color: '#cc44ff', fontStyle: 'bold' }).setOrigin(0.5);
    const body = this.add.text(0, -30, [
      'You are Verity — an apostate cleric cast out from the Order of Light.',
      'Drawn by visions you cannot explain, you have returned to the Sanctuary',
      'of the Sealed Flame, where something old and hungry has broken free.',
      '',
      'The corruption here is not merely spiritual — it is physical, seductive,',
      'and deeply patient. It will try to claim you as it has claimed so many before.',
      '',
      'Your choices, your defeats, your compromises — all carry weight.',
      'Clothing stripped in battle leaves you vulnerable. Trust given and broken',
      'cannot be undone. The Patron watches. And it is learning your shape.',
      '',
      'Whatever you choose to become here — you will not leave unchanged.',
    ].join('\n'), {
      fontSize: '15px', color: '#ccbbdd', align: 'center', lineSpacing: 5,
      wordWrap: { width: 740 },
    }).setOrigin(0.5);

    const btn = this.add.rectangle(0, 190, 220, 48, 0x330044, 0.9).setStrokeStyle(2, 0xcc44ff, 0.8);
    btn.setInteractive(new Phaser.Geom.Rectangle(-110, -24, 220, 48), Phaser.Geom.Rectangle.Contains, { useHandCursor: true });
    const btnT = this.add.text(0, 190, 'BEGIN', { fontSize: '18px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
    panel.add([bg, title, body, btn, btnT]);

    btn.on('pointerdown', () => {
      panel.destroy();
      this._paused = false;
      this.state.flags.prologueRead = true;
      saveState(this.state);
    });

    this._paused = true;
  }
}
