/**
 * SYLPHIETTE PLAYER UPGRADE TREE
 * Manages Ability Point (AP) accounting, node validation, and stat upgrades.
 */

export const DEFAULT_SKILL_TREE_REGISTRY = {
    "counter_strike": {
        name: "Riposte Stance",
        costAP: 2,
        unlocked: false,
        prereq: [],
        description: "Enables an in-combat skill to counter-attack enemies when successfully parrying."
    },
    "willpower_focus": {
        name: "Meditation Breathe",
        costAP: 3,
        unlocked: false,
        prereq: [],
        description: "Enables an in-combat skill to sacrifice Energy to restore 25 Willpower points."
    },
    "tempered_flesh": {
        name: "Tempered Resolve",
        costAP: 4,
        unlocked: false,
        prereq: ["willpower_focus"],
        description: "Permanent Passive: Cuts all baseline Pleasure damage accumulation rates by 15%."
    }
};

export const SkillTreeRegistry = JSON.parse(JSON.stringify(DEFAULT_SKILL_TREE_REGISTRY));

export function resetSkillTreeRegistry() {
    const fresh = JSON.parse(JSON.stringify(DEFAULT_SKILL_TREE_REGISTRY));
    Object.keys(SkillTreeRegistry).forEach(key => delete SkillTreeRegistry[key]);
    Object.assign(SkillTreeRegistry, fresh);
    return SkillTreeRegistry;
}

export class SkillTreeManager {
    constructor(playerState) {
        this.player = playerState;
        this.availableAP = 5; 
    }

    /**
     * Executes path expansion checks
     */
    purchaseSkillNode(skillId) {
        const node = SkillTreeRegistry[skillId];
        if (!node || node.unlocked || this.availableAP < node.costAP) return false;

        // Verify prereq pathing is completely cleared first
        const prereqsCleared = node.prereq.every(pId => SkillTreeRegistry[pId] && SkillTreeRegistry[pId].unlocked);
        if (!prereqsCleared) return false;

        this.availableAP -= node.costAP;
        node.unlocked = true;

        if (skillId === "tempered_flesh") {
            this.player.baseStats.pleasureGain = Math.max(0.5, (this.player.baseStats.pleasureGain || 1.0) - 0.15);
        }

        console.log(`✨ [Skill Tree] Unlocked perk: ${node.name}`);
        return true;
    }
}
