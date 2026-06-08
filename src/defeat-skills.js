import { BodyZones } from './state.js';

export const DefeatSkills = {
    ROLL_AWAY: {
        name: "Roll Away",
        execute(player) {
            player.baseStats.energy = Math.max(0, player.baseStats.energy - 6);
            player.stance = "DEFENSIVE";
            return { log: "You roll out of the worst of the pressure and rebuild spacing." };
        }
    },
    BREAK_GRIP: {
        name: "Break Grip",
        execute(player, enemies) {
            const active = Array.isArray(enemies) ? enemies.find(e => e.hp > 0) : null;
            if (active) {
                active.hp = Math.max(0, active.hp - 18);
            }
            player.baseStats.willpower = Math.max(0, player.baseStats.willpower - 8);
            return { log: "You wrench against the hold and create a small opening." };
        }
    },
    SHOUT_FOR_HELP: {
        name: "Shout for Help",
        execute(player) {
            player.receivePleasureStimulation(BodyZones.MOUTH, 2);
            return { log: "You call out for support and keep the scene from collapsing." };
        }
    }
};
