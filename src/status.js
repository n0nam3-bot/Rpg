import { normalizeState, saveState, corruptionTier, totalClothingDef, clamp, SLOT_ORDER } from './util.js';

export class StatusScene extends Phaser.Scene {
  constructor() { super({ key:'StatusScene' }); }
  init(d={}) { this.state=normalizeState(d.state); this._return=d.returnTo||'WorldScene'; }

  create() {
    const W=this.scale.width, H=this.scale.height, s=this.state;
    this.input.addPointer(4);
    this.add.rectangle(W/2, H/2, W, H, 0x04020c);
    const tier = corruptionTier(s.corruption);
    this.add.rectangle(W/2, H/2, W, H, tier.color, 0.06);

    // Header
    this.add.rectangle(W/2, 34, W, 68, 0x07030d, 0.95).setStrokeStyle(1,0x5522aa,0.4);
    this.add.text(22,12,'CHARACTER STATUS',{fontSize:'26px',color:'#cc44ff',fontStyle:'bold'});
    this.add.text(22,42,`${tier.label}  ·  Day ${s.day}  ·  ${s.kills} kills  ·  ${s.defeats} defeats  ·  ${s.gold}g`,{fontSize:'14px',color:'#886699'});

    // Close (large touch target)
    const closeR = this.add.rectangle(W-84, 34, 148, 54, 0x1a0030, 0.9).setStrokeStyle(2,0xcc44ff,0.7);
    const closeTxt = this.add.text(W-84, 34, '✕  CLOSE', {fontSize:'18px',color:'#cc88ff',fontStyle:'bold'}).setOrigin(0.5);
    closeR.setInteractive({useHandCursor:true});
    closeR.on('pointerdown', ()=>this._close());
    this.input.keyboard.on('keydown-ESC',   ()=>this._close());
    this.input.keyboard.on('keydown-ENTER', ()=>this._close());
    this.input.keyboard.on('keydown-I',     ()=>this._close());
    this.input.keyboard.on('keydown-S',     ()=>this._close());

    // Columns
    this._buildVitals(s, 28, 96);
    this._buildClothing(s, 340, 96);
    this._buildRelations(s, 710, 96);
    this._buildQuestLog(s, 1020, 96);
    this._buildItems(s, 28, 560);

    this.cameras.main.fadeIn(220, 4, 2, 10);
  }

  _sec(x,y,title) {
    this.add.text(x,y,title,{fontSize:'13px',color:'#7733cc',fontStyle:'bold'});
    this.add.rectangle(x,y+16,title.length*8+20,2,0x7733cc,0.4).setOrigin(0,0.5);
  }

  _bar(x,y,w,label,val,max,color) {
    const pct=clamp(max>0?val/max:0,0,1);
    this.add.text(x,y,label,{fontSize:'12px',color:'#aa88bb'});
    this.add.rectangle(x,y+16,w,14,0x0a0618,0.8).setOrigin(0,0.5);
    this.add.rectangle(x,y+16,Math.max(0,w*pct),14,color,1).setOrigin(0,0.5);
    this.add.text(x+w+5,y+16,`${Math.round(val)}/${Math.round(max)}`,{fontSize:'11px',color:'#ccbbdd'}).setOrigin(0,0.5);
  }

  _buildVitals(s,x,y) {
    this._sec(x,y,'VITALS & PSYCHOLOGY'); y+=30;
    const bars=[
      ['HP',s.hp,s.maxHp,0xff6688],['Stamina',s.sta,s.maxSta,0x44aaff],
      ['Willpower',s.wil,s.maxWil,0xaaffaa],['Corruption',s.corruption,100,0xcc00ff],
      ['Sensitivity',s.sensitivity,100,0xff88cc],['Pressure',s.pressure,100,0xff8833],
      ['Arousal',s.arousal,100,0xff44bb],
    ];
    bars.forEach(([lbl,v,m,col],i)=>this._bar(x,y+i*48,280,lbl,v,m,col));
  }

  _buildClothing(s,x,y) {
    this._sec(x,y,'CLOTHING'); y+=28;
    this.add.text(x,y,`Combined DEF Bonus: +${totalClothingDef(s.clothing)}`,{fontSize:'13px',color:'#88aacc'});
    y+=22;
    const icons={outer:'🧥',upper:'👔',lower:'👗',inner:'🩳',shoes:'👟'};
    const names={outer:'Outer Cloak',upper:'Upper Vest',lower:'Lower Skirt',inner:'Inner Bind',shoes:'Foot Treads'};
    SLOT_ORDER.forEach((slot,i)=>{
      const c=s.clothing[slot]; const my=y+i*82;
      const cf=c.stripped?0x200404:(c.dur<40?0x1a1000:0x0c0820);
      const cs=c.stripped?0xff3333:(c.dur<40?0xffaa33:0x5533aa);
      this.add.rectangle(x+140,my+36,286,72,cf,0.92).setStrokeStyle(1,cs,0.7);
      this.add.text(x+6,my+16,icons[slot],{fontSize:'22px'});
      this.add.text(x+44,my+14,names[slot],{fontSize:'14px',color:'#ddd',fontStyle:'bold'});
      if (c.stripped) {
        this.add.text(x+44,my+34,'⚠ STRIPPED',{fontSize:'13px',color:'#ff4444',fontStyle:'bold'});
        this.add.text(x+44,my+52,`DEF Bonus Lost: −${c.def}`,{fontSize:'11px',color:'#ff8888'});
      } else {
        const bw=220, pct=c.dur/c.max;
        const bc=pct>0.6?0x44cc44:pct>0.3?0xcc8833:0xcc2222;
        this.add.rectangle(x+44,my+38,bw,10,0x0a0618,0.8).setOrigin(0,0.5);
        this.add.rectangle(x+44,my+38,bw*pct,10,bc,1).setOrigin(0,0.5);
        this.add.text(x+44,my+52,`${Math.round(c.dur)}%  DEF +${c.def}  "${c.name}"`,{fontSize:'11px',color:'#aaa'});
      }
    });
  }

  _buildRelations(s,x,y) {
    this._sec(x,y,'FACTIONS'); y+=28;
    const fcols={order:0x4488ff,cult:0xcc00ff,wilds:0x44cc88};
    const flbls={order:'Order of Light',cult:'Shadow Cult',wilds:'Free Folk'};
    Object.entries(s.factions).forEach(([k,v],i)=>{ this._bar(x,y+i*42,240,flbls[k],v,100,fcols[k]); });
    y+=Object.keys(s.factions).length*42+24;
    this._sec(x,y,'NPC RELATIONS'); y+=28;
    const npclbls={elder:'Elder Thane',merchant:'Merchant Ida',guard:'Capt. Serrin',witch:'Witch Moira'};
    Object.entries(s.npcs).forEach(([k,npc],i)=>{
      const my=y+i*58;
      const lbl=npclbls[k]||k;
      if (!npc.met) { this.add.text(x,my,`${lbl}: [Unknown]`,{fontSize:'14px',color:'#443355'}); return; }
      const tc=npc.trust>65?'#88ff88':npc.trust>35?'#ffcc44':'#ff4444';
      const extra=(npc.hostile?' ⚠ HOSTILE':'')+(npc.pact?' ∴ PACT':'');
      this.add.text(x,my,`${lbl}:`,{fontSize:'14px',color:'#ccaadd',fontStyle:'bold'});
      this.add.text(x+4,my+18,`Trust ${Math.round(npc.trust)}/100${extra}`,{fontSize:'12px',color:tc});
      this.add.rectangle(x,my+34,200,7,0x0a0618,0.8).setOrigin(0,0.5);
      this.add.rectangle(x,my+34,200*(npc.trust/100),7,parseInt(tc.replace('#',''),16),1).setOrigin(0,0.5);
    });
  }

  _buildQuestLog(s,x,y) {
    this._sec(x,y,'OBJECTIVE'); y+=28;
    this.add.rectangle(x+125,y+24,256,52,0x10082a,0.9).setStrokeStyle(1,0x5533aa,0.5);
    this.add.text(x+4,y+6,'▸ Active:',{fontSize:'11px',color:'#aa88cc',fontStyle:'bold'});
    this.add.text(x+4,y+22,s.objective,{fontSize:'13px',color:'#e0d0f0',wordWrap:{width:244}});
    y+=72;
    this._sec(x,y,'STORY FLAGS'); y+=26;
    const flags=[
      ['prologueRead','Prologue read'],['firstBattle','First battle survived'],
      ['dungeon1Clear','Catacombs cleared'],['witchPact','Pact with Moira'],
      ['betrayedOrder','Betrayed the Order'],['cultInitiate','Cult initiate'],
      ['elderReveal','Elder\'s secret known'],['strippedPublic','⚠ Stripped publicly'],
      ['patronDefeated','★ Patron vanquished'],
    ];
    flags.forEach(([k,lbl],i)=>{
      const set=!!s.flags[k];
      this.add.text(x,y+i*22,`${set?'◉':'○'} ${lbl}`,{fontSize:'13px',color:set?'#88ff88':'#333344'});
    });
  }

  _buildItems(s,x,y) {
    this._sec(x,y,'INVENTORY'); y+=26;
    const defs={healingPotion:['🧪','Healing Potion','#88ff88'],flashFlask:['💥','Flash Flask','#ffcc44'],holyWater:['✨','Holy Water','#88ccff']};
    let ix=x;
    Object.entries(s.items).forEach(([k,qty])=>{
      const [ic,lbl,col]=defs[k]||['◈',k,'#aaa'];
      this.add.text(ix,y,`${ic} ${lbl}: ${qty}`,{fontSize:'15px',color:col});
      ix+=300;
    });
  }

  _close() {
    saveState(this.state);
    this.cameras.main.fade(220,4,2,10,false,(cam,p)=>{ if(p>=1){ this.scene.stop(); this.scene.resume(this._return,{dialogueClosed:true,state:this.state}); } });
  }
}
