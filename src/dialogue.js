import { normalizeState, saveState, makePanel, corruptionTier } from './util.js';
import { DIALOGUES } from './data.js';

export class DialogueScene extends Phaser.Scene {
  constructor() { super({ key: 'DialogueScene' }); }

  init(data = {}) {
    this.state   = normalizeState(data.state);
    this._npcKey = data.npcKey;
    this._returnTo = data.returnTo || 'WorldScene';
    this._tree   = DIALOGUES[data.npcKey] || [];
    this._nodeId = 'start';
    this._history = [];
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    // ── BACKDROP ───────────────────────────────────────────────────────────
    this.add.rectangle(W / 2, H / 2, W, H, 0x00000088).setScrollFactor(0).setDepth(7000).setInteractive();
    const tier = corruptionTier(this.state.corruption);
    this.add.rectangle(W / 2, H / 2, W, H, tier.color, 0.04).setDepth(7001);

    // ── MAIN PANEL ─────────────────────────────────────────────────────────
    this._mainPanel = makePanel(this, W / 2, H / 2 + 60, 1140, 480, { fill: 0x08030f, stroke: 0xaa55dd, depth: 7010 });

    // ── PORTRAIT BOX ───────────────────────────────────────────────────────
    this._portraitBg = this.add.rectangle(160, H / 2 + 20, 200, 260, 0x10071a, 0.96).setScrollFactor(0).setDepth(7015).setStrokeStyle(2, 0x773399, 0.6);
    this._portraitSprite = null;

    // ── SPEAKER NAME ───────────────────────────────────────────────────────
    this._speakerText = this.add.text(280, H / 2 - 155, '', {
      fontSize: '20px', color: '#ffddff', fontStyle: 'bold',
    }).setScrollFactor(0).setDepth(7020);

    // ── DIALOGUE TEXT ──────────────────────────────────────────────────────
    this._dialogueText = this.add.text(280, H / 2 - 125, '', {
      fontSize: '15px', color: '#e0d0ee', wordWrap: { width: 820 }, lineSpacing: 5,
    }).setScrollFactor(0).setDepth(7020);

    // ── CHOICES CONTAINER ──────────────────────────────────────────────────
    this._choiceContainer = this.add.container(0, 0).setScrollFactor(0).setDepth(7025);
    this._choiceBtns = [];

    // ── NPC RELATIONSHIP STRIP ─────────────────────────────────────────────
    this._relText = this.add.text(W - 24, H / 2 - 160, '', {
      fontSize: '12px', color: '#886699', align: 'right',
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(7020);

    // ── CLOSE HINT ─────────────────────────────────────────────────────────
    this.add.text(W / 2, H - 28, 'ESC — Exit conversation', {
      fontSize: '12px', color: '#554466',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(7020);

    // ── KEYBOARD ───────────────────────────────────────────────────────────
    this._keys = this.input.keyboard.addKeys('ESC,ONE,TWO,THREE,FOUR,FIVE');
    this._keys.ESC.on('down', () => this._closeDialogue());
    ['ONE','TWO','THREE','FOUR','FIVE'].forEach((k, i) => {
      this._keys[k].on('down', () => this._selectChoice(i));
    });

    this.cameras.main.fadeIn(220, 4, 2, 10);
    this._renderNode(this._nodeId);
  }

  // ─── NODE RENDERING ────────────────────────────────────────────────────────
  _renderNode(nodeId) {
    if (!nodeId) { this._closeDialogue(); return; }

    const node = this._tree.find(n => n.id === nodeId);
    if (!node) { this._closeDialogue(); return; }

    this._nodeId = nodeId;
    this._history.push(nodeId);

    // Portrait
    const portraitKey = node.portrait || 'npc-elder';
    if (this._portraitSprite) this._portraitSprite.destroy();
    if (this.textures.exists(portraitKey)) {
      const H = this.scale.height;
      this._portraitSprite = this.add.image(160, H / 2 + 20, portraitKey)
        .setOrigin(0.5).setScale(0.95).setScrollFactor(0).setDepth(7016);
    }

    // Speaker name
    const npcInfo = this.state.npcs[this._npcKey] || {};
    const trust   = npcInfo.trust ?? 50;
    const tierStr = trust > 70 ? 'Trusted' : trust > 40 ? 'Neutral' : 'Wary';
    const corr = corruptionTier(this.state.corruption);

    this._speakerText.setText(node.speaker || '???');
    this._relText.setText(`Trust: ${Math.round(trust)} (${tierStr})  |  ${corr.label}`);

    // Dialogue body — support function signature for dynamic text
    const rawText = typeof node.text === 'function' ? node.text(this.state) : node.text;
    this._dialogueText.setText(this._processMarkup(rawText));

    // Animate text reveal
    this._dialogueText.setAlpha(0);
    this.tweens.add({ targets: this._dialogueText, alpha: 1, duration: 180, ease: 'Quad.easeIn' });

    // Build choices
    this._clearChoiceBtns();
    const rawChoices = typeof node.choices === 'function' ? node.choices(this.state) : (node.choices || []);
    const choices = rawChoices.filter(c => !c.requires || c.requires(this.state));

    if (!choices.length) {
      // Terminal node — auto-close after brief pause
      this.time.delayedCall(1800, () => this._closeDialogue());
      return;
    }

    const H = this.scale.height;
    const choiceY0 = H / 2 + 50;
    const gap      = 58;

    choices.forEach((choice, i) => {
      const y = choiceY0 + i * gap;
      const hasEffect = !!choice.effect;
      const labelPrefix = `${i + 1}. `;

      // Corruption-gated choices get special colour
      const isCorruptChoice = choice.text.includes('[Corruption') || choice.text.includes('[Trust');
      const fillColor  = isCorruptChoice ? 0x1e0030 : 0x120820;
      const strokeColor = isCorruptChoice ? 0xff44cc : 0x7744aa;

      const bg = this.add.rectangle(this.scale.width / 2, y, 860, 48, fillColor, 0.92)
        .setOrigin(0.5).setScrollFactor(0).setDepth(7030).setStrokeStyle(1, strokeColor, 0.7);

      const txt = this.add.text(this.scale.width / 2, y, labelPrefix + choice.text, {
        fontSize: '14px',
        color: isCorruptChoice ? '#ff88dd' : '#e0cced',
        wordWrap: { width: 820 },
        fontStyle: hasEffect ? 'normal' : 'normal',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(7031);

      bg.setInteractive(new Phaser.Geom.Rectangle(-430, -24, 860, 48), Phaser.Geom.Rectangle.Contains, { useHandCursor: true });
      bg.on('pointerover', () => { bg.setFillStyle(isCorruptChoice ? 0x3a0050 : 0x201040, 0.95); });
      bg.on('pointerout',  () => { bg.setFillStyle(fillColor, 0.92); });
      bg.on('pointerdown', () => this._selectChoice(i));

      this._choiceBtns.push({ bg, txt, choice });
    });
  }

  _selectChoice(i) {
    if (i >= this._choiceBtns.length) return;
    const { choice } = this._choiceBtns[i];

    // Apply effect
    if (choice.effect) {
      choice.effect(this.state);
      saveState(this.state);
    }

    // Persist NPC stage if choices carry metadata
    const npc = this.state.npcs[this._npcKey];
    if (npc && choice.advanceStage) {
      npc.stage = Math.max(npc.stage, choice.advanceStage);
    }

    // Navigate
    if (choice.next) {
      this._renderNode(choice.next);
    } else {
      this._closeDialogue();
    }
  }

  _clearChoiceBtns() {
    this._choiceBtns.forEach(b => { b.bg.destroy(); b.txt.destroy(); });
    this._choiceBtns = [];
  }

  // ─── TEXT MARKUP ────────────────────────────────────────────────────────────
  _processMarkup(text) {
    // Remove any RPG Maker–style colour codes inherited from data
    return text.replace(/\\c\[\d+\]/g, '').replace(/\\C\[\d+\]/g, '').trim();
  }

  // ─── CLOSE ─────────────────────────────────────────────────────────────────
  _closeDialogue() {
    saveState(this.state);
    this.cameras.main.fade(250, 4, 2, 10, false, (cam, progress) => {
      if (progress >= 1) {
        this.scene.stop();
        this.scene.resume(this._returnTo, {
          dialogueClosed: true,
          state: this.state,
        });
      }
    });
  }
}
