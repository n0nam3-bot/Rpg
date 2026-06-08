import { BodyZones, CharacterState } from './state.js';
import { EnemyAIController } from './ai.js';
import { OutfitController } from './clothing.js';
import { AdvancedSimulationEngine } from './advanced-simulation.js';
import { MasterGameLoopManager } from './master-game-loops.js';
import { ManagementEngine } from './management.js';
import { PrisonEconomyManager } from './economy.js';

export class CombatOrchestrator {
    constructor(scene) {
        this.scene = scene;
        this.globalState = scene.globalState || { player: new CharacterState() };
        this.playerData = this.globalState.player instanceof CharacterState ? this.globalState.player : new CharacterState();
        this.globalState.player = this.playerData;

        this.management = scene.management instanceof ManagementEngine
            ? scene.management
            : (this.globalState.management instanceof ManagementEngine ? this.globalState.management : new ManagementEngine(this.globalState));

        this.economy = scene.economy instanceof PrisonEconomyManager
            ? scene.economy
            : (this.globalState.economy instanceof PrisonEconomyManager ? this.globalState.economy : new PrisonEconomyManager(this.management));

        this.masterLoops = scene.loops instanceof MasterGameLoopManager
            ? scene.loops
            : (this.globalState.loops instanceof MasterGameLoopManager ? this.globalState.loops : new MasterGameLoopManager(this.playerData, this.management));

        this.advanced = scene.advancedSim instanceof AdvancedSimulationEngine
            ? scene.advancedSim
            : (this.globalState.advancedSim instanceof AdvancedSimulationEngine ? this.globalState.advancedSim : new AdvancedSimulationEngine(this.playerData, this.management));

        this.outfitController = scene.outfitController instanceof OutfitController
            ? scene.outfitController
            : new OutfitController(this.playerData);

        this.climaxLock = false;
        this.turnIndex = 0;
        this.enemies = this.createEncounter(scene.targetSector || 'cellblock_a', scene.initialEnemies);
    }

    createEncounter(targetSector, prebuiltEnemies = null) {
        if (Array.isArray(prebuiltEnemies) && prebuiltEnemies.length) {
            return prebuiltEnemies;
        }

        const sector = String(targetSector || '').toLowerCase();
        const roster = sector.includes('quarters')
            ? ['THUG', 'ORC']
            : sector.includes('courtyard')
                ? ['THUG', 'GOBLIN', 'THUG']
                : ['THUG', 'GOBLIN'];

        const startX = sector.includes('quarters') ? 760 : sector.includes('courtyard') ? 940 : 900;
        const startY = sector.includes('quarters') ? 440 : 500;

        return roster.map((type, index) => {
            const enemy = new EnemyAIController(`${type.toLowerCase()}_${index + 1}`, type);
            enemy.position = { x: startX + (index * 125), y: startY + ((index % 2) * 36) };
            return enemy;
        });
    }

    getAliveEnemies() {
        return this.enemies.filter(enemy => enemy && enemy.hp > 0);
    }

    getNearestEnemyTo(point, maxDistance = 240) {
        const originX = point?.x ?? 0;
        const originY = point?.y ?? 0;
        let chosen = null;
        let bestDistance = maxDistance;

        this.getAliveEnemies().forEach(enemy => {
            const pos = enemy.position || { x: 900, y: 500 };
            const distance = Math.hypot(pos.x - originX, pos.y - originY);
            if (distance <= bestDistance) {
                bestDistance = distance;
                chosen = enemy;
            }
        });

        return chosen;
    }

    getSnapshot() {
        return this.playerData.createSerializationPayload
            ? this.playerData.createSerializationPayload()
            : { ...this.playerData };
    }

    applyDamagePacket(action, enemy = null) {
        const targetZone = action.targetZone || BodyZones.GROIN;

        if (action.subTarget === 'CLOTHING') {
            this.outfitController.damageLayer(15);
        }

        if (action.subTarget === 'WILLPOWER' || action.rawDamage) {
            const damage = action.rawDamage || 20;
            this.playerData.reduceWillpower(damage);
            this.masterLoops.accumulateProlongedStress(damage, 0);
        }

        if (action.rawPleasureDamage) {
            const pleasure = action.rawPleasureDamage;
            this.playerData.receivePleasureStimulation(targetZone, pleasure);
            this.masterLoops.accumulateProlongedStress(0, pleasure);
        }

        if (action.actionType === 'GRAB_SUCCESS' && action.targetZone) {
            this.playerData.occupiedZones[action.targetZone] = enemy ? enemy.id : 'enemy';
            this.playerData.receivePleasureStimulation(action.targetZone, 5);
        }

        if (action.actionType === 'EXPLOIT_TICK') {
            this.playerData.receivePleasureStimulation(targetZone, action.rawPleasureDamage || 25);
            this.playerData.reduceWillpower(action.rawDamage || 10);
        }

        if (enemy && enemy.type) {
            const relationType = action.actionType === 'GRAB_SUCCESS' || action.actionType === 'EXPLOIT_TICK' ? 'EXPLOIT' : 'STRIKE';
            this.masterLoops.recordFactionInteraction(enemy.type, relationType);
        }

        const cappedEnergy = this.masterLoops.applyCappedEnergyCeiling(this.playerData.getEffectiveStat('maxEnergy'));
        this.playerData.baseStats.maxEnergy = cappedEnergy;
        this.playerData.baseStats.energy = Math.min(this.playerData.baseStats.energy, cappedEnergy);
    }

    triggerDynamicClimaxIntercept() {
        if (this.climaxLock) return;
        this.climaxLock = true;

        if (this.scene?.cameras?.main) {
            this.scene.cameras.main.shake(180, 0.012);
            this.scene.cameras.main.flash(160, 255, 255, 255, false);
        }

        const stats = this.playerData.baseStats;
        stats.maxWillpower = Math.max(20, this.playerData.getEffectiveStat('maxWillpower') - 10);
        stats.pleasure = 0;
        stats.energy = Math.max(5, stats.energy - 15);
        stats.baseDesireMinimum = Math.max(stats.baseDesireMinimum || 0, 10);
        this.playerData.activePassives.post_climax_lethargy = 1;
        this.playerData.evaluateSystemStatus();

        setTimeout(() => {
            this.climaxLock = false;
        }, 400);
    }

    resolveTurnFeedback() {
        const alive = this.getAliveEnemies();
        if (!alive.length) {
            this.finalizeEncounter(true);
            return;
        }

        if (this.playerData.stance === 'DOWNED' || this.playerData.baseStats.willpower <= 0) {
            this.finalizeEncounter(false);
            return;
        }

        if (this.playerData.baseStats.pleasure >= this.playerData.getEffectiveStat('maxPleasure')) {
            this.triggerDynamicClimaxIntercept();
            return;
        }
    }

    advanceEnemyPressure(referencePoint) {
        const originX = referencePoint?.x ?? 0;
        const originY = referencePoint?.y ?? 0;

        this.getAliveEnemies().forEach(enemy => {
            if (!enemy.position) return;
            const dx = originX - enemy.position.x;
            const dy = originY - enemy.position.y;
            const distance = Math.max(1, Math.hypot(dx, dy));
            const step = enemy.aiState === 'GRABBING' ? 2 : 5;
            enemy.position.x += (dx / distance) * step;
            enemy.position.y += (dy / distance) * step;
        });
    }

    executeTurnSequence(referencePoint = null) {
        if (this.climaxLock) return;

        this.turnIndex += 1;
        const snapshot = this.getSnapshot();
        const aliveEnemies = this.getAliveEnemies();

        if (!aliveEnemies.length) {
            this.finalizeEncounter(true);
            return;
        }

        let willpowerLoss = 0;
        let pleasureGain = 0;

        aliveEnemies.forEach(enemy => {
            const action = enemy.evaluateNextAction(snapshot);
            this.applyDamagePacket(action, enemy);
            if (action.rawDamage) willpowerLoss += action.rawDamage;
            if (action.rawPleasureDamage) pleasureGain += action.rawPleasureDamage;
        });

        this.masterLoops.accumulateProlongedStress(willpowerLoss, pleasureGain);
        this.advanceEnemyPressure(referencePoint || { x: 360, y: 450 });

        if (this.playerData.baseStats.pleasure >= this.playerData.getEffectiveStat('maxPleasure')) {
            this.triggerDynamicClimaxIntercept();
        } else if (this.playerData.stance === 'DOWNED' || this.playerData.baseStats.willpower <= 0) {
            this.finalizeEncounter(false);
        }

        this.scene?.combatLogText?.setText?.(
            `Turn ${this.turnIndex}: ${aliveEnemies.length} active threat(s). Energy cap now ${this.playerData.getEffectiveStat('maxEnergy')}.`
        );

        if (typeof this.scene?.refreshActionInterface === 'function') {
            this.scene.refreshActionInterface(this.getSnapshot(), this);
        }
    }

    evaluateBedtimeComposure() {
        return this.advanced.evaluateBedtimeComposure();
    }

    executeDesireVentingSession() {
        this.advanced.executeDesireVentingSession();
        this.playerData.baseStats.energy = Math.min(this.playerData.baseStats.energy + 10, this.playerData.getEffectiveStat('maxEnergy'));
    }

    requestRetreat() {
        return this.advanced.executeTacticalRetreat(this.masterLoops);
    }

    finalizeEncounter(victory) {
        if (victory && typeof this.masterLoops.registerMilestone === 'function') {
            this.masterLoops.registerMilestone('SUBVERTED_IDOL');
        }

        if (this.scene?.scene?.start) {
            const key = victory ? 'PostCombatAccountingScene' : 'EscapeHallScene';
            this.scene.scene.start(key, {
                globalState: this.globalState,
                management: this.management,
                victory,
                report: {
                    physicalHitsTaken: Math.max(0, this.turnIndex - (victory ? 0 : 1)),
                    submissionTicks: this.playerData.baseStats.pleasure >= this.playerData.getEffectiveStat('maxPleasure') ? 1 : 0
                }
            });
        }
    }
}
