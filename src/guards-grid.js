/**
 * SYLPHIETTE SECURITY SUB-SYSTEM
 * Handles hire mechanics, wage structures, and tactical deployment metrics.
 */

export class GuardGridController {
    constructor(managementEngine) {
        this.management = managementEngine;
        this.totalGuardsHired = 5;
        this.guardDailyWageRate = 12; 

        // Map allocation grids
        this.deploymentGrid = {
            "cellblock_a": 2,
            "solitary": 1,
            "courtyard": 2
        };
    }

    recruitGuardUnit() {
        if (this.management.treasury < 150) return false; 
        this.management.treasury -= 150;
        this.totalGuardsHired++;
        return true;
    }

    allocateGuardToSector(sectorKey, amount) {
        const currentAssigned = Object.values(this.deploymentGrid).reduce((a, b) => a + b, 0);
        const freeGuards = this.totalGuardsHired - currentAssigned;

        if (amount > 0 && freeGuards >= amount) {
            this.deploymentGrid[sectorKey] += amount;
            return true;
        } else if (amount < 0 && this.deploymentGrid[sectorKey] >= Math.abs(amount)) {
            this.deploymentGrid[sectorKey] += amount;
            return true;
        }
        return false;
    }

    computeSuppressionAdjustments() {
        Object.keys(this.management.sectors).forEach(key => {
            const sector = this.management.sectors[key];
            const activeGuards = this.deploymentGrid[key] || 0;
            
            // Each guard lowers localized riot growth points by 8 units per day phase
            const suppressionPower = activeGuards * 8;
            sector.riotLevel = Math.max(0, sector.riotLevel - suppressionPower);
        });

        return this.totalGuardsHired * this.guardDailyWageRate;
    }
}
