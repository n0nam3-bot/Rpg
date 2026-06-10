import { normalizeState, saveState, loadState, freshState } from './util.js';

export class SettingsScene extends Phaser.Scene {
  constructor() { super({ key:'SettingsScene' }); }

  init(d={}) {
    this.state   = normalizeState(d.state);
    this._return = d.returnTo || 'WorldScene';
    this._focus  = 0;
    this._toggleDefs = [
      { key:'shake',          label:'Screen Shake',         desc:'Camera shakes on heavy impacts and critical hits.' },
      { key:'music',          label:'Music',                desc:'Background music when tracks are available.' },
      { key:'mobileControls', label:'Touch D-Pad',          desc:'On-screen directional buttons for touchscreens.' },
    ];
  }

  create() {
    const W = this.scale.width, H = this.scale.height;
    this.input.addPointer(4);

    this.add.rectangle(W/2, H/2, W, H, 0x04010b);
    this.add.rectangle(W/2, H/2, W, H, 0x220044, 0.07);

    // Header
    this.add.rectangle(W/2, 34, W, 68, 0x07030d, 0.95).setStrokeStyle(1,0x5522aa,0.4);
    this.add.text(22, 12, 'SETTINGS', { fontSize:'26px', color:'#cc44ff', fontStyle:'bold' });

    // Close
    const closeR = this.add.rectangle(W-84, 34, 148, 54, 0x1a0030, 0.9).setStrokeStyle(2,0xcc44ff,0.7);
    this.add.text(W-84, 34, '✕  CLOSE', { fontSize:'18px', color:'#cc88ff', fontStyle:'bold' }).setOrigin(0.5);
    closeR.setInteractive({ useHandCursor:true });
    closeR.on('pointerdown', ()=>this._close());

    // ── TOGGLE SECTION ────────────────────────────────────────────────────
    this._toggleRows = [];
    let y = 108;
    this._toggleDefs.forEach(({ key, label, desc }, i)=>{
      const val     = this.state.settings[key] ?? true;
      const focused = this._focus === i;

      const cardBg = this.add.rectangle(W/2, y+36, W-60, 72, 0x0d0820, 0.92)
        .setStrokeStyle(focused?3:1, focused?0xffffff:0x4422aa, focused?1:0.5);
      this.add.text(78, y+14, label, { fontSize:'19px', color:'#ddd', fontStyle:'bold' });
      this.add.text(78, y+38, desc, { fontSize:'13px', color:'#776688' });

      const togBg  = this.add.rectangle(W-120, y+36, 170, 52, val?0x330044:0x1a0010, 0.9)
        .setStrokeStyle(2, val?0xcc44ff:0x443355, 0.85);
      const togTxt = this.add.text(W-120, y+36, val?'◉  ON':'○  OFF', {
        fontSize:'18px', color: val?'#cc44ff':'#443355', fontStyle:'bold',
      }).setOrigin(0.5);

      // Tap card or toggle button
      cardBg.setInteractive({ useHandCursor:true });
      cardBg.on('pointerdown', ()=>this._toggle(i, key, togBg, togTxt));
      togBg.setInteractive({ useHandCursor:true });
      togBg.on('pointerdown', ()=>this._toggle(i, key, togBg, togTxt));

      this._toggleRows.push({ cardBg, togBg, togTxt, key });
      y += 86;
    });

    // ── SAVE DATA SECTION ─────────────────────────────────────────────────
    y += 16;
    this.add.text(68, y, 'SAVE DATA', { fontSize:'15px', color:'#7733cc', fontStyle:'bold' });
    this.add.rectangle(68, y+14, 150, 2, 0x7733cc, 0.4).setOrigin(0,0.5);
    y += 28;

    const saved = loadState();
    const saveInfo = saved
      ? `Day ${saved.day}  ·  Corruption ${saved.corruption}  ·  Kills ${saved.kills}  ·  ${saved.gold}g`
      : 'No save data found.';
    this.add.text(68, y, saveInfo, { fontSize:'14px', color:'#886699' });
    y += 30;

    // Save now
    const saveBg = this.add.rectangle(160, y+26, 220, 52, 0x1a0035, 0.9).setStrokeStyle(2,0x8833cc,0.8);
    this.add.text(160, y+26, 'Save Now', { fontSize:'17px', color:'#cc88ff', fontStyle:'bold' }).setOrigin(0.5);
    saveBg.setInteractive({ useHandCursor:true });
    saveBg.on('pointerover', ()=>saveBg.setFillStyle(0x330055,0.9));
    saveBg.on('pointerout',  ()=>saveBg.setFillStyle(0x1a0035,0.9));
    saveBg.on('pointerdown', ()=>{ saveState(this.state); this._feedback('Game saved.'); });

    // Clear save
    const clearBg = this.add.rectangle(420, y+26, 220, 52, 0x1e0006, 0.9).setStrokeStyle(2,0x882233,0.8);
    this.add.text(420, y+26, 'Clear Save', { fontSize:'17px', color:'#cc4455', fontStyle:'bold' }).setOrigin(0.5);
    clearBg.setInteractive({ useHandCursor:true });
    clearBg.on('pointerover', ()=>clearBg.setFillStyle(0x3a0010,0.9));
    clearBg.on('pointerout',  ()=>clearBg.setFillStyle(0x1e0006,0.9));
    clearBg.on('pointerdown', ()=>this._confirmClear());

    // ── CONTROLS REFERENCE ────────────────────────────────────────────────
    y += 70;
    this.add.text(68, y, 'CONTROLS', { fontSize:'15px', color:'#7733cc', fontStyle:'bold' });
    this.add.rectangle(68, y+14, 130, 2, 0x7733cc, 0.4).setOrigin(0,0.5);
    y += 28;

    const cols = [
      ['A / ◀  —  Move left', 'D / ▶  —  Move right', 'W / Space / ↑  —  Jump', 'E / Enter  —  Interact'],
      ['I  —  Inventory', 'ESC  —  Settings', '1–7  —  Battle actions', '↑↓  —  Navigate menus'],
    ];
    cols.forEach((col, ci)=>{
      col.forEach((line, li)=>{
        this.add.text(68 + ci*360, y + li*24, line, { fontSize:'13px', color:'#886699' });
      });
    });

    // ── KEYBOARD ──────────────────────────────────────────────────────────
    const kb = this.input.keyboard.addKeys('ESC,UP,DOWN,ENTER,SPACE');
    kb.ESC.on('down',   ()=>this._close());
    kb.UP.on('down',    ()=>this._moveFocus(-1));
    kb.DOWN.on('down',  ()=>this._moveFocus(1));
    kb.ENTER.on('down', ()=>this._activateFocused());
    kb.SPACE.on('down', ()=>this._activateFocused());

    this.add.text(W/2, H-18, '↑↓ Navigate   Enter Toggle   ESC Close',
      { fontSize:'12px', color:'#443355' }).setOrigin(0.5);

    this.cameras.main.fadeIn(220, 4, 2, 10);
  }

  _toggle(i, key, togBg, togTxt) {
    this.state.settings[key] = !this.state.settings[key];
    const val = this.state.settings[key];
    togBg.setFillStyle(val?0x330044:0x1a0010, 0.9);
    togBg.setStrokeStyle(2, val?0xcc44ff:0x443355, 0.85);
    togTxt.setText(val?'◉  ON':'○  OFF').setColor(val?'#cc44ff':'#443355');
    saveState(this.state);
  }

  _moveFocus(d) {
    const rows = this._toggleRows;
    if (!rows?.length) return;
    rows[this._focus].cardBg.setStrokeStyle(1,0x4422aa,0.5);
    this._focus = Math.max(0, Math.min(rows.length-1, this._focus+d));
    rows[this._focus].cardBg.setStrokeStyle(3,0xffffff,1);
  }

  _activateFocused() {
    const row = this._toggleRows?.[this._focus];
    if (row) this._toggle(this._focus, row.key, row.togBg, row.togTxt);
  }

  _confirmClear() {
    const W = this.scale.width, H = this.scale.height;
    const c = this.add.container(W/2, H/2).setDepth(9999);
    const bg  = this.add.rectangle(0,0, 520,210, 0x0d030a, 0.98).setStrokeStyle(2,0xff3355,0.8);
    const t1  = this.add.text(0,-72,'Clear all save data?',{fontSize:'24px',color:'#ff4455',fontStyle:'bold'}).setOrigin(0.5);
    const t2  = this.add.text(0,-24,'This permanently erases your progress.',{fontSize:'15px',color:'#cc8899'}).setOrigin(0.5);
    const yes = this.add.rectangle(-90,64, 160,52, 0x2a0008, 0.9).setStrokeStyle(2,0xff3344,0.8);
    const yT  = this.add.text(-90,64,'Yes, Clear',{fontSize:'16px',color:'#ff4455',fontStyle:'bold'}).setOrigin(0.5);
    const no  = this.add.rectangle(90,64, 160,52, 0x0a001a, 0.9).setStrokeStyle(2,0x7733cc,0.8);
    const nT  = this.add.text(90,64,'Cancel',{fontSize:'16px',color:'#cc88ff',fontStyle:'bold'}).setOrigin(0.5);
    c.add([bg,t1,t2,yes,yT,no,nT]);
    yes.setInteractive({useHandCursor:true});
    yes.on('pointerdown',()=>{
      try { localStorage.removeItem('veiled_apostasy_v1'); } catch {}
      this.state = freshState();
      c.destroy();
      this._feedback('Save data cleared.');
    });
    no.setInteractive({useHandCursor:true});
    no.on('pointerdown',()=>c.destroy());
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
    this.cameras.main.fade(220,4,2,10,false,(cam,p)=>{
      if (p>=1) {
        this.scene.stop();
        this.scene.resume(this._return, { dialogueClosed:true, state:this.state });
      }
    });
  }
}
