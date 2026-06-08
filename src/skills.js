import { BodyZones } from './state.js';

export const CombatSkills = {
    PRESSURE_STRIKE: {
        name: "Pressure Strike",
        execute(player, enemy) {
            if (!enemy) {
                return { log: "No enemy is in range." };
            }

            enemy.hp = Math.max(0, enemy.hp - 40);
            player.baseStats.energy = Math.max(0, player.baseStats.energy - 8);

            return { log: `You drive a sharp strike into ${enemy.profile.name}.` };
        }
    },
    FOCUS_BREATHE: {
        name: "Focus Breathe",
        execute(player) {
            player.baseStats.energy = Math.max(0, player.baseStats.energy - 6);
            player.baseStats.willpower = Math.min(player.getEffectiveStat('maxWillpower'), player.baseStats.willpower + 20);
            return { log: "You center your breathing and recover resolve." };
        }
    },
    SHIELD_UP: {
        name: "Shield Up",
        execute(player) {
            player.baseStats.damageResistance = Math.min(0.4, (player.baseStats.damageResistance || 0) + 0.10);
            player.baseStats.energy = Math.max(0, player.baseStats.energy - 4);
            return { log: "You brace your stance and harden your guard." };
        }
    },
    PRECISION_LOCK: {
        name: "Precision Lock",
        execute(player, enemy) {
            if (!enemy) {
                return { log: "No target available." };
            }

            enemy.hp = Math.max(0, enemy.hp - 24);
            player.receivePleasureStimulation(BodyZones.HANDS, 6);
            return { log: `You pin ${enemy.profile.name} in place and force an opening.` };
        }
    }
};
