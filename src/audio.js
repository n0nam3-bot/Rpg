/**
 * SYLPHIETTE AUDIO MANAGEMENT ENGINE
 * Handles cross-platform web audio unlock parameters, ambient layers, and impact SFX.
 */

export class AudioManager {
    constructor(scene) {
        this.scene = scene;
        this.sound = scene.sound;
        this.isMuted = false;
    }

    /**
     * Preloads core utility audio assets safely into the scene pipeline
     */
    static preloadAssets(scene) {
        try {
            scene.load.audio('bgm_management', 'assets/audio/bgm_hub.mp3');
            scene.load.audio('bgm_combat', 'assets/audio/bgm_battle.mp3');
            scene.load.audio('bgm_defeat', 'assets/audio/bgm_downed.mp3');
            
            scene.load.audio('sfx_hit', 'assets/audio/sfx_strike.mp3');
            scene.load.audio('sfx_grab', 'assets/audio/sfx_restrain.mp3');
            scene.load.audio('sfx_clotheshred', 'assets/audio/sfx_tear.mp3');
        } catch(e) {
            console.log("Audio resource pathways initialized as silent local structures.");
        }
    }

    /**
     * Mobile Safety Context Unlock Hook
     */
    unlockAudioContext() {
        if (this.sound && this.sound.locked) {
            this.sound.once('unlocked', () => {
                console.log("🔊 [Audio Engine] Mobile web browser safety context unlatched successfully.");
            });
        }
    }

    /**
     * Loop Score Audio Mix Swapper
     */
    playBackgroundMusic(trackKey) {
        if (!this.sound) return;
        if (this.currentBGM && this.currentBGM.key === trackKey) return;

        if (this.currentBGM) {
            const oldTrack = this.currentBGM;
            this.scene.tweens.add({
                targets: oldTrack,
                volume: 0,
                duration: 400,
                onComplete: () => { try { oldTrack.stop(); } catch(err){} }
            });
        }

        try {
            this.currentBGM = this.sound.add(trackKey, { loop: true, volume: 0 });
            this.currentBGM.play();
            
            this.scene.tweens.add({
                targets: this.currentBGM,
                volume: 0.4,
                duration: 400
            });
        } catch (e) {
            console.log(`[Audio Engine] Muted Track Loop: ${trackKey} file absent. Simulating silent track profile.`);
        }
    }

    /**
     * One Shot Impact Audio Clip Clapper
     */
    playOneShotEffect(sfxKey) {
        if (!this.sound) return;
        try {
            // Guard execution pass checks to ensure code stability if asset key maps are empty
            const effect = this.sound.add(sfxKey, { volume: 0.5 });
            effect.play();
        } catch (e) {
            // Systemic silent failover block
            console.log(`[Audio Guard] Silent playback override active for: ${sfxKey}`);
        }
    }
}
