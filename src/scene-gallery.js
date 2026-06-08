import { MasterTitleRegistry } from './master-game-loops.js';
import { buildGameContext } from './context.js';
import { BedCombatScene } from './scene-bed-combat.js';

export class SceneGalleryScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SceneGalleryScene' });
    }

    init(data) {
        const ctx = buildGameContext(data);
        this.globalState = ctx.globalState;
        this.management = ctx.management;
    }

    create() {
        this.add.rectangle(640, 360, 1280, 720, 0x0c0811);
        this.add.text(50, 40, 'HISTORICAL SECTOR GALLERY', { fontSize: '26px', color: '#ff66cc', fontWeight: 'bold' });
        this.renderGalleryGridDOM();

        let closeBtn = this.add.rectangle(1150, 650, 160, 45, 0x333).setInteractive({ useHandCursor: true });
        this.add.text(1150, 650, 'MAIN INTERFACE', { fontSize: '12px', color: '#fff', fontWeight: 'bold' }).setOrigin(0.5);
        closeBtn.on('pointerdown', () => { this.scene.start('ManagementHubScene', { globalState: this.globalState, management: this.management, loops: this.globalState.loops, advancedSim: this.globalState.advancedSim, economy: this.globalState.economy }); });
    }

    renderGalleryGridDOM() {
        const isSubverted = MasterTitleRegistry.SUBVERTED_IDOL.unlocked;

        const galleryHTML = `
            <div style="color: white; width: 850px; font-family: Arial; display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; padding: 25px; background: rgba(20,15,25,0.8); border-radius: 8px;">
                <div style="background:#221b2b; padding: 15px; border-radius: 4px; text-align: center;">
                    <p style="margin-bottom:10px; font-size:14px; color:#ff66cc;">Cellblock Match</p>
                    <button id="btn-play-sc1" style="background:#8833aa; color:#fff; padding:6px; border:0; width:100%; font-weight:bold; cursor:pointer;">Play</button>
                </div>
                <div style="background:#221b2b; padding: 15px; border-radius: 4px; text-align: center; opacity: ${isSubverted ? '1' : '0.4'};">
                    <p style="margin-bottom:10px; font-size:14px; color:#ff66cc;">Subverted Idol</p>
                    <button id="btn-play-sc2" ${isSubverted ? '' : 'disabled'} style="background:#8833aa; color:#fff; padding:6px; border:0; width:100%; font-weight:bold;">Play</button>
                </div>
            </div>
        `;

        const container = this.add.dom(640, 360).createFromHTML(galleryHTML);
        container.addListener('click');

        const sc1 = document.getElementById('btn-play-sc1');
        if (sc1) sc1.addEventListener('click', () => { this.scene.start('CombatScene', { globalState: this.globalState, management: this.management, sandboxMode: true }); });
        const sc2 = document.getElementById('btn-play-sc2');
        if (sc2 && MasterTitleRegistry.SUBVERTED_IDOL.unlocked) {
            sc2.addEventListener('click', () => { this.scene.start('BedCombatScene', { globalState: this.globalState, management: this.management, sandboxMode: true }); });
        }
    }
}
