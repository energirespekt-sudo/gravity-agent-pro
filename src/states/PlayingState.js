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
        this.lives = 3; // Fixed Init
        this.damageTimer = 0;
    }

    enter() {
        console.log('🎮 GAME START (Engine 2.0)');
        this.score = 0;
        this.level = 1;
        this.lives = 3;

        // Force UI reset
        this.systems.ui.update(this);

        const hudTop = document.getElementById('hud-top');
        const bottomUI = document.getElementById('bottom-ui');
        if (hudTop) hudTop.style.display = 'flex';
        if (bottomUI) bottomUI.style.display = 'flex';

        // --- DEBUG CONSOLE (THE BLACK BOX) ---
        let dbg = document.getElementById('debug-console');
        if (!dbg) {
            dbg = document.createElement('div');
            dbg.id = 'debug-console';
            dbg.style.position = 'absolute';
            dbg.style.top = '10px';
            dbg.style.left = '10px';
            dbg.style.background = 'rgba(0,0,0,0.8)';
            dbg.style.color = '#0f0';
            dbg.style.fontFamily = 'monospace';
            dbg.style.padding = '10px';
            dbg.style.zIndex = '9999';
            dbg.style.pointerEvents = 'none';
            dbg.style.fontSize = '12px';
            document.body.appendChild(dbg);
        }
        this.debugEl = dbg;

        if (this.inputHandler.typer) {
            this.inputHandler.typer.value = '';
            this.inputHandler.typer.focus();
        }

        // Global Error Trap
        window.onerror = (msg, url, line) => {
            if (this.debugEl) this.debugEl.innerHTML += `<br><span style="color:red">ERR: ${msg}</span>`;
            return false;
        };
    }

    exit() {
        console.log('🛑 GAME STOP');
        // Clear all entities
        // In ECS, usually we destroy all entities here to prevent ghosts
        // But for now, reload refreshes. TODO: Clear function
    }

    update(dt) {
        try {
            // Handle Damage Timer (Visual Only - No Pause)
            if (this.damageTimer > 0) {
                this.damageTimer -= dt;
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
            this.systems.render.update(this.entityManager);
            this.systems.ui.update(this);

            // DEBUG UPDATE
            if (this.debugEl) {
                const buffer = (this.systems.typer && this.systems.typer.buffer) ? this.systems.typer.buffer : "[EMPTY]";
                const fps = Math.round(1 / dt);
                const active = this.entityManager.getEntities().length;
                this.debugEl.innerHTML = `
                    FPS: ${fps}<br>
                    BUFFER: <span style="color:white; font-size:14px">${buffer}</span><br>
                    ENTITIES: ${active}<br>
                    LIVES: ${this.lives}
                `;
            }

        } catch (err) {
            console.error("FATAL GAME LOOP ERROR:", err);
            // Panic Recovery: Pause game or alerts user
            // In dev mode, logging is enough to see 'Freeze' cause
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
