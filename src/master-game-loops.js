export const DEFAULT_MASTER_TITLE_REGISTRY = {
    SUBVERTED_IDOL: {
        unlocked: false,
        name: "Subverted Idol",
        description: "A replay marker for the first major encounter."
    },
    MIDNIGHT_BREACH: {
        unlocked: false,
        name: "Midnight Breach",
        description: "Unlocks when the quarters defense loop is cleared."
    }
};

export const MasterTitleRegistry = JSON.parse(JSON.stringify(DEFAULT_MASTER_TITLE_REGISTRY));

export function resetMasterTitleRegistry() {
    const fresh = JSON.parse(JSON.stringify(DEFAULT_MASTER_TITLE_REGISTRY));
    Object.keys(MasterTitleRegistry).forEach(key => delete MasterTitleRegistry[key]);
    Object.assign(MasterTitleRegistry, fresh);
    return MasterTitleRegistry;
}

export class MasterGameLoopManager {
    constructor(playerState, managementEngine) {
        this.player = playerState;
        this.management = managementEngine;
        this.stressIndex = 0;
        this.fatigueIndex = 0;
        this.factions = {
            THUG: { name: "Prison Thugs", respect: 50, desire: 10, fear: 40 },
            GOBLIN: { name: "Vile Goblins", respect: 10, desire: 50, fear: 20 }
        };
        this.milestoneRecords = { flawlessBattories: 0, uniformStrippings: 0 };
    }

    accumulateProlongedStress(wpLost, plGained) {
        this.stressIndex = Math.min(100, this.stressIndex + (wpLost * 0.04) + (plGained * 0.02));
        this.fatigueIndex = Math.min(60, this.fatigueIndex + 10);
    }

    applyCappedEnergyCeiling(baseMax) {
        const factor = (this.stressIndex / 10) * 0.05;
        return Math.max(25, Math.floor(baseMax * (1 - factor)) - this.fatigueIndex);
    }

    executeQuartersSleepCycle() {
        this.stressIndex = Math.max(0, this.stressIndex - 45);
        this.fatigueIndex = 0;
    }

    recordFactionInteraction(tag, type) {
        const fac = this.factions[tag];
        if (!fac) return;
        if (type === "STRIKE") { fac.fear += 5; fac.respect += 2; }
        if (type === "EXPLOIT") { fac.desire += 8; fac.fear -= 4; }
    }

    registerMilestone(id) {
        if (MasterTitleRegistry[id]) {
            MasterTitleRegistry[id].unlocked = true;
        }
    }
}
