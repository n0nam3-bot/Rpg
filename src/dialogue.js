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
    this._reaction = null;
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
    this._keys.UP.on('down',    () => this._moveFocus(-1));
    this._keys.DOWN.on('down',  () => this._moveFocus(1));
    this._keys.ENTER.on('down', () => this._confirmFocus());
    this._keys.SPACE.on('down', () => this._confirmFocus());
    this._keys.ESC.on('down',   () => this._close());

    // Number keys 1-5 for direct choice
    const nkeys = this.input.keyboard.addKeys('ONE,TWO,THREE,FOUR,FIVE');
    Object.entries(nkeys).forEach(([k,obj],i) => obj.on('down', ()=>this._selectChoice(i)));

    this._reactionOverlay = this.add.container(W/2, H/2+150).setDepth(7030).setVisible(false);
    this._reactionOverlay.add(this.add.rectangle(0, 0, 540, 130, 0x06010c, 0.95).setStrokeStyle(2, 0xff44cc, 0.8));
    this._reactionPrompt = this.add.text(0, -36, '', { fontSize:'18px', color:'#ffccff', fontStyle:'bold' }).setOrigin(0.5);
    this._reactionPattern = this.add.text(0, -2, '', { fontSize:'26px', color:'#ffffff', fontStyle:'bold' }).setOrigin(0.5);
    this._reactionStatus = this.add.text(0, 34, '', { fontSize:'14px', color:'#ddbbff' }).setOrigin(0.5);
    this._reactionOverlay.add([this._reactionPrompt, this._reactionPattern, this._reactionStatus]);

    this.cameras.main.fadeIn(200, 4, 2, 10);
    this._renderNode('start');
  }

  update(time, delta) {
    if (!this._reaction) return;
    this._reaction.timeLeft -= delta;
    const exp = this._reaction.pattern.map(token => token === 'LEFT' ? '←' : token === 'RIGHT' ? '→' : token === 'UP' ? '↑' : token === 'DOWN' ? '↓' : token === 'SPACE' ? '␣' : token).join('  ');
    this._reactionPattern?.setText(exp);
    this._reactionStatus?.setText(`Press: ${this._reaction.pattern[this._reaction.index] ? this._tokenToGlyph(this._reaction.pattern[this._reaction.index]) : 'done'}`);

    if (this._reaction.timeLeft <= 0) {
      this._resolveReaction(false);
      return;
    }

    const pressed = this._readReactionToken();
    if (!pressed) return;

    const expected = this._reaction.pattern[this._reaction.index];
    if (pressed === expected) {
      this._reaction.index++;
      if (this._reaction.index >= this._reaction.pattern.length) {
        this._resolveReaction(true);
      } else {
        this._reactionStatus?.setText(`Good. Next: ${this._tokenToGlyph(this._reaction.pattern[this._reaction.index])}`);
      }
    } else {
      this._resolveReaction(false);
    }
  }

  _tokenToGlyph(token) {
    return token === 'LEFT' ? '←' : token === 'RIGHT' ? '→' : token === 'UP' ? '↑' : token === 'DOWN' ? '↓' : token === 'SPACE' ? '␣' : token;
  }

  _readReactionToken() {
    if (Phaser.Input.Keyboard.JustDown(this._keys.LEFT) || Phaser.Input.Keyboard.JustDown(this._keys.A)) return 'LEFT';
    if (Phaser.Input.Keyboard.JustDown(this._keys.RIGHT) || Phaser.Input.Keyboard.JustDown(this._keys.D)) return 'RIGHT';
    if (Phaser.Input.Keyboard.JustDown(this._keys.UP) || Phaser.Input.Keyboard.JustDown(this._keys.W)) return 'UP';
    if (Phaser.Input.Keyboard.JustDown(this._keys.DOWN) || Phaser.Input.Keyboard.JustDown(this._keys.S)) return 'DOWN';
    if (Phaser.Input.Keyboard.JustDown(this._keys.SPACE) || Phaser.Input.Keyboard.JustDown(this._keys.ENTER)) return 'SPACE';
    return null;
  }

  _startReaction(choice) {
    const reaction = choice.reaction || null;
    if (!reaction) return;
    this._reaction = {
      choice,
      pattern: Array.isArray(reaction.pattern) ? reaction.pattern.slice() : ['LEFT','RIGHT'],
      index: 0,
      timeLeft: reaction.time || 1800,
      success: reaction.success || null,
      failure: reaction.failure || null,
    };
    this._reactionOverlay?.setVisible(true);
    this._reactionPrompt?.setText(reaction.prompt || 'React now');
    this._reactionPattern?.setText(this._reaction.pattern.map(t => this._tokenToGlyph(t)).join('  '));
    this._reactionStatus?.setText('Press the sequence');
    this._clearChoices();
    this._choiceBtns = [];
  }

  _resolveReaction(success) {
    const r = this._reaction;
    if (!r) return;
    const branch = success ? r.success : r.failure;
    if (branch?.effect) branch.effect(this.state);
    saveState(this.state);
    this._reactionOverlay?.setVisible(false);
    this._reaction = null;
    const next = branch?.next ?? r.choice.next ?? null;
    if (next) this._renderNode(next);
    else this._close();
  }

  _renderNode(nodeId) {
    if (!nodeId) { this._close(); return; }
    const node = this._tree.find(n=>n.id===nodeId);
    if (!node)  { this._close(); return; }
    this._nodeId = nodeId;

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
    this._reactionOverlay?.setVisible(false);
    this._reaction = null;
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
    if (this._reaction) return;
    if (i<0||i>=this._choiceBtns.length) return;
    const { choice } = this._choiceBtns[i];
    if (choice.reaction) {
      this._startReaction(choice);
      return;
    }
    if (choice.effect) { choice.effect(this.state); saveState(this.state); }
    if (choice.next)   { this._renderNode(choice.next); }
    else               { this._close(); }
  }

  _clearChoices() {
    this._choiceBtns.forEach(b=>{ b.bg.destroy(); b.txt.destroy(); });
    this._choiceBtns = [];
  }

  _clean(text) {
    return text.replace(/\\c\[\d+\]/gi,'').replace(/\\C\[\d+\]/gi,'').trim();
  }

  _close() {
    this._reactionOverlay?.setVisible(false);
    this._reaction = null;
    saveState(this.state);
    this.cameras.main.fade(240, 4, 2, 10, false, (cam,p) => {
      if (p>=1) {
        this.scene.stop();
        this.scene.resume(this._return, { dialogueClosed:true, state:this.state });
      }
    });
  }
}
