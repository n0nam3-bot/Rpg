import { normalizeState, saveState, freshState, corruptionTier, intactCount, SLOT_ORDER } from './util.js';

// ─── ENDINGS ─────────────────────────────────────────────────────────────────
function resolveEnding(state) {
  const corr  = state.corruption;
  const pact  = state.flags.witchPact;
  const elder = state.flags.elderReveal;
  const cult  = state.flags.cultInitiate;
  const betrayed = state.flags.betrayedOrder;
  const stripped = SLOT_ORDER.filter(s => state.clothing[s].stripped).length;

  if (corr < 25 && !pact) {
    return {
      id:    'holy',
      title: 'THE APOSTATE RETURNED',
      color: 0x0022aa,
      glow:  '#4488ff',
      lines: [
        'The Patron shatters under the force of your uncorrupted will.',
        'The seal closes — not the original compromise, but something solid.',
        'Elder Thane finds you in the sanctum\'s aftermath, pale with relief.',
        '',
        '"I never believed," he says, "that someone could walk through all of it',
        'and come back as themselves."',
        '',
        'You aren\'t entirely sure he\'s right. But you\'re still here.',
        'That is enough.',
        '',
        pact ? '' : (elder ? 'The Elder\'s confession dies with the sanctum. Some secrets deserve burial.' : ''),
      ].filter(l => l !== '').join('\n'),
    };
  }

  if (pact || corr >= 50) {
    return {
      id:    'apostate',
      title: 'WHAT THE APOSTATE BECAME',
      color: 0x440088,
      glow:  '#cc44ff',
      lines: [
        'The Patron falls — not to light, but to something equally absolute.',
        'You used its own hunger against it.',
        '',
        'Moira takes the sealing stone without ceremony.',
        '"You held on," she says. "More than most manage."',
        '',
        corr >= 75
          ? 'The corruption doesn\'t leave. You no longer expect it to.'
          : 'The taint will take months to quiet. You\'re not sure it ever fully does.',
        '',
        betrayed
          ? 'The Order\'s records will list you as a traitor. Let them.'
          : (elder ? 'The Elder looks at you like something between pride and grief. You don\'t explain.' : ''),
        '',
        stripped >= 3
          ? 'You wrap yourself in what remains of your clothing and walk into the open air.'
          : 'The Sanctuary Hall falls quiet behind you.',
      ].filter(l => l !== '').join('\n'),
    };
  }

  // Mid corruption, no pact
  return {
    id:    'tainted',
    title: 'THE PRICE OF VICTORY',
    color: 0x220033,
    glow:  '#9933cc',
    lines: [
      'The Patron is gone. The sanctum breathes differently now.',
      '',
      'You are not who you were when you entered.',
      'The corruption is quieter than it was — but it is not silent.',
      '',
      elder
        ? 'Elder Thane seals his own conduit. He doesn\'t ask for forgiveness and you don\'t offer it.\nThat, at least, is honest.'
        : 'Elder Thane calls it a miracle. You don\'t correct him.',
      '',
      state.kills > 10
        ? `${state.kills} encounters survived. Each one left a mark.`
        : `${state.kills} encounters survived. You were careful. It still cost something.`,
      '',
      'You leave before anyone can ask what you\'re becoming.',
    ].filter(l => l !== '').join('\n'),
  };
}

// ─── SCENE ───────────────────────────────────────────────────────────────────
export class VictoryScene extends Phaser.Scene {
  constructor() { super({ key:'VictoryScene' }); }

  init(d = {}) {
    this.state = normalizeState(d.state);
  }

  create() {
    const W = this.scale.width, H = this.scale.height;
    this.input.addPointer(4);

    const ending = resolveEnding(this.state);
    const tier   = corruptionTier(this.state.corruption);

    // ── BACKGROUND ────────────────────────────────────────────────────────
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x020008, 0x020008, ending.color, ending.color, 1);
    bg.fillRect(0, 0, W, H);

    // Atmospheric motes
    for (let i = 0; i < 30; i++) {
      this.time.delayedCall(i * 120, () => this._mote(W, H, ending.color));
    }
    this.time.addEvent({ delay:300, repeat:-1, callback:()=>this._mote(W, H, ending.color) });

    // ── ENDING TITLE ──────────────────────────────────────────────────────
    const titleTxt = this.add.text(W/2, 90, ending.title, {
      fontSize:'48px', color: ending.glow, fontStyle:'bold',
      stroke:'#000000', strokeThickness:5,
    }).setOrigin(0.5).setAlpha(0);

    this.add.text(W/2, 144, 'VEILED APOSTASY', {
      fontSize:'18px', color:'#554466', fontStyle:'italic',
    }).setOrigin(0.5).setAlpha(0.7);

    // ── NARRATIVE TEXT ────────────────────────────────────────────────────
    const narrative = this.add.text(W/2, 290, ending.lines, {
      fontSize:'17px', color:'#ddd0ee', align:'center',
      lineSpacing:7, wordWrap:{ width:820 },
    }).setOrigin(0.5).setAlpha(0);

    // ── STATS PANEL ───────────────────────────────────────────────────────
    this.add.rectangle(W/2, H - 170, W - 60, 180, 0x06020d, 0.88).setStrokeStyle(1, 0x5533aa, 0.5);

    const s = this.state;
    const strippedCount = SLOT_ORDER.filter(sl => s.clothing[sl].stripped).length;
    const statLines = [
      `Corruption Tier: ${tier.label} (${s.corruption}/100)`,
      `Days Survived: ${s.day}    Kills: ${s.kills}    Defeats: ${s.defeats}`,
      `Gold Accumulated: ${s.gold}g    Clothing Stripped: ${strippedCount}/5`,
      s.flags.witchPact ? 'Formed a pact with Witch Moira.' : '',
      s.flags.betrayedOrder ? 'Betrayed the Order of Light.' : '',
      s.flags.cultInitiate ? 'Initiated into the Shadow Cult.' : '',
      s.flags.elderReveal  ? 'Uncovered Elder Thane\'s secret.' : '',
    ].filter(Boolean).join('    ·    ');

    this.add.text(W/2, H - 170, statLines, {
      fontSize:'13px', color:'#886699', align:'center',
      wordWrap:{ width: W - 100 }, lineSpacing:6,
    }).setOrigin(0.5);

    // ── BUTTONS ───────────────────────────────────────────────────────────
    const btnY = H - 52;
    const playAgainBg = this.add.rectangle(W/2 - 160, btnY, 280, 56, 0x1a0030, 0.9).setStrokeStyle(2, 0xcc44ff, 0.8);
    this.add.text(W/2 - 160, btnY, '▶  PLAY AGAIN', { fontSize:'20px', color:'#fff', fontStyle:'bold' }).setOrigin(0.5);
    playAgainBg.setInteractive({ useHandCursor:true });
    playAgainBg.on('pointerover', ()=>playAgainBg.setFillStyle(0x440066,0.9));
    playAgainBg.on('pointerout',  ()=>playAgainBg.setFillStyle(0x1a0030,0.9));
    playAgainBg.on('pointerdown', ()=>this._playAgain());

    const titleBg = this.add.rectangle(W/2 + 160, btnY, 280, 56, 0x100018, 0.9).setStrokeStyle(2, 0x884499, 0.7);
    this.add.text(W/2 + 160, btnY, '⌂  TITLE SCREEN', { fontSize:'20px', color:'#ccaadd', fontStyle:'bold' }).setOrigin(0.5);
    titleBg.setInteractive({ useHandCursor:true });
    titleBg.on('pointerover', ()=>titleBg.setFillStyle(0x220033,0.9));
    titleBg.on('pointerout',  ()=>titleBg.setFillStyle(0x100018,0.9));
    titleBg.on('pointerdown', ()=>this._goTitle());

    // Keyboard
    const kb = this.input.keyboard.addKeys('ENTER,SPACE,BACKSPACE,ESC');
    kb.ENTER.on('down',     ()=>this._playAgain());
    kb.SPACE.on('down',     ()=>this._playAgain());
    kb.ESC.on('down',       ()=>this._goTitle());
    kb.BACKSPACE.on('down', ()=>this._goTitle());

    // ── STAGGERED FADE IN ─────────────────────────────────────────────────
    this.cameras.main.fadeIn(800, 4, 2, 10);
    this.tweens.add({ targets:titleTxt,   alpha:1, delay:600,  duration:1000, ease:'Quad.easeIn' });
    this.tweens.add({ targets:narrative,  alpha:1, delay:1200, duration:1200, ease:'Quad.easeIn' });

    // Pulse title
    this.time.delayedCall(1800, ()=>{
      this.tweens.add({
        targets:titleTxt, alpha:{ from:1, to:0.7 },
        yoyo:true, repeat:-1, duration:2200, ease:'Sine.easeInOut',
      });
    });

    // Mark game as completed this run
    this.state.flags.patronDefeated = true;
    saveState(this.state);
  }

  _playAgain() {
    this.cameras.main.fade(500, 4, 2, 10, false, (cam, p)=>{
      if (p >= 1) {
        const fresh = freshState();
        saveState(fresh);
        this.scene.start('WorldScene', { state:fresh, showPrologue:true });
      }
    });
  }

  _goTitle() {
    this.cameras.main.fade(500, 4, 2, 10, false, (cam, p)=>{
      if (p >= 1) this.scene.start('TitleScene');
    });
  }

  _mote(W, H, baseColor) {
    const x = Phaser.Math.Between(0, W);
    const y = Phaser.Math.Between(H * 0.2, H);
    const c = this.add.circle(x, y,
      Phaser.Math.Between(2, 7),
      Phaser.Math.RND.pick([baseColor, 0xcc44ff, 0x440088, 0xff44aa]),
      Phaser.Math.FloatBetween(0.05, 0.35));
    this.tweens.add({
      targets:c, y:y - Phaser.Math.Between(100, 320),
      x:x + Phaser.Math.Between(-80, 80),
      alpha:0, scale:Phaser.Math.FloatBetween(0.4, 2.0),
      duration:Phaser.Math.Between(2500, 6000), ease:'Quad.easeOut',
      onComplete:()=>c.destroy(),
    });
  }
}
