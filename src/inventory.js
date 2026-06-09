import { normalizeState, saveState, totalClothingDef, repairAllClothing, clamp } from './util.js';
import { ITEMS } from './data.js';

const SLOT_ORDER  = ['outer','upper','lower','inner','shoes'];
const SLOT_LABELS = { outer:'Outer Cloak', upper:'Upper Vestment', lower:'Lower Skirt', inner:'Inner Bindings', shoes:'Foot Treads' };

export class InventoryScene extends Phaser.Scene {
  constructor() { super({ key: 'InventoryScene' }); }

  init(data = {}) {
    this.state     = normalizeState(data.state);
    this._returnTo = data.returnTo || 'WorldScene';
    this._tab      = 'items';  // 'items' | 'clothing'
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    // Backdrop
    this.add.rectangle(W / 2, H / 2, W, H, 0x06030c);
    this.add.rectangle(W / 2, H / 2, W, H, 0x330055, 0.07);

    // Header
    this.add.rectangle(W / 2, 34, W, 68, 0x08030f, 0.95).setStrokeStyle(1, 0x6622aa, 0.4);
    this.add.text(24, 14, 'INVENTORY', { fontSize: '26px', color: '#cc44ff', fontStyle: 'bold' });
    this.add.text(24, 46, `Gold: ${this.state.gold}g`, { fontSize: '15px', color: '#ccaa44' });

    // Close
    const closeBtn = this.add.text(W - 24, 14, '✕  CLOSE', { fontSize: '18px', color: '#cc88ff', fontStyle: 'bold' }).setOrigin(1, 0);
    closeBtn.setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this._close());

    // Tab buttons
    this._tabBtns = {};
    this._buildTabs(W);

    // Content area
    this._contentContainer = this.add.container(0, 0);
    this._renderTab();

    // Keyboard
    this.input.keyboard.on('keydown-ESC', () => this._close());
    this.input.keyboard.on('keydown-I',   () => this._close());
    this.input.keyboard.on('keydown-ONE', () => this._switchTab('items'));
    this.input.keyboard.on('keydown-TWO', () => this._switchTab('clothing'));

    // Hint
    this.add.text(W / 2, H - 22, '1 – Items   2 – Clothing   ESC – Close', {
      fontSize: '12px', color: '#554466',
    }).setOrigin(0.5);

    this.cameras.main.fadeIn(220, 4, 2, 10);
  }

  _buildTabs(W) {
    const tabs = [
      { key: 'items',    label: '1. Items',    x: 200 },
      { key: 'clothing', label: '2. Clothing', x: 400 },
    ];
    tabs.forEach(t => {
      const active = this._tab === t.key;
      const bg = this.add.rectangle(t.x, 92, 180, 40, active ? 0x330044 : 0x120820, 0.9)
        .setStrokeStyle(2, active ? 0xcc44ff : 0x442266, active ? 0.9 : 0.5);
      const txt = this.add.text(t.x, 92, t.label, {
        fontSize: '16px', color: active ? '#ffddff' : '#774488', fontStyle: 'bold',
      }).setOrigin(0.5);
      bg.setInteractive(new Phaser.Geom.Rectangle(-90,-20,180,40), Phaser.Geom.Rectangle.Contains, { useHandCursor: true });
      bg.on('pointerdown', () => this._switchTab(t.key));
      this._tabBtns[t.key] = { bg, txt };
    });
  }

  _switchTab(key) {
    this._tab = key;
    // Re-tint tabs
    Object.entries(this._tabBtns).forEach(([k, b]) => {
      const active = k === key;
      b.bg.setFillStyle(active ? 0x330044 : 0x120820, 0.9);
      b.bg.setStrokeStyle(2, active ? 0xcc44ff : 0x442266, active ? 0.9 : 0.5);
      b.txt.setColor(active ? '#ffddff' : '#774488');
    });
    this._contentContainer.destroy();
    this._contentContainer = this.add.container(0, 0);
    this._renderTab();
  }

  _renderTab() {
    if (this._tab === 'items')    this._renderItems();
    if (this._tab === 'clothing') this._renderClothing();
  }

  // ─── ITEMS TAB ─────────────────────────────────────────────────────────────
  _renderItems() {
    const W = this.scale.width;
    const s = this.state;
    let y = 140;

    const itemDefs = [
      { key: 'healingPotion', def: ITEMS.healingPotion, icon: '🧪', outOfBattle: false },
      { key: 'flashFlask',    def: ITEMS.flashFlask,    icon: '💥', outOfBattle: false },
      { key: 'holyWater',     def: ITEMS.holyWater,     icon: '✨', outOfBattle: true  },
    ];

    if (!Object.values(s.items).some(v => v > 0)) {
      this.add.text(W / 2, 300, 'No items in inventory.\nFind them in chests or buy from the merchant.', {
        fontSize: '18px', color: '#554466', align: 'center',
      }).setOrigin(0.5);
      return;
    }

    itemDefs.forEach(({ key, def, icon, outOfBattle }) => {
      const qty = s.items[key] || 0;
      if (qty <= 0) return;

      // Card background
      const cardBg = this.add.rectangle(W / 2, y + 50, 900, 88, 0x0e0820, 0.92).setStrokeStyle(1, 0x5533aa, 0.5);
      this._contentContainer.add(cardBg);

      // Icon + name
      const iconT = this.add.text(80, y + 16, icon, { fontSize: '30px' });
      const nameT = this.add.text(130, y + 14, `${def.label}  ×${qty}`, { fontSize: '18px', color: '#ddd', fontStyle: 'bold' });
      const descT = this.add.text(130, y + 40, def.desc, { fontSize: '13px', color: '#998aaa' });
      const noteT = this.add.text(130, y + 60, outOfBattle ? '(Use outside battle only)' : '(Can use in battle)', { fontSize: '12px', color: '#665577' });
      this._contentContainer.add([iconT, nameT, descT, noteT]);

      // Use button (only for out-of-battle usable items)
      if (outOfBattle && qty > 0) {
        const useBg = this.add.rectangle(W - 100, y + 44, 140, 44, 0x220033, 0.9).setStrokeStyle(2, 0xcc44ff, 0.7);
        const useTxt = this.add.text(W - 100, y + 44, 'USE', { fontSize: '16px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
        useBg.setInteractive(new Phaser.Geom.Rectangle(-70,-22,140,44), Phaser.Geom.Rectangle.Contains, { useHandCursor: true });
        useBg.on('pointerover',  () => useBg.setFillStyle(0x440066, 0.9));
        useBg.on('pointerout',   () => useBg.setFillStyle(0x220033, 0.9));
        useBg.on('pointerdown', () => this._useItem(key, def));
        this._contentContainer.add([useBg, useTxt]);
      }

      y += 104;
    });
  }

  _useItem(key, def) {
    const s = this.state;
    if (!s.items[key] || s.items[key] <= 0) return;
    s.items[key] -= 1;
    def.effect(s);
    saveState(s);
    // Refresh display
    this._contentContainer.destroy();
    this._contentContainer = this.add.container(0, 0);
    this._renderTab();
    this._showFeedback(def.label + ' used.');
  }

  // ─── CLOTHING TAB ──────────────────────────────────────────────────────────
  _renderClothing() {
    const W  = this.scale.width;
    const s  = this.state;
    let y = 140;

    const totalDef = totalClothingDef(s.clothing);
    const strippedCount = SLOT_ORDER.filter(sl => s.clothing[sl].stripped).length;

    const summaryBg = this.add.rectangle(W / 2, y + 22, 900, 44, 0x0a0618, 0.9).setStrokeStyle(1, 0x5533aa, 0.4);
    const summaryT  = this.add.text(W / 2, y + 22, `Defense Bonus: +${totalDef}  |  Stripped Layers: ${strippedCount}/5`, {
      fontSize: '16px', color: '#ccbbdd',
    }).setOrigin(0.5);
    this._contentContainer.add([summaryBg, summaryT]);
    y += 60;

    // Repair all button (only if something is damaged)
    const damaged = SLOT_ORDER.some(sl => s.clothing[sl].stripped || s.clothing[sl].dur < 100);
    if (damaged) {
      const repairCost = strippedCount * 20 + SLOT_ORDER.filter(sl => !s.clothing[sl].stripped && s.clothing[sl].dur < 100).length * 10;
      const canAfford  = s.gold >= repairCost;
      const rBg = this.add.rectangle(W / 2, y + 22, 420, 44, canAfford ? 0x1a0035 : 0x1a1014, 0.9)
        .setStrokeStyle(2, canAfford ? 0xcc44ff : 0x443355, 0.8);
      const rTxt = this.add.text(W / 2, y + 22, canAfford ? `Repair All Clothing  (${repairCost}g)` : `Repair All (${repairCost}g) — Insufficient gold`, {
        fontSize: '16px', color: canAfford ? '#fff' : '#554466', fontStyle: 'bold',
      }).setOrigin(0.5);

      if (canAfford) {
        rBg.setInteractive(new Phaser.Geom.Rectangle(-210,-22,420,44), Phaser.Geom.Rectangle.Contains, { useHandCursor: true });
        rBg.on('pointerover',  () => rBg.setFillStyle(0x380066, 0.9));
        rBg.on('pointerout',   () => rBg.setFillStyle(0x1a0035, 0.9));
        rBg.on('pointerdown', () => {
          s.gold -= repairCost;
          repairAllClothing(s, 1.0);
          saveState(s);
          this._contentContainer.destroy();
          this._contentContainer = this.add.container(0, 0);
          this._renderTab();
          this._showFeedback('All clothing repaired!');
        });
      }
      this._contentContainer.add([rBg, rTxt]);
      y += 60;
    }

    // Individual slots
    SLOT_ORDER.forEach(slot => {
      const c = s.clothing[slot];
      const cardColor  = c.stripped ? 0x200404 : (c.dur < 40 ? 0x1a1000 : 0x0c0820);
      const cardStroke = c.stripped ? 0xff3333   : (c.dur < 40 ? 0xffaa33 : 0x5533aa);

      const cardBg = this.add.rectangle(W / 2, y + 44, 900, 76, cardColor, 0.93).setStrokeStyle(1, cardStroke, 0.7);
      this._contentContainer.add(cardBg);

      const icons = { outer:'🧥', upper:'👔', lower:'👗', inner:'🩳', shoes:'👟' };
      const iconT = this.add.text(66, y + 18, icons[slot], { fontSize: '26px' });
      const nameT = this.add.text(112, y + 16, SLOT_LABELS[slot], { fontSize: '16px', color: '#ddd', fontStyle: 'bold' });
      const itemT = this.add.text(112, y + 38, `"${c.name}"  |  DEF +${c.def}`, { fontSize: '13px', color: '#998aaa' });
      this._contentContainer.add([iconT, nameT, itemT]);

      if (c.stripped) {
        const statusT = this.add.text(550, y + 28, 'STRIPPED — Vulnerability increased', { fontSize: '14px', color: '#ff4444', fontStyle: 'bold' });
        this._contentContainer.add(statusT);
      } else {
        // Durability bar
        const pct    = c.dur / c.max;
        const barCol = pct > 0.6 ? 0x44cc44 : (pct > 0.3 ? 0xcc8833 : 0xcc2222);
        const barBg  = this.add.rectangle(490, y + 28, 200, 12, 0x0a0618, 0.8).setOrigin(0, 0.5);
        const barFil = this.add.rectangle(490, y + 28, 200 * pct, 12, barCol, 1).setOrigin(0, 0.5);
        const pctT   = this.add.text(698, y + 28, `${Math.round(c.dur)}%`, { fontSize: '13px', color: '#aaa' }).setOrigin(0, 0.5);
        this._contentContainer.add([barBg, barFil, pctT]);
      }

      y += 90;
    });
  }

  _showFeedback(msg) {
    const W = this.scale.width;
    const t = this.add.text(W / 2, 680, msg, {
      fontSize: '16px', color: '#88ff88', backgroundColor: '#00000088', padding: { x: 12, y: 6 },
    }).setOrigin(0.5).setDepth(9000);
    this.tweens.add({ targets: t, y: 640, alpha: 0, duration: 1600, ease: 'Quad.easeOut', onComplete: () => t.destroy() });
  }

  _close() {
    saveState(this.state);
    this.cameras.main.fade(220, 4, 2, 10, false, (cam, p) => {
      if (p >= 1) {
        this.scene.stop();
        this.scene.resume(this._returnTo, { dialogueClosed: true, state: this.state });
      }
    });
  }
}
