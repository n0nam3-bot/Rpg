import { normalizeState, saveState, corruptionTier, totalClothingDef, clamp } from './util.js';

const SLOT_LABELS = { outer:'Outer Cloak', upper:'Upper Vestment', lower:'Lower Skirt', inner:'Inner Bindings', shoes:'Foot Treads' };
const FACTION_LABELS = { order:'Order of Light', cult:'Shadow Cult', wilds:'Free Folk' };
const NPC_LABELS = { elder:'Elder Thane', merchant:'Merchant Ida', guard:'Captain Serrin', witch:'Witch Moira' };

export class StatusScene extends Phaser.Scene {
  constructor() { super({ key: 'StatusScene' }); }

  init(data = {}) {
    this.state     = normalizeState(data.state);
    this._returnTo = data.returnTo || 'WorldScene';
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;
    const s = this.state;

    // Backdrop
    this.add.rectangle(W / 2, H / 2, W, H, 0x05020c);
    const tier = corruptionTier(s.corruption);
    this.add.rectangle(W / 2, H / 2, W, H, tier.color, 0.05);

    // Header bar
    this.add.rectangle(W / 2, 34, W, 68, 0x08030f, 0.95).setStrokeStyle(1, 0x6622aa, 0.5);
    this.add.text(24, 14, 'CHARACTER STATUS', { fontSize: '26px', color: '#cc44ff', fontStyle: 'bold' });
    this.add.text(24, 46, `${tier.label}  •  Day ${s.day}  •  ${s.kills} kills  •  ${s.defeats} defeats`, {
      fontSize: '14px', color: '#886699',
    });

    // Close button
    const closeBtn = this.add.text(W - 24, 14, '✕  CLOSE', { fontSize: '18px', color: '#cc88ff', fontStyle: 'bold' }).setOrigin(1, 0);
    closeBtn.setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this._close());
    closeBtn.on('pointerover', () => closeBtn.setColor('#ffffff'));
    closeBtn.on('pointerout',  () => closeBtn.setColor('#cc88ff'));

    this.input.keyboard.on('keydown-ESC',   () => this._close());
    this.input.keyboard.on('keydown-ENTER', () => this._close());
    this.input.keyboard.on('keydown-I',     () => this._close());

    // ── COLUMN 1: Core Stats & Dark Meters ─────────────────────────────────
    this._buildCoreStats(s, 30, 100);

    // ── COLUMN 2: Clothing Layers ───────────────────────────────────────────
    this._buildClothingPanel(s, 340, 100);

    // ── COLUMN 3: Factions & NPCs ──────────────────────────────────────────
    this._buildRelationsPanel(s, 700, 100);

    // ── COLUMN 4: Quest Log ────────────────────────────────────────────────
    this._buildQuestLog(s, 1000, 100);

    // ── ITEM SUMMARY ────────────────────────────────────────────────────────
    this._buildItems(s, 30, 540);

    this.cameras.main.fadeIn(280, 4, 2, 10);
  }

  // ─── CORE STATS ─────────────────────────────────────────────────────────────
  _buildCoreStats(s, x, y) {
    this._sectionTitle(x, y, 'VITALS & PSYCHOLOGY');
    y += 32;

    const meters = [
      { label: 'HP',             val: s.hp,          max: s.maxHp,  color: 0xff6688 },
      { label: 'Stamina',        val: s.sta,         max: s.maxSta, color: 0x44aaff },
      { label: 'Willpower',      val: s.wil,         max: s.maxWil, color: 0xaaffaa },
      { label: 'Corruption',     val: s.corruption,  max: 100,      color: 0xcc00ff },
      { label: 'Sensitivity',    val: s.sensitivity, max: 100,      color: 0xff88cc },
      { label: 'Pressure',       val: s.pressure,    max: 100,      color: 0xff8833 },
      { label: 'Arousal (btl)', val: s.arousal,     max: 100,      color: 0xff44bb },
    ];

    meters.forEach((m, i) => {
      const my = y + i * 56;
      this._drawBar(x, my, 280, m.label, m.val, m.max, m.color);
    });

    // Gold summary
    this.add.text(x, y + meters.length * 56 + 8, `Gold: ${s.gold}g  |  Kills: ${s.kills}  |  Defeats: ${s.defeats}`, {
      fontSize: '14px', color: '#ccaa44',
    });

    // Corruption tier badge
    const tier = corruptionTier(s.corruption);
    const badge = this.add.text(x + 140, y - 20, tier.label, {
      fontSize: '14px', color: '#000', backgroundColor: `#${tier.color.toString(16).padStart(6,'0')}`,
      padding: { x: 8, y: 3 }, fontStyle: 'bold',
    }).setOrigin(0.5);
  }

  // ─── CLOTHING PANEL ─────────────────────────────────────────────────────────
  _buildClothingPanel(s, x, y) {
    this._sectionTitle(x, y, 'CLOTHING LAYERS');
    y += 32;

    const totalDef = totalClothingDef(s.clothing);
    this.add.text(x, y, `Combined Defense Bonus: ${totalDef}`, { fontSize: '13px', color: '#88aacc' });
    y += 24;

    const slots = ['outer','upper','lower','inner','shoes'];
    slots.forEach((slot, i) => {
      const c = s.clothing[slot];
      const my = y + i * 88;

      // Background card
      const cardColor = c.stripped ? 0x2a0808 : (c.dur < 40 ? 0x1e1400 : 0x0a0618);
      const strokeColor = c.stripped ? 0xff3333 : (c.dur < 40 ? 0xffaa33 : 0x5533aa);
      this.add.rectangle(x + 140, my + 36, 280, 76, cardColor, 0.9).setStrokeStyle(1, strokeColor, 0.7);

      // Slot icon
      const icons = { outer:'🧥', upper:'👔', lower:'👗', inner:'🩳', shoes:'👟' };
      this.add.text(x + 8, my + 16, icons[slot], { fontSize: '22px' });

      this.add.text(x + 46, my + 14, SLOT_LABELS[slot], { fontSize: '15px', color: '#ddd', fontStyle: 'bold' });

      if (c.stripped) {
        this.add.text(x + 46, my + 34, '⚠ STRIPPED', { fontSize: '13px', color: '#ff4444', fontStyle: 'bold' });
        this.add.text(x + 46, my + 52, `DEF Bonus Lost: −${c.def}`, { fontSize: '12px', color: '#ff8888' });
      } else {
        // Durability bar
        const barW = 230;
        const pct  = c.dur / c.max;
        const barColor = pct > 0.6 ? 0x44cc44 : (pct > 0.3 ? 0xcc8833 : 0xcc2222);
        this.add.rectangle(x + 46, my + 38, barW, 12, 0x0a0618, 0.8).setOrigin(0, 0.5);
        this.add.rectangle(x + 46, my + 38, barW * pct, 12, barColor, 1).setOrigin(0, 0.5);
        this.add.text(x + 46, my + 52, `${Math.round(c.dur)}%  |  DEF +${c.def}  |  "${c.name}"`, { fontSize: '12px', color: '#aaa' });
      }
    });
  }

  // ─── RELATIONS PANEL ────────────────────────────────────────────────────────
  _buildRelationsPanel(s, x, y) {
    this._sectionTitle(x, y, 'FACTIONS');
    y += 32;

    Object.entries(s.factions).forEach(([key, val]) => {
      const label = FACTION_LABELS[key] || key;
      const my = y;
      this._drawBar(x, my, 240, label, val, 100, this._factionColor(key));
      y += 44;
    });

    y += 24;
    this._sectionTitle(x, y, 'NPC RELATIONS');
    y += 32;

    Object.entries(s.npcs).forEach(([key, npc]) => {
      const label = NPC_LABELS[key] || key;
      const my = y;

      if (!npc.met) {
        this.add.text(x, my, `${label}: [Unknown]`, { fontSize: '14px', color: '#554466' });
      } else {
        const trustColor = npc.trust > 65 ? '#88ff88' : npc.trust > 35 ? '#ffcc44' : '#ff4444';
        const hostile = npc.hostile ? ' ⚠ HOSTILE' : '';
        const pact    = npc.pact    ? ' ∴ PACT'    : '';
        this.add.text(x, my, `${label}:`, { fontSize: '14px', color: '#ccaadd', fontStyle: 'bold' });
        this.add.text(x + 4, my + 18, `Trust ${Math.round(npc.trust)}/100${hostile}${pact}`, {
          fontSize: '13px', color: trustColor,
        });
        // Trust mini-bar
        const barW = 200;
        this.add.rectangle(x, my + 34, barW, 8, 0x0a0618, 0.8).setOrigin(0, 0.5);
        this.add.rectangle(x, my + 34, barW * (npc.trust / 100), 8, parseInt(trustColor.replace('#',''), 16), 1).setOrigin(0, 0.5);
      }
      y += 60;
    });
  }

  // ─── QUEST LOG ─────────────────────────────────────────────────────────────
  _buildQuestLog(s, x, y) {
    this._sectionTitle(x, y, 'QUEST LOG');
    y += 32;

    // Current objective
    this.add.rectangle(x + 130, y + 22, 260, 52, 0x12082a, 0.9).setStrokeStyle(1, 0x5533aa, 0.6);
    this.add.text(x + 4, y + 4, '▸ Current:', { fontSize: '12px', color: '#aa88cc', fontStyle: 'bold' });
    this.add.text(x + 4, y + 20, s.objective, { fontSize: '13px', color: '#e0d0f0', wordWrap: { width: 248 } });
    y += 70;

    // Completed / flags summary
    this._sectionTitle(x, y, 'STORY FLAGS');
    y += 26;

    const flagDisplay = [
      { key: 'prologueRead',    label: 'Prologue read',          show: true },
      { key: 'firstBattle',     label: 'First battle survived',  show: true },
      { key: 'dungeon1Clear',   label: 'Catacombs cleared',      show: true },
      { key: 'witchPact',       label: 'Pact with Moira',        show: true },
      { key: 'betrayedOrder',   label: 'Order betrayed',         show: true },
      { key: 'cultInitiate',    label: 'Cult initiate',          show: true },
      { key: 'elderReveal',     label: 'Elder\'s secret known',  show: true },
      { key: 'strippedPublic',  label: '⚠ Stripped publicly',   show: true },
      { key: 'patronDefeated',  label: '★ Patron vanquished',    show: !!s.flags.patronDefeated },
    ];

    flagDisplay.filter(f => f.show).forEach((f, i) => {
      const set   = !!s.flags[f.key];
      const col   = set ? '#88ff88' : '#333344';
      const icon  = set ? '◉' : '○';
      this.add.text(x, y + i * 22, `${icon} ${f.label}`, { fontSize: '13px', color: col });
    });
  }

  // ─── ITEMS ─────────────────────────────────────────────────────────────────
  _buildItems(s, x, y) {
    this._sectionTitle(x, y, 'INVENTORY');
    y += 28;

    const itemDefs = {
      healingPotion: { label: 'Healing Potions', icon: '🧪', color: '#88ff88' },
      flashFlask:    { label: 'Flash Flasks',    icon: '💥', color: '#ffcc44' },
      holyWater:     { label: 'Holy Water',      icon: '✨', color: '#88ccff' },
    };

    let ix = x;
    Object.entries(s.items).forEach(([key, qty]) => {
      const def = itemDefs[key] || { label: key, icon: '◈', color: '#aaa' };
      this.add.text(ix, y, `${def.icon} ${def.label}: ${qty}`, { fontSize: '15px', color: def.color });
      ix += 280;
    });
  }

  // ─── HELPERS ───────────────────────────────────────────────────────────────
  _sectionTitle(x, y, title) {
    this.add.text(x, y, title, { fontSize: '14px', color: '#7733cc', fontStyle: 'bold' });
    const width = title.length * 9 + 20;
    this.add.rectangle(x, y + 18, width, 2, 0x7733cc, 0.5).setOrigin(0, 0.5);
  }

  _drawBar(x, y, w, label, val, max, color) {
    const pct = clamp(max > 0 ? val / max : 0, 0, 1);
    this.add.text(x, y, label, { fontSize: '12px', color: '#aa88bb', fontStyle: 'bold' });
    this.add.rectangle(x, y + 16, w, 14, 0x0a0618, 0.8).setOrigin(0, 0.5);
    this.add.rectangle(x, y + 16, w * pct, 14, color, 1).setOrigin(0, 0.5);
    this.add.text(x + w + 6, y + 16, `${Math.round(val)}/${Math.round(max)}`, {
      fontSize: '12px', color: '#ccbbdd',
    }).setOrigin(0, 0.5);
    return y + 14;
  }

  _factionColor(key) {
    return key === 'order' ? 0x4488ff : key === 'cult' ? 0xcc00ff : 0x44cc88;
  }

  _close() {
    saveState(this.state);
    this.cameras.main.fade(250, 4, 2, 10, false, (cam, progress) => {
      if (progress >= 1) {
        this.scene.stop();
        this.scene.resume(this._returnTo, { dialogueClosed: true, state: this.state });
      }
    });
  }
}
