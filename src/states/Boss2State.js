import { Globals } from '../core/Globals.js';
import { ParticleSystem } from '../core/ParticleSystem.js';

export class Boss2State {
    constructor(game) {
        this.game = game;
        this.active = false;

        // Sentences for the "Charge" mechanic
        this.sentences = [
            "NEURAL LINK CONNECTION ESTABLISHED",
            "OPTIMIZING BIOLOGICAL INTERFACE",
            "PURGING HUMAN ERROR PROTOCOLS",
            "GRAVITY IS MERELY A SUGGESTION",
            "THE ARCHITECT DEMANDS PERFECTION"
        ];

        this.currentSentenceIndex = 0;
        this.currentSentence = "";
        this.typedText = "";

        this.bossImage = "/assets/boss_celestial.png";
        this.health = 100;
        this.maxHealth = 100;

        // Charge Mechanic
        this.chargeTimer = 0;
        this.chargeDuration = 15.0; // 15 Seconds to type
        this.isCharging = false;

        // Visuals
        this.particles = null;
    }

    enter(params) {
        console.log("🌌 ENTERING BOSS 2: THE CELESTIAL ARCHITECT (PROTOCOL 2)");
        try {
            this.active = true;
            this.health = 100;
            this.currentSentenceIndex = 0;

            // Initialize Particle System
            if (typeof ParticleSystem === 'undefined') {
                console.error("❌ ParticleSystem not loaded! Check imports.");
            } else {
                this.particles = new ParticleSystem(document.body);
                console.log("✨ ParticleSystem initialized.");
            }

            // Music
            if (window.soundManager) {
                window.soundManager.stopMusic();
                // window.soundManager.playBossMusic(); 
            }

            // Add class for styling
            document.body.classList.add('boss2-mode');

            // FORCE CLEANUP: Hide previous layers specifically
            const hud = document.getElementById('hud-layer');
            const world = document.getElementById('world-layer');
            if (hud) hud.style.display = 'none';
            if (world) world.style.display = 'none';

            // Create UI
            this.createUI();
            console.log("✅ Boss2 UI Created.");

            // Input
            this.boundHandleInput = this.handleInput.bind(this);
            window.addEventListener('keydown', this.boundHandleInput);

            // Start Encounter
            this.startNextPhase();
            console.log("✅ Boss2 Phase Started.");
        } catch (e) {
            console.error("CRITCAL ERROR in Boss2State.enter():", e);
            alert("Error Loading Boss 2: " + e.message); // Alert user directly
        }
    }

    createUI() {
        this.el = document.createElement('div');
        this.el.className = 'boss2-screen';
        this.el.innerHTML = `
            <div class="boss2-header">
                <div class="boss-title">PRIORITY TARGET<br><span style="color:#ffd700">CELESTIAL ARCHITECT</span></div>
                <div class="health-container">
                    <div class="boss-health-bar"><div class="fill" id="boss2-health" style="width:100%; background:#ffd700"></div></div>
                </div>
            </div>
            
            <div class="boss2-center">
                <!-- Boss Avatar -->
                <img src="${this.bossImage}" class="boss-avatar floating">
                
                <!-- Charge Bar (The Threat) -->
                <div class="boss-charge-container">
                    <div class="boss-charge-fill" id="boss-charge-bar"></div>
                    <div class="boss-charge-label">ATTACK CHARGE</div>
                </div>

                <!-- Typing Challenge -->
                <div class="boss-sentence-container">
                    <div class="boss-sentence" id="boss-sentence"></div>
                </div>
            </div>

            <div class="player-damage-overlay"></div>
        `;
        document.body.appendChild(this.el);
    }

    startNextPhase() {
        if (this.currentSentenceIndex >= this.sentences.length) {
            this.victory();
            return;
        }

        this.currentSentence = this.sentences[this.currentSentenceIndex];
        this.typedText = "";
        this.chargeTimer = 0;
        this.isCharging = true;
        this.updateSentenceVisuals();
    }

    handleInput(e) {
        if (!this.active || !this.isCharging) return;

        if (e.key.length !== 1) return; // Ignore modifiers
        const char = e.key.toUpperCase();

        // Expected Logic
        const nextChar = this.currentSentence[this.typedText.length];

        // Handle Space vs Non-Space (Standard Typing)
        if (char === nextChar) {
            // Correct
            this.typedText += char;
            this.updateSentenceVisuals();

            // JUICE: Spawn particles at typed character position?
            // Hard to get exact pos of letter in DOM string, but can spawn at center or random near text
            if (this.particles) {
                // Approximate center of screen for now, or random offset
                const cx = window.innerWidth / 2 + (Math.random() * 200 - 100);
                const cy = window.innerHeight * 0.7; // Lower center
                this.particles.spawnBurst(cx, cy, '#0aff0a', 5); // Green burst
            }

            // Check Completion
            if (this.typedText === this.currentSentence) {
                this.phaseComplete();
            }
        } else {
            // Wrong
            if (window.soundManager) window.soundManager.playError();
            this.screenShake();

            // JUICE: Error glitch particles
            if (this.particles) {
                const cx = window.innerWidth / 2;
                const cy = window.innerHeight * 0.7;
                this.particles.spawnBurst(cx, cy, '#ff0055', 8); // Pink/Red burst
            }
        }
    }

    updateSentenceVisuals() {
        const sentenceEl = this.el.querySelector('#boss-sentence');
        if (!sentenceEl) return;

        // Split visual into Typed (Green) and Remaining (White)
        let html = `<span style="color:#0aff0a; text-shadow:0 0 10px #0aff0a">${this.typedText}</span>`;
        html += `<span style="opacity:0.5">${this.currentSentence.substring(this.typedText.length)}</span>`;

        sentenceEl.innerHTML = html;
    }

    phaseComplete() {
        // Success Logic
        this.isCharging = false;
        if (window.soundManager) window.soundManager.playHit();

        // JUICE: Phase Complete Explosion
        if (this.particles) {
            const cx = window.innerWidth / 2;
            const cy = window.innerHeight / 2;
            this.particles.spawnBurst(cx, cy, '#ffd700', 20); // Gold explosion
            this.particles.spawnBurst(cx, cy, '#ffffff', 10); // White sparkles
        }

        // Damage Boss
        this.damageBoss(20); // 5 sentences = 100 HP

        // Visual Feedback
        this.screenShake(); // Small shake for impact

        // Next Phase Delay
        setTimeout(() => {
            this.currentSentenceIndex++;
            this.startNextPhase();
        }, 1000);
    }

    damageBoss(amount) {
        this.health -= amount;
        const bar = this.el.querySelector('#boss2-health');
        if (bar) bar.style.width = `${this.health}%`;
    }

    update(dt) {
        if (!this.active) return;
        if (this.isCharging) {
            this.chargeTimer += dt / 1000;

            // Update UI Bar
            const bar = this.el.querySelector('#boss-charge-bar');
            if (bar) {
                const pct = (this.chargeTimer / this.chargeDuration) * 100;
                bar.style.width = `${pct}%`;

                // Color shift near end
                bar.style.background = pct > 80 ? '#ff0000' : '#ffd700';
            }

            // Failure Logic
            if (this.chargeTimer >= this.chargeDuration) {
                this.chargeFail();
            }
        }
    }

    chargeFail() {
        this.isCharging = false;
        this.playerDamage();

        // Reset Phase (Retry same sentence)
        this.typedText = "";
        this.chargeTimer = 0;
        this.updateSentenceVisuals();

        // Reduced penalty? Or just restart charge immediately?
        // Let's restart charge after a brief pause
        setTimeout(() => {
            if (this.active) this.isCharging = true;
        }, 1000);
    }

    playerDamage() {
        // Flash Screen
        const overlay = this.el.querySelector('.player-damage-overlay');
        overlay.classList.add('active');
        setTimeout(() => overlay.classList.remove('active'), 200);

        if (window.soundManager) window.soundManager.playDamage();

        // Visual Shake
        this.screenShake();
    }

    screenShake() {
        if (this.el) {
            this.el.classList.add('shake');
            setTimeout(() => this.el.classList.remove('shake'), 200);
        }
    }

    victory() {
        console.log("BOSS 2 DEFEATED");
        this.active = false;
        this.isCharging = false;

        if (window.soundManager) window.soundManager.playWin();

        // JUICE: Massive Victory Explosion
        if (this.particles) {
            const cx = window.innerWidth / 2;
            const cy = window.innerHeight / 2;
            this.particles.spawnExplosion(cx, cy); // uses the helper method
        }

        // Transition to LORE STATE (Protocol 3)
        if (this.game && this.game.fsm) {
            // Mock Lore State for now, or direct if implemented
            // Ideally: this.game.fsm.change('lore', { ... });

            // Temporary Victory Overlay until LoreState is ready
            this.el.innerHTML = `
                <div class="victory-summary">
                    <div class="victory-title" style="color:#ffd700">ARCHITECT SILENCED</div>
                    <div style="margin-top:20px; color:#fff">PROTOCOL COMPLETE</div>
                </div>
            `;
            setTimeout(() => {
                this.game.fsm.change('playing', { level: 12 });
            }, 4000);
        }
    }

    exit() {
        this.active = false;
        document.body.classList.remove('boss2-mode');
        window.removeEventListener('keydown', this.boundHandleInput);
        if (this.el) this.el.remove();
    }
}

