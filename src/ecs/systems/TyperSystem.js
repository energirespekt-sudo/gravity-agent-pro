import { InputHandler } from '../../core/InputHandler.js';
import { WordComponent, RenderComponent, PositionComponent } from '../components.js';
import { soundManager } from '../../core/SoundManager.js';
import { ParticleSystem } from '../../fx/ParticleSystem.js';

export class TyperSystem {
    constructor(inputHandler) {
        this.inputHandler = inputHandler;
        this.buffer = "";
        // Lazy load ParticleSystem to ensure DOM is ready? 
        // No, if main.js runs after DOM content loaded, it's fine.
        // But to be safe, we can init it on first use or use a getter.
        // However, standard constructor should work if script is deferred.
        this.particles = new ParticleSystem();
    }

    update(entityManager, playingState) {
        // AUTO-PILOT FOR DEMO
        if (true) { // Always on for this demo
            this.handleAutoPilot(entityManager, playingState);
        }

        const char = this.inputHandler.getChar();
        if (!char) return;

        // ... (rest of input handling) ...
    }

    handleAutoPilot(entityManager, playingState) {
        // Simple timer to simulate typing speed
        if (!this.autoTimer) this.autoTimer = 0;
        this.autoTimer++;
        if (this.autoTimer < 5) return; // Speed control
        this.autoTimer = 0;

        // Find a target
        const entities = entityManager.getEntitiesWith(WordComponent);
        let target = null;

        // 1. Continue current buffer
        if (this.buffer.length > 0) {
            target = entities.find(e => e.getComponent(WordComponent).word.toUpperCase().startsWith(this.buffer));
        }

        // 2. Or pick nearest/lowest
        if (!target) {
            target = entities.sort((a, b) => b.getComponent(PositionComponent).y - a.getComponent(PositionComponent).y)[0];
        }

        if (target) {
            const word = target.getComponent(WordComponent).word;
            const nextChar = word[this.buffer.length];
            if (nextChar) {
                // Mock Input
                // We bypass InputHandler and directly mutate buffer? 
                // Better to reuse logic. But update() expects InputHandler.getChar()
                // Let's just simulate the logic directly here.
                this.buffer += nextChar.toUpperCase();
                this.updateHighlights(entityManager);

                if (this.buffer.length === word.length) {
                    // Trigger destroy
                    if (target.type === 'POWERUP_EMP') this.triggerEMP(entityManager);
                    else this.destroyWord(target, playingState);
                    this.buffer = "";
                    this.resetAllHighlights(entityManager);
                }
            }
        }
    }

    updateHighlights(entityManager) {
        const entities = entityManager.getEntitiesWith(WordComponent);
        for (const entity of entities) {
            const wordComp = entity.getComponent(WordComponent);
            const render = entity.getComponent(RenderComponent);

            if (render && render.el) {
                if (wordComp.word.toUpperCase().startsWith(this.buffer)) {
                    this.highlightWord(render.el, this.buffer.length);
                } else {
                    this.resetHighlight(render.el);
                }
            }
        }
    }

    resetAllHighlights(entityManager) {
        const entities = entityManager.getEntitiesWith(WordComponent);
        entities.forEach(e => {
            const r = e.getComponent(RenderComponent);
            if (r && r.el) this.resetHighlight(r.el);
        });
    }

    highlightWord(el, count) {
        const letters = el.querySelectorAll('.letter');
        letters.forEach((l, i) => {
            if (i < count) l.classList.add('highlight');
            else l.classList.remove('highlight');
        });
    }

    resetHighlight(el) {
        el.querySelectorAll('.letter').forEach(l => l.classList.remove('highlight'));
    }

    destroyWord(entity, playingState) {
        entity.isActive = false;

        // VISUAL EXPLOSION (Particle System)
        const pos = entity.getComponent(PositionComponent);
        if (pos) {
            // Center approx
            const cx = pos.x + 30;
            const cy = pos.y + 30;
            if (this.particles) this.particles.emit(cx, cy, '#00f3ff');
        }

        // Scoring
        const wordComp = entity.getComponent(WordComponent);
        playingState.score += (wordComp.word.length * 10);

        // Level Up Logic
        if (playingState.score > playingState.level * 1000) {
            playingState.level++;
        }
    }
}
