import { SkillTreeRegistry } from './skills-tree.js';
import { buildGameContext } from './context.js';

export class StatusInspectionScene extends Phaser.Scene {
    constructor() {
        super({ key: 'StatusInspectionScene' });
    }

    init(data) {
        const ctx = buildGameContext(data);
        this.globalState = ctx.globalState;
        this.management = ctx.management;
        this.evolution = ctx.evolution;
        this.skillsTree = ctx.skillsTree;
    }

    create() {
        this.add.rectangle(640, 360, 1280, 720, 0x0f0f14);
        this.add.text(50, 40, 'STATUS / ROUTE SHEET', { fontSize: '26px', color: '#e0ad4e', fontWeight: 'bold' });

        this.renderAnatomicalGridDOM();
        this.renderPerksTreeDOM();

        let exitBtn = this.add.rectangle(1150, 650, 160, 50, 0x444).setInteractive({ useHandCursor: true });
        this.add.text(1150, 650, 'RETURN TO DISTRICT', { fontSize: '13px', color: '#fff', fontWeight: 'bold' }).setOrigin(0.5);
        exitBtn.on('pointerdown', () => {
            this.scene.start('ManagementHubScene', { globalState: this.globalState, management: this.management });
        });
    }

    renderAnatomicalGridDOM() {
        const evo = this.evolution;
        const p = this.globalState.player;

        this.add.dom(340, 340).createFromHTML(`
            <div style="color:#fff; width:480px; font-family:monospace; background:#16161d; padding:20px; border-radius:6px; border:1px solid #2a2a35;">
                <h4 style="margin-top:0; color:#5bc0de; border-bottom:1px solid #333; padding-bottom:5px;">SYSTEM SENSITIVITY INDEX</h4>
                <p>Voice Control: <span style="color:#f0ad4e;">LVL ${evo.zoneLevels.mouth}</span> (Sensitivity: ${p.getZoneSensitivity('mouth')}x)</p>
                <p>Core Stability: <span style="color:#f0ad4e;">LVL ${evo.zoneLevels.breast}</span> (Sensitivity: ${p.getZoneSensitivity('breast')}x)</p>
                <p>Balance: <span style="color:#f0ad4e;">LVL ${evo.zoneLevels.groin}</span> (Sensitivity: ${p.getZoneSensitivity('groin')}x)</p>
                <small style="color:#888;">Condition changes sensitivity and max willpower over time.</small>
            </div>
        `);
    }

    renderPerksTreeDOM() {
        let treeHTML = `
            <div style="color:#fff; width:520px; font-family:Arial, sans-serif; background:#16161d; padding:20px; border-radius:6px; border:1px solid #2a2a35;">
                <h4 style="margin-top:0; color:#5cb85c; border-bottom:1px solid #333; padding-bottom:5px; font-family:monospace;">PROGRESSION SHEET (AP: ${this.skillsTree.availableAP})</h4>
                <div style="max-height:360px; overflow-y:auto;">
        `;

        Object.keys(SkillTreeRegistry).forEach(id => {
            const skill = SkillTreeRegistry[id];
            treeHTML += `
                <div style="background:#22222a; padding:10px; margin-bottom:10px; border-radius:4px;">
                    <p style="margin:0; font-size:14px; font-weight:bold; color:${skill.unlocked ? '#5cb85c' : '#e0ad4e'};">${skill.name} ${skill.unlocked ? '✓' : ''}</p>
                    <small style="color:#bbb; display:block; margin:4px 0;">${skill.description}</small>
                    <button id="btn-tree-${id}" ${skill.unlocked ? 'disabled' : ''} style="background:${skill.unlocked ? '#444' : '#5cb85c'}; border:0; color:#fff; padding:4px 8px; border-radius:3px; font-size:11px; cursor:pointer;">
                        ${skill.unlocked ? 'Unlocked' : `Unlock Key [${skill.costAP} AP]`}
                    </button>
                </div>
            `;
        });

        treeHTML += `</div></div>`;
        const element = this.add.dom(880, 340).createFromHTML(treeHTML);
        element.addListener('click');

        Object.keys(SkillTreeRegistry).forEach(id => {
            const btn = document.getElementById(`btn-tree-${id}`);
            if (btn && !SkillTreeRegistry[id].unlocked) {
                btn.addEventListener('click', () => {
                    if (this.skillsTree.purchaseSkillNode(id)) this.scene.restart({
                        globalState: this.globalState,
                        management: this.management,
                        evolution: this.evolution,
                        skillsTree: this.skillsTree
                    });
                });
            }
        });
    }
}
