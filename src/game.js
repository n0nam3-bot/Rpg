import { LoadingScene }   from './loading.js';
import { TitleScene }     from './title.js';
import { WorldScene }     from './world.js';
import { BattleScene }    from './battle.js';
import { DialogueScene }  from './dialogue.js';
import { StatusScene }    from './status.js';
import { InventoryScene } from './inventory.js';
import { SettingsScene }  from './settings.js';

const config = {
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#06030a',
  pixelArt: false,
  roundPixels: true,
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 980 }, debug: false },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1280,
    height: 720,
  },
  scene: [
    LoadingScene,
    TitleScene,
    WorldScene,
    BattleScene,
    DialogueScene,
    StatusScene,
    InventoryScene,
    SettingsScene,
  ],
};

window.addEventListener('load', () => {
  window.__veiledGame = new Phaser.Game(config);
});
