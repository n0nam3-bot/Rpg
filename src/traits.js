import { BodyZones } from './state.js';

export class EvolutionEngine {
    constructor(playerState) {
        this.player = playerState;
        this.exposureCounters = { [BodyZones.MOUTH]: 0, [BodyZones.BREAST]: 0, [BodyZones.GROIN]: 0, [BodyZones.HANDS]: 0 };
        this.zoneLevels = { [BodyZones.MOUTH]: 0, [BodyZones.BREAST]: 0, [BodyZones.GROIN]: 0, [BodyZones.HANDS]: 0 };
    }

    logZoneExposure(zoneName, intensity) {
        this.exposureCounters[zoneName] += intensity;
        const currentLvl = this.zoneLevels[zoneName];
        const nextThreshold = (currentLvl + 1) * 50;
        if (this.exposureCounters[zoneName] >= nextThreshold) {
            this.zoneLevels[zoneName]++;
            console.log(`[Evolution Engine] ${zoneName.toUpperCase()} advanced to Tier ${this.zoneLevels[zoneName]}!`);
            this.player.baseStats.maxWillpower = Math.max(30, this.player.baseStats.maxWillpower - 5);
        }
    }
}
