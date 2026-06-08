import { buildGameContext } from './context.js';
import { loadGameSettings } from './scene-settings.js';

export class WardenQuartersScene extends Phaser.Scene {
    constructor() {
        super({ key: 'WardenQuartersScene' });
    }

    init(data = {}) {
        const ctx = buildGameContext(data);
        this.globalState = ctx.globalState;
        this.management = ctx.management;
        this.loops = ctx.loops;
        this.advancedSim = ctx.advancedSim;
        this.economy = ctx.economy;
        this.settings = loadGameSettings();
        if (typeof this.management.setTimeBlock === 'function') {
            this.management.setTimeBlock('Night');
        } else {
            this.management.timeBlock = 'Night';
        }
        this.restless = !!this.globalState.restlessInsomnia || this.advancedSim.evaluateBedtimeComposure();
        this.roomWidth = 2400;
        this.roomHeight = 720;
    }

    preload() {
        this.ensureTexture('quarters_player', 30, 50, g => {
            g.fillStyle(0x4a4ae6, 1);
            g.fillRoundedRect(0, 0, 30, 50, 8);
        });
        this.ensureTexture('quarters_floor', 64, 64, g => {
            g.fillStyle(0x191922, 1);
            g.fillRect(0, 0, 64, 64);
            g.lineStyle(2, 0x303045, 1);
            g.strokeRect(0, 0, 64, 64);
        });
        this.ensureTexture('quarters_object', 96, 76, g => {
            g.fillStyle(0x232333, 1);
            g.fillRoundedRect(0, 0, 96, 76, 8);
            g.lineStyle(2, 0xe0ad4e, 1);
            g.strokeRoundedRect(0, 0, 96, 76, 8);
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
        this.cameras.main.setBounds(0, 0, this.roomWidth, this.roomHeight);
        this.physics.world.setBounds(0, 0, this.roomWidth, this.roomHeight);

        this.add.rectangle(this.roomWidth / 2, this.roomHeight / 2, this.roomWidth, this.roomHeight, 0x11111a);
        this.add.text(40, 34, 'BEDROOM', { fontSize: '30px', color: '#ffffff', fontStyle: 'bold' }).setScrollFactor(0);
        this.add.text(40, 70, 'Walk to the bed, vent station, or door. Sleep only works once restless insomnia is cleared.', { fontSize: '14px', color: '#d8d8e6' }).setScrollFactor(0);
        this.add.text(40, 98, `Phase ${this.management.getDayPhase?.() || this.management.timeBlock || 'Night'}`, { fontSize: '13px', color: '#e0ad4e', fontStyle: 'bold' }).setScrollFactor(0);

        this.platforms = this.physics.add.staticGroup();
        this.buildRoom();

        this.player = this.physics.add.sprite(120, 560, 'quarters_player');
        this.player.setCollideWorldBounds(true);
        this.player.setDragX(980);
        this.player.setMaxVelocity(300, 820);
        this.physics.add.collider(this.player, this.platforms);

        this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys('W,A,S,D,E,SPACE,SHIFT,ESC');

        this.points = [];
        this.spawnRoomPoints();
        this.createHud();
        this.refreshHud();
    }

    buildRoom() {
        const floor = this.platforms.create(this.roomWidth / 2, 690, 'quarters_floor');
        floor.setDisplaySize(this.roomWidth, 60);
        floor.refreshBody();

        const ledges = [
            { x: 540, y: 540, w: 180 },
            { x: 980, y: 485, w: 240 },
            { x: 1460, y: 535, w: 200 },
            { x: 1940, y: 460, w: 180 }
        ];

        ledges.forEach(({ x, y, w }) => {
            const platform = this.platforms.create(x, y, 'quarters_floor');
            platform.setDisplaySize(w, 18);
            platform.refreshBody();
        });
    }

    spawnRoomPoints() {
        const defs = [
            { key: 'bed', x: 560, y: 502, label: 'Bed', hint: 'Sleep or inspect your condition', color: 0x744d2f },
            { key: 'vent', x: 1040, y: 445, label: 'Desire Venting Station', hint: 'Clear restless insomnia', color: 0x7a2e5d },
            { key: 'desk', x: 1510, y: 495, label: 'Wardrobe', hint: 'Check supplies and condition', color: 0x335c7a },
            { key: 'door', x: 2060, y: 420, label: 'Door to District', hint: 'Return to the map', color: 0x2f7a4a }
        ];

        defs.forEach(def => {
            const obj = this.physics.add.staticImage(def.x, def.y, 'quarters_object');
            obj.setTint(def.color);
            obj.setData('definition', def);
            obj.refreshBody();
            this.points.push(obj);

            this.add.text(def.x, def.y - 24, def.label, { fontSize: '14px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
            this.add.text(def.x, def.y + 34, def.hint, { fontSize: '11px', color: '#d8d8e6' }).setOrigin(0.5);
        });
    }

    createHud() {
        this.hudPanel = this.add.rectangle(640, 686, 1280, 68, 0x0b0b10, 0.88).setScrollFactor(0);
        this.topText = this.add.text(24, 650, '', { fontSize: '13px', color: '#ffffff' }).setScrollFactor(0);
        this.bottomText = this.add.text(24, 672, '', { fontSize: '12px', color: '#c9c9d9' }).setScrollFactor(0);
        this.promptText = this.add.text(1270, 652, '', { fontSize: '13px', color: '#e0ad4e', align: 'right' }).setOrigin(1, 0).setScrollFactor(0);
        this.logText = this.add.text(1270, 676, '', { fontSize: '12px', color: '#8fd0a0', align: 'right' }).setOrigin(1, 0).setScrollFactor(0);
    }

    refreshHud() {
        const p = this.globalState.player;
        this.topText.setText([
            `Day ${this.management.currentDay}`,
            `Phase ${this.management.getDayPhase?.() || this.management.timeBlock || 'Night'}`,
            `Energy ${Math.round(p.baseStats.energy)}/${Math.round(p.getEffectiveStat('maxEnergy'))}`,
            `Willpower ${Math.round(p.baseStats.willpower)}/${Math.round(p.getEffectiveStat('maxWillpower'))}`,
            `Pleasure ${Math.round(p.baseStats.pleasure)}/${Math.round(p.getEffectiveStat('maxPleasure'))}`
        ].join('  •  '));

        this.bottomText.setText([
            `Restless ${this.restless ? 'YES' : 'NO'}`,
            `Stress ${Math.round(this.loops.stressIndex)}`,
            `Fatigue ${Math.round(this.loops.fatigueIndex)}`,
            `Treasury $${this.management.treasury}`
        ].join('  •  '));

        this.promptText.setText(this.prompt || '');
        this.logText.setText(this.message || '');
    }

    update() {
        this.movePlayer();

        if (Phaser.Input.Keyboard.JustDown(this.keys.E) || Phaser.Input.Keyboard.JustDown(this.keys.SPACE)) {
            this.activatePoint();
        }

        if (Phaser.Input.Keyboard.JustDown(this.keys.ESC)) {
            this.goHub();
        }

        this.updatePrompt();
        this.refreshHud();
    }

    movePlayer() {
        const speed = this.keys.SHIFT?.isDown ? 320 : 240;
        let vx = 0;
        if (this.cursors.left.isDown || this.keys.A.isDown) vx -= speed;
        if (this.cursors.right.isDown || this.keys.D.isDown) vx += speed;
        this.player.setVelocityX(vx);

        const onGround = this.player.body.blocked.down || this.player.body.touching.down;
        if ((Phaser.Input.Keyboard.JustDown(this.cursors.up) || Phaser.Input.Keyboard.JustDown(this.keys.W)) && onGround) {
            this.player.setVelocityY(-520);
        }

        if (vx < 0) this.player.setFlipX(true);
        else if (vx > 0) this.player.setFlipX(false);
    }

    getNearestPoint() {
        let chosen = null;
        let best = 88;
        this.points.forEach(point => {
            const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, point.x, point.y);
            if (d < best) {
                best = d;
                chosen = point;
            }
        });
        return chosen;
    }

    updatePrompt() {
        const point = this.getNearestPoint();
        if (point) {
            this.prompt = `Near ${point.getData('definition').label} — press E.`;
        } else {
            this.prompt = 'Walk the quarters and interact with the furniture.';
        }
    }

    activatePoint() {
        const point = this.getNearestPoint();
        if (!point) return;
        const def = point.getData('definition');
        if (!def) return;

        if (def.key === 'vent') {
            this.advancedSim.executeDesireVentingSession();
            this.globalState.restlessInsomnia = false;
            this.restless = false;
            this.message = 'You vent the pressure and clear the restless flag.';
            return;
        }

        if (def.key === 'bed') {
            if (this.restless) {
                this.message = 'Sleep is blocked until you vent first.';
                return;
            }
            this.sleepAndAdvanceDay();
            return;
        }

        if (def.key === 'desk') {
            this.message = 'Your stats are stable. The room feels quieter than the district outside.';
            return;
        }

        if (def.key === 'door') {
            this.goHub();
        }
    }

    sleepAndAdvanceDay() {
        this.loops.executeQuartersSleepCycle();
        this.management.processDayEnd();
        this.economy.runDailyOrderPhaseAudit();

        const cappedEnergy = this.loops.applyCappedEnergyCeiling(this.globalState.player.getEffectiveStat('maxEnergy'));
        this.globalState.player.baseStats.maxEnergy = cappedEnergy;
        this.globalState.player.baseStats.energy = cappedEnergy;
        this.globalState.player.baseStats.willpower = this.globalState.player.getEffectiveStat('maxWillpower');
        this.message = 'You rest through the night and wake to a new day.';
        this.time.delayedCall(700, () => this.goHub());
    }

    goHub() {
        this.scene.start('ManagementHubScene', {
            globalState: this.globalState,
            management: this.management,
            loops: this.loops,
            advancedSim: this.advancedSim,
            economy: this.economy
        });
    }
}
