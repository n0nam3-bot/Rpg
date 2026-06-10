import { normalizeState, saveState, totalClothingDef, repairAllClothing, clamp, SLOT_ORDER } from './util.js';
import { ITEMS } from './data.js';

const SLOT_NAMES = { outer:'Outer Cloak', upper:'Upper Vest', lower:'Lower Skirt', inner:'Inner Bind', shoes:'Foot Treads' };
const SLOT_ICONS = { outer:'🧥', upper:'👔', lower:'👗', inner:'🩳', shoes:'👟' };

export class InventoryScene extends Phaser.Scene {
  constructor() { super({ key:'InventoryScene' }); }

  init(d={}) {
    this.state    = normalizeState(d.state);
    this._return  = d.returnTo || 'WorldScene';
    this._tab     = 'items';
    this._itemFocus = 0;
  }

  create() {
    const W = this.scale.width, H = this.scale.height;
    this.input.addPointer(4);

    this.add.rectangle(W/2, H/2, W, H, 0x05020b);
    this.add.rectangle(W/2, H/2, W, H, 0x330055, 0.06);

    // Header
    this.add.rectangle(W/2, 34, W, 68, 0x07030d, 0.95).setStrokeStyle(1,0x5522aa,0.4);
    this.add.text(22, 12, 'INVENTORY', { fontSize:'26px', color:'#cc44ff', fontStyle:'bold' });
    this._goldTxt = this.add.text(22, 42, `Gold: ${this.state.gold}g`, { fontSize:'15px', color:'#ccaa44' });

    // Close button
    const closeR = this.add.rectangle(W-84, 34, 148, 54, 0x1a0030, 0.9).setStrokeStyle(2,0xcc44ff,0.7);
    this.add.text(W-84, 34, '✕  CLOSE', { fontSize:'18px', color:'#cc88ff', fontStyle:'bold' }).setOrigin(0.5);
    closeR.setInteractive({ useHandCursor:true });
    closeR.on('pointerdown', ()=>this._close());

    // Tab bar
    this._tabs = {};
    this._buildTabs();

    // Content container
    this._content = this.add.container(0, 0);
    this._renderTab();

    // Keyboard
    const kb = this.input.keyboard.addKeys('ESC,I,ONE,TWO,UP,DOWN,ENTER,SPACE');
    kb.ESC.on('down',   ()=>this._close());
    kb.I.on('down',     ()=>this._close());
    kb.ONE.on('down',   ()=>this._switchTab('items'));
    kb.TWO.on('down',   ()=>this._switchTab('clothing'));
    kb.UP.on('down',    ()=>this._moveFocus(-1));
    kb.DOWN.on('down',  ()=>this._moveFocus(1));
    kb.ENTER.on('down', ()=>this._confirmFocus());
    kb.SPACE.on('down', ()=>this._confirmFocus());

    // Hint
    this.add.text(W/2, H-18, '1 – Items   2 – Clothing   ↑↓ Navigate   Enter Use   ESC Close',
      { fontSize:'12px', color:'#443355' }).setOrigin(0.5);

    this.cameras.main.fadeIn(220, 4, 2, 10);
  }

  _buildTabs() {
    const defs = [['items','1. Items',200], ['clothing','2. Clothing',400]];
    defs.forEach(([key, label, tx]) => {
      const active = this._tab === key;
      const bg = this.add.rectangle(tx, 90, 190, 44, active ? 0x330044 : 0x120820, 0.9)
        .setStrokeStyle(2, active ? 0xcc44ff : 0x442266, active ? 0.9 : 0.5);
      const txt = this.add.text(tx, 90, label, { fontSize:'17px', color: active?'#ffddff':'#774488', fontStyle:'bold' }).setOrigin(0.5);
      bg.setInteractive({ useHandCursor:true });
      bg.on('pointerdown', ()=>this._switchTab(key));
      this._tabs[key] = { bg, txt };
    });
  }

  _switchTab(key) {
    if (this._tab === key) return;
    this._tab = key;
    this._itemFocus = 0;
    Object.entries(this._tabs).forEach(([k, b])=>{
      const active = k === key;
      b.bg.setFillStyle(active ? 0x330044 : 0x120820, 0.9);
      b.bg.setStrokeStyle(2, active ? 0xcc44ff : 0x442266, active ? 0.9 : 0.5);
      b.txt.setColor(active ? '#ffddff' : '#774488');
    });
    this._content.destroy();
    this._content = this.add.container(0, 0);
    this._renderTab();
  }

  _renderTab() {
    if (this._tab === 'items')    this._renderItems();
    if (this._tab === 'clothing') this._renderClothing();
    this._goldTxt.setText(`Gold: ${this.state.gold}g`);
  }

  // ─── ITEMS TAB ────────────────────────────────────────────────────────────
  _renderItems() {
    const W = this.scale.width, s = this.state;
    this._itemBtns = [];
    let y = 138;

    const defs = [
      { key:'healingPotion', def:ITEMS.healingPotion, icon:'🧪', outOfBattle:false, col:'#88ff88' },
      { key:'flashFlask',    def:ITEMS.flashFlask,    icon:'💥', outOfBattle:false, col:'#ffcc44' },
      { key:'holyWater',     def:ITEMS.holyWater,     icon:'✨', outOfBattle:true,  col:'#88ccff' },
    ];

    const anyItems = defs.some(d => (s.items[d.key]||0) > 0);
    if (!anyItems) {
      this.add.text(W/2, 320, 'No items in inventory.\nBuy from Merchant Ida or find them in chests.', {
        fontSize:'18px', color:'#443355', align:'center',
      }).setOrigin(0.5);
      return;
    }

    defs.forEach(({ key, def, icon, outOfBattle, col })=>{
      const qty = s.items[key] || 0;
      if (qty <= 0) return;

      const focused = this._itemFocus === this._itemBtns.length;
      const cardBg = this.add.rectangle(W/2, y+46, W-60, 88, 0x0d0820, 0.93)
        .setStrokeStyle(focused ? 3 : 1, focused ? 0xffffff : 0x5533aa, focused ? 1 : 0.5);
      this._content.add(cardBg);

      const iconT = this.add.text(68, y+18, icon, { fontSize:'32px' });
      const nameT = this.add.text(116, y+14, `${def.label}  ×${qty}`, { fontSize:'18px', color:'#ddd', fontStyle:'bold' });
      const descT = this.add.text(116, y+38, def.desc, { fontSize:'13px', color:'#998aaa' });
      const noteT = this.add.text(116, y+58, outOfBattle ? '(Outside battle only)' : '(Can use in battle)', { fontSize:'11px', color:'#554466' });
      this._content.add([iconT, nameT, descT, noteT]);

      if (outOfBattle) {
        const useBg = this.add.rectangle(W-110, y+46, 160, 52, 0x220033, 0.9).setStrokeStyle(2,0xcc44ff,0.8);
        const useTxt = this.add.text(W-110, y+46, 'USE', { fontSize:'18px', color:'#fff', fontStyle:'bold' }).setOrigin(0.5);
        useBg.setInteractive({ useHandCursor:true });
        useBg.on('pointerover', ()=>useBg.setFillStyle(0x440066,0.9));
        useBg.on('pointerout',  ()=>useBg.setFillStyle(0x220033,0.9));
        useBg.on('pointerdown', ()=>this._useItem(key, def));
        this._content.add([useBg, useTxt]);
        this._itemBtns.push({ bg:cardBg, usable:true, action:()=>this._useItem(key, def) });
      } else {
        this.add.text(W-110, y+46, '(Battle only)', { fontSize:'13px', color:'#443355' }).setOrigin(0.5);
        this._itemBtns.push({ bg:cardBg, usable:false, action:null });
      }

      cardBg.setInteractive({ useHandCursor:true });
      cardBg.on('pointerdown', ()=>{ if (outOfBattle) this._useItem(key, def); });
      y += 104;
    });
  }

  _useItem(key, def) {
    const s = this.state;
    if (!s.items[key] || s.items[key] <= 0) return;
    s.items[key] -= 1;
    const msg = def.effect(s);
    saveState(s);
    this._feedback(msg || `${def.label} used.`);
    this._content.destroy();
    this._content = this.add.container(0, 0);
    this._renderTab();
  }

  _moveFocus(d) {
    if (!this._itemBtns?.length) return;
    if (this._itemBtns[this._itemFocus]) this._itemBtns[this._itemFocus].bg.setStrokeStyle(1,0x5533aa,0.5);
    this._itemFocus = Math.max(0, Math.min(this._itemBtns.length-1, this._itemFocus+d));
    if (this._itemBtns[this._itemFocus]) this._itemBtns[this._itemFocus].bg.setStrokeStyle(3,0xffffff,1);
  }

  _confirmFocus() {
    const btn = this._itemBtns?.[this._itemFocus];
    if (btn?.usable && btn.action) btn.action();
  }

  // ─── CLOTHING TAB ─────────────────────────────────────────────────────────
  _renderClothing() {
    const W = this.scale.width, s = this.state;
    let y = 138;

    // Summary bar
    const def = totalClothingDef(s.clothing);
    const stripped = SLOT_ORDER.filter(sl=>s.clothing[sl].stripped).length;
    const sumBg = this.add.rectangle(W/2, y+24, W-60, 48, 0x0a0618, 0.9).setStrokeStyle(1,0x5533aa,0.4);
    this.add.text(W/2, y+24, `Defense Bonus: +${def}  |  Stripped: ${stripped}/5  |  ${stripped>0?'⚠ Vulnerable':'All intact'}`,
      { fontSize:'16px', color: stripped>0?'#ffcc44':'#88ff88' }).setOrigin(0.5);
    this._content.add([sumBg]);
    y += 56;

    // Repair button
    const damaged = SLOT_ORDER.some(sl=>s.clothing[sl].stripped||s.clothing[sl].dur<100);
    if (damaged) {
      const cost = stripped*20 + SLOT_ORDER.filter(sl=>!s.clothing[sl].stripped&&s.clothing[sl].dur<100).length*8;
      const can  = s.gold >= cost;
      const rBg  = this.add.rectangle(W/2, y+26, 460, 52, can?0x1a0035:0x18100e, 0.9)
        .setStrokeStyle(2, can?0xcc44ff:0x443355, 0.8);
      const rTxt = this.add.text(W/2, y+26, can?`Repair All Clothing (${cost}g)`:`Repair All (${cost}g) — Need more gold`,
        { fontSize:'17px', color:can?'#fff':'#554466', fontStyle:'bold' }).setOrigin(0.5);
      this._content.add([rBg, rTxt]);
      if (can) {
        rBg.setInteractive({ useHandCursor:true });
        rBg.on('pointerover', ()=>rBg.setFillStyle(0x380066,0.9));
        rBg.on('pointerout',  ()=>rBg.setFillStyle(0x1a0035,0.9));
        rBg.on('pointerdown', ()=>{
          s.gold -= cost;
          repairAllClothing(s, 1.0);
          saveState(s);
          this._content.destroy();
          this._content = this.add.container(0, 0);
          this._renderTab();
          this._feedback('All clothing repaired!');
        });
      }
      y += 62;
    }

    // Each slot
    SLOT_ORDER.forEach(slot=>{
      const c = s.clothing[slot];
      const cf = c.stripped ? 0x1e0204 : (c.dur<40 ? 0x181000 : 0x0c0820);
      const cs = c.stripped ? 0xff3333  : (c.dur<40 ? 0xffaa33 : 0x5533aa);
      const cardBg = this.add.rectangle(W/2, y+44, W-60, 80, cf, 0.93).setStrokeStyle(1,cs,0.7);
      this._content.add(cardBg);

      const iconT = this.add.text(64,  y+18, SLOT_ICONS[slot], { fontSize:'28px' });
      const nameT = this.add.text(110, y+14, SLOT_NAMES[slot], { fontSize:'16px', color:'#ddd', fontStyle:'bold' });
      const itemT = this.add.text(110, y+36, `"${c.name}"  |  DEF +${c.def}`, { fontSize:'13px', color:'#998aaa' });
      this._content.add([iconT, nameT, itemT]);

      if (c.stripped) {
        const sT = this.add.text(W/2+100, y+28, 'STRIPPED — Higher vulnerability', { fontSize:'14px', color:'#ff4444', fontStyle:'bold' }).setOrigin(0,0.5);
        this._content.add(sT);
      } else {
        const pct = c.dur / c.max;
        const bc  = pct>0.6?0x44cc44:pct>0.3?0xcc8833:0xcc2222;
        const bBg = this.add.rectangle(490, y+38, 210, 12, 0x0a0618, 0.8).setOrigin(0,0.5);
        const bFl = this.add.rectangle(490, y+38, 210*pct, 12, bc, 1).setOrigin(0,0.5);
        const pTxt = this.add.text(708, y+38, `${Math.round(c.dur)}%`, { fontSize:'13px', color:'#aaa' }).setOrigin(0,0.5);
        this._content.add([bBg, bFl, pTxt]);
      }
      y += 94;
    });
  }

  _feedback(msg) {
    const W = this.scale.width;
    const t = this.add.text(W/2, 680, msg, {
      fontSize:'16px', color:'#88ff88', backgroundColor:'#00000099', padding:{ x:14, y:6 },
    }).setOrigin(0.5).setDepth(9000);
    this.tweens.add({ targets:t, y:640, alpha:0, duration:1600, ease:'Quad.easeOut', onComplete:()=>t.destroy() });
  }

  _close() {
    saveState(this.state);
    this.cameras.main.fade(220,4,2,10,false,(cam,p)=>{ if(p>=1){ this.scene.stop(); this.scene.resume(this._return,{dialogueClosed:true,state:this.state}); } });
  }
}
