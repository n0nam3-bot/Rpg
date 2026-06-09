import {
  createBackdrop,
  makeStaticRect,
  makeVirtualControls,
  readControls,
  makeMeter,
  sceneToNext,
  saveState,
  restAtBedroom,
  createChoiceDialog,
  spawnAmbient,
  spawnFloatingText,
  modifyCorruption,
  keyFor,
  SPRITES,
  clamp, normalizeState
} from './util.js';

const HERO = keyFor('ruin_runners_shaia/sprites/shaia/sprites_common/common_00_idle_stand_A01.png');
const HERO_WALK = keyFor('ruin_runners_shaia/sprites/shaia/sprites_common/common_11_walk01.png');
const HERO_RUN = keyFor('ruin_runners_shaia/sprites/shaia/sprites_common/common_12_run01.png');
const HERO_JUMP = keyFor('ruin_runners_shaia/sprites/shaia/sprites_common/common_21_jump_begin01.png');
const HERO_GUARD = keyFor('ruin_runners_shaia/sprites/shaia/sprites_common/common_31_guard_stand01.png');

export class BedroomScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BedroomScene' });
  }

  init(data = {}) {
    this.state = normalizeState(data.state);
    this.state.sceneKey = 'BedroomScene';
    this.state.room = 'Bedroom';
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;
    const worldW = 2280;
    const groundY = 576;

    createBackdrop(this, {
      mode: 'room',
      title: 'SANCTUM',
      subtitle: 'Rest, save, and decide how much of the fall you will carry.'
    });
    spawnAmbient(this, { count: 10, mode: 'room' });

    this.input.addPointer(3);
    this.physics.world.setBounds(0, 0, worldW, H);
    this.cameras.main.setBounds(0, 0, worldW, H);

    this.floorRects = [
      makeStaticRect(this, worldW / 2, groundY + 24, worldW, 48),
      makeStaticRect(this, 740, 496, 230, 18),
      makeStaticRect(this, 1310, 452, 210, 18),
      makeStaticRect(this, 1740, 412, 200, 18)
    ];

    this.player = this.physics.add.sprite(220, 500, HERO).setScale(0.84).setCollideWorldBounds(true);
    this.player.body.setSize(70, 88, true);
    this.player.body.setOffset(18, 14);
    this.player.setBounce(0.02);
    this.floorRects.forEach((r) => this.physics.add.collider(this.player, r));

    this.controls = makeVirtualControls(this, 'explore');
    this.keys = this.input.keyboard.addKeys('A,D,W,S,SPACE,SHIFT,E,ESC,ENTER,X');

    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);

    this.add.rectangle(460, 496, 210, 76, 0x6e3f54, 1).setStrokeStyle(3, 0xf2c7ff, 0.55);
    this.add.rectangle(420, 478, 72, 22, 0xf3dce7, 1).setStrokeStyle(2, 0xffe7f2, 0.45);
    this.add.rectangle(500, 492, 128, 36, 0x805066, 1).setStrokeStyle(2, 0xf6c8ea, 0.3);
    this.add.image(1160, 553, SPRITES.barrel).setScale(0.92).setAlpha(0.92);
    this.add.image(1520, 520, SPRITES.chest).setScale(0.98).setAlpha(0.96);
    this.add.image(1960, 528, SPRITES.bgLamp).setScale(1.4).setAlpha(0.16);

    this.interactables = [
      {
        x: 460,
        y: 492,
        label: 'Bed',
        prompt: 'Rest to recover and cleanse the route.',
        action: () => this.restBed()
      },
      {
        x: 980,
        y: 444,
        label: 'Mirror',
        prompt: 'Open the status sheet.',
        action: () => sceneToNext(this, 'StatusScene', { state: this.state, returnTo: 'BedroomScene' })
      },
      {
        x: 1498,
        y: 502,
        label: 'Shrine',
        prompt: 'Choose between purification and embrace.',
        action: () => this.openShrine()
      },
      {
        x: 2088,
        y: 492,
        label: 'Door',
        prompt: 'Enter the corridor.',
        action: () => sceneToNext(this, 'CorridorScene', { state: this.state, spawnX: 220 })
      }
    ];

    this.markerGroup = this.add.group();
    this.interactables.forEach((obj) => {
      const zone = this.add.rectangle(obj.x, obj.y - 62, 90, 98, 0x290f24, 0.36).setStrokeStyle(2, 0xf4c7ff, 0.32);
      const text = this.add.text(obj.x, obj.y - 104, obj.label, { fontSize: '15px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
      const note = this.add.text(obj.x, obj.y + 36, 'Press E', { fontSize: '12px', color: '#dbcce3' }).setOrigin(0.5);
      this.markerGroup.addMultiple([zone, text, note]);
      obj.zone = zone;
      obj.text = text;
      obj.note = note;
    });

    this.title = this.add.text(24, 18, 'SANCTUM', { fontSize: '28px', color: '#fff', fontStyle: 'bold' }).setScrollFactor(0).setDepth(5000);
    this.sub = this.add.text(24, 50, '', { fontSize: '14px', color: '#dfd3e3' }).setScrollFactor(0).setDepth(5000);
    this.promptText = this.add.text(24, H - 40, '', { fontSize: '14px', color: '#fff' }).setScrollFactor(0).setDepth(5000);

    this.hpMeter = makeMeter(this, 24, 88, 250, 'HP', 0xf27da8);
    this.staMeter = makeMeter(this, 24, 116, 250, 'STA', 0x7fcdfc);
    this.wilMeter = makeMeter(this, 24, 144, 250, 'WIL', 0xc5f07b);
    this.corMeter = makeMeter(this, 24, 172, 250, 'CORR', 0xd871cc);

    this._setAnim(this.player, 'shaia-idle');
    this._refreshHUD('Rest, inspect the mirror, or move into the corridor.');
  }

  _setAnim(sprite, anim) {
    if (!sprite?.anims) return;
    if (sprite.anims.currentAnim && sprite.anims.currentAnim.key === anim) return;
    sprite.anims.play(anim, true);
  }

  _refreshHUD(msg = '') {
    this.sub.setText(`Day ${this.state.day} • Corruption ${Math.round(this.state.corruption)} • Gold ${this.state.gold}`);
    this.hpMeter.set(this.state.hp, this.state.maxHp);
    this.staMeter.set(this.state.sta, this.state.maxSta);
    this.wilMeter.set(this.state.wil, this.state.maxWil);
    this.corMeter.set(this.state.corruption, this.state.maxCorruption);
    this.promptText.setText(msg || this._prompt || 'Use A/D or the buttons to move. E interacts.');
  }

  _nearInteractable() {
    let best = null;
    let bestDist = 9999;
    for (const obj of this.interactables) {
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, obj.x, obj.y);
      if (d < bestDist) {
        bestDist = d;
        best = obj;
      }
    }
    return bestDist < 132 ? best : null;
  }

  restBed() {
    restAtBedroom(this.state);
    saveState(this.state);
    this._refreshHUD('You rested. The route is a little cleaner.');
    this.cameras.main.flash(120, 255, 255, 255);
    spawnFloatingText(this, this.player.x, this.player.y - 90, 'REST', { color: '#f9d8fb' });
  }

  openShrine() {
    createChoiceDialog(this, {
      title: 'The Shrine',
      body: 'A veiled altar hums with a soft, dangerous light. You can purge the stain, accept the offering, or leave it untouched.',
      options: [
        {
          label: 'Purify',
          fill: 0x25483d,
          stroke: 0xc7ffd4,
          onSelect: () => {
            modifyCorruption(this.state, -22);
            this.state.wil = clamp(this.state.wil + 10, 0, this.state.maxWil);
            this.state.mercy += 1;
            this.state.flags.purified = true;
            this.state.choiceLog.push('Purified at the shrine');
            saveState(this.state);
            this._refreshHUD('The stain thins.');
            spawnFloatingText(this, 1500, 460, '-CORRUPTION', { color: '#bdf7d0' });
          }
        },
        {
          label: 'Accept',
          fill: 0x4b2041,
          stroke: 0xffc0e6,
          onSelect: () => {
            modifyCorruption(this.state, 24);
            this.state.gold += 25;
            this.state.relics += 1;
            this.state.flags.acceptedBlessing = true;
            this.state.choiceLog.push('Accepted the shrine blessing');
            saveState(this.state);
            this._refreshHUD('The blessing takes root.');
            spawnFloatingText(this, 1500, 460, '+CORRUPTION', { color: '#ffd4ef' });
          }
        },
        {
          label: 'Leave',
          fill: 0x2f1b38,
          stroke: 0xe2c8ff,
          onSelect: () => {
            this.state.choiceLog.push('Left the shrine untouched');
            saveState(this.state);
            this._refreshHUD('You step away.');
          }
        }
      ]
    });
  }

  update() {
    const input = readControls(this, this.controls);
    const onGround = this.player.body.blocked.down || this.player.body.touching.down;
    const speed = input.guard ? 130 : (this.keys.SHIFT.isDown ? 250 : 180);

    let vx = 0;
    if (input.left) vx -= speed;
    if (input.right) vx += speed;
    this.player.setVelocityX(vx);

    if (input.jump && onGround) {
      this.player.setVelocityY(-460);
      this._setAnim(this.player, 'shaia-jump');
      this.cameras.main.shake(40, 0.0015);
    }

    if (vx !== 0) this.player.setFlipX(vx < 0);
    if (!onGround) this._setAnim(this.player, 'shaia-jump');
    else if (Math.abs(vx) > 180) this._setAnim(this.player, 'shaia-run');
    else if (Math.abs(vx) > 0) this._setAnim(this.player, 'shaia-walk');
    else this._setAnim(this.player, 'shaia-idle');

    const near = this._nearInteractable();
    this._prompt = near ? `${near.label}: ${near.prompt}` : 'Bedroom: rest, save, purify, or enter the corridor.';
    this._refreshHUD();

    if (input.interact && !this._lastInteract) {
      if (near) near.action();
    }
    this._lastInteract = input.interact;

    if (input.menu && !this._lastMenu) {
      sceneToNext(this, 'SettingsScene', { state: this.state, returnTo: 'BedroomScene' });
      this._lastMenu = input.menu;
      return;
    }
    this._lastMenu = input.menu;
  }
}
