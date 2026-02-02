import { Globals } from '../core/Globals.js';

export class BossState {
    constructor(game) {
        this.game = game;
        this.active = false;
        // The "Firewall Code" from the screenshot
        this.targetString = "CRITICAL_OVERRIDE://BYPASS_FIREWALL_ALPHA_SEQUENCE_COMPLETE_IMMEDIATELY";
        this.typedString = "";
        this.startTime = 0;
    }

    enter(params) {
        this.active = true;
        this.typedString = "";
        this.startTime = performance.now();
        this.countdown = 60; // 60 Seconds to Hack
        console.log("⚠️ ENTERING BOSS BATTLE: NEXUS GUARDIAN");

        // 1. Create DOM Overlay
        this.createBossUI();

        // 2. Play Sound
        if (window.soundManager && window.soundManager.stopMusic) {
            window.soundManager.stopMusic(); // Stop normal tracks
            // window.soundManager.playBossMusic(); // TODO: Implement specific boss track
        }

        // 3. Visuals
        document.body.classList.add('boss-mode');

        // 4. Attach Input
        this.boundHandleInput = this.handleInput.bind(this);
        window.addEventListener('keydown', this.boundHandleInput);
    }

    createBossUI() {
        this.el = document.createElement('div');
        this.el.className = 'boss-screen';
        this.el.innerHTML = `
            <div class="boss-timer">T-MINUS: <span id="boss-time">60</span>s</div>
            <div class="boss-header">
                <div class="boss-title">BOSS BATTLE<br><span style="font-size:0.6em; color:#00f3ff">NEXUS CORE</span></div>
                <div class="boss-health-container">
                    <div class="boss-name">BOSS: NEXUS GUARDIAN</div>
                    <div class="boss-health-bar"><div class="fill" style="width:100%"></div></div>
                </div>
            </div>
            
            <div class="boss-core">
                <!-- Glowing Sphere Visualization -->
                <div class="sphere-glow"></div>
            </div>

            <div class="boss-typing-container">
                <div class="target-text">${this.targetString}</div>
                <div class="input-progress-bar"><div class="fill" style="width:0%"></div></div>
                <div class="progress-label">PROCESS: <span id="progress-pct">0%</span></div>
            </div>
        `;
        document.body.appendChild(this.el);
        this.updateUI();
    }

    // AUTO PILOT DISABLED
    // if (!this.active) return;
    // ... (Auto pilot code removed)

    handleInput(e) {
        if (!this.active) return;

        // Ignore modifiers
        if (e.key.length > 1) return;

        const char = e.key;
        const nextChar = this.targetString[this.typedString.length];

        // Case-insensitive match for ease, or strict? Let's go Strict for "Cyber Hacking" feel, but allow Shift.
        // Actually, preventing frustration: Case Insensitive for letters, but symbols must match?
        // Let's stick to Exact Match based on the string.

        // Logic: specific handling for symbols if needed
        if (char.toLowerCase() === nextChar.toLowerCase() ||
            (nextChar === '_' && (char === '_' || char === ' ' || char === '-'))) {

            this.typedString += nextChar; // Auto-correct to match display caps
            this.updateUI();

            // Victory Check
            if (this.typedString.length === this.targetString.length) {
                this.victory();
            }
        } else {
            // Damage / Error
            this.triggerError();
        }
    }

    update(dt) {
        if (!this.active) return;

        // Timer Logic
        this.countdown -= (dt / 1000);
        const timerEl = this.el.querySelector('#boss-time');
        if (timerEl) timerEl.innerText = Math.ceil(this.countdown);

        if (this.countdown <= 0) {
            this.active = false;
            alert("CONNECTION LOST. REBOOTING...");
            window.location.reload(); // Simple fail state for now
        }
    }

    updateUI() {
        if (!this.el) return;

        // Update Progress Bar
        const pct = Math.floor((this.typedString.length / this.targetString.length) * 100);
        const progressEl = this.el.querySelector('.input-progress-bar .fill');
        const pctLabel = this.el.querySelector('#progress-pct');

        if (progressEl) progressEl.style.width = `${pct}%`;
        if (pctLabel) pctLabel.innerText = `${pct}%`;

        // Update Text Highlighting
        const targetEl = this.el.querySelector('.target-text');
        if (targetEl) {
            const typedPart = `<span style="color: #00f3ff; text-shadow: 0 0 15px #00f3ff; font-weight:bold">${this.typedString}</span>`;
            const remainPart = `<span style="opacity: 0.5">${this.targetString.substring(this.typedString.length)}</span>`;
            targetEl.innerHTML = typedPart + remainPart;
        }
    }

    triggerError() {
        const core = this.el.querySelector('.sphere-glow');
        if (core) {
            core.style.boxShadow = "0 0 100px red";
            setTimeout(() => core.style.boxShadow = "0 0 50px #ff2200", 100);
        }

        const text = this.el.querySelector('.target-text');
        if (text) {
            text.classList.add('shake');
            setTimeout(() => text.classList.remove('shake'), 200);
        }

        // Sound Error
        if (window.soundManager) window.soundManager.playError();
    }

    victory() {
        console.log("BOSS DEFEATED");
        this.active = false;

        // Win Sfx
        if (window.soundManager) window.soundManager.playWin();

        // 1. Remove standard Boss UI
        this.el.innerHTML = '';

        // 2. Show Victory Summary
        this.el.innerHTML = `
            <div class="victory-summary">
                <div class="victory-title">HACK COMPLETE</div>
                <div class="victory-stats">
                     FIREWALL BYPASSED<br>
                     TIME REMAINING: ${Math.ceil(this.countdown)}s<br>
                     SCORE BOUNTY: 50000
                </div>
                <div class="reward-box">
                    REWARD: [NUKE] PROTOCOL UNLOCKED
                </div>
                <button id="continue-btn">PROCEED TO SYSTEM CORE</button>
            </div>
        `;

        const btn = this.el.querySelector('#continue-btn');
        if (btn) {
            btn.addEventListener('click', () => {
                if (window.GravityAgent && window.GravityAgent.fsm) {
                    window.GravityAgent.fsm.change('playing', { level: 4 });
                }
            });
        }
    }

    exit() {
        this.active = false;
        document.body.classList.remove('boss-mode');
        if (this.el) this.el.remove();
        window.removeEventListener('keydown', this.boundHandleInput);
    }
}
