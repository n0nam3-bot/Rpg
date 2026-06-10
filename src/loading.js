import { ALL_ASSET_PATHS, EXTRA_PATHS, ASSET_ROOT, K, generateProceduralTextures, loadState, freshState } from './util.js';

export class LoadingScene extends Phaser.Scene {
  constructor() { super({ key: 'LoadingScene' }); }

  preload() {
    const W = this.scale.width, H = this.scale.height;
    this.cameras.main.setBackgroundColor('#04020a');

    // Dark atmosphere
    this.add.rectangle(W/2, H/2, W, H, 0x04020a);

    // Title
    this.add.text(W/2, H/2-100, 'VEILED APOSTASY', {
      fontSize:'52px', color:'#cc44ff', fontStyle:'bold',
      stroke:'#330044', strokeThickness:6,
    }).setOrigin(0.5);
    this.add.text(W/2, H/2-44, 'A Dark Fantasy of Corruption & Consequence', {
      fontSize:'18px', color:'#9966bb', fontStyle:'italic',
    }).setOrigin(0.5);

    // Progress bar
    const bx = W/2, by = H/2+50;
    this.add.rectangle(bx, by, 620, 30, 0x0c0520, 1).setStrokeStyle(2, 0x6600cc, 0.7);
    this._barFill = this.add.rectangle(bx-306, by, 2, 26, 0xcc00ff, 1).setOrigin(0, 0.5);
    this._pctTxt  = this.add.text(bx, by+24, '0%', { fontSize:'13px', color:'#aa66cc' }).setOrigin(0.5);
    this._fileTxt = this.add.text(bx, by+44, 'Loading…', { fontSize:'12px', color:'#664488' }).setOrigin(0.5);

    // Load ALL Shaia + Skeleton individual frames
    ALL_ASSET_PATHS.forEach(p => this.load.image(K(p), ASSET_ROOT + p));

    // Extra props / backgrounds
    EXTRA_PATHS.forEach(p => {
      const key = K(p);
      const url = ASSET_ROOT + p;
      this.load.image(key, url);
    });

    // Attempt to load external assets if they were placed by user
    // (silently skips missing files via loaderror event)
    const EXT_ENEMIES = [
      { key:'bg-cave',      url:'assets/backgrounds/cave/bg.png'       },
      { key:'bg-forest',    url:'assets/backgrounds/forest/bg.png'     },
      { key:'bg-corridor',  url:'assets/backgrounds/corridor/bg.png'   },
      { key:'enemy-minotaur', url:'assets/enemies/minotaur/idle.png'   },
      { key:'enemy-goblin',   url:'assets/enemies/goblin/idle.png'     },
      { key:'enemy-gorgon',   url:'assets/enemies/gorgon/idle.png'     },
      { key:'enemy-vampire',  url:'assets/enemies/vampire/idle.png'    },
      { key:'enemy-knight',   url:'assets/enemies/knight/idle.png'     },
      { key:'enemy-wizard',   url:'assets/enemies/wizard/idle.png'     },
    ];
    EXT_ENEMIES.forEach(e => this.load.image(e.key, e.url));

    this.load.on('progress', pct => {
      this._barFill.displayWidth = 612 * pct;
      this._pctTxt.setText(Math.round(pct*100) + '%');
    });
    this.load.on('fileprogress', file => this._fileTxt.setText(file.key));
    this.load.on('loaderror', () => { /* silently ignore missing optional assets */ });
  }

  create() {
    // Generate all procedural textures for enemies/props that have no sprite sheet yet
    generateProceduralTextures(this);

    // Floating corruption motes
    for (let i = 0; i < 22; i++) {
      this.time.delayedCall(i*80, () => this._mote());
    }

    this.time.delayedCall(500, () => {
      this.cameras.main.fade(500, 4, 2, 10, false, (cam, p) => {
        if (p >= 1) this.scene.start('TitleScene');
      });
    });
  }

  _mote() {
    const W = this.scale.width, H = this.scale.height;
    const x = Phaser.Math.Between(0, W), y = Phaser.Math.Between(H*0.4, H);
    const c = this.add.circle(x, y, Phaser.Math.Between(2,6),
      Phaser.Math.RND.pick([0x8800ff,0xcc44ff,0x440088,0xff44aa]), Phaser.Math.FloatBetween(0.1,0.4));
    this.tweens.add({ targets:c, y:y-Phaser.Math.Between(60,200), x:x+Phaser.Math.Between(-50,50),
      alpha:0, duration:Phaser.Math.Between(1500,3500), ease:'Quad.easeOut', onComplete:()=>c.destroy() });
  }
}
