import { EdictRegistry } from './management.js';

export class PrisonEconomyManager {
    constructor(managementEngine) {
        this.management = managementEngine;
        this.globalOrderRating = 100; this.guardCorruptionRate = 5; this.corporateSatisfaction = 80;
    }

    runDailyOrderPhaseAudit() {
        let subversionTotal = 0;
        Object.keys(this.management.sectors).forEach(k => {
            if (this.management.sectors[k].riotLevel > 50) subversionTotal += (this.management.sectors[k].riotLevel - 50);
        });
        this.globalOrderRating = Math.max(0, Math.min(100, this.globalOrderRating - Math.floor(subversionTotal * 0.15)));
        this.guardCorruptionRate = this.globalOrderRating < 60 ? Math.min(90, this.guardCorruptionRate + 6) : Math.max(5, this.guardCorruptionRate - 2);
        
        let baseSubsidy = 400;
        if (this.globalOrderRating > 80) baseSubsidy += 100;
        if (this.globalOrderRating < 40) baseSubsidy -= 200;
        
        const salaries = 120 + Math.floor(this.guardCorruptionRate * 2);
        this.management.treasury = Math.max(0, this.management.treasury + baseSubsidy - salaries);
        return { subsidyReceived: baseSubsidy, maintenanceDeducted: salaries, currentOrder: this.globalOrderRating, corruptionIndex: this.guardCorruptionRate };
    }
}
