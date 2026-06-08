import { buildGameContext } from './context.js';
import { SaveSystem } from './storage.js';
import { loadGameSettings } from './scene-settings.js';

const DAY_PHASES = ['Morning', 'Shift', 'Evening', 'Night'];

export class ManagementHubScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ManagementHubScene' });
    }

    init(data = {}) {
        const ctx = buildGameContext(data);
        this.globalState = ctx.globalState;
        this.management = ctx.management;
        this.skillsTree = ctx.skillsTree;
        this.evolution = ctx.evolution;
        this.loops = ctx.loops;
        this.advancedSim = ctx.advancedSim;
        this.economy = ctx.economy;
        this.settings = loadGameSettings();

        this.packState = () => ({
            globalState: this.globalState,
            management: this.management,
            skillsTree: this.skillsTree,
            evolution: this.evolution,
            loops: this.loops,
            advancedSim: this.advancedSim,
            economy: this.economy,
            restlessInsomnia: !!this.globalState.restlessInsomnia
        });

        this.worldWidth = 9600;
        this.worldHeight = 720;
        this.nodes = [];
        this.patrols = [];
        this.crowds = [];
        this.interactRange = 88;
        this.prompt = 'Walk the district. Press E near a door, terminal, or patrol node.';
        this.subtext = '';
        this.lastSaveMessage = '';
        this.dayPhase = this.management.getDayPhase?.() || this.management.timeBlock || 'Morning';
        this.objective = 'Move through the district and keep pressure under control.';
    }

    preload() {
        this.ensureTexture('hub_player', 32, 52, g => {
            g.fillStyle(0x4a4ae6, 1);
            g.fillRoundedRect(0, 0, 32, 52, 8);
            g.fillStyle(0xffffff, 0.16);
            g.fillRect(5, 7, 22, 10);
        });

        this.ensureTexture('hub_ground', 64, 64, g => {
            g.fillStyle(0x1a1a24, 1);
            g.fillRect(0, 0, 64, 64);
            g.lineStyle(2, 0x303045, 1);
            g.strokeRect(0, 0, 64, 64);
        });

        this.ensureTexture('hub_platform', 64, 20, g => {
            g.fillStyle(0x2d2d3d, 1);
            g.fillRoundedRect(0, 0, 64, 20, 6);
            g.lineStyle(2, 0x54546a, 1);
            g.strokeRoundedRect(0, 0, 64, 20, 6);
        });

        this.ensureTexture('hub_node', 96, 112, g => {
            g.fillStyle(0x222235, 1);
            g.fillRoundedRect(0, 0, 96, 112, 10);
            g.lineStyle(2, 0xe0ad4e, 1);
            g.strokeRoundedRect(0, 0, 96, 112, 10);
            g.fillStyle(0xffffff, 0.15);
            g.fillRect(10, 10, 76, 16);
        });

        this.ensureTexture('hub_guard', 28, 46, g => {
            g.fillStyle(0x7a5a2e, 1);
            g.fillRoundedRect(0, 0, 28, 46, 6);
            g.fillStyle(0xffffff, 0.18);
            g.fillRect(4, 6, 20, 8);
        });

        this.ensureTexture('hub_patrol', 34, 34, g => {
            g.fillStyle(0x9a3d3d, 1);
            g.fillRoundedRect(0, 0, 34, 34, 8);
        });

        this.ensureTexture('hub_civilian', 26, 40, g => {
            g.fillStyle(0x6c6c86, 1);
            g.fillRoundedRect(0, 0, 26, 40, 6);
        });
    }

    ensureTexture(key, width, height, drawer) {
        if (this.textures.exists(key)) return;
        const g = this.make.graphics({ x: 0, y: 0, add: false });
        drawer(g);
        g.generateTexture(key, width, height);
        g.destroy();
    }

    create() {
        this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);
        this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);
        this.cameras.main.setBackgroundColor('#09090f');

        this.drawBackground();
        this.platforms = this.physics.add.staticGroup();
        this.buildDistrictTerrain();

        this.player = this.physics.add.sprite(180, 540, 'hub_player');
        this.player.setCollideWorldBounds(true);
        this.player.setBounce(0);
        this.player.setDragX(900);
        this.player.setMaxVelocity(340, 860);
        this.player.body.setSize(24, 48, true);
        this.physics.add.collider(this.player, this.platforms);

        this.cameras.main.startFollow(this.player, true, 0.12, 0.12);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys('W,A,S,D,E,SPACE,SHIFT,ESC,F5,ONE,TWO,ENTER');

        this.createDistrictNodes();
        this.spawnPatrols();
        this.spawnAmbientCrowd();
        this.createHud();
        this.refreshHubState();
        this.refreshPrompt('Walk to a door, terminal, or combat node.');
    }

    drawBackground() {
        this.add.rectangle(this.worldWidth / 2, this.worldHeight / 2, this.worldWidth, this.worldHeight, 0x0b0b10);
        this.add.rectangle(this.worldWidth / 2, 110, this.worldWidth, 220, 0x111421).setScrollFactor(0.22);
        this.add.rectangle(this.worldWidth / 2, 40, this.worldWidth, 80, 0x07070b).setScrollFactor(0.12);
        this.add.text(40, 24, 'SYLPHIETTE // SIDE-SCROLL ROUTE', {
            fontSize: '28px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setScrollFactor(0);
        this.phaseText = this.add.text(40, 58, '', {
            fontSize: '14px',
            color: '#c9c9d9'
        }).setScrollFactor(0);
        this.add.text(40, 82, 'Move through the side-scroll route, enter rooms, fight, rest, and survive the day.', {
            fontSize: '13px',
            color: '#8f8fa9'
        }).setScrollFactor(0);
    }

    buildDistrictTerrain() {
        const floor = this.platforms.create(this.worldWidth / 2, 690, 'hub_ground');
        floor.setDisplaySize(this.worldWidth, 60);
        floor.refreshBody();

        const ledges = [
            { x: 480, y: 575, w: 220 },
            { x: 1060, y: 520, w: 260 },
            { x: 1760, y: 560, w: 240 },
            { x: 2620, y: 470, w: 320 },
            { x: 3480, y: 540, w: 320 },
            { x: 4360, y: 500, w: 300 },
            { x: 5280, y: 565, w: 280 },
            { x: 6140, y: 510, w: 300 },
            { x: 7020, y: 470, w: 320 },
            { x: 7980, y: 540, w: 300 }
        ];

        ledges.forEach(({ x, y, w }) => {
            const platform = this.platforms.create(x, y, 'hub_platform');
            platform.setDisplaySize(w, 20);
            platform.refreshBody();
        });
    }

    createDistrictNodes() {
        const defs = [
            { key: 'bedroom', label: 'Bedroom', x: 760, y: 540, fill: 0x744d2f, allowedPhases: ['Morning', 'Shift', 'Evening', 'Night'], action: () => this.goScene('WardenQuartersScene'), hint: 'Return to the room and recover' },
            { key: 'courtyard', label: 'Courtyard Clash', x: 2040, y: 540, fill: 0x7a2e2e, allowedPhases: ['Shift', 'Evening', 'Night'], action: () => this.goScene('CombatScene', { targetSector: 'courtyard' }), hint: 'Engage a tougher encounter' },
            { key: 'corridor', label: 'Corridor Sweep', x: 3620, y: 505, fill: 0x4a4ae6, allowedPhases: ['Morning', 'Shift', 'Evening', 'Night'], action: () => this.goScene('CombatScene', { targetSector: 'cellblock_a' }), hint: 'Push through the hallway' },
            { key: 'status', label: 'Status / Skills', x: 5520, y: 495, fill: 0x335c7a, allowedPhases: ['Morning', 'Shift', 'Evening', 'Night'], action: () => this.goScene('StatusInspectionScene'), hint: 'Review your build state' },
            { key: 'save', label: 'Save Terminal', x: 7340, y: 510, fill: 0x2f7a4a, allowedPhases: ['Morning', 'Shift', 'Evening', 'Night'], action: () => this.quickSave(), hint: 'Write current progress' },
            { key: 'settings', label: 'Settings', x: 8920, y: 540, fill: 0x6a5b92, allowedPhases: ['Morning', 'Shift', 'Evening', 'Night'], action: () => this.scene.start('SettingsScene', { returnTo: 'ManagementHubScene', returnData: this.packState() }), hint: 'Tune controls and flags' }
        ];

        defs.forEach(def => {
            const node = this.physics.add.staticImage(def.x, def.y, 'hub_node');
            node.setTint(def.fill);
            node.refreshBody();
            node.setData('definition', def);
            this.nodes.push(node);

            this.add.text(def.x, def.y - 28, def.label, {
                fontSize: '14px',
                color: '#ffffff',
                fontStyle: 'bold'
            }).setOrigin(0.5);

            this.add.text(def.x, def.y + 44, def.hint, {
                fontSize: '11px',
                color: '#c9c9d9'
            }).setOrigin(0.5);
        });
    }

    spawnPatrols() {
        const patrolDefs = [
            { x: 1380, y: 533, min: 1200, max: 1600 },
            { x: 4380, y: 506, min: 4200, max: 4780 },
            { x: 7080, y: 456, min: 6900, max: 7460 }
        ];

        patrolDefs.forEach((info, index) => {
            const patrol = this.physics.add.sprite(info.x, info.y, 'hub_patrol');
            patrol.setCollideWorldBounds(true);
            patrol.setBounce(0);
            patrol.setDragX(0);
            patrol.setVelocityX(index % 2 === 0 ? 90 : -90);
            patrol.setData('range', info);
            patrol.setData('sign', index % 2 === 0 ? 'guard' : 'agent');
            this.physics.add.collider(patrol, this.platforms);
            this.physics.add.overlap(this.player, patrol, () => this.onPatrolContact(patrol));
            this.patrols.push(patrol);
        });
    }

    spawnAmbientCrowd() {
        const crowdPoints = [
            { x: 420, y: 600, min: 260, max: 620 },
            { x: 2140, y: 610, min: 1960, max: 2300 },
            { x: 3500, y: 585, min: 3360, max: 3720 },
            { x: 5860, y: 605, min: 5600, max: 6200 },
            { x: 7640, y: 590, min: 7420, max: 7960 }
        ];

        crowdPoints.forEach((info, index) => {
            const civilian = this.physics.add.sprite(info.x, info.y, 'hub_civilian');
            civilian.setCollideWorldBounds(true);
            civilian.setBounce(0);
            civilian.setData('range', info);
            civilian.setVelocityX(index % 2 === 0 ? 30 : -30);
            this.physics.add.collider(civilian, this.platforms);
            this.crowds.push(civilian);
        });
    }

    createHud() {
        this.hudPanel = this.add.rectangle(640, 686, 1280, 68, 0x0b0b10, 0.88).setScrollFactor(0);
        this.hudTop = this.add.text(26, 650, '', { fontSize: '14px', color: '#ffffff', fontStyle: 'bold' }).setScrollFactor(0);
        this.hudBottom = this.add.text(26, 672, '', { fontSize: '12px', color: '#c9c9d9' }).setScrollFactor(0);
        this.promptText = this.add.text(1270, 654, '', { fontSize: '13px', color: '#e0ad4e', align: 'right' }).setOrigin(1, 0).setScrollFactor(0);
        this.saveText = this.add.text(1270, 676, '', { fontSize: '12px', color: '#8fd0a0', align: 'right' }).setOrigin(1, 0).setScrollFactor(0);
    }

    refreshHubState() {
        this.dayPhase = this.management.getDayPhase?.() || this.management.timeBlock || this.dayPhase;
        const phaseObjectives = {
            Morning: 'Morning: wake in the bedroom, check the corridor, and plan the route.',
            Shift: 'Shift: clear the lane, avoid patrols, and keep moving forward.',
            Evening: 'Evening: finish fights, recover what you can, and head home.',
            Night: "Night: rest, vent pressure, and protect tomorrow's energy cap."
        };
        this.objective = phaseObjectives[this.dayPhase] || this.objective;
        const p = this.globalState.player;
        const phaseText = `Phase ${this.dayPhase}`;

        if (this.phaseText) {
            this.phaseText.setText(`${phaseText} • Day ${this.management.currentDay} • Treasury $${this.management.treasury}`);
        }

        this.hudTop.setText([
            `Day ${this.management.currentDay}`,
            `Treasury $${this.management.treasury}`,
            `Energy ${Math.round(p.baseStats.energy)}/${Math.round(p.getEffectiveStat('maxEnergy'))}`,
            `Willpower ${Math.round(p.baseStats.willpower)}/${Math.round(p.getEffectiveStat('maxWillpower'))}`,
            `Pleasure ${Math.round(p.baseStats.pleasure)}/${Math.round(p.getEffectiveStat('maxPleasure'))}`
        ].join('  •  '));

        this.hudBottom.setText([
            `Phase ${this.dayPhase}`,
            `Stress ${Math.round(this.loops.stressIndex)}`,
            `Fatigue ${Math.round(this.loops.fatigueIndex)}`,
            `Order ${Math.round(this.economy.globalOrderRating)}`,
            `Corruption ${Math.round(this.economy.guardCorruptionRate)}`,
            `Restless ${this.globalState.restlessInsomnia ? 'YES' : 'NO'}`,
            this.objective
        ].join('  •  '));

        this.promptText.setText(this.prompt || '');
        this.saveText.setText(this.lastSaveMessage || '');
    }

    refreshPrompt(message = '', subtext = '') {
        this.prompt = message;
        this.subtext = subtext;
        if (this.promptText) this.promptText.setText(this.prompt || '');
        if (this.hudBottom && subtext) {
            this.hudBottom.setText([
                `Phase ${this.dayPhase}`,
                `Stress ${Math.round(this.loops.stressIndex)}`,
                `Fatigue ${Math.round(this.loops.fatigueIndex)}`,
                `Order ${Math.round(this.economy.globalOrderRating)}`,
                `Corruption ${Math.round(this.economy.guardCorruptionRate)}`,
                `Restless ${this.globalState.restlessInsomnia ? 'YES' : 'NO'}`,
                this.objective,
                subtext
            ].join('  •  '));
        }
    }

    update(_time, delta) {
        this.updatePlayerMovement();
        this.updatePatrols(delta);
        this.updateAmbientCrowd(delta);
        this.updateNodePrompt();
        this.refreshHubState();

        if (Phaser.Input.Keyboard.JustDown(this.keys.E) || Phaser.Input.Keyboard.JustDown(this.keys.ENTER)) {
            this.interactWithNode();
        }

        if (Phaser.Input.Keyboard.JustDown(this.keys.F5)) {
            this.quickSave();
        }

        if (Phaser.Input.Keyboard.JustDown(this.keys.ESC)) {
            this.scene.start('SettingsScene', { returnTo: 'ManagementHubScene', returnData: this.packState() });
        }

        if (Phaser.Input.Keyboard.JustDown(this.keys.ONE)) {
            this.goScene('StatusInspectionScene');
        }

        if (Phaser.Input.Keyboard.JustDown(this.keys.TWO)) {
            this.quickSave();
        }
    }

    updatePlayerMovement() {
        const speed = this.keys.SHIFT?.isDown ? 340 : 260;
        let vx = 0;

        if (this.cursors.left.isDown || this.keys.A.isDown) vx -= speed;
        if (this.cursors.right.isDown || this.keys.D.isDown) vx += speed;
        this.player.setVelocityX(vx);

        const onGround = this.player.body.blocked.down || this.player.body.touching.down;
        if ((Phaser.Input.Keyboard.JustDown(this.cursors.up) || Phaser.Input.Keyboard.JustDown(this.keys.W) || Phaser.Input.Keyboard.JustDown(this.keys.SPACE)) && onGround) {
            this.player.setVelocityY(-560);
        }

        if (vx < 0) this.player.setFlipX(true);
        else if (vx > 0) this.player.setFlipX(false);
    }

    updatePatrols(delta) {
        this.patrols.forEach(patrol => {
            const range = patrol.getData('range');
            if (!range) return;
            const speed = 70 * (delta / 1000);
            if (patrol.body.velocity.x >= 0) {
                patrol.x += speed;
                if (patrol.x >= range.max) patrol.setVelocityX(-90);
            } else {
                patrol.x -= speed;
                if (patrol.x <= range.min) patrol.setVelocityX(90);
            }

            if (Math.abs(this.player.x - patrol.x) < 120 && Math.abs(this.player.y - patrol.y) < 90) {
                this.prompt = 'Patrol nearby. Press E to initiate an encounter or keep moving.';
            }
        });
    }

    updateAmbientCrowd(delta) {
        this.crowds.forEach(civilian => {
            const range = civilian.getData('range');
            if (!range) return;
            const drift = 18 * (delta / 1000);
            if (civilian.body.velocity.x >= 0) {
                civilian.x += drift;
                if (civilian.x >= range.max) civilian.setVelocityX(-30);
            } else {
                civilian.x -= drift;
                if (civilian.x <= range.min) civilian.setVelocityX(30);
            }
        });
    }

    updateNodePrompt() {
        const nearest = this.getNearestNode();
        if (nearest) {
            const def = nearest.getData('definition');
            const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, nearest.x, nearest.y);
            if (distance <= this.interactRange) {
                const lockedMessage = this.getAccessMessage(def);
                this.refreshPrompt(lockedMessage || `${def.label} — press E to enter.`, def.hint);
                return;
            }
        }

        this.refreshPrompt('Walk the district. Press E near a door, terminal, or combat node.');
    }

    getAccessMessage(def) {
        if (!def?.allowedPhases?.length) return '';
        if (def.allowedPhases.includes(this.dayPhase)) return '';
        return `${def.label} is closed during ${this.dayPhase}.`;
    }

    getNearestNode() {
        let chosen = null;
        let best = this.interactRange;
        this.nodes.forEach(node => {
            const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, node.x, node.y);
            if (distance < best) {
                best = distance;
                chosen = node;
            }
        });
        return chosen;
    }

    interactWithNode() {
        const node = this.getNearestNode();
        if (!node) return;

        const def = node.getData('definition');
        if (!def || typeof def.action !== 'function') return;

        if (def.allowedPhases?.length && !def.allowedPhases.includes(this.dayPhase)) {
            this.lastSaveMessage = `${def.label} is not available right now.`;
            return;
        }

        if (this.settings.autoSave && def.key !== 'save') {
            this.quickSave(false);
        }

        def.action();
    }

    onPatrolContact(patrol) {
        if (!patrol || patrol.getData('locked')) return;
        patrol.setData('locked', true);
        this.lastSaveMessage = '';
        this.prompt = 'A patrol closes in — combat is triggered.';
        this.refreshHubState();
        this.time.delayedCall(180, () => {
            this.goScene('CombatScene', { targetSector: 'courtyard' });
        });
    }

    goScene(sceneKey, extra = {}) {
        const payload = {
            ...this.packState(),
            ...extra
        };
        this.scene.start(sceneKey, payload);
    }

    quickSave(showMessage = true) {
        SaveSystem.saveGame(this.globalState.player, this.management, {
            skillsTree: this.skillsTree,
            loops: this.loops,
            advancedSim: this.advancedSim,
            economy: this.economy,
            evolution: this.evolution,
            restlessInsomnia: !!this.globalState.restlessInsomnia
        });

        if (showMessage) {
            this.lastSaveMessage = 'Game saved.';
            this.time.delayedCall(900, () => {
                if (this.lastSaveMessage === 'Game saved.') this.lastSaveMessage = '';
            });
        }
    }
}
