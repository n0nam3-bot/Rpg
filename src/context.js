import { CharacterState } from './state.js';
import { ManagementEngine, resetEdictRegistry } from './management.js';
import { SkillTreeManager, resetSkillTreeRegistry } from './skills-tree.js';
import { EvolutionEngine } from './traits.js';
import { MasterGameLoopManager, resetMasterTitleRegistry } from './master-game-loops.js';
import { AdvancedSimulationEngine } from './advanced-simulation.js';
import { PrisonEconomyManager } from './economy.js';
import { SkillTreeRegistry } from './skills-tree.js';
import { MasterTitleRegistry } from './master-game-loops.js';
import { EdictRegistry } from './management.js';

function restoreRegistrySnapshot(registry, snapshot) {
    if (!snapshot || typeof snapshot !== 'object') return;
    Object.keys(registry).forEach(key => {
        if (snapshot[key] && typeof snapshot[key] === 'object') {
            Object.assign(registry[key], snapshot[key]);
        }
    });
}

export function revivePlayerState(source = null) {
    const player = new CharacterState();

    if (!source || typeof source !== 'object') {
        return player;
    }

    if (source.baseStats && typeof source.baseStats === 'object') {
        player.baseStats = { ...player.baseStats, ...source.baseStats };
    }

    if (source.sensitivities && typeof source.sensitivities === 'object') {
        player.sensitivities = { ...player.sensitivities, ...source.sensitivities };
    }

    if (source.activePassives && typeof source.activePassives === 'object') {
        player.activePassives = { ...player.activePassives, ...source.activePassives };
    }

    if (source.occupiedZones && typeof source.occupiedZones === 'object') {
        player.occupiedZones = { ...player.occupiedZones, ...source.occupiedZones };
    }

    if (typeof source.stance === 'string') {
        player.stance = source.stance;
    }

    return player;
}

export function buildGameContext(data = {}) {
    if (data.isNewGame) {
        resetSkillTreeRegistry();
        resetMasterTitleRegistry();
        resetEdictRegistry();
    }

    const globalState = data.globalState && typeof data.globalState === 'object' ? data.globalState : {};

    globalState.player = revivePlayerState(data.player || globalState.player);

    const management = data.management instanceof ManagementEngine
        ? data.management
        : (globalState.management instanceof ManagementEngine
            ? globalState.management
            : new ManagementEngine(globalState));

    if (typeof data.management?.timeBlock === 'string') {
        management.timeBlock = data.management.timeBlock;
    }

    const skillsTree = data.skillsTree instanceof SkillTreeManager
        ? data.skillsTree
        : (globalState.skillsTree instanceof SkillTreeManager
            ? globalState.skillsTree
            : new SkillTreeManager(globalState.player));

    const evolution = data.evolution instanceof EvolutionEngine
        ? data.evolution
        : (globalState.evolution instanceof EvolutionEngine
            ? globalState.evolution
            : new EvolutionEngine(globalState.player));

    const loops = data.loops instanceof MasterGameLoopManager
        ? data.loops
        : (globalState.loops instanceof MasterGameLoopManager
            ? globalState.loops
            : new MasterGameLoopManager(globalState.player, management));

    const advancedSim = data.advancedSim instanceof AdvancedSimulationEngine
        ? data.advancedSim
        : (globalState.advancedSim instanceof AdvancedSimulationEngine
            ? globalState.advancedSim
            : new AdvancedSimulationEngine(globalState.player, management));

    const economy = data.economy instanceof PrisonEconomyManager
        ? data.economy
        : (globalState.economy instanceof PrisonEconomyManager
            ? globalState.economy
            : new PrisonEconomyManager(management));

    globalState.management = management;
    globalState.skillsTree = skillsTree;
    globalState.evolution = evolution;
    globalState.loops = loops;
    globalState.advancedSim = advancedSim;
    globalState.economy = economy;
    globalState.restlessInsomnia = !!globalState.restlessInsomnia;

    return { globalState, management, skillsTree, evolution, loops, advancedSim, economy };
}

export function hydrateContextFromSave(saved = null) {
    const ctx = buildGameContext({ isNewGame: true });
    if (!saved || typeof saved !== 'object') return ctx;

    if (saved.player) {
        ctx.globalState.player = revivePlayerState(saved.player);
    }

    if (saved.management && typeof saved.management === 'object') {
        if (typeof saved.management.treasury === 'number') ctx.management.treasury = saved.management.treasury;
        if (typeof saved.management.currentDay === 'number') ctx.management.currentDay = saved.management.currentDay;
        if (typeof saved.management.timeBlock === 'string') ctx.management.timeBlock = saved.management.timeBlock;
        if (saved.management.sectors && typeof saved.management.sectors === 'object') {
            ctx.management.sectors = JSON.parse(JSON.stringify(saved.management.sectors));
        }
    }

    if (saved.skillsTree && typeof saved.skillsTree === 'object' && typeof saved.skillsTree.availableAP === 'number') {
        ctx.skillsTree.availableAP = saved.skillsTree.availableAP;
    }

    if (saved.evolution && typeof saved.evolution === 'object') {
        if (saved.evolution.exposureCounters) {
            ctx.evolution.exposureCounters = { ...ctx.evolution.exposureCounters, ...saved.evolution.exposureCounters };
        }
        if (saved.evolution.zoneLevels) {
            ctx.evolution.zoneLevels = { ...ctx.evolution.zoneLevels, ...saved.evolution.zoneLevels };
        }
    }

    if (saved.loops && typeof saved.loops === 'object') {
        if (typeof saved.loops.stressIndex === 'number') ctx.loops.stressIndex = saved.loops.stressIndex;
        if (typeof saved.loops.fatigueIndex === 'number') ctx.loops.fatigueIndex = saved.loops.fatigueIndex;
        if (saved.loops.factions) ctx.loops.factions = JSON.parse(JSON.stringify(saved.loops.factions));
        if (saved.loops.milestoneRecords) ctx.loops.milestoneRecords = JSON.parse(JSON.stringify(saved.loops.milestoneRecords));
    }

    if (saved.advancedSim && typeof saved.advancedSim === 'object') {
        if (typeof saved.advancedSim.isWet === 'boolean') ctx.advancedSim.isWet = saved.advancedSim.isWet;
        if (typeof saved.advancedSim.arousalCounter === 'number') ctx.advancedSim.arousalCounter = saved.advancedSim.arousalCounter;
        if (typeof saved.advancedSim.guardAggression === 'number') ctx.advancedSim.guardAggression = saved.advancedSim.guardAggression;
        if (typeof saved.advancedSim.isRestless === 'boolean') ctx.advancedSim.isRestless = saved.advancedSim.isRestless;
    }

    if (saved.economy && typeof saved.economy === 'object') {
        if (typeof saved.economy.globalOrderRating === 'number') ctx.economy.globalOrderRating = saved.economy.globalOrderRating;
        if (typeof saved.economy.guardCorruptionRate === 'number') ctx.economy.guardCorruptionRate = saved.economy.guardCorruptionRate;
        if (typeof saved.economy.corporateSatisfaction === 'number') ctx.economy.corporateSatisfaction = saved.economy.corporateSatisfaction;
    }

    if (saved.registries && typeof saved.registries === 'object') {
        restoreRegistrySnapshot(SkillTreeRegistry, saved.registries.skills);
        restoreRegistrySnapshot(MasterTitleRegistry, saved.registries.titles);
        restoreRegistrySnapshot(EdictRegistry, saved.registries.edicts);
    }

    ctx.globalState.player = revivePlayerState(saved.player || ctx.globalState.player);
    ctx.globalState.management = ctx.management;
    ctx.globalState.skillsTree = ctx.skillsTree;
    ctx.globalState.evolution = ctx.evolution;
    ctx.globalState.loops = ctx.loops;
    ctx.globalState.advancedSim = ctx.advancedSim;
    ctx.globalState.economy = ctx.economy;
    ctx.globalState.restlessInsomnia = !!saved.restlessInsomnia;

    return ctx;
}
