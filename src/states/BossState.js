import { Globals } from '../core/Globals.js';
import { WordCurriculum } from '../core/WordCurriculum.js';
import { ParticleSystem } from '../core/ParticleSystem.js';

export class BossState {
    constructor(game) {
        this.game = game;
        this.active = false;
        this.curriculum = new WordCurriculum();
        this.particles = new ParticleSystem(document.body);
    }

    enter(params) {
        this.level = params.level || 3;
        this.active = true;
        this.health = 100;
        this.maxHealth = 100;
        this.currentSentenceIndex = 0;

        // 1. CONFIGURATION BASED ON LEVEL
        this.configureBoss(this.level);

        console.log(`⚠️ ENTERING BOSS: ${this.config.name} (Level ${this.level})`);

        // 2. Sound & Visuals
        if (window.soundManager) window.soundManager.stopMusic();
        document.body.classList.add('boss-mode');
        // Specific class for visual variations
        document.body.classList.add(`boss-lvl-${this.level}`);

        // 3. UI
        this.createUI();

        // 4. Input
        this.boundHandleInput = this.handleInput.bind(this);
        window.addEventListener('keydown', this.boundHandleInput);

        // 5. Start
        this.startPhase();
    }

    configureBoss(level) {
        // DEFAULT CONFIG
        this.config = {
            name: "UNKNOWN ENTITY",
            title: "SYSTEM ERROR",
            color: "#ff0000",
            mechanic: "STANDARD", // STANDARD, SHIELD, SPLIT, HIDDEN, WIPE, CHAOS
            chargeTime: 0, // 0 = Disabled
            sentences: this.curriculum.getBossWords(level) || ["ERROR_NO_DATA"]
        };

        switch (level) {
            case 3:
                this.config.name = "THE SENTRY";
                this.config.title = "SECURITY PROTOCOL";
                this.config.color = "#00f3ff"; // Cyan
                this.config.mechanic = "STANDARD";
                break;
            case 10:
                this.config.name = "THE GATEKEEPER";
                this.config.title = "FIREWALL DAEMON";
                this.config.color = "#ffaa00"; // Orange
                this.config.mechanic = "SHIELD"; // Double Type
                break;
            case 20:
                this.config.name = "THE FRACTURE";
                this.config.title = "SPLIT CORE";
                this.config.color = "#bc13fe"; // Purple
                this.config.mechanic = "SPLIT"; // Left/Right
                break;
            case 30:
                this.config.name = "THE SILENCER";
                this.config.title = "NULL POINTER";
                this.config.color = "#444444"; // Grey/Black
                this.config.mechanic = "HIDDEN"; // Invisible Text
                break;
            case 40:
                this.config.name = "THE ELITE";
                this.config.title = "KERNEL PANIC";
                this.config.color = "#ff0055"; // Pink
                this.config.mechanic = "WIPE"; // Charge Bar
                this.config.chargeTime = 10;
                break;
            case 50:
                this.config.name = "NEXUS CORE";
                this.config.title = "GOD HAND";
                this.config.color = "#ffffff"; // White
                this.config.mechanic = "CHAOS"; // All of above randomly
                this.config.chargeTime = 8;
                break;
        }
    }

    startPhase() {
        if (this.currentSentenceIndex >= this.config.sentences.length) {
            this.victory();
            return;
        }

        this.currentTarget = this.config.sentences[this.currentSentenceIndex];
        this.typed = "";

        // Mechanic Reset
        this.shieldActive = (this.config.mechanic === "SHIELD" || (this.config.mechanic === "CHAOS" && Math.random() > 0.5));
        this.textHidden = false;

        // WIPE TIMER
        this.wipeTimer = 0;
        this.isWiping = (this.config.chargeTime > 0);

        this.updateUI();

        // VISUAL JUICE: Camera Shake on Phase Start
        this.screenShake(5);
    }

    handleInput(e) {
        if (!this.active) return;
        if (e.key.length !== 1) return;

        const char = e.key.toUpperCase(); // Boss words are caps in JSON
        const nextChar = this.currentTarget[this.typed.length];

        // SHIELD MECHANIC: Must type expected char TWICE if shield is up
        // Simplified: The *first* char of the word breaks the shield? 
        // Or: Every char needs double tap? That's annoying.
        // Let's do: Shield protects the *whole word*. Type 'SPACE' to break shield?
        // Or: Shield = Type 3 random chars to break?
        // Let's stick to Plan: SHIELD = Shield Graphic. User must type [TAB] or [!] to break?
        // Simpler for Typing Flow: Shield = 1st Letter matches, but doesn't advance. Consumes shield.

        if (this.shieldActive) {
            // Visual feedback: Shield ripple
            this.triggerShieldFeedback();
            // Break shield on any correct key press, but don't advance
            if (char === nextChar) {
                this.shieldActive = false;
                if (window.soundManager) window.soundManager.playShieldBreak();
                this.particles.spawnBurst(window.innerWidth / 2, window.innerHeight / 2, this.config.color, 10);
                this.updateUI();
                return; // Consumed key
            }
        }

        if (char === nextChar || (nextChar === '_' && char === ' ')) {
            this.typed += nextChar;

            // JUICE
            this.particles.spawnBurst(window.innerWidth / 2 + (Math.random() * 100 - 50), window.innerHeight / 2, this.config.color, 3);
            if (window.soundManager) window.soundManager.playType();

            if (this.typed === this.currentTarget) {
                this.phaseComplete();
            }
        } else {
            this.triggerError();
        }
        this.updateUI();
    }

    triggerError() {
        this.screenShake(10);
        if (window.soundManager) window.soundManager.playError();
        this.particles.spawnBurst(window.innerWidth / 2, window.innerHeight / 2, 'red', 5);

        // PENALTY?
        // If Wipe Mechanic, maybe reduce timer?
    }

    update(dt) {
        if (!this.active) return;

        // WIPE MECHANIC
        if (this.isWiping) {
            this.wipeTimer += dt / 1000;
            const pct = (this.wipeTimer / this.config.chargeTime) * 100;

            const bar = this.el.querySelector('#boss-wipe-bar');
            if (bar) bar.style.width = `${pct}%`;

            if (this.wipeTimer >= this.config.chargeTime) {
                // FAIL PHASE
                this.takeDamage();
                this.resetPhase();
            }
        }
    }

    phaseComplete() {
        if (window.soundManager) window.soundManager.playHit();
        this.screenShake(20);

        // Damage Boss
        const dmg = 100 / this.config.sentences.length;
        this.health -= dmg;

        this.particles.spawnExplosion(window.innerWidth / 2, window.innerHeight / 2, this.config.color);

        setTimeout(() => {
            this.currentSentenceIndex++;
            this.startPhase();
        }, 500);
    }

    createUI() {
        this.el = document.createElement('div');
        this.el.className = `boss-screen boss-theme-${this.config.mechanic.toLowerCase()}`;
        this.el.innerHTML = `
            <div class="boss-header">
                <div class="boss-title">${this.config.title}<br><span style="color:${this.config.color}">${this.config.name}</span></div>
                <div class="boss-health-container">
                    <div class="boss-health-bar"><div class="fill" style="width:100%; background:${this.config.color}"></div></div>
                </div>
            </div>

            <!-- BOSS AVATAR -->
            <div class="boss-center">
                 <div class="boss-avatar-glow" style="box-shadow: 0 0 50px ${this.config.color}"></div>
                 ${this.config.mechanic === 'WIPE' ?
                `<div class="boss-wipe-container"><div class="fill" id="boss-wipe-bar"></div></div>` : ''
            }
            </div>

            <div class="boss-typing-container">
                <div id="boss-text" class="target-text"></div>
            </div>
        `;
        document.body.appendChild(this.el);
    }

    updateUI() {
        if (!this.el) return;

        // Health
        const hp = this.el.querySelector('.boss-health-bar .fill');
        if (hp) hp.style.width = `${Math.max(0, this.health)}%`;

        // Text
        const textEl = this.el.querySelector('#boss-text');
        if (textEl) {
            let html = "";

            // HIDDEN MECHANIC
            if (this.config.mechanic === 'HIDDEN' && this.typed.length > 3) {
                textEl.classList.add('blurred-text');
            } else {
                textEl.classList.remove('blurred-text');
            }

            // SHIELD VISUAL
            if (this.shieldActive) {
                html += `<span class="boss-shield-icon">🛡️ PROTECTED</span><br>`;
            }

            html += `<span style="color:${this.config.color}; text-shadow:0 0 10px ${this.config.color}">${this.typed}</span>`;
            html += `<span style="opacity:0.3">${this.currentTarget.substring(this.typed.length)}</span>`;

            textEl.innerHTML = html;
        }
    }

    victory() {
        this.active = false;
        if (window.soundManager) window.soundManager.playWin();

        this.el.innerHTML = `
            <div class="victory-summary">
                <div class="victory-title" style="color:${this.config.color}">THREAT NEUTRALIZED</div>
                <div style="color:white; margin-top:20px">SYSTEM RESTORED</div>
            </div>
        `;

        setTimeout(() => {
            if (window.GravityAgent && window.GravityAgent.fsm) {
                window.GravityAgent.fsm.change('playing', { level: this.level + 1 });
            }
        }, 4000);
    }

    exit() {
        this.active = false;
        document.body.classList.remove('boss-mode');
        // Remove specific level class
        document.body.classList.remove(`boss-lvl-${this.level}`);
        window.removeEventListener('keydown', this.boundHandleInput);
        if (this.el) this.el.remove();
    }

    screenShake(intensity) {
        document.body.style.transform = `translate(${Math.random() * intensity - intensity / 2}px, ${Math.random() * intensity - intensity / 2}px)`;
        setTimeout(() => document.body.style.transform = 'none', 50);
    }

    resetPhase() {
        this.typed = "";
        this.wipeTimer = 0;
        this.screenShake(20);
        this.updateUI();
    }

    takeDamage() {
        // Player damage logic...
    }

    triggerShieldFeedback() {
        const textEl = this.el.querySelector('#boss-text');
        if (textEl) {
            textEl.classList.add('shield-deflect');
            setTimeout(() => textEl.classList.remove('shield-deflect'), 100);
        }
    }
}
