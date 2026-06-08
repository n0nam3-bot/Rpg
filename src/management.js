export const DEFAULT_EDICT_REGISTRY = {
    "hire_guards_v1": { name: "Standard Guard Recruitment", cost: 400, unlocked: true, purchased: false, effects: { dailyIncome: -50, baseRiotEscalation: -4 }, description: "Recruit additional baseline field guards." },
    "lewd_uniforms": { name: "Enforce Regulation Attire", cost: 600, unlocked: true, purchased: false, effects: { dailyIncome: 150, baseRiotEscalation: 8, pleasureGain: 0.15 }, description: "Enforce micro-uniform layers. Drastically cuts armor thresholds but triggers corporate bonuses." },
    "quarters_deadbolts": { name: "Reinforced Quarters Deadbolts", cost: 350, unlocked: true, purchased: false, effects: { ambushRiskReduction: 0.60 }, description: "Mount high-grade hydraulic slide bolts on the Warden room frame." },
    "quarters_turret_grid": { name: "Automated Bedroom Turret Grid", cost: 800, unlocked: false, purchased: false, effects: { ambushRiskReduction: 1.00, dailyIncome: -25 }, description: "Mount non-lethal automated defense turrets inside the bedroom ceiling grid." }
};

export const EdictRegistry = JSON.parse(JSON.stringify(DEFAULT_EDICT_REGISTRY));

export function resetEdictRegistry() {
    const fresh = JSON.parse(JSON.stringify(DEFAULT_EDICT_REGISTRY));
    Object.keys(EdictRegistry).forEach(key => delete EdictRegistry[key]);
    Object.assign(EdictRegistry, fresh);
    return EdictRegistry;
}

const DAY_PHASES = ['Morning', 'Shift', 'Evening', 'Night'];

export class ManagementEngine {
    constructor(globalState) {
        this.globalState = globalState;
        this.treasury = 1000;
        this.currentDay = 1;
        this.timeBlock = DAY_PHASES[0];
        this.sectors = {
            "cellblock_a": { name: "Cellblock A (Minimum)", riotLevel: 25 },
            "solitary":    { name: "Solitary Isolation", riotLevel: 10 },
            "courtyard":   { name: "Prison Courtyard (Maximum)", riotLevel: 45 }
        };
    }

    getDayPhase() {
        return this.timeBlock || DAY_PHASES[(Math.max(1, this.currentDay) - 1) % DAY_PHASES.length];
    }

    setTimeBlock(timeBlock = 'Morning') {
        if (DAY_PHASES.includes(timeBlock)) {
            this.timeBlock = timeBlock;
        }
        return this.timeBlock;
    }

    advanceTimeBlock() {
        const idx = DAY_PHASES.indexOf(this.getDayPhase());
        this.timeBlock = DAY_PHASES[(idx + 1) % DAY_PHASES.length];
        return this.timeBlock;
    }

    purchaseEdict(edictId) {
        const edict = EdictRegistry[edictId];
        if (!edict || edict.purchased || this.treasury < edict.cost) return false;
        this.treasury -= edict.cost; edict.purchased = true;
        if (edictId === "quarters_deadbolts") EdictRegistry["quarters_turret_grid"].unlocked = true;
        return true;
    }

    processDayEnd() {
        Object.keys(this.sectors).forEach(key => {
            let growth = 6;
            Object.keys(EdictRegistry).forEach(id => {
                if (EdictRegistry[id].purchased && EdictRegistry[id].effects.baseRiotEscalation) {
                    growth += EdictRegistry[id].effects.baseRiotEscalation;
                }
            });
            this.sectors[key].riotLevel = Math.min(100, Math.max(0, this.sectors[key].riotLevel + growth));
        });
        this.currentDay++;
        this.timeBlock = 'Morning';
    }
}
