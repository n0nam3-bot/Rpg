import { buildGameContext } from './context.js';

export class EscapeHallScene extends Phaser.Scene {
    constructor() {
        super({ key: 'EscapeHallScene' });
    }

    init(data) {
        const ctx = buildGameContext(data);
        this.globalState = ctx.globalState;
        this.management = ctx.management;
        this.loops = ctx.loops;
        this.advancedSim = ctx.advancedSim;
        this.economy = ctx.economy;
        this.defeatReport = data.defeatReport || data.report || { lostFunds: 0 };
    }

    create() {
        this.add.rectangle(640, 360, 1280, 720, 0x160d12);
        this.add.text(640, 150, 'RETREAT ROUTE', {
            fontSize: '32px',
            color: '#ff7777',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const loss = this.defeatReport?.lostFunds ?? 0;
        this.add.text(640, 235, `A failed mission has left the sector unstable. Lost funds: $${loss}`, {
            fontSize: '16px',
            color: '#d7d7e4'
        }).setOrigin(0.5);

        const backBtn = this.add.rectangle(640, 360, 240, 52, 0x4a4ae6).setInteractive({ useHandCursor: true });
        this.add.text(640, 360, 'RETURN TO HUB', { fontSize: '16px', color: '#fff', fontWeight: 'bold' }).setOrigin(0.5);
        backBtn.on('pointerdown', () => {
            this.scene.start('ManagementHubScene', {
                globalState: this.globalState,
                management: this.management,
                loops: this.loops,
                advancedSim: this.advancedSim,
                economy: this.economy
            });
        });

        const titleBtn = this.add.rectangle(640, 435, 240, 52, 0x5b3c73).setInteractive({ useHandCursor: true });
        this.add.text(640, 435, 'TITLE SCREEN', { fontSize: '16px', color: '#fff', fontWeight: 'bold' }).setOrigin(0.5);
        titleBtn.on('pointerdown', () => this.scene.start('TitleScreenScene'));
    }
}
