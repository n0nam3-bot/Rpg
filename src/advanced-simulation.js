import { BodyZones } from './state.js';

export class AdvancedSimulationEngine {
    constructor(playerState, managementEngine) {
        this.player = playerState; this.management = managementEngine;
        this.isWet = false; this.arousalCounter = 0;
        this.guardAggression = 0; this.isRestless = false;
    }

    updateTurnArousalCheck(currentPleasure) {
        if (currentPleasure > 35) this.arousalCounter += 15;
        if (this.arousalCounter >= 50 && !this.isWet) {
            this.isWet = true;
            console.log("[Simulation] Threshold reached: advanced encounters are now available.");
        }
    }

    processPenetrationImpact(zone) {
        if (zone === BodyZones.GROIN && !this.isWet) {
            this.player.reduceWillpower(30);
            return { allowable: true, message: "Hard impact rips away 30 Willpower!" };
        }
        if (zone === BodyZones.GROIN && this.isWet) {
            this.player.receivePleasureStimulation(zone, 40);
            return { allowable: true, message: "Contact remains locked in and pressure rises." };
        }
        return { allowable: true, message: "Contact logged." };
    }

    evaluateBedtimeComposure() {
        this.isRestless = (this.player.baseStats.pleasure >= 40);
        return this.isRestless;
    }

    executeDesireVentingSession() {
        this.isRestless = false; this.player.baseStats.pleasure = 0;
        Object.keys(this.player.sensitivities).forEach(z => { this.player.sensitivities[z] += 0.15; });
    }

    executeTacticalRetreat(fatigueEngineInstance) {
        if (fatigueEngineInstance.fatigueIndex >= 40) return { success: false, log: "❌ ESCAPE LOCKED: You are too exhausted to run!" };
        this.player.baseStats.energy = Math.max(5, this.player.baseStats.energy - 35);
        this.player.stance = "STANDING";
        return { success: true, log: "🏃‍♂️ RETREAT SUCCESSFUL: You slip past the crowd and escape back to safety!" };
    }
}
