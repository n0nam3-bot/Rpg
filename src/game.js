import { TitleScreenScene } from './scene-title.js';
import { ManagementHubScene } from './scene-hub.js';
import { CombatScene } from './scene-combat.js';
import { EscapeHallScene } from './scene-escape-hall.js';
import { WardenQuartersScene } from './scene-warden-quarters.js';
import { BedCombatScene } from './scene-bed-combat.js';
import { StatusInspectionScene } from './scene-status.js';
import { PostCombatAccountingScene } from './scene-accounting.js';
import { SettingsScene } from './scene-settings.js';

export const GameEngine = {
    init() {
        const scenePlugins = [];

        if (window.dragonBones?.phaser?.plugin?.DragonBonesPlugin) {
            scenePlugins.push({
                key: 'DragonBones',
                plugin: window.dragonBones.phaser.plugin.DragonBonesPlugin,
                mapping: 'dragonbones'
            });
        }

        const config = {
            type: Phaser.AUTO,
            parent: 'game-container',
            backgroundColor: '#0b0b10',
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y: 1200 },
                    debug: false
                }
            },
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH,
                width: 1280,
                height: 720
            },
            dom: { createContainer: true },
            plugins: scenePlugins.length ? { scene: scenePlugins } : undefined,
            scene: [
                TitleScreenScene,
                SettingsScene,
                ManagementHubScene,
                CombatScene,
                EscapeHallScene,
                WardenQuartersScene,
                BedCombatScene,
                StatusInspectionScene,
                PostCombatAccountingScene,
            ]
        };

        this.game = new Phaser.Game(config);
    }
};
