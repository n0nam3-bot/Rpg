/**
 * Side-view combat arena with keyboard-first actions and optional buttons.
 */
import { CombatOrchestrator } from './scene-combat-linker.js';
import { CombatSkills } from './skills.js';
import { DefeatSkills } from './defeat-skills.js';
import { buildGameContext } from './context.js';
import { loadGameSettings } from './scene-settings.js';

export class CombatScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CombatScene' });
    }

    init(data = {}) {
        const ctx = buildGameContext(data);
        this.globalState = ctx.globalState;
        this.management = ctx.management;
        this.loops = ctx.loops;
        this.economy = ctx.economy;
        this.advancedSim = ctx.advancedSim;
        this.targetSector = data.targetSector || 'cellblock_a';
        this.initialEnemies = Array.isArray(data.enemies) ? data.enemies : null;
        this.settings = loadGameSettings();
        if (typeof this.management.setTimeBlock === 'function') {
            this.management.setTimeBlock('Night');
        } else {
            this.management.timeBlock = 'Night';
        }
        this.enemySprites = {};
    }

    preload() {
        this.createFallbackTextures();
    }

    createFallbackTextures() {
        if (!this.textures.exists('enemy_thug')) {
            const g = this.make.graphics({ x: 0, y: 0, add: false });
            g.fillStyle(0x9a9a9a, 1);
            g.fillRoundedRect(0, 0, 48, 48, 12);
            g.generateTexture('enemy_thug', 48, 48);
            g.destroy();
        }
        if (!this.textures.exists('combat_floor')) {
            const g = this.make.graphics({ x: 0, y: 0, add: false });
            g.fillStyle(0x1a1a24, 1);
            g.fillRect(0, 0, 64, 64);
            g.generateTexture('combat_floor', 64, 64);
            g.destroy();
        }
    }

    create() {
        this.orchestrator = new CombatOrchestrator(this);
        this.worldWidth = 1800;
        this.worldHeight = 720;
        this.arenaBounds = { left: 120, right: 1680, top: 180, bottom: 610 };
        this.playerCursor = { x: 280, y: 520, speed: 280 };
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys('W,A,S,D,SHIFT,ONE,TWO,THREE,FOUR,J,K,L,ESC,SPACE');

        this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);
        this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);

        this.add.rectangle(this.worldWidth / 2, this.worldHeight / 2, this.worldWidth, this.worldHeight, 0x111116);
        this.add.rectangle(this.worldWidth / 2, 688, this.worldWidth, 64, 0x1b1b28);
        this.add.text(40, 34, 'TACTICAL COURTYARD', { fontSize: '26px', color: '#ffffff', fontStyle: 'bold' }).setScrollFactor(0);
        this.statusText = this.add.text(40, 72, '', { fontSize: '14px', color: '#c7c7d8' }).setScrollFactor(0);
        this.combatLogText = this.add.text(40, 632, 'Combat initialized.', { fontSize: '15px', color: '#ccc' }).setScrollFactor(0);

        this.playerAvatar = this.add.rectangle(this.playerCursor.x, this.playerCursor.y, 52, 82, 0x4a4ae6);
        this.enemySprites = {};
        this.spawnEnemySprites();

        this.visualPanel = this.add.container(0, 0);
        this.refreshActionInterface();
        this.refreshCombatStatus();
    }

    update(_time, delta) {
        this.updateMovement(delta);
        this.handleQuickActions();
        this.syncPresentation();
        this.updateCamera();
    }

    updateMovement(delta) {
        const moveSpeed = this.keys.SHIFT?.isDown ? 1.45 : 1;
        const step = (this.playerCursor.speed * moveSpeed) * (delta / 1000);
        let moved = false;

        if (this.cursors.left.isDown || this.keys.A.isDown) { this.playerCursor.x -= step; moved = true; }
        if (this.cursors.right.isDown || this.keys.D.isDown) { this.playerCursor.x += step; moved = true; }
        if (this.cursors.up.isDown || this.keys.W.isDown) { this.playerCursor.y -= step * 0.6; moved = true; }
        if (this.cursors.down.isDown || this.keys.S.isDown) { this.playerCursor.y += step * 0.6; moved = true; }

        this.playerCursor.x = Phaser.Math.Clamp(this.playerCursor.x, this.arenaBounds.left, this.arenaBounds.right);
        this.playerCursor.y = Phaser.Math.Clamp(this.playerCursor.y, this.arenaBounds.top, this.arenaBounds.bottom);

        if (moved) {
            this.refreshCombatStatus();
        }
    }

    updateCamera() {
        const targetScroll = Phaser.Math.Clamp(this.playerCursor.x - 420, 0, this.worldWidth - 1280);
        this.cameras.main.scrollX = targetScroll;
    }

    handleQuickActions() {
        const isDowned = this.orchestrator.playerData.stance === 'DOWNED' || this.orchestrator.playerData.baseStats.willpower <= 0;
        const registry = isDowned ? DefeatSkills : CombatSkills;
        const keyMap = ['ONE', 'TWO', 'THREE', 'FOUR'];
        const keys = Object.keys(registry);

        keyMap.forEach((keyName, index) => {
            const key = this.keys[keyName];
            if (key && Phaser.Input.Keyboard.JustDown(key) && keys[index]) {
                this.executeSkill(keys[index], registry[keys[index]]);
            }
        });

        if (Phaser.Input.Keyboard.JustDown(this.keys.J)) {
            const first = keys[0];
            if (first) this.executeSkill(first, registry[first]);
        }

        if (Phaser.Input.Keyboard.JustDown(this.keys.K)) {
            const second = keys[1];
            if (second) this.executeSkill(second, registry[second]);
        }

        if (Phaser.Input.Keyboard.JustDown(this.keys.L)) {
            const third = keys[2];
            if (third) this.executeSkill(third, registry[third]);
        }

        if (Phaser.Input.Keyboard.JustDown(this.keys.ESC)) {
            this.scene.start('ManagementHubScene', { globalState: this.globalState, management: this.management, loops: this.loops, advancedSim: this.advancedSim, economy: this.economy });
        }
    }

    executeSkill(skillKey, skill) {
        const targetEnemy = this.orchestrator.getNearestEnemyTo(this.playerCursor, 240);
        const output = skillKey === 'BREAK_GRIP'
            ? skill.execute(this.orchestrator.playerData, this.orchestrator.enemies)
            : skill.execute(this.orchestrator.playerData, targetEnemy);
        this.updateCombatLogText(output?.log || skill.name);
        this.orchestrator.executeTurnSequence(this.playerCursor);
        this.refreshActionInterface();
        this.refreshCombatStatus();
    }

    syncPresentation() {
        if (this.playerAvatar) {
            this.playerAvatar.setPosition(this.playerCursor.x, this.playerCursor.y);
        }

        Object.values(this.enemySprites || {}).forEach(sprite => {
            const enemy = this.orchestrator.enemies.find(e => e.id === sprite.getData('id'));
            if (enemy?.position) {
                sprite.setPosition(enemy.position.x, enemy.position.y);
            }
        });
    }

    spawnEnemySprites() {
        this.enemySprites = {};
        this.orchestrator.getAliveEnemies().forEach((enemy, index) => {
            const sprite = this.add.sprite(enemy.position?.x ?? (980 + (index * 120)), enemy.position?.y ?? 500, 'enemy_thug');
            sprite.setInteractive({ useHandCursor: true });
            sprite.setData('id', enemy.id);
            this.enemySprites[enemy.id] = sprite;
        });
    }

    refreshCombatStatus() {
        const nearest = this.orchestrator.getNearestEnemyTo(this.playerCursor, 240);
        const distText = nearest && nearest.position
            ? `${Math.round(Math.hypot(nearest.position.x - this.playerCursor.x, nearest.position.y - this.playerCursor.y))}px`
            : 'out of range';
        this.statusText.setText([
            `Position ${Math.round(this.playerCursor.x)}, ${Math.round(this.playerCursor.y)}`,
            `Target ${nearest ? nearest.profile.name : 'none'}`,
            `Range ${distText}`,
            `Willpower ${Math.round(this.orchestrator.playerData.baseStats.willpower)}/${Math.round(this.orchestrator.playerData.getEffectiveStat('maxWillpower'))}`,
            `Pleasure ${Math.round(this.orchestrator.playerData.baseStats.pleasure)}/${Math.round(this.orchestrator.playerData.getEffectiveStat('maxPleasure'))}`
        ].join('  •  '));
    }

    updateCombatLogText(msg) {
        if (this.combatLogText) this.combatLogText.setText(msg);
    }

    refreshActionInterface() {
        if (this.buttonGroup) {
            this.buttonGroup.forEach(obj => obj.destroy());
        }
        this.buttonGroup = [];

        const registry = this.orchestrator.playerData.stance === 'DOWNED' || this.orchestrator.playerData.baseStats.willpower <= 0 ? DefeatSkills : CombatSkills;
        const keys = Object.keys(registry);
        let currentY = 170;

        const panel = this.add.rectangle(1580, 360, 320, 680, 0x111116).setOrigin(0.5).setScrollFactor(0);
        this.buttonGroup.push(panel);

        const title = this.add.text(1420, 120, registry === DefeatSkills ? 'DEFENSIVE ACTIONS' : 'COMBAT ACTIONS', {
            fontSize: '18px',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        title.setScrollFactor(0);
        this.buttonGroup.push(title);

        keys.forEach((key, index) => {
            const skill = registry[key];
            const btn = this.add.rectangle(1580, currentY, 270, 50, registry === DefeatSkills ? 0x7a2e2e : 0x2e5c7a).setInteractive({ useHandCursor: true }).setScrollFactor(0);
            const txt = this.add.text(1580, currentY, `${index + 1}. ${skill.name}`, { fontSize: '13px', color: '#fff' }).setOrigin(0.5).setScrollFactor(0);
            this.buttonGroup.push(btn, txt);

            btn.on('pointerdown', () => this.executeSkill(key, skill));
            currentY += 70;
        });

        this.buttonGroup.push(this.add.text(1420, 600, 'Quick keys: J / K / L or 1 / 2 / 3 / 4', { fontSize: '12px', color: '#bbbbcc' }).setScrollFactor(0));
    }
}
