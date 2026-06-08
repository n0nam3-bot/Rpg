export class PoseRouter {
    constructor(scene) { this.scene = scene; }

    synchronizePoseAndExpression(armature, snapshot, progression) {
        if (!armature || !armature.armature) return;
        const pleasurePct = snapshot.pleasure / snapshot.maxPleasure;
        const anim = armature.animation;

        // Swapping Texture Frames programmatically inside DragonBones slots
        const eyes = armature.armature.getSlot("slot_face_eyes");
        const mouth = armature.armature.getSlot("slot_face_mouth");
        const blush = armature.armature.getSlot("slot_face_blush");

        if (eyes) eyes.displayIndex = snapshot.stance === "DOWNED" || pleasurePct >= 0.7 ? 2 : (snapshot.stance === "SUPPRESSED" ? 1 : 0);
        if (mouth) mouth.displayIndex = snapshot.occupiedZones["mouth"] !== null ? 2 : (pleasurePct >= 0.5 ? 1 : 0);
        if (blush) blush.displayIndex = pleasurePct > 0.1 ? Math.min(3, Math.floor(pleasurePct * 4)) : -1;

        // Animate skeletal tracks
        if (progression && progression.climaxState === "SPASM") { anim.play("orgasm_climax_spasm_loop", 0); return; }
        if (snapshot.stance === "DOWNED") { anim.play("defeat_floor_base_loop", 0); return; }
        if (snapshot.stance === "SUPPRESSED") { anim.play("position_double_gang_hold", 0); return; }
        anim.play(snapshot.stance === "DEFENSIVE" ? "guard_braced_stance" : "idle_standing", 0);
    }
}
