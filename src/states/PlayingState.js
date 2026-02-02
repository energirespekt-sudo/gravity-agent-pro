import { EntityManager } from '../ecs/EntityManager.js';
import { PhysicsSystem } from '../ecs/systems/PhysicsSystem.js';
import { RenderSystem } from '../ecs/systems/RenderSystem.js';
import { SpawningSystem } from '../ecs/systems/SpawningSystem.js';
import { TyperSystem } from '../ecs/systems/TyperSystem.js';
import { UISystem } from '../ecs/systems/UISystem.js';
import { InputHandler } from '../core/InputHandler.js';
import { WordComponent } from '../ecs/components.js';

export class PlayingState {
    constructor() {
        this.entityManager = new EntityManager();
        this.inputHandler = new InputHandler();

        this.systems = {
            spawning: new SpawningSystem(this.entityManager),
            physics: new PhysicsSystem(),
            render: new RenderSystem(),
            typer: new TyperSystem(this.inputHandler),
            ui: new UISystem()
        };

        this.score = 0;
        this.level = 1;
        this.lives = 3;
        this.damageTimer = 0;
    }

    enter() {
        console.log('🎮 GAME START (Engine 2.0)');
        this.score = 0;
        this.score = 0;
        this.level = 1;
        this.transitioning = false;
        this.lives = 3;
        this.lives = 3;

        // Load High Score
        this.highScore = parseInt(localStorage.getItem('gravity_highscore')) || 0;
        console.log(`🏆 Loaded High Score: ${this.highScore}`);

        // Force UI reset
        this.systems.ui.update(this);

        // Show HUD Layer (New Grid Layout)
        const hudLayer = document.getElementById('hud-layer');
        if (hudLayer) hudLayer.style.display = 'grid';

        // Reset Input
        if (this.inputHandler.typer) {
            this.inputHandler.typer.value = '';
            this.inputHandler.typer.focus();
        }

        // Global Error Trap
        window.onerror = (msg, url, line) => {
            console.error(`Global Error: ${msg} @ ${line}`);
            return false;
        };
    }

    exit() {
        console.log('🛑 GAME STOP');

        // Hide UI (New IDs)
        const hudLayer = document.getElementById('hud-layer');
        if (hudLayer) hudLayer.style.display = 'none';

        // Save High Score on exit (just in case)
        if (this.score > this.highScore) {
            localStorage.setItem('gravity_highscore', this.score);
        }
    }

    update(dt) {
        try {
            // BOSS FIGHT TRANSITION
            if (this.level >= 3 && !this.transitioning) {
                console.log("⚠️ WARNING: BOSS APPROACHING");
                this.transitioning = true;

                // create warning
                const warning = document.createElement('div');
                warning.className = 'warning-overlay';
                warning.innerHTML = "WARNING<br>SYSTEM BREACH DETECTED";
                document.body.appendChild(warning);

                // Stop inputs
                if (this.inputHandler.typer) this.inputHandler.typer.blur();

                // Transition Delay
                setTimeout(() => {
                    warning.remove();
                    if (window.GravityAgent && window.GravityAgent.fsm) {
                        window.GravityAgent.fsm.change('boss');
                    }
                }, 3000);

                return;
            }

            // WIN CONDITION
            if (this.level > 50) {
                if (this.damageTimer <= 0) {
                    this.damageTimer = 0;
                    document.body.classList.remove('damage-pause');
                }
            }

            this.entityManager.update();

            // System Updates - Passing 'this' as the PlayingState context
            this.systems.spawning.update(dt, this.level);
            this.systems.typer.update(this.entityManager, this);
            this.systems.physics.update(this.entityManager, dt, this);
            this.systems.render.update(this.entityManager);
            this.systems.ui.update(this);

        } catch (err) {
            console.error("FATAL GAME LOOP ERROR:", err);
        }
    }

    triggerDamageSequence() {
        this.lives--;
        this.damageTimer = 300; // 0.3s Visual Red Flash (Game continues)

        // Clear all active words to give fresh start
        const entities = this.entityManager.getEntitiesWith(WordComponent);
        entities.forEach(e => this.entityManager.removeEntity(e));

        // Reset Input Buffer
        if (this.systems.typer) this.systems.typer.buffer = "";
        if (this.systems.typer) this.systems.typer.resetAllHighlights(this.entityManager);

        // Sound
        if (window.soundManager) window.soundManager.playDamage();

        // Visual Feedback
        document.body.classList.add('damage-pause');
        this.systems.ui.triggerVisualDisturbance();

        // Game Over Check
        if (this.lives <= 0) {
            if (window.GravityAgent && window.GravityAgent.fsm) {
                window.GravityAgent.fsm.change('gameover', { score: this.score });
            }
        }
    }

    render(alpha) {
        // Interpolation hooks
    }
}
