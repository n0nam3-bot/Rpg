export const ClothingLayers = { FULL_UNIFORM: 3, DAMAGED_SUIT: 2, UNDERGARMENTS: 1, FULLY_EXPOSED: 0 };

export class OutfitController {
    constructor(playerState) {
        this.player = playerState; this.currentLayerState = ClothingLayers.FULL_UNIFORM;
    }

    damageLayer(damagePercent) {
        if (this.currentLayerState === ClothingLayers.FULLY_EXPOSED) return;
        this.player.baseStats.clothingDurability = Math.max(0, this.player.baseStats.clothingDurability - damagePercent);
        if (this.player.baseStats.clothingDurability <= 0) {
            this.currentLayerState--;
            if (this.currentLayerState > ClothingLayers.FULLY_EXPOSED) {
                this.player.baseStats.clothingDurability = 100;
            } else {
                this.player.activePassives["exposed_state"] = 1;
            }
            this.applyLayerStatPenalties();
        }
    }

    applyLayerStatPenalties() {
        switch (this.currentLayerState) {
            case ClothingLayers.DAMAGED_SUIT:
                this.player.baseStats.damageResistance = -0.10; this.player.sensitivities["breast"] += 0.20; break;
            case ClothingLayers.UNDERGARMENTS:
                this.player.baseStats.damageResistance = -0.25; this.player.sensitivities["breast"] += 0.50; this.player.sensitivities["groin"] += 0.50; break;
            case ClothingLayers.FULLY_EXPOSED:
                this.player.baseStats.damageResistance = -0.50; this.player.sensitivities["mouth"] += 0.50; this.player.sensitivities["breast"] += 1.00; this.player.sensitivities["groin"] += 1.00; break;
        }
    }
}
