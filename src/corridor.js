import {
  createBackdrop,
  makeStaticRect,
  makeVirtualControls,
  readControls,
  makeMeter,
  sceneToNext,
  saveState,
  createChoiceDialog,
  spawnAmbient,
  spawnFloatingText,
  modifyCorruption,
  adjustStats,
  keyFor,
  SPRITES,
  clamp, normalizeState
} from './util.js';

const HERO = keyFor('ruin_runners_shaia/sprites/shaia/sprites_common/common_00_idle_stand_A01.png');
const HERO_WALK = keyFor('ruin_runners_shaia/sprites/shaia/sprites_common/common_11_walk01.png');
const HERO_RUN = keyFor('ruin_runners_shaia/sprites/shaia/sprites_common/common_12_run01.png');
const HERO_JUMP = keyFor('ruin_runners_shaia/sprites/shaia/sprites_common/common_21_jump_begin01.png');

export class CorridorScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CorridorScene' });
  }

  init(data = {}) {
    this.state = normalizeState(data.state);
    this.state.sceneKey = 'CorridorScene';
    this.state.room = 'Corridor';
    this.spawnX = Number(data.spawnX || 220);
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;
    this.worldW = 5600;
    const groundY = 568;

    createBackdrop(this, {
      mode: 'corridor',
      title: 'CORRIDOR',
      subtitle: 'Move through the route, meet NPCs, and decide what the corruption becomes.'
    });
    spawnAmbient(this, { count: 12, mode: 'room' });

    this.input.addPointer(3);
    this.physics.world.setBounds(0, 0, this.worldW, H);
    this.cameras.main.setBounds(0, 0, this.worldW, H);

    this.groundRects = [
      makeStaticRect(this, this.worldW / 2, groundY + 24, this.worldW, 48),
      makeStaticRect(this, 860, 478, 220, 18),
      makeStaticRect(this, 1720, 438, 250, 18),
      makeStaticRect(this, 3040, 470, 260, 18),
      makeStaticRect(this, 4320, 418, 280, 18)
    ];

    this.player = this.physics.add.sprite(this.spawnX, 496, HERO).setScale(0.84).setCollideWorldBounds(true);
    this.player.body.setSize(70, 88, true);
    this.player.body.setOffset(18, 14);
    this.groundRects.forEach((r) => this.physics.add.collider(this.player, r));

    this.controls = makeVirtualControls(this, 'explore');
    this.keys = this.input.keyboard.addKeys('A,D,W,S,SPACE,SHIFT,E,ESC,ENTER,X');
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);

    this.add.image(680, 536, SPRITES.barrel).setScale(0.88).setAlpha(0.75);
    this.add.image(1940, 532, SPRITES.barrelAlt).setScale(0.88).setAlpha(0.75);
    this.add.image(3490, 500, SPRITES.chest).setScale(0.96).setAlpha(0.92);
    this.add.image(4620, 496, SPRITES.bgLamp).setScale(1.6).setAlpha(0.16);

    this.npcs = [
      {
        x: 820,
        y: 494,
        label: 'Veiled Acolyte',
        color: 0xd872b9,
        prompt: 'A murmuring attendant offering a dangerous blessing.',
        talk: () => this.talkAcolyte()
      },
      {
        x: 1880,
        y: 494,
        label: 'Confessor',
        color: 0x79b8f7,
        prompt: 'A quiet voice that can cleanse or harden the heart.',
        talk: () => this.talkConfessor()
      }
    ];

    this.npcs.forEach((npc) => {
      npc.zone = this.add.rectangle(npc.x, npc.y - 62, 92, 98, 0x261627, 0.38).setStrokeStyle(2, npc.color, 0.34);
      npc.title = this.add.text(npc.x, npc.y - 104, npc.label, { fontSize: '15px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
      npc.note = this.add.text(npc.x, npc.y + 36, 'Press E', { fontSize: '12px', color: '#dbcce3' }).setOrigin(0.5);
    });

    this.pickups = [
      {
        x: 1360,
        y: 496,
        key: SPRITES.orbCure,
        label: 'Cure Orb',
        collected: false,
        collect: () => {
          adjustStats(this.state, { hp: 10, sta: 8, wil: 10, corruption: -8 });
          this.state.relics += 1;
          this.state.choiceLog.push('Collected a cure orb');
          saveState(this.state);
          spawnFloatingText(this, 1360, 430, '+CLEANSE', { color: '#bcffd9' });
        }
      },
      {
        x: 2700,
        y: 504,
        key: SPRITES.orbFire,
        label: 'Fire Orb',
        collected: false,
        collect: () => {
          adjustStats(this.state, { sta: 12, wil: 4, corruption: 6 });
          this.state.gold += 18;
          this.state.choiceLog.push('Collected a fire orb');
          saveState(this.state);
          spawnFloatingText(this, 2700, 438, '+POWER', { color: '#ffd0e1' });
        }
      },
      {
        x: 3890,
        y: 500,
        key: SPRITES.apple,
        label: 'Apple',
        collected: false,
        collect: () => {
          this.state.apples += 1;
          this.state.hp = clamp(this.state.hp + 8, 0, this.state.maxHp);
          this.state.choiceLog.push('Collected an apple');
          saveState(this.state);
          spawnFloatingText(this, 3890, 436, '+ITEM', { color: '#fff1b8' });
        }
      }
    ];

    this.pickups.forEach((p) => {
      p.sprite = this.add.image(p.x, p.y, p.key).setScale(p.key === SPRITES.apple ? 0.5 : 0.72).setAlpha(0.96);
      p.glow = this.add.ellipse(p.x, p.y + 10, 64, 30, 0xd268c5, 0.16);
    });

    this.gate = {
      x: 3390,
      y: 494,
      label: 'Gate',
      prompt: 'A sealed passage that can become a fight.',
      trigger: () => this.startBattle()
    };
    this.gate.zone = this.add.rectangle(this.gate.x, this.gate.y - 62, 96, 98, 0x3c1526, 0.44).setStrokeStyle(2, 0xffc3e8, 0.32);
    this.gate.title = this.add.text(this.gate.x, this.gate.y - 104, 'Gate', { fontSize: '15px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
    this.gate.note = this.add.text(this.gate.x, this.gate.y + 36, 'Press E', { fontSize: '12px', color: '#dbcce3' }).setOrigin(0.5);

    this.title = this.add.text(24, 18, 'CORRIDOR', { fontSize: '28px', color: '#fff', fontStyle: 'bold' }).setScrollFactor(0).setDepth(5000);
    this.sub = this.add.text(24, 50, '', { fontSize: '14px', color: '#dfd3e3' }).setScrollFactor(0).setDepth(5000);
    this.promptText = this.add.text(24, H - 40, '', { fontSize: '14px', color: '#fff' }).setScrollFactor(0).setDepth(5000);

    this.hpMeter = makeMeter(this, 24, 88, 250, 'HP', 0xf27da8);
    this.staMeter = makeMeter(this, 24, 116, 250, 'STA', 0x7fcdfc);
    this.wilMeter = makeMeter(this, 24, 144, 250, 'WIL', 0xc5f07b);
    this.corMeter = makeMeter(this, 24, 172, 250, 'CORR', 0xd871cc);

    this._setAnim(this.player, 'shaia-idle');
    this._refreshHUD('Talk, collect, or fight through the route.');
  }

  _setAnim(sprite, anim) {
    if (!sprite?.anims) return;
    if (sprite.anims.currentAnim && sprite.anims.currentAnim.key === anim) return;
    sprite.anims.play(anim, true);
  }

  _refreshHUD(msg = '') {
    this.sub.setText(`Day ${this.state.day} • Corruption ${Math.round(this.state.corruption)} • Gold ${this.state.gold} • Relics ${this.state.relics}`);
    this.hpMeter.set(this.state.hp, this.state.maxHp);
    this.staMeter.set(this.state.sta, this.state.maxSta);
    this.wilMeter.set(this.state.wil, this.state.maxWil);
    this.corMeter.set(this.state.corruption, this.state.maxCorruption);
    this.promptText.setText(msg || this._prompt || 'Move with A/D, jump with W/Space, interact with E.');
  }

  _nearEntity() {
    const items = [...this.npcs, this.gate, ...this.pickups.filter((p) => !p.collected)];
    let best = null;
    let bestDist = 9999;
    for (const obj of items) {
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, obj.x, obj.y);
      if (d < bestDist) {
        best = obj;
        bestDist = d;
      }
    }
    return bestDist < 132 ? best : null;
  }

  talkAcolyte() {
    this.state.flags.metAcolyte = true;
    createChoiceDialog(this, {
      title: 'Veiled Acolyte',
      body: 'Her whisper offers a blessing that feels half prayer and half hunger. The route bends around the choice.',
      options: [
        {
          label: 'Accept the blessing',
          fill: 0x4c2243,
          onSelect: () => {
            modifyCorruption(this.state, 20);
            this.state.gold += 30;
            this.state.sta = clamp(this.state.sta + 10, 0, this.state.maxSta);
            this.state.flags.acceptedBlessing = true;
            this.state.choiceLog.push('Accepted the acolyte blessing');
            saveState(this.state);
            spawnFloatingText(this, this.player.x, this.player.y - 100, '+CORRUPTION', { color: '#ffd5f0' });
          }
        },
        {
          label: 'Demand guidance',
          fill: 0x323658,
          onSelect: () => {
            adjustStats(this.state, { wil: 8, sta: 6, corruption: 6, relics: 1 });
            this.state.choiceLog.push('Demanded guidance from the acolyte');
            saveState(this.state);
            spawnFloatingText(this, this.player.x, this.player.y - 100, '+FOCUS', { color: '#cee4ff' });
          }
        },
        {
          label: 'Refuse',
          fill: 0x2f1b38,
          onSelect: () => {
            modifyCorruption(this.state, -8);
            this.state.mercy += 1;
            this.state.choiceLog.push('Refused the acolyte');
            saveState(this.state);
            spawnFloatingText(this, this.player.x, this.player.y - 100, 'REJECTED', { color: '#c8ffdf' });
          }
        }
      ]
    });
  }

  talkConfessor() {
    this.state.flags.metConfessor = true;
    createChoiceDialog(this, {
      title: 'Confessor',
      body: 'The confessor speaks calmly, as though corruption is a wound and a weapon at once.',
      options: [
        {
          label: 'Confess',
          fill: 0x294739,
          onSelect: () => {
            modifyCorruption(this.state, -18);
            this.state.wil = clamp(this.state.wil + 12, 0, this.state.maxWil);
            this.state.mercy += 2;
            this.state.choiceLog.push('Confessed to the confessor');
            saveState(this.state);
            spawnFloatingText(this, this.player.x, this.player.y - 100, '-CORRUPTION', { color: '#d9ffe8' });
          }
        },
        {
          label: 'Trade silence',
          fill: 0x3b3144,
          onSelect: () => {
            this.state.gold += 20;
            this.state.corruption = clamp(this.state.corruption + 8, 0, this.state.maxCorruption);
            this.state.choiceLog.push('Traded silence with the confessor');
            saveState(this.state);
            spawnFloatingText(this, this.player.x, this.player.y - 100, '+GOLD', { color: '#ffe6a9' });
          }
        },
        {
          label: 'Leave',
          fill: 0x2f1b38,
          onSelect: () => {
            this.state.choiceLog.push('Ignored the confessor');
            saveState(this.state);
          }
        }
      ]
    });
  }

  collectPickup(p) {
    if (p.collected) return;
    p.collected = true;
    p.sprite.destroy();
    p.glow.destroy();
    p.collect();
    this._refreshHUD(`${p.label} acquired.`);
  }

  startBattle() {
    if (this.state.flags.corridorCleared) {
      this._refreshHUD('The gate already yields.');
      return;
    }
    createChoiceDialog(this, {
      title: 'Gate Encounter',
      body: 'A skeleton sentinel crawls out from behind the gate. You can fight it, or back away and keep moving.',
      options: [
        {
          label: 'Fight',
          fill: 0x6b2945,
          onSelect: () => {
            this.state.flags.bossSeen = true;
            saveState(this.state);
            sceneToNext(this, 'BattleScene', {
              state: this.state,
              encounter: {
                kind: 'sentinel',
                label: 'Sentinel Skeleton',
                hp: 70 + Math.floor(this.state.day * 2),
                dmg: 10 + Math.floor(this.state.day * 0.7),
                speed: 60
              },
              returnX: this.player.x
            });
          }
        },
        {
          label: 'Retreat',
          fill: 0x2f1b38,
          onSelect: () => {
            this.state.corruption = clamp(this.state.corruption + 4, 0, this.state.maxCorruption);
            this.state.choiceLog.push('Backed away from the gate');
            saveState(this.state);
            this._refreshHUD('You retreat and the route trembles.');
          }
        }
      ]
    });
  }

  update() {
    const input = readControls(this, this.controls);
    const onGround = this.player.body.blocked.down || this.player.body.touching.down;
    const speed = input.guard ? 130 : (this.keys.SHIFT.isDown ? 260 : 180);

    let vx = 0;
    if (input.left) vx -= speed;
    if (input.right) vx += speed;
    this.player.setVelocityX(vx);

    if (input.jump && onGround) {
      this.player.setVelocityY(-465);
      this._setAnim(this.player, 'shaia-jump');
      if (this.state.settings.shake) this.cameras.main.shake(30, 0.0014);
    }

    if (vx !== 0) this.player.setFlipX(vx < 0);
    if (!onGround) this._setAnim(this.player, 'shaia-jump');
    else if (Math.abs(vx) > 180) this._setAnim(this.player, 'shaia-run');
    else if (Math.abs(vx) > 0) this._setAnim(this.player, 'shaia-walk');
    else this._setAnim(this.player, 'shaia-idle');

    const near = this._nearEntity();
    this._prompt = near ? (near.prompt || `${near.label}`) : 'Explore the corridor, meet NPCs, and decide what the route should become.';
    this._refreshHUD();

    if (input.interact && !this._lastInteract) {
      if (near) {
        if (near.talk) near.talk();
        else if (near.trigger) near.trigger();
        else if (near.collect) this.collectPickup(near);
      }
    }
    this._lastInteract = input.interact;

    if (input.menu && !this._lastMenu) {
      sceneToNext(this, 'SettingsScene', { state: this.state, returnTo: 'CorridorScene' });
      this._lastMenu = input.menu;
      return;
    }
    this._lastMenu = input.menu;

    // Auto-collect pickups on touch if very close to them.
    for (const p of this.pickups) {
      if (!p.collected && Phaser.Math.Distance.Between(this.player.x, this.player.y, p.x, p.y) < 42 && input.interact) {
        this.collectPickup(p);
      }
    }
  }
}
