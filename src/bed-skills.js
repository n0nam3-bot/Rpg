export const BedSkills = {
    SHOUT: { name: "Trigger Bedroom Siren", execute(p, enemies) {
        if (Math.random() <= 0.45 && enemies.length > 0) { enemies[0].hp = 0; return { log: "🚨 ALARM TRIPPED: Loyal backup guards breach your room and drag an intruder out!" }; }
        return { log: "The lines are cut! Siren is dead." };
    }},
    BLANKET: { name: "Wrap in Sheets", execute(p) { p.baseStats.damageResistance = 0.60; return { log: "You pull sheets tightly around yourself to buffer incoming holds." }; }},
    LAMP_BASH: { name: "Swing Metal Lamp", execute(p, enemies, target) {
        if (!target) return { log: "Swing into empty shadows." };
        target.hp = Math.max(0, target.hp - 40); target.desire = Math.max(0, target.desire - 30);
        return { log: `💥 CRACK: You smash the desk lamp over the ${target.profile.name}'s face!` };
    }}
};
