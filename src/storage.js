import { SkillTreeRegistry } from './skills-tree.js';
import { MasterTitleRegistry } from './master-game-loops.js';
import { EdictRegistry } from './management.js';

function snapshotRegistry(registry) {
    return JSON.parse(JSON.stringify(registry));
}

export const SaveSystem = {
    STORAGE_KEY: "sylphiette_master_save",
    saveGame(player, management, extras = {}) {
        const data = {
            timestamp: Date.now(),
            player: { baseStats: { ...player.baseStats }, sensitivities: { ...player.sensitivities }, activePassives: { ...player.activePassives }, occupiedZones: { ...player.occupiedZones }, stance: player.stance },
            management: { treasury: management.treasury, currentDay: management.currentDay, timeBlock: management.timeBlock, sectors: JSON.parse(JSON.stringify(management.sectors)) },
            skillsTree: extras.skillsTree ? { availableAP: extras.skillsTree.availableAP } : null,
            loops: extras.loops ? {
                stressIndex: extras.loops.stressIndex,
                fatigueIndex: extras.loops.fatigueIndex,
                factions: JSON.parse(JSON.stringify(extras.loops.factions)),
                milestoneRecords: JSON.parse(JSON.stringify(extras.loops.milestoneRecords))
            } : null,
            advancedSim: extras.advancedSim ? {
                isWet: extras.advancedSim.isWet,
                arousalCounter: extras.advancedSim.arousalCounter,
                guardAggression: extras.advancedSim.guardAggression,
                isRestless: extras.advancedSim.isRestless
            } : null,
            economy: extras.economy ? {
                globalOrderRating: extras.economy.globalOrderRating,
                guardCorruptionRate: extras.economy.guardCorruptionRate,
                corporateSatisfaction: extras.economy.corporateSatisfaction
            } : null,
            evolution: extras.evolution ? {
                exposureCounters: JSON.parse(JSON.stringify(extras.evolution.exposureCounters)),
                zoneLevels: JSON.parse(JSON.stringify(extras.evolution.zoneLevels))
            } : null,
            registries: {
                skills: snapshotRegistry(SkillTreeRegistry),
                titles: snapshotRegistry(MasterTitleRegistry),
                edicts: snapshotRegistry(EdictRegistry)
            },
            restlessInsomnia: !!extras.restlessInsomnia
        };
        localStorage.setItem(this.STORAGE_KEY, btoa(encodeURIComponent(JSON.stringify(data))));
        console.log("💾 Game progress serialized and committed to browser LocalStorage securely.");
    },
    loadGame() {
        const str = localStorage.getItem(this.STORAGE_KEY); if (!str) return null;
        try {
            return JSON.parse(decodeURIComponent(atob(str)));
        } catch (err) {
            console.warn('Failed to load save data:', err);
            return null;
        }
    }
};
