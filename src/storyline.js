/**
 * SYLPHIETTE BRANCHING STORY TRANSLATIONS
 * Manages story triggers and evaluation blocks for dialogue trees.
 */
import { MasterTitleRegistry } from './master-game-loops.js';

export const DialogueTrees = {
    "ACT_1_INTRO_GUARD": {
        title: "The Handover Meeting",
        prompt: "Marcus hands you the ledger. 'The inmates are rowdy in Cellblock A, ma'am. Do we enforce absolute lock-discipline, or take a softer, profitable approach to keep them quiet?'",
        choices: [
            {
                text: "📋 'Enforce absolute lockdown. No compromises.'",
                requirements: (state) => true,
                execute(state, hub) {
                    hub.management.sectors["cellblock_a"].riotLevel = Math.max(0, hub.management.sectors["cellblock_a"].riotLevel - 15);
                    return "You establish absolute order. Cellblock A riot metrics decline immediately.";
                }
            },
            {
                text: "💰 'Let them have their bar. We will skim the tips.'",
                requirements: (state) => true,
                execute(state, hub) {
                    hub.management.treasury += 400;
                    hub.economy.guardCorruptionRate += 10;
                    return "You pocket a heavy corporate kickback. Guard corruption increases.";
                }
            }
        ]
    }
};

export class StorylineManager {
    constructor(globalState, hubScene) {
        this.state = globalState;
        this.hub = hubScene;
        this.completedEvents = [];
    }

    evaluateStoryTrigger(currentDay) {
        if (currentDay === 1 && !this.completedEvents.includes("ACT_1_INTRO_GUARD")) {
            return "ACT_1_INTRO_GUARD";
        }
        return null;
    }
}
