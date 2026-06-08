export const BodyZones = { MOUTH: "mouth", BREAST: "breast", GROIN: "groin", HANDS: "hands" };

export class CharacterState {
    constructor() {
        this.baseStats = {
            energy: 100, maxEnergy: 100,
            willpower: 100, maxWillpower: 100,
            pleasure: 0, maxPleasure: 100,
            clothingDurability: 100, pleasureGain: 1.0, damageResistance: 0.0
        };
        this.sensitivities = { [BodyZones.MOUTH]: 1.0, [BodyZones.BREAST]: 1.0, [BodyZones.GROIN]: 1.0, [BodyZones.HANDS]: 1.0 };
        this.activePassives = { "exposed_shame": 0, "trauma_exhaustion": 0 };
        this.occupiedZones = { [BodyZones.MOUTH]: null, [BodyZones.BREAST]: null, [BodyZones.GROIN]: null, [BodyZones.HANDS]: null };
        this.stance = "STANDING"; // STANDING, DEFENSIVE, SUPPRESSED, DOWNED
    }

    getEffectiveStat(statName) {
        let val = this.baseStats[statName];
        if (val === undefined) return 0;
        return Math.max(0, val);
    }

    getZoneSensitivity(zoneName) {
        return Math.max(0.1, this.sensitivities[zoneName] || 1.0);
    }

    takeClothingDamage(amount) {
        // Handled through specialized layer stripping module downstream
    }

    reduceWillpower(amount) {
        const res = this.getEffectiveStat("damageResistance");
        const net = Math.max(1, amount * (1 - res));
        this.baseStats.willpower = Math.max(0, this.baseStats.willpower - net);
        this.evaluateSystemStatus();
    }

    receivePleasureStimulation(zoneName, rawAmount) {
        const sens = this.getZoneSensitivity(zoneName);
        const gainMod = this.baseStats.pleasureGain;
        this.baseStats.pleasure = Math.min(this.getEffectiveStat("maxPleasure"), this.baseStats.pleasure + (rawAmount * sens * gainMod));
        this.evaluateSystemStatus();
    }

    evaluateSystemStatus() {
        if (this.baseStats.willpower <= 0 || this.baseStats.pleasure >= this.getEffectiveStat("maxPleasure")) {
            this.stance = "DOWNED";
        } else if (Object.values(this.occupiedZones).some(z => z !== null)) {
            this.stance = "SUPPRESSED";
        } else {
            this.stance = "STANDING";
        }
    }

    createSerializationPayload() {
        return {
            stance: this.stance, willpower: this.baseStats.willpower, maxWillpower: this.getEffectiveStat("maxWillpower"),
            pleasure: this.baseStats.pleasure, maxPleasure: this.getEffectiveStat("maxPleasure"),
            clothingDurability: this.baseStats.clothingDurability, occupiedZones: { ...this.occupiedZones }
        };
    }
}
