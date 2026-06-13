import { LoadingScene }   from './loading.js';
import { TitleScene }     from './title.js';
import { WorldScene }     from './world.js';
import { BattleScene }    from './battle.js';
import { DialogueScene }  from './dialogue.js';
import { StatusScene }    from './status.js';
import { InventoryScene } from './inventory.js';
import { SettingsScene }  from './settings.js';
import { VictoryScene }   from './victory.js';

const config = {
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#04020a',
  pixelArt: false,
  roundPixels: true,
  physics: {
    default: 'arcade',
    arcade: { gravity:{ y:980 }, debug:false },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1280,
    height: 720,
    min: { width: 480, height: 270 },
    max: { width: 1920, height: 1080 },
    expandParent: true,
  },
  dom: { createContainer: false },
  scene: [
    LoadingScene, TitleScene, WorldScene, BattleScene,
    DialogueScene, StatusScene, InventoryScene, SettingsScene, VictoryScene,
  ],
};

const boot = () => {
  if (typeof window === 'undefined') return;
  window.__veiledGame = new Phaser.Game(config);
};

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') window.addEventListener('load', boot);
  else boot();

  // Force rescale on orientation change and resize
  const rescale = () => {
    if (!window.__veiledGame) return;
    window.__veiledGame.scale.refresh();
  };
  window.addEventListener('resize', rescale);
  window.addEventListener('orientationchange', () => setTimeout(rescale, 200));
  screen.orientation?.addEventListener?.('change', () => setTimeout(rescale, 200));
}
