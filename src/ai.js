import { BodyZones } from './state.js';

export const EnemyProfiles = {
    THUG: { name: "Prison Thug", aggression: 0.70, lustRate: 15, grabSuccessRate: 0.50, preferredZones: [BodyZones.HANDS, BodyZones.GROIN], desc: "charges forward with brute force!" },
    GOBLIN: { name: "Vile Goblin", aggression: 0.20, lustRate: 25, grabSuccessRate: 0.45, preferredZones: [BodyZones.HANDS, BodyZones.MOUTH], desc: "presses in low and keeps the pressure on!" },
    ORC: { name: "Orc Brute", aggression: 0.90, lustRate: 8, grabSuccessRate: 0.70, preferredZones: [BodyZones.GROIN, BodyZones.HANDS], desc: "slams down with heavy force!" }
};

export class EnemyAIController {
    constructor(id, factionType) {
        this.id = id; this.type = factionType; this.profile = EnemyProfiles[factionType] || EnemyProfiles.THUG;
        this.hp = factionType === "ORC" ? 220 : 100; this.desire = 0;
        this.aiState = "STALKING"; this.activeGrabZone = null;
    }

    evaluateNextAction(playerSnapshot) {
        if (playerSnapshot.stance === "DOWNED") { this.aiState = "EXPLOITING"; return { enemyId: this.id, actionType: "EXPLOIT_TICK", targetZone: this.profile.preferredZones[0], rawPleasureDamage: 25, message: `The ${this.profile.name} keeps pressure on your pinned position!` }; }
        if (this.desire >= 100 || playerSnapshot.clothingDurability <= 40) {
            if (!this.activeGrabZone) {
                const openZone = Object.keys(playerSnapshot.occupiedZones).find(z => playerSnapshot.occupiedZones[z] === null);
                if (openZone) {
                    this.aiState = "GRABBING"; this.activeGrabZone = openZone; this.desire = 0;
                    return { enemyId: this.id, actionType: "GRAB_SUCCESS", targetZone: openZone, message: `The ${this.profile.name} lunges in and locks down your ${openZone}!` };
                }
            }
        }
        this.aiState = "STALKING"; this.desire = Math.min(100, this.desire + this.profile.lustRate);
        return { enemyId: this.id, actionType: "STANDARD_HIT", subTarget: Math.random() > this.profile.aggression ? "CLOTHING" : "WILLPOWER", rawDamage: 20, message: `${this.profile.name} ${this.profile.desc}` };
    }

    forceReleaseRestraint() { this.activeGrabZone = null; this.aiState = "STALKING"; }
}
