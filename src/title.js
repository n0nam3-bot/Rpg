import { loadState, freshState, saveState, corruptionTier } from './util.js';

export class TitleScene extends Phaser.Scene {
  constructor() { super({ key:'TitleScene' }); }

  create() {
    const W = this.scale.width, H = this.scale.height;
    this.input.addPointer(4);
    this._focus = 0;
    this._btns  = [];

    // Background gradient
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x04020a, 0x04020a, 0x130030, 0x130030, 1);
    bg.fillRect(0, 0, W, H);

    // Floating motes
    this.time.addEvent({ delay:350, repeat:-1, callback:()=>this._mote(W,H) });
    for (let i=0;i<20;i++) this.time.delayedCall(i*120, ()=>this._mote(W,H));

    // Title
    const titleTxt = this.add.text(W/2, 150, 'VEILED APOSTASY', {
      fontSize:'68px', color:'#cc44ff', fontStyle:'bold',
      stroke:'#330044', strokeThickness:7,
    }).setOrigin(0.5).setAlpha(0);

    const subTxt = this.add.text(W/2, 222, 'A Dark Fantasy of Corruption & Consequence', {
      fontSize:'20px', color:'#9966bb', fontStyle:'italic',
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({ targets:[titleTxt,subTxt], alpha:1, duration:1100, ease:'Quad.easeIn' });
    this.tweens.add({ targets:titleTxt, alpha:{from:1,to:0.75}, yoyo:true, repeat:-1, duration:1900, ease:'Sine.easeInOut', delay:1200 });

    // Buttons
    const saved   = loadState();
    const menuItems = [
      { label:'▶  NEW GAME',  action:()=>this._newGame(),     fill:0x220035, stroke:0xcc44ff },
      ...(saved ? [{ label:'◎  CONTINUE', action:()=>this._continue(saved), fill:0x1a002a, stroke:0xaa33dd }] : []),
      { label:'⚙  SETTINGS', action:()=>this._settings(),    fill:0x14001e, stroke:0x883399 },
    ];

    const btnY = saved ? 380 : 410;
    menuItems.forEach((item, i)=>{
      const y   = btnY + i * 82;
      const btn = this._mkBtn(W/2, y, 320, 64, item.label, item.fill, item.stroke, item.action, i===0);
      this._btns.push({ ...btn, action:item.action });
    });

    // Save summary
    if (saved) {
      const tier = corruptionTier(saved.corruption);
      const s5   = 5 - Object.values(saved.clothing).filter(c=>c.stripped).length;
      this.add.text(W/2, H-80, [
        `Day ${saved.day}  ·  ${tier.label} [${saved.corruption} Corruption]`,
        `Kills: ${saved.kills}  ·  Defeats: ${saved.defeats}  ·  ${saved.gold}g`,
        s5 < 5 ? `⚠ ${5-s5} clothing layer(s) stripped` : 'All clothing intact',
      ].join('\n'), { fontSize:'13px', color:'#7a6699', align:'center', lineSpacing:3 }).setOrigin(0.5);
    }

    this.add.text(W/2, H-22, 'Adult Themes  ·  Mature Content  ·  v2.0',
      { fontSize:'13px', color:'#332244' }).setOrigin(0.5);

    // Keyboard
    const kb = this.input.keyboard.addKeys('UP,DOWN,ENTER,SPACE');
    kb.UP.on('down',    ()=>this._moveFocus(-1));
    kb.DOWN.on('down',  ()=>this._moveFocus(1));
    kb.ENTER.on('down', ()=>this._confirmFocus());
    kb.SPACE.on('down', ()=>this._confirmFocus());

    this.cameras.main.fadeIn(700, 4, 2, 10);
  }

  _mkBtn(x, y, w, h, label, fill, stroke, cb, focused=false) {
    const bg  = this.add.rectangle(x, y, w, h, fill, 0.92).setStrokeStyle(focused?3:2, focused?0xffffff:stroke, focused?1:0.8);
    const txt = this.add.text(x, y, label, { fontSize:'22px', color:'#fff', fontStyle:'bold' }).setOrigin(0.5);
    bg.setInteractive({ useHandCursor:true });
    bg.on('pointerover', ()=>{ bg.setFillStyle(stroke, 0.25); bg.setStrokeStyle(3,0xffffff,1); txt.setColor('#ffddff'); });
    bg.on('pointerout',  ()=>{ bg.setFillStyle(fill, 0.92);   bg.setStrokeStyle(2,stroke,0.8); txt.setColor('#ffffff'); });
    bg.on('pointerdown', ()=>this._triggerBtn(cb));
    return { bg, txt, fill, stroke };
  }

  _moveFocus(d) {
    const old = this._btns[this._focus];
    if (old) { old.bg.setStrokeStyle(2,old.stroke,0.8); }
    this._focus = Math.max(0, Math.min(this._btns.length-1, this._focus+d));
    const cur = this._btns[this._focus];
    if (cur) { cur.bg.setStrokeStyle(3,0xffffff,1); }
  }

  _confirmFocus() {
    const btn = this._btns[this._focus];
    if (btn?.action) this._triggerBtn(btn.action);
  }

  _triggerBtn(cb) {
    this.cameras.main.fade(450, 4, 2, 10, false, (cam,p)=>{ if(p>=1) cb(); });
  }

  _newGame() {
    const state = freshState();
    saveState(state);
    this.scene.start('WorldScene', { state, showPrologue:true });
  }

  _continue(state) {
    this.scene.start('WorldScene', { state });
  }

  _settings() {
    this.scene.start('SettingsScene', { returnTo:'TitleScene', state:freshState() });
  }

  _mote(W, H) {
    const x = Phaser.Math.Between(0, W);
    const y = Phaser.Math.Between(H*0.3, H);
    const c = this.add.circle(x, y, Phaser.Math.Between(2,6),
      Phaser.Math.RND.pick([0x8800ff,0xcc44ff,0x440088,0xff44aa,0x6600cc]),
      Phaser.Math.FloatBetween(0.06,0.35));
    this.tweens.add({
      targets:c, y:y-Phaser.Math.Between(80,280), x:x+Phaser.Math.Between(-60,60),
      alpha:0, scale:Phaser.Math.FloatBetween(0.5,1.8),
      duration:Phaser.Math.Between(2200,5000), ease:'Quad.easeOut',
      onComplete:()=>c.destroy(),
    });
  }
}
