import { normalizeState, saveState, corruptionTier } from './util.js';
import { DIALOGUES } from './data.js';

export class DialogueScene extends Phaser.Scene {
  constructor() { super({ key:'DialogueScene' }); }

  init(data={}) {
    this.state     = normalizeState(data.state);
    this._npcKey   = data.npcKey;
    this._return   = data.returnTo || 'WorldScene';
    this._tree     = DIALOGUES[data.npcKey] || [];
    this._nodeId   = 'start';
    this._choices  = [];
    this._focus    = 0;
    this._reactionActive = false;
    this._reactionSeq = [];
    this._reactionIndex = 0;
    this._reactionLayer = null;
    this._reactionTimer = null;
  }

  create() {
    const W = this.scale.width, H = this.scale.height;
    this.input.addPointer(4);

    // Dimmed backdrop
    this.add.rectangle(W/2, H/2, W, H, 0x000000, 0.72).setScrollFactor(0).setDepth(7000).setInteractive();
    const tier = corruptionTier(this.state.corruption);
    this.add.rectangle(W/2, H/2, W, H, tier.color, 0.04).setDepth(7001);

    // Main dialogue panel
    this.add.rectangle(W/2, H/2+40, W-60, 500, 0x07030e, 0.96).setStrokeStyle(2, 0x8833cc, 0.6).setDepth(7010);

    // Portrait area
    this.add.rectangle(154, H/2+20, 210, 270, 0x0f0720, 0.95).setStrokeStyle(1, 0x6622aa, 0.5).setDepth(7012);
    this._portrait = null;

    // Speaker + text
    this._speakerTxt = this.add.text(282, H/2-200, '', { fontSize:'21px', color:'#ffddff', fontStyle:'bold' }).setDepth(7020);
    this._dialogueTxt = this.add.text(282, H/2-165, '', { fontSize:'15px', color:'#e0d0ee', wordWrap:{ width:840 }, lineSpacing:5 }).setDepth(7020);

    // Trust badge
    this._trustTxt = this.add.text(W-32, H/2-205, '', { fontSize:'12px', color:'#886699', align:'right' }).setOrigin(1,0).setDepth(7020);

    // Choice buttons container
    this._choiceBtns = [];

    // Controls hint
    this.add.text(W/2, H-18, '↑↓ Navigate   Enter/Space Confirm   ESC Close', {
      fontSize:'12px', color:'#443355',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(7020);

    // Keyboard
    this._keys = this.input.keyboard.addKeys('UP,DOWN,LEFT,RIGHT,ENTER,SPACE,ESC,A,D,W,S');
    this._keys.UP.on('down',    () => this._reactionActive ? this._reactionInput('UP') : this._moveFocus(-1));
    this._keys.DOWN.on('down',  () => this._reactionActive ? this._reactionInput('DOWN') : this._moveFocus(1));
    this._keys.LEFT.on('down',  () => this._reactionActive ? this._reactionInput('LEFT') : this._moveFocus(-1));
    this._keys.RIGHT.on('down', () => this._reactionActive ? this._reactionInput('RIGHT') : this._moveFocus(1));
    this._keys.W.on('down',     () => this._reactionActive ? this._reactionInput('UP') : this._moveFocus(-1));
    this._keys.S.on('down',     () => this._reactionActive ? this._reactionInput('DOWN') : this._moveFocus(1));
    this._keys.A.on('down',     () => this._reactionActive ? this._reactionInput('LEFT') : this._moveFocus(-1));
    this._keys.D.on('down',     () => this._reactionActive ? this._reactionInput('RIGHT') : this._moveFocus(1));
    this._keys.ENTER.on('down', () => this._reactionActive ? this._reactionInput('ENTER') : this._confirmFocus());
    this._keys.SPACE.on('down', () => this._reactionActive ? this._reactionInput('SPACE') : this._confirmFocus());
    this._keys.ESC.on('down',   () => this._close());

    // Number keys 1-5 for direct choice
    const nkeys = this.input.keyboard.addKeys('ONE,TWO,THREE,FOUR,FIVE');
    Object.entries(nkeys).forEach(([k,obj],i) => obj.on('down', ()=>this._selectChoice(i)));

    this.cameras.main.fadeIn(200, 4, 2, 10);
    this._renderNode('start');
  }

  _renderNode(nodeId) {
    if (!nodeId) { this._close(); return; }
    const node = this._tree.find(n=>n.id===nodeId);
    if (!node)  { this._close(); return; }
    this._nodeId = nodeId;
    this._clearReaction();

    // Portrait
    if (this._portrait) { this._portrait.destroy(); this._portrait = null; }
    const W = this.scale.width, H = this.scale.height;
    const pKey = node.portrait || 'npc-elder';
    if (this.textures.exists(pKey)) {
      this._portrait = this.add.image(154, H/2+20, pKey).setOrigin(0.5).setScale(0.9).setDepth(7015);
    }

    // Speaker
    this._speakerTxt.setText(node.speaker || '???');

    // Trust display
    const npc = this.state.npcs[this._npcKey];
    if (npc) {
      const trust = npc.trust ?? 50;
      const lbl = trust>70?'Trusted':trust>40?'Neutral':'Wary';
      this._trustTxt.setText(`Trust: ${Math.round(trust)} (${lbl})  |  ${corruptionTier(this.state.corruption).label}`);
    }

    // Dialogue text (supports function)
    const rawText = typeof node.text==='function' ? node.text(this.state) : (node.text||'...');
    this._dialogueTxt.setAlpha(0).setText(this._clean(rawText));
    this.tweens.add({ targets:this._dialogueTxt, alpha:1, duration:200 });

    // Build choices
    this._clearChoices();
    const rawChoices = typeof node.choices==='function' ? node.choices(this.state) : (node.choices||[]);
    const visible = rawChoices.filter(c=>!c.requires||c.requires());

    if (!visible.length) {
      this.time.delayedCall(1600, ()=>this._close());
      return;
    }

    const y0 = H/2+80, gap=60;
    visible.forEach((ch, i) => {
      const y = y0 + i*gap;
      const isCorr = ch.text.includes('[Corruption') || ch.text.includes('[Trust');
      const fill   = isCorr ? 0x1e0030 : 0x0e0820;
      const stroke = isCorr ? 0xff44cc : 0x6633aa;

      const bg = this.add.rectangle(W/2+20, y, 880, 52, fill, 0.93)
        .setStrokeStyle(2, stroke, i===this._focus?1:0.5).setDepth(7025);
      bg.setInteractive({ useHandCursor:true });

      const txt = this.add.text(W/2+20, y, `${i+1}. ${ch.text}`, {
        fontSize:'14px', color: i===this._focus ? '#ffffff' : (isCorr?'#ff88dd':'#e0cced'),
        wordWrap:{ width:840 },
      }).setOrigin(0.5).setDepth(7026);

      bg.on('pointerover', ()=>{ bg.setStrokeStyle(3,0xffffff,1); txt.setColor('#fff'); });
      bg.on('pointerout',  ()=>{ bg.setStrokeStyle(2,stroke,i===this._focus?1:0.5); txt.setColor(i===this._focus?'#fff':isCorr?'#ff88dd':'#e0cced'); });
      bg.on('pointerdown', ()=>this._selectChoice(i));

      this._choiceBtns.push({ bg, txt, choice:ch, isCorr });
    });

    this._focus = 0;
    this._highlightFocus();
  }

  _moveFocus(d) {
    if (!this._choiceBtns.length) return;
    this._unhighlightFocus();
    this._focus = Math.max(0, Math.min(this._choiceBtns.length-1, this._focus+d));
    this._highlightFocus();
  }

  _highlightFocus() {
    const b = this._choiceBtns[this._focus];
    if (b) { b.bg.setStrokeStyle(3, 0xffffff, 1); b.txt.setColor('#ffffff'); }
  }

  _unhighlightFocus() {
    const b = this._choiceBtns[this._focus];
    if (b) {
      b.bg.setStrokeStyle(2, b.isCorr?0xff44cc:0x6633aa, 0.5);
      b.txt.setColor(b.isCorr?'#ff88dd':'#e0cced');
    }
  }

  _confirmFocus() { this._selectChoice(this._focus); }

  _selectChoice(i) {
    if (i<0||i>=this._choiceBtns.length) return;
    const { choice } = this._choiceBtns[i];
    if (choice.reaction) {
      this._runReaction(choice, (success) => {
        if (success) {
          if (choice.effect) { choice.effect(this.state); saveState(this.state); }
          const next = choice.reaction.next || choice.next;
          if (next) this._renderNode(next); else this._close();
        } else {
          if (choice.reaction.failEffect) { choice.reaction.failEffect(this.state); saveState(this.state); }
          const failNext = choice.reaction.failNext || choice.failNext;
          if (failNext) this._renderNode(failNext); else if (choice.failClose) this._close(); else this._close();
        }
      });
      return;
    }
    if (choice.effect) { choice.effect(this.state); saveState(this.state); }
    if (choice.next)   { this._renderNode(choice.next); }
    else               { this._close(); }
  }

  _runReaction(choice, done) {
    this._clearReaction();
    this._reactionActive = true;
    const cfg = choice.reaction || {};
    this._reactionSeq = (cfg.seq || ['LEFT','RIGHT','UP']).map(s=>String(s).toUpperCase());
    this._reactionIndex = 0;
    this._reactionDone = done;

    const W = this.scale.width, H = this.scale.height;
    this._reactionLayer = this.add.container(0,0).setScrollFactor(0).setDepth(7040);
    const dim = this.add.rectangle(W/2, H/2, W, H, 0x000000, 0.25).setDepth(7040);
    const box = this.add.rectangle(W/2, H/2+10, 760, 180, 0x180818, 0.98).setStrokeStyle(2, 0xff88cc, 0.85).setDepth(7041);
    const title = this.add.text(W/2, H/2-58, cfg.prompt || 'React in order!', { fontSize:'18px', color:'#ffffff', fontStyle:'bold' }).setOrigin(0.5).setDepth(7042);
    this._reactionText = this.add.text(W/2, H/2-20, this._reactionSeq.join('  →  '), { fontSize:'20px', color:'#ff88dd', fontStyle:'bold' }).setOrigin(0.5).setDepth(7042);
    this._reactionProg = this.add.text(W/2, H/2+16, `1 / ${this._reactionSeq.length}`, { fontSize:'16px', color:'#e0d0ee' }).setOrigin(0.5).setDepth(7042);
    const hint = this.add.text(W/2, H/2+52, 'Use arrow keys / WASD, or tap the arrows below.', { fontSize:'13px', color:'#aa88bb' }).setOrigin(0.5).setDepth(7042);
    this._reactionLayer.add([dim, box, title, this._reactionText, this._reactionProg, hint]);

    const btnY = H/2 + 92;
    const mk = (label, key, x) => {
      const r = this.add.rectangle(x, btnY, 78, 54, 0x2c0c2c, 0.96).setStrokeStyle(2, 0xcc88ff, 0.85).setDepth(7042).setInteractive({useHandCursor:true});
      const tx = this.add.text(x, btnY, label, { fontSize:'22px', color:'#fff', fontStyle:'bold' }).setOrigin(0.5).setDepth(7043);
      r.on('pointerdown', () => this._reactionInput(key));
      this._reactionLayer.add([r,tx]);
    };
    mk('◀', 'LEFT', W/2 - 144);
    mk('▲', 'UP', W/2 - 48);
    mk('▼', 'DOWN', W/2 + 48);
    mk('▶', 'RIGHT', W/2 + 144);

    const timeout = cfg.timeout || (2200 + this._reactionSeq.length * 520);
    this._reactionTimer = this.time.delayedCall(timeout, () => this._reactionFail());
  }

  _reactionInput(key) {
    if (!this._reactionActive) return;
    const expected = this._reactionSeq[this._reactionIndex];
    if (!expected) return;
    const ok = String(key || '').toUpperCase() === expected;
    if (!ok) {
      this._reactionFail();
      return;
    }
    this._reactionIndex += 1;
    if (this._reactionProg) this._reactionProg.setText(`${this._reactionIndex + 1} / ${this._reactionSeq.length}`);
    if (this._reactionIndex >= this._reactionSeq.length) {
      this._reactionSuccess();
    }
  }

  _reactionSuccess() {
    if (!this._reactionActive) return;
    this._clearReaction();
    this._reactionDone?.(true);
  }

  _reactionFail() {
    if (!this._reactionActive) return;
    this._clearReaction();
    this._reactionDone?.(false);
  }

  _clearReaction() {
    this._reactionActive = false;
    this._reactionSeq = [];
    this._reactionIndex = 0;
    if (this._reactionTimer) { this._reactionTimer.remove(false); this._reactionTimer = null; }
    if (this._reactionLayer) { this._reactionLayer.destroy(true); this._reactionLayer = null; }
    this._reactionText = null;
    this._reactionProg = null;
    this._reactionDone = null;
  }

  _clearChoices() {
    this._choiceBtns.forEach(b=>{ b.bg.destroy(); b.txt.destroy(); });
    this._choiceBtns = [];
  }

  _clean(text) {
    return text.replace(/\\c\[\d+\]/gi,'').replace(/\\C\[\d+\]/gi,'').trim();
  }

  _close() {
    this._clearReaction();
    saveState(this.state);
    this.cameras.main.fade(240, 4, 2, 10, false, (cam,p) => {
      if (p>=1) {
        this.scene.stop();
        this.scene.resume(this._return, { dialogueClosed:true, state:this.state });
      }
    });
  }
}
