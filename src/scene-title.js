import { buildGameContext, hydrateContextFromSave } from './context.js';
import { SaveSystem } from './storage.js';
import { loadGameSettings } from './scene-settings.js';

export class TitleScreenScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TitleScreenScene' });
    }

    create() {
        const settings = loadGameSettings();
        this.add.rectangle(640, 360, 1280, 720, 0x07070c);
        this.add.text(640, 128, 'SYLPHIETTE', {
            fontSize: '58px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.add.text(640, 194, 'Bedroom-first side-scroller / district sim foundation', {
            fontSize: '16px',
            color: '#d0d0df'
        }).setOrigin(0.5);
        this.add.text(640, 230, 'Wake in the bedroom, move through the district, survive combat, and advance the day.', {
            fontSize: '13px',
            color: '#7f7f95'
        }).setOrigin(0.5);
        this.add.text(640, 610, `Controls: Arrow Keys / WASD move • Space jump • E interact • ESC settings • F5 save • Enter start in bedroom`, {
            fontSize: '13px',
            color: settings.controlHints ? '#c9c9d9' : '#5a5a6f'
        }).setOrigin(0.5);

        const startBtn = this.add.rectangle(640, 315, 280, 56, 0x4a4ae6).setInteractive({ useHandCursor: true });
        this.add.text(640, 315, 'NEW GAME', { fontSize: '18px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
        startBtn.on('pointerdown', () => {
            const ctx = buildGameContext({ isNewGame: true });
            this.scene.start('WardenQuartersScene', ctx);
        });

        const save = SaveSystem.loadGame();
        const continueBtn = this.add.rectangle(640, 389, 280, 52, save ? 0x2f7a4a : 0x333347)
            .setInteractive({ useHandCursor: !!save });
        this.add.text(640, 389, save ? 'CONTINUE' : 'NO SAVE FOUND', {
            fontSize: '16px',
            color: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        if (save) {
            continueBtn.on('pointerdown', () => {
                const ctx = hydrateContextFromSave(save);
                this.scene.start('WardenQuartersScene', ctx);
            });
        }

        const settingsBtn = this.add.rectangle(640, 463, 280, 52, 0x5b3c73).setInteractive({ useHandCursor: true });
        this.add.text(640, 463, 'SETTINGS', { fontSize: '16px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
        settingsBtn.on('pointerdown', () => {
            this.scene.start('SettingsScene', { returnTo: 'TitleScreenScene' });
        });

        this.add.text(640, 540, 'Custom asset support: drop your own art/audio into the repo and keep the logic layer intact.', {
            fontSize: '13px',
            color: '#8d8da6'
        }).setOrigin(0.5);

        this.input.keyboard.on('keydown-ENTER', () => startBtn.emit('pointerdown'));
        this.input.keyboard.on('keydown-C', () => { if (save) continueBtn.emit('pointerdown'); });
        this.input.keyboard.on('keydown-S', () => settingsBtn.emit('pointerdown'));
    }
}
