import { LoadingScene } from './loading.js';
import { TitleScene } from './title.js';
import { BedroomScene } from './bedroom.js';
import { CorridorScene } from './corridor.js';
import { BattleScene } from './battle.js';
import { StatusScene } from './status.js';
import { SettingsScene } from './settings.js';

const config = {
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#0b0910',
  pixelArt: true,
  roundPixels: true,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 1050 },
      debug: false
    }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1280,
    height: 720
  },
  scene: [
    LoadingScene,
    TitleScene,
    BedroomScene,
    CorridorScene,
    BattleScene,
    StatusScene,
    SettingsScene
  ]
};

if (typeof window !== 'undefined' && window.addEventListener) {
  window.addEventListener('load', () => {
    window.__shaiaRouteGame = new Phaser.Game(config);
  });
} else {
  globalThis.__shaiaRouteGame = new Phaser.Game(config);
}
