/**
 * Bedroom assault scene with side-view movement and keyboard-first response.
 */
import { CombatOrchestrator } from './scene-combat-linker.js';
import { BedSkills } from './bed-skills.js';
import { buildGameContext } from './context.js';
import { loadGameSettings } from './scene-settings.js';

export class BedCombatScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BedCombatScene' });
    }

    init(data = {}) {
        const ctx = buildGameContext(data);
        this.globalState = ctx.globalState;
        this.management = ctx.management;
        this.loops = ctx.loops;
        this.advancedSim = ctx.advancedSim;
        this.economy = ctx.economy;
        this.targetSector = 'quarters';
        this.initialEnemies = Array.isArray(data.enemies) ? data.enemies : null;
        this.settings = loadGameSettings();
        if (typeof this.management.setTimeBlock === 'function') {
            this.management.setTimeBlock('Night');
        } else {
            this.management.timeBlock = 'Night';
        }

        if (this.globalState.player.baseStats) {
            this.globalState.player.baseStats.clothingDurability = 0;
            this.globalState.player.stance = 'SUPPRESSED';
        }
    }

    preload() {
        if (!this.textures.exists('intruder_sprite')) {
            const g = this.make.graphics({ x: 0, y: 0, add: false });
            g.fillStyle(0xdd3333, 1);
            g.fillRoundedRect(0, 0, 42, 42, 10);
            g.generateTexture('intruder_sprite', 42, 42);
            g.destroy();
        }
    }

    create() {
        this.orchestrator = new CombatOrchestrator(this);
        this.worldWidth = 1600;
        this.worldHeight = 720;
        this.arenaBounds = { left: 140, right: 1180, top: 360, bottom: 590 };
        this.playerCursor = { x: 420, y: 520, speed: 240 };
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys('W,A,S,D,SHIFT,ONE,TWO,THREE,J,K,L,ESC,SPACE');

        this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);
        this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);

        this.add.rectangle(this.worldWidth / 2, this.worldHeight / 2, this.worldWidth, this.worldHeight, 0x220505);
        this.add.rectangle(this.worldWidth / 2, 680, this.worldWidth, 80, 0x341217);
        this.add.text(40, 32, 'MIDNIGHT BEDROOM ASSAULT', { fontSize: '26px', color: '#ff3333', fontStyle: 'bold' }).setScrollFactor(0);
        this.statusText = this.add.text(40, 68, '', { fontSize: '14px', color: '#e0d0d0' }).setScrollFactor(0);
        this.logText = this.add.text(40, 632, 'Intruders have breached the room.', { fontSize: '15px', color: '#ccc' }).setScrollFactor(0);

        this.playerAvatar = this.add.rectangle(this.playerCursor.x, this.playerCursor.y, 72, 56, 0x4a4ae6);
        this.spawnBedroomIntruders();
        this.renderBedroomActionDocks();
        this.refreshBedStatus();
        this.updateCamera();
    }

    update(_time, delta) {
        this.updateMovement(delta);
        this.handleQuickActions();
        this.syncPresentation();
        this.updateCamera();
    }

    updateMovement(delta) {
        const moveSpeed = this.keys.SHIFT?.isDown ? 1.35 : 1;
        const step = (this.playerCursor.speed * moveSpeed) * (delta / 1000);
        let moved = false;

        if (this.cursors.left.isDown || this.keys.A.isDown) { this.playerCursor.x -= step; moved = true; }
        if (this.cursors.right.isDown || this.keys.D.isDown) { this.playerCursor.x += step; moved = true; }
        if (this.cursors.up.isDown || this.keys.W.isDown) { this.playerCursor.y -= step * 0.5; moved = true; }
        if (this.cursors.down.isDown || this.keys.S.isDown) { this.playerCursor.y += step * 0.5; moved = true; }

        this.playerCursor.x = Phaser.Math.Clamp(this.playerCursor.x, this.arenaBounds.left, this.arenaBounds.right);
        this.playerCursor.y = Phaser.Math.Clamp(this.playerCursor.y, this.arenaBounds.top, this.arenaBounds.bottom);

        if (moved) {
            this.refreshBedStatus();
        }
    }

    updateCamera() {
        const targetScroll = Phaser.Math.Clamp(this.playerCursor.x - 360, 0, this.worldWidth - 1280);
        this.cameras.main.scrollX = targetScroll;
    }

    handleQuickActions() {
        const keys = Object.keys(BedSkills);
        if (Phaser.Input.Keyboard.JustDown(this.keys.ONE) || Phaser.Input.Keyboard.JustDown(this.keys.J)) {
            this.executeBedAction(keys[0]);
        }
        if (Phaser.Input.Keyboard.JustDown(this.keys.TWO) || Phaser.Input.Keyboard.JustDown(this.keys.K)) {
            this.executeBedAction(keys[1]);
        }
        if (Phaser.Input.Keyboard.JustDown(this.keys.THREE) || Phaser.Input.Keyboard.JustDown(this.keys.L)) {
            this.executeBedAction(keys[2]);
        }

        if (Phaser.Input.Keyboard.JustDown(this.keys.ESC)) {
            this.scene.start('ManagementHubScene', { globalState: this.globalState, management: this.management, loops: this.loops, advancedSim: this.advancedSim, economy: this.economy });
        }
    }

    executeBedAction(skillKey) {
        const skill = BedSkills[skillKey];
        if (!skill) return;
        const targetEnemy = this.orchestrator.getNearestEnemyTo(this.playerCursor, 240);
        const output = skill.execute(this.orchestrator.playerData, this.orchestrator.enemies, targetEnemy);
        this.updateCombatLogText(output.log);
        if (!this.orchestrator.getAliveEnemies().length) {
            this.processBedVictoryClearance();
            return;
        }
        this.orchestrator.executeTurnSequence(this.playerCursor);
        this.refreshBedStatus();
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

    spawnBedroomIntruders() {
        this.enemySprites = {};
        this.orchestrator.getAliveEnemies().forEach((enemy, index) => {
            const sprite = this.add.sprite(enemy.position?.x ?? (780 + (index * 125)), enemy.position?.y ?? 460, 'intruder_sprite').setTint(0xdd3333);
            sprite.setData('id', enemy.id);
            this.enemySprites[enemy.id] = sprite;
        });
    }

    renderBedroomActionDocks() {
        this.buttonGroup = [];
        const panel = this.add.rectangle(1465, 360, 240, 680, 0x111116).setOrigin(0.5).setScrollFactor(0);
        this.buttonGroup.push(panel);

        let currentY = 170;
        Object.keys(BedSkills).forEach((key, index) => {
            const skill = BedSkills[key];
            const btn = this.add.rectangle(1465, currentY, 200, 50, 0x4a1525).setInteractive({ useHandCursor: true }).setScrollFactor(0);
            const txt = this.add.text(1465, currentY, `${index + 1}. ${skill.name}`, { fontSize: '13px', color: '#fff' }).setOrigin(0.5).setScrollFactor(0);
            this.buttonGroup.push(btn, txt);
            btn.on('pointerdown', () => this.executeBedAction(key));
            currentY += 75;
        });
    }

    updateCombatLogText(msg) {
        if (this.logText) this.logText.setText(msg);
    }

    refreshBedStatus() {
        const nearest = this.orchestrator.getNearestEnemyTo(this.playerCursor, 240);
        const dist = nearest?.position ? Math.round(Math.hypot(nearest.position.x - this.playerCursor.x, nearest.position.y - this.playerCursor.y)) : 'out';
        this.statusText.setText(`Position ${Math.round(this.playerCursor.x)}, ${Math.round(this.playerCursor.y)}  •  Threat ${nearest ? nearest.profile.name : 'none'}  •  Range ${dist}`);
    }

    processBedVictoryClearance() {
        this.updateCombatLogText('The intruders are driven out.');
        this.time.delayedCall(1200, () => {
            this.globalState.player.baseStats.energy = this.globalState.player.getEffectiveStat('maxEnergy');
            this.globalState.player.baseStats.willpower = this.globalState.player.getEffectiveStat('maxWillpower');
            this.globalState.player.baseStats.pleasure = 0;
            this.globalState.restlessInsomnia = false;
            if (typeof this.management.setTimeBlock === 'function') {
                this.management.setTimeBlock('Morning');
            } else {
                this.management.timeBlock = 'Morning';
            }
            this.scene.start('ManagementHubScene', { globalState: this.globalState, management: this.management, loops: this.loops, advancedSim: this.advancedSim, economy: this.economy });
        });
    }
}
