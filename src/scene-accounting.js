/**
 * SYLPHIETTE POST-BATTLE CLEARANCE LAYER
 * Settles combat accounting, drops loot, handles repairs, and tracks corruption payouts.
 */
import { buildGameContext } from './context.js';

export class PostCombatAccountingScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PostCombatAccountingScene' });
    }

    init(data) {
        const ctx = buildGameContext(data);
        this.globalState = ctx.globalState;
        this.management = ctx.management;
        this.skillsTree = ctx.skillsTree;
        this.loops = ctx.loops;
        this.advancedSim = ctx.advancedSim;
        this.economy = ctx.economy;
        this.victory = !!data.victory;
        this.combatReport = data.report || { physicalHitsTaken: 0, submissionTicks: 0 };
    }

    create() {
        this.add.rectangle(640, 360, 1280, 720, 0x121217);
        const titleText = this.victory ? 'SECTOR DEPLOYMENT SUCCESSFUL' : 'SECTOR DEFENSES BREACHED';
        this.add.text(50, 40, titleText, { fontSize: '28px', color: this.victory ? '#5cb85c' : '#d9534f', fontWeight: 'bold' });
        this.processFinancialSettle();
    }

    processFinancialSettle() {
        const basePay = this.victory ? 300 : 50;
        const uniformRepairBill = this.combatReport.physicalHitsTaken * 12;
        const corruptionTips = this.combatReport.submissionTicks * 25;

        this.management.treasury = Math.max(0, this.management.treasury + basePay + corruptionTips - uniformRepairBill);

        if (this.victory && this.combatReport.submissionTicks === 0 && this.skillsTree) {
            this.skillsTree.availableAP += 2;
        }

        this.add.dom(640, 360).createFromHTML(`
            <div style="color:#fff; width:460px; font-family:monospace; background:#1c1c24; padding:20px; border-radius:6px; border:1px solid #333;">
                <h4 style="text-align:center; color:#e0ad4e; margin-top:0;">POST-ENCOUNTER LEDGER</h4>
                <p>(+) Operations Pay: <span style="color:#5cb85c">+$${basePay}</span></p>
                <p>(-) Armor Repair Bill: <span style="color:#d9534f">-$${uniformRepairBill}</span></p>
                <p style="border-bottom:1px dashed #444; padding-bottom:10px;">(+) Encounter Bonus: <span style="color:#5bc0de">+$${corruptionTips}</span></p>
                <p style="font-size:15px; font-weight:bold;">Net Treasury Adjusted: $${this.management.treasury}</p>
                <button id="btn-leave-accounting" style="width:100%; margin-top:20px; background:#4a4ae6; border:0; color:#fff; padding:10px; border-radius:4px; font-weight:bold; cursor:pointer;">RETURN TO DISTRICT</button>
            </div>
        `);

        const leave = () => {
            if (this.victory) {
                this.scene.start('ManagementHubScene', { globalState: this.globalState, management: this.management, loops: this.loops, advancedSim: this.advancedSim, economy: this.economy });
            } else {
                this.scene.start('EscapeHallScene', {
                    globalState: this.globalState,
                    management: this.management,
                    loops: this.loops,
                    advancedSim: this.advancedSim,
                    economy: this.economy,
                    defeatReport: { lostFunds: uniformRepairBill }
                });
            }
        };

        document.getElementById('btn-leave-accounting').addEventListener('click', leave);
        this.input.keyboard.once('keydown-ENTER', leave);
        this.input.keyboard.once('keydown-SPACE', leave);
    }
}
