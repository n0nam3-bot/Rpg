const SETTINGS_KEY = "sylphiette_settings";

export const DEFAULT_SETTINGS = {
    soundEnabled: true,
    cameraShake: true,
    autoSave: true,
    controlHints: true,
    screenFlash: true
};

export function loadGameSettings() {
    try {
        const raw = localStorage.getItem(SETTINGS_KEY);
        if (!raw) return { ...DEFAULT_SETTINGS };
        const parsed = JSON.parse(raw);
        return { ...DEFAULT_SETTINGS, ...(parsed && typeof parsed === "object" ? parsed : {}) };
    } catch (_err) {
        return { ...DEFAULT_SETTINGS };
    }
}

export function saveGameSettings(settings) {
    const merged = { ...DEFAULT_SETTINGS, ...(settings && typeof settings === "object" ? settings : {}) };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
    return merged;
}

export function getGameSettings() {
    return loadGameSettings();
}

export class SettingsScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SettingsScene' });
    }

    init(data = {}) {
        this.returnTo = data.returnTo || 'ManagementHubScene';
        this.returnData = data.returnData || null;
        this.settings = loadGameSettings();
    }

    create() {
        this.add.rectangle(640, 360, 1280, 720, 0x0d0d13);
        this.add.text(50, 40, 'SETTINGS / CONFIG', {
            fontSize: '28px',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        this.add.text(50, 80, 'These toggles are stored locally and used by the scenes that support them.', {
            fontSize: '14px',
            color: '#c6c6d7'
        });

        this.rows = [];
        const entries = [
            ['soundEnabled', 'Sound Enabled'],
            ['cameraShake', 'Camera Shake'],
            ['screenFlash', 'Screen Flash'],
            ['autoSave', 'Auto Save'],
            ['controlHints', 'Control Hints']
        ];

        entries.forEach((entry, index) => {
            const [key, label] = entry;
            const y = 180 + (index * 86);
            const panel = this.add.rectangle(640, y, 760, 64, 0x181822).setOrigin(0.5);
            const title = this.add.text(300, y - 8, label, {
                fontSize: '18px',
                color: '#ffffff',
                fontStyle: 'bold'
            }).setOrigin(0, 0.5);
            const status = this.add.text(980, y - 8, '', {
                fontSize: '16px',
                color: '#e0ad4e',
                fontStyle: 'bold'
            }).setOrigin(1, 0.5);
            const toggle = this.add.rectangle(1040, y, 160, 42, 0x4a4ae6).setInteractive({ useHandCursor: true });
            const toggleText = this.add.text(1040, y, 'TOGGLE', { fontSize: '14px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5);

            toggle.on('pointerdown', () => {
                this.settings[key] = !this.settings[key];
                this.settings = saveGameSettings(this.settings);
                this.refreshRows();
            });

            this.rows.push({ key, status, panel, title, toggle, toggleText });
        });

        this.refreshRows();

        const saveBtn = this.add.rectangle(360, 640, 220, 50, 0x2f7a4a).setInteractive({ useHandCursor: true });
        this.add.text(360, 640, 'SAVE & RETURN', { fontSize: '15px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
        saveBtn.on('pointerdown', () => this.close(true));

        const cancelBtn = this.add.rectangle(920, 640, 220, 50, 0x5b3c73).setInteractive({ useHandCursor: true });
        this.add.text(920, 640, 'RETURN', { fontSize: '15px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
        cancelBtn.on('pointerdown', () => this.close(false));
    }

    refreshRows() {
        this.rows.forEach(row => {
            row.status.setText(this.settings[row.key] ? 'ON' : 'OFF');
        });
    }

    close(commit) {
        if (commit) {
            this.settings = saveGameSettings(this.settings);
        }

        const payload = this.returnData && typeof this.returnData === 'object' ? this.returnData : {};
        this.scene.start(this.returnTo, payload);
    }
}
